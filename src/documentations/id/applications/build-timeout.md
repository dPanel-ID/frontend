---
title: Batas waktu build
description: dPanel menghentikan build setelah 20 menit secara bawaan. Atur build.timeout antara 1 menit dan 3 jam untuk memberi build aplikasi yang lambat waktu lebih.
sidebar_position: 7
sidebar_icon: timer
---

dPanel menghentikan build setelah **20 menit** secara bawaan, dan Anda bisa menaikkan batas itu per aplikasi hingga 3 jam dengan `build.timeout`. Setiap build dan rilis berjalan sebagai satu pekerjaan: clone, menyiapkan runtime, langkah build, lalu menjalankan layanan.

**Build** adalah pekerjaan yang mengubah repositori Anda menjadi sesuatu yang bisa dijalankan, misalnya dengan mengompilasinya. Lihat [Glosarium](../getting-started/glossary.md).

Sebagian besar aplikasi selesai jauh sebelum itu. Build yang banyak mengompilasi, misalnya image Docker dengan banyak ekstensi PHP di server kecil, bisa tidak sempat. Saat batasnya tercapai, build gagal dan log-nya berakhir dengan `context deadline exceeded`.

## Memberi build waktu lebih

Di aplikasi web:

1. Buka aplikasinya dan masuk ke **Pengaturan**.
2. Tekan **Ubah** di bagian **Deployment**. Panel **Ubah aplikasi** terbuka.
3. Di bawah **Build**, isi **Batas waktu** dengan durasi seperti `45m`, `90m`, atau `2h`, antara `1m` dan `3h`. Biarkan **Bawaan** untuk tetap 20 menit.
4. Tekan **Simpan**. Batas baru berlaku mulai build berikutnya.

Dari terminal, isi `build.timeout` di definisi aplikasi. Durasinya sama.

```yaml
build:
  timeout: 90m
```

dPanel memeriksa nilai ini saat build dimulai. Nilai yang tidak bisa dibaca, misalnya `90 minutes`, atau di luar rentang 1 menit sampai 3 jam, menghentikan build dengan pesan galat yang menjelaskannya. Kosongkan untuk memakai batas bawaan.

Kirim definisinya, file `.devetek/*.yml`, lewat opsi `--definition` pada alat baris perintah dnocs, di `dnocs application create` atau `dnocs application deploy`.

## Sebelum menaikkannya

- Baca dulu **Log** build yang gagal. Langkah yang macet menunggu input juga gagal dengan cara yang sama, dan waktu tambahan tidak akan membantu.
- Coba server yang lebih besar. Build yang butuh satu jam di ukuran terkecil sering selesai dalam hitungan menit di ukuran berikutnya. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md).
- Lihat seluruh keluaran build di [Rilis dan rollback](./deployments-and-rollback.md#membaca-log-build).

## Pertanyaan yang sering diajukan

### Berapa lama build terpanjang yang diizinkan dPanel?

3 jam. Isi `build.timeout: 3h`. Nilai yang lebih panjang ditolak saat build dimulai.

### Apakah batas waktunya termasuk menjalankan layanan?

Ya. Batasnya mencakup seluruh pekerjaan: clone, menyiapkan runtime, langkah build, dan menjalankan layanan.

### Bisakah batas waktunya diatur di aplikasi web?

Bisa. Buka **Pengaturan** aplikasi, tekan **Ubah** di **Deployment**, lalu isi **Batas waktu** di bawah **Build**. Lihat [Memberi build waktu lebih](#memberi-build-waktu-lebih).
