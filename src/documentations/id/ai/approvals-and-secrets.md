---
title: Setujui atau tolak perubahan
description: Cara membaca kartu persetujuan Tanya dPanel, menyetujui atau menolaknya, mengetik rahasia dengan aman, menyimpan kata sandi yang dibuat, dan saat chat ditutup.
sidebar_position: 4
sidebar_icon: shield-check
sidebar_label: Setujui atau tolak perubahan
---

Saat Anda meminta perubahan ke **Tanya dPanel** (**Ask dPanel** di tampilan bahasa Inggris), asisten AI dPanel, asisten tidak pernah menjalankannya sendiri. Ia menampilkan **kartu persetujuan** yang menjelaskan persis apa yang akan terjadi, dan perubahan baru dijalankan saat Anda menekan **Setujui** (**Approve**). Tekan **Tolak** (**Reject**) dan tidak ada yang berubah.

## Apa yang butuh persetujuan

| Langsung dijalankan (hanya membaca)                                 | Menunggu di kartu (mengubah sesuatu)                                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Menampilkan dan menjelaskan server, aplikasi, domain, load balancer | Meluncurkan server cloud, menjalankan ulang penyiapan server                                           |
| Membaca log, sertifikat, job, dan riwayat audit                     | Memasang perangkat lunak (modul), membuat basis data                                                   |
| Mencari di dokumentasi                                              | Membuat, mengubah, atau merilis aplikasi, mengatur variabel lingkungan                                 |
| Memeriksa apa yang akan berubah kalau firewall diterapkan           | Membuat atau mengubah rute load balancer, menambah atau menghapus aturan firewall, menerapkan firewall |
| Menyegarkan daftar modul server dari agent-nya                      | Membuat grup server dan cluster, beralih antara worker bersama dan privat                              |
|                                                                     | Setiap penghapusan                                                                                     |

## Membaca kartu

![Kartu persetujuan bertanda Waiting for your approval yang menjelaskan perubahan variabel lingkungan aplikasi, dengan kolom untuk nilai rahasia serta tombol Approve dan Reject](../../assets/ai/approval-card-secret.webp 'Kartu menjelaskan persis apa yang akan dijalankan. Setujui tetap abu-abu sampai semua kolom rahasia terisi.')

Kartu terdiri dari empat bagian:

1. **Status**, di bagian atas: **Menunggu persetujuan Anda** (**Waiting for your approval**) berarti belum ada yang terjadi.
2. **Ringkasan**: apa yang akan dijalankan, di server atau aplikasi mana, dengan nama dan pengaturan apa. Untuk server cloud, ringkasan mencantumkan ukuran dan perkiraan harga dari asisten. Untuk load balancer, ringkasan menyebutkan domain dan record DNS yang dibuatnya.
3. **Kolom rahasia**, hanya kalau perubahan itu butuh nilai yang harus Anda berikan. Lihat [Rahasia yang Anda ketik](#rahasia-yang-anda-ketik).
4. **Setujui** dan **Tolak**.

Di atas kartu, pesan asisten mengulang rencananya dengan kata-kata sederhana dan memberikan ID tindakan, seperti `aipa_dblto7q0ehgehnm7fugg`. Anda hanya butuh ID itu di terminal.

Sebelum menekan **Setujui**, periksa:

- Apakah server, aplikasi, atau domainnya benar? Cocokkan ID dan namanya dengan yang Anda lihat di dPanel.
- Apakah ini yang Anda minta, dan tidak lebih?
- Untuk penghapusan: apakah Anda yakin? Penghapusan tidak bisa dibatalkan.

## Menyetujui atau menolak

1. Baca kartunya.
2. Isi kolom rahasia, kalau ada.
3. Tekan **Setujui** untuk menjalankan perubahan, atau **Tolak** untuk membatalkannya.

![Kartu bertanda Rejected; nothing was changed, diikuti konfirmasi asisten bahwa tidak ada perubahan yang dibuat](../../assets/ai/rejected-card.webp 'Kartu yang ditolak tetap ada di chat sebagai catatan.')

Status kartu berubah seiring perubahan dijalankan:

| Status                                             | Artinya                                                                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Menunggu persetujuan Anda**                      | Belum ada yang berubah                                                                                               |
| **Menerapkan keputusan Anda**                      | dPanel sedang memproses tombol Setujui atau Tolak yang Anda tekan                                                    |
| **Disetujui dan dijalankan**                       | dPanel sudah memulai perubahannya. Job yang lama, seperti rilis, terus berjalan; tanyakan perkembangannya ke asisten |
| **Disetujui; dPanel masih menerapkannya**          | Perubahan masih diterapkan                                                                                           |
| **Disetujui, tetapi gagal dijalankan**             | dPanel menolak perubahan itu; chat menjelaskan alasannya                                                             |
| **Ditolak; tidak ada yang diubah**                 | Anda menolaknya                                                                                                      |
| **Kedaluwarsa; minta asisten mengusulkannya lagi** | Tidak ada yang menjawab dalam 24 jam                                                                                 |

Setelah persetujuan, asisten melaporkan apa yang terjadi dan sering mengusulkan langkah berikutnya di kartu baru, misalnya rilis setelah aplikasi dibuat. Setujui satu perubahan setiap kali, dan tunggu setiap job selesai sebelum job berikutnya di server yang sama: dPanel menjalankan satu job pada satu waktu untuk setiap server.

## Siapa yang bisa menyetujui

- **Hanya orang yang memulai percakapan.** Percakapan bersifat pribadi; rekan tim Anda tidak bisa melihatnya atau menyetujui kartunya.
- **Dengan akses Anda sendiri.** Perubahan dijalankan sebagai Anda, dengan peran Anda di ruang kerja. Kalau peran Anda tidak mengizinkannya, kartu berakhir dengan status **Disetujui, tetapi gagal dijalankan** dan chat menjelaskan alasannya. Lihat [Anggota dan peran](../teams/members-and-roles.md).
- **Tepat sekali, persis seperti yang ditampilkan.** Argumennya dikunci saat kartu dibuat. Meminta perubahan yang sama lagi akan menampilkan kartu yang sama, bukan kartu kedua, sehingga perubahan tidak bisa berjalan dua kali secara tidak sengaja.

## Rahasia yang Anda ketik

Beberapa perubahan membutuhkan nilai yang hanya Anda yang tahu, seperti kata sandi basis data yang dipakai aplikasi untuk terhubung. Asisten tidak pernah memintanya di chat. Sebagai gantinya, kartu menampilkan satu kolom untuk setiap nilai, di bawah **Ketik nilai rahasia di bawah. Nilai ini hanya dikirim bersama persetujuan Anda dan tidak pernah ditampilkan ke asisten.**

1. Ketik nilainya di kolom, misalnya `WORDPRESS_DB_PASSWORD (runtime)`.
2. Tekan ikon mata (**Tampilkan nilai**) untuk memeriksa apa yang Anda ketik.
3. **Setujui** tetap abu-abu sampai semua kolom terisi.

Nilainya dikirim bersama persetujuan Anda langsung ke dPanel. Asisten tidak pernah melihatnya; ia hanya tahu nama variabelnya.

## Rahasia yang dibuat dPanel

Kalau sebuah perubahan membutuhkan kata sandi baru, seperti kata sandi pengguna basis data baru atau kata sandi admin basis data baru, dPanel yang membuatnya. Setelah Anda menekan **Setujui**, kartu menampilkan **Rahasia yang dibuat: simpan sekarang**, berisi setiap nilai beserta tombol **Salin**.

:::warning[Kata sandi yang dibuat hanya tampil sekali]
dPanel tidak menyimpan salinannya. Menutup atau memuat ulang panel akan menyembunyikan nilainya selamanya. Salin setiap nilai ke pengelola kata sandi Anda sebelum melakukan hal lain. Anda bisa mengubah kata sandi basis data nanti di DB Manager.
:::

![Kartu persetujuan untuk basis data MariaDB baru, yang menyatakan bahwa dPanel membuat kata sandinya dan menampilkannya sekali bersama hasil persetujuan](../../assets/ai/approval-card-database.webp 'Kartu memberi tahu sejak awal kalau sebuah kata sandi akan dibuat.')

## Kalau Anda menutup chat

- **Percakapan tetap ada.** dPanel mengingat percakapan terakhir Anda untuk setiap ruang kerja di browser ini. Buka panel lagi dan percakapan itu masih ada.
- **Kartu yang menunggu muncul kembali.** Kartu yang masih menunggu saat Anda menutup panel atau memuat ulang halaman akan menampilkan **Setujui** dan **Tolak** lagi saat Anda membukanya kembali.
- **Kartu tetap bisa disetujui selama 24 jam**, bahkan saat panel tertutup. Setelah itu kartu menampilkan **Kedaluwarsa; minta asisten mengusulkannya lagi**.
- **Kartunya hilang?** Kalau Anda memulai percakapan baru atau berganti browser, tanyakan "Tampilkan lagi persetujuan untuk basis data tadi". Asisten mengusulkan perubahan yang sama, dan Anda mendapatkan kartu yang sama selama kartu itu masih menunggu.
- **Rahasia yang dibuat tidak muncul lagi.** Karena itu, segera salin.

## Menyetujui dari terminal

Setiap kartu punya ID tindakan. Di terminal, jalankan `dnocs ai approve <action-id>` untuk menyetujuinya atau `dnocs ai approve --reject <action-id>` untuk menolaknya. Lihat [Memakai AI di terminal](./ai-in-the-terminal.md).

## Pertanyaan yang sering diajukan

### Bagaimana kalau saya tidak sengaja menyetujui sesuatu?

Minta asisten membatalkannya, misalnya "Hapus basis data docs_demo yang baru saya buat di server 140". Pembatalan itu adalah perubahan baru, jadi ia juga muncul sebagai kartu. Penghapusan tidak bisa dibatalkan, jadi baca kartu penghapusan dengan lebih teliti.

### Bisakah saya menyetujui perubahan dengan mengetik "ya" di chat?

Tidak. Hanya tombol **Setujui** atau `dnocs ai approve` yang menyetujui perubahan. Mengetik "ya" hanya mengirim pesan.

### Kenapa tombol Setujui berwarna abu-abu?

Kartunya punya kolom rahasia yang masih kosong. Isi semua kolomnya.

### Bisakah rekan tim menyetujui perubahan yang saya minta?

Tidak. Hanya orang yang memulai percakapan yang bisa menyetujui kartunya. Rekan tim bisa meminta perubahan yang sama ke asisten di percakapan mereka sendiri.

### Saya tidak sengaja menulis kata sandi di chat. Sekarang bagaimana?

Anggap kata sandi itu sudah bocor: pesannya sudah terkirim ke layanan AI. Ganti kata sandi itu, dan lain kali mintalah "sebagai rahasia yang saya ketik saat menyetujui".
