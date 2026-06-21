import { useState } from "react"
import { RiArrowDownSLine } from "@remixicon/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Помесячная разбивка</CardTitle>
            <RiArrowDownSLine
              className={`text-muted-foreground size-5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="overflow-x-auto">
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
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
