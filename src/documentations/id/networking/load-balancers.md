---
title: Load balancer
description: Pasang satu alamat publik ber-HTTPS di depan aplikasi dan server Anda.
sidebar_position: 1
---

Load balancer adalah pintu depan. Ia menerima trafik yang datang ke domain Anda, mengurus sertifikat HTTPS, lalu meneruskan setiap request ke aplikasi atau ke port tertentu di server.

dPanel membangunnya di salah satu server milik Anda sendiri, yaitu **gateway**. Mesin web server-nya dipasangkan oleh dPanel.

## Yang perlu disiapkan

- Server yang sudah siap untuk dijadikan gateway, dengan port publik 80 dan 443 terbuka. Lihat [Server](../servers/overview.md).
- Sebuah nama domain. Bisa domain yang Anda kelola sendiri di tempat lain, atau domain yang sudah ditambahkan ke dPanel di **Domain & DNS** (lihat [Domain dan DNS](./domains-and-dns.md)).
- Tujuan trafiknya: sebuah aplikasi, atau layanan yang mendengarkan di suatu port.

![Halaman Load balancer dengan penjelasan singkat dan daftar yang masih kosong](../../assets/networking/lb-list.webp 'Load balancer: apa fungsinya, lalu daftar milik Anda.')

## Membuat load balancer

Buka **Load Balancer** di sidebar, lalu tekan **Buat load balancer**. Formulirnya terdiri dari tiga bagian bernomor, dengan panel ringkasan di kanan yang terisi seiring Anda mengisi formulir.

![Formulir Buat load balancer dengan bagian gateway, domain, dan routing](../../assets/networking/lb-create.webp 'Panel ringkasan di kanan menghitung apa saja yang masih kurang.')

### 1. Gateway

1. Di **Server Gateway**, pilih server yang akan menjawab trafik publik.
2. Di **Mesin Web Server**, pilih modul mesinnya. Kalau server sudah melaporkan salah satunya, mesin itu tampil di **Dilaporkan di gateway terpilih**. Kalau belum, pilih dari katalog lalu tekan **Instal**.

### 2. Domain dan HTTPS

1. Di **Nama Domain**, pilih modenya:
   - **Eksternal**: ketik hostname yang Anda kelola sendiri, lalu arahkan record DNS-nya ke alamat server gateway.
   - **Terkelola**: ketik **Subdomain** lalu **Pilih domain** dari domain yang ada di **Domain & DNS**. dPanel membuatkan record DNS-nya.
2. Di **Protokol & Fitur**, biarkan **HTTP / HTTPS** untuk situs web dan API.
3. Aktifkan **SSL Diaktifkan** untuk melayani HTTPS. dPanel meminta sertifikatnya dan memperpanjangnya otomatis.

### 3. Routing

1. Di **Alokasi Jenis LB**, pilih lapisannya:
   - **L7** untuk situs web dan API. Routing berdasarkan path URL.
   - **L4** untuk TCP atau UDP mentah, misalnya port basis data. Tanpa pemeriksaan path.
2. Untuk L7, setiap aturan di **Konfigurasi Aturan Upstream** berisi:
   - **Tipe**: **Aplikasi** mengirim trafik ke salah satu aplikasi dPanel Anda. **Proxy Pass** mengirimnya ke alamat dan port tertentu.
   - **Pola Jalur URL**: request mana yang ditangani aturan ini, misalnya `/api/*`. Path yang berakhiran `/*` mencakup semua di bawahnya, dan aturannya diberi lencana **Wildcard**.
   - **Tujuan**: aplikasinya, atau alamat dan port-nya. **Tambah Tujuan** menambah target lain untuk berbagi beban.
3. Tekan **Tambah Aturan Baru** untuk path lainnya.

Ketika panel ringkasan menunjukkan **Siap dibuat**, tekan **Buat load balancer**.

## Langkah berikutnya

dPanel memasang mesinnya di server gateway bila belum ada, lalu menerbitkan rutenya. Hitungan di atas daftar memindahkannya dari **Sedang disiapkan** ke **Melayani trafik**, atau ke **Perlu perhatian** kalau ada yang gagal. Setelah siap, buka domain Anda di browser.

## Merawat load balancer

Buka load balancer dari daftar untuk melihat halaman detailnya.

| Tab             | Gunanya                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| **Graf**        | Menelusuri perjalanan request dari domain ke gateway, aturan rute, sampai target akhirnya            |
| **Upstream**    | Melihat semua backend sesuai urutannya. **Tambah backend** menambah, **Hapus backend** menghapus     |
| **Log**         | Membaca request di gateway. Pilih **Semua request** atau **Error saja**. Bawaannya 10 menit terakhir |
| **Konfigurasi** | Menyalakan atau mematikan **Aktifkan SSL** dan **Aktifkan proxy Cloudflare**                         |

Perubahan di **Upstream** dan **Konfigurasi** masih berupa draft sampai Anda menekan **Simpan perubahan**. Menyimpan berarti menjalankan ulang penyiapan gateway. **Reset draft** membuang draft.

:::tip
Request yang sampai ke aplikasi lewat load balancer juga tampil di tab **Log** aplikasi tersebut, pada sumber **Load balancer**. Lihat [Log aplikasi](../applications/application-logs.md).
:::

## Memindahkan atau menghapus

- **Pindah Pemilik** di menu baris memindahkan load balancer ke ruang kerja lain.
- **Hapus** meminta konfirmasi. Rutenya berhenti melayani. Aplikasi dan server gateway tetap berjalan.

:::warning
Server yang masih menjadi gateway sebuah load balancer tidak bisa dihapus. Hapus load balancer-nya terlebih dahulu.
:::
