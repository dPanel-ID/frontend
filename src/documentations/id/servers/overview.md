---
title: Server di dPanel
description: Server di dPanel adalah VPS Linux yang dikelola untuk Anda: diluncurkan di AWS, Google Cloud, DigitalOcean, dan lainnya, atau server Ubuntu via SSH.
sidebar_position: 1
sidebar_icon: server
sidebar_label: Apa itu server di dPanel
---

Server di dPanel adalah satu mesin Linux yang dirawat control panel ini untuk Anda: VPS yang diluncurkan dPanel di akun cloud Anda sendiri (AWS EC2, Google Compute Engine, Droplet DigitalOcean, IDCloudHost, Alibaba Cloud ECS, atau Tencent Cloud CVM), atau server Ubuntu maupun Debian yang sudah Anda jalankan lalu Anda hubungkan lewat SSH.

VPS (virtual private server) adalah komputer Linux sewaan di pusat data. dPanel memasang program kecil di dalamnya, yaitu **agen**, yang melaporkan kesehatan server dan menjalankan tugas yang Anda mulai. Belum kenal istilahnya? Lihat [Glosarium](../getting-started/glossary.md).

Setelah server masuk ke dPanel, semua urusannya bisa dikerjakan dari browser. Anda tidak perlu membuka terminal di komputer sendiri.

- Melihat apakah server sehat, dan berapa banyak CPU, memori, dan disk yang terpakai.
- Memasang perangkat lunak, misalnya basis data atau runtime bahasa pemrograman, lalu membuka basis datanya di DB Manager.
- Menyalakan, menghentikan, dan memulai ulang layanan yang berjalan.
- Mengelola akun pengguna Linux.
- Menjelajah berkas dan membaca log.
- Membuka terminal.
- Memilih port mana yang bisa dijangkau internet lewat [firewall](./firewall.md).
- Men-deploy [aplikasi](../applications/overview.md) ke server itu, lalu memasang [load balancer](../networking/load-balancers.md) dengan HTTPS di depannya.

![Halaman Server dalam tampilan tabel, berisi daftar server beserta status, penyedia, sistem, alamat, dan pemiliknya](../../assets/servers/servers-list.webp 'Server: satu baris per server, dengan status, penyedia dan region, rilis Ubuntu, alamat, serta siapa yang membuatnya.')

Daftar ini terbuka sebagai tabel. Beralihlah ke **Tampilan Grid Kartu** untuk melihat pemakaian CPU, memori, dan disk secara langsung di kartu setiap server. Kotak pencarian tidak membedakan huruf besar dan kecil, dan kolom pemilik menyebut nama orang yang membuat setiap server.

## Tiga cara menambah server

Buka **Server**, lalu **Buat Server**. Meluncurkan dan menghubungkan dibandingkan di bawah. Cara ketiga, untuk mesin yang tidak bisa dijangkau dari internet, seperti PC di rumah, adalah [mendaftarkan mesin privat](./register-a-private-machine.md).

![Halaman Buat Server dengan pilihan meluncurkan server cloud atau menghubungkan server sendiri](../../assets/servers/create-choose-path.webp)

|                        | Luncurkan server cloud                                                                 | Hubungkan server Anda                     |
| ---------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| Cocok untuk            | Anda butuh mesin baru dan punya akun cloud                                             | Anda sudah punya mesin yang berjalan      |
| Penyedia               | AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio, Alibaba Cloud, Tencent Cloud | Server Ubuntu atau Debian apa pun via SSH |
| Yang dikerjakan dPanel | Membuat mesin, lalu menyiapkannya                                                      | Masuk lewat SSH, lalu menyiapkannya       |
| Yang Anda butuhkan     | Akun cloud dan SSH key di dPanel                                                       | SSH key dan alamat server                 |
| Waktu                  | Sekitar 10 sampai 20 menit                                                             | Sekitar 5 menit                           |

Apa pun jalurnya, dPanel memasang agennya dan mulai memantau mesin itu. Server yang diluncurkan dPanel menjalankan Ubuntu 24.04 LTS atau 26.04 LTS.

## Langkah berikutnya

- Baru memakai dPanel? Mulai dari [Sebelum mulai](./before-you-start.md).
- Meluncurkan mesin baru: [Membuat server cloud](./cloud-providers/create-a-cloud-server.md).
- Membawa mesin sendiri: [Menghubungkan server Anda](./connect-your-own-server.md).
- Sudah punya server: [Halaman server Anda](./your-server-page.md) menjelaskan setiap tab.
- Mengatur port mana yang bisa dijangkau: [Firewall](./firewall.md).
- Banyak server sekaligus, atau klaster Kubernetes: [Grup server dan klaster](../clusters/overview.md).

Anda juga bisa meminta **Ask dPanel** memeriksa server atau memasang sesuatu di dalamnya; lihat [Kumpulan prompt](../ai/prompt-cookbook.md).

## Yang dipasang dPanel di mesin

Kalau Anda merawat server, inilah yang diubah oleh penyiapan:

| Apa            | Di mana                                                                         |
| -------------- | ------------------------------------------------------------------------------- |
| Program agen   | `/opt/dpanel/bin/dpanel-agent`, berjalan sebagai layanan systemd `dpanel-agent` |
| Pengaturannya  | `/opt/dpanel/etc/environment`                                                   |
| Datanya        | `/opt/dpanel/var/lib/agent`                                                     |
| Pengguna Linux | `dpanel`, dengan `sudo` tanpa kata sandi, di server yang disiapkan lewat SSH    |

Aplikasi berada di satu folder per aplikasi, yang tampil sebagai **Direktori kerja** di tab **Pengaturan** aplikasi, dan berjalan sebagai layanan systemd.

## Pertanyaan yang sering diajukan

### Apakah dPanel yang menyediakan servernya?

Tidak. Server cloud berjalan di akun Anda sendiri di penyedia, yang menagih Anda langsung. Server yang Anda hubungkan tetap berjalan di tempatnya semula.

### Sistem operasi apa yang dibutuhkan server?

Server yang diluncurkan dPanel menjalankan Ubuntu 24.04 LTS atau 26.04 LTS. Server yang Anda hubungkan bisa menjalankan Ubuntu atau Debian.

### Bisakah server dikelola dari terminal?

Bisa. CLI `dnocs` bisa menampilkan daftar server, menjalankan penyiapan lagi, memasang modul, dan mengelola firewall. Lihat [AI di terminal](../ai/ai-in-the-terminal.md).

### Apa itu agen, dan amankah kalau dihapus?

Agen adalah program dPanel di server. Agen melaporkan pemakaian dan menjalankan tugas yang Anda mulai. Tanpa agen, halaman server kosong dan tugas gagal; **Instal ulang** di tab **Pengaturan** memasangnya kembali. Saat agen berhenti melapor atau ada pembaruan, halaman server memberi tahu apa yang perlu dilakukan. Lihat [Pemberitahuan agen](./your-server-page.md#pemberitahuan-agen).
