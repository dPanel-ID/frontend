---
title: Kumpulan contoh perintah
description: Permintaan siap salin untuk Tanya dPanel, asisten AI dPanel. Rilis WordPress atau Laravel, tambah basis data, buka port, pasang domain, dan perbaiki aplikasi.
sidebar_position: 3
sidebar_icon: list-checks
---

Halaman ini mengumpulkan permintaan yang bisa Anda salin ke **Tanya dPanel** (**Ask dPanel** di tampilan bahasa Inggris), asisten AI dPanel, untuk tugas sehari-hari. Ganti nama dan angkanya dengan milik Anda. Pertanyaan langsung dijalankan; apa pun yang mengubah ruang kerja Anda kembali sebagai kartu untuk Anda setujui. Lihat [Setujui atau tolak perubahan](./approvals-and-secrets.md).

:::tip[Cara menulis permintaan yang baik]
Katakan **apa** yang Anda inginkan dan berikan fakta yang tidak mungkin diketahui asisten: server mana, repositori dan branch mana, domain apa. Pakai ID kalau Anda tahu (`server 145`, `aplikasi 35`). Anda tidak perlu tahu perintahnya; asisten menyusun langkah-langkahnya dan bertanya kalau ada yang kurang.
:::

## Mengenal isi ruang kerja

| Tujuan                              | Permintaan                                                           |
| ----------------------------------- | -------------------------------------------------------------------- |
| Melihat server                      | `Server mana saja yang sedang berhenti?`                             |
| Melihat apa yang berjalan di mana   | `Aplikasi apa saja yang berjalan di server 145, dan di port berapa?` |
| Memeriksa job terbaru               | `Apakah ada job yang gagal dalam 24 jam terakhir?`                   |
| Menampilkan domain                  | `Tampilkan domain saya beserta penyedia DNS-nya.`                    |
| Memeriksa ruang disk                | `Server mana yang disknya hampir penuh?`                             |
| Mempelajari sebuah konsep           | `Apa itu load balancer, dan apakah situs saya membutuhkannya?`       |
| Mencari halaman di dPanel           | `Di mana saya mengubah perintah build sebuah aplikasi?`              |
| Melihat siapa yang mengubah sesuatu | `Siapa yang menghapus load balancer di ruang kerja ini minggu ini?`  |

## Meluncurkan server

```text
Buat VM di proyek Google Cloud 7 saya bernama web-1: Ubuntu 24.04, 2 vCPU dan memori 4 GB, tipe mesin termurah, disk 30 GB, region asia-southeast1, dengan kunci SSH 37.
```

Asisten mencari akun cloud, region, tipe mesin, dan kunci SSH Anda, lalu mengusulkan server dengan harga **perkiraan**. Harga sebenarnya adalah yang ditagihkan penyedia cloud Anda. Server baru butuh 10 sampai 20 menit hingga siap; tanyakan "Apakah server web-1 sudah siap?" untuk memeriksanya.

Untuk menyiapkan ulang server setelah penyiapan gagal: `Jalankan ulang penyiapan server di server 145.`

Asisten meluncurkan server yang bergabung lewat SSH, jadi asisten memakai salah satu SSH key Anda, seperti pada contoh. Untuk meluncurkan server yang bergabung lewat agen dPanel, tanpa SSH key, pakai formulir atau `dnocs server create-cloud`. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md). Untuk menambahkan server yang sudah Anda punya, jalankan `sudo dnocs machine register` di server itu; lihat [Hubungkan server dengan agen dPanel](../servers/register-a-private-machine.md).

## Memasang perangkat lunak di server

```text
Server 145 sudah siap. Usulkan pemasangan MariaDB, PHP 8.5, dan FrankenPHP di sana.
```

Tanyakan dulu "Versi PostgreSQL apa saja yang bisa saya pasang?" kalau Anda belum yakin. Setujui satu pemasangan setiap kali dan tunggu sampai selesai. Lihat [Memasang perangkat lunak](../servers/install-software.md).

## Menambahkan basis data untuk aplikasi

```text
Di server 145, buat basis data MariaDB bernama wordpress dengan pengguna bernama wp.
```

Untuk PostgreSQL: `Di server 145, buat basis data PostgreSQL bernama shop dengan pengguna bernama shop.` (Nama di PostgreSQL memakai huruf kecil.)

Server perlu sudah terpasang MariaDB atau PostgreSQL; asisten memeriksanya dan mengusulkan pemasangan kalau belum ada. Saat Anda menyetujui, dPanel membuat basis data dan penggunanya, lalu menampilkan kata sandi yang dibuat **sekali saja** di kartu. Segera salin.

Untuk melihat isi basis data Anda: `Basis data apa saja yang ada di server 145? Beri saya tautan DB Manager-nya.`

## Merilis WordPress

Mintalah bertahap, setujui setiap kartu dan tunggu job-nya selesai sebelum langkah berikutnya:

1. `Server 145 sudah siap. Usulkan pemasangan MariaDB, PHP 8.5, dan FrankenPHP di sana.`
2. `Di server 145, buat basis data MariaDB bernama wordpress dengan pengguna bernama wp.` Simpan kata sandi yang dibuat.
3. `Buat aplikasi bernama Blog dari https://github.com/dPanel-ID/wordpress-example, branch main. Bahasa PHP 8.5 dengan FrankenPHP, perintah build ./scripts/build.sh, perintah start ./scripts/start.sh. Variabel runtime: WORDPRESS_DB_HOST=127.0.0.1:3306, WORDPRESS_DB_NAME=wordpress, WORDPRESS_DB_USER=wp, WORDPRESS_HOME=https://blog.example.com, WORDPRESS_SITEURL=https://blog.example.com, dan WORDPRESS_DB_PASSWORD sebagai rahasia yang saya ketik saat menyetujui.` Di kartunya, ketik kata sandi yang Anda simpan di langkah 2.
4. `Rilis aplikasi Blog dari main ke server 145.`
5. `Pasang Blog di blog.example.com dengan HTTPS.`

Versi langkah demi langkah dengan tangkapan layar ada di [Merilis WordPress](../tutorials/deploy-wordpress.md).

## Merilis Laravel

Mintalah bertahap, setujui setiap kartu dan tunggu job-nya selesai sebelum langkah berikutnya:

1. `Server 145 sudah siap. Usulkan pemasangan PostgreSQL, PHP 8.5, FrankenPHP, dan Node.js di sana.`
2. `Di server 145, buat basis data PostgreSQL bernama laravel dengan pengguna bernama laravel.` Simpan kata sandi yang dibuat.
3. Buat aplikasinya:

```text
Buat aplikasi bernama Shop dari https://github.com/dPanel-ID/laravel-example, branch main. Bahasa PHP 8.5 dengan Node.js sebagai runtime tambahan, perintah build ./scripts/build.sh, perintah start ./scripts/start.sh. Variabel runtime: APP_ENV=production, APP_DEBUG=false, APP_URL=https://shop.example.com, DB_CONNECTION=pgsql, DB_HOST=127.0.0.1, DB_PORT=5432, DB_DATABASE=laravel, DB_USERNAME=laravel, OCTANE_SERVER=frankenphp, dan DB_PASSWORD sebagai rahasia yang saya ketik saat menyetujui.
```

- Kalau repositori tidak punya definisi `.devetek`, asisten menanyakan bahasa, versi, perintah build, dan perintah start alih-alih menebak. Asisten mungkin menyarankan nilai dari `composer.json`, `package.json`, atau `.env.example` Anda; pastikan nilainya benar.
- **Jangan memilih port.** dPanel memilih port yang kosong di server saat rilis, lalu memberi tahu port mana yang dipakai.
- Kalau build juga memakai Node.js (misalnya `npm` untuk membuild aset front-end), sebutkan seperti contoh di atas. dPanel hanya menaruh runtime yang dideklarasikan di aplikasi pada path build; asisten memasang Node.js dan mendeklarasikannya untuk Anda.

Lalu: `Rilis aplikasi Shop dari main ke server 145.` dan `Pasang Shop di shop.example.com dengan HTTPS.` Panduan lengkapnya ada di [Merilis Laravel](../tutorials/deploy-laravel.md).

## Mengatur variabel lingkungan

| Tujuan                      | Permintaan                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| Menambah variabel biasa     | `Di aplikasi Shop, atur variabel runtime APP_DEBUG=false.`                                               |
| Menambah rahasia            | `Di aplikasi Shop, atur MAIL_PASSWORD sebagai variabel runtime rahasia yang saya ketik saat menyetujui.` |
| Menambah variabel build     | `Di aplikasi Shop, atur variabel build NODE_ENV=production.`                                             |
| Memeriksa yang sudah diatur | `Variabel lingkungan apa saja yang dimiliki aplikasi Shop?` (hanya nama, tidak pernah nilainya)          |

Jangan pernah menulis nilai rahasia di chat. Mintalah "sebagai rahasia yang saya ketik saat menyetujui", lalu ketik nilainya di kolom pada kartu. Perubahan berlaku mulai rilis berikutnya, jadi asisten menawarkan untuk merilis setelahnya. Lihat [Variabel lingkungan](../applications/environment-variables.md).

## Memasang aplikasi di sebuah domain

```text
Pasang aplikasi Shop di shop.example.com dengan HTTPS.
```

- Untuk domain yang dikelola di dPanel, asisten juga membuat record DNS-nya. Lihat [Domain dan DNS](../networking/domains-and-dns.md).
- Untuk memilih engine: `Pakai engine APISIX.` (Caddy adalah bawaan; HAProxy juga tersedia.)
- Proxy Cloudflare tetap mati kecuali Anda memintanya: `Lewatkan melalui proxy Cloudflare.`
- Aplikasinya harus sudah punya deployment yang siap.

Untuk menjangkau basis data dari luar dengan load balancer TCP:

```text
Buat load balancer TCP bernama pg-ext di server 145 yang membuka PostgreSQL-nya di port 15432, hanya bisa dijangkau dari 203.0.113.7.
```

Kalau firewall server menyala, asisten memperingatkan bahwa port itu juga harus diizinkan dan menawarkan aturannya. Lihat [Load balancer](../networking/load-balancers.md).

## Membuka atau menutup port

| Tujuan                         | Permintaan                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------- |
| Melihat aturan                 | `Tampilkan aturan firewall di server 145.`                                    |
| Melihat pratinjau perubahan    | `Apa yang berubah kalau saya menerapkan firewall di server 145?`              |
| Membuka port                   | `Di server 145, izinkan port TCP 8080 dari mana saja, lalu terapkan.`         |
| Membuka port untuk satu alamat | `Di server 145, izinkan port TCP 5432 hanya dari 203.0.113.7, lalu terapkan.` |
| Menutup port                   | `Di server 145, hapus aturan untuk port 8080 lalu terapkan firewall.`         |

Menambah atau menghapus aturan hanya mengubah daftar yang tersimpan; **menerapkannya** yang memasang aturan itu di server, jadi Anda menyetujui dua kartu. SSH, serta HTTP/HTTPS di server yang punya engine load balancer, selalu tetap terbuka. Lihat [Firewall](../servers/firewall.md).

## Membaca log

| Tujuan                       | Permintaan                                                                 |
| ---------------------------- | -------------------------------------------------------------------------- |
| Log terbaru sebuah aplikasi  | `Tampilkan error terakhir di log runtime aplikasi Shop.`                   |
| Kenapa build gagal           | `Tampilkan log build dari build terakhir aplikasi Shop yang gagal.`        |
| Lalu lintas ke sebuah domain | `Tampilkan permintaan terakhir ke shop.example.com dan error 5xx apa pun.` |
| Sertifikat HTTPS             | `Periksa sertifikat HTTPS shop.example.com.`                               |

Lihat [Membaca log](../logs/reading-logs.md) untuk membacanya sendiri.

## Mencari tahu kenapa aplikasi gagal

```text
Kenapa aplikasi Shop gagal di server 145?
```

```text
Situs saya shop.example.com menampilkan error 502. Cari tahu penyebabnya.
```

Asisten membaca deployment, log build dan runtime-nya, serta penggunaan server, mengutip baris yang penting, lalu mengusulkan perbaikan. Selengkapnya di [Mendiagnosis masalah dengan AI](./diagnose-problems.md).

## Cluster, grup, dan worker

| Tujuan                          | Permintaan                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| Melihat pilihan                 | `Engine cluster apa saja yang bisa saya pakai?`                                                  |
| Membangun cluster               | `Buat cluster k3s bernama lab dengan server 150 sebagai server serta 151 dan 152 sebagai agent.` |
| Mengulang pemasangan yang gagal | `Jalankan ulang pemasangan cluster 12.`                                                          |
| Mengelompokkan server           | `Buat grup server bernama web berisi server 145 dan 146.`                                        |
| Tempat job dijalankan           | `Apakah job saya berjalan di worker bersama atau privat?`                                        |
| Mengganti worker                | `Alihkan ruang kerja ini ke worker privat.`                                                      |

Lihat [Grup server dan cluster](../clusters/overview.md) dan [Worker](../workers/overview.md).

## Bersih-bersih

```text
Hapus aplikasi Old Shop beserta semua yang harus dihapus lebih dulu.
```

Penghapusan tidak bisa dibatalkan. Asisten memastikan resource-nya, menampilkan ID dan namanya, lalu mengusulkan penghapusan dengan urutan yang diterima dPanel: load balancer, deployment, build, lalu aplikasinya. Server, load balancer, dan deployment dihapus dalam dua langkah: langkah pertama membersihkannya, langkah kedua menghapus datanya.

## Pertanyaan yang sering diajukan

### Apakah saya harus memakai kalimat yang persis seperti ini?

Tidak. Ini hanya contoh. Tulislah seperti Anda berbicara, dalam bahasa Indonesia atau Inggris; asisten akan bertanya kalau ada yang kurang.

### Bisakah saya meminta beberapa perubahan sekaligus?

Bisa. Asisten menampilkan satu kartu untuk setiap perubahan. Setujui satu per satu dan tunggu setiap job-nya, karena dPanel menjalankan satu job pada satu waktu untuk setiap server.

### Bagaimana kalau saya tidak tahu ID-nya?

Pakai namanya, atau tanyakan dulu: "Aplikasi apa saja yang saya punya?" Asisten tidak pernah menebak ID; kalau sebuah nama cocok dengan lebih dari satu hal, asisten bertanya mana yang Anda maksud.

### Kenapa asisten tidak memilihkan port untuk aplikasi saya?

Asisten menyerahkan port ke dPanel, yang memilih port kosong di server saat rilis. Deployment dan kartunya memberi tahu port mana yang dipakai.
