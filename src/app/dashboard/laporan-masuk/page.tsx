
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MessageSquare, CheckCircle, Loader2, BookOpen, Users, FileSignature, Phone, Award, Search } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai';
interface CatatanPelanggaran { 
    id: number; 
    tanggal: string; 
    namaSiswa: string; 
    kelas: string; 
    pelanggaran: string; 
    poin: number; 
    status: StatusLaporan;
}

const alurKerjaItems = [
    { id: "verifikasi", title: "Verifikasi Laporan", icon: Search, details: ["Pastikan laporan valid dan jelas sumbernya (guru piket, guru mapel, BK, dll.), bukan sekadar gosip kelas.", "Tanya kronologi kejadian dengan tenang, jangan langsung menghakimi atau marah."] },
    { id: "panggil", title: "Panggil & Ajak Bicara Siswa", icon: Users, details: ["Wali kelas harus jadi “pintu pertama” pembinaan.", "Bicara empat mata dulu, biar siswa merasa aman buat cerita.", "Bedakan: pelanggaran karena sengaja atau karena ketidaktahuan."] },
    { id: "catat", title: "Catat & Laporkan", icon: FileSignature, details: ["Bikin catatan di buku tata tertib/administrasi wali kelas.", "Kalau kasus serius, koordinasi dengan guru BK dan Wakasek Kesiswaan."] },
    { id: "panggil_ortu", title: "Panggil Orang Tua (Bila Perlu)", icon: Phone, details: ["Untuk pelanggaran berulang atau berat, wali kelas wajib menghubungi orang tua/wali murid.", "Tujuannya bukan sekadar “ngadu”, tapi cari solusi bareng."] },
    { id: "pembinaan", title: "Pembinaan & Solusi", icon: Award, details: ["Cari hukuman yang mendidik, bukan sekadar menghukum. Misalnya: kerja bakti, presentasi tentang aturan sekolah, atau bimbingan khusus.", "Ajak siswa bikin komitmen tertulis supaya lebih serius memperbaiki diri."] },
    { id: "monitoring", title: "Monitoring", icon: BookOpen, details: ["Setelah kasus selesai, wali kelas tetap memantau. Jangan sampai anak merasa ditinggalkan atau dicap nakal permanen.", "Dorong anak buat lebih aktif di kegiatan positif biar energinya tersalurkan."] },
];

export default function LaporanMasukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Pengguna & Kelas ---
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
  
  // --- Data Terfilter ---
  const [pelanggaranDiKelas, setPelanggaranDiKelas] = useState<CatatanPelanggaran[]>([]);

  // --- State untuk Checklist ---
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    setCheckedItems({});
    toast({ title: "Checklist Direset", description: "Anda bisa memulai proses untuk kasus baru." });
  };


  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user) {
        router.push('/');
        return;
      }
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'wali_kelas') {
         toast({ title: "Akses Ditolak", description: "Halaman ini hanya untuk Wali Kelas.", variant: "destructive" });
         router.push('/dashboard');
         return;
      }
      setCurrentUser(user);

      const teachersData = getSourceData('teachersData', {});
      const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === user.nama);
      const binaan = waliKelasData?.kelas || [];
      setKelasBinaan(binaan);

      const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
      const pelanggaranBinaan = allPelanggaran
        .filter(p => binaan.includes(p.kelas) && p.status === 'Dilaporkan')
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      setPelanggaranDiKelas(pelanggaranBinaan);

    } catch (error) {
      console.error("Gagal memuat data Laporan Masuk:", error);
      toast({ title: "Gagal Memuat Data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);
  
  const handleStatusChange = (id: number, status: StatusLaporan) => {
    const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const updatedRiwayat = allPelanggaran.map(item =>
      item.id === id ? { ...item, status: status } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Status Diperbarui", description: `Status laporan telah diubah menjadi "${status}".` });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan Pelanggaran Masuk</h2>
        <p className="text-muted-foreground">
            Tindak lanjuti semua laporan pelanggaran yang masuk untuk siswa di kelas binaan Anda: <span className="font-semibold text-primary">{kelasBinaan.join(', ')}</span>
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Daftar Laporan Perlu Diverifikasi</CardTitle>
            <CardDescription>Berikut adalah {pelanggaranDiKelas.length} laporan baru yang membutuhkan tindakan Anda.</CardDescription>
        </CardHeader>
        <CardContent>
            {pelanggaranDiKelas.length > 0 ? (
                <Table>
                    <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead>Pelapor</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {pelanggaranDiKelas.map(p => (
                             <TableRow key={p.id}>
                                <TableCell>
                                    <p className="font-medium">{p.namaSiswa}</p>
                                    <p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMMM yyyy")}</p>
                                </TableCell>
                                <TableCell>
                                    <p>{p.pelanggaran}</p>
                                    <Badge variant="destructive">{p.poin} Poin</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{(p as any).guruPelapor || 'Guru'}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Proses</Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Ditindaklanjuti Wali Kelas')}><CheckCircle className="mr-2 h-4 w-4" />Tandai Sudah Ditangani</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Diteruskan ke BK')}><MessageSquare className="mr-2 h-4 w-4" />Teruskan ke BK</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center h-48 flex flex-col justify-center items-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4"/>
                    <h3 className="text-lg font-semibold">Tidak Ada Laporan Baru</h3>
                    <p className="text-muted-foreground">Semua laporan pelanggaran di kelas Anda sudah ditangani.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Alur Kerja Penanganan Laporan</CardTitle>
                <CardDescription>Gunakan panduan ini sebagai checklist saat menangani setiap kasus.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetChecklist}>Atur Ulang Checklist</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-2">
            {alurKerjaItems.map((item) => {
              const Icon = item.icon;
              return (
                 <AccordionItem value={item.id} key={item.id} className="border rounded-lg bg-muted/30">
                  <div className="flex items-center p-4">
                      <Checkbox
                          id={`check-${item.id}`}
                          checked={!!checkedItems[item.id]}
                          onCheckedChange={() => handleCheckboxChange(item.id)}
                          className="mr-4"
                      />
                      <AccordionTrigger className="flex-1 p-0 hover:no-underline">
                        <div className="flex items-center gap-3">
                           <Icon className="h-5 w-5 text-primary" />
                           <label htmlFor={`check-${item.id}`} className="font-semibold text-base cursor-pointer">{item.title}</label>
                        </div>
                      </AccordionTrigger>
                  </div>
                  <AccordionContent className="px-4 pb-4 pl-12 border-t pt-4">
                    <ul className="list-disc space-y-1 text-muted-foreground text-sm pl-4">
                      {item.details.map((detail, index) => <li key={index}>{detail}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
