
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Selamat Datang di Aplikasi Anda
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Ini adalah halaman utama. Perubahan ini akan kita kirim ke GitHub.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/login">
              Lanjutkan ke Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
