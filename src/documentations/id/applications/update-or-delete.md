---
title: Ubah atau hapus aplikasi
description: Ubah langkah build, perintah jalan, port, dan variabel aplikasi di dPanel, atau hapus aplikasinya dan hentikan layanan systemd-nya di setiap server.
sidebar_position: 6
sidebar_icon: settings-2
sidebar_label: Mengubah atau menghapus aplikasi
---

Anda bisa mengubah cara aplikasi dPanel dibangun dan dijalankan kapan saja, dari satu pengaturan sampai seluruh formulir, atau menghapusnya. Perubahan berlaku mulai rilis berikutnya.

## Meninjau pengaturannya

Buka aplikasinya dan masuk ke **Pengaturan**. **Cara aplikasi ini disiapkan** menampilkan empat bagian.

| Bagian     | Isinya                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| Repositori | Repositori, bahasa, dan framework-nya.                                     |
| Deployment | Batas waktu build dan deskripsi.                                           |
| Build      | Runtime bahasa, langkah build, dan variabel environment saat build.        |
| Jalan      | Nama layanan, port, perintah jalan, dan variabel environment saat runtime. |

![Tab Pengaturan dengan bagian Repositori, Build, Jalan, dan Zona berbahaya](../../assets/applications/app-settings.webp)

## Perubahan cepat

Setiap item yang punya tombol **Ubah** membuka panel khusus untuk bagian itu saja.

| Ubah di samping                             | Panel yang terbuka         | Yang bisa diubah                       |
| ------------------------------------------- | -------------------------- | -------------------------------------- |
| Deployment                                  | Ubah aplikasi              | Batas waktu build dan deskripsi.       |
| Bahasa                                      | Edit Setup Configuration   | Bahasa dan versinya.                   |
| Langkah build, Variabel lingkungan (Build)  | Edit Build Configuration   | Langkah build dan variabel build-time. |
| Perintah jalan, Variabel lingkungan (Jalan) | Edit Runtime Configuration | Perintah jalan dan variabel runtime.   |

Tekan **Simpan** di panel. Perubahan berlaku mulai rilis berikutnya, jadi rilis lagi dengan **Bangun dan rilis** atau **Rilis ulang**.

## Pengaturan yang tetap

Empat pengaturan ditentukan saat aplikasi dibuat dan tidak bisa diubah: **Repositori**, **Direktori kerja** (folder tempat aplikasi berada di server), **Port**, dan **Nama layanan**. Server menyimpan aplikasi di folder itu dan menjalankannya sebagai layanan itu, dan load balancer mengirim lalu lintas ke port itu. Panel **Ubah aplikasi** menampilkannya di bawah **Pengaturan tetap**.

Untuk memakai nilai lain, buat aplikasi baru, rilis, arahkan load balancer Anda ke aplikasi baru itu, lalu hapus yang lama.

## Mengubah semuanya sekaligus

**Ubah pengaturan** di bagian atas aplikasi membuka **Update Aplikasi**. Isinya formulir lima langkah yang sama dengan saat membuat aplikasi, sudah terisi nilai saat ini: server dan modul, nama, perintah, port, dan environment. Port hanya bisa dibaca di sini; lihat [Pengaturan yang tetap](#pengaturan-yang-tetap).

1. Tekan **Ubah pengaturan**.
2. Telusuri langkah-langkahnya dan ubah yang perlu.
3. Di **Pratinjau**, centang **Jalankan playbook bootstrap** jika Anda mengubah modul atau dependency server perlu dipasang ulang.
4. Tekan **Simpan perubahan**.

![Formulir Update Aplikasi yang dibuka dari Ubah pengaturan](../../assets/applications/app-edit.webp)

dPanel memperbarui definisi aplikasi (deskripsi tersimpan tentang cara membangun dan menjalankannya) dan mengirim input playbook untuknya.

## Menghapus aplikasi

Keluarkan dulu aplikasi dari servernya, lalu hapus aplikasinya.

1. Buka tab **Rilis** dan pilih **Di server**.
2. Tekan **Hapus** pada setiap rilis lalu konfirmasi. dPanel menghentikan layanannya dan menghapusnya dari server itu. Tunggu sampai rilis tersebut berstatus terhapus.
3. Buka **Pengaturan**. **Zona berbahaya** ada di bagian bawah.
4. Tekan **Hapus aplikasi ini**.
5. Konfirmasi di dialog **Delete Application**.

Anda tidak perlu menekan **Hapus permanen** pada rilisnya lebih dulu: menghapus aplikasi ikut menghapusnya. Selama masih ada rilis di server, dPanel menolak menghapus aplikasi dan meminta Anda menghapus rilisnya dulu.

:::danger[Tidak bisa dibatalkan]
Menghapus aplikasi akan menghapus aplikasi, build, dan riwayat rilisnya dari dPanel. Server dan repositori Git Anda tidak diubah.
:::

## Pertanyaan yang sering diajukan

### Apakah perubahan saya langsung berlaku?

Tidak. Perubahan berlaku mulai rilis berikutnya. Tekan **Bangun dan rilis** atau **Rilis ulang** setelah menyimpan.

### Bisakah saya mengubah port aplikasi?

Tidak. Port, nama layanan, direktori kerja, dan repositori tetap setelah aplikasi dibuat. Buat aplikasi baru dengan port yang baru. Lihat [Pengaturan yang tetap](#pengaturan-yang-tetap).

### Kapan saya perlu mencentang Jalankan playbook bootstrap?

Saat Anda menambah atau mengubah modul, misalnya versi runtime baru. dPanel lalu memasangnya lagi di server sebelum build berikutnya.

### Apakah menghapus aplikasi juga menghapus repositori atau server saya?

Tidak. Repositori Git dan server Anda tetap ada. Menghapus rilis menghentikan layanannya di server itu; menghapus aplikasi lalu menghapus aplikasi, build, serta riwayat rilisnya dari dPanel.

### Bisakah saya menghapus aplikasi dari terminal?

Bisa. Hapus setiap rilis dengan `dnocs application detail deployment delete --id <app> --deployment-id <rilis>`, yang menghentikan layanannya di server, lalu jalankan `dnocs application delete --id <app>`. Sama seperti di web, `dnocs application delete` menolak selama masih ada rilis di server.
