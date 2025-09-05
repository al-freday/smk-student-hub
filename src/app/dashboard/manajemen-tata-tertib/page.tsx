
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserX, Shirt, Trash2, Speech, GraduationCap, WifiOff, School, ShieldAlert, BookMarked, Printer, PlusCircle, Edit, Save, Loader2 } from "lucide-react";
import { tataTertibData as initialTataTertibData } from "@/lib/tata-tertib-data";
import { Button } from "@/components/ui/button";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type TataTertib = typeof initialTataTertibData;
type KategoriTataTertib = keyof TataTertib;
type TingkatPelanggaran = 'ringan' | 'sedang' | 'berat';
interface Aturan { deskripsi: string; poin: number; id: number; }

const kategoriInfo: { [key in KategoriTataTertib]: { icon: React.ElementType, title: string, poin: string } } = {
  kehadiran: { icon: UserX, title: "Pelanggaran Kehadiran & Ketertiban", poin: "20 Poin Awal" },
  seragam: { icon: Shirt, title: "Pelanggaran Seragam & Penampilan", poin: "20 Poin Awal" },
  lingkungan: { icon: Trash2, title: "Pelanggaran Tata Tertib Kelas & Lingkungan", poin: "30 Poin Awal" },
  etika: { icon: Speech, title: "Pelanggaran Etika & Perilaku", poin: "40 Poin Awal" },
  akademik: { icon: GraduationCap, title: "Pelanggaran Akademik", poin: "20 Poin Awal" },
  teknologi: { icon: WifiOff, title: "Pelanggaran Teknologi & Media Sosial", poin: "20 Poin Awal" },
  kegiatan: { icon: School, title: "Pelanggaran Kegiatan Sekolah", poin: "30 Poin Awal" },
  hukum: { icon: ShieldAlert, title: "Pelanggaran Berat Terkait Hukum", poin: "40 Poin Awal" },
};

const getPoinBadgeVariant = (poin: number) => {
    if (poin >= 30) return "destructive";
    if (poin >= 15) return "secondary";
    return "outline";
};

export default function ManajemenTataTertibPage() {
  const { toast } = useToast();
  const [tataTertib, setTataTertib] = useState<TataTertib | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Dialog States ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Aturan | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<{ kategori: KategoriTataTertib, tingkat: TingkatPelanggaran, ruleId: number } | null>(null);
  const [formData, setFormData] = useState<{ deskripsi: string, poin: string | number, tingkat: TingkatPelanggaran | '' }>({});
  const [formCategory, setFormCategory] = useState<KategoriTataTertib | ''>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const savedData = await getSourceData('tataTertibData', null);
        if (savedData && Object.keys(savedData).length > 0) {
          setTataTertib(savedData);
        } else {
          await updateSourceData('tataTertibData', initialTataTertibData);
          setTataTertib(initialTataTertibData);
        }

        const role = localStorage.getItem('userRole');
        setUserRole(role);
    } catch (error) {
        toast({ title: "Gagal memuat data", variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (kategori: KategoriTataTertib, rule: Aturan | null = null, tingkat: TingkatPelanggaran | null = null) => {
    setFormCategory(kategori);
    setEditingRule(rule);
    if (rule && tingkat) {
      setFormData({ deskripsi: rule.deskripsi, poin: rule.poin, tingkat: tingkat });
    } else {
      setFormData({ deskripsi: '', poin: '', tingkat: '' });
    }
    setIsDialogOpen(true);
  };
  
  const handleSaveRule = () => {
    if (!formCategory || !formData.deskripsi || !formData.poin || !formData.tingkat || !tataTertib) {
      toast({ title: "Gagal", description: "Semua field harus diisi.", variant: "destructive" });
      return;
    }

    const poinValue = Number(formData.poin);
    if (isNaN(poinValue) || poinValue <= 0) {
       toast({ title: "Gagal", description: "Poin harus berupa angka positif.", variant: "destructive" });
       return;
    }

    const newState = JSON.parse(JSON.stringify(tataTertib)); // Deep copy
    const categoryRules = newState[formCategory];
    const targetTingkat = categoryRules[formData.tingkat!];

    if (editingRule) {
      // Update existing rule
      const ruleIndex = targetTingkat.findIndex((r: Aturan) => r.id === editingRule.id);
      if (ruleIndex > -1) {
        targetTingkat[ruleIndex] = { ...editingRule, deskripsi: formData.deskripsi, poin: poinValue };
      }
    } else {
      // Add new rule
      const newRule = { id: Date.now(), deskripsi: formData.deskripsi, poin: poinValue };
      targetTingkat.push(newRule);
    }
    setTataTertib(newState);

    toast({ title: "Sukses", description: "Aturan berhasil disimpan. Klik 'Simpan Perubahan' untuk menyimpan permanen." });
    setIsDialogOpen(false);
  };
  
  const handleDeleteRule = () => {
    if (!ruleToDelete || !tataTertib) return;
    const { kategori, tingkat, ruleId } = ruleToDelete;

    const newState = JSON.parse(JSON.stringify(tataTertib));
    newState[kategori][tingkat] = newState[kategori][tingkat].filter((r: Aturan) => r.id !== ruleId);
    setTataTertib(newState);

    toast({ title: "Aturan Dihapus", description: "Jangan lupa simpan perubahan." });
    setRuleToDelete(null);
  };

  const handleSaveChanges = async () => {
    if (!tataTertib) return;
    await updateSourceData('tataTertibData', tataTertib);
    toast({ title: "Perubahan Disimpan", description: "Buku tata tertib telah berhasil diperbarui." });
  };

  const handlePrint = () => {
    window.print();
  };

  const canEdit = userRole === 'wakasek_kesiswaan';

  if (isLoading || !tataTertib) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Buku Tata Tertib & Poin Pelanggaran</h2>
          <p className="text-muted-foreground">
            Daftar resmi peraturan sekolah beserta bobot poin sanksi untuk setiap pelanggaran.
          </p>
        </div>
        <div className="flex gap-2">
            {canEdit && <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Simpan Perubahan</Button>}
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Cetak
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <BookMarked className="h-8 w-8" />
              </div>
              <div>
                <CardTitle>Sistem Poin Sanksi</CardTitle>
                <CardDescription>
                  Poin pelanggaran digunakan sebagai dasar untuk tindakan pembinaan dan sanksi lebih lanjut.
                </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold">Pelanggaran Ringan (1-10 Poin)</h4>
                <p className="text-sm text-muted-foreground">Teguran lisan dan pencatatan oleh guru piket atau wali kelas.</p>
            </div>
             <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold">Pelanggaran Sedang (11-20 Poin)</h4>
                <p className="text-sm text-muted-foreground">Pembinaan oleh wali kelas dan pemanggilan orang tua jika berulang.</p>
            </div>
             <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold">Pelanggaran Berat (21-40 Poin)</h4>
                <p className="text-sm text-muted-foreground">Penanganan langsung oleh Guru BK/Wakasek, sanksi khusus, hingga skorsing.</p>
            </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-4">
        {(Object.keys(tataTertib) as KategoriTataTertib[]).map((kategori) => {
          const info = kategoriInfo[kategori];
          const Icon = info.icon;
          return (
            <AccordionItem value={kategori} key={kategori} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary rounded-md text-primary">
                        <Icon className="h-6 w-6"/>
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-lg">{info.title}</h3>
                        <p className="text-sm text-muted-foreground">{info.poin}</p>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="border-t p-4">
                    {canEdit && (
                        <div className="flex justify-end mb-4 print:hidden">
                            <Button size="sm" onClick={() => handleOpenDialog(kategori)}>
                               <PlusCircle className="mr-2 h-4 w-4"/> Tambah Aturan
                            </Button>
                        </div>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Tingkat</TableHead>
                                <TableHead>Deskripsi Pelanggaran</TableHead>
                                <TableHead className="text-center w-[100px]">Poin</TableHead>
                                {canEdit && <TableHead className="text-right print:hidden w-[120px]">Aksi</TableHead>}
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {Object.entries(tataTertib[kategori]).map(([tingkat, items]) => (
                                (items as Aturan[]).map((item, index) => (
                                     <TableRow key={`${kategori}-${tingkat}-${index}`}>
                                        {index === 0 && (
                                            <TableCell rowSpan={(items as Aturan[]).length} className="font-medium capitalize align-top">
                                                {tingkat}
                                            </TableCell>
                                        )}
                                        <TableCell>{item.deskripsi}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getPoinBadgeVariant(item.poin)}>{item.poin}</Badge>
                                        </TableCell>
                                        {canEdit && 
                                            <TableCell className="text-right print:hidden">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(kategori, item, tingkat as TingkatPelanggaran)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setRuleToDelete({ kategori, tingkat: tingkat as TingkatPelanggaran, ruleId: item.id })}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        }
                                    </TableRow>
                                ))
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
      
      {/* Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Aturan' : 'Tambah Aturan Baru'}</DialogTitle>
              <DialogDescription>Untuk kategori: {kategoriInfo[formCategory as KategoriTataTertib]?.title}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi Pelanggaran</Label>
                <Input id="deskripsi" value={formData.deskripsi} onChange={(e) => setFormData(p => ({ ...p, deskripsi: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poin">Poin</Label>
                  <Input id="poin" type="number" value={String(formData.poin)} onChange={(e) => setFormData(p => ({ ...p, poin: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tingkat">Tingkat</Label>
                  <Select value={formData.tingkat} onValueChange={(v) => setFormData(p => ({ ...p, tingkat: v as TingkatPelanggaran }))}>
                    <SelectTrigger id="tingkat"><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ringan">Ringan</SelectItem>
                      <SelectItem value="sedang">Sedang</SelectItem>
                      <SelectItem value="berat">Berat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
              <Button onClick={handleSaveRule}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>

      <AlertDialog open={!!ruleToDelete} onOpenChange={() => setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus aturan dari daftar. Perubahan ini hanya bersifat sementara hingga Anda menekan tombol "Simpan Perubahan".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule}>Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
