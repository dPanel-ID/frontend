---
title: Tanya dPanel (asisten AI)
description: Tanya dPanel adalah asisten AI bawaan dPanel. Tanyakan server, aplikasi, domain, dan job yang gagal; perubahan hanya dijalankan setelah Anda setujui.
sidebar_position: 6
sidebar_icon: circle-help
sidebar_label: Tanya dPanel
---

**Tanya dPanel** adalah asisten AI yang terpasang di dPanel. Asisten ini menjawab pertanyaan tentang server, aplikasi, domain, load balancer, kunci SSH, akun cloud, dan job terbaru di ruang kerja Anda saat ini, dan bisa menyiapkan perubahan untuk Anda setujui.

![Panel Asisten dPanel yang terbuka di samping dasbor, dengan contoh pertanyaan](../../assets/getting-started/assistant.webp 'Asisten bekerja di ruang kerja Anda saat ini, dengan akses Anda sendiri.')

## Membuka asisten

1. Tekan **Tanya dPanel** di kanan bawah halaman mana pun. Di ponsel, tombolnya hanya menampilkan ikon chat.
2. Panel **Asisten dPanel** terbuka di samping halaman.
3. Ketik di **Tanyakan tentang server, aplikasi, domain…**, atau tekan salah satu contoh pertanyaan.
4. Tekan Enter untuk mengirim. Shift+Enter membuat baris baru.

Selama bekerja, panel menampilkan **Memeriksa dPanel…**. Pertanyaan yang lebih panjang bisa memakan waktu satu sampai dua menit. Di bawah setiap jawaban, **Diperiksa:** mencantumkan apa saja yang dilihat asisten, sehingga Anda tahu dari mana jawabannya berasal.

## Apa yang bisa ditanyakan

Asisten membaca dPanel lewat API yang sama dengan yang Anda pakai, dengan peran Anda sendiri. Pertanyaan yang baik itu spesifik:

- "Server saya yang mana saja yang berhenti?"
- "Apakah ada job yang gagal dalam 24 jam terakhir?"
- "Tampilkan domain saya beserta penyedia DNS-nya."
- "Aplikasi apa yang berjalan di dpanel-web-01, dan di port berapa?"
- "Kenapa build terakhir My App gagal?"

Asisten hanya melihat ruang kerja tempat Anda berada. Pindah ruang kerja dulu untuk bertanya tentang ruang kerja lain. Lihat [Ruang kerja](./workspaces.md).

## Menyetujui atau menolak perubahan

Ketika Anda meminta perubahan, misalnya membuat aplikasi, merilis build, membuat load balancer, memasang modul, atau menghapus sesuatu, asisten tidak langsung menjalankannya. Perubahan itu ditampilkan di chat dengan tanda **Menunggu persetujuan Anda**.

1. Baca apa yang akan dilakukannya.
2. Tekan **Setujui** untuk menjalankannya, atau **Tolak** untuk membatalkannya.

| Status                             | Artinya                                                  |
| ---------------------------------- | -------------------------------------------------------- |
| Menunggu persetujuan Anda          | Belum ada yang berubah                                   |
| Disetujui dan dijalankan           | dPanel memulai perubahannya; pantau di aplikasi          |
| Ditolak; tidak ada yang diubah     | Usulannya dibatalkan                                     |
| Disetujui, tetapi gagal dijalankan | dPanel menolak perubahan itu; chat menjelaskan alasannya |

Peran Anda tetap berlaku: asisten tidak bisa melakukan apa pun yang tidak diizinkan untuk akun Anda. Lihat [Anggota dan peran](../teams/members-and-roles.md).

## Memulai dari awal

Tekan **Percakapan baru** di bagian atas panel. dPanel mengingat percakapan terakhir Anda per ruang kerja di browser ini, jadi menutup panel tidak menghilangkannya.

## Pertanyaan yang sering diajukan

### Apakah asisten bisa mengubah server saya tanpa bertanya?

Tidak. Setiap perubahan yang diusulkannya menunggu Anda menekan **Setujui** di chat. Pertanyaan dijawab hanya dengan membaca dPanel.

### Apakah asisten bisa melihat ruang kerja lain atau data orang lain?

Tidak. Asisten bekerja di ruang kerja Anda saat ini, dengan akses Anda sendiri, sama persis seperti halaman yang Anda buka sendiri.

### Kenapa panel menyebut asisten belum tersedia?

dPanel tidak bisa menjangkau layanan asisten. Tekan **Periksa lagi** setelah beberapa saat. Kalau Anda belum masuk, panel meminta Anda **Masuk** terlebih dahulu.
