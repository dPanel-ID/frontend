---
title: Langkah pertama Anda
description: Jalur pemula di dPanel - dNocs dalam enam langkah, dari masuk ke akun sampai aplikasi aktif di domain Anda dengan HTTPS, lengkap dengan halaman panduannya.
sidebar_position: 0.5
sidebar_icon: list-checks
sidebar_label: Langkah pertama
---

Baru mengenal dPanel - dNocs? Ikuti enam langkah ini secara berurutan. Dalam sekitar satu jam, akun yang masih kosong berubah menjadi situs web yang berjalan di server Anda sendiri, di domain Anda sendiri, dengan HTTPS. Setiap langkah menautkan halaman yang memandu Anda.

Belum pernah mengelola server? Baca dulu [Cara situs web berjalan di server Anda](../tutorials/how-a-website-runs.md), dan buka [Glosarium](./glossary.md) untuk istilah yang belum Anda kenal.

## Satu jam pertama Anda di dPanel

1. **Masuk.** Buka [dnocs.devetek.app](https://dnocs.devetek.app) lalu masuk dengan Google atau nama pengguna dan kata sandi. Lihat [Masuk dan profil Anda](./sign-in.md).
2. **Pilih ruang kerja.** Ruang kerja (workspace) adalah wadah tempat server, aplikasi, dan domain Anda berada. Pakai ruang kerja pribadi untuk mencoba-coba, atau ruang kerja tim untuk berbagi dengan orang lain. Lihat [Ruang kerja](./workspaces.md).
3. **Siapkan server.** Server adalah komputer di pusat data tempat situs Anda berjalan. Apa pun pilihannya, dPanel lebih dulu membutuhkan [kunci SSH](./ssh-keys-and-cloud-projects.md). SSH adalah cara aman untuk masuk ke server, dan kunci itu membuat dPanel bisa masuk tanpa kata sandi.
   - **Belum punya server?** Hubungkan akun cloud Anda, misalnya AWS, Google Cloud, atau DigitalOcean, lalu luncurkan server dari dPanel. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md).
   - **Sudah menyewa VPS (server virtual dari perusahaan hosting)?** Hubungkan saja lewat SSH. Lihat [Menghubungkan server sendiri](../servers/connect-your-own-server.md).
4. **Deploy aplikasi pertama.** [Hubungkan GitHub](./connect-github.md), lalu ikuti salah satu tutorial sampai selesai. Setiap tutorial dimulai dengan meluncurkan server; kalau Anda sudah mengerjakan langkah 3, lewati langkah itu dan pakai server Anda, asalkan punya minimal 2 vCPU dan RAM 4 GB:
   - [Deploy WordPress dengan MariaDB](../tutorials/deploy-wordpress.md), titik awal paling mudah.
   - [Deploy Laravel dengan PostgreSQL](../tutorials/deploy-laravel.md), untuk aplikasi web PHP.
5. **Pasang di domain.** Tambahkan domain Anda di **Domain & DNS**, lalu buat load balancer: pintu depan yang menjawab di domain Anda dan mendapat sertifikat HTTPS gratis. Lihat [Domain dan DNS](../networking/domains-and-dns.md) dan [Load balancer](../networking/load-balancers.md).
6. **Pantau terus.** [Dasbor](./dashboard.md) memberi tahu apakah semuanya baik-baik saja, dan [Membaca log](../logs/reading-logs.md) menunjukkan apa yang sedang dilakukan aplikasi Anda.

Anda juga bisa menyerahkan klik-kliknya kepada asisten: jelaskan apa yang Anda mau, lalu setujui setiap perubahan. Lihat [Ask dPanel](../ai/overview.md).

## Berapa lama tiap langkah

| Langkah            | Waktu Anda  | Menunggu dPanel                               |
| ------------------ | ----------- | --------------------------------------------- |
| Masuk, ruang kerja | 2 menit     | tidak ada                                     |
| Kunci SSH          | 1 menit     | tidak ada                                     |
| Server cloud       | 5 menit     | 10–20 menit selama server disiapkan           |
| Server sendiri     | 5 menit     | beberapa menit selama dPanel memasang dirinya |
| Aplikasi pertama   | 10–15 menit | 5–15 menit untuk perangkat lunak dan build    |
| Domain dan HTTPS   | 5 menit     | 1–10 menit untuk DNS dan sertifikat           |

## Sebelum mulai

- **Akun GitHub** berisi kode yang ingin Anda jalankan. Tutorial memakai repositori contoh publik yang bisa Anda fork.
- **Akun cloud**, hanya jika Anda ingin dPanel meluncurkan server untuk Anda. Penyedia cloud menagih biaya server langsung kepada Anda; dPanel tidak menjual ulang server.
- **Nama domain** di Cloudflare atau DigitalOcean, agar dPanel bisa membuat record DNS untuk Anda. Domain di tempat lain juga bisa, tetapi record-nya Anda tambahkan sendiri.

## Pertanyaan yang sering diajukan

### Apakah saya harus paham Linux atau memakai terminal?

Hampir tidak perlu. Kalau dPanel yang meluncurkan server Anda, semua langkah dilakukan di browser. Menghubungkan server yang sudah Anda jalankan butuh satu perintah di server itu, dan mesin privat butuh beberapa perintah. dPanel masuk ke server lewat SSH untuk Anda, memasang perangkat lunak dari daftar, dan menampilkan log di halaman.

### Bisakah saya mencoba dPanel tanpa domain?

Bisa. Aplikasi Anda tetap berjalan tanpa domain; domain hanya diperlukan untuk menerbitkannya ke internet dengan HTTPS di langkah 5.

### Siapa yang menagih biaya server?

Penyedia cloud Anda, untuk setiap jam server itu ada. dPanel tidak menjual ulang server. Hapus server yang tidak lagi dipakai agar biayanya berhenti. Lihat [Menghapus server](../servers/delete-a-server.md).

### Ada yang tidak beres. Di mana saya mencarinya?

Mulai dari [Masalah umum dan solusinya](../troubleshooting/faq.md). Daftar **Needs your attention** di dasbor juga menunjukkan apa saja yang gagal.
