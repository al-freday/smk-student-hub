
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
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "SMK Student Hub", logo: "" });
  
  // This useEffect will run on the client to handle dynamic updates like theme and favicon
  useEffect(() => {
    const loadSchoolInfoAndTheme = () => {
      let currentSchoolInfo = { schoolName: "SMK Student Hub", logo: "" };
      const savedData = localStorage.getItem('teachersData');
      if (savedData) {
        try {
          const teachersData = JSON.parse(savedData);
          if (teachersData.schoolInfo) {
            currentSchoolInfo = teachersData.schoolInfo;
            setSchoolInfo(currentSchoolInfo);
          }
        } catch (e) {
            console.error("Failed to parse teachersData from localStorage", e);
        }
      }

      // Dynamically set favicon on the client
      const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
      if (favicon && currentSchoolInfo.logo) {
        favicon.href = currentSchoolInfo.logo;
      }
      
      applyTheme();
    };
    
    loadSchoolInfoAndTheme();

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
  
  const pageTitle = schoolInfo.schoolName || "SMK Student Hub";
  const pageDescription = `Sistem Manajemen Kesiswaan untuk ${pageTitle}.`;
  // Use a static, publicly accessible placeholder image for social media previews
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
