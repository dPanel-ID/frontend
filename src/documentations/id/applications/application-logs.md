---
title: Log aplikasi
description: Baca log runtime aplikasi dan request HTTP yang masuk lewat load balancer di dPanel, lengkap dengan rentang waktu, saringan level, dan pencarian.
sidebar_position: 5
sidebar_icon: scroll-text
---

dPanel menampilkan dua jenis log untuk sebuah aplikasi: apa yang dicetak layanan yang berjalan (log runtime-nya), dan setiap request HTTP yang sampai kepadanya lewat load balancer. Buka aplikasinya dan masuk ke **Log**, atau tekan **Lihat log** di tab Ringkasan.

**Log** adalah catatan berjalan tentang apa yang dilakukan sebuah program, satu baris per kejadian. **Load balancer** adalah pintu depan publik yang menerima permintaan pengunjung untuk domain Anda dan meneruskannya ke aplikasi. Lihat [Glosarium](../getting-started/glossary.md).

![Tab Log sebuah aplikasi: sumber runtime, rentang waktu, saringan, serta tombol unduh dan muat ulang di atas tabel log](../../assets/applications/app-runtime-logs.webp)

## Dua sumber log

| Sumber        | Isinya                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Runtime       | Apa yang ditulis layanan ke keluarannya selama berjalan. Judul tabelnya **Log Aplikasi**.                     |
| Load balancer | Setiap permintaan yang masuk ke load balancer di depan aplikasi. Judul tabelnya **Permintaan load balancer**. |

![Sumber Load balancer di tab Log sebuah aplikasi: delapan request, masing-masing ditulis sebagai metode, alamat dan path, status, serta waktu](../../assets/applications/app-lb-logs.webp 'Setiap request tampil sebagai satu baris, diberi warna sesuai statusnya.')

Pilihan **Load balancer** hanya muncul jika aplikasi ini dilayani load balancer. Tanpa itu, tab langsung menampilkan log runtime.

## Membaca baris request

Setiap baris load balancer adalah satu request, diberi tanda **HTTP**, dan ditulis seperti ini:

```text
GET shop.example.com/api/info → 401 · 7 ms
```

Artinya: metode, alamat dan path yang diminta, kode status yang diterima pengunjung, dan lama prosesnya. Kolom **Sumber** menampilkan domainnya. Level mengikuti status: status `5xx` (server gagal) menjadi **error**, status `4xx` (request ditolak atau tidak ditemukan) menjadi **warn**, selebihnya **info**. Pilih barisnya untuk melihat semua detail di panel **Entri log**, seperti alamat IP pengunjung dan header request-nya.

Log runtime mengikuti rilis yang aktif. Saat aplikasi berjalan di beberapa server, daftar menggabungkan semuanya, dan menu **Server** mempersempitnya ke satu server. Lihat [Log aplikasi di beberapa server](../logs/reading-logs.md#log-aplikasi-di-beberapa-server). Jika aplikasi belum punya perintah run atau server, tab ini memberi tahu bahwa belum ada log runtime.

## Menemukan yang Anda cari

1. Pilih **Rentang waktu**. Tab terbuka pada **10 menit terakhir**; Anda bisa mundur hingga 10 hari.
2. Ketik di **Saring baris yang dimuat** untuk menyisakan baris yang memuat teks Anda. Huruf besar dan kecil tidak dibedakan.
3. Pilih chip level, misalnya **error**, untuk menyisakan level itu saja.
4. Pilih satu baris untuk membukanya lengkap di panel **Entri log**.

Daftar terbuka pada baris terbaru, di bagian bawah. Gulir ke atas untuk memuat baris yang lebih lama.

Kontrolnya sama di semua tampilan log. Lihat [Rentang waktu dan pembaruan](../logs/time-range-and-refresh.md) dan [Mengunduh log](../logs/download-logs.md).

## Log build ada di tempat lain

Keluaran build, misalnya kompilasi yang gagal, tidak ada di tab ini. Buka **Rilis**, cari build-nya, lalu tekan **Log**. Lihat [Rilis dan rollback](./deployments-and-rollback.md#membaca-log-build).

Untuk file log milik server sendiri, seperti `auth.log` atau web server, lihat [Membaca log](../logs/reading-logs.md#log-server).

:::tip[Tidak ada apa-apa?]
**Tidak ada log runtime pada rentang ini.** berarti tidak ada yang dicetak pada periode itu. Coba rentang waktu yang lebih lebar dulu. Jika tetap kosong, pastikan layanannya berjalan di tab **Rilis**, bagian **Di server**.
:::

## Pertanyaan yang sering diajukan

### Mengapa setiap request berlevel warn?

Kode statusnya `4xx`: halaman yang tidak ada (`404`) atau request yang perlu login (`401`). Bot yang memindai file seperti `/.env` sering menyebabkannya. Itu wajar, kecuali halaman Anda sendiri yang mengembalikannya.

### Bisakah saya membaca request load balancer dari terminal?

Bisa. `dnocs load-balancer log --id <ID load balancer>` mencetak baris request yang sama, terbaru lebih dulu. Tambahkan `--since 24h` untuk mundur lebih jauh (hingga `240h`, 10 hari), `--page 2` untuk baris yang lebih lama, atau `--json` untuk semua field. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang dnocs.

### Seberapa jauh ke belakang log bisa dibaca?

10 hari, untuk kedua sumber. Lihat [Rentang waktu dan pembaruan](../logs/time-range-and-refresh.md).
