---
title: Ubah atau hapus aplikasi
description: Ubah langkah build, perintah jalan, port, dan variabel aplikasi di dPanel, atau hapus aplikasinya dan hentikan layanan systemd-nya di setiap server.
sidebar_position: 6
sidebar_icon: settings-2
sidebar_label: Mengubah atau menghapus aplikasi
---

Anda bisa mengubah cara aplikasi dPanel dibangun dan dijalankan kapan saja, dari satu pengaturan sampai seluruh formulir, atau menghapusnya. Perubahan berlaku mulai rilis berikutnya.

## Meninjau pengaturannya

Buka aplikasinya dan masuk ke **Pengaturan**. **Cara aplikasi ini disiapkan** menampilkan tiga bagian.

| Bagian     | Isinya                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| Repositori | Repositori, bahasa, dan framework-nya.                                     |
| Build      | Runtime bahasa, langkah build, dan variabel environment saat build.        |
| Jalan      | Nama layanan, port, perintah jalan, dan variabel environment saat runtime. |

![Tab Pengaturan dengan bagian Repositori, Build, Jalan, dan Zona berbahaya](../../assets/applications/app-settings.webp)

## Perubahan cepat

Setiap item yang punya tombol **Ubah** membuka panel khusus untuk bagian itu saja.

| Ubah di samping                             | Panel yang terbuka         | Yang bisa diubah                       |
| ------------------------------------------- | -------------------------- | -------------------------------------- |
| Bahasa                                      | Edit Setup Configuration   | Bahasa dan versinya.                   |
| Langkah build, Variabel lingkungan (Build)  | Edit Build Configuration   | Langkah build dan variabel build-time. |
| Perintah jalan, Variabel lingkungan (Jalan) | Edit Runtime Configuration | Perintah jalan dan variabel runtime.   |

Tekan **Simpan** di panel. Perubahan berlaku mulai rilis berikutnya, jadi rilis lagi dengan **Bangun dan rilis** atau **Rilis ulang**.

## Mengubah semuanya sekaligus

**Ubah pengaturan** di bagian atas aplikasi membuka **Update Aplikasi**. Isinya formulir lima langkah yang sama dengan saat membuat aplikasi, sudah terisi nilai saat ini: server dan modul, nama, perintah, port, dan environment.

1. Tekan **Ubah pengaturan**.
2. Telusuri langkah-langkahnya dan ubah yang perlu.
3. Di **Pratinjau**, centang **Jalankan playbook bootstrap** jika Anda mengubah modul atau dependency server perlu dipasang ulang.
4. Tekan **Simpan perubahan**.

![Formulir Update Aplikasi yang dibuka dari Ubah pengaturan](../../assets/applications/app-edit.webp)

dPanel memperbarui definisi aplikasi (deskripsi tersimpan tentang cara membangun dan menjalankannya) dan mengirim input playbook untuknya.

## Menghapus aplikasi

**Zona berbahaya** ada di bagian bawah **Pengaturan**.

1. Tekan **Hapus aplikasi ini**.
2. Konfirmasi di dialog **Delete Application**.

:::danger[Tidak bisa dibatalkan]
Menghapus aplikasi akan menghapus aplikasi, build, dan riwayat rilisnya dari dPanel, serta menghentikan layanannya di setiap server tempatnya berjalan. Server dan repositori Git Anda tidak diubah.
:::

## Pertanyaan yang sering diajukan

### Apakah perubahan saya langsung berlaku?

Tidak. Perubahan berlaku mulai rilis berikutnya. Tekan **Bangun dan rilis** atau **Rilis ulang** setelah menyimpan.

### Kapan saya perlu mencentang Jalankan playbook bootstrap?

Saat Anda menambah atau mengubah modul, misalnya versi runtime baru. dPanel lalu memasangnya lagi di server sebelum build berikutnya.

### Apakah menghapus aplikasi juga menghapus repositori atau server saya?

Tidak. Repositori Git dan server Anda tetap ada. dPanel menghentikan layanannya dan menghapus aplikasi, build, serta riwayat rilisnya.

### Bisakah saya menghapus aplikasi dari terminal?

`dnocs application delete` menghapus aplikasi yang tidak punya deployment. Hapus dulu rilisnya, atau gunakan **Hapus aplikasi ini** di web.
