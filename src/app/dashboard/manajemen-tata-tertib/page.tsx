
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Save, RefreshCw, Upload, Download, BookCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type KategoriTataTertib = 'Kerajinan' | 'Kerapian' | 'Perilaku';

interface TataTertib {
  id: number;
  deskripsi: string;
  poin: number;
  kategori: KategoriTataTertib;
}

const initialTataTertib: { [key in KategoriTataTertib]: TataTertib[] } = {
  Kerajinan: [],
  Kerapian: [],
  Perilaku: [],
};

const TATA_TERTIB_STORAGE_KEY = 'tataTertibData';

export default function ManajemenTataTertibPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tataTertib, setTataTertib] = useState(initialTataTertib);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TataTertib | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<TataTertib | null>(null);
  const [formData, setFormData] = useState<Partial<TataTertib>>({});

  const loadData = () => {
    try {
      const savedData = localStorage.getItem(TATA_TERTIB_STORAGE_KEY);
      setTataTertib(savedData ? JSON.parse(savedData) : initialTataTertib);
      toast({ title: "Data Dimuat", description: "Data tata tertib terbaru telah dimuat." });
    } catch (error) {
      toast({ title: "Gagal Memuat Data", description: "Terjadi kesalahan saat memuat data tata tertib.", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveChanges = () => {
    localStorage.setItem(TATA_TERTIB_STORAGE_KEY, JSON.stringify(tataTertib));
    toast({ title: "Perubahan Disimpan", description: "Semua perubahan pada tata tertib telah disimpan." });
  };

  const handleOpenDialog = (rule: TataTertib | null = null, kategori?: KategoriTataTertib) => {
    setEditingRule(rule);
    setFormData(rule || { kategori });
    setIsDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (!formData.deskripsi || !formData.poin || !formData.kategori) {
      toast({ title: "Gagal", description: "Harap lengkapi semua kolom.", variant: "destructive" });
      return;
    }

    const kategori = formData.kategori;
    let updatedRules;

    if (editingRule) {
      updatedRules = tataTertib[kategori].map(r => r.id === editingRule.id ? { ...r, ...formData } as TataTertib : r);
    } else {
      const allIds = Object.values(tataTertib).flat().map(r => r.id);
      const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
      const newRule = { ...formData, id: newId } as TataTertib;
      updatedRules = [...tataTertib[kategori], newRule];
    }

    setTataTertib(prev => ({ ...prev, [kategori]: updatedRules }));
    toast({ title: "Aturan Diperbarui", description: "Jangan lupa simpan perubahan untuk menjadikannya permanen." });
    setIsDialogOpen(false);
  };

  const handleDeleteRule = () => {
    if (!ruleToDelete) return;
    const kategori = ruleToDelete.kategori;
    const updatedRules = tataTertib[kategori].filter(r => r.id !== ruleToDelete.id);
    setTataTertib(prev => ({ ...prev, [kategori]: updatedRules }));
    toast({ title: "Aturan Dihapus", description: `Aturan telah dihapus dari sesi ini.` });
    setRuleToDelete(null);
  };
  
  const handleExport = () => {
    const allRules = Object.values(tataTertib).flat();
    if (allRules.length === 0) {
        toast({ title: "Gagal", description: "Tidak ada data untuk diekspor.", variant: "destructive" });
        return;
    }
    const headers = ['id', 'kategori', 'deskripsi', 'poin'];
    const csvContent = [
        headers.join(','),
        ...allRules.map(r => [r.id, r.kategori, `"${r.deskripsi.replace(/"/g, '""')}"`, r.poin].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'tata_tertib.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Ekspor Berhasil", description: "Data tata tertib telah diunduh." });
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').slice(1);
        const newTataTertib = { ...initialTataTertib };
        let importedCount = 0;
        
        rows.forEach(row => {
            if (!row.trim()) return;
            const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/"/g, '')) || [];
            const [id, kategori, deskripsi, poin] = columns;
            
            if (id && kategori && deskripsi && poin && Object.keys(newTataTertib).includes(kategori)) {
                newTataTertib[kategori as KategoriTataTertib].push({
                    id: parseInt(id),
                    kategori: kategori as KategoriTataTertib,
                    deskripsi: deskripsi,
                    poin: parseInt(poin),
                });
                importedCount++;
            }
        });
        setTataTertib(newTataTertib);
        toast({ title: "Impor Selesai", description: `${importedCount} data diimpor. Tekan 'Simpan Perubahan' untuk menyimpan.` });
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };


  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Tata Tertib</h2>
          <p className="text-muted-foreground">Kelola peraturan sekolah dan poin pelanggaran.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Simpan Perubahan</Button>
            <Button variant="outline" onClick={loadData}><RefreshCw className="mr-2 h-4 w-4"/>Muat Ulang Data</Button>
        </div>
      </div>
      <div className="flex justify-end gap-2">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImport} accept=".csv" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Impor</Button>
            <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Unduh</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {(Object.keys(tataTertib) as KategoriTataTertib[]).map(kategori => (
          <Card key={kategori}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><BookCheck /> {kategori}</CardTitle>
                <CardDescription>Peraturan terkait {kategori.toLowerCase()}.</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleOpenDialog(null, kategori)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deskripsi Pelanggaran</TableHead>
                    <TableHead className="text-center w-[60px]">Poin</TableHead>
                    <TableHead className="text-right w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tataTertib[kategori].length > 0 ? (
                    tataTertib[kategori].map(rule => (
                      <TableRow key={rule.id}>
                        <TableCell className="align-top">{rule.deskripsi}</TableCell>
                        <TableCell className="text-center align-top"><Badge variant="destructive">{rule.poin}</Badge></TableCell>
                        <TableCell className="text-right align-top">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rule)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setRuleToDelete(rule)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">Belum ada aturan.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{editingRule ? 'Edit' : 'Tambah'} Aturan Tata Tertib</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea id="deskripsi" value={formData.deskripsi || ''} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Contoh: Datang terlambat lebih dari 15 menit"/>
               </div>
                <div className="space-y-2">
                  <Label htmlFor="poin">Poin Pelanggaran</Label>
                  <Input id="poin" type="number" value={formData.poin || ''} onChange={(e) => setFormData({ ...formData, poin: parseInt(e.target.value) || 0 })} placeholder="Contoh: 5"/>
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
                  <AlertDialogDescription>Tindakan ini akan menghapus aturan secara permanen setelah Anda menyimpan perubahan.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRule}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
