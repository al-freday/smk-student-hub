
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const getRoleDisplayName = (role: string) => {
    switch (role) {
        case 'wali_kelas': return 'Wali Kelas';
        case 'guru_bk': return 'Guru BK';
        case 'guru_mapel': return 'Guru Mata Pelajaran';
        case 'guru_piket': return 'Guru Piket';
        case 'guru_pendamping': return 'Guru Pendamping';
        case 'wakasek_kesiswaan': return 'Wakasek Kesiswaan';
        case 'admin': return 'Administrator';
        default: return 'Pengguna';
    }
};

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

    // Hardcoded check for wakasek comes first
    if ((values.email.toLowerCase() === 'wakasek@schoolemail.com' || values.email.toLowerCase() === 'wakasek@email.com') && values.password === 'password123') {
        setTimeout(() => {
            setIsLoading(false);
            handleLoginSuccess('wakasek_kesiswaan', { nama: 'Wakasek Kesiswaan', email: values.email.toLowerCase() });
        }, 1000);
        return;
    }

    const savedTeachers = localStorage.getItem('teachersData');
    if (!savedTeachers) {
        setIsLoading(false);
        toast({
          title: "Login Gagal",
          description: "Tidak ada data pengguna yang ditemukan. Harap login sebagai admin terlebih dahulu untuk membuat pengguna.",
          variant: "destructive",
        });
        return;
    }

    const teachersData = JSON.parse(savedTeachers);
    
    let foundUser = null;
    let userRoleKey = '';
    const emailToSearch = values.email.toLowerCase();

    const { schoolInfo, ...roles } = teachersData;

    for (const role in roles) {
        if (!Array.isArray(roles[role])) continue;

        const user = roles[role].find((u: any) => {
            if (!u.nama || typeof u.nama !== 'string' || u.id === undefined) return false;
            
            const namePart = u.nama.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
            const idPart = String(u.id).split('-').pop();
            const expectedEmail = `${namePart}${idPart}@schoolemail.com`;
            
            return expectedEmail === emailToSearch && u.password === values.password;
        });

        if (user) {
            foundUser = user;
            userRoleKey = role;
            break;
        }
    }

    setTimeout(() => {
      setIsLoading(false);
      if (foundUser) {
          handleLoginSuccess(userRoleKey, { nama: foundUser.nama, email: emailToSearch });
      } else {
         toast({
          title: "Login Gagal",
          description: "Email atau password salah. Silakan hubungi admin jika lupa.",
          variant: "destructive",
        });
      }
    }, 1000);
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
                  <Input placeholder="email@schoolemail.com" {...field} disabled={isLoading}/>
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
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
}
