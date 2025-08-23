import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PengaturanPage() {
  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
      <p className="text-muted-foreground">
        Kelola pengaturan akun dan aplikasi Anda.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Profil Akun</CardTitle>
          <CardDescription>
            Ubah informasi profil Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Formulir untuk pengaturan akun akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
