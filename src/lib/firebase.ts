
"use client";

// File ini sengaja dikosongkan untuk menonaktifkan koneksi Firebase
// dan memaksa aplikasi menggunakan localStorage.

// Kosongkan semua ekspor yang mungkin masih diimpor di tempat lain
// untuk menghindari error saat build.
export const app = null;
export const db = null;
export const auth = null;
export const ensureAuthenticated = () => Promise.resolve(null);
export const signOutFromFirebase = () => Promise.resolve();
