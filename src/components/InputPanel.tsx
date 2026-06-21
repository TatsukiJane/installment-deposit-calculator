import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { type ValidationErrors } from "@/lib/calc"
import { type FormState, TERM_PRESETS } from "@/lib/form"

interface InputPanelProps {
  form: FormState
  errors: ValidationErrors
  onChange: (patch: Partial<FormState>) => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive text-xs">{message}</p>
}

export function InputPanel({ form, errors, onChange }: InputPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Параметры</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Сумма покупки, тг</Label>
          <Input
            id="price"
            inputMode="decimal"
            placeholder="например, 1 200 000"
            value={form.purchasePrice}
            aria-invalid={Boolean(errors.purchasePrice)}
            onChange={(e) => onChange({ purchasePrice: e.target.value })}
          />
          <FieldError message={errors.purchasePrice} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bonus">Бонус за оплату сразу, тг</Label>
          <Input
            id="bonus"
            inputMode="decimal"
            placeholder="0"
            value={form.bonus}
            onChange={(e) => onChange({ bonus: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Срок рассрочки</Label>
          <div className="flex flex-wrap gap-2">
            {TERM_PRESETS.map((preset) => {
              const active = !form.isCustomTerm && form.term === String(preset)
              return (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => onChange({ term: String(preset), isCustomTerm: false })}
                >
                  {preset} мес
                </Button>
              )
            })}
            <Button
              type="button"
              size="sm"
              variant={form.isCustomTerm ? "default" : "outline"}
              onClick={() => onChange({ isCustomTerm: true })}
            >
              Другое
            </Button>
          </div>
          {form.isCustomTerm && (
            <Input
              className="mt-1"
              inputMode="numeric"
              placeholder="срок в месяцах"
              value={form.term}
              aria-invalid={Boolean(errors.termMonths)}
              onChange={(e) => onChange({ term: e.target.value })}
            />
          )}
          <FieldError message={errors.termMonths} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rate">Ставка депозита, % годовых</Label>
          <Input
            id="rate"
            inputMode="decimal"
            placeholder="16"
            value={form.annualRatePct}
            aria-invalid={Boolean(errors.annualRatePct)}
            onChange={(e) => onChange({ annualRatePct: e.target.value })}
          />
          <FieldError message={errors.annualRatePct} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <Label htmlFor="capitalization">Капитализация</Label>
            <span className="text-muted-foreground text-xs">
              Проценты прибавляются к остатку
            </span>
          </div>
          <Switch
            id="capitalization"
            checked={form.capitalization}
            onCheckedChange={(checked) => onChange({ capitalization: checked })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="tax">Налог на доход, %</Label>
          <Input
            id="tax"
            inputMode="decimal"
            placeholder="10"
            value={form.taxPct}
            aria-invalid={Boolean(errors.taxPct)}
            onChange={(e) => onChange({ taxPct: e.target.value })}
          />
          <FieldError message={errors.taxPct} />
        </div>
      </CardContent>
    </Card>
  )
}
