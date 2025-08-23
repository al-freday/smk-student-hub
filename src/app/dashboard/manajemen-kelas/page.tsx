import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManajemenKelasPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h2>
            <p className="text-muted-foreground">Kelola data kelas dan jumlah siswa di setiap kelas.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Kelas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>
            Berikut adalah daftar kelas yang terdaftar di sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten untuk daftar kelas akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
