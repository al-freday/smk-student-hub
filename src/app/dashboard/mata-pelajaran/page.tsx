
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookCopy, CheckSquare, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const kurikulumData = {
  kelas_x: {
    nama: "Kelas X SMK/MAK",
    deskripsi: "Total JP per tahun: 1.728 (alokasi intrakurikuler dan projek)",
    kelompok: [
      {
        nama: "A. Kelompok Mata Pelajaran Umum",
        subjects: [
          { nama: "Pendidikan Agama dan Budi Pekerti", catatan: "Siswa memilih salah satu: Islam, Kristen, Katolik, Buddha, Hindu, atau Khonghucu" },
          { nama: "Pendidikan Pancasila" },
          { nama: "Bahasa Indonesia" },
          { nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan" },
          { nama: "Sejarah" },
          { nama: "Seni Budaya", catatan: "Minimal 1 jenis seni: Musik, Rupa, Teater, atau Tari" },
          { nama: "Muatan Lokal Bahasa Jawa" },
        ],
      },
      {
        nama: "B. Kelompok Mata Pelajaran Kejuruan",
        subjects: [
          { nama: "Matematika" },
          { nama: "Bahasa Inggris" },
          { nama: "Informatika" },
          { nama: "Projek Ilmu Pengetahuan Alam dan Sosial" },
          { nama: "Dasar-dasar Program Keahlian" },
        ],
      },
    ],
  },
  kelas_xi: {
    nama: "Kelas XI SMK/MAK",
    deskripsi: "Total JP per tahun: 1.728 (penekanan lebih pada kejuruan)",
    kelompok: [
      {
        nama: "A. Kelompok Mata Pelajaran Umum",
        subjects: [
          { nama: "Pendidikan Agama dan Budi Pekerti", catatan: "Siswa memilih salah satu sesuai agamanya" },
          { nama: "Pendidikan Pancasila" },
          { nama: "Bahasa Indonesia" },
          { nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan" },
          { nama: "Sejarah" },
          { nama: "Muatan Lokal Bahasa Jawa" },
        ],
      },
      {
        nama: "B. Kelompok Mata Pelajaran Kejuruan",
        subjects: [
          { nama: "Matematika" },
          { nama: "Bahasa Inggris" },
          { nama: "Mata Pelajaran Konsentrasi Keahlian", catatan: "Disesuaikan dengan program keahlian spesifik" },
          { nama: "Projek Kreatif dan Kewirausahaan" },
          { nama: "Mata Pelajaran Pilihan", catatan: "Siswa memilih mata pelajaran tambahan sesuai minat" },
        ],
      },
    ],
  },
  kelas_xii: {
    nama: "Kelas XII SMK/MAK",
    deskripsi: "Fokus utama pada praktik kerja lapangan dan konsentrasi keahlian",
    kelompok: [
      {
        nama: "A. Kelompok Mata Pelajaran Umum",
        subjects: [
          { nama: "Pendidikan Agama dan Budi Pekerti", catatan: "Siswa memilih salah satu, waktu disesuaikan" },
          { nama: "Pendidikan Pancasila" },
          { nama: "Bahasa Indonesia" },
          { nama: "Muatan Lokal Bahasa Jawa" },
        ],
      },
      {
        nama: "B. Kelompok Mata Pelajaran Kejuruan",
        subjects: [
          { nama: "Matematika" },
          { nama: "Bahasa Inggris" },
          { nama: "Mata Pelajaran Konsentrasi Keahlian", catatan: "Disesuaikan dengan program keahlian" },
          { nama: "Projek Kreatif dan Kewirausahaan" },
          { nama: "Praktik Kerja Lapangan (PKL)", catatan: "Komponen utama dengan alokasi waktu tinggi" },
          { nama: "Mata Pelajaran Pilihan", catatan: "Siswa memilih mata pelajaran tambahan" },
        ],
      },
    ],
  },
};


type Subject = {
  nama: string;
  catatan?: string;
};

type Kelompok = {
  nama: string;
  subjects: Subject[];
};

type Tingkatan = {
  nama: string;
  deskripsi: string;
  kelompok: Kelompok[];
};

const renderSubjectList = (subjects: Subject[]) => (
  <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
    {subjects.map((subject, index) => (
      <li key={index}>
        <span>{subject.nama}</span>
        {subject.catatan && (
          <p className="text-xs italic text-primary/80 pl-2">- {subject.catatan}</p>
        )}
      </li>
    ))}
  </ul>
);

export default function MataPelajaranPage() {
    
  const handlePrint = () => {
    window.print();
  };
    
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Struktur Kurikulum & Mata Pelajaran</h2>
          <p className="text-muted-foreground">
            Rincian alokasi mata pelajaran berdasarkan tingkatan kelas sesuai kurikulum yang berlaku.
          </p>
        </div>
        <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Halaman
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="kelas_x">
        {(Object.keys(kurikulumData) as Array<keyof typeof kurikulumData>).map((key) => {
          const tingkatan: Tingkatan = kurikulumData[key];
          return (
            <AccordionItem value={key} key={key} className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="p-4 hover:no-underline bg-muted/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <BookCopy className="h-6 w-6"/>
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-xl">{tingkatan.nama}</h3>
                        <p className="text-sm text-muted-foreground font-normal">{tingkatan.deskripsi}</p>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="border-t p-6 grid md:grid-cols-2 gap-6">
                  {tingkatan.kelompok.map((kelompok, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-2 mb-4">
                        {kelompok.nama.includes("Umum") ? 
                            <CheckSquare className="h-5 w-5 text-accent"/> : 
                            <Briefcase className="h-5 w-5 text-accent"/>
                        }
                        <h4 className="font-semibold text-lg">{kelompok.nama}</h4>
                      </div>
                      {renderSubjectList(kelompok.subjects)}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
