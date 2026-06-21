import { describe, it, expect } from "vitest"
import { simulate, validate, isValid, type CalcInput } from "./calc"

const base: CalcInput = {
  purchasePrice: 1200,
  bonus: 0,
  termMonths: 12,
  annualRatePct: 12, // monthlyRate = 0.01
  capitalization: false,
  taxPct: 10,
}

describe("simulate — без капитализации", () => {
  it("считает проценты на убывающий остаток детерминированно", () => {
    // monthlyRate 0.01, остатки 1200,1100,...,100 → Σ = 7800 → проценты = 78
    const r = simulate(base)
    expect(r.payment).toBe(100)
    expect(r.rows).toHaveLength(12)
    expect(r.totalInterestGross).toBeCloseTo(78, 6)
    expect(r.tax).toBeCloseTo(7.8, 6)
    expect(r.netDepositIncome).toBeCloseTo(70.2, 6)
  })

  it("остаток к концу срока обнуляется и не уходит в минус", () => {
    const r = simulate(base)
    expect(r.rows[r.rows.length - 1].endBalance).toBeCloseTo(0, 6)
    for (const row of r.rows) {
      expect(row.endBalance).toBeGreaterThanOrEqual(0)
    }
  })
})

describe("simulate — с капитализацией", () => {
  it("итоговый остаток равен сумме начисленных процентов (доход остаётся на депозите)", () => {
    const r = simulate({ ...base, capitalization: true })
    const last = r.rows[r.rows.length - 1]
    expect(last.endBalance).toBeCloseTo(r.totalInterestGross, 6)
  })

  it("капитализация даёт больший доход, чем без неё", () => {
    const withCap = simulate({ ...base, capitalization: true })
    const without = simulate({ ...base, capitalization: false })
    expect(withCap.totalInterestGross).toBeGreaterThan(without.totalInterestGross)
  })
})

describe("simulate — вердикт", () => {
  it("депозит выгоднее, когда чистый доход больше бонуса", () => {
    const r = simulate({ ...base, bonus: 50 }) // net = 70.2
    expect(r.winner).toBe("deposit")
    expect(r.difference).toBeCloseTo(20.2, 6)
  })

  it("оплата сразу выгоднее, когда бонус больше чистого дохода", () => {
    const r = simulate({ ...base, bonus: 100 }) // net = 70.2
    expect(r.winner).toBe("upfront")
    expect(r.difference).toBeCloseTo(29.8, 6)
  })

  it("ничья при равенстве", () => {
    const r = simulate({ ...base, bonus: 70.2 })
    expect(r.winner).toBe("tie")
  })
})

describe("simulate — граничные случаи", () => {
  it("нулевая ставка даёт нулевой доход", () => {
    const r = simulate({ ...base, annualRatePct: 0 })
    expect(r.totalInterestGross).toBe(0)
    expect(r.netDepositIncome).toBe(0)
  })

  it("срок 1 месяц: один платёж гасит весь остаток", () => {
    const r = simulate({ ...base, termMonths: 1 })
    expect(r.rows).toHaveLength(1)
    expect(r.payment).toBe(1200)
    expect(r.rows[0].endBalance).toBeCloseTo(0, 6)
  })
})

describe("validate", () => {
  it("принимает корректный ввод", () => {
    expect(isValid(validate(base))).toBe(true)
  })

  it("отклоняет сумму <= 0, ставку < 0, срок < 1", () => {
    const errors = validate({
      ...base,
      purchasePrice: 0,
      annualRatePct: -5,
      termMonths: 0,
    })
    expect(errors.purchasePrice).toBeDefined()
    expect(errors.annualRatePct).toBeDefined()
    expect(errors.termMonths).toBeDefined()
    expect(isValid(errors)).toBe(false)
  })
})
