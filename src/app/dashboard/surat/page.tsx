
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

const LetterPreview = ({ children, onPrint }: { children: React.ReactNode, onPrint: () => void }) => (
    <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Pratinjau Surat</h3>
            <Button onClick={onPrint}><Printer className="mr-2 h-4 w-4" /> Cetak Surat</Button>
        </div>
        <div id="print-area" className="p-8 border rounded-lg bg-white text-black font-serif">
            {children}
        </div>
    </div>
);

export default function SuratPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    // Data Master
    const [currentUser, setCurrentUser] = useState<{ nama: string } | null>(null);
    const [kelasBinaan, setKelasBinaan] = useState<string[]>([]);
    const [siswaBinaan, setSiswaBinaan] = useState<Siswa[]>([]);
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
    const [arsipSurat, setArsipSurat] = useState<Surat[]>([]);

    // State Formulir
    const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
    const [formData, setFormData] = useState<any>({});
    
    // State Pratinjau
    const [previewData, setPreviewData] = useState<any>(null);

    const loadData = useCallback(() => {
        setIsLoading(true);
        try {
            const user = getSourceData('currentUser', null);
            if (!user || localStorage.getItem('userRole') !== 'wali_kelas') {
                router.push('/dashboard');
                return;
            }
            setCurrentUser(user);

            const teachersData = getSourceData('teachersData', {});
            setSchoolInfo(teachersData.schoolInfo || null);
            const waliKelasData = teachersData.wali_kelas?.find((wk: any) => wk.nama === user.nama);
            const binaan = waliKelasData?.kelas || [];
            setKelasBinaan(binaan);

            const allSiswa = getSourceData('siswaData', []);
            setSiswaBinaan(allSiswa.filter((s: Siswa) => binaan.includes(s.kelas)));
            setArsipSurat(getSourceData('arsipSuratData', []));
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
        
        const arsipBaru: Surat = {
            id: `surat-${Date.now()}`,
            tipe: tipe,
            tanggal: new Date().toISOString(),
            data: dataSurat,
            dicetakOleh: currentUser?.nama || 'Wali Kelas',
        };

        const currentArsip = getSourceData('arsipSuratData', []);
        updateSourceData('arsipSuratData', [arsipBaru, ...currentArsip]);
        
        setPreviewData(dataSurat);
        toast({ title: "Surat Dibuat", description: `Pratinjau surat untuk ${selectedSiswa.nama} telah dibuat.` });
    };

    const handlePrint = () => {
        const printContents = document.getElementById("print-area")?.innerHTML;
        if (printContents) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            // Reload to re-attach React listeners
            window.location.reload();
        }
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

            <Tabs defaultValue="komitmen" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="komitmen"><FileSignature className="mr-2 h-4 w-4" />Komitmen Siswa</TabsTrigger>
                    <TabsTrigger value="panggilan"><Phone className="mr-2 h-4 w-4" />Panggilan Orang Tua</TabsTrigger>
                    <TabsTrigger value="kesepakatan"><Users className="mr-2 h-4 w-4" />Kesepakatan Bersama</TabsTrigger>
                    <TabsTrigger value="arsip"><Archive className="mr-2 h-4 w-4" />Arsip Surat</TabsTrigger>
                </TabsList>
                
                {/* --- FORM SURAT KOMITMEN SISWA --- */}
                <TabsContent value="komitmen">
                    <Card>
                        <CardHeader><CardTitle>Formulir Surat Komitmen Siswa</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pilih Siswa</Label>
                                    <Select onValueChange={handleSiswaChange}>
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
                             {previewData && <LetterPreview onPrint={handlePrint}>{/* ... template surat ... */}</LetterPreview>}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                 {/* --- FORM SURAT PANGGILAN ORTU --- */}
                <TabsContent value="panggilan">
                     <Card>
                        <CardHeader><CardTitle>Formulir Surat Panggilan Orang Tua</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                              <div className="space-y-2">
                                    <Label>Pilih Siswa</Label>
                                    <Select onValueChange={handleSiswaChange}>
                                        <SelectTrigger><SelectValue placeholder="Pilih siswa..." /></SelectTrigger>
                                        <SelectContent>
                                            {siswaBinaan.map(s => <SelectItem key={s.nis} value={s.nis}>{s.nama} ({s.kelas})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="panggilan-hari">Hari</Label>
                                    <Input id="panggilan-hari" onChange={(e) => setFormData(p => ({...p, hari: e.target.value}))} placeholder="Senin"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="panggilan-tanggal">Tanggal</Label>
                                    <Input id="panggilan-tanggal" type="date" onChange={(e) => setFormData(p => ({...p, tanggal: e.target.value}))} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="panggilan-alasan">Alasan Pemanggilan</Label>
                                <Textarea id="panggilan-alasan" onChange={(e) => setFormData(p => ({...p, alasan: e.target.value}))} placeholder="Terkait dengan masalah kedisiplinan dan kehadiran Ananda..." rows={3}/>
                             </div>
                             <Button onClick={() => generateLetter('Panggilan Orang Tua')}>Buat Surat Panggilan</Button>
                             {previewData && <LetterPreview onPrint={handlePrint}>{/* ... template surat ... */}</LetterPreview>}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- FORM SURAT KESEPAKATAN --- */}
                <TabsContent value="kesepakatan">
                     <Card>
                        <CardHeader><CardTitle>Formulir Surat Kesepakatan Bersama</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           {/* Formulir untuk surat kesepakatan bisa ditambahkan di sini */}
                           <div className="text-center text-muted-foreground p-8">Fitur ini sedang dalam pengembangan.</div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* --- ARSIP SURAT --- */}
                <TabsContent value="arsip">
                     <Card>
                        <CardHeader><CardTitle>Arsip Surat Tercetak</CardTitle></CardHeader>
                        <CardContent>
                           {/* Tabel riwayat surat bisa ditampilkan di sini */}
                           <div className="text-center text-muted-foreground p-8">Fitur ini sedang dalam pengembangan.</div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    