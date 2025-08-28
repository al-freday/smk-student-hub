
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, BookText, Users, Calendar } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// --- Tipe Data ---
interface LayananBimbingan {
  id: string;
  tanggal: string;
  topik: string;
  sasaran: string; // Misal: "Kelas X TKJ 1", "Seluruh Kelas X"
  catatan: string;
  guruPencatat: string;
}

export default function LayananBimbinganBkPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [layanan, setLayanan] = useState<LayananBimbingan[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<LayananBimbingan>>({});

  const loadData = useCallback(() => {
    const user = getSourceData('currentUser', null);
    if (!user) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    setLayanan(getSourceData('layananBimbinganData', []).sort((a: LayananBimbingan, b: LayananBimbingan) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
  }, [router]);

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, [loadData]);

  const handleSave = () => {
    if (!formData.topik || !formData.sasaran || !formData.catatan) {
      toast({ title: "Gagal", description: "Semua kolom harus diisi.", variant: "destructive" });
      return;
    }

    const newLayanan: LayananBimbingan = {
      id: `layanan-${Date.now()}`,
      tanggal: format(new Date(), 'yyyy-MM-dd'),
      topik: formData.topik,
      sasaran: formData.sasaran,
      catatan: formData.catatan,
      guruPencatat: currentUser?.nama || "Guru BK",
    };
    
    const currentData = getSourceData('layananBimbinganData', []);
    updateSourceData('layananBimbinganData', [newLayanan, ...currentData]);
    toast({ title: "Sukses", description: "Catatan layanan bimbingan berhasil disimpan." });
    setIsDialogOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    const updatedData = layanan.filter(l => l.id !== id);
    updateSourceData('layananBimbinganData', updatedData);
    toast({ title: "Dihapus", description: "Catatan layanan telah dihapus." });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Layanan Dasar Bimbingan</h2>
        <p className="text-muted-foreground">
          Dokumentasikan layanan bimbingan klasikal atau kelompok yang telah Anda berikan.
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Riwayat Layanan Bimbingan</CardTitle>
            <CardDescription>Catatan program bimbingan yang telah dilaksanakan.</CardDescription>
          </div>
          <Button onClick={() => { setFormData({}); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Catat Layanan Baru
          </Button>
        </CardHeader>
        <CardContent>
          {layanan.length > 0 ? (
            <div className="space-y-4">
              {layanan.map(item => (
                <Card key={item.id} className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2"><BookText className="h-5 w-5"/>{item.topik}</CardTitle>
                        <div className="text-xs text-muted-foreground mt-2 flex gap-4">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {format(new Date(item.tanggal), "dd MMMM yyyy", { locale: id })}</span>
                          <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {item.sasaran}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.catatan}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>Belum ada catatan layanan bimbingan yang disimpan.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Catat Layanan Bimbingan Baru</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="topik">Topik Bimbingan</Label>
                      <Input id="topik" placeholder="Contoh: Anti-Bullying, Manajemen Waktu" onChange={e => setFormData({...formData, topik: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="sasaran">Sasaran</Label>
                      <Input id="sasaran" placeholder="Contoh: Kelas X TKJ 1 & X TKJ 2" onChange={e => setFormData({...formData, sasaran: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan">Catatan / Ringkasan Materi</Label>
                      <Textarea id="catatan" placeholder="Tuliskan ringkasan singkat tentang materi atau hasil dari bimbingan..." rows={5} onChange={e => setFormData({...formData, catatan: e.target.value})} />
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
