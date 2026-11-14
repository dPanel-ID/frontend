---
title: Ringkasan worker
description: Worker menjalankan job dPanel Anda, seperti deployment dan instalasi modul. Pakai worker bersama dPanel, atau workflow GitHub Actions atau VM milik Anda.
sidebar_position: 1
sidebar_icon: settings-2
---

**Worker** di dPanel adalah program yang menjalankan job workspace Anda: menyiapkan server, memasang modul, men-deploy aplikasi, menerapkan load balancer. Untuk server yang terhubung lewat SSH (cara aman untuk masuk ke server dari jauh), worker terhubung ke server itu lalu melapor kembali ke dPanel. Lihat [Glosarium](../getting-started/glossary.md).

Server yang terhubung dengan [agen dPanel](../servers/register-a-private-machine.md) bekerja berbeda: pemasangan modul dan deploy-nya berjalan di server itu sendiri, disiapkan oleh agennya, apa pun worker yang dipakai workspace. Job pertama setelah server seperti itu bergabung menunggu sekitar dua menit selama agen menyiapkannya; tab **Modul** server itu lalu menampilkan **Menunggu server memulai pemasangan ini**. Worker tetap membuat dan menghapus VM cloud di penyedia Anda.

Anda tidak perlu menyiapkan apa pun. **Worker bersama dPanel** menjalankan setiap job kecuali Anda memilih worker sendiri.

![Kartu Workers di halaman Profile, dengan Shared workers (dPanel) terpilih, Private workers mati dan tombol Add worker](../../assets/workers/workers-card.webp 'Workers di Profile: worker bersama menjalankan job Anda sampai Anda menambahkan worker sendiri.')

## Bersama atau pribadi

|                            | Worker bersama (dPanel)           | Worker pribadi (milik Anda)                                                      |
| -------------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| Persiapan                  | Tidak ada                         | Tambahkan workflow GitHub atau VM                                                |
| Siapa yang menjalankan job | dPanel                            | Hanya worker yang Anda tambahkan                                                 |
| Cocok untuk                | Memulai, sebagian besar workspace | Server yang hanya bisa dijangkau dari jaringan Anda, menit CI sendiri, kepatuhan |

Setiap workspace memilih sendiri, di kartu **Workers** bagian **Where jobs run**: workspace pribadi di **Profile**, tim di halaman timnya. Hanya owner dan admin tim yang dapat mengubah worker tim; anggota lain hanya bisa melihat kartunya. Pilihan bertanda **Current** adalah yang sedang dipakai.

## Dua jenis worker pribadi

|                       | Workflow GitHub                                                                               | VM                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Cara berjalan         | dPanel memulai workflow Anda saat ada job menunggu. Satu run mengambil satu job lalu selesai. | Berjalan terus dan meminta job ke dPanel.                  |
| Rahasia yang disimpan | Tidak ada. Run masuk dengan token identitas GitHub.                                           | Sebuah token, ditampilkan sekali saat Anda menambahkannya. |
| Persiapan             | Satu file workflow pendek                                                                     | Pasang dan jalankan executor di mesin                      |
| Panduan               | [Worker GitHub Actions](./github-actions.md)                                                  | [Worker VM](./vm.md)                                       |

:::tip[Cara termudah]
Worker workflow GitHub selesai dalam sekitar lima menit, tanpa server dan tanpa rahasia. Mulai dari [Worker GitHub Actions](./github-actions.md).
:::

## Di mana job menunggu

Saat workspace memakai worker pribadi, job-nya **hanya** dikirim ke worker tersebut. Jika tidak ada yang berjalan, job menunggu sampai ada. Kembali ke **Shared workers (dPanel)** mengirim job baru ke dPanel lagi; worker Anda tetap terdaftar sehingga bisa dipakai lagi nanti.

## Dari terminal

Alat baris perintah dnocs mengelola worker untuk workspace yang Anda pilih. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasangnya.

| Perintah                                                                    | Fungsinya                                                           |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `dnocs worker list`                                                         | Menampilkan mode (shared atau private) dan worker pribadi Anda.     |
| `dnocs worker add --type github --name ci --repository acme/dpanel-workers` | Mendaftarkan worker GitHub workflow dan mencetak file workflow-nya. |
| `dnocs worker add --type vm --name office --executor-id office-01`          | Mendaftarkan worker VM dan mencetak token-nya satu kali.            |
| `dnocs worker mode private` atau `dnocs worker mode shared`                 | Mengirim job hanya ke worker Anda, atau kembali ke worker dPanel.   |
| `dnocs worker rotate-token --id <ID worker>`                                | Memberi worker VM token baru; token lama langsung berhenti berlaku. |
| `dnocs worker remove --id <ID worker>`                                      | Menghapus worker pribadi.                                           |

Anda juga bisa meminta **Ask dPanel** mengerjakannya untuk Anda; lihat [Kumpulan prompt](../ai/prompt-cookbook.md).

## Pertanyaan yang sering diajukan

### Apakah saya perlu worker sendiri?

Tidak. Worker bersama dPanel menjalankan semua job secara bawaan. Tambahkan worker sendiri hanya jika server Anda hanya bisa dijangkau dari jaringan Anda, Anda ingin job berjalan di menit CI Anda sendiri, atau karena aturan kepatuhan.

### Apa yang terjadi pada job yang menunggu jika worker pribadi saya mati?

Job itu menunggu. Job workspace yang memakai **Private workers** hanya dikirim ke worker miliknya. Nyalakan lagi worker-nya, atau kembali ke **Shared workers (dPanel)**.

### Apakah worker saya hilang jika kembali ke shared?

Tidak. Worker tetap terdaftar. Beralih lagi ke **Private workers** kapan saja.

### Bisakah tim dan workspace pribadi saya memakai worker berbeda?

Bisa. Setiap workspace punya pengaturannya sendiri.
