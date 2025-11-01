"use client";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState, useCallback } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Head from "next/head";
import { getSourceData } from "@/lib/data-manager";

const themes: { [key: string]: { name: string, colors: { [key: string]: string } } } = {
    default: { name: "Default (Oranye & Biru)", colors: { "--primary": "25 95% 53%", "--accent": "217 91% 60%" } },
    green: { name: "Hutan (Hijau)", colors: { "--primary": "142 76% 36%", "--accent": "142 63% 52%" } },
    blue: { name: "Samudera (Biru)", colors: { "--primary": "217 91% 60%", "--accent": "217 80% 75%" } },
    purple: { name: "Lavender (Ungu)", colors: { "--primary": "262 83% 58%", "--accent": "250 70% 75%" } },
    pink: { name: "Fajar (Merah Muda)", colors: { "--primary": "340 82% 52%", "--accent": "340 70% 70%" } },
    teal: { name: "Toska", colors: { "--primary": "173 80% 40%", "--accent": "173 70% 60%" } },
    red: { name: "Bara (Merah & Oranye)", colors: { "--primary": "0 72% 51%", "--accent": "24 96% 53%" } },
    yellow: { name: "Senja (Kuning & Coklat)", colors: { "--primary": "45 93% 47%", "--accent": "28 80% 50%" } },
    gray: { name: "Grafit (Abu-abu & Biru)", colors: { "--primary": "220 9% 46%", "--accent": "217 91% 60%" } },
    ruby: { name: "Ruby (Merah Anggur & Pink)", colors: { "--primary": "350 75% 45%", "--accent": "340 82% 70%" } },
    mint: { name: "Mint & Sage", colors: { "--primary": "160 60% 45%", "--accent": "150 40% 60%" } },
    indigo: { name: "Indigo & Violet", colors: { "--primary": "225 70% 55%", "--accent": "250 80% 65%" } },
    coral: { name: "Coral & Peach", colors: { "--primary": "10 90% 60%", "--accent": "25 90% 70%" } },
    slate: { name: "Slate & Sky", colors: { "--primary": "215 30% 50%", "--accent": "200 100% 75%" } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [pageTitle, setPageTitle] = useState("SMK Student Hub");
  const [schoolLogo, setSchoolLogo] = useState("");

  const applyThemeForRole = useCallback(() => {
    if (typeof window !== 'undefined') {
        const userRole = localStorage.getItem("userRole") || (sessionStorage.getItem("admin_logged_in") ? 'admin' : 'wakasek_kesiswaan');
        const themeSettings = getSourceData('themeSettings', {});
        const themeKey = themeSettings[userRole] || 'default';
        const themeToApply = themes[themeKey as keyof typeof themes] || themes.default;
        
        Object.entries(themeToApply.colors).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value as string);
        });
    }
  }, []);
  
  const loadSchoolInfo = useCallback(() => {
    const teachersData = getSourceData('teachersData', {});
    if (teachersData && teachersData.schoolInfo) {
        setPageTitle(teachersData.schoolInfo.schoolName || "SMK Student Hub");
        setSchoolLogo(teachersData.schoolInfo.logo || "");
    }
  }, []);

  useEffect(() => {
    applyThemeForRole();
    loadSchoolInfo();

    const handleDataOrRoleChange = () => {
      applyThemeForRole();
      loadSchoolInfo();
    };

    window.addEventListener('roleChanged', handleDataOrRoleChange);
    window.addEventListener('storage', handleDataOrRoleChange); 
    window.addEventListener('dataUpdated', handleDataOrRoleChange);

    return () => {
      window.removeEventListener('roleChanged', handleDataOrRoleChange);
      window.removeEventListener('storage', handleDataOrRoleChange);
      window.removeEventListener('dataUpdated', handleDataOrRoleChange);
    };
  }, [applyThemeForRole, loadSchoolInfo]);
  
  const pageDescription = `Sistem Manajemen Kesiswaan untuk ${pageTitle}.`;

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {schoolLogo && <link rel="icon" href={schoolLogo} type="image/png" />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
