
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Download } from "lucide-react";

export default function LaporanTugasPage() {
  
  // Fungsi ini akan digunakan di masa depan untuk mencetak laporan
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Laporan Tugas</h2>
        <p className="text-muted-foreground">
          Buat, kelola, dan arsipkan laporan penugasan Anda di sini.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText />
            Laporan Tugas Bulanan
          </CardTitle>
          <CardDescription>
            Fitur ini sedang dalam pengembangan. Nantinya, Anda akan dapat membuat dan mengunduh laporan bulanan Anda secara otomatis dari halaman ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              Fitur pembuatan laporan otomatis akan segera tersedia.
            </p>
            <div className="mt-6 flex justify-center gap-4">
                <Button disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Laporan (Segera)
                </Button>
                 <Button variant="outline" disabled>
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Laporan (Segera)
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
