import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ManajemenSiswaPage() {
  return (
    <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Siswa</h2>
                <p className="text-muted-foreground">Kelola data siswa di sekolah.</p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Siswa
            </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Data siswa yang terdaftar akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten untuk daftar siswa akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
