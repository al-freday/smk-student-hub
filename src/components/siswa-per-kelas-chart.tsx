
"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useState, useEffect } from "react";
import { getSiswaPerKelasData } from "@/lib/data";

const chartConfig = {
  total: {
    label: "Jumlah Siswa",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function SiswaPerKelasChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadChartData = () => {
        setChartData(getSiswaPerKelasData());
    };

    loadChartData();
    window.addEventListener('dataUpdated', loadChartData);
    return () => window.removeEventListener('dataUpdated', loadChartData);
  }, []);

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-[250px] w-full text-muted-foreground">
            <p>Belum ada data siswa atau kelas yang terdaftar.</p>
        </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart 
        accessibilityLayer 
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={80}
        />
        <XAxis 
            type="number"
            dataKey="total"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toString()}
        />
        <ChartTooltip 
            cursor={false}
            content={<ChartTooltipContent 
                indicator="dot"
            />} 
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} layout="vertical">
             <LabelList
                dataKey="total"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
            />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
