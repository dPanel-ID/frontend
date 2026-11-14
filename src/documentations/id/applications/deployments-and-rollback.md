---
title: Rilis dan rollback
description: Rilis commit baru dengan Bangun dan rilis, ikuti build sampai ke server Anda, dan rollback ke build sebelumnya di dPanel tanpa membangun ulang.
sidebar_position: 4
sidebar_icon: history
---

Di dPanel, Anda yang menentukan kapan kode Anda tayang, dan setiap build disimpan, jadi Anda bisa merilis commit terbaru atau rollback ke build sebelumnya dalam satu langkah. Push ke GitHub tidak merilis apa pun dengan sendirinya: tekan **Bangun dan rilis** saat Anda siap. Ada dua istilah penting. **Build** (layar dPanel kadang menyebutnya **artefak**) adalah kode Anda yang disiapkan dari satu commit. **Rilis** adalah build itu yang dipasang di satu server.

## Apa yang sedang berjalan

Buka aplikasinya. Tab **Ringkasan** diawali **Rilis yang aktif**: commit, branch, orang yang merilisnya, server dan alamat yang sedang melayani, beserta status rilisnya.

![Tab Ringkasan: rilis yang aktif, angka ringkasan, detail, dan build terbaru](../../assets/applications/app-overview.webp)

| Tombol      | Fungsinya                                       |
| ----------- | ----------------------------------------------- |
| Kunjungi    | Membuka alamat publik aplikasi, jika sudah ada. |
| Lihat log   | Membuka tab **Log**.                            |
| Rilis ulang | Membangun dan merilis lagi.                     |

Di bawahnya, **Sedang melayani**, **Build terakhir**, **Build tersimpan**, dan **Port** merangkum kondisi aplikasi, dan **Build terbaru** menampilkan beberapa percobaan terakhir.

## Membangun dan merilis versi baru

Lakukan ini setelah Anda push commit, atau setelah mengubah pengaturan.

1. Tekan **Rilis ulang** di tab Ringkasan, atau **Bangun dan rilis** di tab Rilis.
2. Di panel **Buat Artefak**, pilih **Branch**. dPanel membangun commit terbarunya.
3. Di **Target deployment**, periksa servernya. Server pertama sudah terpilih.
4. Tekan **Simpan**.

![Panel New Artifact, dengan pilihan cabang dan daftar server tujuan build](../../assets/applications/app-new-artifact.webp)

Build baru muncul di urutan teratas dengan status **Membangun**, lalu **Berhasil** atau **Gagal**. Build yang berhasil dirilis ke server, dan status rilisnya menjadi **Sudah di server**.

## Tab Rilis

**Build dan rilis** punya dua tampilan.

- **Build**: semua build, terbaru lebih dulu, dengan ID build, commit, branch, lama build-nya, siapa yang menjalankannya, dan kapan. Build yang sudah dirilis ke server diberi lencana **Digunakan**, dan build yang sedang dirilis diberi lencana **Dalam Proses**.
- **Di server**: setiap server tempat aplikasi dirilis, beserta status layanannya.

Pindah tampilan dengan tombol **Build** dan **Di server** di samping **Bangun dan rilis**.

![Tab Rilis sebuah aplikasi: tiga build, masing-masing dengan ID build, commit, branch, orang yang menjalankannya, status rilis, serta tombol Log, Kembalikan, dan Hapus](../../assets/applications/app-deployments.webp 'Setiap build menyebut siapa yang menjalankannya. Nama orang lain disamarkan di gambar ini.')

### Siapa yang menjalankan setiap build

Setiap kartu build menyebut orang yang memulainya, beserta avatarnya, misalnya setelah **Bangun dan rilis**, **Rilis ulang**, atau deploy dari baris perintah maupun **Ask dPanel**. Rilis di **Di server** menyebut siapa yang merilisnya. Pilih sebuah nama untuk membuka [profil publik](../teams/public-profiles.md) orang itu. dPanel tidak pernah menampilkan alamat email atau ID pengguna mentah di sini.

### Membaca log build

Tekan **Log** pada sebuah build lalu pilih server. **Log Artefak** terbuka pada **Langkah**, yang menunjukkan posisi build, tahap demi tahap, beserta lama setiap tahap. **Keluaran log** berisi yang dicetak build: clone, setiap langkah build, dan saat layanan dijalankan. Lihat [Membaca log](../logs/reading-logs.md#log-build).

### Rollback

1. Cari build yang ingin Anda pakai lagi, lalu tekan **Kembalikan**.
2. Di jendela **Rollback Deployment**, centang server yang ingin dikembalikan.
3. Tekan **Rollback**.

dPanel merilis ulang build itu di server-server tersebut. Rollback hanya memulihkan kode Anda: perubahan di basis data tidak dibatalkan, dan berkas yang tidak ada di repositori tetap seperti adanya.

### Mengelola rilis di server

Di **Di server**, setiap rilis punya tombol **Mulai**, **Restart**, dan **Hentikan** untuk layanannya, serta **Hapus**. Rilis yang sudah dihapus bisa dikembalikan dengan **Pulihkan**, atau dihapus selamanya dengan **Hapus permanen**.

**Restart** tetap memakai variabel environment yang sudah dimiliki layanan. Setelah mengubah variabel, rilis lagi; lihat [Variabel environment](./environment-variables.md).

### Pindah ke runtime baru

**Runtime** adalah bahasa yang dipakai aplikasi untuk berjalan, misalnya Node.js, Python, Go, Ruby, Bun, uv, atau PHP. Kini dPanel memasang setiap versi bahasa sekali per server, siap pakai, dan dipakai bersama oleh semua pengguna. Aplikasi di server yang disiapkan sebelum perubahan ini tetap memakai runtime lama sampai Anda memindahkannya. Lihat [Memasang perangkat lunak](../servers/install-software.md#runtime-lama).

1. Di **Di server**, tekan **Runtime** pada rilisnya. Tombol ini muncul pada rilis aplikasi yang memakai sebuah bahasa.
2. Di **Pindah ke runtime baru?**, tekan **Pindah ke runtime baru**.

dPanel men-deploy rilis itu lagi: memasang bahasanya di runtime baru jika belum ada, membangun ulang aplikasi di atasnya, lalu memulai ulang aplikasi. Virtual environment Python dibuat ulang. Runtime lama tetap terpasang, jadi **Kembali ke runtime lama** di dialog yang sama mengembalikan aplikasi dengan cara yang sama.

Dari terminal: `dnocs application runtime upgrade --id <ID aplikasi> --server-id <ID server>`, tambahkan `--back` untuk kembali.

### Menghapus build

Tekan **Hapus** pada sebuah build untuk mengeluarkannya dari daftar. dPanel meminta konfirmasi lebih dulu.

dPanel menolak menghapus build yang masih dipakai sebuah rilis, atau yang masih dibangun. Hapus dulu rilisnya di **Di server**.

Dari terminal, tampilkan daftar build dengan `dnocs application detail artifact list --id <ID aplikasi>`, lalu hapus satu build dengan `dnocs application detail artifact delete --id <ID aplikasi> --artifact-id <ID build>`. Aturan yang sama berlaku. Server tidak bisa dihapus selama masih ada build yang dibuat di server itu. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang dnocs.

## Status

| Build      | Rilis           | Artinya                                              |
| ---------- | --------------- | ---------------------------------------------------- |
| -          | Menunggu        | Mengantre untuk worker, atau akan segera dimulai.    |
| Membangun  | Merilis         | Sedang dikerjakan.                                   |
| Berhasil   | Sudah di server | Sudah dibangun dan berjalan.                         |
| Berhasil   | Belum dirilis   | Sudah dibangun, tetapi saat ini tidak ada di server. |
| Gagal      | Gagal           | Ada yang menghentikannya. Baca log-nya.              |
| Dibatalkan | Dibatalkan      | Dihentikan sebelum selesai.                          |

Jika build gagal, mulailah dari **Log**-nya. Baris-baris terakhir biasanya menyebut langkah dan galatnya. Build yang dihentikan setelah 20 menit berakhir dengan `context deadline exceeded`; lihat [Batas waktu build](./build-timeout.md). Lihat juga [Pemecahan masalah](../troubleshooting/faq.md).

## Pertanyaan yang sering diajukan

### Apa bedanya build dan rilis?

Build adalah kode Anda yang dikemas sekali, dari satu commit. Rilis adalah build itu yang dipasang dan dijalankan di satu server. Dengan beberapa server, setiap server menyiapkan salinannya sendiri dari commit yang sama. Sebuah build bisa dirilis lagi nanti saat rollback.

### Apakah rollback membangun ulang kode saya?

Tidak. dPanel merilis build yang sudah ada, jadi rollback hanya butuh detik sampai menit, bukan selama build.

### Siapa yang memulai build ini?

Kartu build menyebut orang yang menjalankannya. Pilih namanya untuk membuka profil publiknya.

### Mengapa saya tidak bisa menghapus build?

Build itu masih dipakai sebuah rilis, atau masih dibangun. Hapus dulu rilisnya di **Di server**, atau tunggu build-nya selesai.
