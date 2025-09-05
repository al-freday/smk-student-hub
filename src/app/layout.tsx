
"use client";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState, useCallback } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Head from "next/head";
import { getSourceData } from "@/lib/data-manager";

const applyTheme = () => {
    const userRole = localStorage.getItem("userRole");
    const themeKey = `appTheme_${userRole || 'wakasek_kesiswaan'}`; 
    const savedTheme = localStorage.getItem(themeKey);

    let themeToApply = null;
    let defaultThemeColors = { "--primary": "25 95% 53%", "--accent": "217 91% 60%" };

    if (savedTheme) {
      try {
        themeToApply = JSON.parse(savedTheme).colors;
      } catch (error) {
        console.error("Gagal mem-parse tema yang disimpan:", error);
      }
    } 
    
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
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "SMK Student Hub", logo: "" });
  
  const loadSchoolInfoAndTheme = useCallback(() => {
      let currentSchoolInfo = { schoolName: "SMK Student Hub", logo: "" };
      const savedData = getSourceData('teachersData', null);
      if (savedData && savedData.schoolInfo) {
          currentSchoolInfo = savedData.schoolInfo;
          setSchoolInfo(currentSchoolInfo);
      }

      const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
      if (favicon && currentSchoolInfo.logo) {
        favicon.href = currentSchoolInfo.logo;
      }
      
      applyTheme();
  }, []);
  
  useEffect(() => {
    loadSchoolInfoAndTheme();

    window.addEventListener('storage', loadSchoolInfoAndTheme);
    window.addEventListener('roleChanged', applyTheme);
    window.addEventListener('dataUpdated', loadSchoolInfoAndTheme);

    return () => {
      window.removeEventListener('storage', loadSchoolInfoAndTheme);
      window.removeEventListener('roleChanged', applyTheme);
      window.removeEventListener('dataUpdated', loadSchoolInfoAndTheme);
    };
  }, [loadSchoolInfoAndTheme]);
  
  const pageTitle = schoolInfo.schoolName || "SMK Student Hub";
  const pageDescription = `Sistem Manajemen Kesiswaan untuk ${pageTitle}.`;
  const imageUrl = "https://picsum.photos/1200/630";


  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>{pageTitle}</title>
        <link id="favicon" key="favicon" rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card Meta Tags */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={imageUrl} />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
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
