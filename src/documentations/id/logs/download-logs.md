---
title: Mengunduh log
description: Unduh log aplikasi dan load balancer dari dPanel sebagai file .log: baris yang dimuat di daftar, atau seluruh rentang waktu hingga 100.000 baris.
sidebar_position: 3
sidebar_icon: download
---

dPanel mengunduh log aplikasi dan load balancer sebagai file `.log` biasa, baik baris yang dimuat di daftar maupun semua baris di rentang waktu, hingga 100.000 baris. Unduh log saat Anda perlu mencarinya dengan alat sendiri, atau melampirkannya ke permintaan bantuan.

## Log aplikasi dan load balancer

1. Atur rentang waktu yang Anda inginkan. Lihat [Rentang waktu dan pembaruan](./time-range-and-refresh.md).
2. Tekan **Unduh**. Menunya bertuliskan **Unduh sebagai file .log**.
3. Pilih yang ingin disimpan:
   - **Baris yang dimuat**: baris yang sedang dimuat di daftar.
   - **Semua di rentang waktu ini**: semua baris, diambil bertahap.

Nama file menjelaskan isinya: nama log dan jendela waktunya, misalnya `my-app_2026-11-05T01-00Z_to_2026-11-05T01-10Z.log`. Baris disimpan dari yang terlama, sebagai teks biasa yang bisa dibuka di editor apa pun. Setiap baris berisi waktu dalam UTC, level, dan baris aslinya persis seperti ditulis.

:::note[Detail request tidak ada di file]
Load balancer menulis setiap request sebagai pesan pendek `handled request`, sedangkan metode, path, dan status disimpan sebagai field terpisah. Unduhan menyimpan pesan itu, bukan baris `GET … → 200` yang mudah dibaca. Untuk menyimpan detail request, gunakan `dnocs load-balancer log --id <ID load balancer> --json`.
:::

Unduhan yang panjang menampilkan progresnya, misalnya **Mengunduh 12.000 / 40.000 baris**. Tekan **Batalkan unduhan** untuk menghentikannya.

:::warning[Maksimal 100.000 baris sekali unduh]
**Semua di rentang waktu ini** dibatasi 100.000 baris. Untuk rentang yang lebih besar, opsinya bertuliskan **Lebih dari 100.000 baris** dan tidak bisa dipilih. Persempit rentang waktunya, atau simpan baris yang dimuat. Log runtime aplikasi di semua server dibatasi 5.000 baris; pilih satu server di menu **Server** untuk lebih banyak.
:::

## Log mentah dari server

Dua opsi di atas membaca penyimpanan log dPanel, yang hanya menyimpan beberapa jam terakhir dan memendekkan baris terstruktur menjadi pesannya saja. Untuk mendapatkan log yang sebenarnya, tekan **Unduh** di tab Log aplikasi lalu pilih **Log mentah dari server**.

File berisi setiap baris pada rentang waktu persis seperti ditulis aplikasi Anda, dari yang terlama, dibaca dari journal di server. Baris terstruktur (JSON) tetap utuh. dPanel tidak menambahkan waktu atau level, jadi sebuah baris hanya punya waktu jika aplikasi Anda menuliskannya. Nama file berakhiran `.raw.log`.

Aplikasi di beberapa server perlu memilih satu server dulu. Di aplikasi web, log mentah mengikuti rentang waktu yang dipilih, paling lama 3 hari. Dari terminal bisa mundur hingga 10 hari selama server masih menyimpan journal-nya. Satu unduhan bisa sampai 1 GB. Agen di server harus versi terbaru. Dari terminal, gunakan `dnocs application logs --id N --since 72h --raw --output app.log`.

:::warning[Tidak ada yang disamarkan]
Tampilan log lain menyembunyikan teks yang mirip kata sandi atau token. Log mentah tidak, dan bisa berisi isi request serta header response. Siapa pun yang bisa membuka aplikasi dapat mengunduhnya, dan setiap unduhan dicatat di log audit.
:::

## Log build

Di **Log Artefak**, buka tab **Keluaran log** lalu tekan **Unduh**. Pilih **Baris yang dimuat** atau **Semua di rentang waktu ini** untuk seluruh build. Nama file-nya diawali commit, misalnya `build-04ccf00a1b2c`.

## Sebelum membagikan log

Log bisa berisi apa saja yang dicetak kode Anda, termasuk token atau data pribadi. Baca dulu sebelum mengirimkannya ke mana pun.

## Pertanyaan yang sering diajukan

### Berapa banyak baris yang bisa diunduh?

Hingga 100.000 baris sekaligus dengan **Semua di rentang waktu ini**, atau 5.000 untuk log runtime di semua server. Untuk lebih banyak, persempit rentang waktu atau pilih satu server.

### Bisakah saya mengunduh log server?

Tidak sebagai file. Log server menampilkan 20 sampai 500 baris terbaru dari satu file. Pilih sebuah baris lalu gunakan **Salin baris mentah**, atau baca lewat SSH. Lihat [Terhubung lewat SSH](../servers/connect-over-ssh.md).

### Format filenya apa?

Teks biasa berekstensi `.log`, satu baris per entri log, dari yang terlama.
