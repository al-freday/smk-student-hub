
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ShieldAlert, ChevronsUpDown, Check, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { tataTertibData } from "@/lib/tata-tertib-data";
import { useRouter } from "next/navigation";

// --- Interface Definitions ---
interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

type StatusLaporan = 'Dilaporkan' | 'Ditindaklanjuti Wali Kelas' | 'Diteruskan ke BK' | 'Diteruskan ke Wakasek' | 'Selesai';

interface CatatanPelanggaran {
  id: number;
  tanggal: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  pelanggaran: string;
  poin: number;
  guruPelapor: string;
  tindakanAwal: string;
  status: StatusLaporan;
}

const flattenTataTertib = (data: typeof tataTertibData) => {
    let allRules: { id: number, deskripsi: string, poin: number }[] = [];
    let idCounter = 1;
    for (const kategori in data) {
        for (const tingkat in data[kategori as keyof typeof data]) {
            // @ts-ignore
            data[kategori as keyof typeof data][tingkat].forEach(rule => {
                allRules.push({ ...rule, id: idCounter++ });
            });
        }
    }
    return allRules;
};

export default function LaporPelanggaranPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  // --- Data States ---
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [daftarTataTertib, setDaftarTataTertib] = useState<{ id: number, deskripsi: string, poin: number }[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nama: string; role: string } | null>(null);
  
  // --- Dialog & Form States ---
  const [openSiswaPopover, setOpenSiswaPopover] = useState(false);
  const [openRulePopover, setOpenRulePopover] = useState(false);
  
  // --- Form Data States ---
  const [selectedNis, setSelectedNis] = useState<string>("");
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [tindakanAwal, setTindakanAwal] = useState("");

  const loadData = useCallback(() => {
    const user = getSourceData('currentUser', null);
    if (!user) {
        router.push('/');
        return;
    }
    setCurrentUser(user);
    
    setDaftarSiswa(getSourceData('siswaData', []));
    setDaftarTataTertib(flattenTataTertib(tataTertibData));
  }, [router]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleSaveCatatan = () => {
    const siswa = daftarSiswa.find(s => s.nis === selectedNis);
    const aturan = daftarTataTertib.find(t => t.id === selectedRuleId);

    if (!siswa || !aturan) {
      toast({ title: "Gagal Menyimpan", description: "Harap pilih siswa dan jenis pelanggaran.", variant: "destructive" });
      return;
    }
    
    const currentRiwayat = getSourceData('riwayatPelanggaran', []);
    const newCatatan: CatatanPelanggaran = {
      id: currentRiwayat.length > 0 ? Math.max(...currentRiwayat.map((c: CatatanPelanggaran) => c.id)) + 1 : 1,
      tanggal: format(new Date(), "yyyy-MM-dd"),
      nis: siswa.nis,
      namaSiswa: siswa.nama,
      kelas: siswa.kelas,
      pelanggaran: aturan.deskripsi,
      poin: aturan.poin,
      guruPelapor: currentUser?.nama || "Guru",
      tindakanAwal: tindakanAwal,
      status: 'Dilaporkan',
    };

    updateSourceData('riwayatPelanggaran', [...currentRiwayat, newCatatan]);
    
    toast({ title: "Sukses", description: "Catatan pelanggaran berhasil disimpan." });
    
    // Reset form
    setSelectedNis("");
    setSelectedRuleId(null);
    setTindakanAwal("");
  };
  

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lapor Pelanggaran Siswa</h2>
        <p className="text-muted-foreground">Gunakan formulir ini untuk mencatat pelanggaran tata tertib yang Anda saksikan.</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Formulir Pencatatan Pelanggaran</CardTitle>
            <CardDescription>Isi semua detail yang diperlukan untuk membuat laporan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><User/>Pilih Siswa</Label>
                <Popover open={openSiswaPopover} onOpenChange={setOpenSiswaPopover}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                            {selectedNis ? daftarSiswa.find(s => s.nis === selectedNis)?.nama : "Cari dan pilih siswa..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                        <Command>
                            <CommandInput placeholder="Ketik nama siswa..."/>
                            <CommandList>
                                <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                    {daftarSiswa.map(siswa => (
                                        <CommandItem key={siswa.nis} value={siswa.nama} onSelect={() => {
                                            setSelectedNis(siswa.nis);
                                            setOpenSiswaPopover(false);
                                        }}>
                                            <Check className={cn("mr-2 h-4 w-4", selectedNis === siswa.nis ? "opacity-100" : "opacity-0")}/>
                                            {siswa.nama} ({siswa.kelas})
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><ShieldAlert/>Pilih Jenis Pelanggaran</Label>
                <Popover open={openRulePopover} onOpenChange={setOpenRulePopover}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between h-auto text-left">
                            <span className="flex-1 whitespace-normal">
                                {selectedRuleId ? daftarTataTertib.find(r => r.id === selectedRuleId)?.deskripsi : "Cari dan pilih pelanggaran..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                         <Command>
                            <CommandInput placeholder="Ketik deskripsi pelanggaran..."/>
                            <CommandList>
                                <CommandEmpty>Aturan tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                    {daftarTataTertib.map(rule => (
                                        <CommandItem key={rule.id} value={rule.deskripsi} onSelect={() => {
                                            setSelectedRuleId(rule.id);
                                            setOpenRulePopover(false);
                                        }}>
                                            <Check className={cn("mr-2 h-4 w-4", selectedRuleId === rule.id ? "opacity-100" : "opacity-0")}/>
                                             {rule.deskripsi} <Badge variant="destructive" className="ml-auto">{rule.poin} Poin</Badge>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label>Tindakan Awal yang Dilakukan (Opsional)</Label>
                <Textarea value={tindakanAwal} onChange={e => setTindakanAwal(e.target.value)} placeholder="Contoh: Ditegur secara lisan di tempat."/>
            </div>
            <Button onClick={handleSaveCatatan} className="w-full">
                <Save className="mr-2 h-4 w-4"/>
                Simpan Laporan
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
