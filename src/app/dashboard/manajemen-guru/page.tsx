
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getSourceData } from "@/lib/data-manager";

interface Guru {
  id: number;
  nama: string;
  mapel?: string;
  kelas?: string;
  hariPiket?: string;
}

type TeacherType = 'wali_kelas' | 'guru_bk' | 'guru_mapel' | 'guru_piket' | 'guru_pendamping';

const initialTeachers: { [key in TeacherType]: Guru[] } = {
    wali_kelas: [], guru_bk: [], guru_mapel: [], guru_piket: [], guru_pendamping: [],
};

const roleOptions: { value: TeacherType; label: string }[] = [
    { value: 'wali_kelas', label: 'Wali Kelas' },
    { value: 'guru_bk', label: 'Guru BK' },
    { value: 'guru_mapel', label: 'Guru Mapel' },
    { value: 'guru_piket', label: 'Guru Piket' },
    { value: 'guru_pendamping', label: 'Guru Pendamping' },
];

export default function ManajemenGuruPage() {
    const [teachers, setTeachers] = useState<{ [key in TeacherType]: Guru[] }>(initialTeachers);
    
    const loadData = () => {
        const savedTeachers = getSourceData('teachersData', initialTeachers);
        setTeachers(savedTeachers);
    };

    useEffect(() => {
        loadData();
        
        // Listener untuk memuat ulang data jika ada perubahan dari admin
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'teachersData') {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <div className="flex-1 space-y-6">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Guru</h2>
                <p className="text-muted-foreground">
                    Lihat data guru yang telah diatur oleh administrator.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Guru</CardTitle>
                    <CardDescription>
                       Data ini dikelola oleh Administrator dan otomatis muncul dari daftar pengguna.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {roleOptions.map(role => {
                        const teacherList = teachers[role.value] || [];
                        return (
                        <div key={role.value} className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">{role.label} ({teacherList.length})</h3>
                            <div className="border rounded-md">
                                {teacherList.length > 0 ? (
                                    teacherList.map((guru, index) => (
                                        <div key={guru.id} className={`flex items-center justify-between p-3 ${index < teacherList.length - 1 ? 'border-b' : ''}`}>
                                            <div>
                                                <p className="font-medium">{guru.nama}</p>
                                                {role.value === 'wali_kelas' && guru.kelas && <p className="text-sm text-muted-foreground">Kelas: {guru.kelas}</p>}
                                                {role.value === 'guru_mapel' && guru.mapel && <p className="text-sm text-muted-foreground">Mapel: {guru.mapel}</p>}
                                                {role.value === 'guru_piket' && guru.hariPiket && <p className="text-sm text-muted-foreground">Hari: {guru.hariPiket}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground p-3 text-center">Belum ada data.</p>
                                )}
                            </div>
                        </div>
                    )})}
                </CardContent>
            </Card>
        </div>
    );
}
