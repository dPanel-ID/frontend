---
title: Dasbor
description: Apa isi setiap tab dasbor, dan ke mana melihat dulu ketika ada yang tidak beres.
sidebar_position: 3
---

Dasbor adalah halaman pertama setelah masuk. Isinya menjawab satu pertanyaan: apakah semua di ruang kerja ini baik-baik saja? Buka kapan saja dari **Dasbor** di sidebar.

![Tab Ringkasan di dasbor dengan status kesehatan, jumlah resource, dan aktivitas platform](../../assets/getting-started/dashboard-overview.webp 'Ringkasan: status di paling atas, lalu jumlah resource, aktivitas, dan penggunaan.')

## Tab-tab di dasbor

| Tab             | Isinya                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Ringkasan**   | Status singkat, jumlah setiap resource, aktivitas platform, penggunaan sumber daya, dan yang perlu dicek     |
| **Aktivitas**   | Grafik aktivitas platform dan daftar lengkap **Aktivitas terbaru**                                           |
| **Sumber daya** | Penggunaan sumber daya, kesehatan dan kapasitas server, serta daftar singkat server, aplikasi, load balancer |
| **Ruang kerja** | Khusus ruang kerja tim: anggota, proyek cloud, dan konfigurasi ruang kerja                                   |

## Ringkasan

Baca dari atas ke bawah.

1. **Status.** Semua berjalan normal, atau ada sejumlah hal yang perlu perhatian Anda.
2. **Jumlah resource.** Server, aplikasi, dan load balancer, masing-masing dengan berapa yang siap dan berapa yang perlu dicek. Lalu proyek cloud, domain, basis data, dan kunci SSH. Tekan salah satu kotak untuk membuka daftarnya.
3. **Aktivitas platform.** Semua operasi yang dijalankan dPanel di ruang kerja ini, dipisah menjadi berhasil, gagal, dan sedang berjalan atau dibatalkan. Pilih rentang 24 jam, 7 hari, atau 30 hari. Di sebelahnya tampil jumlah operasi, tingkat keberhasilan, dan berapa yang gagal.
4. **Penggunaan sumber daya.** CPU, memori, dan disk di seluruh server. Setiap grafik menampilkan rata-rata semua server dan server tersibuk. Pilih 1 jam, 24 jam, atau 3 hari.
5. **Perlu perhatian Anda.** Server yang tidak berjalan, server yang agennya berhenti melapor, dan operasi yang gagal. **Buka server** membawa Anda ke server yang bermasalah.

:::tip
Data penggunaan muncul beberapa menit setelah server siap. Server melapor setiap 30 detik.
:::

## Aktivitas

**Aktivitas terbaru** mencatat apa saja yang dilakukan dPanel pada infrastruktur Anda dalam dua hari terakhir: penyiapan server, pemasangan modul, deployment. Setiap entri menyebut apa yang dijalankan, targetnya, siapa yang memulai, dan berapa lama. Buka **Detail teknis** untuk melihat rincian mentah operasi yang gagal. Tekan tombol muat ulang untuk mengambil entri terbaru.

## Sumber daya

Tab ini untuk merencanakan kapasitas.

- **Kesehatan Server**: kesiapan dan status rollout, per penyedia.
- **Kapasitas**: server yang hampir penuh disebut namanya.
- Daftar singkat server, aplikasi, dan load balancer terbaru, masing-masing dengan tautan untuk melihat semuanya.

## Ruang kerja

Hanya muncul di ruang kerja tim.

- **Anggota Ruang Kerja**: siapa saja yang punya akses. **Kelola** membuka halaman tim.
- **Proyek Cloud**: akun penyedia tempat tim ini bisa membuat server.
- **Konfigurasi ruang kerja**: **Repositori IaC** tempat dPanel menuliskan infrastruktur ruang kerja ini.

## Kalau dasbor tidak bisa memeriksa

Pesan bahwa Anda tidak bisa melihat kesehatan ruang kerja ini berarti peran Anda tidak mengizinkan membaca status eksekusi dan agen. Minta owner ruang kerja memberi peran yang sesuai. Lihat [Anggota dan peran](../teams/members-and-roles.md).
