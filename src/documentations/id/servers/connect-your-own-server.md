---
title: Menghubungkan server Anda
description: Bawa VPS, mesin bare metal, atau mesin home lab yang sudah Anda jalankan.
sidebar_position: 10
---

dPanel bisa merawat mesin yang sudah Anda punya. dPanel masuk lewat SSH dengan salah satu SSH key Anda di dPanel, lalu memasang agennya.

## Yang perlu disiapkan

- Server Ubuntu atau Debian yang bisa dijangkau dPanel lewat SSH.
- User Linux di server itu yang boleh memakai `sudo`, atau `root`.
- SSH key di dPanel. Anda juga bisa membuatnya langsung dari formulir.

## Hubungkan

1. Buka **Server**, lalu **Buat Server**, lalu **Hubungkan server**.
2. Di **Pilih SSH key**, pilih sebuah kunci, atau tekan **Buat kunci SSH**.
3. Salin perintah di **Izinkan key di server Anda**, lalu jalankan sekali di server. Perintah itu menambahkan separuh publik kunci ke `~/.ssh/authorized_keys`.
4. Centang **Saya sudah menambahkan key ini ke server**.
5. Di **Di mana servernya?**, isi alamat server (IPv4, hostname, atau domain), port SSH, dan user Linux.
6. Setelah panel tinjauan menunjukkan 3/3, tekan **Hubungkan server**.

![Formulir Hubungkan server Anda, dengan SSH key terpilih dan perintah untuk mengizinkannya](../../assets/servers/connect-own-server.webp)

:::warning[Jalankan di mesin dan user yang benar]
Jalankan perintahnya sebagai user yang sama dengan yang Anda isi di kolom user Linux. Setup berhenti lebih awal jika dPanel tidak bisa login dengan kunci itu.
:::

## Setelah itu

dPanel menyimpan server, lalu memasang agen lewat SSH. Pantau progresnya di halaman server. Biasanya sekitar 5 menit.

Begitu lencananya bertuliskan **Ready**, server ini bisa dipakai seperti server lain. Lihat [Halaman server Anda](./your-server-page.md).

:::info[Menghapus server yang Anda hubungkan sendiri]
Untuk server yang Anda hubungkan sendiri, dPanel hanya melupakannya. Mesinnya tetap berjalan. Lihat [Menghapus server](./delete-a-server.md).
:::
