import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function JadwalPelajaranPage() {
  return (
    <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Jadwal Pelajaran</h2>
                <p className="text-muted-foreground">Kelola jadwal pelajaran untuk setiap kelas.</p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Buat Jadwal Baru
            </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jadwal</CardTitle>
          <CardDescription>
            Jadwal pelajaran yang sudah diinput akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten untuk jadwal pelajaran akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
