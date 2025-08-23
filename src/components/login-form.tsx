
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

const generateUserRoles = (count: number, role: string, roleKey: string): { [email: string]: string } => {
    const users: { [email: string]: string } = {};
    for (let i = 3; i <= count; i++) {
        users[`${roleKey}${i}@email.com`] = role;
    }
    return users;
};


// Daftar pengguna yang disimulasikan untuk login berbasis peran
const userRoles: { [email: string]: string } = {
    // Wakasek
    "wakasek@email.com": "wakasek",
    // Wali Kelas
    "budi.s@email.com": "waliKelas",
    "dewi.l@email.com": "waliKelas",
    ...generateUserRoles(16, "waliKelas", "walikelas"),
    // Guru BK
    "siti.a@email.com": "guruBk",
    "bambang.w@email.com": "guruBk",
    ...generateUserRoles(3, "guruBk", "gurubk"),
    // Guru Mapel
    "eko.p@email.com": "guruMapel",
    "anita.s@email.com": "guruMapel",
    ...generateUserRoles(40, "guruMapel", "gurumapel"),
    // Guru Piket
    "joko.s@email.com": "guruPiket",
    "endang.m@email.com": "guruPiket",
    ...generateUserRoles(40, "guruPiket", "gurupiket"),
    // Guru Pendamping
    "rina.k@email.com": "guruPendamping",
    "agus.s@email.com": "guruPendamping",
    ...generateUserRoles(40, "guruPendamping", "gurupendamping"),
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

 function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const role = userRoles[values.email.toLowerCase()] || 'wakasek'; // Default ke wakasek jika tidak ditemukan

    // Simulasikan panggilan API
    setTimeout(() => {
      setIsLoading(false);
      // Simpan peran di localStorage untuk disimulasikan di seluruh aplikasi
      localStorage.setItem('userRole', role);
      router.push("/dashboard");
    }, 1500);
  }

  function onGoogleSignIn() {
    setIsGoogleLoading(true);
    // Simulate Google Sign-In
    setTimeout(() => {
      setIsGoogleLoading(false);
       localStorage.setItem('userRole', 'wakasek'); // Default Google sign in as wakasek
      router.push("/dashboard");
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

    