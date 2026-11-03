---
title: Memasang perangkat lunak
description: Pasang basis data seperti MariaDB, runtime seperti Go, atau web server di server Ubuntu dari katalog modul dPanel, tanpa perlu SSH.
sidebar_position: 6
sidebar_icon: package-plus
---

dPanel memasang perangkat lunak di server lewat modul. Modul adalah resep yang sudah teruji untuk basis data, runtime bahasa pemrograman, atau perkakas: Anda menjawab beberapa pertanyaan, lalu dPanel memasang, mengatur, dan menjalankannya di server sebagai layanan systemd, lalu mencatat apa saja yang dipasangnya. Anda tidak perlu SSH atau `apt`.

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

## Mengelola basis data

Setelah MariaDB atau PostgreSQL berstatus **Terpasang**, barisnya di tab **Modul** menampilkan **Buka database**. Tombol itu membuka pengelola basis data di `dbmanager.devetek.app` pada tab baru, sudah masuk dengan akun dPanel Anda dan langsung mengarah ke server itu.

1. Tekan **Buka database**. Anda juga bisa membuka modulnya lalu menekan **Buka database** di sana.
2. Periksa mesin basis datanya, lalu isi pengguna basis data (MariaDB memakai `root`, PostgreSQL memakai pengguna admin yang Anda pilih) dan kata sandi yang Anda tentukan saat memasangnya.
3. Tekan **Connect**.

Dari sana Anda bisa melihat tabel, menjalankan kueri, serta membuat basis data dan pengguna dengan akses baca saja atau baca-tulis.

Pengelola basis data menjangkau basis data lewat koneksi SSH server, jadi basis data tidak perlu dibuka ke internet. Anda bisa membukanya di server yang boleh Anda ubah: server milik Anda sendiri, dan server di workspace tempat Anda punya akses editor atau lebih tinggi.

## Membuat basis data untuk aplikasi

Aplikasi seperti WordPress atau Laravel butuh basis data sendiri dan pengguna yang hanya bisa menjangkaunya. Keduanya dibuat dari modul server basis datanya sendiri, tanpa kata sandi administrator:

1. Di tab **Modul**, tekan **Add module**, lalu **Manage** pada **MariaDB** atau **PostgreSQL**. Modul itu harus sudah **Terpasang**.
2. Di bagian **Databases**, tekan **Create database**. Bagian ini menampilkan basis data yang sudah Anda buat di server ini.

![Bagian Databases di tampilan Manage MariaDB, dengan satu basis data dan tombol Create database](../../assets/servers/server-module-databases.webp)

3. Isi **Database Name** dan **Database User**, serta **Database Password** minimal 8 karakter. Nama di PostgreSQL memakai huruf kecil, angka, dan garis bawah.
4. Tekan **Install role**.

![Formulir Create database: nama basis data, pengguna, dan kata sandi](../../assets/servers/server-module-create-database.webp)

dPanel membuat basis data dan penggunanya, memberi pengguna itu semua hak hanya pada basis data tersebut, dan mengizinkannya masuk dari server itu sendiri (`127.0.0.1`), yaitu cara aplikasi di server yang sama terhubung. Membuat nama basis data yang sama lagi dengan kata sandi baru akan mengganti kata sandi penggunanya.

Arahkan aplikasi ke sana dengan variabel runtime: host `127.0.0.1`, port `3306` untuk MariaDB atau `5432` untuk PostgreSQL, nama basis data, pengguna, dan kata sandinya. Lihat [Variabel lingkungan](../applications/environment-variables.md). [Tanya dPanel](../getting-started/ask-dpanel.md) bisa melakukan semuanya untuk Anda dan membuatkan kata sandinya, yang ditampilkan sekali saja.

## Banyak server sekaligus

Grup server memasang modul yang sama ke semua anggotanya dalam satu operasi, dan menampilkan hasilnya per server. Grup ada di **Server**, lalu **Server groups**.
