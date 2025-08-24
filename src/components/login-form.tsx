
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const getRoleDisplayName = (role: string) => {
    switch (role) {
        case 'wali_kelas': return 'Wali Kelas';
        case 'guru_bk': return 'Guru BK';
        case 'guru_mapel': return 'Guru Mata Pelajaran';
        case 'guru_piket': return 'Guru Piket';
        case 'guru_pendamping': return 'Guru Pendamping';
        case 'wakasek_kesiswaan': return 'Wakasek Kesiswaan';
        default: return 'Pengguna';
    }
};

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSuccess = (userRoleKey: string, userDetails: {nama: string, email: string}) => {
      localStorage.setItem('userRole', userRoleKey);
      
      const roleName = getRoleDisplayName(userRoleKey);
      const userForSettings = {
          nama: userDetails.nama,
          role: roleName,
          email: userDetails.email,
      };
      localStorage.setItem('currentUser', JSON.stringify(userForSettings));
      
      // Memicu event kustom untuk memberitahu layout bahwa peran telah berubah
      window.dispatchEvent(new Event('roleChanged'));
      
      router.push("/dashboard");
  };

 function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const teachersData = JSON.parse(localStorage.getItem('teachersData') || '{}');
    let foundUser = null;
    let userRoleKey = 'wakasek_kesiswaan';
    const emailToSearch = values.email.toLowerCase();

    for (const role in teachersData) {
        const user = teachersData[role].find((u: any) => {
            const namePart = u.nama.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
            const expectedEmail = `${namePart}${u.id}@schoolemail.com`;
            return expectedEmail === emailToSearch;
        });
        if (user) {
            foundUser = user;
            userRoleKey = role.replace(/([A-Z])/g, '_$1').toLowerCase();
            break;
        }
    }
    
    if (emailToSearch === 'wakasek@email.com') {
        foundUser = { nama: 'Wakasek Kesiswaan' };
        userRoleKey = 'wakasek_kesiswaan';
    }

    setTimeout(() => {
      setIsLoading(false);
      if (foundUser) {
          handleLoginSuccess(userRoleKey, { nama: foundUser.nama, email: emailToSearch });
      } else {
         toast({
          title: "Login Gagal",
          description: "Pengguna tidak ditemukan. Silakan hubungi admin.",
          variant: "destructive",
        });
      }
    }, 1500);
  }

  function onGoogleSignIn() {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      const roleKey = 'wakasek_kesiswaan';
      const roleName = getRoleDisplayName(roleKey);
      handleLoginSuccess(roleKey, { nama: roleName, email: 'wakasek.google@example.com' });
    }, 1500);
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} disabled={isLoading || isGoogleLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading || isGoogleLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={isLoading || isGoogleLoading}>
         {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
         ) : (
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 8.4 244 8.4c69.1 0 128.8 28.1 173.4 74.9L345 156.4c-27.2-26.1-64.4-42.3-101-42.3-84.3 0-152.1 67.9-152.1 151.7s67.8 151.7 152.1 151.7c90.8 0 137.2-62.4 141.8-94.8H244v-75.2h244.5c2.7 13.9 4.5 29.3 4.5 45.5z"></path></svg>
         )}
        Google
      </Button>
    </div>
  );
}
