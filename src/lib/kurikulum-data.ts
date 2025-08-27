
export const initialKurikulumData = {
  kelas_x: {
    nama: "Kelas X SMK/MAK",
    deskripsi: "Total JP per tahun: 1.728 (alokasi intrakurikuler dan projek)",
    kelompok: [
      {
        nama: "A. Kelompok Mata Pelajaran Umum",
        subjects: [
          { id: 101, nama: "Pendidikan Agama dan Budi Pekerti", catatan: "Siswa memilih salah satu sesuai agama masing-masing" },
          { id: 102, nama: "Pendidikan Pancasila" },
          { id: 103, nama: "Bahasa Indonesia" },
          { id: 104, nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan" },
          { id: 105, nama: "Sejarah" },
          { id: 106, nama: "Seni Budaya", catatan: "Minimal 1 jenis seni: Musik, Rupa, Teater, atau Tari" },
          { id: 107, nama: "Muatan Lokal Bahasa Jawa" },
        ],
      },
      {
        nama: "B. Kelompok Mata Pelajaran Kejuruan",
        subjects: [
          { id: 108, nama: "Matematika" },
          { id: 109, nama: "Bahasa Inggris" },
          { id: 110, nama: "Informatika" },
          { id: 111, nama: "Projek Ilmu Pengetahuan Alam dan Sosial" },
          { id: 112, nama: "Dasar-dasar Program Keahlian" },
        ],
      },
    ],
  },
  kelas_xi: {
    nama: "Kelas XI SMK/MAK",
    deskripsi: "Total JP per tahun: 1.728 (penekanan lebih pada kejuruan)",
    kelompok: [
      {
        nama: "A. Kelompok Mata Pelajaran Umum",
        subjects: [
          { id: 201, nama: "Pendidikan Agama dan Budi Pekerti", catatan: "Siswa memilih salah satu sesuai agamanya" },
          { id: 202, nama: "Pendidikan Pancasila" },
          { id: 203, nama: "Bahasa Indonesia" },
          { id: 204, nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan" },
          { id: 205, nama: "Sejarah" },
          { id: 206, nama: "Muatan Lokal Bahasa Jawa" },
        ],
      },
      {
        nama: "B. Kelompok Mata Pelajaran Kejuruan",
        subjects: [
          { id: 207, nama: "Matematika" },
          { id: 208, nama: "Bahasa Inggris" },
          { id: 209, nama: "Mata Pelajaran Konsentrasi Keahlian", catatan: "Disesuaikan dengan program keahlian spesifik" },
          { id: 210, nama: "Projek Kreatif dan Kewirausahaan" },
          { id: 211, nama: "Mata Pelajaran Pilihan", catatan: "Siswa memilih mata pelajaran tambahan sesuai minat" },
        ],
      },
    ],
  },
  kelas_xii: {
    nama: "Kelas XII SMK/MAK",
    deskripsi: "Fokus utama pada praktik kerja lapangan dan konsentrasi keahlian",
    kelompok: [
      {
        nama: "A. Kelompok Mata Pelajaran Umum",
        subjects: [
          { id: 301, nama: "Pendidikan Agama dan Budi Pekerti", catatan: "Siswa memilih salah satu, waktu disesuaikan" },
          { id: 302, nama: "Pendidikan Pancasila" },
          { id: 303, nama: "Bahasa Indonesia" },
          { id: 304, nama: "Muatan Lokal Bahasa Jawa" },
        ],
      },
      {
        nama: "B. Kelompok Mata Pelajaran Kejuruan",
        subjects: [
          { id: 305, nama: "Matematika" },
          { id: 306, nama: "Bahasa Inggris" },
          { id: 307, nama: "Mata Pelajaran Konsentrasi Keahlian", catatan: "Disesuaikan dengan program keahlian" },
          { id: 308, nama: "Projek Kreatif dan Kewirausahaan" },
          { id: 309, nama: "Praktik Kerja Lapangan (PKL)", catatan: "Komponen utama dengan alokasi waktu tinggi" },
          { id: 310, nama: "Mata Pelajaran Pilihan", catatan: "Siswa memilih mata pelajaran tambahan" },
        ],
      },
    ],
  },
};
