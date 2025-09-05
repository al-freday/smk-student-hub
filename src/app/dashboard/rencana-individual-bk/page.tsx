
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, GraduationCap, Briefcase, User } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";


// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface Kelas { id: number; nama: string; }
interface CatatanRencana {
  id: string;
  tanggal: string;
  nis: string;
  kategori: 'Akademik' | 'Karier' | 'Pribadi/Sosial';
  catatan: string;
  guruPencatat: string;
}

export default function RencanaIndividualBkPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [catatan, setCatatan] = useState<CatatanRencana[]>([]);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CatatanRencana>>({});
  const [selectedKelas, setSelectedKelas] = useState('');

  const loadData = useCallback(() => {
    const user = getSourceData('currentUser', null);
    if (!user) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    setSiswa(getSourceData('siswaData', []));
    setDaftarKelas(getSourceData('kelasData', []));
    setCatatan(getSourceData('rencanaIndividualData', []));
  }, [router]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);
  
  const catatanBySiswa = useMemo(() => {
    return catatan.reduce((acc, item) => {
        if (!acc[item.nis]) {
            acc[item.nis] = [];
        }
        acc[item.nis].push(item);
        acc[item.nis].sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        return acc;
    }, {} as Record<string, CatatanRencana[]>);
  }, [catatan]);

  const siswaDiKelas = useMemo(() => {
    if (!selectedKelas) return [];
    return siswa.filter(s => s.kelas === selectedKelas);
  }, [selectedKelas, siswa]);


  const handleSave = () => {
    if (!formData.nis || !formData.kategori || !formData.catatan) {
      toast({ title: "Gagal", description: "Siswa, kategori, dan catatan harus diisi.", variant: "destructive" });
      return;
    }

    const newCatatan: CatatanRencana = {
      id: `rencana-${Date.now()}`,
      tanggal: format(new Date(), 'yyyy-MM-dd'),
      nis: formData.nis,
      kategori: formData.kategori,
      catatan: formData.catatan,
      guruPencatat: currentUser?.nama || "Guru BK",
    };
    
    const currentData = getSourceData('rencanaIndividualData', []);
    updateSourceData('rencanaIndividualData', [newCatatan, ...currentData]);
    toast({ title: "Sukses", description: "Catatan perencanaan individual berhasil disimpan." });
    setIsDialogOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    const updatedData = catatan.filter(c => c.id !== id);
    updateSourceData('rencanaIndividualData', updatedData);
    toast({ title: "Dihapus", description: "Catatan telah dihapus." });
    loadData();
  };
  
  const getKategoriIcon = (kategori: CatatanRencana['kategori']) => {
      switch(kategori) {
          case 'Akademik': return <GraduationCap className="h-4 w-4" />;
          case 'Karier': return <Briefcase className="h-4 w-4" />;
          case 'Pribadi/Sosial': return <User className="h-4 w-4" />;
      }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Perencanaan Individual & Karier</h2>
        <p className="text-muted-foreground">
          Dokumentasikan sesi bimbingan perencanaan akademik, karier, dan pribadi-sosial siswa.
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Riwayat Konseling Perencanaan Individual</CardTitle>
            <CardDescription>Catatan sesi konseling yang telah dilakukan, dikelompokkan per siswa.</CardDescription>
          </div>
          <Button onClick={() => { setFormData({}); setSelectedKelas(''); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Catat Sesi Baru
          </Button>
        </CardHeader>
        <CardContent>
          {Object.keys(catatanBySiswa).length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-2">
              {Object.keys(catatanBySiswa).map(nis => {
                const siswaData = siswa.find(s => s.nis === nis);
                const catatanSiswa = catatanBySiswa[nis];
                return (
                  <AccordionItem value={nis} key={nis} className="border rounded-lg">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="text-left">
                            <p className="font-semibold">{siswaData?.nama || 'Siswa tidak ditemukan'}</p>
                            <p className="text-sm text-muted-foreground">{siswaData?.kelas || ''}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <div className="space-y-3">
                        {catatanSiswa.map(item => (
                            <div key={item.id} className="p-3 rounded-md border bg-muted/50">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {getKategoriIcon(item.kategori)}
                                        <span>{item.kategori}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-muted-foreground">{format(new Date(item.tanggal), "dd MMM yyyy", { locale: id })}</p>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                </div>
                                <p className="text-sm">{item.catatan}</p>
                            </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>Belum ada catatan perencanaan individual yang disimpan.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Catat Sesi Perencanaan Individual</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Pilih Kelas</Label>
                    <Select value={selectedKelas} onValueChange={(value) => { setSelectedKelas(value); setFormData({...formData, nis: ''}); }}>
                        <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
                        <SelectContent>
                            {daftarKelas.map(k => (
                                <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label>Pilih Siswa</Label>
                    <Select value={formData.nis} onValueChange={(value) => setFormData({...formData, nis: value})} disabled={!selectedKelas}>
                        <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                        <SelectContent>
                            {siswaDiKelas.map(s => (
                                <SelectItem key={s.nis} value={s.nis}>{s.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori Konseling</Label>
                      <Select value={formData.kategori} onValueChange={(v: CatatanRencana['kategori']) => setFormData({...formData, kategori: v})}>
                        <SelectTrigger id="kategori"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Akademik">Akademik</SelectItem>
                            <SelectItem value="Karier">Karier</SelectItem>
                            <SelectItem value="Pribadi/Sosial">Pribadi/Sosial</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan">Catatan / Rencana Tindak Lanjut</Label>
                      <Textarea id="catatan" placeholder="Tuliskan hasil diskusi, rencana, atau target yang disepakati..." rows={5} onChange={e => setFormData({...formData, catatan: e.target.value})} />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSave}>Simpan Catatan</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
