
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSourceData } from "@/lib/data-manager";
import { Loader2, Users, CalendarClock, UserCog, ClipboardList, ShieldAlert, BarChart3, BookUser, FileText, Award } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface Jadwal { hari: string; sesi: string; mataPelajaran: string; guru: string; }
interface Catatan { tanggal: string; tipe: 'pelanggaran' | 'prestasi'; deskripsi: string; poin?: number; }
interface SiswaDenganCatatan extends Siswa {
    catatan: Catatan[];
}

export default function AdministrasiWaliKelasPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  const [siswaDiKelas, setSiswaDiKelas] = useState<SiswaDenganCatatan[]>([]);
  const [jadwalKelas, setJadwalKelas] = useState<Jadwal[]>([]);
  const [guruMapel, setGuruMapel] = useState<Map<string, string[]>>(new Map());

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user) {
        router.push('/');
        return;
      }
      setCurrentUser(user);

      const teachersData = getSourceData('teachersData', {});
      const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === user.nama);
      const binaan = waliKelasData?.kelas || [];
      setKelasBinaan(binaan);

      // --- Filter Data Siswa ---
      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      const siswaBinaan = allSiswa.filter(s => binaan.includes(s.kelas));

      // --- Gabungkan dengan Catatan Pelanggaran & Prestasi ---
      const allPelanggaran: any[] = getSourceData('riwayatPelanggaran', []);
      const allPrestasi: any[] = getSourceData('prestasiData', []);
      
      const siswaDenganCatatan = siswaBinaan.map(siswa => {
        const catatanPelanggaran = allPelanggaran
            .filter(p => p.nis === siswa.nis)
            .map(p => ({ tanggal: p.tanggal, tipe: 'pelanggaran', deskripsi: p.pelanggaran, poin: p.poin })) as Catatan[];
        
        const catatanPrestasi = allPrestasi
            .filter(p => p.nis === siswa.nis)
            .map(p => ({ tanggal: p.tanggal, tipe: 'prestasi', deskripsi: p.deskripsi })) as Catatan[];

        return { ...siswa, catatan: [...catatanPelanggaran, ...catatanPrestasi].sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()) };
      });
      setSiswaDiKelas(siswaDenganCatatan);

      // --- Filter Jadwal Pelajaran & Guru Mapel ---
      const guruMapelList = teachersData.guru_mapel || [];
      const jadwalUntukKelas: Jadwal[] = [];
      const guruDiKelas = new Map<string, string[]>();

      if (Array.isArray(guruMapelList)) {
          guruMapelList.forEach((guru: any) => {
              if (Array.isArray(guru.teachingAssignments)) {
                  guru.teachingAssignments.forEach((assignment: any) => {
                      if (binaan.includes(assignment.className)) {
                          jadwalUntukKelas.push({
                              hari: assignment.day,
                              sesi: assignment.session,
                              mataPelajaran: assignment.subject,
                              guru: guru.nama,
                          });

                          const currentGurus = guruDiKelas.get(assignment.subject) || [];
                          if (!currentGurus.includes(guru.nama)) {
                              guruDiKelas.set(assignment.subject, [...currentGurus, guru.nama]);
                          }
                      }
                  });
              }
          });
      }
      setJadwalKelas(jadwalUntukKelas);
      setGuruMapel(guruDiKelas);

    } catch (error) {
        console.error("Gagal memuat data administrasi:", error);
    } finally {
        setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administrasi Wali Kelas</h2>
        <p className="text-muted-foreground">
          Pusat data dan dokumen untuk kelas binaan Anda: <span className="font-semibold text-primary">{kelasBinaan.join(', ')}</span>
        </p>
      </div>
      
      <Accordion type="multiple" className="w-full space-y-4">
        
        {/* Dokumen Pokok */}
        <AccordionItem value="dokumen-pokok" className="border rounded-lg bg-card">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex items-center gap-3"><FileText className="h-5 w-5"/> <span className="font-semibold text-lg">Dokumen Pokok</span></div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users/>Data Induk Siswa</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Catatan Terbaru</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {siswaDiKelas.map(s => (
                        <TableRow key={s.id}>
                          <TableCell>{s.nis}</TableCell>
                          <TableCell>{s.nama}</TableCell>
                          <TableCell className="text-xs">{s.catatan.length > 0 ? `${s.catatan[0].deskripsi} (${format(new Date(s.catatan[0].tanggal), 'dd/MM/yy')})` : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarClock/>Jadwal Pelajaran & Guru Mapel</CardTitle></CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Mata Pelajaran</TableHead><TableHead>Guru Pengajar</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {Array.from(guruMapel.entries()).map(([mapel, gurus]) => (
                                <TableRow key={mapel}>
                                    <TableCell>{mapel}</TableCell>
                                    <TableCell>{gurus.join(', ')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Dokumen Pendukung */}
        <AccordionItem value="dokumen-pendukung" className="border rounded-lg bg-card">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex items-center gap-3"><BookUser className="h-5 w-5"/> <span className="font-semibold text-lg">Dokumen Pendukung</span></div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert/>Buku Catatan Perilaku Siswa</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Catatan</TableHead><TableHead className="text-center">Poin</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {siswaDiKelas.flatMap(s => s.catatan.map(c => ({...c, nama: s.nama}))).sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((c, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{format(new Date(c.tanggal), "dd MMM yyyy", { locale: id })}</TableCell>
                                    <TableCell>{c.nama}</TableCell>
                                    <TableCell>{c.deskripsi}</TableCell>
                                    <TableCell className="text-center">
                                        {c.tipe === 'pelanggaran' ? <Badge variant="destructive">{c.poin}</Badge> : <Badge variant="secondary">Prestasi</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </AccordionContent>
        </AccordionItem>
        
        {/* Dokumen Akhir Semester */}
        <AccordionItem value="dokumen-akhir" className="border rounded-lg bg-card">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex items-center gap-3"><Award className="h-5 w-5"/> <span className="font-semibold text-lg">Dokumen Akhir Semester/Tahun</span></div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3/>Rekap Poin & Prestasi</CardTitle></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead className="text-center">Total Poin Pelanggaran</TableHead><TableHead className="text-center">Jumlah Prestasi</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {siswaDiKelas.map(s => {
                                const totalPoin = s.catatan.filter(c => c.tipe === 'pelanggaran').reduce((sum, c) => sum + (c.poin || 0), 0);
                                const totalPrestasi = s.catatan.filter(c => c.tipe === 'prestasi').length;
                                return (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.nama}</TableCell>
                                        <TableCell className="text-center"><Badge variant={totalPoin > 0 ? "destructive" : "default"}>{totalPoin}</Badge></TableCell>
                                        <TableCell className="text-center">{totalPrestasi}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                     </Table>
                </CardContent>
             </Card>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
