
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Shield, UserCog, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSourceData } from "@/lib/data-manager";
import { Button } from "@/components/ui/button";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Jadwal {
  id: number;
  hari: string;
  sesi: string;
  kelas: string;
  mataPelajaran: string;
  guru: string;
}

interface GuruMapel {
    id: number;
    nama: string;
    teachingAssignments?: TeachingAssignment[];
}

interface TeachingAssignment {
  id: number;
  subject: string;
  className: string;
  day: string;
  session: string;
}

const daftarHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const getGradeLevel = (className: string) => {
    if (className.startsWith("X ")) return "Kelas X";
    if (className.startsWith("XI ")) return "Kelas XI";
    if (className.startsWith("XII ")) return "Kelas XII";
    return null;
};

export default function JadwalPelajaranPage() {
  const { toast } = useToast();
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [daftarKelas, setDaftarKelas] = useState<{nama: string}[]>([]);
  const [waliKelasMap, setWaliKelasMap] = useState<{ [key: string]: string }>({});
  const [guruPiketMap, setGuruPiketMap] = useState<{ [key: string]: string[] }>({});
  const [guruBkMap, setGuruBkMap] = useState<{ [key: string]: string[] }>({});

  const loadData = () => {
    setIsLoading(true);
    try {
        const teachersData = getSourceData('teachersData', {});
        const kelasData = getSourceData('kelasData', []);
        
        setDaftarKelas(kelasData);
        
        // Generate Jadwal from Guru Mapel assignments
        const guruMapelList: GuruMapel[] = teachersData.guru_mapel || [];
        const generatedJadwal: Jadwal[] = [];
        if (Array.isArray(guruMapelList)) {
            guruMapelList.forEach(guru => {
                if (Array.isArray(guru.teachingAssignments)) {
                    guru.teachingAssignments.forEach(assignment => {
                        generatedJadwal.push({
                            id: assignment.id,
                            hari: assignment.day,
                            sesi: assignment.session,
                            kelas: assignment.className,
                            mataPelajaran: assignment.subject,
                            guru: guru.nama,
                        });
                    });
                }
            });
        }
        setJadwal(generatedJadwal);

        // Populate Wali Kelas Map
        const waliKelasList = teachersData.wali_kelas || [];
        const newWaliKelasMap: { [key: string]: string } = {};
        if (Array.isArray(waliKelasList)) {
            waliKelasList.forEach((wali: any) => {
                if (Array.isArray(wali.kelas)) {
                    wali.kelas.forEach((kelas: string) => {
                        newWaliKelasMap[kelas] = wali.nama;
                    });
                }
            });
        }
        setWaliKelasMap(newWaliKelasMap);
        
        // Populate Guru Piket Map
        const guruPiketList = teachersData.guru_piket || [];
        const newGuruPiketMap: { [key: string]: string[] } = {};
         if (Array.isArray(guruPiketList)) {
            guruPiketList.forEach((guru: any) => {
                const piketDates = guru.tanggalPiket || [];
                piketDates.forEach((piketDate: string) => {
                    const dayOfWeek = daftarHari[new Date(piketDate).getDay() -1];
                    if (dayOfWeek) {
                         if (!newGuruPiketMap[dayOfWeek]) {
                            newGuruPiketMap[dayOfWeek] = [];
                        }
                        newGuruPiketMap[dayOfWeek].push(guru.nama);
                    }
                });
            });
        }
        setGuruPiketMap(newGuruPiketMap);

        // Populate Guru BK Map
        const guruBkList = teachersData.guru_bk || [];
        const newGuruBkMap: { [key: string]: string[] } = {};
        if (Array.isArray(guruBkList)) {
            guruBkList.forEach((guru: any) => {
                if (guru.tugasKelas) {
                    if (!newGuruBkMap[guru.tugasKelas]) {
                        newGuruBkMap[guru.tugasKelas] = [];
                    }
                    newGuruBkMap[guru.tugasKelas].push(guru.nama);
                }
            });
        }
        setGuruBkMap(newGuruBkMap);
        
        toast({ title: "Sinkronisasi Berhasil", description: "Jadwal pelajaran telah dimuat otomatis dari data penugasan guru." });

    } catch(error) {
        console.error("Gagal memuat data terintegrasi:", error);
        toast({ title: "Gagal Memuat", description: "Terjadi kesalahan saat sinkronisasi data.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => {
        window.removeEventListener('dataUpdated', loadData);
    }
  }, []);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    toast({ title: "Membuat PDF...", description: "Harap tunggu sebentar, proses ini mungkin memakan waktu beberapa saat." });
    
    const canvas = await html2canvas(element, {
        scale: 2, // Meningkatkan resolusi
    });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const newImgWidth = pdfWidth;
    const newImgHeight = newImgWidth / ratio;
    
    let heightLeft = imgHeight;
    let position = 0;
    const pageMargin = 10;
    
    // Konversi width dan height ke mm
    const imgWidthMM = (newImgWidth * 0.264583);
    const imgHeightMM = (newImgHeight * 0.264583);
    const pageHeightMM = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(data, 'PNG', pageMargin, position + pageMargin, imgWidthMM - (pageMargin*2), imgHeightMM);
    heightLeft -= pageHeightMM * (imgHeight / imgHeightMM); // menyesuaikan sisa tinggi

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight; // perbarui posisi
      pdf.addPage();
      pdf.addImage(data, 'PNG', pageMargin, position + pageMargin, imgWidthMM - (pageMargin*2), imgHeightMM);
      heightLeft -= pageHeightMM * (imgHeight / imgHeightMM);
    }

    pdf.save('jadwal-pelajaran.pdf');

    toast({ title: "Sukses", description: "Jadwal pelajaran telah berhasil diunduh sebagai PDF." });
  };

  const jadwalByHari = daftarHari.map(hari => ({
    hari,
    jadwal: jadwal.filter(j => j.hari === hari),
    piket: guruPiketMap[hari] || [],
  }));

  if (isLoading) {
      return (
          <div className="flex-1 space-y-6 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jadwal Pelajaran Otomatis</h2>
          <p className="text-muted-foreground">Jadwal ini dihasilkan secara otomatis dari menu Manajemen Guru.</p>
        </div>
        <Button onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Unduh PDF
        </Button>
      </div>

      <div ref={printRef} className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {jadwalByHari.map(({ hari, jadwal: jadwalHari, piket }) => (
          <Card key={hari}>
            <CardHeader>
              <CardTitle>{hari}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 pt-1">
                 <Shield className="h-4 w-4" />
                 Guru Piket: {piket.length > 0 ? piket.join(', ') : 'Belum Ditentukan'}
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                  {daftarKelas.map(kelas => {
                    const jadwalKelas = jadwalHari.filter(j => j.kelas === kelas.nama).sort((a,b) => a.sesi.localeCompare(b.sesi));
                    const waliKelas = waliKelasMap[kelas.nama] || "Belum Ditentukan";
                    const gradeLevel = getGradeLevel(kelas.nama);
                    const guruBk = gradeLevel ? guruBkMap[gradeLevel]?.join(', ') || "Belum Ditentukan" : "Belum Ditentukan";
                    
                    if(jadwalKelas.length === 0) return null;

                    return (
                      <AccordionItem value={`${hari}-${kelas.nama}`} key={`${hari}-${kelas.nama}`}>
                        <AccordionTrigger>
                           <div>
                                <span className="font-semibold">{kelas.nama}</span>
                                <div className="text-xs text-muted-foreground font-normal flex flex-col sm:flex-row sm:gap-4 items-start text-left">
                                    <p className="flex items-center gap-1.5"><User className="h-3 w-3" />Wali Kelas: {waliKelas}</p>
                                    <p className="flex items-center gap-1.5"><UserCog className="h-3 w-3" />Guru BK: {guruBk}</p>
                                </div>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Jam Ke-</TableHead>
                                  <TableHead>Mata Pelajaran</TableHead>
                                  <TableHead>Guru</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {jadwalKelas.map((j) => (
                                  <TableRow key={j.id}>
                                    <TableCell className="font-medium text-center">{j.sesi}</TableCell>
                                    <TableCell>{j.mataPelajaran}</TableCell>
                                    <TableCell>{j.guru}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

    