
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy, Gem, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BimbinganSiswaPage() {
  
  const renderFeatureCard = (title: string, description: string) => (
    <Card className="h-full hover:bg-muted/50 transition-colors">
        <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Bimbingan Siswa</h2>
        <p className="text-muted-foreground">
          Kelola tugas pokok pendampingan Anda untuk setiap siswa binaan.
        </p>
      </div>

      <Tabs defaultValue="akademik" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="akademik"><BookCopy className="mr-2 h-4 w-4"/>Pendampingan Akademik</TabsTrigger>
            <TabsTrigger value="kompetensi"><Gem className="mr-2 h-4 w-4"/>Pengembangan Kompetensi</TabsTrigger>
            <TabsTrigger value="karakter"><ShieldCheck className="mr-2 h-4 w-4"/>Pembentukan Karakter</TabsTrigger>
        </TabsList>

        {/* Pendampingan Akademik */}
        <TabsContent value="akademik" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Tugas Pendampingan Akademik</CardTitle>
                    <CardDescription>Fokus pada pemantauan dan dukungan terhadap kemajuan belajar siswa.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderFeatureCard("Pantau Perkembangan Belajar", "Lihat rekap nilai, kehadiran, dan kemajuan siswa di setiap mata pelajaran.")}
                    {renderFeatureCard("Identifikasi Kesulitan Akademik", "Gunakan data untuk menemukan siswa yang memerlukan bantuan atau bimbingan tambahan.")}
                    {renderFeatureCard("Koordinasi dengan Guru Mapel", "Akses catatan dari guru mata pelajaran dan fasilitasi komunikasi untuk solusi bersama.")}
                    {renderFeatureCard("Rencana Pembelajaran Individual", "Buat dan kelola rencana bimbingan khusus untuk siswa dengan kebutuhan tertentu.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* Pengembangan Kompetensi & Keterampilan */}
        <TabsContent value="kompetensi" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Tugas Pengembangan Kompetensi & Keterampilan</CardTitle>
                    <CardDescription>Mendorong siswa untuk mencapai potensi maksimal baik di dalam maupun di luar kelas.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderFeatureCard("Dorong Prestasi Siswa", "Catat dan validasi prestasi akademik maupun non-akademik yang diraih siswa.")}
                    {renderFeatureCard("Bimbingan Karier & PKL", "Kelola kesiapan siswa untuk Praktik Kerja Lapangan (PKL) dan perencanaan karier.")}
                    {renderFeatureCard("Motivasi & Pengembangan Diri", "Berikan catatan motivasi dan rekomendasikan peluang pengembangan seperti lomba atau seminar.")}
                    {renderFeatureCard("Pemetaan Minat & Bakat", "Dokumentasikan minat dan bakat siswa sebagai dasar pengarahan kegiatan ekstrakurikuler.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* Pembentukan Karakter */}
        <TabsContent value="karakter" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Tugas Pembentukan Karakter</CardTitle>
                    <CardDescription>Menanamkan nilai-nilai positif dan membimbing perilaku siswa.</CardDescription>
                </CardHeader>
                 <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderFeatureCard("Tanamkan Disiplin & Tanggung Jawab", "Gunakan data kehadiran dan catatan perilaku sebagai media pembinaan kedisiplinan.")}
                    {renderFeatureCard("Bimbingan Perilaku Positif", "Catat sesi konseling atau bimbingan terkait etika, sopan santun, dan perilaku sosial.")}
                    {renderFeatureCard("Berikan Teladan (Role Model)", "Dokumentasikan kegiatan positif yang bisa menjadi contoh bagi siswa lain.")}
                    {renderFeatureCard("Kolaborasi dengan Orang Tua", "Akses rekapitulasi performa siswa sebagai bahan diskusi dengan orang tua/wali.")}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
