---
title: Halaman server Anda
description: Setiap tab halaman server dPanel: pemakaian CPU dan memori langsung, modul, layanan systemd, pengguna Linux, port terbuka, berkas, log, dan pengaturan.
sidebar_position: 5
sidebar_icon: gauge
---

Setiap server di dPanel punya satu halaman, dan semua tindakan terhadap server itu ada di sana: pemakaian langsung, modul terpasang, layanan systemd, pengguna Linux, port terbuka, berkas, log, dan pengaturan. Buka dari **Server** dengan memilih baris server tersebut.

## Bagian kepala

Bagian kepala menampilkan nama, status, alamat, versi Ubuntu, dan lokasi server, lalu sebaris keterangan: login SSH yang dipakai dPanel (misalnya `ubuntu@203.0.113.10:22`), versi agen, workspace, siapa yang membuat server, dan kapan.

| Kontrol               | Fungsinya                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Segarkan (↻)          | Membaca ulang status, pemakaian, layanan, dan modul server.                                          |
| **Ubah server** (✎)   | Mengubah alamat, login SSH, dan port agen yang dipakai dPanel.                                       |
| **Buka terminal**     | Membuka shell di browser. Lihat [Terhubung lewat SSH](./connect-over-ssh.md).                        |
| **Tindakan lain** (⋯) | **Pasang ulang server** menjalankan setup lagi; **Hapus server** menghapusnya. Lihat tabel di bawah. |

Pilih lencana status untuk melihat arti status tersebut. Selama dPanel menyiapkan server, banner biru memberi tahu hal itu, dengan tombol **Ikuti log**. Jika setup gagal, banner merah **Penyiapan tidak selesai** menawarkan **Lihat penyebabnya**.

## Ringkasan

**Pemakaian langsung** membaca CPU, memori, dan disk dari agen setiap beberapa detik selama halaman terbuka. Di bawahnya ada jumlah aplikasi, load balancer, basis data, dan modul, lalu **Detail server** (alamat, login SSH, sistem operasi, agen, penyedia, kepemilikan, **Dibuat oleh**, dan kapan server ditambahkan) dan **Yang berjalan di sini**.

![Halaman server pada tab Ringkasan](../../assets/servers/server-overview.webp)

## Modul

Semua yang dipasang dPanel, satu baris per modul, dengan versi dan statusnya: **Terpasang**, **Memasang**, **Gagal**, atau **Campuran**. **Tambah modul** membuka katalog. **Segarkan inventaris** meminta data terbaru dari agen dan membuang modul yang tidak lagi dilaporkannya. Hitungannya hanya mencakup modul tingkat atas; basis data yang Anda buat di MariaDB atau PostgreSQL ada di tampilan **Kelola** modul tersebut.

Beberapa baris punya pintasan: **Buka database** pada MariaDB dan PostgreSQL membuka DB Manager, alat basis data di browser, langsung mengarah ke server ini; **Kelola firewall** pada modul Firewall membuka tampilan [Firewall](./firewall.md). Lihat [Memasang perangkat lunak](./install-software.md).

![Tab Modules berisi modul terpasang, dengan Manage firewall di baris Firewall dan Open database di baris MariaDB](../../assets/servers/server-modules.webp)

## Layanan

Semua unit systemd yang terlihat oleh agen. Layanan adalah program yang dijaga Linux tetap berjalan di latar belakang, misalnya basis data atau web server. Pakai tombol di barisnya untuk menyalakan, menghentikan, memulai ulang, atau me-reload layanan.

Kebanyakan server punya lebih dari seratus unit, dan banyak yang memang berstatus **Dead** atau **Exited**. Jadi angka "perlu perhatian" pada mesin baru itu wajar.

![Tab Layanan berisi unit systemd](../../assets/servers/server-services.webp)

## Pengguna

Akun Linux di mesin itu, dengan UID, direktori home, dan shell-nya. **Tambah pengguna** membuat akun terkelola. Sebagian besar entri di server baru milik sistem, jadi biarkan saja.

![Tab Pengguna berisi akun Linux](../../assets/servers/server-users.webp)

## Jaringan

Tiga kotak di atas mengganti tampilannya:

- **Port aktif**: port mana yang terbuka, proses mana yang memakainya, dari mana koneksi datang (**Allow from**), statusnya, dan kolom **Firewall** yang menunjukkan apakah aturan firewall membuat port itu bisa dijangkau dari luar. Aplikasi yang sedang mendengarkan port-nya muncul di sini sebagai **LISTEN**. Buka tampilan ini kalau ada yang tidak bisa dijangkau.
- **Antarmuka**: kartu jaringan server beserta alamat IPv4 dan IPv6-nya.
- **Firewall**: apakah firewall **Nyala** atau **Mati**, aturannya, dan **Tinjau dan terapkan**. Lihat [Firewall](./firewall.md).

![Tab Network pada Active ports: tabel port dengan prosesnya, statusnya dan kolom Firewall berisi Allowed from anywhere atau No allow rule](../../assets/servers/server-network.webp 'Port aktif: 22, 443 dan 3306 diizinkan dari mana saja; sisanya hanya didengarkan di dalam server.')

## Berkas

**Buka pengelola berkas** untuk menjelajah folder dalam bentuk pohon atau tabel, mengunggah berkas, membuat folder, dan melihat isi berkas teks.

![Tab Berkas dengan tombol Buka pengelola berkas](../../assets/servers/server-files.webp)

## Log

Baris terbaru dari satu berkas log, diurai menjadi waktu, level, sumber, dan pesan.

1. Pilih berkas di **Sumber log**. **Auth** ada di urutan pertama.
2. Pilih jumlah baris: 20, 50, 100, 200, atau 500.
3. Ketik di **Saring baris log** untuk mempersempit hasil.
4. Pilih satu baris untuk membuka panel **Entri log**, berisi pesan lengkap dan tombol **Salin baris mentah**.

**Segarkan** membaca ulang berkasnya. Menu di sebelahnya mengatur **Muat ulang otomatis**: **Mati** secara bawaan, atau **Setiap 30 detik**, **Setiap menit**, dan **Setiap 5 menit**.

![Tab Log sebuah server, berisi baris log yang sudah diurai](../../assets/servers/server-logs.webp)

:::note[Log server tidak punya rentang waktu]
Tab ini membaca baris terbaru dari sebuah berkas. Rentang waktu, halaman, dan unduhan ada di log aplikasi dan log load balancer. Lihat [Membaca log](../logs/reading-logs.md).
:::

## Pengaturan

Perubahan yang jarang dibutuhkan, masing-masing dengan penjelasan.

| Kartu          | Tombol           | Fungsinya                                                                                                                                           |
| -------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Koneksi        | **Edit koneksi** | Mengubah alamat, login SSH, dan port agen yang dipakai dPanel.                                                                                      |
| Penyiapan      | **Instal ulang** | Menjalankan penyiapan server lagi: masuk ulang lewat SSH, memasang ulang agen, dan menyegarkan inventaris. Modul terpasang dan data Anda tetap ada. |
| Zona berbahaya | **Hapus server** | Menghapus server. Lihat [Menghapus server](./delete-a-server.md).                                                                                   |

**Penyiapan** disembunyikan selama server sedang disiapkan atau dihapus, dan pada server yang sudah dihapus, karena saat itu tidak ada yang bisa dipasang ulang. Server tetap berada di workspace tempat ia dibuat; server tidak bisa dipindahkan ke workspace lain.

Dari terminal, `dnocs server setup --id 140` sama dengan **Instal ulang**. Tambahkan `--force` untuk menjalankannya walaupun server masih berstatus sedang diproses, misalnya saat penyiapan macet. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang `dnocs`.

![Tab Pengaturan dengan kartu Koneksi, Penyiapan, dan Zona berbahaya](../../assets/servers/server-settings.webp)

## Pertanyaan yang sering diajukan

### Bagaimana cara menemukan server dengan cepat?

Ketik di kotak pencarian di **Servers**. Pencariannya tidak membedakan huruf besar dan kecil, jadi `WEB` menemukan `web-01`.

### Kenapa bagian kepala menampilkan nama seseorang?

**Dibuat oleh** menyebut orang yang menambahkan server, supaya tim tahu harus bertanya ke siapa. Pilih namanya untuk membuka profil publiknya.

### Apa yang diubah Instal ulang di server saya?

Fitur ini masuk ulang lewat SSH, memasang ulang agen dPanel, dan menyegarkan inventaris. Modul, aplikasi, dan data yang terpasang tetap seperti semula.

### Di mana saya membuka basis data yang berjalan di server ini?

Di tab **Modul**, tekan **Buka database** pada baris MariaDB atau PostgreSQL. Lihat [Memasang perangkat lunak](./install-software.md#mengelola-basis-data).

### Kenapa port yang saya buka tidak bisa dijangkau dari luar?

Periksa kolom **Firewall** di **Jaringan → Port aktif**. **Tidak ada aturan izin** berarti firewall memblokirnya; tambahkan aturan di [Firewall](./firewall.md). Periksa juga bahwa programnya mendengarkan di `0.0.0.0`, bukan `127.0.0.1`.
