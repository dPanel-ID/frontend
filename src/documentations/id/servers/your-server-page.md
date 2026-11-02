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

Semua yang dipasang dPanel, dengan versi dan statusnya: **Terpasang**, **Memasang**, atau **Gagal**. **Tambah modul** membuka katalog. **Segarkan inventaris** meminta data terbaru dari agen. Lihat [Memasang perangkat lunak](./install-software.md).

![Tab Modul berisi modul yang terpasang beserta statusnya](../../assets/servers/server-modules.webp)

## Layanan

Semua unit systemd yang terlihat oleh agen. Layanan adalah program yang dijaga Linux tetap berjalan di latar belakang, misalnya basis data atau web server. Pakai tombol di barisnya untuk menyalakan, menghentikan, memulai ulang, atau me-reload layanan.

Kebanyakan server punya lebih dari seratus unit, dan banyak yang memang berstatus **Dead** atau **Exited**. Jadi angka "perlu perhatian" pada mesin baru itu wajar.

![Tab Layanan berisi unit systemd](../../assets/servers/server-services.webp)

## Pengguna

Akun Linux di mesin itu, dengan UID, direktori home, dan shell-nya. **Tambah pengguna** membuat akun terkelola. Sebagian besar entri di server baru milik sistem, jadi biarkan saja.

![Tab Pengguna berisi akun Linux](../../assets/servers/server-users.webp)

## Jaringan

Port mana yang terbuka, proses mana yang memakainya, dari mana koneksi diizinkan, dan statusnya. Buka tab ini kalau ada yang tidak bisa dijangkau. Aplikasi yang sedang mendengarkan port-nya muncul di sini sebagai **LISTEN**. Kolom **Firewall** menunjukkan apakah aturan firewall membuat setiap port bisa dijangkau dari luar.

Kotak **Firewall** membuka firewall server: aturannya, apakah sudah diterapkan, dan **Tinjau dan terapkan**. Lihat [Firewall](./firewall.md).

![Tab Jaringan berisi port yang terbuka](../../assets/servers/server-network.webp)

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

| Kartu          | Tombol           | Fungsinya                                                               |
| -------------- | ---------------- | ----------------------------------------------------------------------- |
| Koneksi        | **Edit koneksi** | Mengubah alamat, login SSH, dan port agen yang dipakai dPanel.          |
| Penyiapan      | **Instal ulang** | Masuk ulang lewat SSH, memasang ulang agen, dan menyegarkan inventaris. |
| Zona berbahaya | **Hapus server** | Menghapus server. Lihat [Menghapus server](./delete-a-server.md).       |

**Penyiapan** disembunyikan selama server sedang disiapkan atau dihapus, dan pada server yang sudah dihapus, karena saat itu tidak ada yang bisa dipasang ulang. Server tetap berada di workspace tempat ia dibuat; server tidak bisa dipindahkan ke workspace lain.

![Tab Pengaturan dengan kartu Koneksi, Penyiapan, dan Zona berbahaya](../../assets/servers/server-settings.webp)
