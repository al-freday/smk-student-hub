
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserX, Shirt, Trash2, Speech, GraduationCap, WifiOff, School, ShieldAlert, BookMarked } from "lucide-react";
import { tataTertibData } from "@/lib/tata-tertib-data";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type KategoriTataTertib = keyof typeof tataTertibData;

const kategoriInfo: { [key in KategoriTataTertib]: { icon: React.ElementType, title: string, poin: string } } = {
  kehadiran: { icon: UserX, title: "Pelanggaran Kehadiran & Ketertiban", poin: "20 Poin Awal" },
  seragam: { icon: Shirt, title: "Pelanggaran Seragam & Penampilan", poin: "20 Poin Awal" },
  lingkungan: { icon: Trash2, title: "Pelanggaran Tata Tertib Kelas & Lingkungan", poin: "30 Poin Awal" },
  etika: { icon: Speech, title: "Pelanggaran Etika & Perilaku", poin: "40 Poin Awal" },
  akademik: { icon: GraduationCap, title: "Pelanggaran Akademik", poin: "20 Poin Awal" },
  teknologi: { icon: WifiOff, title: "Pelanggaran Teknologi & Media Sosial", poin: "20 Poin Awal" },
  kegiatan: { icon: School, title: "Pelanggaran Kegiatan Sekolah", poin: "30 Poin Awal" },
  hukum: { icon: ShieldAlert, title: "Pelanggaran Berat Terkait Hukum", poin: "40 Poin Awal" },
};

const getPoinBadgeVariant = (poin: number) => {
    if (poin >= 30) return "destructive";
    if (poin >= 15) return "secondary";
    return "outline";
};

export default function ManajemenTataTertibPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Buku Tata Tertib & Poin Pelanggaran</h2>
          <p className="text-muted-foreground">
            Daftar resmi peraturan sekolah beserta bobot poin sanksi untuk setiap pelanggaran.
          </p>
        </div>
        <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <BookMarked className="h-8 w-8" />
              </div>
              <div>
                <CardTitle>Sistem Poin Sanksi</CardTitle>
                <CardDescription>
                  Poin pelanggaran digunakan sebagai dasar untuk tindakan pembinaan dan sanksi lebih lanjut.
                </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold">Pelanggaran Ringan (1-10 Poin)</h4>
                <p className="text-sm text-muted-foreground">Teguran lisan dan pencatatan oleh guru piket atau wali kelas.</p>
            </div>
             <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold">Pelanggaran Sedang (11-20 Poin)</h4>
                <p className="text-sm text-muted-foreground">Pembinaan oleh wali kelas dan pemanggilan orang tua jika berulang.</p>
            </div>
             <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold">Pelanggaran Berat (21-40 Poin)</h4>
                <p className="text-sm text-muted-foreground">Penanganan langsung oleh Guru BK/Wakasek, sanksi khusus, hingga skorsing.</p>
            </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-4">
        {(Object.keys(tataTertibData) as KategoriTataTertib[]).map((kategori) => {
          const info = kategoriInfo[kategori];
          const Icon = info.icon;
          return (
            <AccordionItem value={kategori} key={kategori} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary rounded-md text-primary">
                        <Icon className="h-6 w-6"/>
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-lg">{info.title}</h3>
                        <p className="text-sm text-muted-foreground">{info.poin}</p>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="border-t">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Tingkat</TableHead>
                                <TableHead>Deskripsi Pelanggaran</TableHead>
                                <TableHead className="text-center w-[100px]">Poin</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {Object.entries(tataTertibData[kategori]).map(([tingkat, items]) => (
                                items.map((item, index) => (
                                     <TableRow key={`${kategori}-${tingkat}-${index}`}>
                                        {index === 0 && (
                                            <TableCell rowSpan={items.length} className="font-medium capitalize align-top">
                                                {tingkat}
                                            </TableCell>
                                        )}
                                        <TableCell>{item.deskripsi}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getPoinBadgeVariant(item.poin)}>{item.poin}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  );
}
