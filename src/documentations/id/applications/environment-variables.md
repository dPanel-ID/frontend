---
title: Variabel environment
description: Beri build dan layanan yang berjalan pengaturan yang mereka butuhkan, tanpa menaruhnya di repositori.
sidebar_position: 3
sidebar_icon: variable
---

dPanel menyimpan dua daftar terpisah, jadi pengaturan yang hanya dibutuhkan build tidak pernah sampai ke layanan yang berjalan.

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

## Menjaga rahasia tetap aman

- dPanel tidak pernah menampilkan nilai variabel setelah disimpan. **Pengaturan** hanya menampilkan namanya, dengan nilai yang disamarkan.
- Simpan rahasia di **Variabel runtime**, kecuali build benar-benar membutuhkannya.
- Jangan commit rahasia ke repositori. dPanel yang meneruskan variabel ini untuk Anda.
