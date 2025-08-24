
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, PieChart, CheckSquare, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";

type ReportStatus = 'Masuk' | 'Diproses' | 'Selesai';

interface ReceivedReport {
  id: number;
  status: ReportStatus;
}

interface ReportStats {
    total: number;
    masuk: number;
    diproses: number;
    selesai: number;
}

export default function RekapProgramGuruBkPage() {
    const { toast } = useToast();
    const [reportStats, setReportStats] = useState<ReportStats>({ total: 0, masuk: 0, diproses: 0, selesai: 0 });
    const [summary, setSummary] = useState("");

    useEffect(() => {
        const reportStorageKey = 'guruBkIntegratedReports';
        const savedReports = localStorage.getItem(reportStorageKey);
        if (savedReports) {
            const reports: ReceivedReport[] = JSON.parse(savedReports);
            const stats = reports.reduce((acc, report) => {
                acc.total++;
                if (report.status === 'Masuk') acc.masuk++;
                else if (report.status === 'Diproses') acc.diproses++;
                else if (report.status === 'Selesai') acc.selesai++;
                return acc;
            }, { total: 0, masuk: 0, diproses: 0, selesai: 0 });
            setReportStats(stats);
        }
    }, []);

    const handleSendReport = () => {
        if (!summary.trim()) {
            toast({
                title: "Gagal Mengirim",
                description: "Harap isi ringkasan program terlebih dahulu.",
                variant: "destructive",
            });
            return;
        }
        
        // Simulasi pengiriman laporan
        console.log("Laporan yang dikirim:", {
            stats: reportStats,
            summary: summary,
        });

        toast({
            title: "Laporan Terkirim",
            description: "Rekapitulasi program BK telah berhasil dikirim ke Wakasek Kesiswaan.",
        });
        setSummary("");
    };

    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Rekapitulasi Program BK</h2>
                <p className="text-muted-foreground">
                    Buat ringkasan program dan laporan untuk dikirimkan kepada Wakasek Kesiswaan.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart />
                        Statistik Penanganan Kasus
                    </CardTitle>
                    <CardDescription>
                        Data ini ditarik secara otomatis dari halaman Layanan Konseling.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                     <div className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                        <FileText className="h-8 w-8 text-primary"/>
                        <div>
                            <p className="text-2xl font-bold">{reportStats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Kasus</p>
                        </div>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                        <FileText className="h-8 w-8 text-yellow-500"/>
                        <div>
                            <p className="text-2xl font-bold">{reportStats.masuk}</p>
                            <p className="text-sm text-muted-foreground">Kasus Masuk</p>
                        </div>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                        <FileText className="h-8 w-8 text-blue-500"/>
                        <div>
                            <p className="text-2xl font-bold">{reportStats.diproses}</p>
                            <p className="text-sm text-muted-foreground">Sedang Diproses</p>
                        </div>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                        <CheckSquare className="h-8 w-8 text-green-500"/>
                        <div>
                            <p className="text-2xl font-bold">{reportStats.selesai}</p>
                            <p className="text-sm text-muted-foreground">Telah Selesai</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Ringkasan, Evaluasi, dan Rencana Tindak Lanjut</CardTitle>
                    <CardDescription>
                        Tuliskan kesimpulan dari program yang telah berjalan dan rencana untuk periode berikutnya.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="summary">Ringkasan Laporan</Label>
                        <Textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Contoh: Selama periode ini, sebagian besar kasus yang ditangani berkaitan dengan masalah kedisiplinan. Rencana tindak lanjut akan fokus pada program pencegahan..."
                            className="min-h-[150px]"
                        />
                    </div>
                    <Button onClick={handleSendReport}>
                        <Send className="mr-2 h-4 w-4" />
                        Kirim Laporan ke Wakasek
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
