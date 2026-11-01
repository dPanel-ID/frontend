---
title: Menghapus server
description: Hapus server yang tidak lagi dipakai: apa yang dihancurkan dPanel di penyedia cloud, dan apa yang terjadi pada server yang Anda hubungkan sendiri.
sidebar_position: 8
sidebar_icon: trash-2
---

Penyedia menagih mesin cloud selama mesin itu ada, jadi hapus begitu tidak dipakai lagi.

## Yang perlu disiapkan

Penghapusan ditolak selama masih ada aplikasi atau load balancer yang memakai server ini. Hapus dulu keduanya:

- [Menghapus aplikasi](../applications/update-or-delete.md)
- [Load balancer](../networking/load-balancers.md)

## Hapus servernya

1. Buka server, lalu tab **Pengaturan**.
2. Di **Zona berbahaya**, tekan **Hapus server**.
3. Baca bagian **Yang akan terjadi**.
4. Ketik nama server untuk konfirmasi, lalu tekan **Hapus server**.

![Dialog Hapus server, berisi apa yang akan terjadi dan kolom untuk mengetik nama server](../../assets/servers/server-delete.webp)

:::danger[Tidak bisa dibatalkan]
Untuk server yang diluncurkan dPanel, penghapusan mencopot agen dan menghancurkan mesinnya di penyedia cloud, beserta disk dan seluruh isinya. Untuk server yang Anda hubungkan sendiri, dPanel hanya melupakannya dan mesinnya tetap berjalan.
:::

## Setelah itu

Server berstatus **Deleting** selama penyedia membongkar mesinnya, lalu menjadi **Deleted**.

Periksa dua tempat:

1. Daftar **Server**.
2. Konsol penyedia Anda. dPanel melaporkan apa yang dikatakan penyedia, jadi penghapusan yang gagal sebagian di penyedia akan terlihat di sana.
