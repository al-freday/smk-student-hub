
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LaporanPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole') || null;
    setUserRole(role);
    // Redirect to the new unified report page for Wakasek
    if (role === 'wakasek_kesiswaan') {
      router.replace('/dashboard/laporan-wakasek');
    }
  }, [router]);

  // Render a loader while redirecting for wakasek
  if (!userRole || userRole === 'wakasek_kesiswaan') {
    return (
      <div className="flex-1 space-y-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // This part of the component will now effectively be unused for wakasek
  // but we keep it for potential future roles.
  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Laporan</h2>
        <p className="text-muted-foreground">Pilih jenis laporan yang ingin Anda lihat atau buat.</p>
      </div>
       <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Tidak Ada Laporan Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Tidak ada jenis laporan yang tersedia untuk peran Anda saat ini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
