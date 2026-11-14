---
title: Anggota dan peran
description: Tambahkan orang ke tim dPanel dan pilih perannya, dari Viewer sampai Owner, agar setiap orang hanya bisa melihat, men-deploy, atau menghapus yang semestinya.
sidebar_position: 2
sidebar_icon: user-cog
---

Di dPanel, setiap anggota tim punya satu peran atau lebih, dan peran menentukan apa yang bisa dilihat, dibuat, diubah, dan dihapus orang itu di ruang kerja tim: dari **Viewer**, yang hanya bisa melihat, sampai **Owner**, yang bisa melakukan semuanya.

![Halaman tim dengan jumlah anggota, peran dan status Anda, di atas tabel Anggota berisi peran dan tanggal bergabung](../../assets/teams/team-detail.webp 'Halaman tim: anggota, peran mereka, dan kapan mereka bergabung.')

## Menambahkan anggota

Orang yang ditambahkan harus sudah punya akun dPanel. Minta mereka mendaftar dulu, lalu:

1. Buka **Tim**, lalu buka timnya.
2. Tekan **Tambah Anggota**.
3. Di **Tambah Anggota Baru**, buka **Pilih pengguna…** dan cari berdasarkan username atau nama. Huruf besar dan kecil tidak dibedakan.
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
2. Di baris anggota, tekan **Kelola peran**.
3. Centang peran yang seharusnya mereka miliki. Tombol pilih grup mencentang satu grup sekaligus, dan tombol hapus pilihan mengosongkan semuanya.
4. Tekan **Simpan peran**.

Menyimpan berarti mengganti seluruh set peran anggota itu. Seorang anggota hanya memegang satu peran preset, jadi mencentang **Admin** menggantikan **Developer** atau **DevOps**. Perubahannya langsung berlaku: anggota yang perannya Anda turunkan kehilangan akses tambahannya pada tindakan berikutnya, tanpa perlu keluar.

Owner dan Admin ditandai **Dilindungi**. Hanya owner ruang kerja yang bisa mencentangnya, atau mengubah dan mengeluarkan anggota yang memegangnya. Bagi yang lain, keduanya tampil tetapi tidak aktif.

## Mengeluarkan anggota

1. Buka timnya.
2. Di baris anggota, tekan **Hapus dari tim**.
3. Konfirmasi **Hapus Anggota**.

Aksesnya ke ruang kerja tim langsung dicabut. Resource yang pernah ia buat tetap menjadi milik tim.

## Memeriksa peran Anda sendiri

**Profil** Anda mencantumkan setiap ruang kerja beserta peran Anda di dalamnya. **Lihat role workspace aktif** menampilkan daftar peran lengkap di ruang kerja yang sedang aktif.

## Resource tetap di ruang kerjanya

Server, aplikasi, load balancer, domain, akun cloud, dan kunci SSH tetap berada di ruang kerja tempat mereka dibuat, jadi buat resource bersama di ruang kerja tim sejak awal. Satu pengecualian: resource di ruang kerja pribadi Anda bisa dipindahkan ke sebuah tim satu kali, dengan `dnocs transfer`. Lihat [Tim](./teams.md#bisakah-saya-memindahkan-server-dari-ruang-kerja-pribadi-ke-tim) dan [Ruang kerja](../getting-started/workspaces.md).

## Melihat siapa melakukan apa

Di seluruh dPanel, orang ditampilkan dengan nama dan avatarnya: siapa yang menjalankan build, siapa pemilik server atau domain, siapa yang melakukan setiap aksi di aktivitas dashboard. Pilih sebuah nama untuk membuka [profil publik](./public-profiles.md)-nya.

## Pertanyaan yang sering diajukan

### Peran apa yang sebaiknya diberikan kepada developer?

**Developer**. Peran ini bisa membuat aplikasi, membangun dan men-deploy-nya, serta membaca semua yang lain, tetapi tidak bisa menghapus apa pun.

### Siapa yang bisa memberikan peran Owner atau Admin?

Hanya owner ruang kerja. Owner dan Admin ditandai **Dilindungi**; bagi yang lain, keduanya tampil tetapi tidak aktif.

### Apakah anggota baru perlu punya akun dPanel?

Ya. Minta mereka [mendaftar](../getting-started/sign-in.md#membuat-akun) dulu, lalu cari berdasarkan username atau nama di **Tambah Anggota Baru**.

### Apa yang terjadi pada resource ketika saya mengeluarkan anggota?

Resource tetap menjadi milik tim. Anggota tersebut langsung kehilangan akses ke ruang kerja tim.
