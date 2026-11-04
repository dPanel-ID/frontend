---
title: Ringkasan worker
description: Worker menjalankan job dPanel Anda, seperti deployment, setup server dan instalasi modul. Gunakan worker bersama dPanel, atau jalankan job di workflow GitHub Actions maupun VM milik Anda sendiri.
sidebar_position: 1
sidebar_icon: settings-2
---

**Worker** adalah program yang menjalankan job workspace Anda: menyiapkan server, memasang modul, men-deploy aplikasi, menerapkan load balancer. Worker terhubung ke server Anda lewat SSH lalu melapor kembali ke dPanel.

Anda tidak perlu menyiapkan apa pun. **Worker bersama dPanel** menjalankan setiap job kecuali Anda memilih worker sendiri.

![Kartu Workers di halaman Profile, dengan Shared workers (dPanel) terpilih, Private workers mati dan tombol Add worker](../../assets/workers/workers-card.webp 'Workers di Profile: worker bersama menjalankan job Anda sampai Anda menambahkan worker sendiri.')

## Bersama atau pribadi

| | Worker bersama (dPanel) | Worker pribadi (milik Anda) |
| --- | --- | --- |
| Persiapan | Tidak ada | Tambahkan workflow GitHub atau VM |
| Siapa yang menjalankan job | dPanel | Hanya worker yang Anda tambahkan |
| Cocok untuk | Memulai, sebagian besar workspace | Server yang hanya bisa dijangkau dari jaringan Anda, menit CI sendiri, kepatuhan |

Setiap workspace memilih sendiri: workspace pribadi di **Profile**, tim di halaman timnya. Hanya owner dan admin tim yang dapat mengubah worker tim.

## Dua jenis worker pribadi

| | Workflow GitHub | VM |
| --- | --- | --- |
| Cara berjalan | dPanel memulai workflow Anda saat ada job menunggu. Satu run mengambil satu job lalu selesai. | Berjalan terus dan meminta job ke dPanel. |
| Rahasia yang disimpan | Tidak ada. Run masuk dengan token identitas GitHub. | Sebuah token, ditampilkan sekali saat Anda menambahkannya. |
| Persiapan | Satu file workflow pendek | Pasang dan jalankan executor di mesin |
| Panduan | [Worker GitHub Actions](./github-actions.md) | [Worker VM](./vm.md) |

:::tip[Cara termudah]
Worker workflow GitHub selesai dalam sekitar lima menit, tanpa server dan tanpa rahasia. Mulai dari [Worker GitHub Actions](./github-actions.md).
:::

## Di mana job menunggu

Saat workspace memakai worker pribadi, job-nya **hanya** dikirim ke worker tersebut. Jika tidak ada yang berjalan, job menunggu sampai ada. Kembali ke **Shared workers (dPanel)** mengirim job baru ke dPanel lagi; worker Anda tetap terdaftar sehingga bisa dipakai lagi nanti.
