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

![Tampilan Di server sebuah aplikasi: satu rilis di home-server yang berstatus Running, dengan build, versi bahasa, serta tombol Start, Restart, Stop, Runtime, dan Delete](../../assets/applications/app-releases-on-servers.webp 'Setiap rilis menampilkan server, layanan, dan siapa yang merilisnya. Nama disamarkan di sini.')

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

## Folder rilis: deploy tanpa downtime

**Folder rilis** mengubah cara deploy masuk ke server. Tanpa folder rilis, setiap deploy mengganti file di folder aplikasi selagi aplikasi tetap berjalan. Dengan folder rilis:

1. Setiap deploy membangun aplikasi Anda di folder baru, sebuah **rilis**, di samping folder yang sedang aktif.
2. dPanel menjalankan perintah rilis (misalnya migrasi database) di rilis baru. Situs Anda baru pindah ke rilis itu setelah perintahnya berhasil, aplikasi dimulai ulang, dan health check lolos. Jika ada yang gagal, versi yang sekarang tetap melayani.
3. File yang harus bertahan saat deploy, misalnya unggahan di `storage`, file `.env`, dan database SQLite, disimpan di **folder bersama** yang dipakai setiap rilis.

Aplikasi Laravel baru langsung memakai folder rilis. dPanel menyimpan 3 rilis terakhir di setiap server, jadi Anda bisa kembali ke salah satunya dalam hitungan detik.

### Menyalakan atau mematikan folder rilis

1. Buka aplikasinya, lalu masuk ke **Pengaturan**.
2. Di **Rilis dan proses**, tekan **Ubah**.
3. Nyalakan **Folder rilis**. Sesuaikan **Disimpan di antara rilis** (satu path per baris, relatif terhadap folder aplikasi; path yang tidak ada dilewati; paling banyak 20) dan **Jumlah rilis yang disimpan** (1 sampai 10).
4. Tekan **Simpan**, lalu deploy.

Pengaturan ini berlaku pada deploy berikutnya. Di server yang sudah menjalankan aplikasi, file seperti `storage` dipindahkan sekali ke folder bersama saat deploy itu.

:::warning[Mematikannya]
Mematikan folder rilis tidak didukung di server yang sudah memakainya. Untuk kembali, hapus deployment di server itu lalu deploy aplikasinya lagi. Sampai saat itu, server tersebut tetap memakai folder rilis.
:::

### Rollback ke rilis sebelumnya

Dengan folder rilis, setiap server di **Di server** menampilkan **Rilis di server ini**: semua rilis yang disimpan di sana, terbaru lebih dulu, dengan waktu build dan commit-nya. **Aktif** menandai rilis yang melayani sekarang, dan **Sebelumnya** rilis sebelum itu. Rilis bernama **Sebelum folder rilis** berisi file yang dimiliki aplikasi sebelum pindah ke folder rilis.

1. Di **Di server**, cari servernya.
2. Tekan **Rollback** pada rilis yang Anda inginkan.
3. Baca dialognya, lalu tekan **Rollback**.

dPanel memindahkan aplikasi yang aktif di server itu ke rilis lama, lalu memulai ulang situs web serta worker atau scheduler. Perintah setelah restart tetap dijalankan, begitu juga health check. Prosesnya hanya beberapa detik, karena tidak ada yang dibangun ulang.

:::danger[Yang tidak dibatalkan oleh rollback]

- **Perubahan database tetap ada.** Jika rilis yang lebih baru menjalankan migrasi, kode lama berjalan dengan database yang lebih baru. Tulis migrasi yang masih bisa dipakai versi sebelumnya, atau kembalikan databasenya sendiri.
- **Variabel dan pengaturan tetap.** Hanya kode yang berganti; variabel environment dan pengaturan aplikasi saat ini tetap dipakai.
- **Perintah rilis tidak dijalankan.**

:::

**Rollback** tidak ditawarkan selama deploy atau rollback lain sedang berjalan di server itu. Daftar yang bertuliskan **Rilis akan muncul di sini setelah deploy berikutnya** milik aplikasi yang belum pernah di-deploy dengan folder rilis.

### Menghapus deployment yang memakai folder rilis

Saat Anda menekan **Hapus** pada rilis di **Di server**, unggahan, `storage`, file `.env`, dan database SQLite-nya tetap disimpan di folder bersama secara bawaan, sehingga deploy berikutnya ke server itu menemukannya lagi. Centang **Hapus juga data aplikasi** di dialog untuk ikut menghapusnya. Tindakan ini tidak bisa dibatalkan.

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

### Apa bedanya kedua rollback?

**Kembalikan** pada sebuah build merilis ulang build itu: dPanel menaruhnya di server yang Anda centang, yang lamanya sama dengan sebuah rilis. **Rollback** di **Rilis di server ini** kembali ke rilis yang masih ada di server itu, dalam hitungan detik. Yang kedua hanya ada untuk aplikasi yang memakai folder rilis.

### Apakah rollback membatalkan migrasi database saya?

Tidak, keduanya tidak. Lihat [Yang tidak dibatalkan oleh rollback](#rollback-ke-rilis-sebelumnya).
