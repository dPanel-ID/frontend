---
title: Cara situs web berjalan di server Anda
description: Baru mengenal server? Konsep di balik setiap tutorial dPanel dengan bahasa sederhana: server, perangkat lunak, basis data, repositori, build, port, domain, dan HTTPS, serta hubungannya.
sidebar_position: 1
sidebar_icon: circle-help
sidebar_label: Mulai di sini
---

Anda tidak perlu pernah mengelola server untuk mengikuti tutorial di bagian ini. Halaman ini menjelaskan, dengan bahasa sederhana, beberapa konsep yang dipakai tutorial. Baca sekali saja; setiap tutorial menautkan kembali ke sini saat sebuah istilah muncul.

## Gambaran besarnya

Saat seseorang membuka situs Anda, inilah yang terjadi:

1. Mereka mengetik alamat Anda, misalnya `blog.example.com`. **DNS** mengubah nama itu menjadi alamat **server** Anda.
2. **Load balancer** di server Anda menjawab. Load balancer memegang **sertifikat HTTPS**, sehingga browser menampilkan gembok, lalu meneruskan kunjungan ke **aplikasi** Anda.
3. Aplikasi Anda, misalnya WordPress atau Laravel, menyusun halamannya. Saat butuh data tersimpan, seperti tulisan atau pengguna, aplikasi bertanya ke **basis data** di server yang sama.
4. Halaman kembali lewat jalur yang sama ke pengunjung.

dPanel menyiapkan setiap bagian rantai itu untuk Anda, lewat formulir di aplikasi web. Tutorial membahasnya sesuai urutan keberadaannya: server, perangkat lunak, basis data, aplikasi, lalu alamatnya.

## Istilah-istilahnya

| Istilah | Artinya di sini |
| --- | --- |
| **Server** | Komputer di pusat data yang menyala terus, disewa dari penyedia cloud seperti Google Cloud atau AWS. dPanel meluncurkannya di akun cloud Anda sendiri dan memasang Ubuntu Linux di sana. Anda membayar penyedia selama server itu ada. |
| **Modul** | Perangkat lunak yang dipasangkan dPanel di server Anda: basis data seperti MariaDB, bahasa seperti PHP atau Node.js, atau web server seperti FrankenPHP. Anda memilihnya dari daftar, bukan mengetik perintah instalasi. |
| **Basis data** | Tempat aplikasi menyimpan datanya. Satu program basis data (MariaDB atau PostgreSQL) bisa menampung banyak basis data; setiap aplikasi mendapat miliknya sendiri, dengan pengguna dan kata sandinya sendiri, sehingga tidak bisa menyentuh yang lain. |
| **Repositori** | Folder kode aplikasi Anda di GitHub. dPanel menyalinnya (clone) ke server. |
| **Build** | Perintah yang mengubah kode menjadi siap dijalankan: mengunduh pustaka, mengompilasi, menyiapkan berkas. Perintah ini berjalan di server setiap kali Anda merilis. |
| **Runtime** | Program bahasa yang dibutuhkan build atau aplikasi, seperti PHP atau Node.js. Satu aplikasi bisa butuh lebih dari satu: Laravel memakai PHP untuk berjalan dan Node.js untuk membangun gaya dan skrip halamannya. |
| **Variabel environment** | Pengaturan yang diberikan ke aplikasi dari luar kodenya, seperti nama dan kata sandi basis data. Anda mengetiknya di dPanel, jadi kata sandi tidak pernah masuk ke repositori. |
| **Rilis (deploy)** | Membangun kode di server lalu menjalankannya. Setiap rilis menghasilkan versi baru; dPanel menyimpan versi lama agar Anda bisa kembali ke sana. |
| **Port** | Pintu bernomor di server. Aplikasi Anda mendengarkan di salah satunya, misalnya `9102`. dPanel memilihkan yang kosong. Pengunjung tidak pernah melihatnya: load balancer meneruskan ke sana. |
| **Domain dan DNS** | Alamat Anda di internet, misalnya `example.com`, dan record yang mengarahkan nama di bawahnya, misalnya `blog.example.com`, ke sebuah server. dPanel membuat record-nya saat domain ada di **Domain & DNS**. |
| **Load balancer** | Pintu depan situs Anda. Load balancer menjawab di port web biasa (80 dan 443), menangani HTTPS, dan mengirim setiap kunjungan ke aplikasi yang tepat. |
| **HTTPS dan sertifikat** | Enkripsi yang memunculkan gembok di browser. dPanel mengambil sertifikat gratis dari Let's Encrypt dan memperpanjangnya untuk Anda. |

## Yang perlu disiapkan sebelum tutorial apa pun

Siapkan sekali saja; semua tutorial memakainya.

1. **Akun dPanel** yang sudah masuk. Lihat [Masuk](../getting-started/sign-in.md).
2. **GitHub terhubung**, agar dPanel bisa membaca kode Anda. Lihat [Hubungkan GitHub](../getting-started/connect-github.md).
3. **SSH key dan akun cloud** di dPanel. SSH key membuat dPanel bisa menjangkau server Anda dengan aman; akun cloud adalah tempat server dibuat dan ditagih. Lihat [Sebelum memulai](../servers/before-you-start.md). Kalau Anda sudah punya mesin Ubuntu, Anda bisa [menghubungkannya](../servers/connect-your-own-server.md).
4. **Domain** yang sudah ditambahkan di **Domain & DNS**. Lihat [Domain dan DNS](../networking/domains-and-dns.md).

## Kebiasaan baik sejak awal

- **Kerjakan satu hal setiap kali dan tunggu sampai selesai.** Memasang perangkat lunak dan merilis butuh beberapa menit. dPanel menampilkan progresnya di tab **Modul** server, halaman aplikasi, dan daftar job.
- **Simpan kata sandi di pengelola kata sandi.** dPanel menampilkan kata sandi buatan sekali saja. Salin sebelum menutup formulirnya.
- **Jangan pernah menaruh kata sandi di kode atau di chat**, termasuk ke [asisten](../getting-started/ask-dpanel.md). Taruh di variabel environment.
- **Hapus yang tidak dipakai.** Server cloud memakan biaya setiap jam selama masih ada, meski menganggur.

## Pilih tutorial

- [Deploy WordPress dengan MariaDB](./deploy-wordpress.md): blog atau situs perusahaan. Tempat paling mudah untuk memulai.
- [Deploy Laravel dengan PostgreSQL](./deploy-laravel.md): aplikasi web PHP yang juga butuh Node.js untuk build.
