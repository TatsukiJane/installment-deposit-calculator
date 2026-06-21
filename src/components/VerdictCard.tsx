import { RiArrowUpLine, RiWalletLine, RiScales3Line } from "@remixicon/react"
import { Card, CardContent } from "@/components/ui/card"
import { type CalcResult } from "@/lib/calc"
import { formatTenge } from "@/lib/format"

export function VerdictCard({ result }: { result: CalcResult }) {
  const { winner, difference } = result

  if (winner === "tie") {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 py-8">
          <RiScales3Line className="text-muted-foreground size-10 shrink-0" />
          <div>
            <p className="text-muted-foreground text-sm">Вердикт</p>
            <p className="font-heading text-2xl font-semibold">Варианты равноценны</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isDeposit = winner === "deposit"
  const title = isDeposit ? "Выгоднее депозит" : "Выгоднее оплатить сразу"
  const Icon = isDeposit ? RiWalletLine : RiArrowUpLine

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-8">
        <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full">
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">Вердикт</p>
          <p className="font-heading text-2xl font-semibold">{title}</p>
          <p className="text-primary text-lg font-medium">
            на +{formatTenge(difference)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
