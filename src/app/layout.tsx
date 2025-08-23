
"use client"; // Diubah menjadi Client Component untuk menerapkan tema dinamis

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

// Metadata tidak bisa diekspor dari client component, perlu dipindahkan jika statis
// export const metadata: Metadata = {
//   title: 'SMKN 2 Tana Toraja',
//   description: 'Sistem Manajemen Kesiswaan SMKN 2 Tana Toraja',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // Terapkan tema dari localStorage saat aplikasi dimuat
    const savedTheme = localStorage.getItem("appTheme");
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        Object.entries(theme).forEach(([property, value]) => {
          document.documentElement.style.setProperty(property, value as string);
        });
      } catch (error) {
        console.error("Gagal menerapkan tema dari localStorage", error);
      }
    }
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
         <title>SMKN 2 Tana Toraja</title>
        <meta name="description" content="Sistem Manajemen Kesiswaan SMKN 2 Tana Toraja" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
