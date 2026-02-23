
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, MoreHorizontal, CheckCircle, RefreshCw, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getSourceData, updateSourceData } from "@/lib/data-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import TeacherReportContent from "@/components/teacher-report-content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('wali_kelas');
  const [viewingReport, setViewingReport] = useState<ReceivedReport | null>(null);
  
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

  const handleViewDetails = (report: ReceivedReport) => {
    setViewingReport(report);
  };

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

  const handleDownloadPdf = async (report: ReceivedReport) => {
    setIsGeneratingPdf(true);
    toast({ title: "Membuat PDF", description: "Harap tunggu, laporan sedang dibuat..." });

    const reportElement = document.getElementById(`report-content-${report.id}`);
    if (!reportElement) {
      toast({ title: "Gagal", description: "Konten laporan tidak ditemukan.", variant: "destructive" });
      setIsGeneratingPdf(false);
      return;
    }
    
    // Temporarily make the element visible for rendering
    reportElement.style.position = 'fixed';
    reportElement.style.left = '-9999px';
    reportElement.style.top = '0';
    reportElement.style.display = 'block';

    try {
      const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      const newImgHeight = pdfWidth / ratio;
      
      let heightLeft = newImgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, newImgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - newImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, newImgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Laporan_${report.namaGuru.replace(/\s/g, '_')}_${report.tanggalKirim}.pdf`);
      toast({ title: "Berhasil", description: "Laporan PDF telah diunduh." });
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ title: "Gagal Membuat PDF", description: "Terjadi kesalahan.", variant: "destructive" });
    } finally {
        // Hide the element again
        reportElement.style.display = 'none';
        reportElement.style.position = 'static';
        setIsGeneratingPdf(false);
    }
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
    <>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
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
                              <div className="overflow-x-auto">
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
                                            <TableCell className="font-medium whitespace-nowrap">{report.namaGuru}</TableCell>
                                            <TableCell className="whitespace-nowrap">{report.tanggalKirim !== '-' ? format(new Date(report.tanggalKirim), "dd MMMM yyyy") : '-'}</TableCell>
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
                                                      <DropdownMenuItem onClick={() => handleViewDetails(report)}>
                                                          <Eye className="mr-2 h-4 w-4" />Lihat Detail
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onClick={() => handleDownloadPdf(report)} disabled={isGeneratingPdf}>
                                                          {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                                                          Unduh PDF
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
                              </div>
                          </TabsContent>
                      )
                  })}
              </Tabs>
            )}
          </CardContent>
        </Card>
        {/* Hidden container for PDF generation */}
        <div className="absolute -z-10 opacity-0">
            {allReports.filter(r => r.status !== 'Belum Mengirim').map(report => (
                <div id={`report-content-${report.id}`} key={report.id} className="p-8 bg-white text-black" style={{ display: 'none', width: '800px'}}>
                    <TeacherReportContent guruId={report.guruId} roleKey={report.roleKey} />
                </div>
            ))}
        </div>
      </div>

      <Dialog open={!!viewingReport} onOpenChange={(isOpen) => { if (!isOpen) setViewingReport(null) }}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detail Laporan: {viewingReport?.namaGuru}</DialogTitle>
            <DialogDescription>
              Peran: {viewingReport?.peran} | Tanggal Kirim: {viewingReport && viewingReport.tanggalKirim !== '-' ? format(new Date(viewingReport.tanggalKirim), "dd MMMM yyyy") : '-'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-6">
              {viewingReport && (
                <div className="p-4 bg-white text-black rounded">
                  <TeacherReportContent guruId={viewingReport.guruId} roleKey={viewingReport.roleKey} />
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
