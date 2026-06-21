// Состояние формы ввода и его преобразование в CalcInput.
import { type CalcInput } from "./calc"
import { parseDecimal } from "./format"

export type TermPreset = 3 | 6 | 12 | 24

export interface FormState {
  purchasePrice: string
  bonus: string
  /** Срок в месяцах как строка (общее поле для пресетов и «другого»). */
  term: string
  /** Включён ли режим ввода произвольного срока. */
  isCustomTerm: boolean
  annualRatePct: string
  capitalization: boolean
  /** Применять ли налог на доход (необязательно, для РК физлиц не обязателен). */
  taxEnabled: boolean
  taxPct: string
}

export const TERM_PRESETS: TermPreset[] = [3, 6, 12, 24]

export const defaultForm: FormState = {
  purchasePrice: "",
  bonus: "0",
  term: "12",
  isCustomTerm: false,
  annualRatePct: "16",
  capitalization: true,
  taxEnabled: false,
  taxPct: "10",
}

/** Преобразует строковое состояние формы в числовой вход для расчёта. */
export function toCalcInput(form: FormState): CalcInput {
  return {
    purchasePrice: parseDecimal(form.purchasePrice),
    bonus: form.bonus.trim() === "" ? 0 : parseDecimal(form.bonus),
    termMonths: Math.trunc(parseDecimal(form.term)),
    annualRatePct: parseDecimal(form.annualRatePct),
    capitalization: form.capitalization,
    taxPct: form.taxEnabled ? (form.taxPct.trim() === "" ? 0 : parseDecimal(form.taxPct)) : 0,
  }
}
