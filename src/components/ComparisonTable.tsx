import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type CalcResult } from "@/lib/calc"
import { formatTenge } from "@/lib/format"

function Row({
  label,
  value,
  highlight = false,
  muted = false,
}: {
  label: string
  value: string
  highlight?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className={muted ? "text-muted-foreground text-sm" : "text-sm"}>{label}</span>
      <span
        className={
          highlight
            ? "text-primary text-lg font-semibold tabular-nums"
            : "font-medium tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  )
}

export function ComparisonTable({ result }: { result: CalcResult }) {
  const { totalInterestGross, tax, netDepositIncome, bonus } = result

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сравнение</CardTitle>
        <CardDescription>Чистый доход депозита против разового бонуса</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-border divide-y">
          <Row label="Доход депозита до налога" value={formatTenge(totalInterestGross)} muted />
          <Row label="Налог" value={`− ${formatTenge(tax)}`} muted />
          <Row label="Чистый доход депозита" value={formatTenge(netDepositIncome)} highlight />
          <Row label="Бонус за оплату сразу" value={formatTenge(bonus)} />
        </div>
      </CardContent>
    </Card>
  )
}
