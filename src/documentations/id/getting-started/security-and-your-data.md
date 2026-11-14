---
title: Keamanan dan data Anda
description: Di mana kode, basis data, rahasia, dan log Anda berada saat memakai dPanel, bagaimana masing-masing dilindungi, apa yang dikirim ke layanan luar, dan apa yang Anda kendalikan.
sidebar_position: 7
sidebar_icon: shield-check
sidebar_label: Keamanan dan data Anda
---

Halaman ini menjelaskan, dengan bahasa sederhana dulu lalu detail tepatnya, di mana barang-barang Anda berada saat memakai dPanel dan bagaimana semuanya dilindungi. Versi singkatnya:

- **Kode, basis data, dan berkas Anda tetap di server Anda.** dPanel tidak pernah menyimpan kode sumber, build, atau baris data di basis data Anda.
- **dPanel menyimpan apa yang dibutuhkannya untuk mengelola server Anda**: akun, pengaturan, riwayat setiap job, dan rahasia Anda, yang disegelnya.
- **Layanan luar hanya menerima apa yang dibutuhkan pekerjaannya**: penyedia cloud Anda, GitHub, penyedia DNS Anda, layanan model AI untuk asisten, dan Let's Encrypt.

## Cara dPanel menjangkau server Anda

Sebuah program kecil, **agen dPanel**, berjalan di setiap server sebagai layanan `dpanel-agent`. Agen sendiri yang membuka koneksi ke dPanel, lewat WebSocket terenkripsi, sehingga server Anda **tidak perlu membuka port** untuk dPanel.

- **Identitasnya:** setiap server mendapat kredensialnya sendiri saat bergabung, ditukar dengan kode sekali pakai di perintah pemasangannya. Kredensial itu hanya berlaku untuk server tersebut.
- **Yang dilaporkannya:** heartbeat setiap 30 detik berisi pemakaian CPU, memori, dan disk, modul yang berjalan, serta log sistem dan aplikasi di `/var/log` dan journal (lihat [Log](#log)).
- **Yang bisa diminta dPanel darinya:** memasang dan menghapus modul, mem-build dan men-deploy aplikasi, menyalakan dan mematikan layanan, membaca dan mengubah berkas, menambah pengguna Linux, reboot, dan memperbarui dirinya. Setiap perubahan adalah job yang muncul di riwayat aktivitas Anda.
- **Yang tidak dilakukannya:** agen tidak menerima koneksi masuk, dan tidak menjalankan perintah shell bebas yang dikirim dPanel.
- **Terminal browser:** bila terminal dinyalakan untuk sebuah server, orang di ruang kerja Anda yang punya akses ke server itu bisa membuka shell root dari aplikasi web atau dengan `dnocs server exec`. Sesinya diteruskan lewat dPanel ke agen dan ditutup setelah satu jam tanpa input.

Server yang Anda hubungkan lewat SSH bekerja berbeda: worker dPanel masuk dengan SSH key yang Anda berikan ke dPanel. Lihat [Hubungkan lewat SSH](../servers/connect-over-ssh.md).

## Kode dan build Anda

Saat Anda men-deploy, **server Anda** mengunduh kode langsung dari GitHub dan mem-build-nya di sana. Unduhan itu memakai token berumur pendek yang hanya bisa **membaca** satu repositori tersebut. Build dan setiap rilis tetap di folder aplikasi di server Anda; dPanel hanya menyimpan detail seperti commit, branch, dan apakah build berhasil. Lihat [Hubungkan GitHub](./connect-github.md).

## Basis data Anda

MariaDB, PostgreSQL, MongoDB, dan Redis berjalan di server Anda, dan datanya tetap di sana.

- Kata sandi yang Anda atur saat memasang basis data disimpan **hanya di server**. dPanel hanya menyimpan penanda tersembunyi di catatannya, bukan kata sandinya.
- dPanel membaca baris data hanya selama **Anda** membuka alat basis data, lewat izin akses yang berlaku 15 menit. Kata sandi basis data yang Anda ketik di sana tidak disimpan.
- Secara bawaan basis data mendengarkan di `127.0.0.1`, sehingga tidak bisa dijangkau dari internet kecuali Anda memilih alamat lain. Redis juga meminta kata sandi saat mendengarkan di jaringan.

## Rahasia: variabel aplikasi, token, dan kunci

| Apa                                       | Disimpan di mana                 | Bagaimana dilindungi                                                                                                                                                                                              |
| ----------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Variabel build dan runtime aplikasi       | Basis data dPanel                | Disegel dengan AES-256-GCM memakai kunci yang disimpan di luar kode dPanel, dan bisa dirotasi. Ditampilkan tersamarkan di aplikasi web, CLI, dan API.                                                             |
| Variabel yang sama di server Anda         | `/etc/dpanel/apps/<service>.env` | Dimiliki `root`, mode `0600`, di folder `0700`. Unit layanan hanya menunjuk ke berkas itu, jadi `systemctl show` tidak menampilkan apa pun. Variabel build diambil dari berkas `0600` yang dihapus setelah build. |
| Token masuk (sesi dPanel dan GitHub Anda) | Basis data dPanel                | Disegel dengan cara yang sama.                                                                                                                                                                                    |
| Kunci penyedia cloud dan DNS              | Basis data dPanel                | Dienkripsi dengan kunci yang disimpan di luar basis data, dan tidak pernah dikirim kembali ke browser. Lihat [Kredensial cloud dan keamanan](../servers/cloud-providers/cloud-credentials-security.md).           |
| Kata sandi di dalam job yang berjalan     | Antrean job dPanel               | Disegel selama job menunggu. Salinan job dihapus 7 hari setelah selesai; catatan aktivitas tentang apa yang dijalankan tetap ada, tanpa rahasia.                                                                  |

**Melihat nilainya lagi.** Orang yang boleh mengubah aplikasi bisa menekan **Tampilkan nilai** pada variabelnya, atau menjalankan `dnocs application env list --show-values`. Setiap kali nilai ditampilkan, siapa yang melakukannya dicatat. Orang lain hanya melihat namanya.

**Yang tidak pernah terjadi:** log build hanya mencantumkan **nama** variabel, tidak pernah nilainya; kata sandi basis data tidak pernah muncul di command line; dan kata sandi tidak pernah ditulis ke berkas Ansible yang disimpan dPanel untuk Anda.

## Log

Agen mengirim log sistem dan aplikasi server Anda ke dPanel agar bisa Anda baca di aplikasi web dan CLI.

- **Disamarkan dulu:** sebelum sebuah baris meninggalkan server Anda, agen menyembunyikan kata sandi, token, cookie, header `Authorization`, JWT, dan private key.
- **Disimpan 3 hari:** setelah itu dPanel menghapusnya. Untuk baris aplikasi yang lebih lama, `dnocs application logs --raw` membaca hingga 10 hari langsung dari journal server itu sendiri, tanpa disamarkan, satu server setiap kali.
- Log masih bisa memuat detail lain, seperti alamat IP pengunjung di access log dan nama pengguna di `auth.log`.

Lihat [Membaca log](../logs/reading-logs.md).

## Apa yang disimpan dPanel tentang Anda

- **Akun Anda:** alamat email dan nama pengguna, dari layanan masuk.
- **Ruang kerja Anda:** anggota dan peran, server, aplikasi, load balancer, domain, beserta pengaturannya.
- **Riwayat:** setiap job, dengan siapa yang memulainya, kapan, berapa lama, dan langkah mana yang gagal, agar Anda dan tim bisa melihat apa yang berubah.
- **Percakapan Ask dPanel**, agar bisa Anda buka lagi. Lihat [Batasan dan privasi AI](../ai/limits-and-privacy.md).

Profil publik Anda, bila Anda memakainya, menampilkan nama dan nama pengguna, tidak pernah email. Lihat [Profil publik](../teams/public-profiles.md).

## Layanan luar

dPanel mengirim data ke layanan ini hanya untuk mengerjakan apa yang Anda minta:

| Layanan                                                                                          | Yang diterimanya                                                                         | Untuk apa                                                                      |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Penyedia cloud Anda (AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio, Alibaba Cloud, Tencent Cloud) | Permintaan yang dibuat dengan kunci yang Anda hubungkan                                  | Membuat dan menghapus VM Anda                                                  |
| GitHub                                                                                           | Permintaan lewat GitHub App dPanel dan sesi masuk Anda                                   | Menampilkan repositori Anda dan membiarkan server Anda mengunduh salah satunya |
| Penyedia DNS Anda (Cloudflare, DigitalOcean)                                                     | Record untuk domain Anda                                                                 | Mengarahkan domain ke server Anda                                              |
| Layanan model AI                                                                                 | Pesan Ask dPanel Anda dan apa yang dibaca asisten untuk menjawab, dengan rahasia dihapus | Menulis jawaban asisten                                                        |
| Let's Encrypt                                                                                    | Nama domain Anda                                                                         | Menerbitkan sertifikat HTTPS-nya                                               |

Pengunjung Anda terhubung ke server **Anda**, bukan ke dPanel.

## Yang Anda kendalikan

- **Cabut akses saat itu juga.** Mengeluarkan anggota dari ruang kerja, atau menurunkan perannya, berlaku pada permintaan berikutnya. Lihat [Anggota dan peran](../teams/members-and-roles.md).
- **Beri otomasi token sendiri.** Service account punya token sendiri yang bisa Anda cabut secara terpisah. Lihat [Service account](../teams/service-accounts.md).
- **Batasi dan rotasi kunci cloud.** Beri dPanel kunci yang hanya bisa mengelola VM, dan ganti kapan pun Anda mau. Lihat [Kredensial cloud dan keamanan](../servers/cloud-providers/cloud-credentials-security.md).
- **Jalankan job di mesin Anda sendiri.** Worker privat menjalankan job ruang kerja Anda di workflow GitHub atau VM milik Anda. Lihat [Worker](../workers/overview.md).
- **Simpan infrastruktur Anda.** Semua yang disiapkan dPanel ditulis sebagai Ansible, dan server Anda tetap mesin Ubuntu atau Debian biasa dengan layanan systemd, jadi Anda bisa terus menjalankannya tanpa dPanel.

## Pertanyaan yang sering diajukan

### Apakah dPanel membaca basis data saya?

Hanya lewat alat basis data, selama seseorang yang sudah masuk dan punya akses ke server itu membukanya. Tidak ada yang membaca data Anda di latar belakang.

### Bisakah orang di ruang kerja saya melihat kata sandi aplikasi saya?

Mereka melihat nama variabelnya. Hanya orang yang boleh mengubah aplikasi yang bisa menampilkan nilainya, dan setiap kali itu dilakukan, tercatat.

### Apa yang terjadi pada data saya kalau saya berhenti memakai dPanel?

Server, kode, basis data, dan berkas Anda adalah milik Anda dan tetap berjalan. Untuk menghapus VM yang diluncurkan dPanel, hapus servernya di dPanel, yang juga menghapus VM itu di penyedia cloud Anda. Lihat [Menghapus server](../servers/delete-a-server.md).

### Apakah ini kebijakan privasi?

Bukan. Halaman ini menjelaskan cara produk menangani data Anda, agar Anda bisa menilainya sendiri. Ini bukan perjanjian hukum.
