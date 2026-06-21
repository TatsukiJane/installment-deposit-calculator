// Ядро расчёта калькулятора «Рассрочка + депозит».
// Чистые функции без зависимостей от React — главный риск проекта, покрыт тестами в calc.test.ts.

export interface CalcInput {
  /** Сумма покупки, тг. Должна быть > 0. */
  purchasePrice: number
  /** Разовый бонус за оплату сразу, тг. По умолчанию 0. */
  bonus: number
  /** Срок рассрочки в месяцах. Должен быть >= 1. */
  termMonths: number
  /** Ставка депозита, % годовых. Должна быть >= 0. По умолчанию 16. */
  annualRatePct: number
  /** Капитализация процентов. По умолчанию true. */
  capitalization: boolean
  /** Налог на доход, %. По умолчанию 10 (РК). */
  taxPct: number
}

export interface MonthRow {
  /** Номер месяца, начиная с 1. */
  month: number
  /** Остаток депозита на начало месяца. */
  startBalance: number
  /** Начислено процентов за месяц. */
  interest: number
  /** Платёж по рассрочке за месяц. */
  payment: number
  /** Остаток депозита на конец месяца. */
  endBalance: number
}

export type Winner = "deposit" | "upfront" | "tie"

export interface CalcResult {
  /** Помесячная развёртка симуляции. */
  rows: MonthRow[]
  /** Ежемесячный платёж по рассрочке = сумма покупки / срок. */
  payment: number
  /** Суммарный доход депозита до налога. */
  totalInterestGross: number
  /** Удержанный налог. */
  tax: number
  /** Чистый доход депозита после налога. */
  netDepositIncome: number
  /** Бонус за оплату сразу (для удобства сравнения). */
  bonus: number
  /** Кто выгоднее: депозит, оплата сразу или ничья. */
  winner: Winner
  /** Абсолютная разница между чистым доходом депозита и бонусом, тг. */
  difference: number
}

/**
 * Помесячная симуляция: всю сумму покупки кладём на депозит и каждый месяц
 * гасим из него платёж по беспроцентной рассрочке. Возвращает развёртку и итоги.
 *
 * Порядок операций внутри месяца (как в ТЗ): начислить проценты → капитализировать
 * (или копить отдельно) → списать платёж.
 */
export function simulate(input: CalcInput): CalcResult {
  const { purchasePrice, bonus, termMonths, annualRatePct, capitalization, taxPct } = input

  const monthlyRate = annualRatePct / 100 / 12
  const payment = purchasePrice / termMonths

  let balance = purchasePrice
  let accruedSeparate = 0
  const rows: MonthRow[] = []

  for (let month = 1; month <= termMonths; month++) {
    const startBalance = balance

    // Проценты начисляются только на положительный остаток.
    const interest = Math.max(balance, 0) * monthlyRate

    if (capitalization) {
      balance += interest
    } else {
      accruedSeparate += interest
    }

    // Списываем платёж. Граница: остаток не уходит в минус.
    balance -= payment
    if (balance < 0) balance = 0

    rows.push({ month, startBalance, interest, payment, endBalance: balance })
  }

  const totalInterestGross = capitalization
    ? rows.reduce((sum, row) => sum + row.interest, 0)
    : accruedSeparate

  const tax = totalInterestGross * (taxPct / 100)
  const netDepositIncome = totalInterestGross - tax

  const difference = Math.abs(netDepositIncome - bonus)
  let winner: Winner = "tie"
  if (netDepositIncome > bonus) winner = "deposit"
  else if (netDepositIncome < bonus) winner = "upfront"

  return {
    rows,
    payment,
    totalInterestGross,
    tax,
    netDepositIncome,
    bonus,
    winner,
    difference,
  }
}

export interface ValidationErrors {
  purchasePrice?: string
  annualRatePct?: string
  termMonths?: string
  taxPct?: string
}

/** Проверка входных данных. Пустой объект означает, что ввод корректен. */
export function validate(input: CalcInput): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!Number.isFinite(input.purchasePrice) || input.purchasePrice <= 0) {
    errors.purchasePrice = "Сумма должна быть больше 0"
  }
  if (!Number.isFinite(input.annualRatePct) || input.annualRatePct < 0) {
    errors.annualRatePct = "Ставка не может быть отрицательной"
  }
  if (!Number.isInteger(input.termMonths) || input.termMonths < 1) {
    errors.termMonths = "Срок должен быть не меньше 1 месяца"
  }
  if (!Number.isFinite(input.taxPct) || input.taxPct < 0 || input.taxPct > 100) {
    errors.taxPct = "Налог должен быть от 0 до 100%"
  }

  return errors
}

/** true, если ввод корректен и можно считать. */
export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0
}
