---
title: Dasbor
description: Dasbor dPanel menampilkan kesehatan ruang kerja, jumlah server, aplikasi, load balancer, dan domain, job yang gagal, penggunaan resource, dan aktivitas.
sidebar_position: 3
sidebar_icon: layout-dashboard
---

Dasbor dPanel adalah halaman pertama setelah masuk. Isinya menjawab satu pertanyaan: apakah semua di ruang kerja ini baik-baik saja? Dasbor menampilkan status kesehatan, satu baris berisi empat kotak (server, aplikasi, load balancer, dan domain), operasi yang gagal, serta penggunaan CPU, memori, dan disk di seluruh server Anda. Buka kapan saja dari **Dasbor** di sidebar.

![Tab Ringkasan di dasbor: status kesehatan, empat kotak untuk server, aplikasi, load balancer, dan domain, aktivitas platform, dan daftar yang perlu perhatian](../../assets/getting-started/dashboard-overview.webp 'Ringkasan: status di paling atas, lalu empat kotak, aktivitas, dan apa yang perlu dicek.')

## Sidebar

Sidebar di sebelah kiri adalah cara Anda berpindah di dPanel. Dari atas ke bawah:

| Item                | Yang dibuka                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nama ruang kerja    | Ruang kerja yang sedang Anda pakai. Tekan untuk berpindah. Lihat [Ruang kerja](./workspaces.md).                                                                         |
| **Dasbor**          | Halaman ini.                                                                                                                                                             |
| **Aplikasi**        | Aplikasi Anda. Lihat [Cara kerja aplikasi](../applications/overview.md).                                                                                                 |
| **Server**          | Server dan grup server Anda. Lihat [Server di dPanel](../servers/overview.md).                                                                                           |
| **Load Balancer**   | Di bawah **Backend**. Memublikasikan aplikasi di sebuah domain. Lihat [Load balancer](../networking/load-balancers.md).                                                  |
| **Domain & DNS**    | Di bawah **Backend**. Domain dan record DNS-nya. Lihat [Domain dan DNS](../networking/domains-and-dns.md).                                                               |
| **Proyek Cloud**    | Di bawah **Backend**. Akun cloud yang terhubung. Lihat [Kunci SSH & akun cloud](./ssh-keys-and-cloud-projects.md).                                                       |
| **Manajemen Kunci** | Di bawah **Backend** (di tampilan bahasa Inggris: **Secret Managers**). Membuka halaman **Kunci SSH**. Lihat [Kunci SSH & akun cloud](./ssh-keys-and-cloud-projects.md). |
| Nama Anda           | Ikon pengaturan di kartu Anda menampilkan **View Profile** dan **Logout**. Lihat [Profil Anda](./sign-in.md#profil-anda).                                                |

Di bagian paling bawah, tombol **EN** mengganti bahasa antara Inggris dan Indonesia, dan ikon bulan mengganti tema terang dan gelap. Tema ini ikut dipakai layanan dPanel lain di domain yang sama, misalnya database manager.

## Tab-tab di dasbor

| Tab             | Isinya                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Ringkasan**   | Status singkat, empat kotak, aktivitas platform, penggunaan sumber daya, yang perlu dicek, dan aktivitas terbaru |
| **Aktivitas**   | Grafik aktivitas platform dan daftar lengkap **Aktivitas terbaru**                                               |
| **Sumber daya** | Penggunaan sumber daya, **Kesehatan Server**, serta daftar singkat server, aplikasi, dan load balancer           |
| **Ruang kerja** | Khusus ruang kerja tim: ringkasan tim, anggota, dan proyek cloud                                                 |

## Ringkasan

Baca dari atas ke bawah.

1. **Status.** Semua berjalan normal, atau ada sejumlah hal yang perlu perhatian Anda.
2. **Empat kotak.** **Server**, **Aplikasi**, dan **Load balancer**, masing-masing dengan berapa yang siap dan berapa yang perlu diperiksa, lalu **Domain**. Tekan salah satu kotak untuk membuka daftarnya. Akun cloud dan kunci SSH tidak dihitung di sini; buka keduanya dari sidebar.
3. **Aktivitas platform.** Semua operasi yang dijalankan dPanel di ruang kerja ini, dipisah menjadi berhasil, gagal, dan sedang berjalan atau dibatalkan. Pilih rentang 24 jam, 7 hari, atau 30 hari. Di sebelahnya tampil jumlah operasi, tingkat keberhasilan, dan berapa yang gagal.
4. **Penggunaan sumber daya.** CPU, memori, dan disk di seluruh server. Setiap grafik menampilkan rata-rata semua server dan server tersibuk, yaitu server dengan rata-rata tertinggi pada rentang yang Anda pilih. Garis putus-putus, nama server di bawah grafik, puncak, dan rata-ratanya semuanya milik satu server itu. Pilih 1 jam, 24 jam, atau 3 hari.
5. **Perlu perhatian Anda.** Server yang tidak berjalan, server yang agennya (program kecil dPanel di setiap server yang melaporkan kesehatannya) berhenti melapor, dan operasi yang gagal. **Buka server** membawa Anda ke server yang bermasalah.
6. **Aktivitas terbaru.** Operasi paling baru. Tombol di bawah daftar memuat sisanya, dan tab **Aktivitas** menampilkan daftar lengkapnya.

:::tip
Data penggunaan muncul beberapa menit setelah server siap. Server melapor setiap 30 detik.
:::

## Aktivitas

**Aktivitas terbaru** mencatat apa saja yang dilakukan dPanel pada infrastruktur Anda dalam dua hari terakhir: penyiapan server, pemasangan modul, deployment. Setiap entri menyebut apa yang dijalankan, targetnya, siapa yang memulai, dan berapa lama. Nama orangnya tertaut ke profil publiknya. Buka **Detail teknis** pada operasi yang gagal untuk melihat **Tugas gagal** dan **Galat**-nya. Langkah yang boleh dilewati sebuah job dihitung sebagai peringatan, misalnya **2 peringatan**, bukan sebagai kegagalannya. Tekan tombol muat ulang untuk mengambil entri terbaru.

## Sumber daya

Tab ini untuk merencanakan kapasitas.

- **Penggunaan sumber daya**: grafik CPU, memori, dan disk yang sama seperti di **Ringkasan**.
- **Kesehatan Server**: berapa server yang **Server siap**, **Provisioning**, atau **Perlu perhatian**, berapa yang mengirim penggunaan secara langsung (**Telemetry online**), dan penyedia mana yang menampungnya.
- Daftar singkat server, aplikasi, dan load balancer terbaru, masing-masing dengan tautan untuk melihat semuanya.

## Ruang kerja

Hanya muncul di ruang kerja tim.

- **Ringkasan** di bagian atas: nama dan ID tim, repositori IaC-nya (repositori Git tempat dPanel menuliskan infrastruktur ruang kerja ini), serta jumlah anggota, server, dan proyek cloud. **Kelola tim** membuka halaman tim.
- **Anggota Ruang Kerja**: siapa saja yang punya akses. **Kelola** membuka halaman tim.
- **Proyek Cloud**: akun penyedia tempat tim ini bisa membuat server.

## Daftar, tabel, dan kartu

Setiap daftar di dPanel (server, aplikasi, load balancer, domain, akun cloud, kunci SSH, dan tim) terbuka sebagai tabel. Pengalih tampilan di samping kotak pencarian mengubahnya menjadi **Tampilan Grid Kartu** atau **Tampilan Daftar Kartu**, dan kembali ke **Tampilkan Tabel**. Setiap baris diakhiri dengan aksinya, misalnya **Detil**, atau menu **Lebih** (⋯) yang berisi **Hapus**.

Pencarian tidak membedakan huruf besar dan kecil: `wordpress` menemukan `WordPress`. Begitu juga saat mencari file dan log.

## Bertanya saja

Tombol **Tanya dPanel** di kanan bawah setiap halaman membuka asisten AI. Tanyakan, misalnya, "Apakah ada job yang gagal dalam 24 jam terakhir?". Lihat [Ask dPanel](../ai/overview.md).

## Kalau dasbor tidak bisa memeriksa

**Anda tidak bisa melihat kesehatan ruang kerja ini** berarti dPanel tidak mengizinkan akun Anda membaca status eksekusi dan agen di ruang kerja ini. Pastikan ruang kerja di sidebar adalah ruang kerja yang Anda ikuti, lalu minta akses kepada owner ruang kerja. Lihat [Anggota dan peran](../teams/members-and-roles.md).

## Pertanyaan yang sering diajukan

### Di mana proyek cloud dan kunci SSH?

Dasbor punya satu baris berisi empat kotak: server, aplikasi, load balancer, dan domain. Buka akun cloud dari **Proyek Cloud** dan kunci SSH dari **Manajemen Kunci** di sidebar.

### Mengapa grafik penggunaan kosong?

Data penggunaan muncul beberapa menit setelah server siap, dan hanya untuk server yang agennya melapor. Ruang kerja tanpa server yang siap belum punya data untuk digambar.

### Mengapa tab Ruang kerja tidak muncul?

Tab itu hanya ada di ruang kerja tim. Ruang kerja pribadi tidak punya anggota atau pengaturan tim untuk ditampilkan.

### Bagaimana cara beralih ke tema gelap?

Tekan ikon bulan di bagian bawah sidebar. dPanel mengingat pilihan Anda, dan layanan dPanel lain di domain yang sama ikut memakainya.
