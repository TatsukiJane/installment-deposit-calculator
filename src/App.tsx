import { useMemo, useReducer } from "react"
import { InputPanel } from "@/components/InputPanel"
import { VerdictCard } from "@/components/VerdictCard"
import { ComparisonTable } from "@/components/ComparisonTable"
import { BalanceChart } from "@/components/BalanceChart"
import { MonthlyTable } from "@/components/MonthlyTable"
import { Card, CardContent } from "@/components/ui/card"
import { simulate, validate, isValid } from "@/lib/calc"
import { defaultForm, toCalcInput, type FormState } from "@/lib/form"

type Action = { type: "patch"; patch: Partial<FormState> }

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch }
    default:
      return state
  }
}

export function App() {
  const [form, dispatch] = useReducer(reducer, defaultForm)
  const onChange = (patch: Partial<FormState>) => dispatch({ type: "patch", patch })

  const input = useMemo(() => toCalcInput(form), [form])
  const errors = useMemo(() => validate(input), [input])
  const valid = isValid(errors)
  const result = useMemo(() => (valid ? simulate(input) : null), [valid, input])

  return (
    <div className="bg-background text-foreground min-h-svh">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Купить сразу или оформить рассрочку и получать проценты с депозита?
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Считает доход с депозита, если не платить за покупку сразу, а положить сумму на
            депозит и гасить беспроцентную рассрочку из него. Сравнивает с разовым бонусом за
            оплату сразу
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
          <InputPanel form={form} errors={errors} onChange={onChange} />

          <div className="flex flex-col gap-6 min-w-0">
            {result ? (
              <>
                <VerdictCard result={result} />
                <ComparisonTable result={result} taxEnabled={form.taxEnabled} />
                <BalanceChart result={result} />
                <MonthlyTable result={result} />
              </>
            ) : (
              <Card>
                <CardContent className="text-muted-foreground py-16 text-center">
                  Введите сумму покупки и параметры — расчёт появится здесь автоматически.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
