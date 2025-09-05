
"use client";

import { useState, useEffect } from "react";
import { getSourceData } from "@/lib/data-manager";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "./ui/badge";

interface ReportProps {
  guruId: number | string;
  roleKey: string;
}

interface Guru {
    id: number | string;
    nama: string;
    kelas?: string[];
    siswaBinaan?: string[];
    teachingAssignments?: any[];
}

const getRoleName = (roleKey: string) => {
    const roles: { [key: string]: string } = {
        wali_kelas: 'Wali Kelas', guru_bk: 'Guru BK', guru_mapel: 'Guru Mapel',
        guru_piket: 'Guru Piket', guru_pendamping: 'Guru Pendamping',
    };
    return roles[roleKey] || 'Guru';
};

const ReportHeader = ({ guru, schoolInfo }: { guru: Guru, schoolInfo: any }) => (
    <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">{schoolInfo.schoolName || "Laporan Tugas Guru"}</h1>
                <p className="text-gray-600">Periode: {format(new Date(), "MMMM yyyy", { locale: id })}</p>
            </div>
            {schoolInfo.logo && <img src={schoolInfo.logo} alt="Logo Sekolah" className="h-20 w-20 object-contain"/>}
        </div>
        <hr className="my-4 border-gray-300" />
        <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Nama Guru:</strong> {guru.nama}</div>
            <div><strong>Peran:</strong> {getRoleName(guru.roleKey)}</div>
        </div>
    </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
        <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3">{title}</h2>
        {children}
    </div>
);

const ReportTable = ({ headers, data }: { headers: string[], data: (string|number|React.ReactNode)[][] }) => (
    <table className="w-full text-sm border-collapse">
        <thead>
            <tr className="bg-gray-200">
                {headers.map(h => <th key={h} className="border p-2 text-left font-semibold">{h}</th>)}
            </tr>
        </thead>
        <tbody>
            {data.map((row, i) => (
                <tr key={i} className="odd:bg-gray-50">
                    {row.map((cell, j) => <td key={j} className="border p-2">{cell}</td>)}
                </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={headers.length} className="text-center p-4 border text-gray-500">Tidak ada data untuk dilaporkan.</td>
                </tr>
            )}
        </tbody>
    </table>
);

export default function TeacherReportContent({ guruId, roleKey }: ReportProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const teachersData = getSourceData('teachersData', {});
    const schoolInfo = teachersData.schoolInfo || {};
    const guru = (teachersData[roleKey] || []).find((g: Guru) => g.id === guruId);

    if (!guru) {
      setIsLoading(false);
      return;
    }
    
    let data: any = { guru: { ...guru, roleKey }, schoolInfo };
    const now = new Date();
    const monthInterval = { start: startOfMonth(now), end: endOfMonth(now) };

    if (roleKey === 'wali_kelas') {
        const allSiswa = getSourceData('siswaData', []);
        const siswaBinaan = allSiswa.filter((s: any) => guru.kelas?.includes(s.kelas));
        const allKehadiran = getSourceData('kehadiranSiswaPerSesi', []);
        const allPelanggaran = getSourceData('riwayatPelanggaran', []);

        const rekapKehadiran = siswaBinaan.map((s: any) => {
            const records = allKehadiran.filter((k: any) => k.nis === s.nis && isWithinInterval(new Date(k.tanggal), monthInterval));
            const hadir = records.filter((k:any) => k.status === 'Hadir').length;
            const total = records.length;
            return [s.nama, hadir, total - hadir, total > 0 ? `${(hadir/total*100).toFixed(0)}%` : 'N/A'];
        });

        const pelanggaran = allPelanggaran.filter((p: any) => guru.kelas?.includes(p.kelas) && isWithinInterval(new Date(p.tanggal), monthInterval))
          .map((p: any) => [p.namaSiswa, p.pelanggaran, p.poin]);
        
        data = { ...data, rekapKehadiran, pelanggaran };
    }
    
    if (roleKey === 'guru_pendamping') {
        const logBimbingan = getSourceData('logBimbinganData', {});
        const allSiswa = getSourceData('siswaData', []);
        
        const bimbinganData = (guru.siswaBinaan || []).flatMap((namaSiswa: string) => {
            const siswa = allSiswa.find((s: any) => s.nama === namaSiswa);
            if(!siswa || !logBimbingan[siswa.nis]) return [];
            return logBimbingan[siswa.nis]
                .filter((log: any) => isWithinInterval(new Date(log.tanggal), monthInterval))
                .map((log: any) => [namaSiswa, log.kategori, log.catatan]);
        });
        data = { ...data, bimbinganData };
    }

    setReportData(data);
    setIsLoading(false);
  }, [guruId, roleKey]);

  if (isLoading) return <div>Memuat data laporan...</div>;
  if (!reportData || !reportData.guru) return <div>Data guru tidak ditemukan.</div>;

  return (
    <div>
        <ReportHeader guru={reportData.guru} schoolInfo={reportData.schoolInfo} />
        
        {roleKey === 'wali_kelas' && (
            <>
                <Section title="Rekapitulasi Kehadiran Siswa Binaan">
                   <ReportTable headers={["Nama Siswa", "Hadir (Sesi)", "Absen (Sesi)", "Persentase"]} data={reportData.rekapKehadiran} />
                </Section>
                <Section title="Pelanggaran Tercatat di Kelas Binaan">
                   <ReportTable headers={["Nama Siswa", "Pelanggaran", "Poin"]} data={reportData.pelanggaran} />
                </Section>
            </>
        )}
        
        {roleKey === 'guru_pendamping' && (
            <Section title="Log Bimbingan Siswa">
                <ReportTable headers={["Nama Siswa", "Kategori", "Catatan"]} data={reportData.bimbinganData} />
            </Section>
        )}

        {/* Placeholder for other roles */}
        {['guru_bk', 'guru_mapel', 'guru_piket'].includes(roleKey) && (
             <Section title="Ringkasan Aktivitas">
                <p className="text-gray-600">Laporan detail untuk peran ini sedang dalam pengembangan. Data aktivitas Anda telah tercatat dalam sistem.</p>
            </Section>
        )}

        <div className="mt-12 pt-4 border-t text-right text-sm text-gray-500">
            <p>Laporan ini dibuat secara otomatis oleh Sistem Manajemen Kesiswaan.</p>
            <p>Tanggal Cetak: {format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}</p>
        </div>
    </div>
  );
}
