
"use client";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";

const applyTheme = () => {
    const userRole = localStorage.getItem("userRole");
    // Default ke 'wakasek_kesiswaan' jika tidak ada peran, atau ke tema aplikasi umum.
    const themeKey = `appTheme_${userRole || 'wakasek_kesiswaan'}`; 
    const savedTheme = localStorage.getItem(themeKey);

    let themeToApply = null;
    let defaultThemeColors = { "--primary": "25 95% 53%", "--accent": "217 91% 60%" };

    if (savedTheme) {
      try {
        themeToApply = JSON.parse(savedTheme).colors;
      } catch (error)
 {
        console.error("Gagal mem-parse tema yang disimpan:", error);
      }
    } 
    
    // Fallback to default if no theme is found
    const colorsToSet = themeToApply || defaultThemeColors;
    
    Object.entries(colorsToSet).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value as string);
    });
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // Terapkan tema saat komponen pertama kali dimuat
    applyTheme();

    // Event listener untuk sinkronisasi antar tab
    window.addEventListener('storage', applyTheme);

    // Event listener kustom untuk perubahan peran di tab yang sama (dipicu saat login)
    window.addEventListener('roleChanged', applyTheme);

    return () => {
      window.removeEventListener('storage', applyTheme);
      window.removeEventListener('roleChanged', applyTheme);
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
         <title>SMKN 2 Tana Toraja</title>
        <meta name="description" content="Sistem Manajemen Kesiswaan SMKN 2 Tana Toraja" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
