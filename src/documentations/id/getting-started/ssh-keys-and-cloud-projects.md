---
title: Kunci SSH & akun cloud
description: Buat kunci SSH yang dipakai dPanel untuk masuk ke server, dan hubungkan akun AWS, Google Cloud, DigitalOcean, atau cloud lain untuk membuat server VPS.
sidebar_position: 5
sidebar_icon: key-round
sidebar_label: Kunci SSH dan akun cloud
---

Sebelum dPanel bisa membuat atau menghubungkan server pertama Anda, dPanel membutuhkan kunci SSH, dan untuk membuat VPS baru juga membutuhkan akun cloud. Keduanya ada di bawah **Backend** di sidebar, dan dipakai ulang untuk semua server berikutnya.

| Yang dibutuhkan | Letaknya                                    | Gunanya                                          |
| --------------- | ------------------------------------------- | ------------------------------------------------ |
| Kunci SSH       | **Manajemen Kunci** (membuka **Kunci SSH**) | dPanel memakainya untuk masuk ke server Anda     |
| Akun cloud      | **Proyek Cloud**                            | dPanel membuat mesin di akun penyedia milik Anda |

Akun cloud hanya diperlukan untuk membuat mesin baru. Untuk menghubungkan server yang sudah berjalan, kunci SSH saja cukup.

## Membuat kunci SSH

1. Di sidebar, di bawah **Backend**, buka **Manajemen Kunci** (di tampilan bahasa Inggris: **Secret Managers**). Menu ini langsung membuka halaman **Kunci SSH**.
2. Tekan **Buat kunci SSH**.
3. Beri nama yang mudah dikenali, misalnya `laptop-kantor`, lalu pilih jenis kuncinya.
4. Tekan **Buat kunci SSH** di bagian bawah formulir. dPanel membuat pasangan kunci dan menyimpan bagian privatnya dalam bentuk terenkripsi.

![Halaman Kunci SSH dengan satu kunci yang dibagikan ke tim](../../assets/getting-started/ssh-keys.webp 'Kunci SSH: setiap kartu menampilkan jenis kunci, pemiliknya, dan siapa saja yang bisa memakainya.')

Bagian privat tidak pernah ditampilkan, disalin, atau dikirim ke mana pun. Buka sebuah kunci untuk melihat bagian publik dan fingerprint-nya. **Buat server dengan kunci ini** langsung membawa Anda ke halaman pembuatan server.

## Menghubungkan akun cloud

Judul halamannya **Akun cloud**. Di sidebar namanya **Proyek Cloud**.

1. Di sidebar, buka **Proyek Cloud**.
2. Tekan **Hubungkan akun cloud**.
3. Pilih penyedia Anda dan tempel kredensial yang diberikan penyedia itu. Cara membuatnya dengan akses seminimal mungkin ada di halaman tiap penyedia: [AWS](../servers/cloud-providers/provider-aws.md), [Google Cloud](../servers/cloud-providers/provider-gcp.md), [IDCloudHost](../servers/cloud-providers/provider-idcloudhost.md), [DigitalOcean](../servers/cloud-providers/provider-digitalocean.md), [Alibaba Cloud](../servers/cloud-providers/provider-alibabacloud.md), [Tencent Cloud](../servers/cloud-providers/provider-tencent.md).
4. Simpan. dPanel menyimpan kunci itu terenkripsi dan tidak pernah menampilkannya lagi. Lihat [Kredensial cloud dan keamanan](../servers/cloud-providers/cloud-credentials-security.md).

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
- Kunci atau akun tetap berada di ruang kerja tempat ia dibuat. Keduanya tidak bisa dipindahkan ke ruang kerja lain.
- **Perbarui kredensial**, di menu **Lebih** (⋯) pada baris akun cloud, mengganti kunci di dalam akun itu, misalnya setelah Anda merotasinya di penyedia. Server yang diluncurkan dengannya tetap berfungsi. Lihat [Merotasi kredensial](../servers/cloud-providers/cloud-credentials-security.md#merotasi-kredensial).
- **Hapus**, di menu yang sama, memutuskan akun cloud: dPanel melupakan API key-nya setelah Anda mengonfirmasi **Putuskan akun cloud**. Server yang sudah berjalan di penyedia tetap berjalan.

## Langkah berikutnya

Buat atau hubungkan server pertama Anda. [Sebelum memulai](../servers/before-you-start.md) menjelaskan jenis kunci dan kredensial penyedia lebih rinci, dan [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md) memandu pengisian formulirnya.

Anda juga bisa meminta **Ask dPanel** menampilkan kunci dan akun cloud Anda lalu meluncurkan server dengannya; lihat [Prompt cookbook](../ai/prompt-cookbook.md).

## Pertanyaan yang sering diajukan

### Apakah saya wajib punya akun cloud untuk memakai dPanel?

Tidak. Akun cloud hanya diperlukan untuk meluncurkan server baru dari dPanel. Untuk memakai server yang sudah Anda sewa, kunci SSH saja cukup. Lihat [Menghubungkan server sendiri](../servers/connect-your-own-server.md).

### Bisakah saya mengunduh kunci privatnya?

Tidak. Bagian privat tetap terenkripsi di dPanel dan tidak pernah ditampilkan. Untuk masuk sendiri, tambahkan kunci publik milik Anda ke server. Lihat [Terhubung lewat SSH](../servers/connect-over-ssh.md).

### Apakah Manajemen Kunci tempat menyimpan password dan API key?

Untuk saat ini belum. **Manajemen Kunci** hanya berisi kunci SSH. Simpan password aplikasi di [variabel lingkungan](../applications/environment-variables.md) aplikasinya.

### Jenis kunci mana yang sebaiknya saya pilih?

Yang pertama, untuk server masa kini. Pilih yang lain hanya jika server lama menolak kuncinya.
