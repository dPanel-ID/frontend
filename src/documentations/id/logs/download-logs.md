---
title: Mengunduh log
description: Simpan satu halaman baris log, atau seluruh rentang waktu, sebagai file .log.
sidebar_position: 3
---

Unduh log saat Anda perlu mencarinya dengan alat sendiri, atau melampirkannya ke permintaan bantuan.

## Log aplikasi dan load balancer

1. Atur rentang waktu yang Anda inginkan. Lihat [Rentang waktu dan pembaruan](./time-range-and-refresh.md).
2. Tekan **Unduh**. Menunya bertuliskan **Unduh sebagai file .log**.
3. Pilih yang ingin disimpan:
   - **Halaman ini**: baris di halaman yang sedang dibuka.
   - **Semua di rentang waktu ini**: semua halaman, diambil satu per satu.

![Menu unduh: halaman ini dengan 200 baris di halaman 1, atau semua baris di rentang waktu ini, 201 baris](../../assets/logs/logs-download.webp)

Unduhan yang panjang menampilkan progresnya, misalnya **Mengunduh 12.000 / 40.000 baris**. Tekan **Batalkan unduhan** untuk menghentikannya.

:::warning[Maksimal 100.000 baris sekali unduh]
**Semua di rentang waktu ini** dibatasi 100.000 baris. Untuk rentang yang lebih besar, opsinya bertuliskan **Lebih dari 100.000 baris** dan tidak bisa dipilih. Persempit rentang waktunya, atau unduh per halaman.
:::

## Log build

Di **Log Artefak**, tekan **Unduh**. Nama file-nya mengikuti commit, misalnya `build-04ccf00a1b2c.log`, dan berisi baris yang tampil, hingga 500 baris terbaru.

## Sebelum membagikan log

Log bisa berisi apa saja yang dicetak kode Anda, termasuk token atau data pribadi. Baca dulu sebelum mengirimkannya ke mana pun.
