
"use client"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useState, useEffect } from "react";
import { getKehadiranTrenBulanan } from "@/lib/data";

const chartConfig = {
  Hadir: {
    label: "Hadir",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface KehadiranLineChartProps {
    filterKelas?: string[];
}

export default function KehadiranLineChart({ filterKelas }: KehadiranLineChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadChartData = () => {
        setChartData(getKehadiranTrenBulanan(filterKelas));
    };

    loadChartData();
    window.addEventListener('dataUpdated', loadChartData);
    return () => window.removeEventListener('dataUpdated', loadChartData);
  }, [filterKelas]);

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-[200px] w-full text-muted-foreground">
            <p>Belum ada data absensi yang cukup untuk menampilkan grafik tren.</p>
        </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: -20,
          right: 20
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value, index) => {
            if (chartData.length > 14 && index % 2 !== 0) return '';
            return value;
          }}
        />
         <YAxis 
            domain={[0, 100]} 
            tickFormatter={(value) => `${value}%`}
            width={30}
            tickLine={false}
            axisLine={false}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
        <Line
          dataKey="Hadir"
          type="monotone"
          stroke="var(--color-Hadir)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
