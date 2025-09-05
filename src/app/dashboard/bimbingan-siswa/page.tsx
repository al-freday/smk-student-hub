
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy, Gem, ShieldCheck, PlusCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface Prestasi { id: string; nis: string; tanggal: string; deskripsi: string; tingkat: string; }
interface PklData { status: string; perusahaan: string; catatan: string; progres: number; }
interface LogBimbingan { id: string; tanggal: string; kategori: string; catatan: string; }
interface LogAkademik { id: string; tanggal: string; kategori: string; catatan: string; }
interface LogKompetensi { id: string; tanggal: string; kategori: string; catatan: string; }

type KategoriAkademik = "Pantau Perkembangan Belajar" | "Identifikasi Kesulitan Akademik" | "Koordinasi dengan Guru Mapel" | "Rencana Pembelajaran Individual";
type KategoriKompetensi = "Motivasi & Pengembangan Diri" | "Pemetaan Minat & Bakat";

export default function BimbinganSiswaPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [siswaBinaan, setSiswaBinaan] = useState<Siswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Prestasi States ---
  const [isPrestasiDialogOpen, setIsPrestasiDialogOpen] = useState(false);
  const [prestasiFormData, setPrestasiFormData] = useState<Partial<Omit<Prestasi, 'id' | 'tanggal'>>>({});

  // --- PKL States ---
  const [isPklDialogOpen, setIsPklDialogOpen] = useState(false);
  const [selectedSiswaPkl, setSelectedSiswaPkl] = useState<Siswa | null>(null);
  const [pklData, setPklData] = useState<Record<string, PklData>>({});
  const [pklFormData, setPklFormData] = useState<Partial<PklData>>({});

  // --- Log Bimbingan Karakter States ---
  const [isLogKarakterDialogOpen, setIsLogKarakterDialogOpen] = useState(false);
  const [logKarakterFormData, setLogKarakterFormData] = useState<Partial<Omit<LogBimbingan, 'id' | 'tanggal'>> & { nis?: string }>({});
  
  // --- Log Bimbingan Akademik States ---
  const [isLogAkademikDialogOpen, setIsLogAkademikDialogOpen] = useState(false);
  const [logAkademikFormData, setLogAkademikFormData] = useState<Partial<Omit<LogAkademik, 'id' | 'tanggal'>> & { nis?: string, kategori?: KategoriAkademik }>({});
  
  // --- Log Pengembangan Kompetensi States ---
  const [isLogKompetensiDialogOpen, setIsLogKompetensiDialogOpen] = useState(false);
  const [logKompetensiFormData, setLogKompetensiFormData] = useState<Partial<Omit<LogKompetensi, 'id' | 'tanggal'>> & { nis?: string, kategori?: KategoriKompetensi }>({});


  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user) {
        router.push('/');
        return;
      }

      const teachersData = getSourceData('teachersData', {});
      const guruData = teachersData.guru_pendamping?.find((gp: any) => gp.nama === user.nama);
      const daftarNamaSiswaBinaan = guruData?.siswaBinaan || [];

      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      setSiswaBinaan(allSiswa.filter(s => daftarNamaSiswaBinaan.includes(s.nama)));
      setPklData(getSourceData('pklData', {}));

    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast({ title: "Gagal memuat data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  // --- Handlers for Prestasi ---
  const handleSavePrestasi = () => {
    if (!prestasiFormData.nis || !prestasiFormData.deskripsi || !prestasiFormData.tingkat) {
      toast({ title: "Gagal", description: "Siswa, deskripsi, dan tingkat harus diisi.", variant: "destructive" });
      return;
    }
    const newPrestasi = {
      ...prestasiFormData,
      id: `pres-${Date.now()}`,
      tanggal: new Date().toISOString(),
    };
    const allPrestasi = getSourceData('prestasiData', []);
    updateSourceData('prestasiData', [...allPrestasi, newPrestasi]);
    toast({ title: "Sukses", description: "Prestasi siswa berhasil dicatat." });
    setIsPrestasiDialogOpen(false);
  };

  // --- Handlers for PKL ---
  const handleOpenPklDialog = (siswa: Siswa) => {
    setSelectedSiswaPkl(siswa);
    setPklFormData(pklData[siswa.nis] || { status: 'Belum Siap', progres: 0 });
    setIsPklDialogOpen(true);
  };

  const handleSavePkl = () => {
    if (!selectedSiswaPkl) return;
    const updatedPklData = { ...pklData, [selectedSiswaPkl.nis]: pklFormData };
    updateSourceData('pklData', updatedPklData);
    setPklData(updatedPklData);
    toast({ title: "Sukses", description: `Data PKL untuk ${selectedSiswaPkl.nama} berhasil diperbarui.` });
    setIsPklDialogOpen(false);
  };

  // --- Handlers for Log Bimbingan Karakter ---
  const handleSaveLogKarakter = () => {
    if (!logKarakterFormData.nis || !logKarakterFormData.kategori || !logKarakterFormData.catatan) {
      toast({ title: "Gagal", description: "Siswa, kategori, dan catatan harus diisi.", variant: "destructive" });
      return;
    }
    const newLog = {
        id: `log-${Date.now()}`,
        tanggal: new Date().toISOString(),
        kategori: logKarakterFormData.kategori,
        catatan: logKarakterFormData.catatan,
    };
    const allLogs = getSourceData('logBimbinganData', {});
    const userLogs = allLogs[logKarakterFormData.nis] || [];
    allLogs[logKarakterFormData.nis] = [newLog, ...userLogs];
    updateSourceData('logBimbinganData', allLogs);
    toast({ title: "Sukses", description: "Log bimbingan berhasil disimpan." });
    setIsLogKarakterDialogOpen(false);
  }

  // --- Handlers for Log Bimbingan Akademik ---
  const handleOpenLogAkademikDialog = (kategori: KategoriAkademik) => {
      setLogAkademikFormData({ kategori });
      setIsLogAkademikDialogOpen(true);
  };
  
  const handleSaveLogAkademik = () => {
    if (!logAkademikFormData.nis || !logAkademikFormData.kategori || !logAkademikFormData.catatan) {
      toast({ title: "Gagal", description: "Siswa, kategori, dan catatan harus diisi.", variant: "destructive" });
      return;
    }
    const newLog: LogAkademik = {
      id: `log-akademik-${Date.now()}`,
      tanggal: new Date().toISOString(),
      kategori: logAkademikFormData.kategori,
      nis: logAkademikFormData.nis,
      catatan: logAkademikFormData.catatan,
    };
    const allLogs = getSourceData('logAkademikData', {});
    const userLogs = allLogs[logAkademikFormData.nis] || [];
    allLogs[logAkademikFormData.nis] = [newLog, ...userLogs];
    updateSourceData('logAkademikData', allLogs);
    toast({ title: "Sukses", description: "Log pendampingan akademik berhasil disimpan." });
    setIsLogAkademikDialogOpen(false);
  };

  // --- Handlers for Log Pengembangan Kompetensi ---
  const handleOpenLogKompetensiDialog = (kategori: KategoriKompetensi) => {
    setLogKompetensiFormData({ kategori });
    setIsLogKompetensiDialogOpen(true);
  };

  const handleSaveLogKompetensi = () => {
    if (!logKompetensiFormData.nis || !logKompetensiFormData.kategori || !logKompetensiFormData.catatan) {
        toast({ title: "Gagal", description: "Siswa, kategori, dan catatan harus diisi.", variant: "destructive" });
        return;
    }
    const newLog: LogKompetensi = {
        id: `log-kompetensi-${Date.now()}`,
        tanggal: new Date().toISOString(),
        kategori: logKompetensiFormData.kategori,
        nis: logKompetensiFormData.nis,
        catatan: logKompetensiFormData.catatan,
    };
    const allLogs = getSourceData('logKompetensiData', {});
    const userLogs = allLogs[logKompetensiFormData.nis] || [];
    allLogs[logKompetensiFormData.nis] = [newLog, ...userLogs];
    updateSourceData('logKompetensiData', allLogs);
    toast({ title: "Sukses", description: "Log pengembangan kompetensi berhasil disimpan." });
    setIsLogKompetensiDialogOpen(false);
  };

  const renderFeatureCard = (title: string, description: string, onClick?: () => void) => (
    <Card className="h-full hover:bg-muted/50 transition-colors flex flex-col">
        <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        {onClick && (
          <CardContent className="mt-auto">
            <Button onClick={onClick} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4"/> Kelola
            </Button>
          </CardContent>
        )}
    </Card>
  );

  if (isLoading) {
    return <div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Bimbingan Siswa</h2>
        <p className="text-muted-foreground">
          Kelola tugas pokok pendampingan Anda untuk setiap siswa binaan.
        </p>
      </div>

      <Tabs defaultValue="kompetensi" className="w-full">
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
                    {renderFeatureCard("Pantau Perkembangan Belajar", "Lihat rekap nilai, kehadiran, dan kemajuan siswa di setiap mata pelajaran.", () => handleOpenLogAkademikDialog("Pantau Perkembangan Belajar"))}
                    {renderFeatureCard("Identifikasi Kesulitan Akademik", "Gunakan data untuk menemukan siswa yang memerlukan bantuan atau bimbingan tambahan.", () => handleOpenLogAkademikDialog("Identifikasi Kesulitan Akademik"))}
                    {renderFeatureCard("Koordinasi dengan Guru Mapel", "Akses catatan dari guru mata pelajaran dan fasilitasi komunikasi untuk solusi bersama.", () => handleOpenLogAkademikDialog("Koordinasi dengan Guru Mapel"))}
                    {renderFeatureCard("Rencana Pembelajaran Individual", "Buat dan kelola rencana bimbingan khusus untuk siswa dengan kebutuhan tertentu.", () => handleOpenLogAkademikDialog("Rencana Pembelajaran Individual"))}
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
                    {renderFeatureCard("Catat Prestasi Siswa", "Validasi prestasi akademik maupun non-akademik yang diraih siswa.", () => setIsPrestasiDialogOpen(true))}
                    
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="text-base">Bimbingan Karier & PKL</CardTitle>
                        <CardDescription className="text-sm">Kelola kesiapan siswa untuk Praktik Kerja Lapangan (PKL).</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start"><PlusCircle className="mr-2 h-4 w-4" /> Pilih Siswa...</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Cari siswa binaan..." />
                              <CommandList>
                                <CommandEmpty>Tidak ada siswa ditemukan.</CommandEmpty>
                                <CommandGroup>
                                  {siswaBinaan.map((siswa) => (
                                    <CommandItem key={siswa.id} onSelect={() => handleOpenPklDialog(siswa)}>
                                      {siswa.nama}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </CardContent>
                    </Card>

                    {renderFeatureCard("Motivasi & Pengembangan Diri", "Berikan catatan motivasi dan rekomendasikan peluang pengembangan seperti lomba atau seminar.", () => handleOpenLogKompetensiDialog("Motivasi & Pengembangan Diri"))}
                    {renderFeatureCard("Pemetaan Minat & Bakat", "Dokumentasikan minat dan bakat siswa sebagai dasar pengarahan kegiatan ekstrakurikuler.", () => handleOpenLogKompetensiDialog("Pemetaan Minat & Bakat"))}
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
                    {renderFeatureCard("Bimbingan Perilaku Positif", "Catat sesi konseling atau bimbingan terkait etika, sopan santun, dan perilaku sosial.", () => setIsLogKarakterDialogOpen(true))}
                    {renderFeatureCard("Berikan Teladan (Role Model)", "Dokumentasikan kegiatan positif yang bisa menjadi contoh bagi siswa lain.")}
                    {renderFeatureCard("Kolaborasi dengan Orang Tua", "Akses rekapitulasi performa siswa sebagai bahan diskusi dengan orang tua/wali.")}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* --- Dialogs --- */}

      {/* Dialog Catat Prestasi */}
      <Dialog open={isPrestasiDialogOpen} onOpenChange={setIsPrestasiDialogOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Catat Prestasi Siswa</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label>Pilih Siswa</Label>
                      <Select onValueChange={nis => setPrestasiFormData(p => ({...p, nis}))}>
                          <SelectTrigger><SelectValue placeholder="Pilih siswa binaan..." /></SelectTrigger>
                          <SelectContent>
                              {siswaBinaan.map(s => <SelectItem key={s.id} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="deskripsi">Deskripsi Prestasi</Label>
                      <Input id="deskripsi" placeholder="Contoh: Juara 1 LKS tingkat Provinsi" onChange={e => setPrestasiFormData(p => ({...p, deskripsi: e.target.value}))}/>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="tingkat">Tingkat</Label>
                      <Select onValueChange={tingkat => setPrestasiFormData(p => ({...p, tingkat}))}>
                          <SelectTrigger id="tingkat"><SelectValue placeholder="Pilih tingkat..." /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Sekolah">Sekolah</SelectItem>
                              <SelectItem value="Kabupaten/Kota">Kabupaten/Kota</SelectItem>
                              <SelectItem value="Provinsi">Provinsi</SelectItem>
                              <SelectItem value="Nasional">Nasional</SelectItem>
                              <SelectItem value="Internasional">Internasional</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSavePrestasi}>Simpan Prestasi</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Dialog Kelola PKL */}
      <Dialog open={isPklDialogOpen} onOpenChange={setIsPklDialogOpen}>
          <DialogContent>
              <DialogHeader>
                <DialogTitle>Kelola Kesiapan PKL</DialogTitle>
                <DialogDescription>Untuk siswa: {selectedSiswaPkl?.nama}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="status-pkl">Status</Label>
                      <Select value={pklFormData.status} onValueChange={status => setPklFormData({...pklFormData, status})}>
                          <SelectTrigger id="status-pkl"><SelectValue/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Belum Siap">Belum Siap</SelectItem>
                              <SelectItem value="Proses Seleksi">Proses Seleksi</SelectItem>
                              <SelectItem value="Siap Berangkat">Siap Berangkat</SelectItem>
                              <SelectItem value="Sedang PKL">Sedang PKL</SelectItem>
                              <SelectItem value="Selesai PKL">Selesai PKL</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="perusahaan">Perusahaan (Jika sudah ada)</Label>
                      <Input id="perusahaan" value={pklFormData.perusahaan || ''} onChange={e => setPklFormData({...pklFormData, perusahaan: e.target.value})} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="progres">Progres Kesiapan (%)</Label>
                      <Input id="progres" type="number" min="0" max="100" value={pklFormData.progres || 0} onChange={e => setPklFormData({...pklFormData, progres: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan-pkl">Catatan Pendamping</Label>
                      <Textarea id="catatan-pkl" value={pklFormData.catatan || ''} onChange={e => setPklFormData({...pklFormData, catatan: e.target.value})} />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSavePkl}>Simpan Data PKL</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Dialog Log Bimbingan Karakter */}
      <Dialog open={isLogKarakterDialogOpen} onOpenChange={setIsLogKarakterDialogOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Catat Log Bimbingan Perilaku</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label>Pilih Siswa</Label>
                      <Select onValueChange={nis => setLogKarakterFormData(p => ({...p, nis}))}>
                          <SelectTrigger><SelectValue placeholder="Pilih siswa binaan..." /></SelectTrigger>
                          <SelectContent>
                              {siswaBinaan.map(s => <SelectItem key={s.id} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="kategori-log">Kategori Bimbingan</Label>
                      <Input id="kategori-log" placeholder="Contoh: Etika, Disiplin, Sosial" onChange={e => setLogKarakterFormData(p => ({...p, kategori: e.target.value}))}/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan-log">Catatan Sesi</Label>
                      <Textarea id="catatan-log" placeholder="Tuliskan ringkasan sesi bimbingan atau konseling di sini..." onChange={e => setLogKarakterFormData(p => ({...p, catatan: e.target.value}))}/>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSaveLogKarakter}>Simpan Log</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Dialog Log Bimbingan Akademik */}
      <Dialog open={isLogAkademikDialogOpen} onOpenChange={setIsLogAkademikDialogOpen}>
          <DialogContent>
              <DialogHeader>
                <DialogTitle>Catat Log Pendampingan Akademik</DialogTitle>
                <DialogDescription>Kategori: {logAkademikFormData.kategori}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label>Pilih Siswa</Label>
                      <Select onValueChange={nis => setLogAkademikFormData(p => ({...p, nis}))}>
                          <SelectTrigger><SelectValue placeholder="Pilih siswa binaan..." /></SelectTrigger>
                          <SelectContent>
                              {siswaBinaan.map(s => <SelectItem key={s.id} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan-log-akademik">Catatan / Rencana Tindak Lanjut</Label>
                      <Textarea 
                        id="catatan-log-akademik" 
                        placeholder="Tuliskan ringkasan hasil pemantauan, identifikasi masalah, atau rencana tindak lanjut..." 
                        onChange={e => setLogAkademikFormData(p => ({...p, catatan: e.target.value}))}
                        rows={5}
                      />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSaveLogAkademik}>Simpan Log</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Dialog Log Pengembangan Kompetensi */}
      <Dialog open={isLogKompetensiDialogOpen} onOpenChange={setIsLogKompetensiDialogOpen}>
          <DialogContent>
              <DialogHeader>
                <DialogTitle>Catat Log Pengembangan Kompetensi</DialogTitle>
                <DialogDescription>Kategori: {logKompetensiFormData.kategori}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label>Pilih Siswa</Label>
                      <Select onValueChange={nis => setLogKompetensiFormData(p => ({...p, nis}))}>
                          <SelectTrigger><SelectValue placeholder="Pilih siswa binaan..." /></SelectTrigger>
                          <SelectContent>
                              {siswaBinaan.map(s => <SelectItem key={s.id} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan-log-kompetensi">Catatan / Rekomendasi</Label>
                      <Textarea 
                        id="catatan-log-kompetensi" 
                        placeholder="Tuliskan hasil pemetaan minat bakat, atau rekomendasi kegiatan pengembangan diri..." 
                        onChange={e => setLogKompetensiFormData(p => ({...p, catatan: e.target.value}))}
                        rows={5}
                      />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSaveLogKompetensi}>Simpan Log</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
