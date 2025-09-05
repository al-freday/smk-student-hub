
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare, ShieldAlert, Trophy, Briefcase, Loader2, BookHeart, GraduationCap } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// --- Interface Definitions ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface Pelanggaran { id: string; tanggal: string; deskripsi: string; poin: number; }
interface Prestasi { id: string; tanggal: string; deskripsi: string; tingkat: string; }
interface LogBimbingan {
  id: string; tanggal: string; kategori: 'Akademik' | 'Karakter' | 'Karier' | 'Lainnya';
  catatan: string; guruPendamping: string;
}
interface StatusPKL {
    status: 'Belum Siap' | 'Siap Berangkat' | 'Sedang PKL' | 'Selesai';
    perusahaan: string;
    catatan: string;
    progres: number;
}
interface SiswaBinaan extends Siswa {
  totalPoin: number; totalPrestasi: number;
  pelanggaran: Pelanggaran[]; prestasi: Prestasi[];
  logBimbingan: LogBimbingan[]; pkl: StatusPKL;
}

export default function BimbinganSiswaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [siswaBinaan, setSiswaBinaan] = useState<SiswaBinaan[]>([]);
  
  // --- Dialog States ---
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [isPklDialogOpen, setIsPklDialogOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaBinaan | null>(null);
  const [logFormData, setLogFormData] = useState<{ kategori: LogBimbingan['kategori'] | '', catatan: string }>({ kategori: '', catatan: '' });
  const [pklFormData, setPklFormData] = useState<Partial<StatusPKL>>({});

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const user = getSourceData('currentUser', null);
      if (!user) { router.push('/'); return; }
      setCurrentUser(user);
      
      const teachersData = getSourceData('teachersData', {});
      const guruData = teachersData.guru_pendamping?.find((gp: any) => gp.nama === user.nama);
      const daftarNamaSiswaBinaan = guruData?.siswaBinaan || [];

      const allSiswa: Siswa[] = getSourceData('siswaData', []);
      const siswaPendampingan = allSiswa.filter(s => daftarNamaSiswaBinaan.includes(s.nama));

      const pelanggaranData: any[] = getSourceData('riwayatPelanggaran', []);
      const prestasiData: any[] = getSourceData('prestasiData', []);
      const logBimbinganData: { [nis: string]: LogBimbingan[] } = getSourceData('logBimbinganData', {});
      const pklData: { [nis: string]: StatusPKL } = getSourceData('pklData', {});

      const detailSiswaBinaan = siswaPendampingan.map(siswa => {
        const pelanggaranSiswa = pelanggaranData.filter(p => p.nis === siswa.nis).map(p => ({ id: `pelanggaran-${p.id}`, tanggal: p.tanggal, deskripsi: p.pelanggaran, poin: p.poin }));
        const prestasiSiswa = prestasiData.filter(p => p.nis === siswa.nis).map(p => ({ id: `prestasi-${p.id}`, tanggal: p.tanggal, deskripsi: p.deskripsi, tingkat: p.tingkat }));
        const totalPoin = pelanggaranSiswa.reduce((sum, p) => sum + (p.poin || 0), 0);
        
        const defaultPklStatus: StatusPKL = { status: 'Belum Siap', perusahaan: '', catatan: '', progres: 10 };
        
        return { 
          ...siswa, totalPoin, totalPrestasi: prestasiSiswa.length,
          pelanggaran: pelanggaranSiswa.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()),
          prestasi: prestasiSiswa.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()),
          logBimbingan: (logBimbinganData[siswa.nis] || []).sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()),
          pkl: pklData[siswa.nis] || defaultPklStatus,
        };
      }).sort((a, b) => a.nama.localeCompare(b.nama));
      
      setSiswaBinaan(detailSiswaBinaan);

    } catch (error) { console.error("Gagal memuat data Bimbingan Siswa:", error); } 
    finally { setIsLoading(false); }
  }, [router]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  // --- Dialog Handlers ---
  const handleOpenLogDialog = (siswa: SiswaBinaan) => { setSelectedSiswa(siswa); setLogFormData({ kategori: '', catatan: '' }); setIsLogDialogOpen(true); };
  const handleOpenPklDialog = (siswa: SiswaBinaan) => { setSelectedSiswa(siswa); setPklFormData(siswa.pkl); setIsPklDialogOpen(true); };

  const handleSaveLog = () => {
    if (!selectedSiswa || !logFormData.kategori || !logFormData.catatan) {
      toast({ title: "Gagal", description: "Kategori dan catatan bimbingan harus diisi.", variant: "destructive" }); return;
    }
    const newLog: LogBimbingan = {
      id: `log-${Date.now()}`, tanggal: new Date().toISOString(), kategori: logFormData.kategori,
      catatan: logFormData.catatan, guruPendamping: currentUser?.nama || "Guru Pendamping",
    };
    const allLogs = getSourceData('logBimbinganData', {});
    const studentLogs = allLogs[selectedSiswa.nis] || [];
    updateSourceData('logBimbinganData', { ...allLogs, [selectedSiswa.nis]: [newLog, ...studentLogs] });
    toast({ title: "Sukses", description: `Log bimbingan untuk ${selectedSiswa.nama} berhasil disimpan.` });
    setIsLogDialogOpen(false);
    loadData();
  };

  const handleSavePkl = () => {
    if (!selectedSiswa || !pklFormData.status) {
        toast({ title: "Gagal", description: "Status PKL harus diisi.", variant: "destructive" }); return;
    }
    const allPkl = getSourceData('pklData', {});
    const updatedPklData = { ...allPkl, [selectedSiswa.nis]: { ...selectedSiswa.pkl, ...pklFormData } };
    updateSourceData('pklData', updatedPklData);
    toast({ title: "Sukses", description: `Status PKL untuk ${selectedSiswa.nama} berhasil diperbarui.` });
    setIsPklDialogOpen(false);
    loadData();
  };
  
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
        <h2 className="text-3xl font-bold tracking-tight">Bimbingan Siswa</h2>
        <p className="text-muted-foreground">Kelola dan catat perkembangan setiap siswa binaan Anda.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Daftar Siswa Binaan</CardTitle>
            <CardDescription>Pilih siswa untuk melihat detail dan mengelola catatan bimbingan serta kesiapan PKL.</CardDescription>
        </CardHeader>
        <CardContent>
            {siswaBinaan.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-2">
                    {siswaBinaan.map(siswa => (
                        <AccordionItem value={siswa.nis} key={siswa.nis} className="border rounded-lg">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <div className="flex items-center gap-4 w-full">
                                    <Avatar><AvatarFallback>{siswa.nama.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold">{siswa.nama}</p>
                                        <p className="text-sm text-muted-foreground">{siswa.kelas}</p>
                                    </div>
                                    <div className="hidden sm:flex gap-4 pr-4">
                                        <div className="text-center"><p className="font-bold text-destructive">{siswa.totalPoin}</p><p className="text-xs text-muted-foreground">Poin</p></div>
                                        <div className="text-center"><p className="font-bold text-primary">{siswa.totalPrestasi}</p><p className="text-xs text-muted-foreground">Prestasi</p></div>
                                        <div className="text-center"><p className="font-bold">{siswa.logBimbingan.length}</p><p className="text-xs text-muted-foreground">Bimbingan</p></div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 border-t">
                                <Tabs defaultValue="bimbingan">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="bimbingan"><MessageSquare className="mr-2 h-4 w-4"/>Log Bimbingan</TabsTrigger>
                                        <TabsTrigger value="performa"><ShieldAlert className="mr-2 h-4 w-4"/>Performa Siswa</TabsTrigger>
                                        <TabsTrigger value="pkl"><Briefcase className="mr-2 h-4 w-4"/>Kesiapan Dunia Kerja (PKL)</TabsTrigger>
                                    </TabsList>

                                    {/* Log Bimbingan */}
                                    <TabsContent value="bimbingan" className="mt-4">
                                        <div className="flex justify-end mb-4">
                                            <Button onClick={() => handleOpenLogDialog(siswa)}><PlusCircle className="mr-2 h-4 w-4"/> Catat Bimbingan Baru</Button>
                                        </div>
                                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                            {siswa.logBimbingan.length > 0 ? siswa.logBimbingan.map(log => (
                                                <div key={log.id} className="p-3 rounded-md border bg-muted/50">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2"><Badge>{log.kategori}</Badge><p className="text-xs font-semibold">{log.guruPendamping}</p></div>
                                                        <p className="text-xs text-muted-foreground">{format(new Date(log.tanggal), "dd MMMM yyyy, HH:mm", { locale: id })}</p>
                                                    </div>
                                                    <p className="text-sm">{log.catatan}</p>
                                                </div>
                                            )) : <p className="text-center text-sm text-muted-foreground py-4">Belum ada catatan bimbingan.</p>}
                                        </div>
                                    </TabsContent>
                                    
                                    {/* Performa Siswa */}
                                    <TabsContent value="performa" className="mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">Riwayat Pelanggaran</h4>
                                                <ul className="space-y-2 max-h-80 overflow-y-auto pr-2 border p-2 rounded-md">
                                                    {siswa.pelanggaran.length > 0 ? siswa.pelanggaran.map(p => (
                                                        <li key={p.id} className="flex justify-between items-center text-sm">
                                                            <span>{p.deskripsi}</span><Badge variant="destructive">{p.poin} Poin</Badge>
                                                        </li>
                                                    )) : <p className="text-center text-sm text-muted-foreground py-4">Tidak ada riwayat pelanggaran.</p>}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Riwayat Prestasi</h4>
                                                 <ul className="space-y-2 max-h-80 overflow-y-auto pr-2 border p-2 rounded-md">
                                                    {siswa.prestasi.length > 0 ? siswa.prestasi.map(p => (
                                                        <li key={p.id} className="flex justify-between items-center text-sm">
                                                            <span>{p.deskripsi}</span><Badge variant="secondary">{p.tingkat}</Badge>
                                                        </li>
                                                    )) : <p className="text-center text-sm text-muted-foreground py-4">Tidak ada riwayat prestasi.</p>}
                                                </ul>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Kesiapan PKL */}
                                    <TabsContent value="pkl" className="mt-4">
                                         <div className="flex justify-end mb-4">
                                            <Button onClick={() => handleOpenPklDialog(siswa)}>Update Status PKL</Button>
                                        </div>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Status Kesiapan PKL</CardTitle>
                                                <CardDescription>Pemantauan progres kesiapan siswa untuk Praktik Kerja Lapangan.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Label>Progres Kesiapan</Label>
                                                        <span className="text-sm font-bold">{siswa.pkl.progres}%</span>
                                                    </div>
                                                    <Progress value={siswa.pkl.progres} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div><p className="font-semibold">Status Saat Ini:</p><Badge>{siswa.pkl.status}</Badge></div>
                                                    <div><p className="font-semibold">Perusahaan Tujuan:</p><p>{siswa.pkl.perusahaan || '-'}</p></div>
                                                </div>
                                                <div><p className="font-semibold">Catatan Pendamping:</p><p className="text-sm text-muted-foreground">{siswa.pkl.catatan || 'Tidak ada catatan.'}</p></div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center text-muted-foreground py-10"><p>Anda belum memiliki siswa binaan. Hubungi Wakasek Kesiswaan untuk penugasan.</p></div>
            )}
        </CardContent>
      </Card>
      
      {/* Dialog Pencatatan Bimbingan */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Catat Sesi Bimbingan</DialogTitle>
                  <DialogDescription>Buat catatan untuk sesi bimbingan dengan <span className="font-semibold">{selectedSiswa?.nama}</span>.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori Bimbingan</Label>
                      <Select value={logFormData.kategori} onValueChange={(v) => setLogFormData({...logFormData, kategori: v as any})}>
                          <SelectTrigger id="kategori"><SelectValue placeholder="Pilih kategori"/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Akademik"><GraduationCap className="inline-block mr-2 h-4 w-4"/>Akademik</SelectItem>
                              <SelectItem value="Karakter"><BookHeart className="inline-block mr-2 h-4 w-4"/>Karakter & Perilaku</SelectItem>
                              <SelectItem value="Karier">Karier & PKL</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan">Catatan / Hasil Bimbingan</Label>
                      <Textarea id="catatan" value={logFormData.catatan} onChange={e => setLogFormData({...logFormData, catatan: e.target.value})} placeholder="Tuliskan ringkasan, hasil, atau rencana tindak lanjut..." rows={6}/>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSaveLog}>Simpan Log</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
       {/* Dialog Update PKL */}
      <Dialog open={isPklDialogOpen} onOpenChange={setIsPklDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Update Status PKL</DialogTitle>
                  <DialogDescription>Perbarui status kesiapan PKL untuk <span className="font-semibold">{selectedSiswa?.nama}</span>.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                   <div className="space-y-2">
                      <Label htmlFor="status-pkl">Status PKL</Label>
                      <Select value={pklFormData.status} onValueChange={(v: StatusPKL['status']) => setPklFormData({...pklFormData, status: v})}>
                          <SelectTrigger id="status-pkl"><SelectValue placeholder="Pilih status"/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Belum Siap">Belum Siap</SelectItem>
                              <SelectItem value="Siap Berangkat">Siap Berangkat</SelectItem>
                              <SelectItem value="Sedang PKL">Sedang PKL</SelectItem>
                              <SelectItem value="Selesai">Selesai</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="perusahaan">Perusahaan Tempat PKL</Label>
                      <Textarea id="perusahaan" value={pklFormData.perusahaan || ''} onChange={e => setPklFormData({...pklFormData, perusahaan: e.target.value})} placeholder="Nama perusahaan..." />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="progres">Progres Kesiapan (%)</Label>
                      <Input id="progres" type="number" min="0" max="100" value={pklFormData.progres || 0} onChange={e => setPklFormData({...pklFormData, progres: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan-pkl">Catatan Pendamping</Label>
                      <Textarea id="catatan-pkl" value={pklFormData.catatan || ''} onChange={e => setPklFormData({...pklFormData, catatan: e.target.value})} placeholder="Catatan mengenai perkembangan siswa..." rows={4}/>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSavePkl}>Simpan Status</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

    