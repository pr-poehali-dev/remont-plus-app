export const API_BASE = "https://functions.poehali.dev/f301a75f-bbd1-4c9d-91ee-b7346d13d460";

export const RBC_CATEGORIES = [
  { label: "Строительство и отделка", slug: "924-stroitelnye_otdelochnye_raboty" },
  { label: "Электромонтаж", slug: "857-elektromontazhnye_raboty" },
  { label: "Сантехника", slug: "858-santekhnicheskie_raboty" },
  { label: "Дизайн интерьера", slug: "884-dizayn_interera" },
];

export interface EgrulData {
  full_name?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  status?: string;
  type?: string;
  reg_date?: string;
  address_full?: string;
  manager_name?: string;
  manager_post?: string;
  okved?: string;
  okved_name?: string;
  error?: string;
}

export interface Company {
  url: string;
  name: string;
  inn?: string;
  phone?: string;
  email?: string;
  site?: string;
  address?: string;
  source?: string;
  status?: "pending" | "loading" | "done" | "error";
  error?: string;
  egrul?: EgrulData;
  egrul_status?: "idle" | "loading" | "done" | "error";
}

export function downloadCsv(companies: Company[]) {
  const bom = "\uFEFF";
  const header = [
    "Название", "ИНН", "КПП", "ОГРН", "Статус ЕГРЮЛ", "Тип", "Дата регистрации",
    "Руководитель", "Должность", "ОКВЭД",
    "Телефон", "Email", "Сайт",
    "Адрес (РБК)", "Адрес (ЕГРЮЛ)", "Ссылка РБК",
  ];
  const rows = companies
    .filter(c => c.status === "done")
    .map(c => [
      c.egrul?.full_name || c.name,
      c.inn || "",
      c.egrul?.kpp || "",
      c.egrul?.ogrn || "",
      c.egrul?.status || "",
      c.egrul?.type || "",
      c.egrul?.reg_date || "",
      c.egrul?.manager_name || "",
      c.egrul?.manager_post || "",
      c.egrul?.okved || "",
      c.phone || "",
      c.email || "",
      c.site || "",
      c.address || "",
      c.egrul?.address_full || "",
      c.url,
    ]);

  const csv =
    bom +
    [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `companies-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}
