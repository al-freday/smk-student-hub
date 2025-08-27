
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookCopy, CheckSquare, Briefcase } from "lucide-react";
import { kurikulumData } from "@/lib/kurikulum-data";
import { Badge } from "@/components/ui/badge";

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

export default function StrukturKurikulumPage() {
  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Struktur Kurikulum SMK/MAK</h2>
        <p className="text-muted-foreground">
          Rincian alokasi mata pelajaran berdasarkan tingkatan kelas sesuai kurikulum yang berlaku.
        </p>
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
