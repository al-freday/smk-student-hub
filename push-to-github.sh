#!/bin/bash
# ======================================================
# == Tombol Simpan ke GitHub untuk SMK Student Hub ==
# ======================================================
# Jalankan file ini dari terminal untuk menyimpan semua
# perubahan Anda ke repositori GitHub.

# Pesan commit default
COMMIT_MESSAGE="feat: Save progress and update application"

# 1. Kumpulkan semua file yang berubah
git add .

# 2. Buat "save point" dengan pesan di atas
git commit -m "$COMMIT_MESSAGE"

# 3. Kirim ke GitHub
git push

echo "✅ Berhasil! Semua perubahan telah disimpan ke GitHub."
