import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const pelanggaran = [
    {
        kategori: "Disiplin Kehadiran",
        items: [
            "Terlambat masuk sekolah (≤10 menit).",
            "Terlambat masuk sekolah (>10 menit).",
            "Tidak masuk tanpa keterangan (1 hari).",
            "Membolos jam pelajaran.",
            "Meninggalkan sekolah tanpa izin.",
            "Tidak mengikuti upacara.",
            "Tidak mengikuti kegiatan wajib sekolah (ekstrakurikuler, P5).",
            "Tidur saat pelajaran.",
            "Tidak masuk saat ulangan tanpa alasan jelas.",
            "Pulang sebelum waktunya tanpa izin.",
        ],
    },
    {
        kategori: "Kerapian & Seragam",
        items: [
            "Tidak memakai seragam sesuai jadwal.",
            "Tidak memakai sepatu hitam.",
            "Tidak memakai kaos kaki putih/hitam.",
            "Tidak memakai ikat pinggang standar.",
            "Tidak memakai dasi/atribut sesuai aturan.",
            "Baju tidak dimasukkan.",
            "Rambut gondrong (putra).",
            "Rambut dicat/diwarnai.",
            "Rambut model tidak pantas (punk, mohawk, dll).",
            "Memakai aksesoris berlebihan (gelang, kalung, anting).",
        ],
    },
    {
        kategori: "Sikap & Perilaku",
        items: [
            "Tidak hormat kepada guru.",
            "Menggunakan bahasa kasar.",
            "Menghina teman/guru.",
            "Membuat keributan di kelas.",
            "Mengganggu jalannya pelajaran.",
            "Membantah guru.",
            "Tidak melaksanakan tugas piket kelas.",
            "Tidak menjaga kebersihan kelas.",
            "Mengotori fasilitas sekolah (mencoret meja, tembok, dll).",
            "Membawa makanan/minuman ke kelas saat pelajaran.",
        ],
    },
    {
        kategori: "Akademik",
        items: [
            "Tidak membawa buku pelajaran.",
            "Tidak mengerjakan PR.",
            "Tidak membawa peralatan praktik.",
            "Mencontek saat ulangan.",
            "Menyuruh orang lain mengerjakan tugas.",
            "Menggunakan HP saat ujian.",
            "Mengabaikan tugas kelompok.",
            "Tidak serius dalam praktik bengkel/lab.",
            "Menyalahgunakan peralatan bengkel/lab.",
            "Menggunakan AI/mesin untuk mencontek tanpa izin.",
        ],
    },
    {
        kategori: "Pelanggaran Sosial",
        items: [
            "Berkelahi ringan di kelas.",
            "Berkelahi di luar kelas.",
            "Menghasut teman untuk melawan guru.",
            "Membentuk geng negatif.",
            "Bullying (verbal).",
            "Bullying (fisik).",
            "Membuat unggahan negatif tentang sekolah/guru di media sosial.",
            "Menyebarkan hoaks.",
            "Membawa barang teman tanpa izin.",
            "Mengancam teman.",
        ],
    },
    {
        kategori: "Merokok & Zat Terlarang",
        items: [
            "Membawa rokok.",
            "Merokok di lingkungan sekolah.",
            "Membawa vape.",
            "Menggunakan vape.",
            "Membawa minuman keras.",
            "Mengonsumsi minuman keras.",
            "Membawa narkoba.",
            "Menggunakan narkoba.",
            "Mengedarkan narkoba.",
            "Mengajak teman memakai narkoba.",
        ],
    },
    {
        kategori: "Pelanggaran Teknologi",
        items: [
            "Membawa HP saat ujian.",
            "Menggunakan HP di kelas tanpa izin.",
            "Bermain game online saat pelajaran.",
            "Mengakses situs terlarang (porno, judi).",
            "Menyebarkan foto/video tidak pantas.",
            "Membuat konten negatif di sekolah.",
            "Membobol WiFi sekolah.",
            "Mengotak-atik komputer lab tanpa izin.",
            "Merekam guru tanpa izin.",
            "Menyalahgunakan media sosial OSIS.",
        ],
    },
    {
        kategori: "Kriminalitas",
        items: [
            "Mencuri barang teman.",
            "Mencuri barang sekolah.",
            "Merusak properti sekolah dengan sengaja.",
            "Mengambil uang kas kelas tanpa izin.",
            "Menjual barang ilegal di sekolah.",
            "Membawa senjata tajam.",
            "Membawa senjata api.",
            "Membawa petasan/bahan peledak.",
            "Melakukan pemerasan.",
            "Melakukan penganiayaan.",
        ],
    },
    {
        kategori: "Asusila",
        items: [
            "Berpacaran berlebihan di sekolah (mesra berlebihan).",
            "Membawa majalah/film porno.",
            "Mengakses situs porno.",
            "Melakukan pelecehan verbal.",
            "Melakukan pelecehan fisik.",
            "Melakukan pelecehan seksual.",
            "Pergaulan bebas (di dalam/luar sekolah).",
            "Membuat video asusila.",
            "Mengirim konten asusila lewat HP.",
            "Melakukan hubungan terlarang.",
        ],
    },
    {
        kategori: "Pelanggaran Lain",
        items: [
            "Tidak mengikuti kegiatan wajib sekolah (MOS, PKL, upacara nasional).",
            "Tidak mengikuti peringatan hari besar nasional.",
            "Tidak menjaga nama baik sekolah di luar lingkungan sekolah.",
            "Tidak menjaga fasilitas praktik industri.",
            "Menghindari kegiatan gotong royong.",
            "Membawa kendaraan bermotor tanpa SIM.",
            "Balapan liar dengan seragam sekolah.",
            "Membawa kendaraan dengan knalpot bising.",
            "Melanggar lalu lintas saat berangkat/pulang sekolah.",
            "Menggunakan narkoba/alkohol saat PKL/Prakerin.",
        ],
    },
];


export default function TataTertibPage() {
  return (
    <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
            <div>
                 <h2 className="text-3xl font-bold tracking-tight">Tata Tertib Sekolah</h2>
                 <p className="text-muted-foreground">
                    Lihat dan kelola peraturan sekolah dan poin pelanggaran.
                 </p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Peraturan
            </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Jenis Pelanggaran dan Poin</CardTitle>
                <CardDescription>
                    Berikut adalah daftar 100 butir tata tertib siswa.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {pelanggaran.map((kategori, index) => (
                        <AccordionItem value={`item-${index + 1}`} key={index}>
                            <AccordionTrigger className="font-semibold">{`${index + 1}. ${kategori.kategori}`}</AccordionTrigger>
                            <AccordionContent>
                                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                    {kategori.items.map((item, itemIndex) => (
                                        <li key={itemIndex}>{item}</li>
                                    ))}
                                </ol>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Prinsip Umum</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Siswa wajib menaati seluruh tata tertib sekolah.</li>
                        <li>Setiap pelanggaran diberikan poin sesuai tingkatannya.</li>
                        <li>Akumulasi poin berakibat pada sanksi pembinaan.</li>
                        <li>Poin pelanggaran bersifat akumulatif dalam satu tahun pelajaran.</li>
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Kategori Pelanggaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span>Ringan</span> <Badge variant="secondary">1–10 poin</Badge></div>
                    <div className="flex justify-between items-center"><span>Sedang</span> <Badge variant="default" className="bg-yellow-500">11–25 poin</Badge></div>
                    <div className="flex justify-between items-center"><span>Berat</span> <Badge variant="default" className="bg-orange-500">26–50 poin</Badge></div>
                    <div className="flex justify-between items-center"><span>Sangat Berat</span> <Badge variant="destructive">51–100 poin</Badge></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Sanksi Berdasarkan Poin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div>
                        <div className="font-semibold flex justify-between">1–25 poin <Badge variant="secondary">Ringan</Badge></div>
                        <p className="text-muted-foreground mt-1">Teguran lisan/tertulis, pemanggilan orang tua.</p>
                    </div>
                     <div>
                        <div className="font-semibold flex justify-between">26–50 poin <Badge variant="default" className="bg-yellow-500">Sedang</Badge></div>
                        <p className="text-muted-foreground mt-1">Surat peringatan 1, skorsing 1–3 hari.</p>
                    </div>
                     <div>
                        <div className="font-semibold flex justify-between">51–75 poin <Badge variant="default" className="bg-orange-500">Berat</Badge></div>
                        <p className="text-muted-foreground mt-1">Surat peringatan 2, skorsing 4–7 hari, konseling intensif.</p>
                    </div>
                     <div>
                        <div className="font-semibold flex justify-between">76–100 poin <Badge variant="destructive">Sangat Berat</Badge></div>
                        <p className="text-muted-foreground mt-1">Surat peringatan 3, pemanggilan orang tua & komite, rekomendasi pindah sekolah/DO.</p>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
