---
title: Membaca log
description: Letak log server, aplikasi, load balancer, dan build di dPanel, serta cara membaca, menyaring, dan mencari tabel log berdasarkan level dan teks.
sidebar_position: 1
sidebar_icon: file-text
---

dPanel menampilkan empat jenis log langsung di browser, jadi Anda tidak perlu SSH, `journalctl`, atau `tail -f`: file log server, log runtime aplikasi, log request load balancer, dan log build. Semuanya memakai tabel yang sama, jadi begitu Anda bisa membaca satu, Anda bisa membaca semuanya.

**Log** adalah catatan berjalan sebuah program tentang apa yang dilakukannya, satu baris per kejadian, misalnya "dimulai", "request dilayani", atau sebuah galat. Lihat [Glosarium](../getting-started/glossary.md).

## Letak setiap log

| Log                  | Tempatnya                                                                                    | Isinya                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Log server           | Halaman server, tab **Log**                                                                  | File log di mesin: sistem, keamanan, provisioning, agen dPanel, dan web server. |
| Log runtime aplikasi | Halaman aplikasi, tab **Log**, **Runtime**                                                   | Apa yang dicetak layanan Anda selama berjalan.                                  |
| Log load balancer    | Halaman aplikasi, tab **Log**, **Load balancer**; atau tab **Logs** di halaman load balancer | Permintaan yang masuk ke load balancer.                                         |
| Log build            | Halaman aplikasi, **Rilis**, tombol **Log** pada sebuah build                                | Keluaran satu build: clone, langkah build, dan saat layanan dijalankan.         |

## Tabel log

![Tab Log sebuah aplikasi: sumber log, rentang waktu, saringan, serta tombol unduh dan muat ulang di atas tabel](../../assets/applications/app-runtime-logs.webp 'Jika tidak ada baris di rentang itu, tabel menampilkan pesan kosong. Perlebar rentang waktunya untuk melihat lebih jauh ke belakang.')

Setiap baris tabel adalah satu baris log, dengan kolom berikut:

| Kolom  | Isinya                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| #      | Nomor baris di rentang waktu ini.                                                                                               |
| Waktu  | Kapan baris ditulis, dalam zona waktu Anda.                                                                                     |
| Level  | debug, info, notice, warn, error, atau fatal, jika barisnya menyebutkan.                                                        |
| Sumber | File, layanan, atau domain asal baris.                                                                                          |
| Pesan  | Teksnya. Lencana **JSON** berarti baris itu membawa data terstruktur; lencana **HTTP** berarti request ke sebuah load balancer. |

Halaman 1 berisi baris terbaru. Di dalam satu halaman, baris dibaca dari atas ke bawah sesuai urutan penulisannya, dengan yang terbaru di paling bawah, dan tabel otomatis menggulir ke baris terbaru. Bagian bawah tabel menyebutkannya, misalnya **Baris 1–200 dari 1.250, terbaru dulu**.

**Query** di atas tabel bisa dibuka untuk melihat pencarian persis yang dijalankan dPanel untuk halaman ini. Anda hanya membutuhkannya saat melaporkan masalah.

## Request load balancer

Log load balancer menampilkan setiap request sebagai satu baris yang mudah dibaca, bertanda **HTTP**:

![Request load balancer ke sebuah aplikasi, dengan chip level Warn 5 dan Info 3, satu baris per request](../../assets/logs/logs-http-requests.webp 'Status 4xx menjadi peringatan, status 5xx menjadi galat.')

`GET shop.example.com/api/info → 401 · 7 ms` dibaca: metode, domain dan path yang diminta, kode status yang dikirim balik, dan lama prosesnya. Level mengikuti kode status: `5xx` menjadi **error**, `4xx` menjadi **warn**, selebihnya **info**. Buka entrinya untuk melihat semua field, seperti alamat IP pengunjung, protokol, dan header request.

Load balancer TCP atau UDP (L4, yang meneruskan koneksi mentah seperti port database, bukan halaman web) mencatat koneksi, bukan request. Alat baris perintah mencetak setiap koneksi sebagai baris seperti `TCP 203.0.113.10 -> 10.0.0.12:5432 · in 78 B, out 199 B · 3ms`: klien, upstream yang dituju, jumlah byte di tiap arah, dan lama koneksinya.

## Mempersempit tampilan

- **Saring halaman ini** menyisakan baris yang memuat teks Anda. Huruf besar dan kecil tidak dibedakan, jadi `error` juga menemukan `ERROR`. Pencariannya hanya di baris yang sudah dimuat, bukan seluruh rentang waktu. Untuk request, pencarian juga mencocokkan baris yang mudah dibaca, jadi `→ 500` menemukan galat server.
- **Chip level** ada di atas tabel, satu untuk setiap level yang muncul, lengkap dengan jumlahnya. Pilih **error** untuk melihat galat saja; pilih **Semua** untuk kembali. Chip disembunyikan jika semua baris punya level yang sama.
- Jika tidak ada yang cocok, **Hapus pencarian** menghapus kedua saringan.

## Membuka satu entri

Pilih sebuah baris, atau tombol **Buka entri**-nya. Panel **Entri log** terbuka di samping tabel, berisi:

- **Pesan**: teks lengkap, tanpa terpotong.
- **Payload terstruktur**: JSON di baris itu, dirapikan.
- **Konteks**: waktu, level, dan sumber, tampil di bagian atas panel.
- **Baris mentah**: persis seperti yang ditulis. **Salin baris mentah** menyalinnya.

![Panel samping entri log di samping tabel log server, menampilkan level, waktu, sumber, pesan, dan baris mentah satu entri](../../assets/logs/logs-entry-panel.webp)

## Log server

Tab **Log** di halaman server membaca baris-baris terbaru dari satu file log.

1. Buka servernya, lalu masuk ke **Log**.
2. Pilih file di **Sumber log**. File dikelompokkan menjadi Overview, System, Security, Provisioning, dPanel, dan Network. **Auth** terpilih lebih dulu; **All VM logs** membaca semuanya sekaligus.
3. Pilih berapa baris yang dibaca: 20, 50, 100, 200, atau 500.

![Tab Log sebuah server, dengan pilihan sumber log dan jumlah baris](../../assets/servers/server-logs.webp)

:::note[Log server tidak punya rentang waktu]
Log server membaca baris terbaru dari sebuah file, bukan jendela waktu. Rentang waktu, halaman, dan unduhan di [Rentang waktu dan pembaruan](./time-range-and-refresh.md) berlaku untuk log aplikasi dan log load balancer.
:::

## Log build

**Log Artefak** terbuka di atas halaman dengan 500 baris terbaru dari build itu. Di sana ada **Saring halaman ini**, chip level, **Unduh**, serta **Segarkan** dengan **Muat ulang otomatis**, yang berguna selama build masih berjalan. Pilih sebuah baris untuk membukanya di tempat.

## Pertanyaan yang sering diajukan

### Seberapa jauh ke belakang log bisa dibaca di dPanel?

Log aplikasi dan load balancer bisa dibaca hingga 10 hari ke belakang. Log server menampilkan 20 sampai 500 baris terbaru dari sebuah file, dan log build 500 baris terbaru dari sebuah build.

### Apakah Saring halaman ini mencari di seluruh rentang waktu?

Tidak. Saringan itu hanya mencari di baris yang sudah dimuat di halaman yang sedang dibuka. Untuk melihat lebih jauh ke belakang, buka halaman yang lebih lama atau persempit rentang waktunya. Lihat [Rentang waktu dan pembaruan](./time-range-and-refresh.md).

### Bisakah saya mengikuti log secara langsung?

Bisa. Nyalakan **Muat ulang otomatis** di sebelah **Segarkan**, setiap 30 detik, setiap menit, atau setiap 5 menit. Fitur ini berhenti sementara selama Anda membaca halaman yang lebih lama.

### Bisakah saya menyimpan log ke file?

Bisa. Log aplikasi dan load balancer punya tombol **Unduh**, untuk satu halaman atau seluruh rentang waktu. Lihat [Mengunduh log](./download-logs.md).

### Bisakah saya membaca log load balancer dari terminal?

Bisa. `dnocs load-balancer log --id <ID load balancer>` mencetak setiap request sebagai `GET host/path → 200 · 148ms`, terbaru lebih dulu. Pakai `--since` untuk mundur hingga `240h`, `--page` dan `--limit` (hingga 500) untuk berpindah halaman, dan `--json` untuk semua field. Cari ID-nya dengan `dnocs load-balancer list`. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang dnocs.

### Apakah saringannya membedakan huruf besar dan kecil?

Tidak. **Saring halaman ini** dan semua kotak pencarian di dPanel tidak membedakan huruf besar dan kecil.
