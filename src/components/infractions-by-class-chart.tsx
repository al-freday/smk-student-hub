
"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useState, useEffect } from "react";

interface CatatanSiswa {
  kelas: string;
  tipe: 'pelanggaran' | 'prestasi';
}

const chartConfig = {
  pelanggaran: {
    label: "Pelanggaran",
    color: "hsl(var(--destructive))",
  },
  prestasi: {
    label: "Prestasi",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function InfractionsByClassChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartKey, setChartKey] = useState(0); // Key to force re-render

  const processChartData = () => {
    const rawData = localStorage.getItem("riwayatCatatan");
    if (rawData) {
      const riwayat: CatatanSiswa[] = JSON.parse(rawData);
      
      const statsByClass: { [key: string]: { pelanggaran: number; prestasi: number } } = {};

      riwayat.forEach(item => {
        if (!statsByClass[item.kelas]) {
          statsByClass[item.kelas] = { pelanggaran: 0, prestasi: 0 };
        }
        if (item.tipe === 'pelanggaran') {
          statsByClass[item.kelas].pelanggaran++;
        } else if (item.tipe === 'prestasi') {
          statsByClass[item.kelas].prestasi++;
        }
      });

      const formattedData = Object.keys(statsByClass).map(kelas => ({
        kelas,
        ...statsByClass[kelas]
      }));

      setChartData(formattedData);
      setChartKey(prevKey => prevKey + 1); // Update key to force chart re-render
    }
  };

  useEffect(() => {
    processChartData();

    // Listen for storage changes to update the chart in real-time
    window.addEventListener('storage', processChartData);
    
    return () => {
      window.removeEventListener('storage', processChartData);
    };
  }, []);

  if (chartData.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-10">Belum ada data untuk ditampilkan.</div>
  }

  return (
    <ChartContainer key={chartKey} config={chartConfig} className="min-h-[200px] w-full h-80">
      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="kelas"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          className="text-xs"
          interval={0}
        />
        <XAxis dataKey="pelanggaran" type="number" hide />
        <ChartTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="pelanggaran" fill="var(--color-pelanggaran)" radius={4} />
        <Bar dataKey="prestasi" fill="var(--color-prestasi)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
