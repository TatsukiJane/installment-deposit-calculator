// Форматирование чисел и денежных сумм для UI (тенге, ru-RU).

const integerFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Сумма в тенге с разделителем разрядов, округлённая до целых: «1 200 000 тг». */
export function formatTenge(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return `${integerFormatter.format(Math.round(safe))} тг`
}

/** Сумма в тенге с двумя знаками после запятой: «1 234,56 тг». Для точных значений дохода. */
export function formatTengePrecise(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return `${decimalFormatter.format(safe)} тг`
}

/** Число с разделителем разрядов без валюты. */
export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return integerFormatter.format(Math.round(safe))
}

/**
 * Парсит строку из текстового поля в число. Принимает и запятую, и точку как
 * десятичный разделитель, игнорирует пробелы-разделители разрядов. Пустая строка → NaN.
 */
export function parseDecimal(raw: string): number {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".")
  if (cleaned === "") return NaN
  return Number(cleaned)
}
