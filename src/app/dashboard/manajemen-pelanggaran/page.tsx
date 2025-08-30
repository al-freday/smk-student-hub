
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, User, ShieldAlert, ChevronsUpDown, Check, MoreHorizontal, MessageSquare, UserCheck, CheckCircle, ArrowRight, Inbox, History } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { tataTertibData } from "@/lib/tata-tertib-data";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface TataTertib {
  deskripsi: string;
  poin: number;
}

type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Diteruskan ke Wakasek' | 'Selesai';

interface CatatanPelanggaran {
  id: number;
  tanggal: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  pelanggaran: string;
  poin: number;
  guruPelapor: string;
  tindakanAwal: string;
  status: StatusLaporan;
}

const flattenTataTertib = (data: typeof tataTertibData) => {
    let allRules: { id: number, deskripsi: string, poin: number }[] = [];
    let idCounter = 1;
    for (const kategori in data) {
        for (const tingkat in data[kategori as keyof typeof data]) {
            // @ts-ignore
            data[kategori as keyof typeof data][tingkat].forEach(rule => {
                allRules.push({ ...rule, id: idCounter++ });
            });
        }
    }
    return allRules;
};

export default function ManajemenPelanggaranPage() {
  const { toast } = useToast();
  
  // --- Data States ---
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarTataTertib, setDaftarTataTertib] = useState<{ id: number, deskripsi: string, poin: number }[]>([]);
  const [riwayatPelanggaran, setRiwayatPelanggaran] = useState<CatatanPelanggaran[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string; role: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [penugasan, setPenugasan] = useState<{ kelasBinaan?: string[]; tingkatBinaan?: string }>({});

  // --- Filter State ---
  const [filter, setFilter] = useState("");

  // --- Dialog & Form States ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [catatanToDelete, setCatatanToDelete] = useState<CatatanPelanggaran | null>(null);
  
  // --- Form Data States ---
  const [selectedNis, setSelectedNis] = useState<string>("");
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [tindakanAwal, setTindakanAwal] = useState("");

  const loadData = useCallback(() => {
    const user = getSourceData('currentUser', null);
    setCurrentUser(user);
    
    setDaftarSiswa(getSourceData('siswaData', []));
    setRiwayatPelanggaran(getSourceData('riwayatPelanggaran', []));
    setDaftarTataTertib(flattenTataTertib(tataTertibData));
    
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    if (user && role) {
        const teachersData = getSourceData('teachersData', {});
        if (role === 'wali_kelas') {
            const waliData = teachersData.wali_kelas?.find((w: any) => w.nama === user.nama);
            setPenugasan({ kelasBinaan: waliData?.kelas || [] });
        }
        if (role === 'guru_bk') {
            const bkData = teachersData.guru_bk?.find((b: any) => b.nama === user.nama);
            setPenugasan({ tingkatBinaan: bkData?.tugasKelas || '' });
        }
    }
  }, []);
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);
  
  const handleOpenDialog = () => {
    setSelectedNis("");
    setSelectedRuleId(null);
    setTindakanAwal("");
    setIsDialogOpen(true);
  };

  const handleSaveCatatan = () => {
    const siswa = daftarSiswa.find(s => s.nis === selectedNis);
    const aturan = daftarTataTertib.find(t => t.id === selectedRuleId);

    if (!siswa || !aturan) {
      toast({ title: "Gagal Menyimpan", description: "Harap pilih siswa dan jenis pelanggaran.", variant: "destructive" });
      return;
    }
    
    const currentRiwayat = getSourceData('riwayatPelanggaran', []);
    const newCatatan: CatatanPelanggaran = {
      id: currentRiwayat.length > 0 ? Math.max(...currentRiwayat.map((c: CatatanPelanggaran) => c.id)) + 1 : 1,
      tanggal: format(new Date(), "yyyy-MM-dd"),
      nis: siswa.nis,
      namaSiswa: siswa.nama,
      kelas: siswa.kelas,
      pelanggaran: aturan.deskripsi,
      poin: aturan.poin,
      guruPelapor: currentUser?.nama || "Guru",
      tindakanAwal: tindakanAwal,
      status: 'Dilaporkan',
    };

    updateSourceData('riwayatPelanggaran', [...currentRiwayat, newCatatan]);
    
    toast({ title: "Sukses", description: "Catatan pelanggaran berhasil disimpan." });
    setIsDialogOpen(false);
  };

  const handleDeleteCatatan = () => {
    if (!catatanToDelete) return;

    const updatedRiwayat = riwayatPelanggaran.filter(c => c.id !== catatanToDelete.id);
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    
    toast({ title: "Catatan Dihapus", description: `Catatan untuk ${catatanToDelete.namaSiswa} telah dihapus.` });
    setCatatanToDelete(null);
  };
  
  const handleStatusChange = (id: number, status: StatusLaporan) => {
    const allPelanggaran: CatatanPelanggaran[] = getSourceData('riwayatPelanggaran', []);
    const updatedRiwayat = allPelanggaran.map(item => 
        item.id === id ? { ...item, status: status } : item
    );
    updateSourceData('riwayatPelanggaran', updatedRiwayat);
    toast({ title: "Status Diperbarui", description: `Status laporan telah diubah menjadi "${status}".` });
  };
  
  const getStatusBadgeVariant = (status: StatusLaporan) => {
    switch (status) {
        case 'Dilaporkan': return 'destructive';
        case 'Ditindaklanjuti Wali Kelas': return 'secondary';
        case 'Diteruskan ke BK': return 'default';
        case 'Diteruskan ke Wakasek': return 'outline';
        case 'Selesai': return 'outline';
        default: return 'outline';
    }
  };
  
  // --- RENDER LOGIC ---
  const canRecord = ['wakasek_kesiswaan', 'wali_kelas', 'guru_mapel', 'guru_piket', 'guru_pendamping'].includes(userRole || '');
  const canDelete = userRole === 'wakasek_kesiswaan';
  
  const renderActionMenu = (catatan: CatatanPelanggaran) => {
    const role = userRole;
    const status = catatan.status;

    if (role === 'wali_kelas' && status === 'Dilaporkan') {
        return (
            <>
                <DropdownMenuItem onClick={() => handleStatusChange(catatan.id, 'Ditindaklanjuti Wali Kelas')}><UserCheck className="mr-2 h-4 w-4" /> Tandai ditindaklanjuti</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(catatan.id, 'Diteruskan ke BK')}><MessageSquare className="mr-2 h-4 w-4" /> Teruskan ke BK</DropdownMenuItem>
            </>
        );
    }

    if (role === 'guru_bk' && status === 'Diteruskan ke BK') {
        return (
            <>
                <DropdownMenuItem onClick={() => handleStatusChange(catatan.id, 'Diteruskan ke Wakasek')}><ArrowRight className="mr-2 h-4 w-4" /> Teruskan ke Wakasek</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(catatan.id, 'Selesai')}><CheckCircle className="mr-2 h-4 w-4" /> Tandai Selesai</DropdownMenuItem>
            </>
        );
    }
    
    if (role === 'wakasek_kesiswaan') {
       return (
            <>
                {status !== 'Ditindaklanjuti Wali Kelas' && <DropdownMenuItem onClick={() => handleStatusChange(catatan.id, 'Ditindaklanjuti Wali Kelas')}><UserCheck className="mr-2 h-4 w-4" /> Tindak lanjuti</DropdownMenuItem>}
                {status !== 'Diteruskan ke BK' && <DropdownMenuItem onClick={() => handleStatusChange(catatan.id, 'Diteruskan ke BK')}><MessageSquare className="mr-2 h-4 w-4" /> Teruskan ke BK</DropdownMenuItem>}
                {status !== 'Diteruskan ke Wakasek' && <DropdownMenuItem onClick={() => handleStatusChange(catatan.id, 'Diteruskan ke Wakasek')}><ArrowRight className="mr-2 h-4 w-4" /> Teruskan ke Wakasek</DropdownMenuItem>}
                {status !== 'Selesai' && <DropdownMenuItem onClick={() => handleStatusChange(catatan.id, 'Selesai')}><CheckCircle className="mr-2 h-4 w-4" /> Tandai Selesai</DropdownMenuItem>}
            </>
        );
    }

    return null;
  };
  
  const renderTable = (data: CatatanPelanggaran[], title: string, description: string, icon: React.ReactNode) => (
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Detail Pelanggaran</TableHead>
                        <TableHead>Pelapor & Tindakan Awal</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((catatan, index) => (
                            <TableRow key={`${catatan.id}-${index}`}>
                                <TableCell>
                                    <p className="font-medium">{catatan.namaSiswa}</p>
                                    <p className="text-xs text-muted-foreground">{catatan.kelas} | {format(new Date(catatan.tanggal), "dd/MM/yyyy")}</p>
                                </TableCell>
                                <TableCell>
                                    <p>{catatan.pelanggaran}</p>
                                    <Badge variant="destructive">{catatan.poin} Poin</Badge>
                                </TableCell>
                                <TableCell>
                                    <p className="font-medium">{catatan.guruPelapor}</p>
                                    <p className="text-xs text-muted-foreground">{catatan.tindakanAwal || "-"}</p>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={getStatusBadgeVariant(catatan.status)}>{catatan.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {renderActionMenu(catatan)}
                                            {canDelete && (
                                                <DropdownMenuItem onSelect={e => e.preventDefault()} onClick={() => setCatatanToDelete(catatan)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4"/> Hapus
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                Tidak ada data untuk ditampilkan.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
  );

  const renderRoleSpecificView = () => {
      const role = userRole;
      const allData = riwayatPelanggaran.filter(item => 
          item.namaSiswa.toLowerCase().includes(filter.toLowerCase()) ||
          item.kelas.toLowerCase().includes(filter.toLowerCase()) ||
          item.pelanggaran.toLowerCase().includes(filter.toLowerCase())
      ).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

      if (role === 'wali_kelas' || role === 'guru_bk') {
          let casesToHandle: CatatanPelanggaran[] = [];
          let processedCases: CatatanPelanggaran[] = [];
          
          if (role === 'wali_kelas') {
              const kelasBinaan = penugasan.kelasBinaan || [];
              casesToHandle = allData.filter(p => kelasBinaan.includes(p.kelas) && p.status === 'Dilaporkan');
              processedCases = allData.filter(p => kelasBinaan.includes(p.kelas) && p.status !== 'Dilaporkan');
          } else { // guru_bk
              const gradePrefix = penugasan.tingkatBinaan ? penugasan.tingkatBinaan.split(' ')[1] : '';
              casesToHandle = allData.filter(p => p.kelas.startsWith(gradePrefix) && p.status === 'Diteruskan ke BK');
              processedCases = allData.filter(p => p.kelas.startsWith(gradePrefix) && p.status !== 'Diteruskan ke BK');
          }

          return (
              <div className="space-y-6">
                  {renderTable(casesToHandle, "Kasus Masuk", "Daftar kasus yang memerlukan tindakan atau eskalasi dari Anda.", <Inbox/>)}
                  {renderTable(processedCases, "Riwayat Tindakan", "Daftar kasus yang telah Anda proses atau diteruskan.", <History/>)}
              </div>
          );
      }

      if (role === 'wakasek_kesiswaan') {
          return renderTable(allData, "Semua Catatan Pelanggaran", "Daftar lengkap semua pelanggaran yang tercatat di sekolah.", <ShieldAlert/>);
      }

      // Default for guru mapel, piket, pendamping
      const reportedByMe = allData.filter(p => p.guruPelapor === currentUser?.nama);
      return renderTable(reportedByMe, "Riwayat Laporan Saya", "Daftar pelanggaran yang telah Anda laporkan.", <History/>);
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manajemen Pelanggaran Siswa</h2>
            <p className="text-muted-foreground">Catat, pantau, dan kelola pelanggaran tata tertib siswa sesuai alur kerja.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
              <Input 
                  placeholder="Cari (nama, kelas, pelanggaran)..." 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full sm:w-64"
              />
              {canRecord && (
                  <Button onClick={handleOpenDialog} className="whitespace-nowrap">
                      <PlusCircle className="mr-2 h-4 w-4"/>
                      Catat Baru
                  </Button>
              )}
          </div>
      </div>

      {renderRoleSpecificView()}
      
      {/* Dialog Pencatatan Pelanggaran */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Formulir Pencatatan Pelanggaran</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User/>Pilih Siswa</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                {selectedNis ? daftarSiswa.find(s => s.nis === selectedNis)?.nama : "Cari dan pilih siswa..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0">
                            <Command>
                                <CommandInput placeholder="Ketik nama siswa..."/>
                                <CommandList>
                                    <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {daftarSiswa.map(siswa => (
                                            <CommandItem key={siswa.nis} value={siswa.nama} onSelect={() => setSelectedNis(siswa.nis)}>
                                                <Check className={cn("mr-2 h-4 w-4", selectedNis === siswa.nis ? "opacity-100" : "opacity-0")}/>
                                                {siswa.nama} ({siswa.kelas})
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><ShieldAlert/>Pilih Jenis Pelanggaran</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between h-auto text-left">
                                <span className="flex-1 whitespace-normal">
                                    {selectedRuleId ? daftarTataTertib.find(r => r.id === selectedRuleId)?.deskripsi : "Cari dan pilih pelanggaran..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0">
                             <Command>
                                <CommandInput placeholder="Ketik deskripsi pelanggaran..."/>
                                <CommandList>
                                    <CommandEmpty>Aturan tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {daftarTataTertib.map(rule => (
                                            <CommandItem key={rule.id} value={rule.deskripsi} onSelect={() => setSelectedRuleId(rule.id)}>
                                                <Check className={cn("mr-2 h-4 w-4", selectedRuleId === rule.id ? "opacity-100" : "opacity-0")}/>
                                                 {rule.deskripsi} <Badge variant="destructive" className="ml-auto">{rule.poin} Poin</Badge>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label>Tindakan Awal yang Dilakukan (Opsional)</Label>
                    <Textarea value={tindakanAwal} onChange={e => setTindakanAwal(e.target.value)} placeholder="Contoh: Ditegur secara lisan di tempat."/>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleSaveCatatan}>Simpan Laporan</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Alert Dialog Hapus */}
       <AlertDialog open={!!catatanToDelete} onOpenChange={() => setCatatanToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>Tindakan ini akan menghapus catatan pelanggaran secara permanen dari riwayat.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteCatatan}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    