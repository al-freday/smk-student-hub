
"use client"
import { Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useState, useEffect } from "react";
import { getPelanggaranStats } from "@/lib/data";

const chartConfig = {
  value: {
    label: "Jumlah",
  },
  Ringan: {
    label: "Ringan",
    color: "hsl(var(--chart-2))",
  },
  Sedang: {
    label: "Sedang",
    color: "hsl(var(--chart-3))",
  },
  Berat: {
    label: "Berat",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function PelanggaranPieChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadChartData = () => {
        setChartData(getPelanggaranStats());
    };

    loadChartData();
    window.addEventListener('dataUpdated', loadChartData);
    return () => window.removeEventListener('dataUpdated', loadChartData);
  }, []);

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-full w-full text-muted-foreground">
            <p>Belum ada data pelanggaran untuk ditampilkan.</p>
        </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="-translate-y-[2px] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  )
}
