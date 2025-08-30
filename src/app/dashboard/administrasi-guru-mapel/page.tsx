
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Book, Edit, Settings, CheckSquare, BarChart3, BookOpen } from "lucide-react";

export default function AdministrasiGuruMapelPage() {
  
  const renderPlaceholderCard = (title: string, description: string) => (
    <Card className="h-full">
        <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Administrasi Guru Mata Pelajaran</h2>
        <p className="text-muted-foreground">
          Kelola semua dokumen perencanaan, pelaksanaan, dan penilaian pembelajaran Anda.
        </p>
      </div>
      
      <Tabs defaultValue="perencanaan" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList>
            <TabsTrigger value="perencanaan"><Book className="mr-2 h-4 w-4"/>Perencanaan</TabsTrigger>
            <TabsTrigger value="pelaksanaan"><Edit className="mr-2 h-4 w-4"/>Pelaksanaan</TabsTrigger>
            <TabsTrigger value="penilaian"><CheckSquare className="mr-2 h-4 w-4"/>Penilaian</TabsTrigger>
            <TabsTrigger value="evaluasi"><BarChart3 className="mr-2 h-4 w-4"/>Evaluasi & Tindak Lanjut</TabsTrigger>
            <TabsTrigger value="penunjang"><Settings className="mr-2 h-4 w-4"/>Penunjang</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* A. Administrasi Perencanaan Pembelajaran */}
        <TabsContent value="perencanaan">
            <Card>
                <CardHeader><CardTitle>A. Administrasi Perencanaan Pembelajaran</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Program Tahunan (Prota)", "Gambaran target kompetensi setahun penuh.")}
                    {renderPlaceholderCard("Program Semester (Promes)", "Rincian pembelajaran per semester.")}
                    {renderPlaceholderCard("Alur Tujuan Pembelajaran (ATP) / Silabus", "Sesuai Kurikulum Merdeka atau K13.")}
                    {renderPlaceholderCard("RPP / Modul Ajar", "Tujuan, langkah kegiatan, dan asesmen.")}
                    {renderPlaceholderCard("Analisis KI/KD atau CP", "Pemetaan kompetensi dasar atau capaian pembelajaran.")}
                    {renderPlaceholderCard("Kisi-kisi Soal Penilaian", "Untuk PH, PTS, PAS.")}
                    {renderPlaceholderCard("Bahan Ajar dan Media Pembelajaran", "Slide, LKS, modul digital, dll.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* B. Administrasi Pelaksanaan Pembelajaran */}
        <TabsContent value="pelaksanaan">
            <Card>
                <CardHeader><CardTitle>B. Administrasi Pelaksanaan Pembelajaran</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Daftar Hadir Siswa", "Rekapitulasi kehadiran per pertemuan.")}
                    {renderPlaceholderCard("Jurnal Mengajar", "Materi yang diajarkan, capaian, dan hambatan.")}
                    {renderPlaceholderCard("Catatan Refleksi Pembelajaran", "Kendala yang dihadapi dan rencana tindak lanjut.")}
                    {renderPlaceholderCard("Dokumentasi Kegiatan", "Foto praktik, video pembelajaran, proyek siswa.")}
                    {renderPlaceholderCard("Instrumen Asesmen Formatif & Sumatif", "Soal, rubrik penilaian, lembar observasi.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* C. Administrasi Penilaian */}
        <TabsContent value="penilaian">
            <Card>
                <CardHeader><CardTitle>C. Administrasi Penilaian</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Daftar Nilai Lengkap", "Nilai harian, PTS, PAS, PAT per kompetensi.")}
                    {renderPlaceholderCard("Analisis Butir Soal & Penilaian", "Mengidentifikasi siswa yang belum tuntas.")}
                    {renderPlaceholderCard("Program Remedial dan Pengayaan", "Catatan siswa yang membutuhkan perbaikan nilai.")}
                    {renderPlaceholderCard("Rekapitulasi Nilai Akhir", "Akumulasi nilai sikap, pengetahuan, dan keterampilan.")}
                    {renderPlaceholderCard("Deskripsi Nilai Rapor", "Draf deskripsi capaian siswa untuk rapor.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* D. Administrasi Evaluasi dan Tindak Lanjut */}
        <TabsContent value="evaluasi">
            <Card>
                <CardHeader><CardTitle>D. Administrasi Evaluasi dan Tindak Lanjut</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Analisis Hasil Ulangan / Ujian", "Tingkat ketuntasan belajar dan soal sulit.")}
                    {renderPlaceholderCard("Catatan Kendala Belajar Siswa", "Daftar siswa dan solusi yang telah diberikan.")}
                    {renderPlaceholderCard("Program Tindak Lanjut", "Perbaikan metode atau media pembelajaran.")}
                    {renderPlaceholderCard("Evaluasi Diri Guru", "Refleksi pembelajaran setiap akhir semester/tahun.")}
                </CardContent>
            </Card>
        </TabsContent>
        
        {/* E. Administrasi Penunjang */}
        <TabsContent value="penunjang">
            <Card>
                <CardHeader><CardTitle>E. Administrasi Penunjang</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Agenda Mengajar Guru", "Rencana kegiatan harian atau mingguan.")}
                    {renderPlaceholderCard("Bank Soal dan Kunci Jawaban", "Kumpulan soal untuk memudahkan evaluasi.")}
                    {renderPlaceholderCard("Daftar Inventaris Alat & Bahan", "Khusus guru produktif/teknik/lab.")}
                    {renderPlaceholderCard("Laporan Tugas Tambahan", "Jadwal piket, pembina ekskul, dll.")}
                    {renderPlaceholderCard("Laporan Pelaksanaan Projek P5", "Jika terlibat sebagai fasilitator projek.")}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
