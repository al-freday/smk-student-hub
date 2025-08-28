
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, MoreHorizontal, CheckCircle, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Guru {
  id: number | string;
  nama: string;
  kelas?: string[];
}

type ReportStatus = 'Belum Mengirim' | 'Terkirim' | 'Diproses' | 'Diterima';

interface ReceivedReport {
  id: string; // unique key: role-id
  guruId: number | string;
  namaGuru: string;
  peran: string;
  roleKey: string;
  tanggalKirim: string;
  status: ReportStatus;
}

const getRoleName = (roleKey: string) => {
    const roles: { [key: string]: string } = {
        wali_kelas: 'Wali Kelas',
        guru_bk: 'Guru BK',
        guru_mapel: 'Guru Mapel',
        guru_piket: 'Guru Piket',
        guru_pendamping: 'Guru Pendamping',
    };
    return roles[roleKey] || 'Guru';
};

const reportableRoles = ['wali_kelas', 'guru_bk', 'guru_mapel', 'guru_piket', 'guru_pendamping'];

export default function LaporanWakasekPage() {
  const [allReports, setAllReports] = useState<ReceivedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('wali_kelas');
  
  const reportStorageKey = 'waliKelasReportsStatus';

  const loadData = () => {
    setIsLoading(true);
    try {
      const teachersData = getSourceData('teachersData', {});
      const savedStatuses = getSourceData(reportStorageKey, {});
      
      const reports: ReceivedReport[] = [];

      reportableRoles.forEach(roleKey => {
        const guruList: Guru[] = teachersData[roleKey] || [];
        if (Array.isArray(guruList)) {
            guruList.forEach((guru) => {
                const status = savedStatuses[guru.id] || 'Belum Mengirim';
                reports.push({
                    id: `${roleKey}-${guru.id}`,
                    guruId: guru.id,
                    namaGuru: guru.nama,
                    peran: getRoleName(roleKey),
                    roleKey: roleKey,
                    tanggalKirim: status !== 'Belum Mengirim' ? format(new Date(), "yyyy-MM-dd") : '-',
                    status: status,
                });
            });
        }
      });
      
      setAllReports(reports.sort((a,b) => a.namaGuru.localeCompare(b.namaGuru)));

    } catch (error) {
      console.error("Gagal memuat data laporan:", error);
       toast({
        title: "Gagal Memuat",
        description: "Tidak dapat memuat data laporan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dataUpdated', loadData);
    return () => window.removeEventListener('dataUpdated', loadData);
  }, []);

  const handleStatusChange = (guruId: number | string, status: ReportStatus) => {
    const updatedReports = allReports.map(report =>
      report.guruId === guruId ? { ...report, status, tanggalKirim: format(new Date(), "yyyy-MM-dd") } : report
    );
    setAllReports(updatedReports);

    const savedStatuses = getSourceData(reportStorageKey, {});
    savedStatuses[guruId] = status;
    updateSourceData(reportStorageKey, savedStatuses);
    
    toast({
        title: "Status Diperbarui",
        description: `Laporan dari ${updatedReports.find(r => r.guruId === guruId)?.namaGuru} telah ditandai sebagai ${status}.`,
    });
  };

  const getStatusBadgeVariant = (status: ReportStatus) => {
    switch (status) {
      case 'Diterima': return 'default';
      case 'Diproses': return 'secondary';
      case 'Terkirim': return 'outline';
      case 'Belum Mengirim': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Laporan Tugas Guru</h2>
            <p className="text-muted-foreground">
              Daftar laporan yang telah dikirim oleh semua guru penanggung jawab.
            </p>
        </div>
        <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat Ulang Data
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Laporan Masuk per Peran</CardTitle>
          <CardDescription>
            Pilih peran untuk melihat laporan, lalu kelola statusnya melalui menu Aksi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList>
                        {reportableRoles.map(roleKey => (
                            <TabsTrigger key={roleKey} value={roleKey}>{getRoleName(roleKey)}</TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {reportableRoles.map(roleKey => {
                    const filteredReports = allReports.filter(r => r.roleKey === roleKey);
                    return (
                        <TabsContent value={roleKey} key={roleKey} className="mt-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nama Guru</TableHead>
                                  <TableHead>Tanggal Kirim</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredReports.length > 0 ? (
                                  filteredReports.map((report) => (
                                    <TableRow key={report.id}>
                                      <TableCell className="font-medium">{report.namaGuru}</TableCell>
                                      <TableCell>{report.tanggalKirim !== '-' ? format(new Date(report.tanggalKirim), "dd MMMM yyyy") : '-'}</TableCell>
                                      <TableCell><Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge></TableCell>
                                      <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={report.status === 'Belum Mengirim'}>
                                                    <span className="sr-only">Buka menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem disabled>
                                                    <Eye className="mr-2 h-4 w-4" />Lihat Detail (Segera)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(report.guruId, 'Diproses')}>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Tandai Diproses
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(report.guruId, 'Diterima')}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Tandai Diterima
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                   <TableRow>
                                      <TableCell colSpan={4} className="text-center h-24">
                                        Tidak ada guru yang ditugaskan untuk peran ini.
                                      </TableCell>
                                    </TableRow>
                                )}
                              </TableBody>
                            </Table>
                        </TabsContent>
                    )
                })}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
