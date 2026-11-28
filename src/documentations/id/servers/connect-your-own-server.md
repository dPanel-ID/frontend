---
title: Menghubungkan server Anda lewat SSH
description: Hubungkan VPS, server bare metal, atau mesin home lab Ubuntu atau Debian ke dPanel lewat SSH dengan SSH key dPanel. dPanel memasang agennya dalam sekitar 5 menit.
sidebar_position: 3
sidebar_icon: terminal
sidebar_label: SSH manual
---

Anda bisa menambahkan server yang sudah berjalan, di penyedia hosting mana pun atau di rumah, ke dPanel lewat SSH. dPanel masuk dengan salah satu SSH key Anda di dPanel, memasang agennya, lalu mesin itu bisa dipakai seperti server yang diluncurkan dPanel. Prosesnya sekitar 5 menit dan tidak butuh akun cloud.

:::tip[Cara yang direkomendasikan tidak butuh SSH key]
[Hubungkan server dengan agen dPanel](./register-a-private-machine.md): Anda menjalankan satu perintah di server, lalu agen terhubung keluar ke dPanel. Anda tidak perlu menambahkan kunci dPanel, membuka port, atau punya IP publik. Pakai halaman ini kalau Anda lebih suka dPanel masuk lewat SSH. [Agen dPanel atau SSH: pilih yang mana?](./register-a-private-machine.md#agen-dpanel-atau-ssh-pilih-yang-mana) membandingkan keduanya.
:::

## Yang perlu disiapkan

- Server Ubuntu atau Debian dengan IP publik, yang bisa dijangkau dPanel lewat SSH dari internet.
- User Linux yang berupa `root`, atau yang bisa menjalankan `sudo` (menjalankan perintah sebagai administrator) tanpa mengetik kata sandi. dPanel masuk dengan kunci dan tidak punya kata sandi untuk diberikan ke `sudo`.
- SSH key di dPanel. Anda juga bisa membuatnya langsung dari formulir.

## Hubungkan

1. Buka **Server**, lalu **Buat Server**, lalu **Hubungkan lewat SSH**.
2. Di **Pilih SSH key**, pilih sebuah kunci, atau tekan **Buat kunci SSH**.
3. Salin perintah di **Izinkan key di server Anda**, lalu jalankan sekali di server. Masuklah seperti biasa, umumnya lewat konsol web penyedia Anda atau `ssh user@address` di terminal. Perintah itu menambahkan separuh publik kunci ke `~/.ssh/authorized_keys`, yaitu daftar kunci yang boleh masuk, dan tidak menampilkan apa pun kalau berhasil.
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
Untuk server yang Anda hubungkan sendiri, dPanel mencopot agennya dan melupakan server itu. Mesin, aplikasi, dan datanya tetap ada. Lihat [Menghapus server](./delete-a-server.md).
:::

## Pertanyaan yang sering diajukan

### Sistem operasi apa saja yang bisa dihubungkan?

Ubuntu dan Debian. dPanel memasang agen dan modulnya dengan perkakas standar kedua sistem itu.

### Apakah dPanel butuh kata sandi root?

Tidak. dPanel masuk dengan SSH key, tidak pernah dengan kata sandi. User Linux yang Anda isi harus `root` atau boleh memakai `sudo`.

### Apakah server saya butuh alamat IP publik?

Untuk halaman ini, ya: dPanel harus bisa menjangkau **Alamat server** dan **Port SSH** yang Anda isi. Alamat yang tidak akan pernah bisa dijangkau dPanel dari internet ditolak: alamat lokal seperti `localhost` atau `0.0.0.0`, alamat jaringan privat (LAN) seperti `192.168.x.x`, `10.x.x.x`, atau `172.16.x.x`, rentang bersama `100.64.x.x`, dan nama contoh seperti `example.com` atau `server.local`. Server yang [dihubungkan dengan agen dPanel](./register-a-private-machine.md) tidak butuh IP publik, karena hanya terhubung ke luar.

### Apa yang terjadi jika saya menghapus server dari dPanel?

dPanel mencopot agennya dan melupakannya. Mesin Anda tetap berjalan, beserta semua isi lainnya. Lihat [Menghapus server](./delete-a-server.md).

### Penyiapan gagal. Bagaimana mencobanya lagi?

Perbaiki penyebab yang tampil di **Lihat penyebabnya** (sering kali kuncinya belum ada di `authorized_keys`, atau penggunanya tidak bisa memakai `sudo`), lalu tekan **Instal ulang** di tab **Pengaturan** server. Dari terminal, `dnocs server setup --id <ID server>` melakukan hal yang sama.
