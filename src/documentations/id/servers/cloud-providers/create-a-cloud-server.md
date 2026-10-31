---
title: Membuat server cloud
description: Formulir peluncuran langkah demi langkah, dari memilih penyedia sampai mesin berjalan.
sidebar_position: 1
sidebar_icon: cloud-upload
---

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
- **Zone** adalah satu pusat data di dalam region itu. Mana saja boleh.
- **Network** terisi otomatis. dPanel membuat `dpanel-network` saat pertama kali meluncurkan mesin di sebuah region, lalu memakainya lagi. Hanya SSH, HTTP, dan HTTPS yang dibuka.

## Langkah 3: Size and image

- **Server name** adalah nama mesin di dPanel dan di penyedia.
- **Machine Type** menentukan jumlah CPU dan memori. Ukuran kecil seperti `e2-small` sudah cukup untuk mencoba.
- **Ubuntu release**: 24.04 LTS adalah pilihan aman. LTS berarti pembaruan keamanan selama bertahun-tahun.
- **Disk** adalah ukuran disk dalam gigabyte.

![Langkah 2 dan 3 sudah terisi, dan panel Review bertuliskan Ready to launch, 9/9](../../../assets/servers/create-step2-location-size.webp)

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

Begitu banner hilang dan lencananya bertuliskan **Ready**, server siap dipakai.

:::warning[Kalau setup gagal]
Banner merah muncul dengan tombol **Lihat penyebabnya**, berisi alasan dari penyedia atau dari proses setup. Penyebab yang paling sering: kuota akun cloud tidak cukup, atau kredensialnya sudah kedaluwarsa. Untuk mencoba lagi, pakai **Instal ulang** di tab **Pengaturan** server.
:::

:::tip[Tagihan berjalan sejak sekarang]
Penyedia menagih mesin selama mesin itu ada, termasuk selama setup. [Hapus servernya](../delete-a-server.md) kalau sudah tidak dipakai.
:::
