---
title: Apa itu server di dPanel
description: Satu mesin Linux yang dirawat dPanel untuk Anda, dan dua cara menambahkannya.
sidebar_position: 1
---

Server adalah satu mesin Linux yang dirawat dPanel untuk Anda. Bisa mesin yang diluncurkan dPanel di akun cloud Anda, bisa juga mesin yang sudah Anda jalankan lalu Anda hubungkan sendiri.

Setelah server masuk ke dPanel, semua urusannya bisa dikerjakan dari browser. Anda tidak perlu membuka terminal di komputer sendiri.

- Melihat apakah server sehat, dan berapa banyak CPU, memori, dan disk yang terpakai.
- Memasang perangkat lunak, misalnya basis data atau runtime bahasa pemrograman.
- Menyalakan, menghentikan, dan memulai ulang layanan yang berjalan.
- Mengelola akun pengguna Linux.
- Menjelajah berkas dan membaca log.
- Membuka terminal.
- Men-deploy [aplikasi](../applications/overview.md) ke server itu.

![Halaman Server berisi daftar server beserta status, penyedia, dan pemakaian langsungnya](../../assets/servers/servers-list.webp 'Server: setiap kartu menampilkan status, alamat, apa yang berjalan di sana, serta pemakaian CPU, memori, dan disk.')

## Dua cara menambah server

Buka **Server**, lalu **Buat Server**. Halaman itu menawarkan dua jalur.

![Halaman Buat Server dengan pilihan meluncurkan server cloud atau menghubungkan server sendiri](../../assets/servers/create-choose-path.webp)

|                        | Luncurkan server cloud                                   | Hubungkan server Anda                     |
| ---------------------- | -------------------------------------------------------- | ----------------------------------------- |
| Cocok untuk            | Anda butuh mesin baru dan punya akun cloud               | Anda sudah punya mesin yang berjalan      |
| Penyedia               | AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio | Server Ubuntu atau Debian apa pun via SSH |
| Yang dikerjakan dPanel | Membuat mesin, lalu menyiapkannya                        | Masuk lewat SSH, lalu menyiapkannya       |
| Yang Anda butuhkan     | Akun cloud dan SSH key di dPanel                         | SSH key dan alamat server                 |
| Waktu                  | Sekitar 10 sampai 20 menit                               | Sekitar 5 menit                           |

Apa pun jalurnya, dPanel membuat user `dpanel`, memasang agennya, dan mulai memantau mesin itu.

## Langkah berikutnya

- Baru memakai dPanel? Mulai dari [Sebelum mulai](./before-you-start.md).
- Meluncurkan mesin baru: [Membuat server cloud](./create-a-cloud-server.md).
- Membawa mesin sendiri: [Menghubungkan server Anda](./connect-your-own-server.md).
