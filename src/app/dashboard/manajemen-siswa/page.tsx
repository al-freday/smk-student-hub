
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Upload, CalendarCheck, Calendar as CalendarIcon, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Kelas {
    id: number;
    nama: string;
    jumlahSiswa: number;
}

interface Kehadiran {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  tanggal: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
}

interface WaliKelasInfo {
    nama: string;
    kelas: string;
}

const generateInitialSiswa = (): Siswa[] => {
  const siswaList: Siswa[] = [];
  let id = 1;
  const daftarKelas = [
    "X OT 1", "X OT 2", "X OT 3", "X TKR", "X AKL", "X TM",
    "XI TAB 1", "XI TAB 2", "XI TKR", "XI AKL", "XI TM",
    "XII TAB 1", "XII TAB 2", "XII TKR", "XII AKL", "XII TM"
  ];
  daftarKelas.forEach(kelas => {
    for (let i = 1; i <= 40; i++) {
      const nisSuffix = id.toString().padStart(4, '0');
      const nis = `24${nisSuffix}`;
      siswaList.push({
        id: id++,
        nis: nis,
        nama: `Siswa ${i} ${kelas}`,
        kelas: kelas,
      });
    }
  });
  return siswaList;
};

export default function ManajemenSiswaPage() {
  const { toast } = useToast();
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [daftarKelasDinamis, setDaftarKelasDinamis] = useState<Kelas[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [waliKelasInfo, setWaliKelasInfo] = useState<WaliKelasInfo | null>(null);

  // Form states for siswa
  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");

  const [open, setOpen] = useState(false);
  
  // State for attendance
  const [openKehadiran, setOpenKehadiran] = useState(false);
  const [siswaKehadiran, setSiswaKehadiran] = useState<Siswa | null>(null);
  const [statusKehadiran, setStatusKehadiran] = useState<Kehadiran['status']>('Hadir');
  const [tanggalKehadiran, setTanggalKehadiran] = useState<Date | undefined>(new Date());

  useEffect(() => {
      const role = localStorage.getItem('userRole');
      setUserRole(role);

      const savedSiswa = localStorage.getItem('siswaData');
      const savedKelas = localStorage.getItem('kelasData');

      if (savedKelas) {
          setDaftarKelasDinamis(JSON.parse(savedKelas));
      }

      if (savedSiswa) {
          setSiswa(JSON.parse(savedSiswa));
      } else {
          const initialSiswa = generateInitialSiswa();
          setSiswa(initialSiswa);
          localStorage.setItem('siswaData', JSON.stringify(initialSiswa));
      }

      if (role === 'wali_kelas') {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const teachersData = JSON.parse(localStorage.getItem('teachersData') || '{}');
          const waliKelasData = teachersData.waliKelas?.find((wk: any) => wk.nama === currentUser.nama);
          if (waliKelasData) {
              setWaliKelasInfo({ nama: waliKelasData.nama, kelas: waliKelasData.kelas });
          }
      }
  }, []);

  const saveDataToLocalStorage = (data: Siswa[]) => {
      localStorage.setItem('siswaData', JSON.stringify(data));
  };

  const resetForm = () => {
    setNis("");
    setNama("");
    setKelas(waliKelasInfo?.kelas || "");
    setEditingSiswa(null);
  };

  const handleOpenDialog = (siswaToEdit: Siswa | null = null) => {
    if (siswaToEdit) {
      setEditingSiswa(siswaToEdit);
      setNis(siswaToEdit.nis);
      setNama(siswaToEdit.nama);
      setKelas(siswaToEdit.kelas);
    } else {
      resetForm();
    }
    setOpen(true);
  };
  
  const handleOpenKehadiranDialog = (siswa: Siswa) => {
      setSiswaKehadiran(siswa);
      setStatusKehadiran('Hadir');
      setTanggalKehadiran(new Date());
      setOpenKehadiran(true);
  };

  const handleSaveSiswa = () => {
    if (nis && nama && kelas) {
        let updatedSiswa;
      if (editingSiswa) {
        updatedSiswa = siswa.map((s) => s.id === editingSiswa.id ? { ...s, nis, nama, kelas } : s);
      } else {
        const newSiswa: Siswa = {
          id: siswa.length > 0 ? Math.max(...siswa.map((s) => s.id)) + 1 : 1,
          nis, nama, kelas,
        };
        updatedSiswa = [...siswa, newSiswa];
      }
      setSiswa(updatedSiswa);
      saveDataToLocalStorage(updatedSiswa);
      resetForm();
      setOpen(false);
    }
  };
  
  const handleSaveKehadiran = () => {
    if (!siswaKehadiran || !statusKehadiran || !tanggalKehadiran) return;
    
    const tanggalFormatted = format(tanggalKehadiran, "yyyy-MM-dd");
    const dataKehadiran = localStorage.getItem("kehadiranSiswa");
    const riwayat: Kehadiran[] = dataKehadiran ? JSON.parse(dataKehadiran) : [];

    const riwayatBaru = riwayat.filter(k => !(k.nis === siswaKehadiran.nis && k.tanggal === tanggalFormatted));
    
    const catatanBaru: Kehadiran = {
      id: `${siswaKehadiran.nis}-${tanggalFormatted}`,
      nis: siswaKehadiran.nis,
      nama: siswaKehadiran.nama,
      kelas: siswaKehadiran.kelas,
      tanggal: tanggalFormatted,
      status: statusKehadiran,
    };
    
    riwayatBaru.push(catatanBaru);
    localStorage.setItem("kehadiranSiswa", JSON.stringify(riwayatBaru));
    
    toast({
      title: "Kehadiran Disimpan",
      description: `${siswaKehadiran.nama} dicatat ${statusKehadiran} untuk tanggal ${tanggalFormatted}.`,
    });

    setOpenKehadiran(false);
    setSiswaKehadiran(null);
  };

  const handleDeleteSiswa = (id: number) => {
    const updatedSiswa = siswa.filter((s) => s.id !== id);
    setSiswa(updatedSiswa);
    saveDataToLocalStorage(updatedSiswa);
  };
  
  const handleImport = () => {
    alert("Fungsionalitas impor dari Excel akan segera tersedia.");
  };
  
  const displayedKelas = userRole === 'wali_kelas' && waliKelasInfo
    ? daftarKelasDinamis.filter(k => k.nama === waliKelasInfo.kelas)
    : daftarKelasDinamis;


  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Siswa</h2>
          <p className="text-muted-foreground">
             {userRole === 'wali_kelas' && waliKelasInfo 
                ? `Kelola data siswa di kelas binaan Anda: ${waliKelasInfo.kelas}.`
                : "Kelola data siswa di sekolah dan catat kehadiran harian."
             }
          </p>
        </div>
        <div className="flex gap-2">
            <Link href="/dashboard/manajemen-siswa/kehadiran-siswa">
                <Button variant="outline">
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Lihat Riwayat Kehadiran
                </Button>
            </Link>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Impor dari Excel
            </Button>
            <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Siswa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingSiswa ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
                  <DialogDescription>
                    {editingSiswa ? "Ubah informasi siswa." : "Masukkan informasi siswa yang akan ditambahkan."} Klik simpan jika sudah selesai.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nis" className="text-right">NIS</Label>
                    <Input id="nis" value={nis} onChange={(e) => setNis(e.target.value)} className="col-span-3" placeholder="Nomor Induk Siswa" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nama" className="text-right">Nama</Label>
                    <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className="col-span-3" placeholder="Nama Lengkap Siswa" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kelas" className="text-right">Kelas</Label>
                     <Select onValueChange={setKelas} value={kelas} disabled={userRole === 'wali_kelas'}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                        <SelectContent>{daftarKelasDinamis.map(k => (<SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>))}</SelectContent>
                      </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                  <Button type="submit" onClick={handleSaveSiswa}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas & Siswa</CardTitle>
          <CardDescription>
             {userRole === 'wali_kelas' 
                ? "Berikut adalah daftar siswa di kelas Anda."
                : "Pilih kelas untuk melihat daftar siswa di dalamnya."
             }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue={waliKelasInfo?.kelas}>
            {displayedKelas.map((k) => {
              const siswaDiKelas = siswa.filter(s => s.kelas === k.nama);
              return (
                <AccordionItem value={k.nama} key={k.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                        <span className="font-semibold">{k.nama}</span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4"/> {siswaDiKelas.length} Siswa
                        </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                     {siswaDiKelas.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>NIS</TableHead>
                              <TableHead>Nama Siswa</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                              {siswaDiKelas.map((s) => (
                                <TableRow key={s.id}>
                                  <TableCell>{s.nis}</TableCell>
                                  <TableCell className="font-medium">{s.nama}</TableCell>
                                  <TableCell className="text-right">
                                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleOpenKehadiranDialog(s)}>
                                          <CalendarCheck className="mr-2 h-4 w-4" /> Catat Kehadiran
                                      </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Buka menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenDialog(s)}><Edit className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
                                         <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /><span>Hapus</span></DropdownMenuItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                              <AlertDialogDescription>Tindakan ini tidak bisa dibatalkan. Ini akan menghapus data siswa secara permanen.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Batal</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteSiswa(s.id)}>Hapus</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                     ) : (
                         <div className="text-center text-sm text-muted-foreground py-4">
                            <p>Belum ada data siswa di kelas ini.</p>
                        </div>
                     )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={openKehadiran} onOpenChange={setOpenKehadiran}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Catat Kehadiran untuk {siswaKehadiran?.nama}</DialogTitle>
                <DialogDescription>Pilih tanggal dan status kehadiran.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tanggal-kehadiran" className="text-right">Tanggal</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "col-span-3 justify-start text-left font-normal",
                            !tanggalKehadiran && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {tanggalKehadiran ? format(tanggalKehadiran, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={tanggalKehadiran}
                            onSelect={setTanggalKehadiran}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status-kehadiran" className="text-right">Status</Label>
                    <Select onValueChange={(value) => setStatusKehadiran(value as Kehadiran['status'])} defaultValue={statusKehadiran}>
                        <SelectTrigger className="col-span-3" id="status-kehadiran"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hadir">Hadir</SelectItem>
                            <SelectItem value="Sakit">Sakit</SelectItem>
                            <SelectItem value="Izin">Izin</SelectItem>
                            <SelectItem value="Alpa">Alpa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleSaveKehadiran}>Simpan Kehadiran</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
