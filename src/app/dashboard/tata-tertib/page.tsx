import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TataTertibPage() {
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Tata Tertib Sekolah</h2>
      <p className="text-muted-foreground">
        Lihat dan kelola peraturan sekolah dan poin pelanggaran.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Peraturan dan Poin</CardTitle>
          <CardDescription>
            Daftar tata tertib dan poin terkait akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten untuk tata tertib akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
