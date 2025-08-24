
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
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";

interface Kehadiran {
  tanggal: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
}

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
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const rawData = localStorage.getItem("kehadiranSiswa");
    if (rawData) {
      const kehadiranSiswa: Kehadiran[] = JSON.parse(rawData);
      
      const attendanceByDay: { [key: string]: { hadir: number; alpa: number; izin: number } } = {};

      kehadiranSiswa.forEach(item => {
        if (!attendanceByDay[item.tanggal]) {
          attendanceByDay[item.tanggal] = { hadir: 0, alpa: 0, izin: 0 };
        }
        if (item.status === 'Hadir') attendanceByDay[item.tanggal].hadir++;
        else if (item.status === 'Alpa') attendanceByDay[item.tanggal].alpa++;
        else if (item.status === 'Izin' || item.status === 'Sakit') attendanceByDay[item.tanggal].izin++;
      });

      const sortedDays = Object.keys(attendanceByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      const lastFiveDaysWithData = sortedDays.slice(0, 5);

      const formattedData = lastFiveDaysWithData.map(day => ({
        day: format(new Date(day), "EEEE", { locale: id }),
        ...attendanceByDay[day]
      })).reverse(); // Reverse to show chronologically

      setChartData(formattedData);
    }
  }, []);


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
