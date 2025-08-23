
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Users, Box, Calendar, CheckCircle, TrendingUp, ArrowRightLeft, FileText, DollarSign, Armchair, Send, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


// Data Types
interface Siswa { id: number; nis: string; nama: string; jk: 'L' | 'P'; alamat: string; }
interface Sarana { id: number; nama: string; jumlah: number; kondisi: string; }
interface Nilai { id: number; mapel: string; rataRata: number; }
interface Jadwal { id: number; hari: string; jam: string; mapel: string; guru: string; }
interface Piket { id: number; hari: string; siswa: string; }
interface Organisasi { [key: string]: string; }
interface Catatan { id: number; nama: string; catatan: string; }
interface Mutasi { id: number; tanggal: string; nama: string; jenis: 'Masuk' | 'Keluar'; keterangan: string; }
interface Rapor { id: number; nis: string; nama: string; tanggal: string; penerima: string; }
interface Komite { id: number; nis: string; nama: string; status: 'Lunas' | 'Belum Lunas'; tanggal: string; }
interface Kehadiran { totalSiswa: number; hadir: number; sakit: number; izin: number; alpa: number; }

export default function LaporanWaliKelasPage() {
  const { toast } = useToast();

  // States for all data sections
  const [identitasSiswa, setIdentitasSiswa] = useState<Siswa[]>([
    { id: 1, nis: "12345", nama: "Ahmad Budi", jk: "L", alamat: "Jl. Merdeka No. 1" },
    { id: 2, nis: "12346", nama: "Citra Dewi", jk: "P", alamat: "Jl. Pahlawan No. 2" },
  ]);
  const [saranaKelas, setSaranaKelas] = useState<Sarana[]>([
      { id: 1, nama: "Meja Siswa", jumlah: 40, kondisi: "Baik" },
      { id: 2, nama: "Kursi Siswa", jumlah: 40, kondisi: "Baik" },
  ]);
  const [rekapNilai, setRekapNilai] = useState<Nilai[]>([
    { id: 1, mapel: "Matematika", rataRata: 85.5 },
    { id: 2, mapel: "Bahasa Indonesia", rataRata: 88.0 },
  ]);
  const [jadwalPelajaran, setJadwalPelajaran] = useState<Jadwal[]>([
      { id: 1, hari: "Senin", jam: "07:30-09:00", mapel: "Matematika", guru: "Drs. Budi Santoso" },
  ]);
  const [jadwalPiket, setJadwalPiket] = useState<Piket[]>([
      { id: 1, hari: "Senin", siswa: "Ahmad, Budi, Citra, Dewi" },
      { id: 2, hari: "Selasa", siswa: "Eka, Fitri, Gunawan, Hana" },
  ]);
  const [strukturOrganisasi, setStrukturOrganisasi] = useState<Organisasi>({
      "Ketua Kelas": "Ahmad Budi", "Wakil Ketua Kelas": "Citra Dewi", "Sekretaris": "Fitriani", "Bendahara": "Gunawan"
  });
  const [kehadiranSiswa, setKehadiranSiswa] = useState<Kehadiran>({ totalSiswa: 40, hadir: 38, sakit: 1, izin: 1, alpa: 0 });
  const [catatanSiswa, setCatatanSiswa] = useState<Catatan[]>([
      { id: 1, nama: "Eka Putra", catatan: "Perlu bimbingan lebih pada mata pelajaran Bahasa Inggris." },
  ]);
  const [mutasiSiswa, setMutasiSiswa] = useState<Mutasi[]>([
      { id: 1, tanggal: "2024-07-01", nama: "Rahmat Hidayat", jenis: "Masuk", keterangan: "Pindahan dari SMKN 1 Makassar" },
  ]);
  const [terimaRapor, setTerimaRapor] = useState<Rapor[]>([
      { id: 1, nis: "12345", nama: "Ahmad Budi", tanggal: "2024-06-15", penerima: "Orang Tua" },
  ]);
  const [pembayaranKomite, setPembayaranKomite] = useState<Komite[]>([
      { id: 1, nis: "12345", nama: "Ahmad Budi", status: "Lunas", tanggal: "2024-07-10" },
      { id: 2, nis: "12346", nama: "Citra Dewi", status: "Belum Lunas", tanggal: "-" },
  ]);

  // Generic state for handling dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{section: string; id: number} | null>(null);
  
  // Generic form state
  const [formData, setFormData] = useState<any>({});
  
  const handlePrint = () => window.print();

  const handleSendReport = () => {
    toast({
      title: "Laporan Terkirim",
      description: "Laporan bulanan kelas X OT 1 telah berhasil dikirim ke Wakasek Kesiswaan.",
    });
  };

  const handleOpenDialog = (section: string, item: any | null = null) => {
    setCurrentSection(section);
    setEditingItem(item);
    setFormData(item || {});
    setDialogOpen(true);
  };
  
  const handleDelete = () => {
    if (!itemToDelete) return;
    const { section, id } = itemToDelete;

    const setters: { [key: string]: React.Dispatch<React.SetStateAction<any[]>> } = {
        identitasSiswa: setIdentitasSiswa,
        catatanSiswa: setCatatanSiswa,
        mutasiSiswa: setMutasiSiswa,
        saranaKelas: setSaranaKelas,
        jadwalPelajaran: setJadwalPelajaran,
        rekapNilai: setRekapNilai,
        terimaRapor: setTerimaRapor,
        pembayaranKomite: setPembayaranKomite,
        jadwalPiket: setJadwalPiket,
    };
    
    if (setters[section]) {
        setters[section]((prev: any[]) => prev.filter(i => i.id !== id));
    }
    
    toast({ title: "Data Dihapus", description: "Data telah berhasil dihapus." });
    setItemToDelete(null);
  };
  
  const handleSave = () => {
    const id = editingItem ? editingItem.id : Date.now();
    const newItem = { ...formData, id };
    
    const updaters: { [key: string]: React.Dispatch<React.SetStateAction<any[]>> } = {
        identitasSiswa: setIdentitasSiswa,
        catatanSiswa: setCatatanSiswa,
        mutasiSiswa: setMutasiSiswa,
        saranaKelas: setSaranaKelas,
        jadwalPelajaran: setJadwalPelajaran,
        rekapNilai: setRekapNilai,
        terimaRapor: setTerimaRapor,
        pembayaranKomite: setPembayaranKomite,
        jadwalPiket: setJadwalPiket,
    };

    if (updaters[currentSection!]) {
      updaters[currentSection!]((prev: any[]) => 
        editingItem ? prev.map(i => i.id === id ? newItem : i) : [...prev, newItem]
      );
    } else if (currentSection === 'strukturOrganisasi') {
      setStrukturOrganisasi(formData);
    }
    
    toast({ title: "Data Tersimpan", description: "Perubahan telah berhasil disimpan." });
    setDialogOpen(false);
    setFormData({});
    setEditingItem(null);
  };

  const renderDialogContent = () => {
    switch(currentSection) {
        case 'identitasSiswa': return (
            <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nis" className="text-right">NIS</Label><Input id="nis" value={formData.nis || ""} onChange={e => setFormData({...formData, nis: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama</Label><Input id="nama" value={formData.nama || ""} onChange={e => setFormData({...formData, nama: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="jk" className="text-right">L/P</Label><Select value={formData.jk || ""} onValueChange={value => setFormData({...formData, jk: value})}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="alamat" className="text-right">Alamat</Label><Input id="alamat" value={formData.alamat || ""} onChange={e => setFormData({...formData, alamat: e.target.value})} className="col-span-3" /></div>
            </>
        );
        case 'catatanSiswa': return (
            <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama Siswa</Label><Input id="nama" value={formData.nama || ""} onChange={e => setFormData({...formData, nama: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="catatan" className="text-right">Catatan</Label><Textarea id="catatan" value={formData.catatan || ""} onChange={e => setFormData({...formData, catatan: e.target.value})} className="col-span-3" /></div>
            </>
        );
        case 'mutasiSiswa': return (
             <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="tanggal" className="text-right">Tanggal</Label><Input id="tanggal" type="date" value={formData.tanggal || ""} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama</Label><Input id="nama" value={formData.nama || ""} onChange={e => setFormData({...formData, nama: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="jenis" className="text-right">Jenis</Label><Select value={formData.jenis || ""} onValueChange={value => setFormData({...formData, jenis: value})}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masuk">Masuk</SelectItem><SelectItem value="Keluar">Keluar</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="keterangan" className="text-right">Keterangan</Label><Input id="keterangan" value={formData.keterangan || ""} onChange={e => setFormData({...formData, keterangan: e.target.value})} className="col-span-3" /></div>
            </>
        );
        case 'saranaKelas': return (
             <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama Barang</Label><Input id="nama" value={formData.nama || ""} onChange={e => setFormData({...formData, nama: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="jumlah" className="text-right">Jumlah</Label><Input id="jumlah" type="number" value={formData.jumlah || ""} onChange={e => setFormData({...formData, jumlah: parseInt(e.target.value)})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="kondisi" className="text-right">Kondisi</Label><Input id="kondisi" value={formData.kondisi || ""} onChange={e => setFormData({...formData, kondisi: e.target.value})} className="col-span-3" /></div>
            </>
        );
        case 'strukturOrganisasi': return (
            <>
              {Object.keys(strukturOrganisasi).map(jabatan => (
                  <div className="grid grid-cols-4 items-center gap-4" key={jabatan}>
                    <Label htmlFor={jabatan} className="text-right">{jabatan}</Label>
                    <Input id={jabatan} value={formData[jabatan] || ""} onChange={e => setFormData({...formData, [jabatan]: e.target.value})} className="col-span-3" />
                  </div>
              ))}
            </>
        );
         case 'jadwalPiket': return (
            <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="hari" className="text-right">Hari</Label><Input id="hari" value={formData.hari || ""} onChange={e => setFormData({...formData, hari: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="siswa" className="text-right">Siswa</Label><Textarea id="siswa" placeholder="Pisahkan nama dengan koma" value={formData.siswa || ""} onChange={e => setFormData({...formData, siswa: e.target.value})} className="col-span-3" /></div>
            </>
        );
         case 'rekapNilai': return (
            <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="mapel" className="text-right">Mata Pelajaran</Label><Input id="mapel" value={formData.mapel || ""} onChange={e => setFormData({...formData, mapel: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="rataRata" className="text-right">Rata-rata</Label><Input id="rataRata" type="number" step="0.1" value={formData.rataRata || ""} onChange={e => setFormData({...formData, rataRata: parseFloat(e.target.value)})} className="col-span-3" /></div>
            </>
        );
        case 'jadwalPelajaran': return (
            <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="hari" className="text-right">Hari</Label><Input id="hari" value={formData.hari || ""} onChange={e => setFormData({...formData, hari: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="jam" className="text-right">Jam</Label><Input id="jam" value={formData.jam || ""} onChange={e => setFormData({...formData, jam: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="mapel" className="text-right">Mapel</Label><Input id="mapel" value={formData.mapel || ""} onChange={e => setFormData({...formData, mapel: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="guru" className="text-right">Guru</Label><Input id="guru" value={formData.guru || ""} onChange={e => setFormData({...formData, guru: e.target.value})} className="col-span-3" /></div>
            </>
        );
        case 'terimaRapor': return (
            <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nis" className="text-right">NIS</Label><Input id="nis" value={formData.nis || ""} onChange={e => setFormData({...formData, nis: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama</Label><Input id="nama" value={formData.nama || ""} onChange={e => setFormData({...formData, nama: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="tanggal" className="text-right">Tanggal</Label><Input id="tanggal" type="date" value={formData.tanggal || ""} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="penerima" className="text-right">Penerima</Label><Input id="penerima" value={formData.penerima || ""} onChange={e => setFormData({...formData, penerima: e.target.value})} className="col-span-3" /></div>
            </>
        );
        case 'pembayaranKomite': return (
            <>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nis" className="text-right">NIS</Label><Input id="nis" value={formData.nis || ""} onChange={e => setFormData({...formData, nis: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nama" className="text-right">Nama</Label><Input id="nama" value={formData.nama || ""} onChange={e => setFormData({...formData, nama: e.target.value})} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="status" className="text-right">Status</Label><Select value={formData.status || ""} onValueChange={value => setFormData({...formData, status: value})}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Lunas">Lunas</SelectItem><SelectItem value="Belum Lunas">Belum Lunas</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="tanggal" className="text-right">Tanggal</Label><Input id="tanggal" type="date" value={formData.tanggal || ""} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="col-span-3" /></div>
            </>
        );
        default: return <p>Form tidak tersedia untuk seksi ini.</p>;
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Wali Kelas - X OT 1</h2>
          <p className="text-muted-foreground">
            Rekapitulasi lengkap data kelas binaan. Klik pada data untuk mengedit.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Cetak Laporan</Button>
            <Button onClick={handleSendReport}><Send className="mr-2 h-4 w-4" /> Kirim Laporan ke Wakasek</Button>
        </div>
      </div>
      
      <Tabs defaultValue="dataSiswa">
        <TabsList className="grid w-full grid-cols-5 print:hidden">
          <TabsTrigger value="dataSiswa">Data Siswa</TabsTrigger>
          <TabsTrigger value="administrasi">Administrasi Kelas</TabsTrigger>
          <TabsTrigger value="akademik">Akademik</TabsTrigger>
          <TabsTrigger value="kehadiran">Kehadiran & Rapor</TabsTrigger>
          <TabsTrigger value="keuangan">Keuangan</TabsTrigger>
        </TabsList>

        <TabsContent value="dataSiswa" className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Users /> Identitas Anak Wali</CardTitle><Button size="sm" onClick={() => handleOpenDialog('identitasSiswa')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama</TableHead><TableHead>L/P</TableHead><TableHead>Alamat</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>{identitasSiswa.map(s => (<TableRow key={s.id}><TableCell>{s.nis}</TableCell><TableCell>{s.nama}</TableCell><TableCell>{s.jk}</TableCell><TableCell>{s.alamat}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('identitasSiswa', s)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'identitasSiswa', id: s.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><FileText /> Catatan Siswa</CardTitle><Button size="sm" onClick={() => handleOpenDialog('catatanSiswa')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead>Catatan</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>{catatanSiswa.map(c => (<TableRow key={c.id}><TableCell className="font-medium">{c.nama}</TableCell><TableCell>{c.catatan}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('catatanSiswa', c)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'catatanSiswa', id: c.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><ArrowRightLeft /> Daftar Mutasi Siswa</CardTitle><Button size="sm" onClick={() => handleOpenDialog('mutasiSiswa')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Jenis Mutasi</TableHead><TableHead>Keterangan</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>{mutasiSiswa.map(m => (<TableRow key={m.id}><TableCell>{m.tanggal}</TableCell><TableCell>{m.nama}</TableCell><TableCell><Badge variant={m.jenis === 'Masuk' ? 'default' : 'destructive'}>{m.jenis}</Badge></TableCell><TableCell>{m.keterangan}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('mutasiSiswa', m)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'mutasiSiswa', id: m.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="administrasi" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Box /> Sarana Kelas</CardTitle><Button size="sm" onClick={() => handleOpenDialog('saranaKelas')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Nama Barang</TableHead><TableHead>Jumlah</TableHead><TableHead>Kondisi</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>{saranaKelas.map(s => (<TableRow key={s.id}><TableCell>{s.nama}</TableCell><TableCell>{s.jumlah}</TableCell><TableCell>{s.kondisi}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('saranaKelas', s)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'saranaKelas', id: s.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Users /> Struktur Organisasi Kelas</CardTitle><Button size="sm" onClick={() => handleOpenDialog('strukturOrganisasi', strukturOrganisasi)}><Edit className="mr-2 h-4 w-4" /> Edit</Button></CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {Object.entries(strukturOrganisasi).map(([jabatan, nama]) => (
                                <li key={jabatan} className="flex justify-between">
                                    <span className="font-semibold">{jabatan}:</span>
                                    <span>{nama}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Calendar /> Jadwal Piket Kelas</CardTitle><Button size="sm" onClick={() => handleOpenDialog('jadwalPiket')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Hari</TableHead><TableHead>Siswa Bertugas</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>{jadwalPiket.map(p => (<TableRow key={p.id}><TableCell className="font-semibold">{p.hari}</TableCell><TableCell>{p.siswa}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('jadwalPiket', p)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'jadwalPiket', id: p.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Armchair /> Denah Tempat Duduk</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground text-center">Fitur denah tempat duduk akan segera tersedia.</p></CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="akademik" className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><TrendingUp /> Rekap Nilai Rata-Rata</CardTitle><Button size="sm" onClick={() => handleOpenDialog('rekapNilai')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Mata Pelajaran</TableHead><TableHead className="text-right">Rata-Rata Kelas</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>{rekapNilai.map(n => (<TableRow key={n.id}><TableCell className="font-medium">{n.mapel}</TableCell><TableCell className="text-right">{n.rataRata.toFixed(1)}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('rekapNilai', n)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'rekapNilai', id: n.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Calendar /> Jadwal Pelajaran</CardTitle><Button size="sm" onClick={() => handleOpenDialog('jadwalPelajaran')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Hari</TableHead><TableHead>Jam</TableHead><TableHead>Mata Pelajaran</TableHead><TableHead>Guru</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>{jadwalPelajaran.map((j) => (<TableRow key={j.id}><TableCell>{j.hari}</TableCell><TableCell>{j.jam}</TableCell><TableCell>{j.mapel}</TableCell><TableCell>{j.guru}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('jadwalPelajaran', j)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'jadwalPelajaran', id: j.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="kehadiran" className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><CheckCircle /> Rekap Kehadiran Siswa (Bulanan)</CardTitle>
                        <CardDescription>Data ini direkapitulasi secara otomatis.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Total Siswa</p><p className="text-2xl font-bold">{kehadiranSiswa.totalSiswa}</p></div>
                    <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Hadir</p><p className="text-2xl font-bold">{kehadiranSiswa.hadir}</p></div>
                    <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Sakit</p><p className="text-2xl font-bold">{kehadiranSiswa.sakit}</p></div>
                    <div className="p-4 bg-secondary rounded-lg"><p className="text-sm text-muted-foreground">Izin</p><p className="text-2xl font-bold">{kehadiranSiswa.izin}</p></div>
                    <div className="p-4 bg-destructive/20 rounded-lg"><p className="text-sm text-destructive">Alpa</p><p className="text-2xl font-bold text-destructive">{kehadiranSiswa.alpa}</p></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><FileText /> Daftar Penerimaan Rapor</CardTitle><Button size="sm" onClick={() => handleOpenDialog('terimaRapor')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Tanggal Terima</TableHead><TableHead>Penerima</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>{terimaRapor.map(r => (<TableRow key={r.id}><TableCell>{r.nis}</TableCell><TableCell>{r.nama}</TableCell><TableCell>{r.tanggal}</TableCell><TableCell>{r.penerima}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('terimaRapor', r)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'terimaRapor', id: r.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="keuangan" className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><DollarSign /> Daftar Pembayaran Komite</CardTitle><Button size="sm" onClick={() => handleOpenDialog('pembayaranKomite')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>NIS</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Status</TableHead><TableHead>Tanggal Bayar</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>{pembayaranKomite.map(p => (<TableRow key={p.id}><TableCell>{p.nis}</TableCell><TableCell>{p.nama}</TableCell><TableCell><Badge variant={p.status === 'Lunas' ? 'default' : 'destructive'}>{p.status}</Badge></TableCell><TableCell>{p.tanggal}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog('pembayaranKomite', p)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => setItemToDelete({section: 'pembayaranKomite', id: p.id})}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit' : 'Tambah'} Data</DialogTitle>
                <DialogDescription>
                    Lengkapi form di bawah ini untuk menyimpan data.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {renderDialogContent()}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleSave}>Simpan</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setItemToDelete(null)}>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
