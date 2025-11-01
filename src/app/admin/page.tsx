
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSourceData } from '@/lib/data-manager';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const schoolInfo = getSourceData('teachersData', {})?.schoolInfo;
    if (schoolInfo && schoolInfo.logo) {
      setLogo(schoolInfo.logo);
    }
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    // This is a simple, non-secure check for the special admin role.
    if (password === 'admin123') {
      toast({
        title: "Login Berhasil",
        description: "Anda berhasil login sebagai administrator.",
      });
      sessionStorage.setItem("admin_logged_in", "true");
      router.push('/admin/dashboard');
    } else {
      toast({
        title: "Login Gagal",
        description: "Password yang Anda masukkan salah.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Avatar className="mx-auto h-16 w-16 mb-4">
              <AvatarImage src={logo} alt="School Logo" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <CardTitle>Login Administrator</CardTitle>
            <CardDescription>
                Masukkan password untuk mengakses dasbor admin.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
