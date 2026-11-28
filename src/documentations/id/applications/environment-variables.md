---
title: Variabel environment
description: Atur variabel environment build-time dan runtime aplikasi di dPanel, jauhkan rahasia dari repositori, dan terapkan nilai baru lewat rilis.
sidebar_position: 3
sidebar_icon: variable
---

dPanel meneruskan variabel environment ke aplikasi Anda dari dua daftar terpisah, jadi pengaturan yang hanya dibutuhkan build tidak pernah sampai ke layanan yang berjalan, dan rahasia seperti API key tidak perlu ada di repositori Git Anda.

**Variabel environment** adalah pengaturan bernama, misalnya `PORT=9307`, yang dibaca program Anda saat mulai berjalan, sehingga nilainya tidak perlu ditulis di dalam kode. Lihat [Glosarium](../getting-started/glossary.md).

| Daftar              | Dipakai                             | Contoh isi                             |
| ------------------- | ----------------------------------- | -------------------------------------- |
| Variabel build-time | Hanya selama langkah build berjalan | `CGO_ENABLED=0`, `NODE_ENV=production` |
| Variabel runtime    | Oleh layanan yang berjalan          | Port, alamat database, API key         |

## Mengisinya saat membuat aplikasi

Di langkah 4, **Environment**, tulis satu variabel per baris, misalnya `KEY=value` atau `KEY="value"`, di **Variabel build-time** atau **Variabel runtime**. Lihat [Mengubah banyak variabel sekaligus](#mengubah-banyak-variabel-sekaligus) untuk semua bentuk baris yang bisa dipakai.

![Langkah Environment dengan satu variabel build-time dan dua variabel runtime](../../assets/applications/apps-create-environment.webp)

```bash
PORT=9307
APP_ENV=production
```

:::tip[Samakan port-nya]
Jika kode Anda membaca port dari variabel, seperti go-example membaca `PORT`, isi dengan nilai yang sama dengan **Port aplikasi** di langkah 3. Kalau tidak, dPanel dan layanan Anda akan mengharapkan port yang berbeda.
:::

## Mengubahnya nanti

1. Buka aplikasinya, lalu masuk ke **Pengaturan**.
2. Di bagian **Build** atau **Jalan**, cari **Variabel lingkungan** dan tekan **Ubah**.
3. Tambah, ubah, atau hapus variabel, lalu tekan **Simpan**. Nilai yang tidak Anda sentuh tetap memakai nilai tersimpan, meskipun sedang disembunyikan.
4. Rilis lagi dengan **Bangun dan rilis** atau **Rilis ulang**, agar layanan berjalan dengan nilai yang baru. Lihat [Rilis dan rollback](./deployments-and-rollback.md).

Kedua daftar juga bisa diubah lewat **Ubah pengaturan**, yaitu formulir lengkapnya. Lihat [Mengubah atau menghapus aplikasi](./update-or-delete.md).

Anda juga bisa meminta **Ask dPanel** mengerjakannya untuk Anda; lihat [Kumpulan prompt](../ai/prompt-cookbook.md). Nilai rahasia tidak pernah diketik di chat: kartu persetujuan yang memintanya, dan asisten hanya melihat namanya.

:::note[Restart saja tidak cukup]
**Restart** pada sebuah rilis menjalankan ulang layanan dengan nilai yang sudah ada di server. Hanya rilis (**Bangun dan rilis**, **Rilis ulang**, atau rollback) yang menulis nilai baru ke server.
:::

## Menghubungkan Redis

**Redis** adalah penyimpanan cepat yang bisa dipakai aplikasi untuk cache, antrean job, dan sesi. Jika Redis sudah terpasang di server aplikasi (halaman server, tab **Modul**), langkah **Environment** menampilkan **Redis untuk aplikasi ini**.

1. Tekan **Hubungkan Redis**.
2. Biarkan **Prefix kunci** yang disarankan dPanel dari nama aplikasi, misalnya `my_blog_`. Prefix ini memisahkan kunci aplikasi ini dari aplikasi lain yang memakai Redis yang sama.
3. Jika dPanel meminta **Password Redis**, ketik password yang Anda pilih saat memasang Redis. dPanel tidak menyimpannya, jadi tidak bisa mengisinya untuk Anda. Redis yang hanya mendengarkan di server itu sendiri biasanya tidak memakai password.
4. Di **Gunakan Redis untuk**, biarkan tercentang cache, antrean job, dan sesi yang ingin Anda pindahkan ke Redis.
5. Tekan **Isi variabel**.

dPanel menulis `REDIS_HOST` (`127.0.0.1`, server itu sendiri), `REDIS_PORT`, `REDIS_PREFIX`, `REDIS_PASSWORD` jika ada, serta `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`, dan `SESSION_DRIVER=redis` untuk kotak yang tercentang. Jika antrean job memakai Redis, nyalakan juga **Queue worker**.

## Memakai object storage untuk unggahan

Secara bawaan, file yang diunggah pengguna aplikasi tetap di server. Untuk menyimpannya di bucket yang kompatibel dengan S3 (Amazon S3 atau penyedia lain), gunakan **Object storage untuk unggahan**, di langkah **Environment** dan di **Pengaturan**, **Jalan**, **Variabel lingkungan**.

1. Tekan **Gunakan object storage**.
2. Isi **Access key ID**, **Secret access key**, **Bucket**, dan **Region**. Kosongkan **Endpoint** untuk Amazon S3; untuk penyedia lain, ketik alamat S3-nya dan biasanya centang **Gunakan alamat path-style**.
3. Tekan **Isi variabel**, lalu simpan dan deploy.

dPanel menulis `FILESYSTEM_DISK=s3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, `AWS_ENDPOINT`, dan `AWS_USE_PATH_STYLE_ENDPOINT` ke variabel runtime. Seperti nilai lainnya, kunci-kunci ini disembunyikan setelah disimpan.

:::warning[Tambahkan paket composer]
Laravel memerlukan paket `league/flysystem-aws-s3-v3` untuk terhubung ke bucket. Jalankan `composer require league/flysystem-aws-s3-v3` lalu commit `composer.lock`. Jika `FILESYSTEM_DISK=s3` diatur tetapi paketnya tidak ada, pemeriksaan pra-deploy memperingatkan Anda sebelum deploy.
:::

## Mengubah banyak variabel sekaligus

Setiap tempat untuk mengubah variabel punya dua tampilan, dipilih dengan **Per variabel** dan **Teks** di atas daftarnya. Keduanya mengubah daftar yang sama, jadi Anda bisa berpindah kapan saja tanpa kehilangan apa yang sudah diketik.

Di **Teks**, tulis satu variabel per baris lalu tekan **Simpan**: baris baru menambah variabel, baris yang diubah memperbaruinya, dan baris yang dihapus menghapus variabelnya. Ini cara tercepat untuk menempelkan isi file `.env`.

```bash
# Baris yang diawali # diabaikan, begitu juga baris kosong
APP_NAME="Toko saya"
APP_KEY='base64:abc=='
export LOG_LEVEL=info   # "export" dan komentar setelah nilai boleh dipakai
MESSAGE="Baris satu\nBaris dua"
```

- `KEY_NAME="VALUE"` adalah bentuk yang biasa. Di dalam tanda kutip ganda, tulis `\"` untuk tanda kutip, `\\` untuk garis miring terbalik, dan `\n` untuk ganti baris.
- `KEY=value` tanpa tanda kutip dan `'VALUE'` dengan tanda kutip tunggal juga bisa. Tanda kutip tunggal menyimpan nilai persis seperti yang ditulis.
- Setelah nilai tanpa tanda kutip, spasi yang diikuti `#` memulai komentar. `#` di dalam nilai, seperti `COLOR=#fff` atau sebuah URL, tetap disimpan. Beri tanda kutip pada nilai agar ` #` tetap ada di dalamnya.
- Nama memakai huruf, angka, dan garis bawah, dan tidak diawali angka.
- Nilai harus satu baris. Untuk sertifikat atau nilai lain yang terdiri dari beberapa baris, tulis setiap ganti baris sebagai `\n` di dalam tanda kutip ganda.

Jika ada baris yang tidak bisa dibaca, dPanel menampilkannya di bawah kotak beserta nomor barisnya, misalnya _Baris 12: tidak ada "="_, menandai nomor barisnya dengan merah, dan menonaktifkan **Simpan** sampai diperbaiki. Saat nilai disembunyikan, baris tampil sebagai `KEY="••••••••"`; biarkan apa adanya untuk mempertahankan nilai tersimpan, atau ketik di atasnya untuk mengubahnya. **Tampilkan nilai** juga mengisi nilai sebenarnya di tampilan ini.

## Melihat nilai yang tersimpan

dPanel menyembunyikan setiap nilai setelah disimpan: aplikasi web dan API menampilkan `••••••••` sebagai gantinya, dan `dnocs` hanya menampilkan namanya. Kalau Anda perlu melihat nilainya lagi, Anda bisa menampilkannya atas permintaan.

1. Buka **Pengaturan**, lalu tekan **Ubah** di samping **Variabel lingkungan** pada bagian **Jalan**. Panelnya bertuliskan **Nilai disembunyikan. Nilai yang tidak diubah tetap memakai nilai tersimpan.**
2. Tekan **Tampilkan nilai**. Nilai aslinya mengisi kolom yang disembunyikan; apa pun yang sudah Anda ketik tetap seperti adanya.
3. Setelah selesai, tekan **Sembunyikan nilai**, terutama sebelum Anda membagikan layar.

Nilai build-time ditampilkan dengan cara yang sama di **Ubah pengaturan**, pada langkah **Environment**, lewat tombol yang sama.

Hanya orang yang boleh mengubah aplikasi yang bisa menampilkan nilai; orang yang hanya bisa melihat aplikasi tidak bisa. Setiap kali nilai ditampilkan, dPanel mencatat siapa yang melakukannya dan untuk aplikasi mana, tanpa pernah mencatat nilainya.

## Dari terminal

[dnocs CLI](../ai/ai-in-the-terminal.md) bekerja pada variabel runtime:

```bash
dnocs application env list --id 76                 # hanya nama
dnocs application env list --id 76 --show-values   # nama dan nilai
dnocs application env set --id 76 APP_ENV=production LOG_LEVEL=warning
printf %s "$TOKEN" | dnocs application env set --id 76 API_TOKEN --value-stdin
dnocs application env unset --id 76 APP_DEBUG
```

`set` dan `unset` hanya mengubah variabel yang Anda sebut. `--value-stdin` membaca rahasia dari standard input, sehingga tidak tersimpan di riwayat shell. Perubahan sampai ke server pada rilis berikutnya, misalnya `dnocs application deploy --id 76 --server-id <ID server>`.

## Lokasi nilai di server

Untuk para ahli, inilah yang dilakukan dPanel dengan nilai-nilai itu di server Anda:

| Variabel | Di server                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime  | Ditulis ke `/etc/dpanel/apps/<nama layanan>.env`, milik root dengan mode `0600` (direktori `0700`). Unit systemd aplikasi hanya merujuk ke file ini. Menghapus rilis juga menghapus file ini.                             |
| Build    | Ditulis ke file yang hanya bisa dibaca pengguna build (mode `0600`), dibaca setiap langkah build, lalu dihapus setelah build selesai, bahkan jika ada langkah yang gagal. Nilainya tidak pernah muncul di baris perintah. |

Log build hanya mencantumkan nama variabel, tidak pernah nilainya. Nilai sampai ke program Anda persis seperti yang Anda ketik, termasuk spasi, tanda kutip, `$`, dan `%`.

Aplikasi yang dibuat sebelum tata letak ini pindah ke sana pada rilis berikutnya.

## Menjaga rahasia tetap aman

- Nilai disembunyikan di mana pun sampai orang yang boleh mengubah aplikasi meminta untuk menampilkannya.
- Simpan rahasia di **Variabel runtime**, kecuali build benar-benar membutuhkannya.
- Jangan commit rahasia ke repositori. dPanel yang meneruskan variabel ini untuk Anda.
- Password modul yang dipasang bersama aplikasi, misalnya password administrator database, tidak ikut disimpan di file pengaturan yang disimpan dPanel untuk workspace Anda.

## Pertanyaan yang sering diajukan

### Apakah saya perlu merilis ulang setelah mengubah variabel?

Ya. Layanan yang berjalan tetap memakai nilai saat ia dimulai, dan **Restart** tidak mengubahnya. Rilis lagi dengan **Bangun dan rilis** atau **Rilis ulang** agar layanan mulai dengan nilai baru.

### Bisakah saya melihat rahasia setelah disimpan?

Bisa, jika Anda boleh mengubah aplikasinya. Tekan **Tampilkan nilai** di panel **Jalan**, atau di langkah **Environment** pada **Ubah pengaturan** untuk nilai build-time, atau jalankan `dnocs application env list --id <ID aplikasi> --show-values`. Setiap kali dicatat. Lihat [Melihat nilai yang tersimpan](#melihat-nilai-yang-tersimpan).

### Password database sebaiknya variabel build-time atau runtime?

Runtime. Hanya aplikasi yang berjalan yang terhubung ke database, jadi build tidak membutuhkannya. Jalankan migrasi database sebagai **perintah rilis** (preset Laravel menambahkan `php artisan migrate --force` untuk Anda): perintah rilis berjalan setelah build dengan variabel runtime, jadi password cukup ada di satu tempat. Lihat [Perintah rilis dan proses](./update-or-delete.md#perintah-rilis-dan-proses).

### Bolehkah saya menaruh variabel di file .env di repositori?

Boleh, tetapi apa pun yang di-commit ke Git bisa bocor. Simpan rahasia di **Variabel runtime** dPanel saja.

### Bisakah pengguna lain di server membaca variabel saya?

Tidak. File runtime hanya bisa dibaca root, dan nilai build berada di file yang hanya bisa dibaca pengguna build, lalu dihapus setelah build selesai.
