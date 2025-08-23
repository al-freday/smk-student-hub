import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotifikasiPage() {
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Notifikasi</h2>
      <p className="text-muted-foreground">
        Lihat semua pemberitahuan dan pembaruan penting.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Pemberitahuan Terbaru</CardTitle>
          <CardDescription>
            Daftar notifikasi akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten untuk notifikasi akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
