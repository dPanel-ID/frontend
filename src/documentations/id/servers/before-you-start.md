---
title: Sebelum mulai
description: Dua hal yang cukup disiapkan sekali, lalu dipakai ulang untuk setiap server.
sidebar_position: 2
sidebar_icon: list-checks
---

## SSH key

SSH key adalah sepasang berkas pengganti kata sandi saat komputer masuk ke server. Separuhnya publik dan ditulis ke server. Separuh lainnya privat dan tidak pernah keluar dari dPanel.

Anda tidak perlu membuatnya sendiri.

1. Di sidebar, buka **Manajemen Kunci**, lalu **Kunci SSH**.
2. Tekan **Buat kunci SSH**.
3. Beri nama yang mudah dikenali, misalnya `laptop-kerja`.
4. Pilih jenis kunci, lalu simpan.

- **Untuk server saat ini** adalah pilihan yang tepat, kecuali ada server yang menolaknya. Kuncinya lebih pendek dan lebih cepat, dan semua Linux modern menerimanya.
- **Untuk server lama** adalah cadangannya, dan juga menanyakan ukuran kunci.

Separuh privatnya tidak akan ditampilkan lagi. dPanel menyimpannya terenkripsi dan memakainya untuk Anda. Halaman kunci menampilkan separuh publiknya, yang aman disalin ke mana saja, beserta fingerprint yang bisa Anda cocokkan dengan laporan server.

![Halaman Kunci SSH dengan satu kunci](../../assets/getting-started/ssh-keys.webp)

## Akun cloud

Akun cloud hanya dibutuhkan untuk meluncurkan mesin baru. Untuk [menghubungkan server sendiri](./connect-your-own-server.md), SSH key saja sudah cukup.

Akun cloud adalah penghubung dPanel ke akun Anda di penyedia cloud. Di dalamnya ada kredensial yang mengizinkan dPanel membuat mesin atas nama Anda.

1. Di sidebar, buka **Proyek Cloud**. Judul halamannya **Akun cloud**.
2. Tekan **Hubungkan akun cloud**.
3. Pilih penyedia, lalu tempel kredensial yang diberikan penyedia itu.

Cara membuat kredensial dengan hak akses seminimal mungkin, langkah demi langkah, ada di halaman masing-masing penyedia: [AWS](./cloud-providers/provider-aws.md), [Google Cloud](./cloud-providers/provider-gcp.md), [IDCloudHost](./cloud-providers/provider-idcloudhost.md), [DigitalOcean](./cloud-providers/provider-digitalocean.md), [Alibaba Cloud](./cloud-providers/provider-alibabacloud.md), dan [Tencent Cloud](./cloud-providers/provider-tencent.md). Baca [Kredensial cloud dan keamanan](./cloud-providers/cloud-credentials-security.md) sebelum menempelkan kunci.

:::info[Siapa yang membayar mesinnya]
Mesin dibuat di dalam akun cloud Anda sendiri, jadi tagihannya langsung dari penyedia. dPanel tidak menjual ulang mesin.
:::

![Formulir peluncuran dengan proyek cloud dan SSH key yang siap dipilih](../../assets/servers/create-step1-provider.webp 'Kalau keduanya sudah ada, formulir peluncuran langsung menawarkannya.')

## Langkah berikutnya

Lanjut ke [Membuat server cloud](./cloud-providers/create-a-cloud-server.md). Penjelasan lebih lengkap soal kunci dan akun, termasuk berbagi dengan tim, ada di [SSH key dan akun cloud](../getting-started/ssh-keys-and-cloud-projects.md).
