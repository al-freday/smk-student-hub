
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
    logo: "https://iili.io/KAqSZhb.png",
  });

  useEffect(() => {
    const teachersData = getSourceData('teachersData', {});
    if (teachersData && teachersData.schoolInfo) {
      setSchoolInfo(teachersData.schoolInfo);
    }
  }, []);

  const { heroImage, featureImage1, featureImage2, featureImage3 } = placeholderImages;

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">
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
        <section className="relative h-[60vh] lg:h-[70vh] flex items-center justify-center text-center text-white">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            className="object-cover -z-10 brightness-75"
            data-ai-hint={heroImage.hint}
          />
          <div className="container px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              Selamat Datang di {schoolInfo.schoolName} Hub
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-slate-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
              Platform terintegrasi untuk manajemen kesiswaan, akademik, dan bimbingan yang lebih efektif dan efisien.
            </p>
            <Button size="lg" className="mt-8 text-base md:text-lg" asChild>
              <Link href="/login">Mulai Sekarang</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Fitur Unggulan</h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
                Dirancang untuk mendukung setiap aspek kegiatan sekolah.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="items-center p-6">
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
                  <CardTitle className="mt-4 text-xl">Administrasi Terpusat</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6 pb-6">
                  <p className="text-slate-600">Kelola data siswa, guru, pelanggaran, dan kehadiran dalam satu tempat yang mudah diakses.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="items-center p-6">
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
                  <CardTitle className="mt-4 text-xl">Pemantauan Proaktif</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6 pb-6">
                  <p className="text-slate-600">Sistem poin dan alur kerja laporan membantu penanganan masalah siswa secara cepat dan terstruktur.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="items-center p-6">
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
                  <CardTitle className="mt-4 text-xl">Laporan Otomatis</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6 pb-6">
                  <p className="text-slate-600">Hasilkan laporan kehadiran, pelanggaran, dan tugas guru secara otomatis untuk evaluasi.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-100 border-t border-slate-200">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} {schoolInfo.schoolName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
