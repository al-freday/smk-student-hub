import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupervisiPage() {
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Supervisi</h2>
      <p className="text-muted-foreground">
        Catat dan lihat hasil supervisi kegiatan belajar mengajar.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Supervisi</CardTitle>
          <CardDescription>
            Daftar supervisi yang telah dilakukan akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten untuk supervisi akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
