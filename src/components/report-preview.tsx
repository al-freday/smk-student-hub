
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, CheckCircle } from "lucide-react";

interface ReportPreviewProps {
  role: string;
}

const getReportTitle = (role: string) => {
    switch (role) {
        case 'wali_kelas': return "Pratinjau Laporan Wali Kelas";
        case 'guru_bk': return "Pratinjau Laporan Guru BK";
        case 'guru_mapel': return "Pratinjau Laporan Guru Mapel";
        case 'guru_piket': return "Pratinjau Laporan Guru Piket";
        case 'guru_pendamping': return "Pratinjau Laporan Guru Pendamping";
        default: return "Pratinjau Laporan";
    }
};

const getReportDescription = (role: string) => {
     switch (role) {
        case 'wali_kelas': return "Laporan ini mencakup rekapitulasi data dari halaman Administrasi Kelas.";
        case 'guru_bk': return "Laporan ini mencakup rekapitulasi data dari halaman Administrasi BK.";
        case 'guru_mapel': return "Laporan ini mencakup rekapitulasi data dari halaman Administrasi Mapel.";
        case 'guru_piket': return "Laporan ini mencakup rekapitulasi data kehadiran guru dan catatan kejadian harian.";
        case 'guru_pendamping': return "Laporan ini mencakup rekapitulasi log bimbingan siswa binaan.";
        default: return "Laporan ini akan dibuat berdasarkan data administrasi Anda.";
    }
}


export default function ReportPreview({ role }: ReportPreviewProps) {
  
  if (!role) {
      return (
          <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/50">
            <FileWarning className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">Peran Pengguna Tidak Ditemukan</p>
            <p className="text-sm text-muted-foreground">Tidak dapat menampilkan pratinjau laporan.</p>
          </div>
      )
  }

  return (
    <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/50">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-semibold">{getReportTitle(role)}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
            {getReportDescription(role)}
        </p>
        <p className="mt-4 text-xs text-muted-foreground italic">
            Fitur pratinjau detail sedang dalam pengembangan. Saat ini, menekan tombol "Kirim Laporan" akan memberitahu Wakasek Kesiswaan bahwa Anda telah menyelesaikan tugas administrasi Anda.
        </p>
    </div>
  );
}
