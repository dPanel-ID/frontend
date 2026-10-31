---
title: Domain dan DNS
description: Biarkan dPanel mengelola record DNS domain milik Anda, lewat penyedia DNS yang sudah Anda pakai.
sidebar_position: 2
---

dPanel tidak menjual atau memindahkan domain. Anda tetap membeli domain di tempat biasa. Yang dibutuhkan dPanel hanyalah akses ke penyedia yang menjawab DNS domain itu, agar dPanel bisa membuat record yang mengarahkan sebuah nama ke server Anda.

## Yang perlu disiapkan

- Domain yang DNS-nya di-host di **Cloudflare** atau **DigitalOcean**.
- Token API dari penyedia tersebut yang boleh membaca dan mengubah record DNS zona itu.

:::tip
Gunakan token dengan cakupan terbatas. Di Cloudflare, token khusus "DNS edit" untuk satu zona itu sudah cukup.
:::

![Halaman Domain & DNS dengan dua domain yang dikelola lewat Cloudflare](../../assets/networking/domains-list.webp 'Domain & DNS: setiap kartu menampilkan penyedia DNS, siapa yang bisa memakainya, dan record wildcard-nya.')

## Menambahkan domain

1. Buka **Domain & DNS** di sidebar.
2. Tekan **Tambah domain**.
3. **Domain**: zona yang ingin dikelola dPanel, misalnya `example.com`. Subdomain juga bisa.
4. **Deskripsi**: opsional. Catatan untuk rekan setim, misalnya "Domain marketing produksi".
5. **Provider**: pilih tempat zona itu di-host.
6. **Token API**: tempel token dari penyedia.
7. Ketika ringkasan menunjukkan **Siap ditambahkan**, tekan **Tambah domain**.

![Formulir Tambah Domain berisi domain, provider, dan token API](../../assets/networking/domain-create.webp 'Token hanya dikirim sekali saat formulir dikirim. Ringkasan tidak pernah menampilkannya.')

## Langkah berikutnya

dPanel membaca zona itu terlebih dahulu dan menampilkan record yang sudah ada. Tidak ada yang diubah sampai domain itu dipakai, misalnya sebagai domain **Terkelola** pada load balancer.

## Melihat dan menghapus record

1. Di daftar, buka domain lewat **Detil**.
2. **Detil Domain** menampilkan setiap record beserta tipe, nama, isi, dan TTL-nya.
3. Untuk menghapus record, tekan ikon tempat sampah di barisnya lalu konfirmasi **Hapus Catatan Domain**.

Tidak ada formulir untuk menambah record secara manual. dPanel membuat record sendiri ketika sebuah load balancer memakai domain tersebut. Lihat [Load balancer](./load-balancers.md).

:::warning
Menghapus record langsung berlaku di penyedia DNS Anda. Apa pun yang masih memakai nama itu tidak akan bisa diakses lagi.
:::

## Membagikan, memindahkan, atau menghapus domain

- Domain yang ditambahkan di ruang kerja tim otomatis dibagikan ke tim itu.
- **Pindah Pemilik** di menu baris memindahkannya ke ruang kerja lain.
- **Hapus** mengeluarkan domain dari dPanel setelah Anda mengonfirmasi **Hapus Domain**.
