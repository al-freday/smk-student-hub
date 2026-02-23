
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Printer, FileSignature, Phone, Users, Archive, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


// --- Tipe Data ---
interface Siswa { id: number; nis: string; nama: string; kelas: string; }
interface SchoolInfo { schoolName: string; headmasterName: string; logo: string; }
interface Surat {
    id: string;
    tipe: 'Komitmen Siswa' | 'Panggilan Orang Tua' | 'Kesepakatan Orang Tua';
    tanggal: string;
    data: any;
    dicetakOleh: string;
}

// --- Komponen Pratinjau Surat ---
const LetterPreview = ({ children, onPrint }: { children: React.ReactNode, onPrint: () => void }) => (
    <div className="mt-6">
        <div className="flex justify-between items-center mb-4 print:hidden">
            <h3 className="font-semibold">Pratinjau Surat</h3>
            <Button onClick={onPrint}><Printer className="mr-2 h-4 w-4" /> Cetak & Arsipkan</Button>
        </div>
        <div id="print-area" className="p-8 border rounded-lg bg-white text-black font-serif text-sm">
            {children}
        </div>
    </div>
);

// --- Template Surat ---
const SuratKomitmenTemplate = ({ data, schoolInfo }: { data: any, schoolInfo: SchoolInfo | null }) => (
    <div className="printable-letter">
        <div className="text-center mb-6">
            <h2 className="text-lg font-bold uppercase">SURAT PERNYATAAN KOMITMEN SISWA</h2>
        </div>
        <p className="mb-4">Yang bertanda tangan di bawah ini:</p>
        <table className="w-full mb-4">
            <tbody>
                <tr><td className="w-1/4">Nama</td><td>: {data.siswa.nama}</td></tr>
                <tr><td>NIS</td><td>: {data.siswa.nis}</td></tr>
                <tr><td>Kelas</td><td>: {data.siswa.kelas}</td></tr>
            </tbody>
        </table>
        <p className="mb-4">Dengan ini menyatakan dengan sesungguhnya bahwa saya telah melakukan pelanggaran tata tertib sekolah, yaitu:</p>
        <p className="mb-4 font-semibold italic text-center p-2 border">"{data.pelanggaran}"</p>
        <p className="mb-4">Sehubungan dengan hal tersebut, saya berjanji untuk:</p>
        <div className="mb-4 whitespace-pre-wrap pl-6">
            {data.janji.split('\n').map((item: string, index: number) => <p key={index}>{item}</p>)}
        </div>
        <p className="mb-6">Apabila di kemudian hari saya mengulangi perbuatan tersebut atau melanggar tata tertib lainnya, maka saya bersedia menerima sanksi sesuai dengan peraturan yang berlaku di {schoolInfo?.schoolName}.</p>
        <p>Demikian surat pernyataan ini saya buat dengan sadar dan tanpa ada paksaan dari pihak manapun.</p>
        <div className="mt-12 flex justify-between text-center">
            <div>
                <p className="mb-20">Mengetahui,</p>
                <p className="font-bold underline">{data.waliKelas}</p>
                <p>Wali Kelas</p>
            </div>
            <div>
                <p>{schoolInfo?.schoolName}, {data.tanggalSurat}</p>
                <p className="mb-20">Yang Membuat Pernyataan,</p>
                <p className="font-bold underline">{data.siswa.nama}</p>
                <p>Siswa</p>
            </div>
        </div>
    </div>
);

const SuratPanggilanTemplate = ({ data, schoolInfo }: { data: any, schoolInfo: SchoolInfo | null }) => (
    <div className="printable-letter">
        <div className="flex items-center gap-4 mb-4 border-b-2 border-black pb-4">
             {schoolInfo?.logo && <img src={schoolInfo.logo} alt="Logo" className="h-20 w-20 object-contain" />}
             <div className="text-center flex-1">
                 <h2 className="text-xl font-bold uppercase">PEMERINTAH KABUPATEN TORAJA UTARA</h2>
                 <h3 className="text-2xl font-bold uppercase">DINAS PENDIDIKAN</h3>
                 <h4 className="text-3xl font-bold uppercase">{schoolInfo?.schoolName}</h4>
                 <p className="text-xs">Alamat: Jl. Pendidikan No. 123, Toraja Utara, Kode Pos 91853</p>
             </div>
        </div>
        <p className="text-right mb-6">{schoolInfo?.schoolName}, {data.tanggalSurat}</p>
        <table>
            <tbody>
                <tr><td>Nomor</td><td className="px-2">: .../.../...</td></tr>
                <tr><td>Lampiran</td><td className="px-2">: -</td></tr>
                <tr><td>Perihal</td><td className="px-2">: <strong>Panggilan Orang Tua/Wali Murid</strong></td></tr>
            </tbody>
        </table>
        <p className="mt-6 mb-4">Kepada Yth.<br/>Bapak/Ibu Orang Tua/Wali dari siswa an. <strong>{data.siswa.nama}</strong><br/>di Tempat</p>
        <p className="mb-4">Dengan hormat,</p>
        <p className="mb-4 text-justify indent-8">Sehubungan dengan adanya beberapa hal yang perlu kami sampaikan terkait dengan perkembangan Ananda di sekolah, khususnya mengenai {data.alasan}, maka kami mengharap kehadiran Bapak/Ibu Orang Tua/Wali untuk dapat hadir di sekolah pada:</p>
        <table className="w-full my-4 ml-8">
             <tbody>
                <tr><td className="w-1/4">Hari, Tanggal</td><td>: {data.hari}, {format(new Date(data.tanggal), "d MMMM yyyy", { locale: id })}</td></tr>
                <tr><td>Waktu</td><td>: 09.00 WITA - Selesai</td></tr>
                <tr><td>Tempat</td><td>: Ruang Wali Kelas / Ruang BK</td></tr>
                <tr><td>Bertemu dengan</td><td>: {data.waliKelas} (Wali Kelas)</td></tr>
            </tbody>
        </table>
        <p className="mb-6 text-justify indent-8">Mengingat pentingnya permasalahan ini, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
         <div className="mt-12 flex justify-between text-center">
            <div>
                <p className="mb-20">Hormat kami,<br/>Wali Kelas</p>
                <p className="font-bold underline">{data.waliKelas}</p>
            </div>
            <div>
                 <p className="mb-20">Mengetahui,<br/>Kepala Sekolah</p>
                <p className="font-bold underline">{data.kepalaSekolah}</p>
                <p>NIP. ............................</p>
            </div>
        </div>
    </div>
);


export default function SuratPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    // Data Master
    const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
    const [siswaBinaan, setSiswaBinaan] = useState<Siswa[]>([]);
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
    const [arsipSurat, setArsipSurat] = useState<Surat[]>([]);
    const [activeTab, setActiveTab] = useState('komitmen');

    // State Formulir
    const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
    const [formData, setFormData] = useState<any>({});
    
    // State Pratinjau
    const [previewData, setPreviewData] = useState<any>(null);

    const loadData = useCallback(() => {
        setIsLoading(true);
        try {
            const user = getSourceData('currentUser', null);
            const userRole = localStorage.getItem('userRole');
            if (!user || userRole !== 'wali_kelas') {
                toast({ title: "Akses Ditolak", description: "Halaman ini khusus untuk Wali Kelas.", variant: "destructive" });
                router.push('/dashboard');
                return;
            }
            setCurrentUser(user);

            const teachersData = getSourceData('teachersData', {});
            setSchoolInfo(teachersData.schoolInfo || null);
            const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === user.nama);
            const binaan = waliKelasData?.kelas || [];

            const allSiswa = getSourceData('siswaData', []);
            setSiswaBinaan(allSiswa.filter((s: Siswa) => binaan.includes(s.kelas)));
            setArsipSurat(getSourceData('arsipSuratData', []).sort((a: Surat, b: Surat) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
        } catch (error) {
            console.error(error);
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
    
    const handleSiswaChange = (nis: string) => {
        const siswa = siswaBinaan.find(s => s.nis === nis) || null;
        setSelectedSiswa(siswa);
    };
    
    const resetForm = () => {
        setFormData({});
        setSelectedSiswa(null);
        setPreviewData(null);
    }
    
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        resetForm();
    }

    const generateLetter = (tipe: Surat['tipe']) => {
        if (!selectedSiswa) {
            toast({ title: "Gagal", description: "Silakan pilih siswa terlebih dahulu.", variant: "destructive" });
            return;
        }

        const dataSurat = {
            ...formData,
            siswa: selectedSiswa,
            waliKelas: currentUser?.nama,
            kepalaSekolah: schoolInfo?.headmasterName,
            tanggalSurat: format(new Date(), "d MMMM yyyy", { locale: id }),
        };
        
        setPreviewData({tipe, ...dataSurat});
        toast({ title: "Surat Dibuat", description: `Pratinjau surat untuk ${selectedSiswa.nama} telah dibuat.` });
    };

    const handlePrintAndArchive = () => {
        if(!previewData){
             toast({ title: "Gagal", description: "Data pratinjau tidak ditemukan.", variant: "destructive" });
             return;
        }
        
        const arsipBaru: Surat = {
            id: `surat-${Date.now()}`,
            tipe: previewData.tipe,
            tanggal: new Date().toISOString(),
            data: previewData,
            dicetakOleh: currentUser?.nama || 'Wali Kelas',
        };

        const currentArsip = getSourceData('arsipSuratData', []);
        updateSourceData('arsipSuratData', [arsipBaru, ...currentArsip]);
        
        toast({ title: "Surat Diarsipkan", description: "Membuka dialog cetak..." });
        
        setTimeout(() => {
            window.print();
        }, 500);
    };
    
    if (isLoading) {
        return <div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Pusat Administrasi Surat</h2>
                <p className="text-muted-foreground">Buat dan arsipkan surat-surat resmi untuk siswa binaan Anda.</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4 print:hidden">
                    <TabsTrigger value="komitmen"><FileSignature className="mr-2 h-4 w-4" />Komitmen Siswa</TabsTrigger>
                    <TabsTrigger value="panggilan"><Phone className="mr-2 h-4 w-4" />Panggilan Orang Tua</TabsTrigger>
                    <TabsTrigger value="kesepakatan"><Users className="mr-2 h-4 w-4" />Kesepakatan Bersama</TabsTrigger>
                    <TabsTrigger value="arsip"><Archive className="mr-2 h-4 w-4" />Arsip Surat</TabsTrigger>
                </TabsList>
                
                {/* --- FORM SURAT KOMITMEN SISWA --- */}
                <TabsContent value="komitmen" className="print:hidden">
                    <Card>
                        <CardHeader><CardTitle>Formulir Surat Komitmen Siswa</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pilih Siswa</Label>
                                    <Select onValueChange={handleSiswaChange} value={selectedSiswa?.nis || ''}>
                                        <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                                        <SelectContent>
                                            {siswaBinaan.map(s => <SelectItem key={s.nis} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="komitmen-pelanggaran">Pelanggaran yang Dilakukan</Label>
                                <Input id="komitmen-pelanggaran" onChange={(e) => setFormData(p => ({...p, pelanggaran: e.target.value}))} placeholder="Contoh: Datang terlambat lebih dari 3 kali" />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="komitmen-janji">Poin-Poin Komitmen/Janji Siswa</Label>
                                <Textarea id="komitmen-janji" onChange={(e) => setFormData(p => ({...p, janji: e.target.value}))} placeholder="Tuliskan janji yang diucapkan siswa, misal:&#10;1. Tidak akan mengulangi perbuatan tersebut.&#10;2. Akan datang ke sekolah tepat waktu." rows={4}/>
                             </div>
                             <Button onClick={() => generateLetter('Komitmen Siswa')}>Buat Surat Komitmen</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                 {/* --- FORM SURAT PANGGILAN ORTU --- */}
                <TabsContent value="panggilan" className="print:hidden">
                     <Card>
                        <CardHeader><CardTitle>Formulir Surat Panggilan Orang Tua</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                              <div className="space-y-2">
                                    <Label>Pilih Siswa</Label>
                                    <Select onValueChange={handleSiswaChange} value={selectedSiswa?.nis || ''}>
                                        <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                                        <SelectContent>
                                            {siswaBinaan.map(s => <SelectItem key={s.nis} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="panggilan-hari">Hari Pertemuan</Label>
                                    <Input id="panggilan-hari" onChange={(e) => setFormData(p => ({...p, hari: e.target.value}))} placeholder="Senin"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="panggilan-tanggal">Tanggal Pertemuan</Label>
                                    <Input id="panggilan-tanggal" type="date" onChange={(e) => setFormData(p => ({...p, tanggal: e.target.value}))} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="panggilan-alasan">Alasan Pemanggilan</Label>
                                <Textarea id="panggilan-alasan" onChange={(e) => setFormData(p => ({...p, alasan: e.target.value}))} placeholder="Terkait dengan masalah kedisiplinan dan kehadiran Ananda..." rows={3}/>
                             </div>
                             <Button onClick={() => generateLetter('Panggilan Orang Tua')}>Buat Surat Panggilan</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- FORM SURAT KESEPAKATAN --- */}
                <TabsContent value="kesepakatan" className="print:hidden">
                     <Card>
                        <CardHeader><CardTitle>Formulir Surat Kesepakatan Bersama</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="text-center text-muted-foreground p-8">Fitur ini sedang dalam pengembangan.</div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* --- ARSIP SURAT --- */}
                <TabsContent value="arsip" className="print:hidden">
                     <Card>
                        <CardHeader><CardTitle>Arsip Surat Tercetak</CardTitle><CardDescription>Riwayat semua surat yang telah dibuat dan dicetak.</CardDescription></CardHeader>
                        <CardContent>
                           <div className="overflow-x-auto">
                           <Table>
                                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Tipe Surat</TableHead><TableHead>Siswa</TableHead><TableHead>Dicetak Oleh</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {arsipSurat.length > 0 ? arsipSurat.map(surat => (
                                        <TableRow key={surat.id}>
                                            <TableCell>{format(new Date(surat.tanggal), "dd MMM yyyy, HH:mm", { locale: id })}</TableCell>
                                            <TableCell>{surat.tipe}</TableCell>
                                            <TableCell>{surat.data.siswa.nama} ({surat.data.siswa.kelas})</TableCell>
                                            <TableCell>{surat.dicetakOleh}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={4} className="text-center h-24">Belum ada surat yang diarsipkan.</TableCell></TableRow>
                                    )}
                                </TableBody>
                           </Table>
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {previewData && (
                <div className="printable-content">
                    <LetterPreview onPrint={handlePrintAndArchive}>
                        {previewData.tipe === 'Komitmen Siswa' && <SuratKomitmenTemplate data={previewData} schoolInfo={schoolInfo} />}
                        {previewData.tipe === 'Panggilan Orang Tua' && <SuratPanggilanTemplate data={previewData} schoolInfo={schoolInfo} />}
                    </LetterPreview>
                </div>
            )}
        </div>
    );
}

    