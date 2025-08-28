
"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getAttendanceChartData } from "@/lib/data";

const chartConfig = {
  persentaseHadir: {
    label: "Hadir (%)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function AttendanceChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadChartData = () => {
        const data = getAttendanceChartData();
        const formattedData = data.map(item => ({
            ...item,
            hari: format(new Date(item.tanggal), "eee", { locale: id }), // Format to "Sen", "Sel", etc.
        }));
        setChartData(formattedData);
    };

    loadChartData();
    window.addEventListener('dataUpdated', loadChartData);
    return () => window.removeEventListener('dataUpdated', loadChartData);
  }, []);

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-[250px] w-full text-muted-foreground">
            <p>Belum ada data absensi yang cukup untuk menampilkan grafik.</p>
        </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart 
        accessibilityLayer 
        data={chartData}
        margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="hari"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis 
            domain={[0, 100]} 
            tickFormatter={(value) => `${value}%`}
            width={30}
            tickLine={false}
            axisLine={false}
        />
        <ChartTooltip 
            cursor={false}
            content={<ChartTooltipContent 
                formatter={(value) => `${value}%`}
                indicator="dot"
            />} 
        />
        <Bar dataKey="persentaseHadir" fill="var(--color-persentaseHadir)" radius={8}>
            <LabelList
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `${value}%`}
            />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
