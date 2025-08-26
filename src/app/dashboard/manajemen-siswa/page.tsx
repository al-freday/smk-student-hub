
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Upload, Users, Download, Building, Save, RefreshCw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Kelas {
    id: number;
    nama: string;
}

interface WaliKelasInfo {
    nama: string;
    kelas: string[];
}

export default function ManajemenSiswaPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [waliKelasInfo, setWaliKelasInfo] = useState<WaliKelasInfo | null>(null);

  // --- Dialog States ---
  const [isSiswaDialogOpen, setIsSiswaDialogOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [siswaToDelete, setSiswaToDelete] = useState<Siswa | null>(null);
  
  const [isKelasDialogOpen, setIsKelasDialogOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [kelasToDelete, setKelasToDelete] = useState<Kelas | null>(null);

  // --- Form States ---
  const [siswaFormData, setSiswaFormData] = useState<Partial<Siswa>>({});
  const [kelasFormData, setKelasFormData] = useState<Partial<Kelas>>({});

  const loadData = () => {
    setIsLoading(true);
    try {
        const savedSiswa = localStorage.getItem('siswaData');
        const savedKelas = localStorage.getItem('kelasData');
        setSiswa(savedSiswa ? JSON.parse(savedSiswa) : []);
        setDaftarKelas(savedKelas ? JSON.parse(savedKelas) : []);

        const role = localStorage.getItem('userRole');
        setUserRole(role);

        if (role === 'wali_kelas') {
            const currentUserData = localStorage.getItem('currentUser');
            const teachersDataData = localStorage.getItem('teachersData');
            if(currentUserData && teachersDataData) {
                const currentUser = JSON.parse(currentUserData);
                const teachersData = JSON.parse(teachersDataData);
                const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === currentUser.nama);
                if (waliKelasData) {
                    setWaliKelasInfo({ nama: waliKelasData.nama, kelas: waliKelasData.kelas });
                }
            }
        }
        toast({ title: "Data Dimuat", description: "Data siswa dan kelas terbaru telah dimuat." });
    } catch (error) {
        console.error("Gagal memuat data:", error);
        toast({ title: "Gagal Memuat Data", description: "Terjadi kesalahan saat memuat data.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
      loadData();
  }, []);

  const handleSaveChanges = () => {
    localStorage.setItem('siswaData', JSON.stringify(siswa));
    localStorage.setItem('kelasData', JSON.stringify(daftarKelas));
    toast({
        title: "Perubahan Disimpan",
        description: "Semua perubahan pada data siswa dan kelas telah disimpan.",
    });
  };

  const resetSiswaForm = () => {
    setSiswaFormData({});
    setEditingSiswa(null);
  };
  
  const resetKelasForm = () => {
      setKelasFormData({});
      setEditingKelas(null);
  };

  const handleOpenSiswaDialog = (siswaToEdit: Siswa | null = null) => {
    resetSiswaForm();
    if (siswaToEdit) {
      setEditingSiswa(siswaToEdit);
      setSiswaFormData(siswaToEdit);
    }
    setIsSiswaDialogOpen(true);
  };
  
  const handleOpenKelasDialog = (kelasToEdit: Kelas | null = null) => {
    resetKelasForm();
    if(kelasToEdit) {
        setEditingKelas(kelasToEdit);
        setKelasFormData(kelasToEdit);
    }
    setIsKelasDialogOpen(true);
  };

  const handleSaveSiswa = () => {
    if (siswaFormData.nis && siswaFormData.nama && siswaFormData.kelas) {
      let updatedSiswa;
      if (editingSiswa) {
        updatedSiswa = siswa.map((s) => s.id === editingSiswa.id ? { ...s, ...siswaFormData } : s);
      } else {
        const newSiswa: Siswa = {
          id: siswa.length > 0 ? Math.max(...siswa.map((s) => s.id)) + 1 : 1,
          ...siswaFormData,
        } as Siswa;
        updatedSiswa = [...siswa, newSiswa];
      }
      setSiswa(updatedSiswa);
      resetSiswaForm();
      setIsSiswaDialogOpen(false);
      toast({title: "Siswa Ditambahkan", description: "Perubahan akan disimpan saat Anda menekan tombol 'Simpan Perubahan'."});
    } else {
        toast({title: "Gagal", description: "Harap lengkapi semua kolom.", variant: "destructive"});
    }
  };
  
  const handleSaveKelas = () => {
    if (kelasFormData.nama) {
        let updatedKelas;
        if (editingKelas) {
            updatedKelas = daftarKelas.map(k => k.id === editingKelas.id ? { ...k, ...kelasFormData } : k);
        } else {
            const newKelas: Kelas = {
                id: daftarKelas.length > 0 ? Math.max(...daftarKelas.map(k => k.id)) + 1 : 1,
                ...kelasFormData,
            } as Kelas;
            updatedKelas = [...daftarKelas, newKelas];
        }
        setDaftarKelas(updatedKelas);
        resetKelasForm();
        setIsKelasDialogOpen(false);
        toast({title: "Kelas Diperbarui", description: "Perubahan akan disimpan saat Anda menekan tombol 'Simpan Perubahan'."});
    } else {
         toast({title: "Gagal", description: "Nama kelas tidak boleh kosong.", variant: "destructive"});
    }
  };
  
  const handleDeleteSiswa = () => {
    if (!siswaToDelete) return;
    const updatedSiswa = siswa.filter((s) => s.id !== siswaToDelete.id);
    setSiswa(updatedSiswa);
    setSiswaToDelete(null);
    toast({title: "Siswa Dihapus", description: `Data ${siswaToDelete.nama} dihapus dari sesi ini.`});
  };
  
  const handleDeleteKelas = () => {
    if (!kelasToDelete) return;
    const updatedKelas = daftarKelas.filter(k => k.id !== kelasToDelete.id);
    setDaftarKelas(updatedKelas);
    setKelasToDelete(null);
    toast({title: "Kelas Dihapus", description: `Kelas ${kelasToDelete.nama} dihapus dari sesi ini.`});
  };
  
  const handleDownload = () => {
    const headers = ['id', 'nis', 'nama', 'kelas'];
    const csvContent = [
        headers.join(','),
        ...siswa.map(s => [s.id, s.nis, `"${s.nama}"`, s.kelas].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'data_siswa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Unduh Berhasil", description: "Data siswa telah diunduh sebagai CSV." });
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').slice(1); // Skip header
        const newSiswaList = [...siswa];
        let importedCount = 0;
        
        rows.forEach(row => {
            if (!row.trim()) return;
            const columns = row.split(',');
            const [id, nis, nama, kelas] = columns;
            
            if (id && nis && nama && kelas) {
                const siswaObj: Siswa = {
                    id: parseInt(id),
                    nis: nis.trim(),
                    nama: nama.trim().replace(/"/g, ''),
                    kelas: kelas.trim(),
                };
                
                const existingIndex = newSiswaList.findIndex(s => s.id === siswaObj.id);
                if (existingIndex > -1) {
                    newSiswaList[existingIndex] = siswaObj; // Update
                } else {
                    newSiswaList.push(siswaObj); // Add new
                }
                importedCount++;
            }
        });
        
        setSiswa(newSiswaList);
        toast({ title: "Impor Selesai", description: `${importedCount} data diimpor. Tekan 'Simpan Perubahan' untuk menyimpan.` });
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const displayedKelas = userRole === 'wali_kelas' && waliKelasInfo
    ? daftarKelas.filter(k => waliKelasInfo.kelas.includes(k.nama))
    : daftarKelas;

  if (isLoading) {
    return (
        <div className="flex-1 space-y-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Siswa</h2>
          <p className="text-muted-foreground">
             Kelola data siswa dan daftar kelas di sekolah.
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/>Simpan Perubahan</Button>
            <Button variant="outline" onClick={loadData}><RefreshCw className="mr-2 h-4 w-4"/>Muat Ulang Data</Button>
        </div>
      </div>
      <div className="flex justify-end gap-2">
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleImport} accept=".csv" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Impor</Button>
            <Button variant="outline" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Unduh</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Building /> Kelola Daftar Kelas</CardTitle>
                        <CardDescription>Tambah atau hapus data kelas.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => handleOpenKelasDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nama Kelas</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {Array.isArray(daftarKelas) && daftarKelas.length > 0 ? daftarKelas.map(k => (
                                <TableRow key={k.id}>
                                    <TableCell className="font-medium">{k.nama}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenKelasDialog(k)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setKelasToDelete(k)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={2} className="text-center h-24">Belum ada kelas.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Users /> Daftar Siswa</CardTitle>
                        <CardDescription>Pilih kelas untuk melihat daftar siswa.</CardDescription>
                    </div>
                     <Button onClick={() => handleOpenSiswaDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Siswa
                    </Button>
                </CardHeader>
                <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue={waliKelasInfo?.kelas?.[0]}>
                    {Array.isArray(displayedKelas) && displayedKelas.map((k) => {
                    const siswaDiKelas = siswa.filter(s => s.kelas === k.nama);
                    return (
                        <AccordionItem value={k.nama} key={k.id}>
                        <AccordionTrigger>
                            <div className="flex justify-between w-full pr-4">
                                <span className="font-semibold">{k.nama}</span>
                                <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4"/> {siswaDiKelas.length} Siswa</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {siswaDiKelas.length > 0 ? (
                                <Table>
                                <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama Siswa</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {siswaDiKelas.map((s) => (
                                        <TableRow key={s.id}>
                                        <TableCell>{s.nis}</TableCell>
                                        <TableCell className="font-medium">{s.nama}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenSiswaDialog(s)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSiswaToDelete(s)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem>
                                            </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                </Table>
                            ) : (<div className="text-center text-sm text-muted-foreground py-4"><p>Belum ada data siswa di kelas ini.</p></div>)}
                        </AccordionContent>
                        </AccordionItem>
                    )
                    })}
                </Accordion>
                </CardContent>
            </Card>
          </div>
      </div>

      {/* Dialog Siswa */}
      <Dialog open={isSiswaDialogOpen} onOpenChange={(isOpen) => { setIsSiswaDialogOpen(isOpen); if (!isOpen) resetSiswaForm(); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>{editingSiswa ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nis" className="text-right">NIS</Label><Input id="nis" value={siswaFormData.nis || ""} onChange={(e) => setSiswaFormData({...siswaFormData, nis: e.target.value})} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama</Label><Input id="nama" value={siswaFormData.nama || ""} onChange={(e) => setSiswaFormData({...siswaFormData, nama: e.target.value})} className="col-span-3"/></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="kelas" className="text-right">Kelas</Label><Select onValueChange={(v) => setSiswaFormData({...siswaFormData, kelas: v})} value={siswaFormData.kelas}><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger><SelectContent>{Array.isArray(daftarKelas) && daftarKelas.map(k => (<SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSaveSiswa}>Simpan</Button></DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Dialog Kelas */}
       <Dialog open={isKelasDialogOpen} onOpenChange={(isOpen) => { setIsKelasDialogOpen(isOpen); if (!isOpen) resetKelasForm(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editingKelas ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama-kelas" className="text-right">Nama Kelas</Label><Input id="nama-kelas" value={kelasFormData.nama || ""} onChange={(e) => setKelasFormData({...kelasFormData, nama: e.target.value})} className="col-span-3" placeholder="Contoh: X OT 1"/></div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleSaveKelas}>Simpan</Button></DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Alert Dialogs for Deletion */}
      <AlertDialog open={!!siswaToDelete} onOpenChange={() => setSiswaToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus data siswa {siswaToDelete?.nama} secara permanen setelah Anda menyimpan perubahan.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSiswa}>Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!kelasToDelete} onOpenChange={() => setKelasToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle><AlertDialogDescription>Menghapus kelas tidak akan menghapus siswa di dalamnya. Anda perlu memindahkan siswa ke kelas lain.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteKelas}>Hapus</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    