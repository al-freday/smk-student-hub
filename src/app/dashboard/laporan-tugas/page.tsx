
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import ReportPreview from "@/components/report-preview";

export default function LaporanTugasPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<{ nama: string, role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const reportStorageKey = 'waliKelasReportsStatus'; // Using a shared key for simplicity

  useEffect(() => {
    const user = getSourceData('currentUser', null);
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleSubmitReport = () => {
    if (!currentUser) return;
    
    // In a real app, this would be a database operation.
    // Here, we simulate it by updating a status in localStorage.
    const savedStatuses = getSourceData(reportStorageKey, {});
    const teachersData = getSourceData('teachersData', {});
    const usersInRole = teachersData[currentUser.role] || [];
    const currentUserData = usersInRole.find((u: any) => u.nama === currentUser.nama);

    if (currentUserData) {
        savedStatuses[currentUserData.id] = 'Terkirim';
        updateSourceData(reportStorageKey, savedStatuses);
        toast({
            title: "Laporan Terkirim",
            description: "Laporan tugas Anda telah berhasil dikirim ke Wakasek Kesiswaan.",
        });
    } else {
         toast({
            title: "Gagal Mengirim",
            description: "Data pengguna tidak ditemukan. Laporan tidak dapat dikirim.",
            variant: "destructive"
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pusat Laporan Tugas</h2>
        <p className="text-muted-foreground">
          Buat, pratinjau, dan kirimkan laporan penugasan bulanan Anda di sini.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <CardTitle className="flex items-center gap-2">
                    <FileText />
                    Laporan Tugas Bulanan
                </CardTitle>
                <CardDescription>
                    Sistem akan mengumpulkan data dari administrasi yang telah Anda isi. Klik kirim untuk meneruskan laporan ke Wakasek.
                </CardDescription>
             </div>
             <Button onClick={handleSubmitReport}>
                <Send className="mr-2 h-4 w-4" />
                Kirim Laporan
             </Button>
          </div>
        </CardHeader>
        <CardContent>
            <ReportPreview role={currentUser?.role || ''} />
        </CardContent>
      </Card>
    </div>
  );
}
