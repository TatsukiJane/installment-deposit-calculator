import { useState } from "react"
import { RiArrowDownSLine } from "@remixicon/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type CalcResult } from "@/lib/calc"
import { formatTenge } from "@/lib/format"

export function MonthlyTable({ result }: { result: CalcResult }) {
  const [open, setOpen] = useState(true)

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full cursor-pointer select-none items-center justify-between px-4 py-3">
          <CardTitle>Помесячная разбивка</CardTitle>
          <RiArrowDownSLine
            className={`text-muted-foreground size-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border" />
          <CardContent>
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Месяц</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Остаток на начало</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Начислено %</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Платёж</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Остаток на конец</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatTenge(row.startBalance)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatTenge(row.interest)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatTenge(row.payment)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatTenge(row.endBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
