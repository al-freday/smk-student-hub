
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PengaturanPage() {
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
        toast({ title: "Gagal", description: "Password baru dan konfirmasi tidak cocok.", variant: "destructive" });
        return;
    }
    if (newPassword.length < 6) {
        toast({ title: "Gagal", description: "Password baru minimal harus 6 karakter.", variant: "destructive" });
        return;
    }
    // Logika ganti password (simulasi)
    toast({
        title: "Password Diperbarui",
        description: "Password Anda telah berhasil diubah.",
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h2>
        <p className="text-muted-foreground">
          Kelola pengaturan keamanan akun Anda.
        </p>
      </div>

      <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>Ganti password Anda secara berkala untuk menjaga keamanan akun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
              <Label htmlFor="current-password">Password Saat Ini</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button onClick={handleChangePassword} className="w-full">
                <KeyRound className="mr-2 h-4 w-4"/>
                Ubah Password
            </Button>
          </CardContent>
      </Card>
    </div>
  );
}
