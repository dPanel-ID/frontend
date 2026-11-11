---
title: Sebelum mulai
description: Sebagian besar server bergabung ke dPanel lewat agen dPanel dan tidak butuh persiapan apa pun. Hubungkan akun cloud hanya jika dPanel perlu meluncurkan VPS untuk Anda.
sidebar_position: 2
sidebar_icon: list-checks
---

Setiap server bergabung ke dPanel lewat **agen dPanel**, program kecil yang berjalan di server dan menghubungi dPanel dari dalam. Anda tidak memberi dPanel SSH key, kata sandi, atau port yang terbuka, jadi tidak ada yang masuk ke mesin Anda dari luar. Itulah pilihan bawaan, baik untuk server yang sudah Anda punya maupun untuk server yang diluncurkan dPanel di akun cloud Anda.

| Anda ingin | Yang perlu disiapkan dulu |
| --- | --- |
| Menambah server yang sudah Anda punya | Tidak ada. Jalankan satu perintah di server itu: [Hubungkan server dengan agen dPanel](./register-a-private-machine.md). |
| Meminta dPanel meluncurkan server baru | [Akun cloud](#akun-cloud), cukup sekali. |

## Server yang sudah Anda punya

Anda tidak perlu menyiapkan apa pun di dPanel, cukup mesin Linux tempat Anda bisa menjalankan satu perintah dengan `sudo` (menjalankan perintah sebagai administrator). Mesinnya bisa VPS di penyedia mana pun, server dedicated, server rumahan, atau VM di balik router, dengan atau tanpa IP publik. Ikuti [Hubungkan server dengan agen dPanel](./register-a-private-machine.md).

## Akun cloud

Akun cloud hanya dibutuhkan jika dPanel perlu meluncurkan mesin baru untuk Anda. Akun cloud adalah penghubung dPanel ke akun Anda di penyedia cloud. Di dalamnya ada kredensial yang mengizinkan dPanel membuat mesin di sana.

1. Di sidebar, buka **Proyek Cloud**. Judul halamannya **Akun cloud**.
2. Tekan **Hubungkan akun cloud**.
3. Pilih penyedia, lalu tempel kredensial yang diberikan penyedia itu.

Cara membuat kredensial dengan hak akses seminimal mungkin, langkah demi langkah, ada di halaman masing-masing penyedia: [AWS](./cloud-providers/provider-aws.md), [Google Cloud](./cloud-providers/provider-gcp.md), [IDCloudHost](./cloud-providers/provider-idcloudhost.md), [DigitalOcean](./cloud-providers/provider-digitalocean.md), [Alibaba Cloud](./cloud-providers/provider-alibabacloud.md), dan [Tencent Cloud](./cloud-providers/provider-tencent.md). Baca [Kredensial cloud dan keamanan](./cloud-providers/cloud-credentials-security.md) sebelum menempelkan kunci.

:::info[Siapa yang membayar mesinnya]
Mesin dibuat di dalam akun cloud Anda sendiri, jadi tagihannya langsung dari penyedia. dPanel tidak menjual ulang mesin.
:::

![Formulir peluncuran dengan proyek cloud yang siap dipilih](../../assets/servers/create-step1-provider.webp 'Kalau akun cloud sudah ada, formulir peluncuran langsung menawarkannya.')

Mesin baru memasang agen dPanel saat menyala, jadi tidak butuh SSH key juga. Lanjut ke [Membuat server cloud](./cloud-providers/create-a-cloud-server.md).

## Hanya jika Anda memilih SSH

SSH key hanya dibutuhkan dalam beberapa kasus, saat dPanel masuk ke server lewat SSH, bukan lewat agen:

- Anda memilih [Hubungkan lewat SSH](./connect-your-own-server.md) untuk server yang sudah Anda punya,
- Anda memilih **SSH** di langkah **Cara dPanel terhubung** saat meluncurkan server cloud,
- Anda meluncurkan di Biznet Gio atau Alibaba Cloud, yang untuk saat ini bergabung lewat SSH.

dPanel membuatkan kuncinya untuk Anda: buka **Manajemen Kunci** di bawah **Backend** di sidebar, lalu tekan **Buat kunci SSH**. Bagian privatnya tidak pernah keluar dari dPanel. Langkah lengkapnya ada di [SSH key dan akun cloud](../getting-started/ssh-keys-and-cloud-projects.md).

## Pertanyaan yang sering diajukan

### Kenapa agen menjadi pilihan bawaan, bukan SSH?

Dengan SSH, Anda menaruh kunci dPanel di server dan membiarkan dPanel masuk dari internet. Dengan agen, Anda menjalankan satu perintah yang bisa Anda baca dulu, tidak ada yang masuk dari luar, dan Anda bisa menghentikannya kapan saja dengan `sudo systemctl disable --now dpanel-agent`. [Agen dPanel atau SSH: pilih yang mana?](./register-a-private-machine.md#agen-dpanel-atau-ssh-pilih-yang-mana) membandingkan keduanya.

### Apakah saya butuh akun cloud untuk mencoba dPanel?

Tidak. [Hubungkan server dengan agen dPanel](./register-a-private-machine.md) hanya butuh mesin Linux tempat Anda bisa menjalankan satu perintah dengan `sudo`.

### Apakah saya masih bisa masuk ke server sendiri?

Bisa. dPanel menyediakan terminal di browser, dan Anda bisa menambahkan kunci publik sendiri untuk masuk dari komputer Anda; lihat [Terhubung lewat SSH](./connect-over-ssh.md).

### Bisakah tim saya memakai akun cloud yang sama?

Bisa. Akun cloud dan kunci yang dibuat di sebuah workspace bisa dipakai anggotanya. Lihat [SSH key dan akun cloud](../getting-started/ssh-keys-and-cloud-projects.md).
