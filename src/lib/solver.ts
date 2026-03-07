export type SolveType = "equation" | "inequality";
export type InequalitySign = "<" | ">" | "<=" | ">=" | "=";

export interface SolveStep {
  description: string;
  expression: string;
}

export interface SolveResult {
  input: string;
  type: SolveType;
  steps: SolveStep[];
  answer: string;
  error?: string;
}

function safeEval(expr: string, x: number): number {
  // Порядок важен! Сначала многосимвольные замены, потом односимвольные
  let clean = expr
    // степень
    .replace(/\^/g, "**")
    // ln( → Math.log(
    .replace(/\bln\(/g, "Math.log(")
    // функции → Math.функция
    .replace(/\b(sin|cos|tan|sqrt|abs|log|exp)\b/g, "Math.$1")
    // π → Math.PI
    .replace(/π/g, "Math.PI")
    // неявное умножение: цифра перед x → цифра*x
    .replace(/(\d)x/g, "$1*x")
    // неявное умножение: ) перед x или цифрой → )*
    .replace(/\)(x|\d)/g, ")*$1")
    // x перед ( → x*(
    .replace(/x\(/g, "x*(");

  // НЕ заменяем 'e' глобально — это сломает Math.exp, числа типа 1e5 и т.д.
  // Заменяем только одиночную 'e' как константу Эйлера (не внутри слова)
  // Осторожно: не трогаем 'e' внутри Math.exp, 1e5 и т.д.
  clean = clean.replace(/(?<![A-Za-z\d])e(?![A-Za-z\d+])/g, "Math.E");

  try {
    const fn = new Function("x", `"use strict"; return (${clean});`);
    const result = fn(x);
    return typeof result === "number" ? result : NaN;
  } catch {
    return NaN;
  }
}

function bisect(
  f: (x: number) => number,
  a: number,
  b: number,
  tol = 1e-10,
  maxIter = 200
): number | null {
  let fa = f(a);
  let fb = f(b);
  if (!isFinite(fa) || !isFinite(fb)) return null;
  if (fa * fb > 0) return null;
  for (let i = 0; i < maxIter; i++) {
    const mid = (a + b) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return mid;
    if (fa * fm <= 0) {
      b = mid;
      fb = fm;
    } else {
      a = mid;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

function findRoots(f: (x: number) => number, range = [-100, 100], n = 4000): number[] {
  const roots: number[] = [];
  const step = (range[1] - range[0]) / n;

  for (let i = 0; i < n; i++) {
    const a = range[0] + i * step;
    const b = a + step;
    const fa = f(a);
    const fb = f(b);

    if (!isFinite(fa) || !isFinite(fb)) continue;

    // Точное попадание в ноль
    if (Math.abs(fa) < 1e-10) {
      const rounded = roundRoot(a);
      if (!roots.some((r) => Math.abs(r - rounded) < 1e-6)) roots.push(rounded);
      continue;
    }

    // Смена знака → корень на отрезке
    if (fa * fb < 0) {
      const root = bisect(f, a, b);
      if (root !== null) {
        const rounded = roundRoot(root);
        if (!roots.some((r) => Math.abs(r - rounded) < 1e-6)) {
          roots.push(rounded);
        }
      }
    }
  }

  return roots.sort((a, b) => a - b);
}

function roundRoot(x: number): number {
  // Если близко к целому
  const rounded = Math.round(x);
  if (Math.abs(x - rounded) < 1e-7) return rounded;
  // Если близко к простой дроби
  for (let d = 2; d <= 100; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-8) return n / d;
  }
  return x;
}

function formatNumber(n: number): string {
  // Целое
  if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < 1e-9) {
    return String(Math.round(n));
  }
  // Простая дробь
  for (let d = 2; d <= 100; d++) {
    const num = Math.round(n * d);
    if (Math.abs(num / d - n) < 1e-9 && num !== 0) {
      return `${num}/${d}`;
    }
  }
  // Десятичное
  return parseFloat(n.toFixed(6)).toString();
}

function parseEquation(input: string): { left: string; right: string; sign: InequalitySign } {
  // Сначала двухсимвольные знаки, потом односимвольные
  const signs: InequalitySign[] = ["<=", ">=", "<", ">", "="];
  for (const s of signs) {
    const idx = input.indexOf(s);
    if (idx !== -1) {
      return {
        left: input.slice(0, idx).trim(),
        right: input.slice(idx + s.length).trim(),
        sign: s,
      };
    }
  }
  return { left: input.trim(), right: "0", sign: "=" };
}

function solveInequality(
  f: (x: number) => number,
  roots: number[],
  sign: InequalitySign
): { step: SolveStep; answer: string } {
  const boundaries = [-100, ...roots, 100];
  const intervals: string[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const mid = (boundaries[i] + boundaries[i + 1]) / 2;
    const val = f(mid);
    let ok = false;
    if (sign === "<") ok = val < 0;
    else if (sign === ">") ok = val > 0;
    else if (sign === "<=") ok = val <= 0;
    else if (sign === ">=") ok = val >= 0;

    if (ok) {
      const l = boundaries[i];
      const r = boundaries[i + 1];
      const lStr = l === -100 ? "-∞" : formatNumber(l);
      const rStr = r === 100 ? "+∞" : formatNumber(r);
      const lBr = l === -100 ? "(" : sign.includes("=") ? "[" : "(";
      const rBr = r === 100 ? ")" : sign.includes("=") ? "]" : ")";
      intervals.push(`${lBr}${lStr}; ${rStr}${rBr}`);
    }
  }

  const answer = intervals.length > 0 ? intervals.join(" ∪ ") : "Решений нет";

  return {
    step: {
      description: "Шаг 4: Определяем знак f(x) на каждом интервале между корнями",
      expression: `Знак функции на интервалах → ${answer}`,
    },
    answer,
  };
}

export function solve(input: string): SolveResult {
  const normalized = input.trim().toLowerCase();

  try {
    const { left, right, sign } = parseEquation(normalized);
    const isEquation = sign === "=";

    const f = (x: number) => {
      const lv = safeEval(left, x);
      const rv = safeEval(right, x);
      return lv - rv;
    };

    // Проверяем что выражение вообще парсится
    const testVal = f(0);
    if (isNaN(testVal) && !isFinite(testVal)) {
      throw new Error("parse error");
    }

    const roots = findRoots(f);

    const steps: SolveStep[] = [
      {
        description: "Шаг 1: Переносим всё в левую часть",
        expression: `f(x) = (${left}) − (${right}) = 0`,
      },
      {
        description: "Шаг 2: Анализируем функцию f(x) методом бисекции",
        expression: "Делим [-100; 100] на 4000 интервалов, ищем смену знака",
      },
      {
        description: roots.length > 0
          ? `Шаг 3: Найдено ${roots.length === 1 ? "1 корень" : `${roots.length} корня/корней`}`
          : "Шаг 3: Корни не найдены",
        expression: roots.length > 0
          ? roots.map((r) => `x = ${formatNumber(r)}`).join(",   ")
          : "Нули функции на [-100; 100] не обнаружены",
      },
    ];

    let answer: string;

    if (isEquation) {
      answer = roots.length === 0
        ? "Решений нет"
        : roots.map((r) => `x = ${formatNumber(r)}`).join(",   ");

      steps.push({
        description: "Шаг 4: Ответ",
        expression: answer,
      });
    } else {
      const { step, answer: ans } = solveInequality(f, roots, sign);
      steps.push(step);
      answer = ans;
    }

    return {
      input,
      type: isEquation ? "equation" : "inequality",
      steps,
      answer,
    };
  } catch (_e: unknown) {
    return {
      input,
      type: "equation",
      steps: [],
      answer: "",
      error: "Не удалось разобрать выражение. Проверьте синтаксис.",
    };
  }
}