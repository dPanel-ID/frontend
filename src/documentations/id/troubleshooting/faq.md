---
title: Masalah yang sering muncul
description: Yang perlu dilakukan ketika server, aplikasi, GitHub, atau log tidak berjalan seperti seharusnya.
sidebar_position: 1
sidebar_icon: circle-help
---

Setiap jawaban dimulai dari apa yang Anda lihat, lalu apa yang perlu dilakukan.

## Server

### Halaman server menampilkan "Penyiapan tidak selesai"

Banner merah berarti penyedia cloud atau proses penyiapan berhenti karena error. Tekan **Lihat penyebabnya** untuk membaca alasannya. Penyebab paling umum adalah kuota akun cloud yang tidak cukup, dan kredensial yang sudah kedaluwarsa atau kurang izin. Kuota dan izin yang perlu diperiksa ada di halaman tiap penyedia: lihat [Penyedia cloud](../servers/cloud-providers/index.md).

Perbaiki penyebabnya di sisi penyedia, lalu buka tab **Pengaturan** server dan pakai **Instal ulang** di bagian **Penyiapan** untuk menjalankan penyiapan sekali lagi. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md).

### Server tidak bisa dihapus

Penghapusan ditolak selama masih ada aplikasi atau load balancer yang memakai server itu. Hapus atau pindahkan dulu, lalu coba lagi. Lihat [Menghapus server](../servers/delete-a-server.md).

### Dasbor menampilkan "Tidak ada kontak dengan" sebuah server

Agen dPanel di server itu sudah lama tidak melapor. Server mungkin mati, kelebihan beban, atau terputus dari jaringan. Buka dari **Perlu perhatian Anda** dengan **Buka server**, lalu periksa apakah server bisa dijangkau.

## Aplikasi

### Saya menekan Rilis aplikasi dan tidak terjadi apa-apa

Periksa **Nama aplikasi**. Nama hanya boleh berisi huruf, angka, dan spasi. Nama seperti `my-app` atau `my_app` ditolak; kolomnya menampilkan pesan error di bawahnya. Gunakan `My App`, lalu deploy lagi.

### "Port … sudah digunakan di server ini"

Ada layanan lain yang sudah memakai port itu. Pilih port yang tidak tercantum di **Port yang sudah digunakan**. Saat mulai, dPanel menyarankan port kosong antara 7000 dan 10000.

### Build berhenti setelah sekitar 20 menit

Setiap pekerjaan build dan deployment punya batas waktu bawaan 20 menit. Build yang banyak mengompilasi, atau server dengan CPU kecil, bisa melewatinya.

Batas ini bisa dinaikkan per aplikasi lewat `build.timeout` di definisi aplikasi, berupa durasi antara `1m` dan `3h`:

```yaml
build:
  timeout: 90m
```

Formulir web belum punya kolom ini. Atur di file definisi yang Anda deploy lewat alat command-line dPanel. Cara lainnya, pakai server yang lebih besar agar build lebih cepat.

### Sesi GitHub kedaluwarsa, atau muncul "Hubungkan ulang GitHub"

GitHub tidak lagi mengonfirmasi akun yang tersimpan. Tekan **Hubungkan ulang GitHub** atau **Login ulang GitHub**, lalu masuk lagi ke GitHub. Aplikasi Anda tetap berjalan selama itu. Lihat [Menghubungkan GitHub](../getting-started/connect-github.md).

### Organisasi GitHub saya tidak ada di daftar

Buka **Tim GitHub** di halaman pembuatan aplikasi lalu pilih **Tambah akun GitHub**. Pasang GitHub App dnocs-id di organisasi itu, dan beri akses ke repositorinya.

## Log

### "Aplikasi ini belum punya perintah run atau server"

Log runtime berasal dari layanan yang sedang berjalan. Aplikasi tanpa perintah start, atau yang belum dirilis ke server, belum punya log. Lengkapi pengaturannya dan rilis dulu.

### Lognya kosong

Log hanya menampilkan rentang waktu yang Anda pilih. Perlebar rentangnya; yang paling panjang 10 hari. Kalau aplikasi baru saja dirilis, tunggu sebentar lalu tekan tombol muat ulang. Lihat [Membaca log](../logs/reading-logs.md).

## Ruang kerja dan akses

### Server atau aplikasi saya hilang

Kemungkinan besar Anda sedang berada di ruang kerja lain. Periksa nama ruang kerja di bagian atas sidebar dan pindah kembali. Lihat [Ruang kerja](../getting-started/workspaces.md).

### Dasbor menyebut Anda tidak bisa melihat kesehatan ruang kerja ini

Setiap anggota ruang kerja bisa membaca status eksekusi dan agennya. Jika pesan ini masih muncul, kemungkinan Anda bukan anggota ruang kerja yang dipilih: periksa pemilih ruang kerja, atau minta owner ruang kerja menambahkan Anda. Lihat [Anggota dan peran](../teams/members-and-roles.md).

## Meminta bantuan

Sebagian besar halaman daftar diakhiri dengan **Bantuan & Dukungan**:

- **Dokumentasi** membuka panduan ini.
- **Chat tim** membuka percakapan WhatsApp dengan tim dPanel.
- **Dukungan Email** menulis ke tim lewat email.

Saat menghubungi, sertakan nama server atau aplikasinya, apa yang Anda tekan, dan apa yang Anda lihat.
