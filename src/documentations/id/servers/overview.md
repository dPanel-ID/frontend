---
title: 'Apa itu server di sini'
description: 'Satu mesin Linux yang dikelola dPanel untuk Anda, dan dua cara menambahkannya.'
sidebar_position: 1
---

Server adalah satu mesin Linux yang dikelola dPanel untuk Anda. Mesin itu bisa dibuat dPanel di akun cloud Anda, atau mesin yang sudah Anda sewa lalu Anda hubungkan sendiri.

Begitu server masuk ke dPanel, semua hal di bawah ini dilakukan dari browser, tanpa terminal di komputer Anda.

- Melihat kondisinya, serta pemakaian prosesor, memori dan disk.
- Memasang perangkat lunak, misalnya basis data atau runtime bahasa pemrograman.
- Menjalankan dan menghentikan layanan di dalamnya.
- Mengelola akun pengguna Linux.
- Menelusuri berkas dan membaca log.
- Membuka terminal.

## Dua cara menambah server

|                       | Buat server cloud                          | Hubungkan server sendiri                      |
| --------------------- | ------------------------------------------ | --------------------------------------------- |
| Cocok untuk           | Anda butuh mesin baru dan punya akun cloud | Mesin Anda sudah berjalan                     |
| Yang dilakukan dPanel | Membuat mesin, lalu menyiapkannya          | Terhubung lewat SSH, lalu menyiapkannya       |
| Yang diperlukan       | Cloud project dan SSH key di dPanel        | Server Ubuntu atau Debian yang bisa dijangkau |
| Waktu                 | Sekitar 10 sampai 20 menit                 | Sekitar 5 menit                               |

![Halaman buat server, menawarkan server cloud atau server sendiri](../../assets/servers/create-choose-path.png 'Servers, lalu Create Server, menawarkan kedua jalur.')

Panduan ini mengikuti jalur pertama, dari daftar kosong sampai server basis data yang berjalan, lalu kembali kosong lagi.
