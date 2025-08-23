"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { day: "Senin", hadir: 92, alpa: 3, izin: 5 },
  { day: "Selasa", hadir: 95, alpa: 1, izin: 4 },
  { day: "Rabu", hadir: 94, alpa: 2, izin: 4 },
  { day: "Kamis", hadir: 96, alpa: 1, izin: 3 },
  { day: "Jumat", hadir: 91, alpa: 4, izin: 5 },
];

const chartConfig = {
  hadir: {
    label: "Hadir",
    color: "hsl(var(--chart-1))",
  },
  alpa: {
    label: "Alpa",
    color: "hsl(var(--destructive))",
  },
  izin: {
    label: "Izin/Sakit",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig

export default function AttendanceChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="hadir" fill="var(--color-hadir)" radius={4} />
        <Bar dataKey="alpa" fill="var(--color-alpa)" radius={4} />
        <Bar dataKey="izin" fill="var(--color-izin)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
