---
title: Profil publik
description: Setiap pengguna dPanel punya halaman profil di /u/username. dPanel menampilkan orang dengan namanya di daftar dan menautkannya ke profil itu, bukan ke email.
sidebar_position: 3
sidebar_icon: users
---

Setiap pengguna dPanel punya halaman profil publik di `/u/<username>`, misalnya `/u/jane`. Di mana pun dPanel menampilkan seseorang, seperti siapa yang menjalankan build atau siapa pemilik server, dPanel menampilkan nama dan avatarnya serta menautkannya ke halaman itu, bukan alamat email atau ID pengguna.

![Sebuah halaman profil publik: avatar, nama tampilan, username, dan tanggal bergabung](../../assets/teams/public-profile.webp 'Profil menampilkan nama, username, avatar, dan tanggal bergabung. Tidak lebih.')

## Isi sebuah profil

| Ditampilkan                   | Tidak pernah ditampilkan |
| ----------------------------- | ------------------------ |
| Nama tampilan dan `@username` | Alamat email             |
| Avatar                        | Ruang kerja dan peran    |
| Tanggal **Joined**            | Server, aplikasi         |

Profil bisa dibuka oleh siapa pun yang sudah masuk ke dPanel. Server, aplikasi, dan tim Anda tetap privat di ruang kerja masing-masing.

## Di mana nama muncul

Pilih nama mana pun untuk membuka profil orang itu.

| Halaman                  | Siapa yang disebut                                 |
| ------------------------ | -------------------------------------------------- |
| Sebuah aplikasi          | Siapa yang menjalankan setiap build dan merilisnya |
| Aplikasi, Server         | Pemilik masing-masing, atau timnya                 |
| Load balancer, Domain    | Pemiliknya                                         |
| Cloud project, kunci SSH | Pemiliknya                                         |
| Aktivitas dashboard      | Siapa yang melakukan setiap aksi terbaru           |
| Run grup server          | Siapa yang memulai run                             |

Untuk build, lihat [Rilis dan rollback](../applications/deployments-and-rollback.md#siapa-yang-menjalankan-setiap-build).

## Membuka profil

1. Pilih nama seseorang di mana saja di dPanel.
2. Atau ketik alamatnya sendiri: `https://dnocs.devetek.app/u/` diikuti username-nya. Huruf besar dan kecil tidak dibedakan.

Jika tidak ada yang memakai username itu, halaman menampilkan **No one goes by @username**. Periksa ejaannya; orang itu juga mungkin sudah menggantinya.

## Pertanyaan yang sering diajukan

### Bisakah orang lain melihat email saya di profil?

Tidak. Profil tidak pernah menampilkan alamat email. Rekan satu tim hanya melihat email Anda di daftar **Anggota** sebuah tim.

### Siapa yang bisa membuka profil saya?

Siapa pun yang sudah masuk ke dPanel dan tahu username Anda. Profil hanya menampilkan nama, username, avatar, dan tanggal bergabung.

### Dari mana nama dan avatar saya berasal?

Dari akun dPanel Anda. Ubah nama lengkap atau avatar dengan **Ubah profil** di halaman **Profil**; username dan email tidak bisa diubah di sana. Lihat [Masuk dan profil Anda](../getting-started/sign-in.md#mengubah-nama-avatar-atau-password).

### Mengapa sebuah daftar menampilkan nama tim, bukan orang?

Di **Aplikasi** dan beberapa daftar lain, resource milik tim menampilkan nama tim sebagai pemiliknya. Buka resource-nya untuk melihat siapa yang menjalankan setiap build.
