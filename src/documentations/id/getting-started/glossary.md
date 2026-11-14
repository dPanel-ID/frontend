---
title: Glosarium
description: Arti singkat istilah yang dipakai di dPanel dan dokumentasinya, mulai dari server, kunci SSH, dan modul sampai load balancer, DNS, HTTPS, firewall, dan cluster.
sidebar_position: 99
sidebar_icon: file-text
sidebar_label: Glosarium
---

Glosarium ini menjelaskan istilah yang Anda temui di dPanel dan di dokumentasi ini, masing-masing dalam satu kalimat sederhana. Kalau sebuah halaman memakai kata yang belum Anda kenal, cari di sini. Anda juga bisa bertanya ke **Tanya dPanel**, asisten AI dPanel, misalnya "Apa itu load balancer?". Lihat [Tanya dPanel](../ai/overview.md).

## Server dan perangkat lunak

### Server

Komputer yang selalu menyala, yang menjalankan situs web atau aplikasi Anda; di dPanel Anda bisa menghubungkan server yang sudah Anda punya, seperti VPS atau mesin di rumah, atau meluncurkan server baru. Lihat [Server](../servers/overview.md).

### VM (mesin virtual) atau VPS

Server yang disewa dari penyedia cloud dan berjalan sebagai perangkat lunak di atas mesin penyedia yang lebih besar; bagi Anda, ia berperilaku seperti komputer biasa.

### Penyedia cloud

Perusahaan yang menyewakan server per jam atau per bulan, seperti AWS, Google Cloud, DigitalOcean, IDCloudHost, Alibaba Cloud, atau Tencent Cloud. Lihat [Penyedia cloud](../servers/cloud-providers/index.md).

### Proyek cloud (akun cloud)

Sambungan antara dPanel dan akun Anda di penyedia cloud, yang memungkinkan dPanel meluncurkan server di sana untuk Anda. Lihat [Kunci SSH dan proyek cloud](./ssh-keys-and-cloud-projects.md).

### Ubuntu

Sistem operasi Linux gratis yang dipasang dan diharapkan dPanel di server.

### SSH

Cara aman untuk masuk ke server lewat internet dan menjalankan perintah di sana.

### Kunci SSH

Sepasang berkas yang saling cocok, yang membuat sebuah komputer bisa masuk ke server lewat SSH tanpa kata sandi; bagian publiknya disimpan di server, sedangkan bagian privatnya tetap dirahasiakan, dan dPanel hanya membutuhkannya untuk server yang bergabung lewat SSH.

### Agent

Program kecil dPanel di setiap server, yang menyambung keluar ke dPanel, melaporkan kesehatan server, dan menjalankan job yang dikirim dPanel; menghubungkan server dengan agen tidak butuh kunci SSH, IP publik, atau port yang dibuka. Lihat [Hubungkan server dengan agen dPanel](../servers/register-a-private-machine.md).

### Server privat

Server yang dijangkau dPanel lewat agennya, bukan lewat SSH, dan ditandai lencana **Privat**; server ini tetap bisa punya IP publik.

### Penyiapan server

Job pertama yang dijalankan dPanel di server yang terhubung lewat SSH: memasang agent dan menyiapkan mesin; Anda bisa menjalankannya lagi kalau gagal, dan di server yang terhubung dengan agen, menjalankannya lagi hanya memasang ulang agen.

### Modul

Perangkat lunak yang dipasang dPanel di server untuk Anda, seperti PHP, Node.js, MariaDB, PostgreSQL, Caddy, atau Docker. Lihat [Memasang perangkat lunak](../servers/install-software.md).

### Runtime (bahasa)

Perangkat lunak yang menjalankan kode dalam satu bahasa pemrograman, seperti PHP untuk WordPress atau Node.js untuk aplikasi JavaScript; dPanel memasang setiap versi sekali per server, dalam bentuk siap pakai, dan semua aplikasi di server itu memakainya bersama. Lihat [Bahasa pemrograman](../servers/install-software.md#bahasa-pemrograman).

### Basis data

Program yang menyimpan data aplikasi dalam tabel, seperti MariaDB, PostgreSQL, MongoDB, atau Redis.

### DB Manager

Alat web dPanel untuk membuka basis data MariaDB, PostgreSQL, atau MongoDB di browser, untuk menelusuri, menjalankan kueri, mengimpor, atau mengekspor data.

### Terminal

Jendela tempat Anda mengetik perintah ke komputer, bukan mengeklik.

### root dan sudo

`root` adalah akun administrator di Linux. `sudo` menjalankan satu perintah dengan hak administrator.

### systemd

Bagian dari Linux yang menjalankan layanan dan menjaganya tetap hidup. `systemctl` adalah perintah untuk mengendalikannya.

### Port

Pintu bernomor di server tempat satu program mendengarkan, seperti 443 untuk situs web lewat HTTPS atau 5432 untuk PostgreSQL.

### Firewall

Penjaga di server yang menentukan port mana yang bisa dijangkau orang; dPanel mengelola firewall bawaan Ubuntu, yaitu ufw. Lihat [Firewall](../servers/firewall.md).

### TCP dan UDP

Dua cara dasar program mengirim data lewat jaringan; situs web dan basis data memakai TCP, sedangkan sebagian game dan layanan suara memakai UDP.

## Aplikasi

### Aplikasi

Kode Anda di repositori GitHub yang dibuild dan dijalankan dPanel di server, seperti situs WordPress atau aplikasi Laravel. Lihat [Aplikasi](../applications/overview.md).

### Repositori

Folder kode beserta riwayatnya yang Anda simpan di GitHub.

### Branch dan commit

Commit adalah satu versi kode yang tersimpan; branch adalah deretan commit, seperti `main`.

### Build (artifact)

Kode Anda yang diubah satu kali menjadi paket siap jalan dari satu commit; dPanel menyimpan setiap build supaya Anda bisa kembali ke build sebelumnya.

### Deployment (rilis)

Build yang ditempatkan di server lalu dijalankan, sehingga pengunjung bisa memakainya.

### Rollback

Kembali ke build sebelumnya ketika build baru bermasalah. Lihat [Deployment dan rollback](../applications/deployments-and-rollback.md).

### Definisi aplikasi

Deskripsi tersimpan tentang cara membuild dan menjalankan aplikasi Anda: bahasanya, perintah build, dan perintah start, yang disimpan di dPanel atau di folder `.devetek` di repositori Anda.

### Variabel lingkungan

Pengaturan bernama, seperti `APP_ENV=production` atau kata sandi basis data, yang dibaca aplikasi saat mulai berjalan; dPanel menyimpan nilainya dalam bentuk terenkripsi dan menyembunyikannya di layar sampai Anda memintanya. Lihat [Variabel lingkungan](../applications/environment-variables.md) dan [Keamanan dan data Anda](./security-and-your-data.md).

### Service

Program yang dijalankan Linux untuk Anda, terus berjalan di latar belakang, dan dinyalakan lagi setelah reboot; dPanel menjalankan setiap deployment sebagai service.

### Log

Catatan harian sebuah program, satu baris per kejadian, yang Anda baca untuk mengetahui apa yang terjadi atau apa yang salah. Lihat [Membaca log](../logs/reading-logs.md).

## Lalu lintas dan domain

### Domain

Nama yang diketik orang untuk membuka situs Anda, seperti `example.com`, yang Anda beli dari registrar domain.

### Subdomain

Nama di bawah domain Anda, seperti `shop.example.com`.

### DNS

Buku alamat internet, yang mengubah nama domain menjadi alamat server yang melayaninya.

### Record A

Record DNS yang mengarahkan sebuah nama ke alamat IPv4, misalnya `blog.example.com` ke `203.0.113.10`.

### Record DNS

Satu entri di buku alamat itu, misalnya "shop.example.com mengarah ke 203.0.113.10". Lihat [Record DNS](../networking/dns-records.md).

### Alamat IP

Angka yang mengenali sebuah server di sebuah jaringan, seperti `203.0.113.10`; IP publik bisa dijangkau dari seluruh internet, sedangkan mesin di rumah biasanya hanya punya alamat lokal, seperti `192.168.1.20`, di balik IP publik router Anda.

### TLS, SSL, dan HTTPS

HTTPS adalah versi aman dari alamat web, ditandai ikon gembok; HTTPS bergantung pada sertifikat TLS (sering masih disebut SSL), yang didapat dPanel secara gratis dari Let's Encrypt dan diperpanjang otomatis untuk Anda.

### Load balancer

Pintu depan situs web Anda: ia menjawab di domain Anda, menangani HTTPS, dan meneruskan permintaan setiap pengunjung ke aplikasi Anda. Lihat [Load balancer](../networking/load-balancers.md).

### Gateway

Server tempat load balancer berjalan, yang menerima lalu lintas dari pengunjung.

### Engine

Program server web yang dipakai load balancer di gateway-nya: Caddy, Apache APISIX, atau HAProxy.

### L4 dan L7

Load balancer L7 mengarahkan lalu lintas web berdasarkan alamat dan path; load balancer L4 meneruskan koneksi TCP atau UDP mentah, misalnya ke basis data.

### Proxy Cloudflare

Opsi yang membuat pengunjung melewati jaringan Cloudflare sebelum sampai ke server Anda, sehingga alamat server tersembunyi.

## Mengatur pekerjaan Anda

### Akun layanan

Login dPanel untuk program, seperti skrip, pekerjaan CI, atau agen AI, bukan untuk orang. Akun ini masuk memakai token yang bisa dicabut kapan saja. Lihat [Akun layanan](../teams/service-accounts.md).

### Ruang kerja

Ruang terpisah dengan server, aplikasi, dan pengaturannya sendiri: ruang kerja personal Anda, atau ruang kerja tim yang dipakai bersama. Lihat [Ruang kerja](./workspaces.md).

### Tim

Orang-orang yang berbagi satu ruang kerja tim, masing-masing dengan peran seperti Owner, Admin, Developer, atau Viewer yang menentukan apa yang boleh mereka lakukan. Lihat [Tim](../teams/teams.md).

### Job (eksekusi)

Satu pekerjaan yang dijalankan dPanel untuk Anda, seperti menyiapkan server, memasang modul, atau merilis build; setiap job dicatat beserta hasilnya.

### Worker

Program yang menjalankan job sebuah ruang kerja di server Anda; secara bawaan worker bersama milik dPanel yang mengerjakannya, atau Anda bisa memakai worker sendiri. Lihat [Worker](../workers/overview.md).

### GitHub Actions

Fitur bawaan GitHub untuk menjalankan skrip, yang disebut workflow, di mesin milik GitHub; salah satu cara menjalankan worker privat.

### Grup server

Sekumpulan server bernama yang Anda kelola bersama-sama. Lihat [Grup server dan cluster](../clusters/overview.md).

### Cluster dan Kubernetes

Kubernetes adalah sistem yang menjalankan container di beberapa server sekaligus seolah-olah satu; cluster adalah kelompok server seperti itu, yang di dPanel dibangun dengan k3s atau RKE2.

### Container

Aplikasi yang dikemas bersama semua kebutuhannya, sehingga berjalan sama di server mana pun; Docker adalah alat paling terkenal untuk container.

### IaC (infrastructure as code)

Menuliskan cara server disiapkan dalam bentuk berkas, supaya penyiapan yang sama bisa diulang; dPanel mencatat pekerjaannya sebagai berkas Ansible.

## Asisten AI

### Tanya dPanel

Asisten AI yang terpasang di dPanel (**Ask dPanel** di tampilan bahasa Inggris), yang menjawab pertanyaan dan mengusulkan perubahan untuk Anda setujui. Lihat [Tanya dPanel](../ai/overview.md).

### Kartu persetujuan

Kotak di chat yang menampilkan perubahan yang diusulkan asisten, dengan tombol **Setujui** dan **Tolak**. Lihat [Setujui atau tolak perubahan](../ai/approvals-and-secrets.md).

### dnocs (CLI)

Alat baris perintah dPanel, yang Anda jalankan di terminal untuk bekerja dengan dPanel dan asistennya. Lihat [Memakai AI di terminal](../ai/ai-in-the-terminal.md).

### llms.txt

Indeks teks biasa dari dokumentasi ini untuk alat AI; `llms-full.txt` berisi semua halamannya.

## Pertanyaan yang sering diajukan

### Kata yang saya cari tidak ada. Apa yang harus saya lakukan?

Tanyakan ke **Tanya dPanel**: "Apa arti … di dPanel?". Asisten menjawab berdasarkan dokumentasi ini.

### Apakah "build" dan "artifact" sama?

Ya. Halaman dPanel memakai kata build atau artifact untuk paket siap jalan yang sama, yang dibuat dari satu commit.

### Apakah "deployment" dan "rilis" sama?

Ya. Keduanya berarti build yang ditempatkan di server lalu dijalankan.
