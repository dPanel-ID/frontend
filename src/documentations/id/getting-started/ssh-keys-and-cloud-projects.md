---
title: Kunci SSH dan akun cloud
description: Dua hal yang dibutuhkan dPanel sebelum bisa membuat atau menghubungkan server.
sidebar_position: 5
---

Sebelum server pertama, siapkan dua hal. Keduanya ada di bawah **Backend** di sidebar, dan dipakai ulang untuk semua server berikutnya.

| Yang dibutuhkan | Letaknya                                | Gunanya                                          |
| --------------- | --------------------------------------- | ------------------------------------------------ |
| Kunci SSH       | **Manajemen Kunci**, lalu **Kunci SSH** | dPanel memakainya untuk masuk ke server Anda     |
| Akun cloud      | **Proyek Cloud**                        | dPanel membuat mesin di akun penyedia milik Anda |

Akun cloud hanya diperlukan untuk membuat mesin baru. Untuk menghubungkan server yang sudah berjalan, kunci SSH saja cukup.

## Membuat kunci SSH

1. Di sidebar, buka **Manajemen Kunci**, lalu **Kunci SSH**.
2. Tekan **Buat kunci SSH**.
3. Beri nama yang mudah dikenali, misalnya `laptop-kantor`, lalu pilih jenis kuncinya.
4. Simpan. dPanel membuat pasangan kunci dan menyimpan bagian privatnya dalam bentuk terenkripsi.

![Halaman Kunci SSH dengan satu kunci yang dibagikan ke tim](../../assets/getting-started/ssh-keys.webp 'Kunci SSH: setiap kartu menampilkan jenis kunci, pemiliknya, dan siapa saja yang bisa memakainya.')

Bagian privat tidak pernah ditampilkan, disalin, atau dikirim ke mana pun. Buka sebuah kunci untuk melihat bagian publik dan fingerprint-nya. **Buat server dengan kunci ini** langsung membawa Anda ke halaman pembuatan server.

## Menghubungkan akun cloud

Judul halamannya **Akun cloud**. Di sidebar namanya **Proyek Cloud**.

1. Di sidebar, buka **Proyek Cloud**.
2. Tekan **Hubungkan akun cloud**.
3. Pilih penyedia Anda dan tempel API key yang diberikan penyedia itu.
4. Simpan. dPanel menyimpan kunci itu terenkripsi dan tidak pernah menampilkannya lagi.

Setelah itu dPanel membaca region, ukuran mesin, dan image yang boleh dipakai akun Anda, sehingga formulir pembuatan server hanya menawarkan pilihan yang benar-benar tersedia.

![Halaman Akun cloud yang menampilkan akun penyedia yang sudah terhubung](../../assets/getting-started/cloud-projects.webp 'Akun cloud: satu kartu untuk setiap akun penyedia, beserta statusnya.')

:::info[Siapa yang membayar]
dPanel tidak menjual ulang server. Mesin dibuat di dalam akun penyedia milik Anda sendiri, dan penyedia menagih Anda secara langsung.
:::

## Status akun cloud

| Status                           | Artinya                                 |
| -------------------------------- | --------------------------------------- |
| Siap                             | dPanel bisa membuat server dengannya    |
| Menunggu koneksi / Menghubungkan | dPanel sedang memeriksa kredensialnya   |
| Gagal terhubung                  | Kunci ditolak. Periksa di sisi penyedia |

## Berbagi dan menghapus

- Kunci atau akun yang dibuat di ruang kerja tim otomatis dibagikan ke tim itu. Yang dibuat di ruang kerja personal hanya milik Anda.
- **Pindah Pemilik** di menu item memindahkannya ke ruang kerja lain.
- **Putuskan akun cloud** membuat dPanel melupakan API key-nya. Server yang sudah berjalan di penyedia tetap berjalan.

## Langkah berikutnya

Buat atau hubungkan server pertama Anda. [Sebelum memulai](../servers/before-you-start.md) menjelaskan jenis kunci dan kredensial penyedia lebih rinci, dan [Membuat server cloud](../servers/create-a-cloud-server.md) memandu pengisian formulirnya.
