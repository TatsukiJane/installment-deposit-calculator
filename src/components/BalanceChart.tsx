import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type CalcResult } from "@/lib/calc"
import { formatNumber, formatTenge } from "@/lib/format"

export function BalanceChart({ result }: { result: CalcResult }) {
  // Точка «месяц 0» — стартовый остаток, чтобы линия начиналась с полной суммы.
  const data = [
    { month: 0, balance: result.rows[0]?.startBalance ?? 0 },
    ...result.rows.map((row) => ({ month: row.month, balance: row.endBalance })),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Остаток депозита по месяцам</CardTitle>
        <CardDescription>Как убывает баланс, пока гасится рассрочка</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(m: number) => `${m}`}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                width={64}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatNumber(v)}
              />
              <Tooltip
                formatter={(value) => [formatTenge(Number(value)), "Остаток"]}
                labelFormatter={(label) => `Месяц ${label}`}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
