---
title: Load balancer
description: Pasang satu alamat HTTPS publik di depan aplikasi, dari domain sampai situs berjalan.
sidebar_position: 1
sidebar_icon: network
---

Load balancer adalah pintu depan. Ia menerima lalu lintas yang datang ke domain Anda, mengurus sertifikat HTTPS, lalu meneruskan setiap request ke aplikasi atau ke port di sebuah server.

dPanel membangunnya di salah satu server Anda sendiri, yaitu **gateway**, dan memasang mesin web server (Caddy) di sana.

Halaman ini mengikuti percobaan sungguhan: aplikasi demo **Go Example Docs** dipublikasikan di `docs-demo.terpusat.me` lewat gateway `dpanel-idch-test-01`.

## Yang perlu disiapkan

- **Server yang sudah siap** sebagai gateway, dengan port 80 dan 443 bisa dijangkau dari internet. Server yang diluncurkan dPanel sudah membukanya. Lihat [Server](../servers/overview.md).
- **Domain.** Tambahkan zonanya ke dPanel di **Domain & DNS** agar dPanel bisa membuat record-nya ([Domain dan DNS](./domains-and-dns.md)), atau pakai hostname yang Anda kelola sendiri.
- **Tujuan lalu lintas**: [aplikasi](../applications/overview.md) dPanel, atau layanan yang mendengarkan sebuah port.

:::warning[Pakai nama yang belum dipakai]
Dengan domain terkelola, dPanel membuat record DNS baru. dPanel menolak subdomain yang sudah punya record, jadi record yang ada tidak pernah tertimpa. Pakai nama baru, misalnya `docs-demo`.
:::

## Membuat load balancer

Buka **Load Balancers** di sidebar, lalu tekan **Create a load balancer**. Formulirnya punya tiga langkah bernomor. Panel tinjauan **Load balancer** di kanan menghitung apa yang masih kurang.

### Langkah 1: Gateway

1. Di **Gateway Server**, pilih server yang akan menjawab lalu lintas publik. Hanya server berstatus **ready** yang bisa melayani.
2. Di **Web Server Engine**, pilih **Caddy Server**. Kalau server sudah melaporkannya, ia muncul di **Reported on selected gateway** sebagai **Installed**. Kalau belum, cari di **Install infrastructure modules** lalu pasang.

![Langkah 1: Gateway, dengan dpanel-idch-test-01 terpilih dan Caddy Server sudah terpasang](../../assets/networking/lb-create-gateway.webp)

### Langkah 2: Domain and HTTPS

1. Di **Domain Name**, pilih modenya:
   - **Managed**: ketik **Subdomain**, lalu **Select domain** dari domain Anda di **Domain & DNS**. dPanel membuat record DNS-nya.
   - **External**: ketik hostname yang Anda kelola sendiri, lalu arahkan DNS-nya ke alamat gateway.
2. Di **Protocol & Features**, biarkan **HTTP / HTTPS** untuk situs dan API.
3. Biarkan **SSL Enabled** menyala. dPanel meminta sertifikat dan memperpanjangnya.

![Langkah 2: domain terkelola docs-demo.terpusat.me, HTTP / HTTPS, SSL menyala](../../assets/networking/lb-create-domain.webp)

### Langkah 3: Routing

1. Di **LB Type Allocation**, pilih **L7** untuk situs dan API. L7 merutekan berdasarkan path URL. **L4** meneruskan port TCP atau UDP mentah, misalnya basis data, tanpa melihat path.
2. Di **Upstream Rules Configuration**, atur **Rule #01**:
   - **Type**: **Application** mengirim lalu lintas ke aplikasi dPanel. **Proxy Pass** mengirimnya ke alamat dan port.
   - **Matching Path**: `/*` menangkap semua request. Path yang berakhiran `/*` diberi lencana **Wildcard**.
   - **Application**: pilih aplikasinya, di sini **Go Example Docs**. dPanel memakai server dan port aplikasi itu.
3. Tekan **Add New Rule** untuk mengirim path lain ke tujuan lain, misalnya `/api/*`.

![Langkah 3: aturan L7 yang mengirim /* ke aplikasi Go Example Docs](../../assets/networking/lb-create-routing.webp)

### Buat

Saat panel tinjauan bertuliskan **Ready to create**, 6/6, tekan **Create load balancer**.

![Panel tinjauan bertuliskan Ready to create, 6/6](../../assets/networking/lb-create-review.webp)

## Setelah itu

Anda kembali ke daftar dengan pesan **Load balancer created successfully.** Kartunya berstatus **In Progress** selama dPanel:

1. Membuat record DNS. Untuk domain terkelola, ini record `A` dari host ke alamat publik gateway.
2. Memasang Caddy di gateway kalau belum ada.
3. Menerbitkan rute dan meminta sertifikat HTTPS.

Di percobaan kami, prosesnya sekitar satu menit. Kartunya lalu berstatus **Ready**, dan penghitung memindahkannya ke **Serving traffic**.

![Daftar Load balancer dengan docs-demo.terpusat.me berstatus Ready, rutenya ke Application #20, dan konfigurasinya](../../assets/networking/lb-list.webp)

## Memastikan sudah aktif

Buka host-nya di browser, atau periksa dari terminal:

```bash
curl -sI https://docs-demo.terpusat.me
```

Load balancer yang aktif menjawab seperti ini:

```text
HTTP/2 200
alt-svc: h3=":443"; ma=2592000
content-type: text/html; charset=utf-8
server: dPanel
```

Tanda load balancer yang sehat:

| Pemeriksaan | Hasil kami                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------- |
| DNS         | `docs-demo.terpusat.me` mengarah ke gateway, `103.183.75.207`                                   |
| HTTP biasa  | `308 Permanent Redirect` ke alamat `https://`                                                   |
| HTTPS       | `HTTP/2 200`, dilayani oleh aplikasi                                                            |
| Sertifikat  | Diterbitkan Let's Encrypt untuk `docs-demo.terpusat.me`, berlaku 90 hari, diperpanjang otomatis |
| Protokol    | HTTP/2, ditambah HTTP/3 (QUIC) yang diumumkan lewat `alt-svc`                                   |

:::tip[Nama baru kadang butuh semenit]
Kalau `curl` bilang host tidak ditemukan tepat setelah dibuat, resolver Anda mungkin menyimpan jawaban "tidak ada" dari sebelumnya. Tunggu beberapa menit, atau uji dengan resolver publik.
:::

## Halaman detail

Pilih load balancer di daftar untuk membuka halamannya. Bagian kepalanya menampilkan status, layer, mesin, protokol, jumlah rute, gateway, dan waktu pembaruan terakhir.

| Tab           | Kegunaannya                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------- |
| **Graph**     | Mengikuti request dari domain ke load balancer, gateway, rute, dan tujuannya                      |
| **Upstreams** | Melihat semua backend berurutan, dengan path, tujuan, dan port-nya. **Add backend** menambah satu |
| **Logs**      | Membaca request yang ditangani gateway                                                            |
| **Config**    | Menyalakan atau mematikan **Enable SSL** dan **Enable Cloudflare proxy**                          |

![Tab Graph: domain, load balancer, mesin gateway, dan aplikasi tujuan](../../assets/networking/lb-detail-graph.webp)

![Tab Upstreams dengan satu backend: /* ke Go Example Docs di port 9307](../../assets/networking/lb-detail-upstreams.webp)

Perubahan di **Upstreams** dan **Config** masih berupa draf sampai Anda menekan **Save**. Menyimpan memperbarui definisi routing dan menjalankan ulang setup gateway. **Reset draft** membuang drafnya.

![Tab Config dengan Enable SSL dan Enable Cloudflare proxy](../../assets/networking/lb-detail-config.webp)

## Log load balancer

Tab **Logs** menampilkan request yang sampai ke gateway, dengan judul **Load balancer requests**. Request yang sama juga muncul di tab **Log** aplikasi, pada sumber **Load balancer**. Lihat [Log aplikasi](../applications/application-logs.md).

![Tab Logs: rentang waktu, saringan, unduhan, dan tombol muat ulang di atas tabel request](../../assets/networking/lb-detail-logs.webp)

- **Rentang waktu**: bawaannya 10 menit terakhir. Pilih preset sampai 10 hari terakhir, atau rentang khusus dalam 10 hari terakhir.
- **Halaman**: 200 baris per halaman, terbaru lebih dulu. Bagian bawahnya bertuliskan, misalnya, **Lines 1–200 of 201, newest first**, lengkap dengan tombol halaman.
- **Unduh**: halaman ini saja, atau semua baris dalam rentang waktu itu, sebagai berkas `.log`.
- **Muat ulang** mengambil baris terbaru. **Muat ulang otomatis** mati secara bawaan; nyalakan untuk setiap 30 detik, setiap menit, atau setiap 5 menit.

Kontrol bersama ini dijelaskan di [Rentang waktu dan pembaruan](../logs/time-range-and-refresh.md) dan [Mengunduh log](../logs/download-logs.md).

## Memindahkan atau menghapus

Dari menu ⋯ di kartu pada daftar:

- **Migrate Ownership** memindahkan load balancer ke workspace lain.
- **Delete** meminta konfirmasi di dialog **Delete Load Balancer**.

Penghapusan berlangsung dua tahap. Tahap pertama mencabut rute dari gateway, dan kartunya berstatus **Deleted**. Selama berstatus itu, Anda bisa **Restore**, atau menghapusnya sekali lagi untuk membuangnya permanen bersama playbook yang dibuatnya. Aplikasi dan server gateway tetap berjalan.

:::warning[Periksa record DNS-nya]
Periksa di penyedia DNS apakah record buatan dPanel masih ada setelah penghapusan, lalu hapus lewat [Domain dan DNS](./domains-and-dns.md) kalau namanya sudah tidak dipakai.
:::

:::note
Server yang masih menjadi gateway load balancer tidak bisa dihapus. Hapus load balancer-nya lebih dulu.
:::
