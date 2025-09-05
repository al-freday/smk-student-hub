
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MessageSquare, CheckCircle, Loader2, ClipboardCheck, Users, Edit, Phone, BookUp, Monitor, RefreshCw } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

// --- Tipe Data ---
type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Selesai';
interface CatatanPelanggaran { id: number; tanggal: string; namaSiswa: string; kelas: string; pelanggaran: string; poin: number; status: StatusLaporan; }

const alurPenanganan = [
    {
        id: "verifikasi",
        title: "Verifikasi Laporan",
        icon: ClipboardCheck,
        content: [
            "Pastikan laporan valid dan jelas sumbernya (guru piket, guru mapel, BK, dll.), bukan sekadar gosip kelas.",
            "Tanya kronologi kejadian dengan tenang, jangan langsung menghakimi atau marah.",
        ],
    },
    {
        id: "panggil",
        title: "Panggil & Ajak Bicara Siswa",
        icon: Users,
        content: [
            "Wali kelas harus menjadi “pintu pertama” pembinaan.",
            "Bicara empat mata terlebih dahulu agar siswa merasa aman untuk bercerita.",
            "Bedakan antara pelanggaran yang disengaja dan yang terjadi karena ketidaktahuan.",
        ],
    },
    {
        id: "catat",
        title: "Catat & Laporkan",
        icon: Edit,
        content: [
            "Buat catatan kejadian di buku administrasi wali kelas atau sistem yang relevan.",
            "Untuk kasus yang serius atau berulang, segera berkoordinasi dengan Guru BK dan Wakasek Kesiswaan.",
        ],
    },
    {
        id: "panggil_ortu",
        title: "Panggil Orang Tua (Bila Perlu)",
        icon: Phone,
        content: [
            "Hubungi orang tua/wali murid untuk pelanggaran yang berat atau berulang.",
            "Tujuannya bukan untuk “mengadu”, melainkan untuk mencari solusi bersama demi kebaikan siswa.",
        ],
    },
    {
        id: "pembinaan",
        title: "Pembinaan & Solusi",
        icon: BookUp,
        content: [
            "Cari sanksi yang bersifat mendidik, bukan sekadar menghukum. Contoh: kerja bakti, membuat presentasi tentang tata tertib.",
            "Ajak siswa untuk membuat komitmen tertulis agar lebih serius dalam memperbaiki diri.",
        ],
    },
    {
        id: "monitoring",
        title: "Monitoring",
        icon: Monitor,
        content: [
            "Setelah kasus selesai, wali kelas tetap memantau perkembangan siswa.",
            "Jangan biarkan siswa merasa ditinggalkan atau dicap negatif secara permanen.",
            "Dorong siswa untuk aktif dalam kegiatan positif agar energinya tersalurkan dengan baik.",
        ],
    },
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
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});


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
  
  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [itemId]: checked }));
  };

  const resetChecklist = () => {
    setChecklist({});
    toast({ title: "Checklist Direset", description: "Anda dapat mulai menangani kasus baru." });
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
            <CardTitle>Daftar Laporan</CardTitle>
            <CardDescription>Gunakan menu Aksi untuk menindaklanjuti atau meneruskan laporan ke Guru BK.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Pelanggaran</TableHead><TableHead>Poin</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                    {pelanggaranDiKelas.length > 0 ? pelanggaranDiKelas.map(p => (
                         <TableRow key={p.id}>
                            <TableCell>
                                <p className="font-medium">{p.namaSiswa}</p>
                                <p className="text-xs text-muted-foreground">{p.kelas} | {format(new Date(p.tanggal), "dd MMM yyyy")}</p>
                            </TableCell>
                            <TableCell>
                                <p>{p.pelanggaran}</p>
                            </TableCell>
                            <TableCell><Badge variant="destructive">{p.poin} Poin</Badge></TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4 mr-2"/>Aksi</Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Ditindaklanjuti Wali Kelas')}><CheckCircle className="mr-2 h-4 w-4" />Tandai ditindaklanjuti</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'Diteruskan ke BK')}><MessageSquare className="mr-2 h-4 w-4" />Teruskan ke BK</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada laporan pelanggaran baru yang perlu ditindaklanjuti.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle>Alur Kerja Penanganan Laporan</CardTitle>
                <CardDescription>Gunakan checklist interaktif ini saat menangani setiap kasus.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetChecklist}>
                <RefreshCw className="mr-2 h-4 w-4"/> Atur Ulang Checklist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {alurPenanganan.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/40">
                            <Checkbox 
                                id={`check-${item.id}`}
                                className="mt-1"
                                checked={checklist[item.id] || false}
                                onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor={`check-${item.id}`}
                                    className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                >
                                    <Icon className="h-5 w-5 text-primary" /> {item.title}
                                </label>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                    {item.content.map((point, index) => (
                                        <li key={index}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="mt-4 text-xs text-center text-muted-foreground italic">
                Singkatnya, wali kelas jadi mediator + motivator + dokumentator. Tegas iya, tapi harus tetap jadi “rumah aman” bagi anak walinya.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
