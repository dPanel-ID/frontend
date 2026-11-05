---
title: Penyedia cloud
description: Enam penyedia cloud tempat dPanel meluncurkan server: AWS EC2, Google Compute Engine, DigitalOcean, IDCloudHost, Alibaba Cloud ECS, dan Tencent Cloud CVM.
sidebar_position: 0
---

dPanel meluncurkan server Ubuntu di akun Anda sendiri pada enam penyedia cloud: **AWS** (EC2), **Google Cloud** (Compute Engine), **IDCloudHost**, **DigitalOcean** (Droplet), **Alibaba Cloud** (ECS), dan **Tencent Cloud** (CVM). Tiap penyedia punya halaman sendiri: cara membuat kredensial dengan hak akses minimum, cara menghubungkannya, kolom di formulir peluncuran, dan jebakan khas penyedia itu.

Penyedia mana pun yang dipilih, server yang jadi sama saja: agen yang sama, tab yang sama, modul yang sama.

## Sekilas

|                  | [AWS](./provider-aws.md)                                | [Google Cloud](./provider-gcp.md)             | [IDCloudHost](./provider-idcloudhost.md) | [DigitalOcean](./provider-digitalocean.md) | [Alibaba Cloud](./provider-alibabacloud.md)   | [Tencent Cloud](./provider-tencent.md)        |
| ---------------- | ------------------------------------------------------- | --------------------------------------------- | ---------------------------------------- | ------------------------------------------ | --------------------------------------------- | --------------------------------------------- |
| Kredensial       | Access key + secret key                                 | Kunci JSON service account                    | API key                                  | API token                                  | AccessKey ID + secret                         | SecretId + SecretKey                          |
| Lokasi           | Region                                                  | Region, lalu zone                             | Region, misalnya `jkt01`                 | Region                                     | Region, lalu zone                             | Region, lalu zone                             |
| Ukuran           | Slider CPU dan RAM, tipe `t3a`/`t3` termurah lebih dulu | Slider CPU dan RAM, machine type E2           | Slider CPU dan RAM, ukuran persis        | Slider CPU dan RAM, Droplet termurah       | Slider CPU dan RAM, tipe ECS termurah         | Slider CPU dan RAM, tipe CVM termurah         |
| Jaringan         | `dpanel-network`, dibuat saat pertama dipakai           | `dpanel-network`, dibuat saat pertama dipakai | Dipilihkan per region                    | Bawaan penyedia, atau VPC pilihan Anda     | `dpanel-network`, dibuat saat pertama dipakai | `dpanel-network`, dibuat saat pertama dipakai |
| Firewall         | Security group per server, TCP 22, 80, 443              | Aturan firewall per server, TCP 22, 80, 443   | Tidak dibuat oleh dPanel                 | Tidak dibuat oleh dPanel                   | Security group per server, TCP 22, 80, 443    | Security group per server, TCP 22, 80, 443    |
| User login       | `ubuntu`                                                | `ubuntu`                                      | **Default User**, bawaannya `dpanel`     | **Default User**, bawaannya `dpanel`       | `root`                                        | `ubuntu`                                      |
| Disk             | 20 sampai 500 GB                                        | 20 sampai 500 GB                              | 20 sampai 500 GB                         | Sudah termasuk dalam ukuran Droplet        | 40 sampai 500 GB                              | Bawaan penyedia                               |
| Langkah tambahan | Tidak ada                                               | Tidak ada                                     | **Access**: user dan bootstrap password  | **Access**: user                           | Tidak ada                                     | Tidak ada                                     |

Formulir peluncuran juga menampilkan **Biznet Gio**. Langkahnya sama, dengan pilihan **Product** dan **Billing Cycle** sendiri sebagai pengganti slider ukuran, dan tidak dibahas rinci di sini.

Penyedia mana pun yang Anda pakai, server yang jadi menjalankan Ubuntu 24.04 LTS atau 26.04 LTS.

## Sebelum memilih penyedia

- SSH key di dPanel. Lihat [Sebelum mulai](../before-you-start.md).
- Kredensial yang hanya bisa melakukan apa yang dibutuhkan dPanel. Batas minimumnya ada di halaman tiap penyedia.
- Baca [Kredensial cloud dan keamanan](./cloud-credentials-security.md) sekali. Di sana dijelaskan apa yang disimpan dPanel dan apa yang terjadi kalau kunci dicabut, serta cara menggantinya.

Peluncurannya sendiri sama untuk semua penyedia: [Membuat server cloud](./create-a-cloud-server.md).

## Pertanyaan yang sering diajukan

### Penyedia mana yang sebaiknya saya pilih?

Yang akunnya sudah Anda punya. Setelah server menyala, dPanel bekerja sama saja di semua penyedia. Kalau belum punya akun di mana pun, penyedia mana saja cocok untuk server pertama.

### Penyedia saya tidak ada di daftar. Bisakah saya tetap memakai dPanel?

Bisa. Buat mesinnya sendiri di penyedia Anda, lalu [hubungkan server Anda](../connect-your-own-server.md) lewat SSH.

### Apakah saya membayar mesinnya ke dPanel?

Tidak. Penyedia menagih mesinnya langsung kepada Anda; dPanel tidak menjual ulang mesin.
