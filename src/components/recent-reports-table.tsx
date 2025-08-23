import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const reports = [
  {
    studentName: "Ahmad Budi",
    class: "XII TKJ 1",
    infraction: "Terlambat masuk sekolah",
    points: 5,
    reporter: "Bu Siti (Wali Kelas)",
    date: "2024-07-22",
  },
  {
    studentName: "Citra Dewi",
    class: "XI AKL 2",
    infraction: "Juara 1 Lomba Cerdas Cermat",
    points: -20,
    reporter: "Pak Eko (Guru Mapel)",
    date: "2024-07-21",
  },
  {
    studentName: "Eka Putra",
    class: "X TSM 3",
    infraction: "Tidak mengerjakan PR",
    points: 10,
    reporter: "Pak Joko (Guru BK)",
    date: "2024-07-21",
  },
  {
    studentName: "Fitriani",
    class: "XII TKJ 1",
    infraction: "Merokok di lingkungan sekolah",
    points: 75,
    reporter: "Pak Dedi (Wakasek)",
    date: "2024-07-20",
  },
  {
    studentName: "Gunawan",
    class: "XI OTKP 1",
    infraction: "Membantu guru membawa buku",
    points: -5,
    reporter: "Bu Rina (Wali Kelas)",
    date: "2024-07-19",
  },
];

export default function RecentReportsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Siswa</TableHead>
          <TableHead className="hidden sm:table-cell">Kelas</TableHead>
          <TableHead>Keterangan</TableHead>
          <TableHead className="text-right">Poin</TableHead>
          <TableHead className="hidden md:table-cell">Pelapor</TableHead>
          <TableHead className="hidden lg:table-cell text-right">Tanggal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.studentName + report.date}>
            <TableCell>
              <div className="font-medium">{report.studentName}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{report.class}</TableCell>
            <TableCell>{report.infraction}</TableCell>
            <TableCell className="text-right">
              <Badge variant={report.points > 0 ? "destructive" : "default"}>
                {report.points > 0 ? `+${report.points}` : report.points}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{report.reporter}</TableCell>
            <TableCell className="hidden lg:table-cell text-right">{report.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
