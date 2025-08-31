
"use client";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Head from "next/head";

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
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "SMKN 2 Tana Toraja", logo: "" });
  const [pageTitle, setPageTitle] = useState("Sistem Manajemen Kesiswaan");
  const [faviconHref, setFaviconHref] = useState<string | null>(null);

  useEffect(() => {
    const loadSchoolInfoAndTheme = () => {
      const savedData = localStorage.getItem('teachersData');
      let currentSchoolInfo = { schoolName: "SMKN 2 Tana Toraja", logo: "" };
      if (savedData) {
        try {
          const teachersData = JSON.parse(savedData);
          if (teachersData.schoolInfo) {
            currentSchoolInfo = teachersData.schoolInfo;
            setSchoolInfo(currentSchoolInfo);
            setPageTitle(currentSchoolInfo.schoolName || "Sistem Manajemen Kesiswaan");
            if(currentSchoolInfo.logo){
              setFaviconHref(currentSchoolInfo.logo);
            }
          }
        } catch (e) {
            console.error("Failed to parse teachersData from localStorage", e);
        }
      }
      applyTheme();
    };
    
    loadSchoolInfoAndTheme();

    // Event listeners to react to changes from other tabs/components
    const handleStorageUpdate = () => {
        loadSchoolInfoAndTheme();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('roleChanged', applyTheme);
    window.addEventListener('dataUpdated', loadSchoolInfoAndTheme);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('roleChanged', applyTheme);
      window.removeEventListener('dataUpdated', handleStorageUpdate);
    };
  }, []);
  
  const pageDescription = `Sistem Manajemen Kesiswaan untuk ${schoolInfo.schoolName}.`;
  const imageUrl = schoolInfo.logo || "/placeholder-logo.png";


  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>{pageTitle}</title>
        {faviconHref && <link key="favicon" rel="icon" href={faviconHref} type="image/x-icon" />}
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={imageUrl} />

        {/* Twitter */}
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
