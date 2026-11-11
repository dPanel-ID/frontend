---
title: Apa itu dPanel - dNocs?
description: dPanel - dNocs adalah panel kontrol server berbasis web untuk menghubungkan server Anda atau membuat server baru, deploy aplikasi dari GitHub, dan mengelola DNS dan log.
sidebar_position: 0
sidebar_icon: rocket
sidebar_label: Apa itu dPanel?
---

dPanel - dNocs (distributed Node & Operations Control system) adalah panel kontrol server berbasis web: situs tempat Anda mengelola server sendiri dengan mengklik, bukan mengetik perintah. dPanel menghubungkan server yang sudah Anda punya, seperti VPS atau mesin di rumah, atau membuat server Ubuntu di akun cloud milik Anda sendiri, lalu men-deploy aplikasi Anda dari GitHub, menempatkannya di belakang load balancer HTTPS, mengelola record DNS-nya, dan menampilkan log-nya. Semuanya dari browser.

## Untuk siapa

- **Developer dan tim kecil** yang ingin kodenya berjalan di server sendiri tanpa menulis skrip deployment.
- **Agensi dan freelancer** yang mengurus banyak situs klien dan ingin satu tempat untuk melihat semua server, aplikasi, dan domain.
- **Engineer ops** yang menginginkan satu cara bersama bagi tim untuk membuat server dan merilis versi baru, dengan peran alih-alih berbagi password root.

Anda tidak memerlukan terminal di komputer sendiri. dPanel menjalankan program kecil, yaitu agen, di setiap server. Agen menyambung keluar ke dPanel, melaporkan kesehatan server, dan menjalankan job Anda, jadi dPanel tidak perlu masuk ke server Anda. Kalau Anda mau, dPanel juga bisa terhubung lewat SSH.

## Apa yang dilakukan dPanel

| Bidang        | Yang bisa Anda lakukan                                                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server        | Menghubungkan server Linux apa pun dengan satu perintah, atau membuat VM di penyedia cloud. Melihat CPU, memori, dan disk secara langsung, layanan systemd, user, port terbuka, file, dan log, serta mengatur firewall server. |
| Software      | Memasang basis data, runtime, dan web server dari katalog modul yang sudah teruji, misalnya MariaDB, Go, atau Caddy.                                                                                                             |
| Aplikasi      | Membangun repositori GitHub di server Anda, menjalankannya sebagai layanan systemd, menyimpan setiap build, dan rollback dalam satu langkah.                                                                                     |
| Load balancer | Memublikasikan aplikasi di sebuah domain dengan sertifikat HTTPS Let's Encrypt gratis yang diperpanjang otomatis.                                                                                                                |
| Domain        | Mengelola record DNS domain yang di-host di Cloudflare atau DigitalOcean.                                                                                                                                                        |
| Log           | Membaca log aplikasi, load balancer, build, dan server, mencarinya, dan mengunduhnya hingga 3 hari ke belakang.                                                                                                                  |
| Cluster       | Mengelompokkan server, lalu menjadikan grup itu cluster Kubernetes dengan k3s atau RKE2.                                                                                                                                         |
| Tim           | Berbagi ruang kerja dengan tim dan memberi setiap orang peran, dari Viewer sampai Owner.                                                                                                                                         |
| Worker        | Menjalankan pekerjaan ruang kerja Anda di worker bersama milik dPanel, atau di worker pribadi yang Anda jalankan sendiri.                                                                                                        |
| Asisten       | Bertanya dalam bahasa sehari-hari, atau membiarkan [Ask dPanel](../ai/overview.md) menyiapkan perubahan untuk Anda setujui.                                                                                                      |

## Penyedia dan sistem yang didukung

- **Penyedia cloud:** AWS EC2, Google Compute Engine, DigitalOcean Droplets, IDCloudHost, Alibaba Cloud ECS, dan Tencent Cloud CVM. Formulir peluncuran juga mencantumkan Biznet Gio. Lihat [Penyedia cloud](../servers/cloud-providers/index.md).
- **Server Anda sendiri:** VPS, mesin bare-metal, server rumahan, atau Raspberry Pi apa pun yang menjalankan Linux dengan systemd, di Intel/AMD atau ARM, dihubungkan dengan agen dPanel. Tidak perlu IP publik. Lihat [Hubungkan server dengan agen dPanel](../servers/register-a-private-machine.md). Server Ubuntu dan Debian juga bisa [dihubungkan lewat SSH](../servers/connect-your-own-server.md).
- **Sistem operasi pada server yang dibuat dPanel:** Ubuntu 24.04 LTS atau 26.04 LTS.
- **Kode:** repositori GitHub yang bisa dibaca oleh akun atau organisasi GitHub Anda, dibangun dengan perintah yang Anda tentukan.
- **DNS:** Cloudflare dan DigitalOcean.

dPanel tidak menjual ulang server maupun domain. Mesin berjalan di akun penyedia milik Anda sendiri, dan penyedia menagih Anda secara langsung.

## dPanel dibandingkan mengelola VPS secara manual

| Tugas                          | Manual di VPS                                                            | Dengan dPanel                                                                          |
| ------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Membuat server                 | Mengklik konsol penyedia, menyiapkan kunci SSH dan firewall              | Pilih penyedia, region, dan ukuran dalam satu formulir; siap dalam sekitar 10–20 menit |
| Memasang basis data            | `apt install`, mengedit file konfigurasi, membuat unit systemd           | Pilih modulnya, jawab beberapa pertanyaan                                              |
| Deploy aplikasi dari GitHub    | Clone, build, menulis file layanan, restart, ulangi setiap ada perubahan | Pilih repositori dan branch; tekan **Bangun dan rilis** setelah push                   |
| Rollback rilis yang bermasalah | Mencari build lama, kalau masih disimpan                                 | **Kembalikan** pada build mana pun yang disimpan                                       |
| HTTPS di sebuah domain         | Memasang web server, menyiapkan Certbot, menambahkan record DNS          | Buat load balancer; dPanel menambahkan record dan sertifikatnya                        |
| Membaca log                    | Masuk lewat SSH, `journalctl` atau `tail -f`                             | Cari dan unduh di browser                                                              |
| Memberi akses ke rekan kerja   | Berbagi kunci atau password                                              | Tambahkan ke tim dengan sebuah peran                                                   |

Anda tetap punya akses penuh ke mesinnya. dPanel bekerja dengan alat standar Linux, jadi Anda tetap bisa masuk sendiri kapan pun Anda mau.

## Cara memulai

Ikuti [Langkah pertama Anda](./first-steps.md): masuk, pilih ruang kerja, siapkan server, deploy aplikasi pertama lewat tutorial, lalu pasang di domain Anda. Istilah baru dijelaskan di [Glosarium](./glossary.md).

## Pertanyaan yang sering diajukan

### Apakah ada tema gelap?

Ada. Tekan ikon bulan di bagian bawah sidebar untuk berganti antara terang dan gelap. Layanan dPanel lain di domain yang sama, misalnya database manager, ikut memakai tema yang Anda pilih.

### Apa kepanjangan dNocs?

dNocs adalah singkatan dari distributed Node & Operations Control system. dPanel adalah panel kontrol yang Anda pakai di browser; nama lengkap produknya dPanel - dNocs.

### Apakah saya perlu memasang sesuatu?

Tidak, di komputer Anda tidak perlu. dPanel berjalan di browser Anda di dnocs.devetek.app. Setiap server menjalankan agen dPanel: Anda memasangnya dengan satu perintah, server cloud memasangnya sendiri, atau dPanel memasangnya lewat SSH.

### Sistem operasi apa saja yang didukung dPanel?

Server yang dibuat dPanel menjalankan Ubuntu 24.04 LTS atau 26.04 LTS. Server yang Anda hubungkan dengan agen dPanel bisa menjalankan Linux apa pun dengan systemd, di Intel/AMD (`amd64`) atau ARM (`arm64`). Server yang Anda hubungkan lewat SSH harus menjalankan Ubuntu atau Debian.

### Siapa yang membayar servernya?

Penyedia cloud Anda menagih Anda secara langsung, karena dPanel membuat mesin di dalam akun penyedia milik Anda sendiri. dPanel tidak menjual ulang server.

### Apakah saya masih bisa memakai SSH di server saya?

Bisa. dPanel punya terminal di browser, dan Anda bisa menambahkan kunci publik Anda sendiri ke server lalu terhubung dengan klien SSH apa pun. dPanel sendiri tidak membutuhkan SSH di server yang terhubung dengan agen. Lihat [Terhubung lewat SSH](../servers/connect-over-ssh.md).

### Apa yang terjadi pada server saya kalau saya berhenti memakai dPanel?

Server tetap berjalan di tempatnya, dengan aplikasi Anda sebagai layanan systemd. Menghapus server yang Anda hubungkan sendiri hanya membuat dPanel melupakannya; mesinnya tidak disentuh.
