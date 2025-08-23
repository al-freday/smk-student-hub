
"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { category: "Ringan", count: 45, fill: "var(--color-ringan)" },
  { category: "Sedang", count: 22, fill: "var(--color-sedang)" },
  { category: "Berat", count: 8, fill: "var(--color-berat)" },
  { category: "Sangat Berat", count: 3, fill: "var(--color-sangat-berat)" },
]

const chartConfig = {
  count: {
    label: "Jumlah",
  },
  ringan: {
    label: "Ringan",
    color: "hsl(var(--chart-2))",
  },
  sedang: {
    label: "Sedang",
    color: "hsl(var(--chart-4))",
  },
  berat: {
    label: "Berat",
    color: "hsl(var(--chart-5))",
  },
  "sangat-berat": {
    label: "Sangat Berat",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export default function InfractionsByCategoryChart() {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
            content={<ChartLegendContent nameKey="category" />}
            className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  )
}
