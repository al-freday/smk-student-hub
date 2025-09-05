
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is obsolete and will redirect.
// The main login page now handles the admin/wakasek login flow.
export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}
