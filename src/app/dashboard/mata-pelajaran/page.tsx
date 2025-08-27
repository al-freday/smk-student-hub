
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookCopy, Edit, PlusCircle, Save, Trash2 } from "lucide-react";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { initialKurikulumData } from "@/lib/kurikulum-data";

// --- Interface Definitions ---
interface Subject {
  id: number;
  nama: string;
  catatan?: string;
}

interface Kelompok {
  nama: string;
  subjects: Subject[];
}

interface Tingkatan {
  nama: string;
  deskripsi: string;
  kelompok: Kelompok[];
}

type Kurikulum = {
  [key: string]: Tingkatan;
};

type TingkatKey = keyof typeof initialKurikulumData;
type KelompokKey = 'A. Kelompok Mata Pelajaran Umum' | 'B. Kelompok Mata Pelajaran Kejuruan';


export default function MataPelajaranPage() {
  const { toast } = useToast();
  const [kurikulum, setKurikulum] = useState<Kurikulum>({});
  
  // --- Dialog & Form States ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<{ subject: Subject, tingkat: TingkatKey, kelompok: KelompokKey } | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({});
  const [formLocation, setFormLocation] = useState<{ tingkat: TingkatKey | '', kelompok: KelompokKey | '' }>({ tingkat: '', kelompok: '' });

  useEffect(() => {
    // Load data from localStorage or initialize with default
    const savedData = getSourceData('kurikulumData', null);
    if (savedData) {
      setKurikulum(savedData);
    } else {
      setKurikulum(initialKurikulumData);
      updateSourceData('kurikulumData', initialKurikulumData); // Save initial data
    }
  }, []);

  const handleOpenDialog = (subject: Subject | null = null, tingkat: TingkatKey | null = null, kelompok: KelompokKey | null = null) => {
    setEditingSubject(subject);
    setFormData(subject || { nama: "", catatan: "" });
    if (subject && tingkat && kelompok) {
      setFormLocation({ tingkat, kelompok });
    } else {
      setFormLocation({ tingkat: '', kelompok: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSaveSubject = () => {
    if (!formData.nama || !formLocation.tingkat || !formLocation.kelompok) {
      toast({ title: "Gagal", description: "Harap lengkapi semua kolom.", variant: "destructive" });
      return;
    }
    
    setKurikulum(prevKurikulum => {
      const newKurikulum = JSON.parse(JSON.stringify(prevKurikulum));
      const targetKelompok = newKurikulum[formLocation.tingkat!].kelompok.find(k => k.nama === formLocation.kelompok);

      if (targetKelompok) {
        if (editingSubject) {
          // Update existing subject
          const subjectIndex = targetKelompok.subjects.findIndex(s => s.id === editingSubject.id);
          if (subjectIndex > -1) {
            targetKelompok.subjects[subjectIndex] = { ...editingSubject, ...formData };
          }
        } else {
          // Add new subject
          const newId = Date.now();
          targetKelompok.subjects.push({ id: newId, ...formData } as Subject);
        }
      }
      return newKurikulum;
    });

    toast({ title: "Sukses", description: "Mata pelajaran diperbarui. Jangan lupa simpan perubahan." });
    setIsDialogOpen(false);
  };

  const handleDeleteSubject = () => {
    if (!subjectToDelete) return;
    const { subject, tingkat, kelompok } = subjectToDelete;

    setKurikulum(prevKurikulum => {
        const newKurikulum = JSON.parse(JSON.stringify(prevKurikulum));
        const targetKelompok = newKurikulum[tingkat].kelompok.find(k => k.nama === kelompok);
        if (targetKelompok) {
            targetKelompok.subjects = targetKelompok.subjects.filter(s => s.id !== subject.id);
        }
        return newKurikulum;
    });
    
    toast({ title: "Mata Pelajaran Dihapus", description: `${subject.nama} telah dihapus dari sesi ini.` });
    setSubjectToDelete(null);
  };

  const handleSaveChanges = () => {
    updateSourceData('kurikulumData', kurikulum);
    toast({ title: "Perubahan Disimpan", description: "Struktur kurikulum dan mata pelajaran telah berhasil disimpan." });
  };
  
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Mata Pelajaran</h2>
          <p className="text-muted-foreground">
            Kelola daftar mata pelajaran berdasarkan struktur kurikulum yang berlaku.
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4"/>Tambah Mapel</Button>
            <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Simpan Perubahan</Button>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="kelas_x">
        {(Object.keys(kurikulum) as Array<keyof Kurikulum>).map((key) => {
          const tingkatan = kurikulum[key];
          return (
            <AccordionItem value={key} key={key} className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="p-4 hover:no-underline bg-muted/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary"><BookCopy className="h-6 w-6"/></div>
                    <div className="text-left">
                        <h3 className="font-semibold text-xl">{tingkatan.nama}</h3>
                        <p className="text-sm text-muted-foreground font-normal">{tingkatan.deskripsi}</p>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="border-t p-6 grid md:grid-cols-2 gap-x-6 gap-y-8">
                  {tingkatan.kelompok.map((kelompok) => (
                    <div key={kelompok.nama}>
                      <h4 className="font-semibold text-lg mb-4">{kelompok.nama}</h4>
                      <ul className="space-y-3">
                        {kelompok.subjects.map((subject) => (
                           <li key={subject.id} className="flex items-center justify-between group">
                                <div>
                                    <span className="text-muted-foreground">{subject.nama}</span>
                                    {subject.catatan && <p className="text-xs italic text-primary/80 pl-2">- {subject.catatan}</p>}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(subject, key as TingkatKey, kelompok.nama as KelompokKey)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setSubjectToDelete({ subject, tingkat: key as TingkatKey, kelompok: kelompok.nama as KelompokKey })}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                           </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      
      {/* Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>{editingSubject ? "Edit" : "Tambah"} Mata Pelajaran</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="nama">Nama Mata Pelajaran</Label>
                      <Input id="nama" value={formData.nama || ''} onChange={e => setFormData({...formData, nama: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="catatan">Catatan (Opsional)</Label>
                      <Input id="catatan" value={formData.catatan || ''} onChange={e => setFormData({...formData, catatan: e.target.value})} />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="tingkat">Tingkat Kelas</Label>
                           <Select value={formLocation.tingkat} onValueChange={(v) => setFormLocation({...formLocation, tingkat: v as TingkatKey})} disabled={!!editingSubject}>
                               <SelectTrigger id="tingkat"><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                               <SelectContent>
                                   {Object.keys(kurikulum).map(key => <SelectItem key={key} value={key}>{kurikulum[key].nama}</SelectItem>)}
                               </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="kelompok">Kelompok</Label>
                           <Select value={formLocation.kelompok} onValueChange={(v) => setFormLocation({...formLocation, kelompok: v as KelompokKey})} disabled={!!editingSubject}>
                               <SelectTrigger id="kelompok"><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="A. Kelompok Mata Pelajaran Umum">Kelompok Umum</SelectItem>
                                  <SelectItem value="B. Kelompok Mata Pelajaran Kejuruan">Kelompok Kejuruan</SelectItem>
                               </SelectContent>
                           </Select>
                        </div>
                   </div>
                   {!!editingSubject && <p className="text-xs text-muted-foreground">Tingkat dan Kelompok tidak dapat diubah. Untuk memindahkan, hapus dan buat ulang.</p>}
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button onClick={handleSaveSubject}>Simpan</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!subjectToDelete} onOpenChange={() => setSubjectToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus mata pelajaran "{subjectToDelete?.subject.nama}" secara permanen.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSubject}>Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
