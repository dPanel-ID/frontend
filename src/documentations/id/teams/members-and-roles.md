---
title: Anggota dan peran
description: Tambahkan orang ke tim, beri akses sesuai kebutuhannya, dan pindahkan resource antar ruang kerja.
sidebar_position: 2
sidebar_icon: user-cog
---

Setiap anggota tim punya satu peran atau lebih. Peran menentukan apa yang bisa dilihat dan diubah orang itu di ruang kerja tim.

![Halaman tim yang menampilkan anggota beserta peran dan tanggal bergabung](../../assets/teams/team-detail.webp 'Halaman tim: anggota, peran mereka, dan kapan mereka bergabung.')

## Menambahkan anggota

Orang yang ditambahkan harus sudah punya akun dPanel. Minta mereka mendaftar dulu, lalu:

1. Buka **Tim**, lalu buka timnya.
2. Tekan **Tambah Anggota**.
3. Di **Tambah Anggota Baru**, buka **Pilih pengguna…** dan cari berdasarkan username atau nama.
4. Di **Peran workspace**, pilih akses yang akan diberikan. Lihat tabel di bawah. Owner dan Admin berstatus **Dilindungi**: hanya owner ruang kerja yang bisa memberikannya.
5. Tekan **Tambah anggota**.

Tim itu langsung muncul di pemilih ruang kerja mereka.

## Daftar peran

Setiap peran memakai tiga tingkat yang sama untuk semua jenis resource:

| Tingkat    | Membaca | Membuat | Mengubah | Menghapus |
| ---------- | ------- | ------- | -------- | --------- |
| **Viewer** | Ya      | Tidak   | Tidak    | Tidak     |
| **Editor** | Ya      | Ya      | Ya       | Tidak     |
| **Admin**  | Ya      | Ya      | Ya       | Ya        |

Peran bawaan berlaku untuk seluruh ruang kerja.

| Peran         | Bisa melakukan                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Owner**     | Semuanya, termasuk anggota, peran, tagihan, operasi destruktif, dan pemindahan kepemilikan                                           |
| **Admin**     | Membuat, membaca, mengubah, dan menghapus semua resource, serta mengelola anggota                                                    |
| **DevOps**    | Editor untuk cloud project, server, basis data, load balancer, secret, domain, dan aplikasi; membaca yang lain; tidak bisa menghapus |
| **Developer** | Editor untuk aplikasi, build, dan deployment; membaca yang lain; tidak bisa menghapus                                                |
| **Viewer**    | Hanya membaca semua resource beserta statusnya                                                                                       |
| **Billing**   | Tagihan, paket, dan langganan                                                                                                        |

Untuk kendali yang lebih rinci, setiap jenis resource juga punya peran **Viewer**, **Editor**, dan **Admin** sendiri: Workspace, Cloud Project, Server, Application, Database, Domain, Load Balancer, Billing, dan Secret. Misalnya, **Application Editor** bisa membuat dan men-deploy aplikasi, tetapi tidak bisa menghapusnya.

:::tip
Mulailah dengan peran tersempit yang masih cukup untuk pekerjaannya. **Developer** cocok untuk kebanyakan orang yang hanya mengirim kode; **Viewer** cocok untuk yang hanya perlu melihat.
:::

## Mengubah peran anggota

1. Buka timnya.
2. Di baris anggota, buka menu lalu pilih **Kelola peran**.
3. Centang peran yang seharusnya mereka miliki. Tombol pilih grup mencentang satu grup sekaligus, dan tombol hapus pilihan mengosongkan semuanya.
4. Tekan **Simpan peran**.

Menyimpan berarti mengganti seluruh set peran anggota itu. Seorang anggota hanya memegang satu peran preset, jadi mencentang **Admin** menggantikan **Developer** atau **DevOps**.

Owner dan Admin ditandai **Dilindungi**. Hanya owner ruang kerja yang bisa mencentangnya, atau mengubah dan mengeluarkan anggota yang memegangnya. Bagi yang lain, keduanya tampil tetapi tidak aktif.

## Mengeluarkan anggota

1. Buka timnya.
2. Di baris anggota, buka menu lalu pilih **Hapus**.
3. Konfirmasi **Hapus Anggota**.

Aksesnya ke ruang kerja tim langsung dicabut. Resource yang pernah ia buat tetap menjadi milik tim.

## Memeriksa peran Anda sendiri

**Profil** Anda mencantumkan setiap ruang kerja beserta peran Anda di dalamnya. **Lihat role workspace aktif** menampilkan daftar peran lengkap di ruang kerja yang sedang aktif.

## Memindahkan resource ke ruang kerja lain

Server, aplikasi, load balancer, domain, akun cloud, dan kunci SSH bisa dipindahkan antar ruang kerja, misalnya dari ruang kerja personal ke tim.

1. Cari resource-nya di daftar dan buka menu barisnya. Untuk server, buka servernya lalu ke tab **Pengaturan**.
2. Pilih **Pindah Pemilik** (di server: **Pindahkan kepemilikan**).
3. Di **Pemilik Baru**, pilih timnya, atau **Personal**.
4. Biarkan **Pindahkan juga dependensinya** menyala agar kunci SSH, akun cloud, atau server yang dibutuhkannya ikut pindah, selama tidak dipakai resource lain.
5. Konfirmasi.

:::warning
Pemindahan langsung berlaku. Orang di ruang kerja lama kehilangan akses pengelolaan atas resource tersebut.
:::
