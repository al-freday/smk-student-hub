
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, List, CheckCircle, FileUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSourceData, updateSourceData } from "@/lib/data-manager";

// --- Tipe Data ---
interface PreviewData {
  fileName: string;
  rowCount: number;
  headers: string[];
  rows: (string | number)[][];
}

interface Siswa {
    id: number;
    nis: string;
    nama: string;
    kelas: string;
}


export default function UnggahDataIndukPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            toast({
                title: "File Terpilih",
                description: `Pratinjau data dari ${selectedFile.name} tersedia di tab 'Olah Data Unggahan'.`,
            });
            // Simulate reading file for preview
            setPreviewData({
                fileName: selectedFile.name,
                rowCount: 250, // Placeholder
                headers: ["NIS", "Nama Siswa", "Kelas", "Tanggal Lahir", "Nama Wali"],
                rows: [
                    ["24001", "Ahmad Dahlan", "X TKJ 1", "2008-05-10", "Bpk. Dahlan"],
                    ["24002", "Budi Santoso", "X TKJ 1", "2008-06-15", "Ibu Santoso"],
                    ["24003", "Citra Lestari", "X TKJ 2", "2008-07-20", "Bpk. Lestari"],
                    ["24004", "Dewi Anggraini", "X TKJ 2", "2008-08-25", "Ibu Anggraini"],
                    ["23001", "Eko Prasetyo", "XI OT 1", "2007-09-01", "Bpk. Prasetyo"],
                    ["23005", "Farida Yani", "XI OT 1", "2007-10-10", "Bpk. Yani"],
                    ["22001", "Guntur Wijaya", "XII MM 1", "2006-11-12", "Ibu Wijaya"],
                    ["22002", "Hasanudin", "XII MM 1", "2006-12-18", "Bpk. Hasanudin"],
                ]
            });
            setActiveTab("process"); // Automatically switch to process tab
        } else {
            toast({
                title: "Format File Salah",
                description: "Harap unggah file dengan format .xlsx atau .csv.",
                variant: "destructive",
            });
        }
    }
  };

  const handleProcessFile = () => {
      if (!previewData) {
          toast({ title: "Gagal", description: "Tidak ada data untuk diproses.", variant: "destructive" });
          return;
      }
      
      // Simulasi konversi data pratinjau menjadi format Siswa
      const newSiswaData: Siswa[] = previewData.rows.map((row, index) => ({
          id: 100 + index, // Gunakan ID sementara untuk data baru
          nis: String(row[0]),
          nama: String(row[1]),
          kelas: String(row[2]),
      }));
      
      // Timpa data siswa yang ada dengan data yang baru diimpor
      updateSourceData('siswaData', newSiswaData);

      toast({
          title: "Proses Berhasil",
          description: `Data siswa dari file ${previewData.fileName} telah berhasil diimpor ke sistem.`,
      });
      
      setFile(null);
      setPreviewData(null);
      setActiveTab("upload"); // Switch back to upload tab
      
      // Arahkan pengguna untuk melihat hasilnya
      router.push('/dashboard/hasil-data-olahan');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Unggah Data Induk Siswa</h2>
            <p className="text-muted-foreground">
              Unggah dan proses data induk siswa dari file Excel (.xlsx) atau CSV.
            </p>
          </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Alur Kerja Impor Data</CardTitle>
            <CardDescription>
                Ikuti langkah-langkah di bawah ini untuk mengimpor data siswa baru ke dalam sistem.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload"><FileUp className="mr-2 h-4 w-4" /> 1. Unggah File</TabsTrigger>
                    <TabsTrigger value="process" disabled={!previewData}><List className="mr-2 h-4 w-4" /> 2. Olah Data Unggahan</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="pt-6">
                     <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center">
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Pilih File Data Induk</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pilih file Excel atau CSV yang berisi data siswa sesuai template.
                         </p>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".xlsx, .csv"
                        />
                         <label htmlFor="file-upload" className="mt-4">
                            <Button as="span">Pilih File dari Komputer</Button>
                         </label>
                         <p className="mt-2 text-xs text-muted-foreground">
                            {file ? `Terpilih: ${file.name}` : "Belum ada file yang dipilih"}
                         </p>
                    </div>
                </TabsContent>

                <TabsContent value="process" className="pt-6">
                     {previewData ? (
                        <div className="space-y-4">
                           <p className="text-sm text-muted-foreground">
                                Pratinjau data dari file <span className="font-semibold text-primary">{previewData.fileName}</span>. Pastikan kolom sudah sesuai sebelum memproses.
                            </p>
                            <div className="overflow-x-auto border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {previewData.headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.rows.slice(0, 5).map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {row.map((cell, cellIndex) => <TableCell key={cellIndex}>{cell}</TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">Menampilkan 5 dari {previewData.rowCount} baris data.</p>
                                <Button onClick={handleProcessFile}><CheckCircle className="mr-2 h-4 w-4" /> Proses & Impor Data</Button>
                            </div>
                        </div>
                     ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <p>Silakan unggah file di tab "Unggah File" untuk melihat pratinjau di sini.</p>
                        </div>
                     )}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
