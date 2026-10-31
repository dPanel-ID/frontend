---
title: 'Halaman server Anda'
description: 'Fungsi setiap tab pada sebuah server.'
sidebar_position: 5
---

Setiap server punya satu halaman, dan semua tindakan terhadap server itu ada di sana. Bagian kepala menampilkan nama, status siap atau tidak, alamatnya, versi Ubuntu, lokasinya, login yang dipakai dPanel, versi agen dan waktu pembuatannya.

![Halaman server pada tab Overview](../../assets/servers/server-overview.png 'Overview: pemakaian langsung dari agen, lalu ringkasan dan detail.')

## Modules

Semua yang dipasang dPanel, dengan versi dan kondisinya. Add module membuka katalog.

![Tab Modules menampilkan modul yang terpasang](../../assets/servers/server-modules.png)

## Services

Semua unit systemd yang terlihat oleh agen. Service adalah program yang dijaga Linux tetap berjalan di latar belakang, misalnya basis data atau web server. Start, stop, restart atau reload lewat menu di ujung barisnya.

Kebanyakan server punya lebih dari seratus unit dan banyak yang memang Dead atau Exited, jadi angka Needs attention pada mesin baru itu wajar.

![Tab Services menampilkan unit systemd](../../assets/servers/server-services.png)

## Users

Akun Linux di mesin itu, dengan direktori home dan shell-nya. Sebagian besar entri di server baru milik sistem dan sebaiknya dibiarkan.

![Tab Users menampilkan akun Linux](../../assets/servers/server-users.png)

## Network

Port mana yang terbuka, proses mana yang memakainya, dan dari mana koneksi diizinkan. Halaman inilah yang dicek saat sesuatu tidak bisa dijangkau.

![Tab Network menampilkan port yang terbuka](../../assets/servers/server-network.png)

## Files dan Logs

Files membuka pengelola berkas untuk menelusuri, mengunggah dan melihat berkas teks. Logs menampilkan baris terbaru sebuah berkas log, terurai menjadi waktu, level dan pesan, lengkap dengan penyaring.

![Tab Logs menampilkan baris log yang terurai](../../assets/servers/server-logs.png)

## Settings

Perubahan yang jarang diperlukan, masing-masing menjelaskan dirinya: mengubah detail koneksi, menjalankan ulang penyiapan, memindahkan server ke workspace lain, dan zona berbahaya untuk menghapusnya.

![Tab Settings berisi koneksi, penyiapan, kepemilikan dan zona berbahaya](../../assets/servers/server-settings.png)
