---
title: Masuk dan profil Anda
description: Masuk ke dPanel dengan Google atau username dan password, buat akun, lalu kelola profil, password, worker, dan halaman profil publik Anda.
sidebar_position: 1
sidebar_icon: log-in
---

dPanel berjalan di browser Anda di [dnocs.devetek.app](https://dnocs.devetek.app), jadi tidak ada yang perlu dipasang. Masuk dengan Google atau username dan password, dan Anda langsung tiba di dasbor. Baru mengenal dPanel? Baca dulu [Apa itu dPanel - dNocs?](./what-is-dpanel.md).

## Masuk

Panel masuk di halaman utama menyediakan dua cara.

| Cara                  | Yang Anda lakukan                                                               |
| --------------------- | ------------------------------------------------------------------------------- |
| Google                | Tekan tombol Google di bagian atas panel, lalu pilih akun Google Anda.          |
| Username dan password | Isi username dan password di bawah **Atau masuk dengan**, lalu tekan **Masuk**. |

Setelah berhasil masuk, Anda langsung dibawa ke **Dasbor**. Kalau sudah masuk sebelumnya, halaman utama menyapa Anda dan menawarkan **Ke dashbor**, **Lihat profil**, dan **Keluar**.

:::tip
Masuk lewat Google tidak memerlukan password tersendiri. Cocok kalau tim Anda sudah memakai Google Workspace.
:::

## Membuat akun

1. Di halaman utama, tekan **Daftar** di samping **Belum punya akun?**.
2. Isi email, username, password, dan ulangi password-nya.
3. Tekan **Daftar**. dPanel mendaftarkan akun Anda lalu mengarahkan Anda begitu siap.

## Lupa password

Tekan **Lupa password?** di samping kolom password. dPanel belum bisa mengatur ulang password lewat email; dialog yang muncul berisi kontak dukungan yang bisa Anda hubungi.

## Profil Anda

Di bagian bawah sidebar, tekan ikon pengaturan pada kartu bernama Anda, lalu **View Profile**. Di sebelahnya ada tombol **Logout**. Halaman profil terdiri dari bagian-bagian berikut:

- **Informasi personal**: nama, username, email, dan ruang kerja yang sedang Anda pakai.
- **Keamanan akun**: password Anda, dan **Akun GitHub** yang dipakai dPanel untuk membaca repositori. Statusnya menjadi **Terhubung** setelah GitHub dihubungkan.
- **Akses workspace**: semua ruang kerja yang Anda ikuti, beserta peran Anda di masing-masing.
- **Worker**: tempat pekerjaan ruang kerja yang sedang Anda pakai dijalankan. Lihat [Worker di profil Anda](#worker-di-profil-anda).
- **Sesi saat ini** dan **Kontrol akun**, di sebelah kanan: ruang kerja dan peran yang dipakai browser ini, serta apakah password dan akses GitHub bisa diubah.

![Halaman profil berisi informasi personal, keamanan akun, akses workspace, dan kartu Worker](../../assets/getting-started/profile.webp 'Profil: siapa Anda, cara Anda masuk, ruang kerja mana saja yang bisa Anda buka, dan di mana pekerjaannya berjalan.')

### Mengubah nama, avatar, atau password

1. Tekan **Ubah profil**.
2. Ubah **Nama lengkap** atau **URL avatar**. Email dan username tidak bisa diubah di sini.
3. Untuk mengganti password, isi **Password baru** dan **Ulangi password**. Minimal 8 karakter. Kosongkan keduanya kalau tidak ingin mengganti password.
4. Tekan **Simpan perubahan**.

### Worker di profil Anda

Worker adalah program yang menjalankan pekerjaan sebuah ruang kerja: deployment, setup server, dan instalasi modul. Kartu **Worker** menampilkan pilihan untuk ruang kerja yang sedang Anda pakai:

- **Worker bersama (dPanel)**: dPanel yang menjalankan pekerjaan Anda. Tidak ada yang perlu disiapkan. Ini pilihan bawaannya.
- **Worker privat**: hanya worker yang Anda jalankan sendiri, di VM atau sebagai workflow GitHub Actions, yang mengambil pekerjaan ruang kerja ini. Tambahkan dulu lewat **Tambah worker**.

Di ruang kerja tim, hanya owner dan admin tim yang bisa mengubahnya. Lihat [Worker](../workers/overview.md).

## Profil publik Anda

Setiap akun punya halaman profil publik di `/u/` diikuti username, misalnya `https://dnocs.devetek.app/u/jane`. Halaman ini menampilkan nama, avatar, username, dan tanggal bergabung, tetapi tidak pernah menampilkan email. Hanya orang yang sudah masuk ke dPanel yang bisa membukanya.

![Halaman profil publik berisi avatar, nama, username, dan tanggal bergabung](../../assets/getting-started/public-profile.webp 'Profil publik menunjukkan siapa seseorang di dPanel, tanpa detail kontak.')

Di seluruh dPanel, nama seseorang tertaut ke halaman ini: pemilik server, kunci SSH, atau akun cloud, orang yang menjalankan build, dan orang yang memulai operasi di **Aktivitas terbaru**. Ubah isinya lewat **Ubah profil**.

## Langkah berikutnya

Pilih ruang kerja yang akan dipakai. Lihat [Ruang kerja](./workspaces.md). Setelah itu, kenali [dasbor](./dashboard.md), atau ikuti [Langkah pertama Anda](./first-steps.md).

## Pertanyaan yang sering diajukan

### Bisakah saya masuk tanpa akun Google?

Bisa. Buat akun lewat **Daftar**, lalu masuk dengan username dan password.

### Saya mendaftar dengan Google. Bagaimana memakai baris perintah dnocs?

`dnocs auth login` memerlukan username dan password. Atur password di **Edit profile** (password lama tidak ditanyakan), lalu masuk ke dnocs dengan username yang tertera di profil Anda. Atau buat token [akun layanan](../teams/service-accounts.md) dan jalankan dnocs dengan `DNOCS_TOKEN`.

### Bagaimana mengatur ulang password yang terlupa?

Tekan **Lupa password?**. dPanel belum bisa mengatur ulang password lewat email; dialog yang muncul berisi kontak dukungan yang bisa Anda hubungi.

### Bisakah saya mengganti username atau email?

Tidak dari halaman profil. **Ubah profil** hanya mengganti nama lengkap, avatar, dan password.

### Siapa yang bisa melihat profil publik saya?

Orang yang sudah masuk ke dPanel dan membuka alamat `/u/` Anda atau menekan nama Anda di sebuah daftar. Isinya hanya nama, avatar, username, dan tanggal bergabung, tanpa email.
