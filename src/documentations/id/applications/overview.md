---
title: Cara kerja aplikasi
description: dPanel membangun kode Anda dari GitHub dan menjalankannya di server yang sudah Anda miliki.
sidebar_position: 1
sidebar_icon: app-window
---

Aplikasi adalah kode Anda yang berjalan sebagai layanan di salah satu server Anda. dPanel tidak menyimpan kodenya sendiri. dPanel membaca repositori GitHub yang Anda tunjuk, membangunnya di server, lalu menjaga layanannya tetap berjalan di sana.

## Tiga langkahnya

1. **Tunjuk repositori.** Hubungkan GitHub, lalu pilih repositori dan branch yang akan dibangun.
2. **dPanel membangunnya.** Setiap build disimpan, jadi Anda bisa melihat apa yang dirilis dan kembali ke build sebelumnya.
3. **Aplikasi berjalan di server Anda.** dPanel memasang hasil build dan menjalankannya sebagai layanan systemd.

:::info[Build tetap di server]
Build tidak dibagikan antar mesin. Setiap server membangun dan memasang aplikasinya sendiri.
:::

## Yang perlu disiapkan

- Server berstatus **Ready**. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md).
- Akun GitHub yang sudah terhubung ke dPanel. Lihat [Menghubungkan GitHub](../getting-started/connect-github.md).
- Repositori dengan perintah build dan perintah jalan. Satu skrip untuk masing-masing sudah cukup.

## Halaman Aplikasi

Buka **Aplikasi** di sidebar. Halaman ini menampilkan semua aplikasi di workspace aktif, dengan jumlahnya di bagian atas.

![Halaman Aplikasi yang menampilkan aplikasi demo Go Example Docs beserta status dan servernya](../../assets/applications/apps-list.webp 'Halaman Aplikasi dengan satu aplikasi yang berjalan.')

| Status          | Artinya                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| Berjalan        | Layanan aktif di servernya.                                                  |
| Sedang dibangun | Build atau rilis sedang berlangsung.                                         |
| Perlu perhatian | Build atau rilis terakhir gagal. Buka aplikasinya untuk melihat penyebabnya. |
| Tidak berjalan  | Belum ada yang dirilis, atau layanannya sedang berhenti.                     |

Gunakan **Cari berdasarkan nama aplikasi** untuk menemukan aplikasi dengan cepat. Pilih salah satu baris untuk membukanya.

Tombol GitHub di bagian atas menunjukkan akun yang dipakai dPanel untuk membaca repositori, misalnya **Terhubung ke GitHub sebagai** login Anda. Jika tertulis **Hubungkan ulang GitHub**, GitHub tidak lagi menerima sesi yang tersimpan. Masuk kembali sebelum membangun aplikasi.

## Halaman detail aplikasi

Setiap aplikasi punya empat tab.

| Tab        | Gunanya                                                                              |
| ---------- | ------------------------------------------------------------------------------------ |
| Ringkasan  | Melihat apa yang sedang melayani, membuka situsnya, membaca log, atau merilis ulang. |
| Rilis      | Menelusuri build dan rilis, membangun lagi, atau kembali ke build lama.              |
| Log        | Membaca log layanan yang berjalan, juga log load balancer jika ada.                  |
| Pengaturan | Meninjau dan mengubah cara aplikasi dibangun dan dijalankan, atau menghapusnya.      |

## Langkah berikutnya

- [Membuat aplikasi](./create-an-application.md)
- [Rilis dan rollback](./deployments-and-rollback.md)
