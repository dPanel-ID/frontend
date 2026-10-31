---
title: Batas waktu build
description: Berapa lama build boleh berjalan, dan cara memberi waktu lebih untuk build yang lambat.
sidebar_position: 7
sidebar_icon: timer
---

Setiap build dan rilis berjalan sebagai satu pekerjaan: clone, menyiapkan runtime, langkah build, lalu menjalankan layanan. Secara bawaan, pekerjaan itu dihentikan setelah **20 menit**.

Sebagian besar aplikasi selesai jauh sebelum itu. Build yang banyak mengompilasi, misalnya image Docker dengan banyak ekstensi PHP di server kecil, bisa tidak sempat. Saat batasnya tercapai, build gagal dan log-nya berakhir dengan `context deadline exceeded`.

## Memberi build waktu lebih

Isi `build.timeout` di definisi aplikasi. Nilainya berupa durasi seperti `45m`, `90m`, atau `2h`, antara `1m` dan `3h`.

```yaml
build:
  timeout: 90m
```

dPanel memeriksa nilai ini saat build dimulai. Nilai yang tidak bisa dibaca, misalnya `90 minutes`, atau di luar rentang 1 menit sampai 3 jam, menghentikan build dengan pesan galat yang menjelaskannya. Kosongkan untuk memakai batas bawaan.

:::note[Belum ada di formulir web]
Formulir **Buat aplikasi baru** dan **Update Aplikasi** belum punya kolom untuk batas waktu ini. Atur di file definisi aplikasi `.devetek/*.yml`, lalu kirim lewat opsi `--definition` pada alat baris perintah dnocs, di `dnocs application create` atau `dnocs application deploy`.
:::

## Sebelum menaikkannya

- Baca dulu **Log** build yang gagal. Langkah yang macet menunggu input juga gagal dengan cara yang sama, dan waktu tambahan tidak akan membantu.
- Coba server yang lebih besar. Build yang butuh satu jam di ukuran terkecil sering selesai dalam hitungan menit di ukuran berikutnya.
