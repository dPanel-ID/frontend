---
title: Membuat server cloud
description: Luncurkan VPS Ubuntu di AWS, Google Cloud, DigitalOcean, IDCloudHost, Alibaba Cloud, atau Tencent Cloud dari dPanel, langkah demi langkah, dalam 10–20 menit.
sidebar_position: 1
sidebar_icon: cloud-upload
---

dPanel meluncurkan server Ubuntu baru (VM) di akun cloud Anda sendiri dari satu formulir: pilih penyedia, region, ukuran, dan rilis Ubuntu, lalu dPanel membuat mesinnya, memasang agennya, dan membuka SSH, HTTP, serta HTTPS. Server siap dalam sekitar 10 sampai 20 menit.

Panduan ini memakai Google Cloud. Penyedia lain menanyakan hal yang sama dengan urutan yang sama. Perbedaannya dibahas di [Penyedia cloud](./index.md), yang punya halaman tersendiri untuk tiap penyedia.

## Yang perlu disiapkan

- SSH key dan akun cloud di dPanel. Lihat [Sebelum mulai](../before-you-start.md).
- Kuota yang cukup di penyedia untuk satu mesin lagi.

## Buka formulirnya

Buka **Server**, lalu **Buat Server**, lalu **Luncurkan server**.

Formulirnya satu halaman dengan tiga langkah bernomor. Panel **Review** di kanan terisi sambil Anda menjawab. Penghitungnya, misalnya **3/9**, menunjukkan berapa jawaban yang sudah masuk.

## Langkah 1: Provider and project

1. **Provider**: tempat mesin berjalan.
2. **Cloud project**: akun cloud mana yang membayarnya. **Add project** menghubungkan akun lain.
3. **SSH key**: kunci yang dipakai dPanel untuk masuk ke mesin. **Create SSH key** membuat kunci baru di sini.

![Langkah 1 formulir peluncuran, dengan Google Cloud, proyek cloud, dan SSH key terpilih](../../../assets/servers/create-step1-provider.webp)

## Langkah 2: Location

- **Region** adalah wilayah tempat mesin berjalan. Pilih yang dekat dengan pengguna Anda.
- **Zone** adalah satu pusat data di dalam region itu. Mana saja boleh. Google Cloud, Alibaba Cloud, dan Tencent Cloud menanyakannya.
- **Network** terisi otomatis. Di sebagian besar penyedia, dPanel membuat `dpanel-network` saat pertama kali meluncurkan mesin di sebuah region, lalu memakainya lagi. Hanya SSH, HTTP, dan HTTPS yang dibuka.

## Langkah 3: Size and image

1. **Server name** adalah nama mesin di dPanel dan di penyedia.
2. **Ubuntu release**: 24.04 LTS terpilih secara bawaan; 26.04 LTS ditandai **Newest**. LTS berarti pembaruan keamanan selama bertahun-tahun.
3. **Size**: geser slider **CPU** dan **RAM** ke ukuran yang Anda inginkan, dan **Storage** ke ukuran disk dalam GB.

![Langkah 3 formulir peluncuran dengan slider CPU, RAM, dan Storage serta ukuran yang akan diluncurkan dPanel](../../../assets/servers/create-step2-location-size.webp)

Kartu di bawah slider menyebutkan dengan tepat apa yang akan Anda dapatkan:

- **You get**: penyedia yang menerima pasangan CPU dan memori apa pun, seperti Google Cloud dan IDCloudHost, meluncurkan ukuran persis itu.
- **Cheapest match**: penyedia dengan tipe instance tetap, seperti AWS, DigitalOcean, Alibaba Cloud, dan Tencent Cloud, meluncurkan tipe termurah dengan CPU dan memori minimal sebesar itu. **Rounded up from** muncul jika tipenya lebih besar dari yang Anda minta, dan kartu itu menampilkan harga bulanan jika penyedia memberikannya.

| Slider  | Rentang                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| CPU     | 1, 2, 4, 8, atau 16 vCPU. Nilai yang tidak bisa dilayani penyedia dicoret.                                                         |
| RAM     | 1 sampai 64 GB. Menggeser CPU memindahkan RAM ke pasangan terdekat yang dijual penyedia.                                           |
| Storage | 20 sampai 500 GB dengan kelipatan 10 GB (40 sampai 500 GB di Alibaba Cloud). DigitalOcean dan Tencent Cloud menentukannya sendiri. |

Di penyedia dengan tipe tetap, **Choose the instance type yourself** membuka daftar lengkap milik penyedia sebagai pengganti slider. **Use the size sliders instead** kembali ke slider. Biznet Gio tetap memakai pilihan **Product** dan **Billing Cycle** miliknya sendiri.

:::tip[Mulai dari yang kecil]
1 vCPU dan RAM 2 GB sudah cukup untuk mencoba dPanel dengan satu aplikasi kecil. Anda bisa meluncurkan server yang lebih besar nanti dan memindahkan aplikasi ke sana.
:::

## Luncurkan

Saat panel Review bertuliskan **Ready to launch**, semua jawaban sudah lengkap.

1. Tekan **Launch server**.
2. Di dialog **Setup server dimulai**, tekan **Buka server** untuk memantau prosesnya, atau **Buat lagi**.

**Clear form** mengosongkan formulir.

## Setelah itu

Banner biru memberi tahu bahwa dPanel sedang menyiapkan server. Biasanya 10 sampai 20 menit:

1. Penyedia membuat mesinnya.
2. dPanel memasang agen dan membaca isi mesin.
3. dPanel membuka port yang dibutuhkan.

Begitu banner hilang dan lencananya bertuliskan **Ready**, server siap dipakai. Selanjutnya, [pasang perangkat lunak](../install-software.md) di server itu atau [buat aplikasi](../../applications/create-an-application.md).

:::warning[Kalau setup gagal]
Banner merah muncul dengan tombol **Lihat penyebabnya**, berisi alasan dari penyedia atau dari proses setup. Penyebab yang paling sering: kuota akun cloud tidak cukup, atau kredensialnya sudah kedaluwarsa. Untuk mencoba lagi, pakai **Instal ulang** di tab **Pengaturan** server. Lihat [Masalah yang sering muncul](../../troubleshooting/faq.md#server).
:::

:::tip[Tagihan berjalan sejak sekarang]
Penyedia menagih mesin selama mesin itu ada, termasuk selama setup. [Hapus servernya](../delete-a-server.md) kalau sudah tidak dipakai.
:::

## Pertanyaan yang sering diajukan

### Berapa lama waktu yang dibutuhkan untuk meluncurkan server?

Sekitar 10 sampai 20 menit dari **Launch server** sampai **Ready**. Sebagian besar waktunya dipakai penyedia untuk membuat VM dan dPanel untuk memasang agennya.

### Versi Ubuntu apa saja yang bisa diluncurkan?

Ubuntu 24.04 LTS dan 26.04 LTS. dPanel memilih image terbaru dari penyedia untuk rilis yang Anda pilih.

### Berapa biaya sebuah server?

Penyedia menagih Anda dengan harganya sendiri, karena server berjalan di akun Anda. Di penyedia dengan tipe instance tetap, kartu ukuran menampilkan harga bulanan penyedia jika tersedia.

### Bisakah saya memilih tipe instance tertentu, misalnya t3.small?

Bisa, di AWS, DigitalOcean, Alibaba Cloud, dan Tencent Cloud. Tekan **Choose the instance type yourself** di bawah slider, lalu pilih dari daftar penyedia.

### User login apa yang didapat server?

`ubuntu` di AWS, Google Cloud, dan Tencent Cloud, `root` di Alibaba Cloud, dan **Default User** yang Anda tentukan (bawaannya `dpanel`) di DigitalOcean dan IDCloudHost. Lihat [Terhubung lewat SSH](../connect-over-ssh.md).
