
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileText, Users, Calendar, Folder, ShieldAlert, BarChart, Briefcase, Eye, PlusCircle, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getSourceData } from "@/lib/data-manager";

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

export default function AdministrasiBkPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [siswaBinaan, setSiswaBinaan] = useState<Siswa[]>([]);
  const [tingkatBinaan, setTingkatBinaan] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user || localStorage.getItem('userRole') !== 'guru_bk') {
        // This check can be made more robust, but for now it's a safeguard
        router.push('/dashboard');
        return;
      }
      const teachersData = getSourceData('teachersData', {});
      const guruBkData = teachersData.guru_bk?.find((gbk: any) => gbk.nama === user.nama);
      const binaan = guruBkData?.tugasKelas || null;
      setTingkatBinaan(binaan);

      if (binaan) {
        const allSiswa: Siswa[] = getSourceData('siswaData', []);
        const gradePrefix = binaan.split(' ')[1]; // "X", "XI", or "XII"
        const siswaDiTingkat = allSiswa.filter(s => s.kelas.startsWith(gradePrefix));
        setSiswaBinaan(siswaDiTingkat.sort((a,b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama)));
      }
    } catch (error) {
      console.error("Gagal memuat data administrasi BK:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

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
        <h2 className="text-3xl font-bold tracking-tight">Pusat Administrasi Bimbingan & Konseling</h2>
        <p className="text-muted-foreground">
          Kelola semua dokumen, program, dan catatan layanan BK Anda secara terstruktur.
        </p>
      </div>
      
      <Tabs defaultValue="data-dasar" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList>
            <TabsTrigger value="data-dasar"><Users className="mr-2 h-4 w-4"/>Data Dasar</TabsTrigger>
            <TabsTrigger value="perencanaan"><Calendar className="mr-2 h-4 w-4"/>Perencanaan Program</TabsTrigger>
            <TabsTrigger value="pelaksanaan"><Folder className="mr-2 h-4 w-4"/>Pelaksanaan Layanan</TabsTrigger>
            <TabsTrigger value="kasus-siswa"><ShieldAlert className="mr-2 h-4 w-4"/>Kasus Siswa</TabsTrigger>
            <TabsTrigger value="evaluasi"><BarChart className="mr-2 h-4 w-4"/>Penilaian & Evaluasi</TabsTrigger>
            <TabsTrigger value="pendukung"><FileText className="mr-2 h-4 w-4"/>Administrasi Pendukung</TabsTrigger>
            <TabsTrigger value="karier"><Briefcase className="mr-2 h-4 w-4"/>Karier & Dunia Kerja</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* A. Administrasi Data Dasar */}
        <TabsContent value="data-dasar">
            <Card>
                <CardHeader>
                    <CardTitle>A. Administrasi Data Dasar Siswa</CardTitle>
                    <CardDescription>Daftar seluruh siswa yang menjadi binaan Anda di {tingkatBinaan || "tingkat yang ditugaskan"}.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : tingkatBinaan ? (
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NIS</TableHead>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead>Kelas</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {siswaBinaan.length > 0 ? siswaBinaan.map(siswa => (
                                    <TableRow key={siswa.id}>
                                        <TableCell>{siswa.nis}</TableCell>
                                        <TableCell className="font-medium">{siswa.nama}</TableCell>
                                        <TableCell>{siswa.kelas}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>Profil</Button>
                                            <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Catatan</Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Tidak ada siswa yang terdaftar di tingkat binaan Anda.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    ) : (
                        <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>Penugasan tingkat kelas binaan untuk Anda belum diatur. Harap hubungi Wakasek Kesiswaan.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* B. Administrasi Perencanaan Program BK */}
        <TabsContent value="perencanaan">
            <Card>
                <CardHeader><CardTitle>B. Administrasi Perencanaan Program BK</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Program Tahunan BK", "Tujuan, sasaran, strategi, dan indikator keberhasilan.")}
                    {renderPlaceholderCard("Program Semester BK", "Materi bimbingan yang terjadwal per bulan/minggu.")}
                    {renderPlaceholderCard("Rencana Pelaksanaan Layanan (RPLBK)", "Jadwal bimbingan kelas, konseling, dll.")}
                    {renderPlaceholderCard("Kalender Layanan BK", "Rangkaian kegiatan selama 1 tahun ajaran.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* C. Administrasi Pelaksanaan Layanan */}
        <TabsContent value="pelaksanaan">
            <Card>
                <CardHeader><CardTitle>C. Administrasi Pelaksanaan Layanan</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Jurnal Layanan BK Harian", "Catatan kegiatan, materi, sasaran, dan waktu pelaksanaan.")}
                    {renderPlaceholderCard("Daftar Hadir Bimbingan", "Untuk bimbingan klasikal, kelompok, atau seminar.")}
                    {renderPlaceholderCard("Catatan Konseling Individual", "Topik bahasan dan rencana tindak lanjut (rahasia).")}
                    {renderPlaceholderCard("Catatan Konseling Kelompok", "Anggota, dinamika kelompok, dan hasil.")}
                    {renderPlaceholderCard("Dokumentasi Kegiatan BK", "Foto, daftar hadir, dan hasil dari setiap kegiatan.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* D. Administrasi Kasus Siswa */}
        <TabsContent value="kasus-siswa">
            <Card>
                <CardHeader><CardTitle>D. Administrasi Kasus Siswa</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Buku Kasus Siswa", "Jenis masalah, kronologi, dan catatan tindak lanjut.")}
                    {renderPlaceholderCard("Form Konseling Rahasia", "Catatan pribadi guru BK untuk setiap sesi konseling.")}
                    {renderPlaceholderCard("Surat Panggilan Orang Tua", "Arsip surat panggilan resmi yang telah dikirim.")}
                    {renderPlaceholderCard("Laporan Kunjungan Rumah (Home Visit)", "Catatan hasil dan observasi dari kunjungan rumah.")}
                    {renderPlaceholderCard("Dokumen Koordinasi Tindak Lanjut", "Dengan wali kelas, guru, atau pihak eksternal.")}
                </CardContent>
            </Card>
        </TabsContent>
        
        {/* E. Administrasi Penilaian dan Evaluasi */}
        <TabsContent value="evaluasi">
            <Card>
                <CardHeader><CardTitle>E. Administrasi Penilaian dan Evaluasi</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Instrumen Penilaian BK", "Angket, sosiometri, tes minat bakat, check list.")}
                    {renderPlaceholderCard("Rekap Hasil Asesmen Siswa", "Grafik perkembangan dan ringkasan hasil tes.")}
                    {renderPlaceholderCard("Evaluasi Program BK", "Analisis per semester dan per tahun (kekuatan, kendala).")}
                    {renderPlaceholderCard("Laporan Hasil Layanan BK", "Laporan rutin kepada kepala sekolah atau wakasek.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* F. Administrasi Pendukung */}
        <TabsContent value="pendukung">
            <Card>
                <CardHeader><CardTitle>F. Administrasi Pendukung</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Agenda Guru BK", "Jadwal harian, kegiatan, rapat, dan notulensi.")}
                    {renderPlaceholderCard("Daftar Inventaris Ruang BK", "Alat tes, buku panduan, media bimbingan.")}
                    {renderPlaceholderCard("Bank Materi BK", "Modul motivasi, anti-bullying, karier, dll.")}
                    {renderPlaceholderCard("Daftar Kontak Penting", "Kontak orang tua, psikolog, dan instansi terkait.")}
                </CardContent>
            </Card>
        </TabsContent>

        {/* G. Administrasi Karier dan Dunia Kerja */}
        <TabsContent value="karier">
            <Card>
                <CardHeader><CardTitle>G. Administrasi Karier dan Dunia Kerja</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderPlaceholderCard("Data Potensi Siswa per Jurusan", "Untuk persiapan PKL, LKS, atau penempatan kerja.")}
                    {renderPlaceholderCard("Portofolio Siswa", "Arsip sertifikat, prestasi, dan pengalaman kerja.")}
                    {renderPlaceholderCard("Informasi Lowongan & Pelatihan", "Bank data info kerja, magang, atau kuliah lanjut.")}
                    {renderPlaceholderCard("Dokumentasi Program Bimbingan Karier", "Seminar, workshop, kunjungan industri.")}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
