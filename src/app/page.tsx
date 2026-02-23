
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, BookOpen, ShieldCheck, BarChart2 } from "lucide-react";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { getSourceData } from "@/lib/data-manager";
import { useState, useEffect } from "react";
import placeholderImages from '@/lib/placeholder-images.json';

interface SchoolInfo {
  schoolName: string;
  logo: string;
}

export default function HomePage() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: "SMK Student Hub",
    logo: "",
  });

  useEffect(() => {
    const teachersData = getSourceData('teachersData', {});
    if (teachersData && teachersData.schoolInfo) {
      setSchoolInfo(teachersData.schoolInfo);
    }
  }, []);

  const { heroImage, featureImage1, featureImage2, featureImage3 } = placeholderImages;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {schoolInfo.logo ? (
            <Avatar>
              <AvatarImage src={schoolInfo.logo} alt="School Logo" />
              <AvatarFallback>{schoolInfo.schoolName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Icons.logo className="h-8 w-8 text-primary" />
          )}
          <span className="font-bold text-lg md:text-xl">{schoolInfo.schoolName}</span>
        </div>
        <Button asChild>
          <Link href="/login">
            Login <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white bg-secondary/50">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            className="object-cover -z-10 brightness-75"
            data-ai-hint={heroImage.hint}
          />
          <div className="container px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              Selamat Datang di {schoolInfo.schoolName} Hub
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base md:text-xl text-primary-foreground/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
              Platform terintegrasi untuk manajemen kesiswaan, akademik, dan bimbingan yang lebih efektif dan efisien.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/login">Mulai Sekarang</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-24 bg-white">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Fitur Unggulan</h2>
              <p className="mt-2 max-w-2xl mx-auto text-slate-600">
                Dirancang untuk mendukung setiap aspek kegiatan sekolah.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow bg-white">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                   <Image
                      src={featureImage1.src}
                      alt={featureImage1.alt}
                      width={600}
                      height={400}
                      className="w-full h-auto rounded-md mt-4 object-cover aspect-[3/2]"
                      data-ai-hint={featureImage1.hint}
                    />
                  <CardTitle className="mt-4">Administrasi Terpusat</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600">Kelola data siswa, guru, pelanggaran, dan kehadiran dalam satu tempat yang mudah diakses.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow bg-white">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                   <Image
                      src={featureImage2.src}
                      alt={featureImage2.alt}
                      width={600}
                      height={400}
                      className="w-full h-auto rounded-md mt-4 object-cover aspect-[3/2]"
                      data-ai-hint={featureImage2.hint}
                    />
                  <CardTitle className="mt-4">Pemantauan Proaktif</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600">Sistem poin dan alur kerja laporan membantu penanganan masalah siswa secara cepat dan terstruktur.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow bg-white">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <BarChart2 className="h-8 w-8 text-primary" />
                  </div>
                   <Image
                      src={featureImage3.src}
                      alt={featureImage3.alt}
                      width={600}
                      height={400}
                      className="w-full h-auto rounded-md mt-4 object-cover aspect-[3/2]"
                      data-ai-hint={featureImage3.hint}
                    />
                  <CardTitle className="mt-4">Laporan Otomatis</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600">Hasilkan laporan kehadiran, pelanggaran, dan tugas guru secara otomatis untuk evaluasi.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-200 border-t border-slate-300">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} {schoolInfo.schoolName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
