// Извлечение текста из PDF/Excel и подготовка изображений (сканы/фото) для OCR.
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import * as XLSX from "xlsx";

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

/** Текст из Excel-сметы (.xlsx/.xls) — все листы в виде читаемых таблиц. */
export async function extractExcelText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  let out = "";
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, blankrows: false, defval: "" });
    if (rows.length === 0) continue;
    if (wb.SheetNames.length > 1) out += `# Лист: ${sheetName}\n`;
    for (const row of rows) {
      const cells = (row as (string | number)[]).map((c) => String(c ?? "").trim());
      if (cells.every((c) => c === "")) continue;
      out += cells.join(" | ") + "\n";
    }
    out += "\n";
  }
  return out.trim();
}

export interface ExtractResult {
  text: string;
  images: string[]; // data-url base64 для страниц-сканов/фото
}

const MAX_IMAGES = 8;

/** Текст из текстового PDF. Возвращает "" если PDF без текстового слоя (скан). */
export async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? (it as { str: string }).str : ""))
      .join(" ");
    text += pageText + "\n";
  }
  return text.trim();
}

/** Рендерит страницы PDF в PNG data-url (для сканов без текстового слоя). */
export async function renderPdfToImages(file: File, maxPages = MAX_IMAGES): Promise<string[]> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const images: string[] = [];
  const pages = Math.min(pdf.numPages, maxPages);
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.8));
  }
  return images;
}

/** Изображение (фото/скан) → data-url, при необходимости ужимаем по ширине. */
export function imageFileToDataUrl(file: File, maxWidth = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Разбирает набор файлов: PDF (текст или скан) + изображения. */
export async function extractFromFiles(files: File[]): Promise<ExtractResult> {
  let text = "";
  const images: string[] = [];

  for (const file of files) {
    const lower = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
    const isImage = file.type.startsWith("image/");
    const isExcel = lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")
      || file.type.includes("spreadsheet") || file.type.includes("excel");

    if (isExcel) {
      try {
        const xls = await extractExcelText(file);
        if (xls) text += xls + "\n\n";
      } catch {
        // повреждённый или нечитаемый Excel — пропускаем
      }
    } else if (isPdf) {
      const pdfText = await extractPdfText(file);
      if (pdfText && pdfText.replace(/\s/g, "").length > 40) {
        text += pdfText + "\n\n";
      } else {
        // PDF-скан без текстового слоя → рендерим страницы для OCR
        const rendered = await renderPdfToImages(file, MAX_IMAGES - images.length);
        images.push(...rendered);
      }
    } else if (isImage) {
      if (images.length < MAX_IMAGES) {
        images.push(await imageFileToDataUrl(file));
      }
    }
  }

  return { text: text.trim(), images: images.slice(0, MAX_IMAGES) };
}