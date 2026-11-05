---
title: Variabel environment
description: Atur variabel environment build-time dan runtime aplikasi di dPanel, jauhkan rahasia dari repositori, dan terapkan nilai baru lewat rilis.
sidebar_position: 3
sidebar_icon: variable
---

dPanel meneruskan variabel environment ke aplikasi Anda dari dua daftar terpisah, jadi pengaturan yang hanya dibutuhkan build tidak pernah sampai ke layanan yang berjalan, dan rahasia seperti API key tidak perlu ada di repositori Git Anda.

**Variabel environment** adalah pengaturan bernama, misalnya `PORT=9307`, yang dibaca program Anda saat mulai berjalan, sehingga nilainya tidak perlu ditulis di dalam kode. Lihat [Glosarium](../getting-started/glossary.md).

| Daftar              | Dipakai                             | Contoh isi                             |
| ------------------- | ----------------------------------- | -------------------------------------- |
| Variabel build-time | Hanya selama langkah build berjalan | `CGO_ENABLED=0`, `NODE_ENV=production` |
| Variabel runtime    | Oleh layanan yang berjalan          | Port, alamat database, API key         |

## Mengisinya saat membuat aplikasi

Di langkah 4, **Environment**, ketik satu pasangan `KEY=value` per baris di **Variabel build-time** atau **Variabel runtime**.

![Langkah Environment dengan satu variabel build-time dan dua variabel runtime](../../assets/applications/apps-create-environment.webp)

```bash
PORT=9307
APP_ENV=production
```

:::tip[Samakan port-nya]
Jika kode Anda membaca port dari variabel, seperti go-example membaca `PORT`, isi dengan nilai yang sama dengan **Port aplikasi** di langkah 3. Kalau tidak, dPanel dan layanan Anda akan mengharapkan port yang berbeda.
:::

## Mengubahnya nanti

1. Buka aplikasinya, lalu masuk ke **Pengaturan**.
2. Di bagian **Build** atau **Jalan**, cari **Variabel lingkungan** dan tekan **Ubah**.
3. Tambah, ubah, atau hapus variabel, lalu tekan **Simpan**.
4. Rilis lagi dengan **Bangun dan rilis** atau **Rilis ulang**, agar layanan berjalan dengan nilai yang baru. Lihat [Rilis dan rollback](./deployments-and-rollback.md).

Kedua daftar juga bisa diubah lewat **Ubah pengaturan**, yaitu formulir lengkapnya. Lihat [Mengubah atau menghapus aplikasi](./update-or-delete.md).

Anda juga bisa meminta **Ask dPanel** mengerjakannya untuk Anda; lihat [Kumpulan prompt](../ai/prompt-cookbook.md). Nilai rahasia tidak pernah diketik di chat: kartu persetujuan yang memintanya, dan asisten hanya melihat namanya.

## Menjaga rahasia tetap aman

- dPanel tidak pernah menampilkan nilai variabel setelah disimpan. **Pengaturan** hanya menampilkan namanya, dengan nilai yang disamarkan.
- Simpan rahasia di **Variabel runtime**, kecuali build benar-benar membutuhkannya.
- Jangan commit rahasia ke repositori. dPanel yang meneruskan variabel ini untuk Anda.

## Pertanyaan yang sering diajukan

### Apakah saya perlu merilis ulang setelah mengubah variabel?

Ya. Layanan yang berjalan tetap memakai nilai saat ia dimulai. Rilis lagi dengan **Bangun dan rilis** atau **Rilis ulang** agar layanan mulai dengan nilai baru.

### Bisakah saya melihat rahasia setelah disimpan?

Tidak. dPanel menyamarkan setiap nilai setelah disimpan. Simpan salinan Anda sendiri di pengelola password, atau isi nilai baru.

### Password database sebaiknya variabel build-time atau runtime?

Runtime. Hanya layanan yang berjalan yang terhubung ke database, jadi build tidak pernah membutuhkannya.

### Bolehkah saya menaruh variabel di file .env di repositori?

Boleh, tetapi apa pun yang di-commit ke Git bisa bocor. Simpan rahasia di **Variabel runtime** dPanel saja.
