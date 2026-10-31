---
title: Ruang kerja
description: Ruang kerja personal, ruang kerja tim, dan cara berpindah di antaranya.
sidebar_position: 2
sidebar_icon: building-2
---

Semua yang ada di dPanel berada di dalam sebuah ruang kerja: server, aplikasi, load balancer, domain, akun cloud, dan kunci SSH. Ruang kerja adalah batas akses. Anda hanya melihat isi ruang kerja yang sedang aktif.

## Dua jenis ruang kerja

| Jenis    | Siapa yang bisa melihat | Cocok untuk                              |
| -------- | ----------------------- | ---------------------------------------- |
| Personal | Hanya Anda              | Mencoba-coba, proyek sampingan           |
| Tim      | Semua anggota tim       | Server dan aplikasi yang dipakai bersama |

Setiap akun punya ruang kerja personal. Ruang kerja tim sama dengan tim: membuat tim berarti membuat ruang kerjanya. Lihat [Tim](../teams/teams.md).

## Berpindah ruang kerja

Ruang kerja yang aktif tampil di bagian atas sidebar, di bawah logo dnocs.

1. Tekan nama ruang kerja di bagian atas sidebar.
2. Di **Pilih ruang kerja**, cari yang Anda inginkan. Tab **Terbaru**, **Semua**, **Personal**, dan **Tim** menyaring daftar, dan kolom pencarian menemukan ruang kerja berdasarkan nama.
3. Tekan barisnya. dPanel memuat ulang data untuk ruang kerja tersebut.

![Dialog Pilih ruang kerja yang menampilkan ruang kerja personal dan tim](../../assets/getting-started/workspace-picker.webp 'Pilih ruang kerja menampilkan semua ruang kerja Anda, beserta peran Anda di masing-masing.')

dPanel mengingat pilihan Anda di browser ini. Lain kali Anda membuka dPanel di browser yang sama, Anda kembali ke ruang kerja yang sama.

:::note
Berpindah ruang kerja mengubah isi semua halaman. Kalau server atau aplikasi tampak hilang, periksa dulu nama ruang kerja di sidebar.
:::

## Dari dialog yang sama

- **Ruang kerja baru** membuat ruang kerja tim. Lihat [Membuat tim](../teams/teams.md#membuat-tim).
- Ikon orang di ujung baris tim (**Kelola ruang kerja**) membuka halaman anggota tim tersebut.

## Memindahkan resource antar ruang kerja

Server, aplikasi, load balancer, domain, akun cloud, dan kunci SSH bisa dipindahkan ke ruang kerja lain. Pakai **Pindah Pemilik** di menu item tersebut, atau **Pindahkan kepemilikan** di tab **Pengaturan** server. Lihat [Memindahkan resource ke ruang kerja lain](../teams/members-and-roles.md#memindahkan-resource-ke-ruang-kerja-lain).
