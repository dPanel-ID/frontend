---
title: Penyedia cloud
description: Empat penyedia tempat dPanel meluncurkan server, dan apa yang berbeda di antara mereka.
sidebar_position: 4
---

dPanel meluncurkan server di **AWS**, **Google Cloud**, **IDCloudHost**, dan **DigitalOcean**. Tiap penyedia punya halaman sendiri: cara membuat kredensial, cara menghubungkannya, kolom di formulir peluncuran, dan jebakan khas penyedia itu.

Penyedia mana pun yang dipilih, server yang jadi sama saja: agen yang sama, tab yang sama, modul yang sama.

## Sekilas

|                  | [AWS](./provider-aws.md)                      | [Google Cloud](./provider-gcp.md)             | [IDCloudHost](./provider-idcloudhost.md) | [DigitalOcean](./provider-digitalocean.md) |
| ---------------- | --------------------------------------------- | --------------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Kredensial       | Access key + secret key                       | Kunci JSON service account                    | API key                                  | API token                                  |
| Lokasi           | Region                                        | Region, lalu zone                             | Region, misalnya `jkt01`                 | Region                                     |
| Ukuran           | **Instance Type**                             | **Machine Type**                              | **CPU Cores** dan **RAM**                | **Droplet Size**                           |
| Jaringan         | `dpanel-network`, dibuat saat pertama dipakai | `dpanel-network`, dibuat saat pertama dipakai | Dipilihkan per region                    | Bawaan penyedia, atau VPC pilihan Anda     |
| Firewall         | Security group per server, TCP 22, 80, 443    | Aturan firewall per server, TCP 22, 80, 443   | Tidak dibuat oleh dPanel                 | Tidak dibuat oleh dPanel                   |
| User login       | `ubuntu`                                      | `ubuntu`                                      | **Default User**, bawaannya `dpanel`     | **Default User**, bawaannya `dpanel`       |
| Langkah tambahan | Tidak ada                                     | Tidak ada                                     | **Access**: user dan bootstrap password  | **Access**: user                           |

Formulir peluncuran juga menampilkan **Biznet Gio**. Langkahnya sama dan tidak dibahas rinci di sini.

## Sebelum memilih penyedia

- SSH key di dPanel. Lihat [Sebelum mulai](./before-you-start.md).
- Kredensial yang hanya bisa melakukan apa yang dibutuhkan dPanel. Batas minimumnya ada di halaman tiap penyedia.
- Baca [Kredensial cloud dan keamanan](./cloud-credentials-security.md) sekali. Di sana dijelaskan apa yang disimpan dPanel dan apa yang terjadi kalau kunci dicabut.

Peluncurannya sendiri sama untuk semua penyedia: [Membuat server cloud](./create-a-cloud-server.md).
