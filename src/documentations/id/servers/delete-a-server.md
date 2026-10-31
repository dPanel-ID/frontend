---
title: 'Menghapus server'
description: 'Berhenti membayar mesin yang sudah tidak dipakai.'
sidebar_position: 8
---

Mesin cloud ditagih penyedia selama mesin itu ada, jadi hapus begitu Anda selesai memakainya. Buka server, masuk ke Settings, lalu lihat zona berbahaya.

![Dialog penghapusan, memuat daftar akibat dan meminta nama server](../../assets/servers/server-delete.png 'Dialognya menyebutkan apa yang akan terjadi dan meminta Anda mengetik namanya.')

:::danger[Tidak bisa dibatalkan]
Untuk server yang dibuat dPanel, penghapusan mengeluarkannya dari dPanel dan memusnahkan mesinnya di penyedia cloud beserta seluruh isinya. Untuk server yang Anda hubungkan sendiri, dPanel hanya melupakannya dan mesin Anda tetap berjalan.
:::

Penghapusan ditolak selama masih ada aplikasi atau load balancer yang memakai server itu, jadi hapus dulu yang lain. Barisnya kemudian menampilkan Deleting selama penyedia membongkar mesin, lalu hilang dari daftar.

## Memastikan sudah hilang

Daftar Servers adalah pemeriksaan pertama. Yang kedua adalah konsol penyedia Anda: dPanel melaporkan apa yang disampaikan penyedia, jadi penghapusan yang gagal separuh jalan terlihat di sana.
