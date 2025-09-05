
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import TeacherReportContent from "@/components/teacher-report-content";

export default function LaporanTugasPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<{ id: string | number, nama: string, role: string, roleKey: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const reportStorageKey = 'waliKelasReportsStatus';

  const getRoleKeyFromName = (roleName: string) => {
    const roles: { [key: string]: string } = {
        'Wali Kelas': 'wali_kelas',
        'Guru BK': 'guru_bk',
        'Guru Mapel': 'guru_mapel',
        'Guru Piket': 'guru_piket',
        'Guru Pendamping': 'guru_pendamping',
        'Wakasek Kesiswaan': 'wakasek_kesiswaan',
    };
    return roles[roleName] || 'unknown';
  }

  useEffect(() => {
    const user = getSourceData('currentUser', null);
    if (user) {
        const roleKey = getRoleKeyFromName(user.role);
        const teachersData = getSourceData('teachersData', {});
        const guruData = (teachersData[roleKey] || []).find((g: any) => g.nama === user.nama);
        setCurrentUser({ ...user, roleKey, id: guruData?.id || 0 });
    }
    setIsLoading(false);
  }, []);

  const handleSubmitReport = () => {
    if (!currentUser) return;
    
    const savedStatuses = getSourceData(reportStorageKey, {});
    savedStatuses[currentUser.id] = 'Terkirim';
    updateSourceData(reportStorageKey, savedStatuses);

    toast({
        title: "Laporan Terkirim",
        description: "Laporan tugas Anda telah berhasil dikirim ke Wakasek Kesiswaan.",
    });
  };

  if (isLoading || !currentUser) {
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
            <div className="p-4 md:p-8 border rounded-lg bg-muted/50">
                <TeacherReportContent guruId={currentUser.id} roleKey={currentUser.roleKey} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
