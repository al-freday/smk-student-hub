
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ImportDataPage() {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setFileToImport(file);
    } else {
      toast({
        title: "Format File Salah",
        description: "Harap unggah file cadangan dengan format .json.",
        variant: "destructive",
      });
      setFileToImport(null);
    }
  };

  const handleImport = () => {
    if (!fileToImport) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        // Clear existing data (optional, but recommended for a clean restore)
        localStorage.clear();

        // Import new data
        Object.keys(data).forEach(key => {
          const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
          localStorage.setItem(key, value);
        });

        // Re-set admin login status
        sessionStorage.setItem("admin_logged_in", "true");
        localStorage.setItem("app_initialized", "true"); // Ensure app doesn't re-seed
        
        toast({
          title: "Impor Berhasil!",
          description: `Data dari ${fileToImport.name} telah berhasil dipulihkan. Halaman akan dimuat ulang.`,
        });
        
        // Reload to apply all changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (error) {
        console.error("Gagal mengimpor data:", error);
        toast({
          title: "Impor Gagal",
          description: "File JSON tidak valid atau rusak.",
          variant: "destructive",
        });
        setIsImporting(false);
      }
    };
    reader.readAsText(fileToImport);
  };

  return (
    <>
      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
         <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/pengaturan')}>
              <ArrowLeft />
          </Button>
          <div>
              <h2 className="text-3xl font-bold tracking-tight">Import / Pulihkan Data Aplikasi</h2>
              <p className="text-muted-foreground">
                Ganti semua data saat ini dengan data dari file cadangan (.json).
              </p>
          </div>
        </div>
        
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Unggah File Cadangan (Restore)</CardTitle>
            <CardDescription>
              Pilih file .json yang sebelumnya Anda unduh melalui fitur Export.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Peringatan!</AlertTitle>
                <AlertDescription>
                   Tindakan ini akan **MENGHAPUS SEMUA DATA SAAT INI** dan menggantinya dengan data dari file cadangan. Pastikan Anda telah mencadangkan data terbaru jika diperlukan.
                </AlertDescription>
            </Alert>
            <div className="p-6 bg-secondary rounded-lg flex flex-col items-center text-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="application/json"
                    onChange={handleFileChange}
                />
                <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {fileToImport ? `File Terpilih: ${fileToImport.name}` : "Pilih File .json"}
                </Button>
                 <Button onClick={() => setIsConfirmOpen(true)} disabled={!fileToImport || isImporting} size="lg" className="mt-4">
                  {isImporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="mr-2 h-4 w-4" />
                  )}
                  Mulai Proses Import
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Import Data</AlertDialogTitle>
                  <AlertDialogDescription>
                     Apakah Anda benar-benar yakin? Semua data yang ada saat ini akan dihapus dan diganti dengan data dari file <span className="font-semibold">{fileToImport?.name}</span>. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleImport} className="bg-destructive hover:bg-destructive/90">
                      Ya, Lanjutkan Import
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
