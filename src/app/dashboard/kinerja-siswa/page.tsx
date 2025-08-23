import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function KinerjaSiswaPage() {
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Kinerja Siswa</h2>
       <p className="text-muted-foreground">
        Pantau absensi, pelanggaran, dan prestasi siswa secara keseluruhan.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Kinerja Siswa</CardTitle>
           <CardDescription>
            Data dan analisis kinerja siswa akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten untuk kinerja siswa akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
