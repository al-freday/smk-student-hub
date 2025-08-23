
import { Icons } from '@/components/icons';
import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
               <Icons.logo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">SMKN 2 Tana Toraja</CardTitle>
            <CardDescription>
              Sistem Manajemen Kesiswaan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
           <Link href="/admin">
                <Button variant="link" className="text-muted-foreground">
                    <Shield className="mr-2 h-4 w-4" />
                    Login sebagai Administrator
                </Button>
            </Link>
        </div>
      </div>
    </main>
  );
}
