
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Trophy, Star, ShieldCheck, FolderArchive, BookUser, Award } from "lucide-react";

const ekstrakurikulerData = {
  "Kepemimpinan dan Kesiswaan": ["Pramuka", "Palang Merah Remaja (PMR)", "Paskibraka", "OSIS"],
  "Olahraga": ["Futsal", "Bola Basket", "Bola Voli", "Bulu Tangkis", "Pencak Silat", "Karate"],
  "Seni dan Budaya": ["Tari (tradisional dan modern)", "Band dan Paduan Suara", "Teater", "Marching Band", "Kesenian Karawitan/Hadroh/Marawis"],
  "Kerohanian": ["Rohani Islam (Rohis)", "Rohani Kristen (Rokris)", "Seni Baca Al-Qur'an"],
  "Kejuruan/Bidang Tertentu": ["Otomotif", "Tata Busana", "Desain Grafis", "Jurnalistik dan Perfilman", "Pecinta Alam (PA)", "Karya Ilmiah Remaja (KIR)", "IT Club"],
  "Kegiatan Lain": ["Debat Bahasa Inggris atau Jepang", "Modelling", "Drumband", "Futsal", "Klub Basket"],
};

const prestasiAkademik = {
    "Nilai Rapor": "Termasuk nilai di semua mata pelajaran yang menunjukkan keunggulan akademik.",
    "Juara Kompetisi Akademik": "Menjuarai lomba-lomba seperti Olimpiade Sains Nasional (OSN), lomba karya ilmiah, atau kompetisi bidang akademik lainnya.",
    "Sertifikasi Keahlian": "Memiliki sertifikat yang membuktikan penguasaan keterampilan tertentu yang relevan dengan bidang keahlian di SMK.",
    "Publikasi Ilmiah": "Menghasilkan karya ilmiah, riset, atau publikasi yang diakui di bidang akademik.",
    "Beasiswa Prestasi": "Berhasil mendapatkan beasiswa karena prestasi akademik yang gemilang.",
};

const prestasiNonAkademik = {
    "Kepengurusan Organisasi": "Menjabat sebagai ketua di OSIS, BEM, atau organisasi ekstrakurikuler lainnya.",
    "Juara Lomba Non-akademik": "Meraih prestasi di bidang olahraga (O2SN, PON), seni (FLS2N, lomba pidato), atau bidang lainnya.",
    "Pengalaman Magang dan Kerja": "Memiliki pengalaman kerja praktik atau magang di industri yang relevan dengan jurusannya.",
    "Kegiatan Kepemudaan": "Berpartisipasi dalam organisasi kepanduan, kegiatan bakti sosial, atau menjadi relawan.",
    "Keterampilan Khusus": "Menunjukkan bakat dan keterampilan dalam bidang seni, seperti musik, drama, atau melukis.",
};

export default function EkskulPrestasiPage() {
  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ekstrakurikuler & Prestasi Siswa</h2>
        <p className="text-muted-foreground">Panduan resmi kegiatan ekstrakurikuler dan mekanisme pencatatan prestasi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* --- EKSKUL CARD --- */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen/> Daftar Ekstrakurikuler</CardTitle>
                <CardDescription>Berikut adalah daftar kegiatan ekstrakurikuler yang tersedia di sekolah.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                    {Object.entries(ekstrakurikulerData).map(([kategori, items]) => (
                        <AccordionItem value={kategori} key={kategori}>
                            <AccordionTrigger className="font-semibold">{kategori}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                                    {items.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>

        {/* --- PRESTASI CARD --- */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy/> Panduan Prestasi Siswa</CardTitle>
                    <CardDescription>Kategori prestasi yang diakui dan mekanisme pencatatannya.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Star className="text-blue-500"/> Prestasi Akademik</h3>
                        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                            {Object.entries(prestasiAkademik).map(([judul, deskripsi]) => (
                                <li key={judul}><strong>{judul}:</strong> {deskripsi}</li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Award className="text-green-500"/> Prestasi Non-Akademik</h3>
                        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                            {Object.entries(prestasiNonAkademik).map(([judul, deskripsi]) => (
                                <li key={judul}><strong>{judul}:</strong> {deskripsi}</li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cara Pencatatan Prestasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">Sertifikat dan Piagam</h4>
                            <p className="text-sm text-muted-foreground">Siswa harus menyimpan bukti otentik dari setiap prestasi yang diperoleh.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <BookUser className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">Buku Catatan Prestasi</h4>
                            <p className="text-sm text-muted-foreground">Sekolah menyediakan buku catatan khusus yang diisi dan ditandatangani oleh guru/pihak berwenang.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <FolderArchive className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">Portofolio</h4>
                            <p className="text-sm text-muted-foreground">Kumpulan bukti pencapaian untuk menunjukkan riwayat prestasi siswa secara lengkap.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
