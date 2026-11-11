---
title: Server di dPanel
description: Server di dPanel adalah mesin Linux yang dikelola untuk Anda, seperti server rumahan atau VPS yang dihubungkan dengan agen dPanel, VM yang diluncurkan di AWS, Google Cloud, DigitalOcean, dan lainnya, atau server yang dihubungkan lewat SSH.
sidebar_position: 1
sidebar_icon: server
sidebar_label: Apa itu server di dPanel
---

Server di dPanel adalah satu mesin Linux yang dirawat control panel ini untuk Anda: mesin yang sudah Anda punya (server rumahan, PC homelab, Raspberry Pi, atau VPS) lalu Anda hubungkan dengan satu perintah, atau VPS yang diluncurkan dPanel di akun cloud Anda sendiri (AWS EC2, Google Compute Engine, Droplet DigitalOcean, IDCloudHost, Alibaba Cloud ECS, atau Tencent Cloud CVM).

VPS (virtual private server) adalah komputer Linux sewaan di pusat data. Di setiap server, dPanel menjalankan program kecil, yaitu **agen**, yang melaporkan kesehatan server dan menjalankan tugas yang Anda mulai. Belum kenal istilahnya? Lihat [Glosarium](../getting-started/glossary.md).

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

Buka **Server**, lalu **Buat Server**. Cara yang direkomendasikan, untuk server apa pun yang sudah Anda punya, adalah menghubungkannya dengan agen dPanel: Anda menjalankan satu perintah di server, lalu agen terhubung keluar ke dPanel. dPanel tidak perlu masuk ke server Anda, jadi Anda tidak perlu memercayakan SSH key, membuka port, atau bahkan punya IP publik. Mulai di sini: [Hubungkan server dengan agen dPanel](./register-a-private-machine.md).

![Halaman Buat Server dengan pilihan meluncurkan server cloud atau menghubungkan server sendiri](../../assets/servers/create-choose-path.webp)

|                    | Hubungkan dengan agen dPanel (direkomendasikan)       | Luncurkan server cloud                                                                 | Hubungkan lewat SSH                       |
| ------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| Cocok untuk        | Anda sudah punya server: VPS, PC di rumah, VM         | Anda butuh mesin baru dan punya akun cloud                                             | Anda lebih suka dPanel masuk sendiri      |
| Penyedia           | Server Linux apa pun dengan systemd                   | AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio, Alibaba Cloud, Tencent Cloud | Server Ubuntu atau Debian apa pun via SSH |
| Yang terjadi       | Anda menjalankan satu perintah; agen terhubung keluar | dPanel membuat mesin; mesin bergabung lewat agen dengan sendirinya, atau lewat SSH     | dPanel masuk dengan SSH key miliknya      |
| Yang Anda butuhkan | Terminal di server dengan `sudo`                      | Akun cloud di dPanel                                                                   | SSH key dan IP publik                     |
| Waktu              | Sekitar satu menit                                    | Sekitar 10 sampai 20 menit                                                             | Sekitar 5 menit                           |

Apa pun jalurnya, server menjalankan agen dPanel dan dPanel mulai memantaunya. Server yang diluncurkan dPanel menjalankan Ubuntu 24.04 LTS atau 26.04 LTS. Server cloud baru bergabung lewat agen secara bawaan di AWS, Google Cloud, DigitalOcean, IDCloudHost, dan Tencent Cloud; Anda bisa memilih SSH di formulirnya. Biznet Gio dan Alibaba Cloud untuk saat ini bergabung lewat SSH.

Bingung memilih agen atau SSH? Lihat [Agen dPanel atau SSH: pilih yang mana?](./register-a-private-machine.md#agen-dpanel-atau-ssh-pilih-yang-mana).

## Langkah berikutnya

- Membawa server yang sudah Anda punya, seperti server rumahan atau VPS, dengan cara yang direkomendasikan: [Hubungkan server dengan agen dPanel](./register-a-private-machine.md).
- Berbagi mesin homelab dengan tim: [Berbagi homelab dengan tim](../tutorials/team-homelab.md).
- Yang perlu disiapkan untuk server cloud atau SSH: [Sebelum mulai](./before-you-start.md).
- Meluncurkan mesin baru: [Membuat server cloud](./cloud-providers/create-a-cloud-server.md).
- Membiarkan dPanel masuk lewat SSH: [Menghubungkan server Anda lewat SSH](./connect-your-own-server.md).
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
| Pengguna Linux | Satu untuk akun dPanel Anda; di server yang disiapkan lewat SSH juga `dpanel`, dengan `sudo` tanpa kata sandi |

Aplikasi berada di satu folder per aplikasi, yang tampil sebagai **Direktori kerja** di tab **Pengaturan** aplikasi, dan berjalan sebagai layanan systemd.

## Pertanyaan yang sering diajukan

### Apakah dPanel yang menyediakan servernya?

Tidak. Server cloud berjalan di akun Anda sendiri di penyedia, yang menagih Anda langsung. Server yang Anda hubungkan tetap berjalan di tempatnya semula.

### Sistem operasi apa yang dibutuhkan server?

Server yang diluncurkan dPanel menjalankan Ubuntu 24.04 LTS atau 26.04 LTS. Server yang Anda hubungkan dengan agen dPanel bisa menjalankan Linux apa pun dengan systemd, di Intel/AMD (`amd64`) atau ARM (`arm64`). Server yang Anda hubungkan lewat SSH harus menjalankan Ubuntu atau Debian.

### Bisakah server dikelola dari terminal?

Bisa. CLI `dnocs` bisa menghubungkan mesin (`sudo dnocs machine register`), meluncurkan server cloud (`dnocs server create-cloud`), menampilkan daftar server, menjalankan penyiapan lagi, memasang modul, dan mengelola firewall. Lihat [AI di terminal](../ai/ai-in-the-terminal.md).

### Apa itu agen, dan amankah kalau dihapus?

Agen adalah program dPanel di server. Agen melaporkan pemakaian dan menjalankan tugas yang Anda mulai. Tanpa agen, halaman server kosong dan tugas gagal; **Instal ulang** di tab **Pengaturan** memasangnya kembali. Saat agen berhenti melapor atau ada pembaruan, halaman server memberi tahu apa yang perlu dilakukan. Lihat [Pemberitahuan agen](./your-server-page.md#pemberitahuan-agen).

### Amankah menghubungkan server rumahan saya?

Aman. Dengan agen dPanel, tidak ada yang masuk ke jaringan rumah Anda: agen yang terhubung keluar ke dPanel, dan dPanel tidak pernah mendapat akses SSH Anda. Menghapus server di dPanel langsung mencabut akses agen. Lihat [Mengapa agen menjadi pilihan utama](./register-a-private-machine.md#mengapa-agen-menjadi-pilihan-utama).
