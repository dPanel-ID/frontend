---
title: Menghubungkan GitHub
description: Tautkan akun GitHub agar dPanel bisa membaca dan membangun repositori Anda.
sidebar_position: 4
sidebar_icon: git-branch
---

dPanel membangun aplikasi dari repositori GitHub. Sebelum membuat aplikasi, tautkan dulu akun GitHub. Cukup sekali untuk setiap akun dPanel.

## Yang perlu disiapkan

- Akun GitHub yang bisa membaca repositori yang ingin Anda deploy.
- Untuk repositori milik organisasi: izin memasang GitHub App di organisasi itu, atau rekan yang punya izin tersebut.

## Menghubungkan

1. Buka **Aplikasi** di sidebar.
2. Tekan **Hubungkan GitHub** di bagian atas halaman.
3. GitHub meminta Anda masuk dan menyetujui dPanel. Setujui.
4. Anda kembali ke dPanel. Tombolnya kini menampilkan login GitHub Anda dengan tanda centang.

Profil Anda menampilkan tautan yang sama di **Keamanan akun**: **Akun GitHub** berstatus **Terhubung**.

## Menambahkan organisasi GitHub

Pemilih repositori di **Buat Aplikasi** menampilkan akun Anda sendiri dan semua organisasi yang bisa dibaca dPanel.

1. Buka **Aplikasi**, lalu **Buat Aplikasi**.
2. Buka daftar **Tim GitHub**.
3. Kalau organisasinya belum ada, pilih **Tambah akun GitHub**. Pilihan ini membuka GitHub App dnocs-id di GitHub.
4. Pasang aplikasinya di organisasi tersebut, dan beri akses ke repositori yang Anda perlukan.
5. Kembali ke dPanel, organisasinya kini muncul di **Tim GitHub**.

## Kalau GitHub tidak lagi merespons

Token GitHub bisa kedaluwarsa. Ketika dPanel tidak bisa lagi memverifikasi akun Anda, Anda akan melihat salah satu dari ini:

- **Hubungkan ulang GitHub** di halaman Aplikasi.
- Banner di halaman aplikasi bahwa sesi GitHub kedaluwarsa, dengan tombol **Login ulang GitHub**.
- Di daftar branch: GitHub tidak dapat mengonfirmasi akun Anda.

Tekan tombolnya dan masuk lagi ke GitHub. Tidak ada yang lain berubah. Aplikasi Anda tetap berjalan selama GitHub terputus; yang berhenti hanya pembacaan repositori dan branch.

## Langkah berikutnya

Buat aplikasi pertama Anda. Lihat [Aplikasi](../applications/overview.md).
