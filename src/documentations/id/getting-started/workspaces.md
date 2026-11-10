---
title: Ruang kerja
description: Cara kerja ruang kerja di dPanel: ruang kerja personal, ruang kerja tim bersama, dan cara berpindah agar Anda melihat server dan aplikasi yang tepat.
sidebar_position: 2
sidebar_icon: building-2
---

Ruang kerja di dPanel adalah batas yang mengelilingi sekumpulan server, aplikasi, load balancer, domain, akun cloud, dan kunci SSH. Anda hanya melihat isi ruang kerja yang sedang aktif, dan Anda berpindah ruang kerja dari bagian atas sidebar.

## Dua jenis ruang kerja

| Jenis    | Siapa yang bisa melihat | Cocok untuk                              |
| -------- | ----------------------- | ---------------------------------------- |
| Personal | Hanya Anda              | Mencoba-coba, proyek sampingan           |
| Tim      | Semua anggota tim       | Server dan aplikasi yang dipakai bersama |

Setiap akun punya ruang kerja personal. Ruang kerja tim sama dengan tim: membuat tim berarti membuat ruang kerjanya. Lihat [Tim](../teams/teams.md).

## Berpindah ruang kerja

Ruang kerja yang aktif tampil di bagian atas sidebar, di bawah logo dnocs.

1. Tekan nama ruang kerja di bagian atas sidebar.
2. Di **Pilih ruang kerja**, cari yang Anda inginkan. Tab **Semua**, **Personal**, dan **Tim** menyaring daftar, dan kolom pencarian menemukan ruang kerja berdasarkan nama, tanpa membedakan huruf besar dan kecil. Ruang kerja yang sedang dipakai ditandai **Aktif**.
3. Tekan barisnya. dPanel memuat ulang data untuk ruang kerja tersebut.

![Dialog Pilih ruang kerja yang menampilkan ruang kerja personal dan tim](../../assets/getting-started/workspace-picker.webp 'Pilih ruang kerja menampilkan semua ruang kerja Anda, beserta peran Anda di masing-masing.')

dPanel mengingat pilihan Anda di browser ini. Lain kali Anda membuka dPanel di browser yang sama, Anda kembali ke ruang kerja yang sama.

:::note
Berpindah ruang kerja mengubah isi semua halaman. Kalau server atau aplikasi tampak hilang, periksa dulu nama ruang kerja di sidebar.
:::

## Dari dialog yang sama

- **Ruang kerja baru** membuat ruang kerja tim. Lihat [Membuat tim](../teams/teams.md#membuat-tim).
- Ikon orang di ujung baris tim (**Kelola ruang kerja**) membuka halaman anggota tim tersebut.

## Resource tetap di ruang kerjanya

Server, aplikasi, load balancer, domain, akun cloud, atau kunci SSH tetap berada di ruang kerja tempat ia dibuat. Aplikasi web tidak memindahkan resource antar ruang kerja, jadi pindahlah ke ruang kerja yang benar sebelum membuat sesuatu. Untuk berbagi pekerjaan dengan orang lain, buat resource-nya di [ruang kerja tim](../teams/teams.md).

## Pertanyaan yang sering diajukan

### Di mana ruang kerja pribadi saya?

Di baris paling atas **Pilih ruang kerja**, atau di tab **Personal**. Setiap akun memilikinya.

### Bisakah server atau aplikasi dipindah ke ruang kerja lain?

Umumnya tidak. Server bisa dipindahkan satu kali, dari ruang kerja pribadi ke tim, dengan `dnocs transfer server --id <ID server> --to "<nama tim>"`. Tambahkan `--include-dependencies` untuk ikut memindahkan kunci SSH dan proyek cloud-nya. Selain itu tetap berada di tempat ia dibuat, jadi buat ulang di ruang kerja yang benar, lalu hapus yang lama.

### Mengapa kartu Worker di profil berubah saat saya berpindah ruang kerja?

Setiap ruang kerja memilih tempat pekerjaannya dijalankan: di worker bersama milik dPanel atau di worker privat. Profil menampilkan pilihan untuk ruang kerja yang sedang Anda pakai. Lihat [Worker](../workers/overview.md).
