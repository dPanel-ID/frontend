---
title: Cara kerja aplikasi
description: Cara dPanel men-deploy aplikasi dari GitHub: membangun repositori di server Anda, menjalankannya sebagai layanan systemd, dan menyimpan build untuk rollback.
sidebar_position: 1
sidebar_icon: app-window
---

Aplikasi di dPanel adalah kode Anda dari repositori GitHub, yang dibangun dan berjalan sebagai layanan systemd di salah satu server milik Anda sendiri. dPanel tidak menyimpan kodenya: dPanel membaca repositori dan branch yang Anda tunjuk, menjalankan perintah build Anda di server, menjalankan hasilnya sebagai layanan, dan menyimpan setiap build agar Anda bisa melakukan rollback.

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

![Halaman Aplikasi dalam tampilan tabel, menampilkan sebuah aplikasi beserta status, repositori sumber, server, dan alamatnya](../../assets/applications/apps-list.webp 'Halaman Aplikasi dengan satu aplikasi yang berjalan.')

| Status          | Artinya                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| Berjalan        | Layanan aktif di servernya.                                                  |
| Sedang dibangun | Build atau rilis sedang berlangsung.                                         |
| Perlu perhatian | Build atau rilis terakhir gagal. Buka aplikasinya untuk melihat penyebabnya. |
| Tidak berjalan  | Belum ada yang dirilis, atau layanannya sedang berhenti.                     |

Daftarnya terbuka sebagai tabel, berisi status, repositori sumber, server, dan alamat publik setiap aplikasi. Gunakan **Cari berdasarkan nama aplikasi** untuk menemukan aplikasi dengan cepat. Pilih salah satu baris untuk membukanya.

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

- [Membuat aplikasi](./create-an-application.md) dari repositori GitHub.
- [Rilis dan rollback](./deployments-and-rollback.md): rilis commit baru, atau kembali ke build sebelumnya.
- [Variabel environment](./environment-variables.md) untuk pengaturan dan rahasia.
- Publikasikan di domain dengan HTTPS lewat [load balancer](../networking/load-balancers.md).
