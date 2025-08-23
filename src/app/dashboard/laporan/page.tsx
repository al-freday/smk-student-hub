import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaporanPage() {
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Pusat Laporan</h2>
      <p className="text-muted-foreground">
        Hasilkan dan unduh laporan kesiswaan.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Buat Laporan Baru</CardTitle>
          <CardDescription>
            Pilih jenis laporan yang ingin Anda buat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Opsi untuk membuat berbagai jenis laporan akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
