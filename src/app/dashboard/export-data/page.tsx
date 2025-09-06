
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Database } from "lucide-react";
import { format } from "date-fns";

// Daftar semua kunci localStorage yang digunakan oleh aplikasi
const APP_DATA_KEYS = [
  'teachersData', 'siswaData', 'kelasData', 'riwayatPelanggaran', 
  'prestasiData', 'kehadiranSiswaPerSesi', 'teacherAttendanceData', 
  'logAkademikData', 'logKompetensiData', 'logBimbinganData', 
  'layananBimbinganData', 'rencanaIndividualData', 'assignmentLogData', 
  'waliKelasReportsStatus', 'pklData', 'pembayaranKomiteData', 
  'riwayatPembayaranKomite', 'arsipSuratData', 'tataTertibData', 
  'kurikulumData', 'themeSettings', 'currentUser', 
  'userRole', 'admin_logged_in'
  // Tambahkan kunci lain jika ada
];

export default function ExportDataPage() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = () => {
    setIsExporting(true);
    toast({
      title: "Mempersiapkan Data...",
      description: "Mengumpulkan semua data dari penyimpanan browser.",
    });

    try {
      const allData: { [key: string]: any } = {};
      let totalSize = 0;

      APP_DATA_KEYS.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            allData[key] = JSON.parse(data);
            totalSize += data.length;
          } catch (e) {
            allData[key] = data; // Simpan sebagai string jika bukan JSON valid
          }
        }
      });
      
      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
      link.download = `smk_student_hub_backup_${timestamp}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: "Ekspor Berhasil!",
        description: `Semua data aplikasi telah diunduh. Ukuran file: ${(totalSize / 1024).toFixed(2)} KB`,
      });

    } catch (error) {
      console.error("Gagal mengekspor data:", error);
      toast({
        title: "Ekspor Gagal",
        description: "Terjadi kesalahan saat mencoba mengunduh data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Export Semua Data Aplikasi</h2>
        <p className="text-muted-foreground">
          Unduh salinan lengkap dari semua data yang saat ini tersimpan di browser Anda.
        </p>
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Database className="h-8 w-8" />
            </div>
            <div>
              <CardTitle>Unduh Cadangan Data (Backup)</CardTitle>
              <CardDescription>
                Fitur ini akan mengumpulkan semua data aplikasi (siswa, guru, pelanggaran, dll.) dan menyimpannya sebagai satu file JSON di komputer Anda. File ini berguna sebagai cadangan atau untuk keperluan migrasi di masa depan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-secondary rounded-lg flex flex-col items-center text-center">
            <p className="text-muted-foreground mb-4">
              Klik tombol di bawah untuk memulai proses pengunduhan.
            </p>
            <Button onClick={handleExportData} disabled={isExporting} size="lg">
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Unduh Semua Data Aplikasi (.json)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
