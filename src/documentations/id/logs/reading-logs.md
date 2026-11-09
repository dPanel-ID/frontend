---
title: Membaca log
description: Letak log server, aplikasi, load balancer, dan build di dPanel, serta cara membaca, menyaring, dan mencari tabel log berdasarkan level dan teks.
sidebar_position: 1
sidebar_icon: file-text
---

dPanel menampilkan empat jenis log langsung di browser, jadi Anda tidak perlu SSH, `journalctl`, atau `tail -f`: file log server, log runtime aplikasi, log request load balancer, dan log build. Semuanya memakai tabel yang sama, jadi begitu Anda bisa membaca satu, Anda bisa membaca semuanya.

**Log** adalah catatan berjalan sebuah program tentang apa yang dilakukannya, satu baris per kejadian, misalnya "dimulai", "request dilayani", atau sebuah galat. Lihat [Glosarium](../getting-started/glossary.md).

## Letak setiap log

| Log                  | Tempatnya                                                                                    | Isinya                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Log server           | Halaman server, tab **Log**                                                                  | File log di mesin: sistem, keamanan, provisioning, agen dPanel, dan web server.                     |
| Log runtime aplikasi | Halaman aplikasi, tab **Log**, **Runtime**                                                   | Apa yang dicetak layanan Anda selama berjalan.                                                      |
| Log load balancer    | Halaman aplikasi, tab **Log**, **Load balancer**; atau tab **Logs** di halaman load balancer | Permintaan yang masuk ke load balancer.                                                             |
| Log build            | Halaman aplikasi, **Rilis**, tombol **Log** pada sebuah build                                | Posisi build, langkah demi langkah, dan keluarannya: clone, langkah build, saat layanan dijalankan. |

## Tabel log

![Tab Log sebuah aplikasi: sumber log, rentang waktu, saringan, serta tombol unduh dan muat ulang di atas tabel](../../assets/applications/app-runtime-logs.webp 'Jika tidak ada baris di rentang itu, tabel menampilkan pesan kosong. Perlebar rentang waktunya untuk melihat lebih jauh ke belakang.')

Setiap baris tabel adalah satu baris log, dengan kolom berikut:

| Kolom  | Isinya                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| #      | Nomor baris, dihitung dari baris terbaru. Log server dihitung dari atas tampilan file.                                          |
| Waktu  | Kapan baris ditulis, dalam zona waktu Anda.                                                                                     |
| Level  | debug, info, notice, warn, error, atau fatal, jika barisnya menyebutkan.                                                        |
| Sumber | File, layanan, atau domain asal baris.                                                                                          |
| Pesan  | Teksnya. Lencana **JSON** berarti baris itu membawa data terstruktur; lencana **HTTP** berarti request ke sebuah load balancer. |

Log runtime dan log load balancer terbuka pada baris terbaru, di bagian bawah. Gulir ke atas untuk memuat baris yang lebih lama, sampai awal rentang waktu. Bagian bawah menyebutkan yang sudah dimuat, misalnya **Baris 1–200 dari 1.250 dimuat, terbaru di bawah**. Lihat [Rentang waktu dan pembaruan](./time-range-and-refresh.md#menggulir-ke-atas-untuk-baris-yang-lebih-lama).

**Query** di atas tabel bisa dibuka untuk melihat pencarian persis yang dijalankan dPanel. Anda hanya membutuhkannya saat melaporkan masalah.

## Log aplikasi di beberapa server

Saat aplikasi berjalan di lebih dari satu server, log runtime-nya menggabungkan semua server dalam satu daftar, dengan yang terbaru di bawah. Kolom **Sumber** menunjukkan server yang menulis setiap baris, dan server baru muncul begitu aplikasi di-deploy ke sana.

Untuk melihat satu server, misalnya saat hanya server itu yang bermasalah, buka menu **Server** di sebelah nama run lalu pilih servernya. **Semua server** mengembalikan daftar gabungan.

## Request load balancer

Log load balancer menampilkan setiap request sebagai satu baris yang mudah dibaca, bertanda **HTTP**:

![Request load balancer ke sebuah aplikasi, dengan chip level Warn 5 dan Info 3, satu baris per request](../../assets/logs/logs-http-requests.webp 'Status 4xx menjadi peringatan, status 5xx menjadi galat.')

`GET shop.example.com/api/info → 401 · 7 ms` dibaca: metode, domain dan path yang diminta, kode status yang dikirim balik, dan lama prosesnya. Level mengikuti kode status: `5xx` menjadi **error**, `4xx` menjadi **warn**, selebihnya **info**. Buka entrinya untuk melihat semua field, seperti alamat IP pengunjung, protokol, dan header request.

Load balancer TCP atau UDP (L4, yang meneruskan koneksi mentah seperti port database, bukan halaman web) mencatat koneksi, bukan request. Alat baris perintah mencetak setiap koneksi sebagai baris seperti `TCP 203.0.113.10 -> 10.0.0.12:5432 · in 78 B, out 199 B · 3ms`: klien, upstream yang dituju, jumlah byte di tiap arah, dan lama koneksinya.

## Mempersempit tampilan

- **Saring baris yang dimuat** menyisakan baris yang memuat teks Anda. Huruf besar dan kecil tidak dibedakan, jadi `error` juga menemukan `ERROR`. Pencariannya hanya di baris yang sudah dimuat, bukan seluruh rentang waktu. Untuk request, pencarian juga mencocokkan baris yang mudah dibaca, jadi `→ 500` menemukan galat server.
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
Log server membaca baris terbaru dari sebuah file, bukan jendela waktu. Rentang waktu, pengguliran, dan unduhan di [Rentang waktu dan pembaruan](./time-range-and-refresh.md) berlaku untuk log aplikasi dan log load balancer.
:::

## Log build

**Log Artefak** terbuka di atas halaman dengan dua tab.

**Langkah** menunjukkan posisi build, dan terbuka lebih dulu. Tab ini memperbarui dirinya setiap beberapa detik selama build berjalan:

| Tahap                        | Yang terjadi                                                 |
| ---------------------------- | ------------------------------------------------------------ |
| Pasang runtime dan modul     | Bahasa dan alat yang dibutuhkan aplikasi.                    |
| Ambil kode sumber            | Commit di-clone dari repositori Anda.                        |
| Siapkan build                | Definisi aplikasi dibaca dan build disiapkan.                |
| Satu baris per langkah build | Perintah build Anda, ditampilkan dengan nama yang Anda beri. |
| Kemas hasil build            | Hasilnya diarsipkan, pada build yang membuat arsip.          |
| Deploy ke server             | Layanan dibuat dan dijalankan.                               |

Setiap baris menunjukkan status, jumlah langkah, dan lamanya. Tahap yang sedang berjalan, atau yang gagal, terbuka dengan sendirinya; pilih tahap mana pun untuk melihat langkah-langkahnya.

**Keluaran log** berisi baris yang dicetak build, untuk seluruh build: gulir ke atas untuk keluaran yang lebih awal. Di sana ada **Saring baris yang dimuat**, chip level, **Unduh**, serta **Segarkan** dengan **Muat ulang otomatis**. Pilih sebuah baris untuk membukanya di tempat.

:::note[Keluaran datang saat langkah selesai]
Keluaran sebuah langkah build masuk ke **Keluaran log** saat langkah itu selesai, jadi langkah yang lama bisa tidak menampilkan apa pun di sana selama berjalan. **Langkah** memberi tahu bahwa build masih bekerja dan sudah berapa lama.
:::

## Pertanyaan yang sering diajukan

### Seberapa jauh ke belakang log bisa dibaca di dPanel?

Log aplikasi dan load balancer bisa dibaca hingga 3 hari ke belakang. Log server menampilkan 20 sampai 500 baris terbaru dari sebuah file. Log build berisi seluruh build.

### Mengapa build yang berjalan tidak menampilkan baris log?

Keluaran langkah build datang saat langkah itu selesai. Buka tab **Langkah** di **Log Artefak** untuk melihat langkah yang sedang berjalan dan lamanya.

### Bisakah saya melihat log satu server saja?

Bisa. Pada aplikasi yang berjalan di beberapa server, pilih servernya di menu **Server** pada tab **Log**. Lihat [Log aplikasi di beberapa server](#log-aplikasi-di-beberapa-server).

### Apakah Saring baris yang dimuat mencari di seluruh rentang waktu?

Tidak. Saringan itu hanya mencari di baris yang sudah dimuat. Untuk melihat lebih jauh ke belakang, gulir ke atas atau persempit rentang waktunya. Lihat [Rentang waktu dan pembaruan](./time-range-and-refresh.md).

### Bisakah saya mengikuti log secara langsung?

Bisa. Nyalakan **Muat ulang otomatis** di sebelah **Segarkan**, setiap 30 detik, setiap menit, atau setiap 5 menit. Fitur ini berhenti sementara setelah Anda menggulir ke atas, sampai Anda kembali ke bawah atau menekan **Ke baris terbaru**.

### Bisakah saya menyimpan log ke file?

Bisa. Log aplikasi dan load balancer punya tombol **Unduh**, untuk baris yang dimuat atau seluruh rentang waktu. Lihat [Mengunduh log](./download-logs.md).

### Bisakah saya membaca log load balancer dari terminal?

Bisa. `dnocs load-balancer log --id <ID load balancer>` mencetak setiap request sebagai `GET host/path → 200 · 148ms`, terbaru lebih dulu. Pakai `--since` untuk mundur hingga `72h`, `--page` dan `--limit` (hingga 500) untuk berpindah halaman, dan `--json` untuk semua field. Cari ID-nya dengan `dnocs load-balancer list`. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang dnocs.

### Apakah saringannya membedakan huruf besar dan kecil?

Tidak. **Saring baris yang dimuat** dan semua kotak pencarian di dPanel tidak membedakan huruf besar dan kecil.
