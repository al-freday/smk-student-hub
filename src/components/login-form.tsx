
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  userId: z.string().min(1, { message: "Silakan pilih pengguna." }),
  password: z.string().min(1, { message: "Password harus diisi." }),
});

interface User {
    id: string;
    nama: string;
    role: string;
    password?: string;
}

interface LoginFormProps {
    allUsers: User[];
}

const getRoleKeyFromName = (roleName: string) => {
    const roles: { [key: string]: string } = {
        'Wali Kelas': 'wali_kelas',
        'Guru BK': 'guru_bk',
        'Guru Mapel': 'guru_mapel',
        'Guru Piket': 'guru_piket',
        'Guru Pendamping': 'guru_pendamping',
        'Wakasek Kesiswaan': 'wakasek_kesiswaan',
    };
    return roles[roleName] || 'unknown';
}

export function LoginForm({ allUsers }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });
  
  const handleLoginSuccess = (user: User) => {
      const roleKey = getRoleKeyFromName(user.role);
      localStorage.setItem('userRole', roleKey);
      
      const userForSettings = {
          nama: user.nama,
          role: user.role,
          email: `${user.id.replace(/-/g, '_')}@schoolemail.com`, // Create a dummy email for profile page
      };
      localStorage.setItem('currentUser', JSON.stringify(userForSettings));
      
      window.dispatchEvent(new Event('roleChanged'));
      
      router.push("/dashboard");
  };

 function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const selectedUser = allUsers.find(u => u.id === values.userId);
    
    // Fallback password logic for seeded data
    const idPart = String(selectedUser?.id).split('-').pop();
    const expectedPassword = selectedUser?.password || `password${idPart}`;

    setTimeout(() => {
      setIsLoading(false);
      if (selectedUser && values.password === expectedPassword) {
          handleLoginSuccess(selectedUser);
      } else {
         toast({
          title: "Login Gagal",
          description: "Nama pengguna atau password salah.",
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
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pengguna</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nama Anda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                            {user.nama} ({user.role})
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
