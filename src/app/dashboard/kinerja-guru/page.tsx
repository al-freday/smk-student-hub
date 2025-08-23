import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function KinerjaGuruPage() {
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Kinerja Guru & Staf</h2>
      <p className="text-muted-foreground">
        Pantau kinerja Wali Kelas, Guru BK, Guru Pembimbing, dan Guru Mapel.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Kinerja</CardTitle>
          <CardDescription>
            Grafik dan data kinerja guru akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten untuk kinerja guru akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
