---
title: Memasang perangkat lunak
description: Tambahkan basis data atau runtime lewat katalog modul.
sidebar_position: 6
sidebar_icon: package-plus
---

dPanel memasang perangkat lunak lewat modul. Modul adalah resep yang sudah teruji: Anda menjawab beberapa pertanyaan, dPanel memasang, mengatur, dan menjalankannya di server, lalu mencatat apa saja yang dipasangnya.

## Buka katalognya

1. Buka server, lalu tab **Modul**.
2. Tekan **Tambah modul**.

**Katalog modul** mengelompokkan isinya: **Containers**, **Databases**, **Infrastructure**, **Programming Languages Runtime**, dan **Utilities**. Modul yang sudah ada di server ditandai terpasang, dengan tombol **Kelola** alih-alih **Pasang**.

![Katalog modul, dikelompokkan per kategori](../../assets/servers/server-module-catalog.webp)

## Memasang basis data

1. Tekan **Pasang** pada modul yang diinginkan, misalnya **MariaDB**.
2. Formulirnya menampilkan role yang akan dijalankan dan hanya menanyakan hal yang tidak bisa diputuskan sendiri. Untuk MariaDB: **MariaDB Version**, **Root Password**, dan **Bind Address**.
3. Tekan **Install role**, lalu konfirmasi.

![Formulir pemasangan MariaDB, dengan versi, kata sandi root, dan bind address](../../assets/servers/server-module-install-form.webp)

:::warning[Tentukan kata sandinya sendiri]
Kata sandi root wajib diisi, minimal 8 karakter. Tidak ada nilai bawaan, karena basis data dengan kata sandi bawaan yang sudah tersebar bisa dimasuki siapa saja. dPanel hanya menyimpannya di server dan tidak menampilkannya lagi, jadi simpan salinannya di tempat yang aman.
:::

## Setelah itu

Modul muncul di tab **Modul** dengan status **Memasang**. Basis data butuh beberapa menit. Setelah selesai:

- Tab **Modul** menampilkannya sebagai **Terpasang**, lengkap dengan versinya.
- Tab **Ringkasan** mencantumkannya di **Yang berjalan di sini**.
- Tab **Layanan** menunjukkan layanannya berjalan.

Kalau statusnya **Gagal**, buka modulnya untuk melihat penyebabnya, perbaiki, lalu pasang lagi.

:::tip[Runtime untuk aplikasi]
Runtime bahasa tidak harus dipasang lebih dulu. Saat [membuat aplikasi](../applications/create-an-application.md), Anda memilih runtime-nya sebagai dependensi, dan dPanel memasangnya di server.
:::

## Banyak server sekaligus

Grup server memasang modul yang sama ke semua anggotanya dalam satu operasi, dan menampilkan hasilnya per server. Grup ada di **Server**, lalu **Server groups**.
