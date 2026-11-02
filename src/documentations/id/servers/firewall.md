---
title: Firewall
description: Pilih port server mana yang bisa dijangkau orang, tinjau perubahannya, lalu biarkan dPanel menerapkannya dengan aman.
sidebar_position: 8
sidebar_icon: shield-check
---

Firewall menentukan lalu lintas jaringan mana yang boleh masuk ke server Anda. Saat firewall nyala, hanya port yang Anda izinkan yang bisa dijangkau dari internet; sisanya diblokir. dPanel mengelola firewall bawaan Ubuntu (ufw) untuk Anda: Anda menyimpan daftar aturan di dPanel, lalu dPanel menerapkan seluruh daftar itu ke server sekaligus.

Buka dari halaman server: tab **Jaringan**, lalu kotak **Firewall**. Kalau modul firewall sudah terpasang, tab **Modul** juga menampilkan **Kelola firewall**.

## Cara kerjanya

1. **Tambahkan aturan** untuk setiap port yang harus bisa dijangkau orang, misalnya 443 untuk situs web. Belum ada yang berubah di server.
2. **Tinjau dan terapkan.** dPanel membandingkan aturan Anda dengan firewall di server, lalu menampilkan apa yang akan ditambahkan, dihapus, dan tetap ada. Terapkan kalau sudah sesuai.
3. dPanel menjalankan tugas di server. Tampilan menunjukkan **Menerapkan** dan diperbarui sendiri sampai tugas selesai.

:::tip[Penerapan pertama memasang firewall]
Server yang belum pernah punya firewall menampilkan **Modul firewall belum terpasang**. Penerapan pertama memasangnya, lalu menerapkan aturan Anda.
:::

## Baris status

| Bagian                       | Artinya                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Firewall**                 | **Nyala** atau **Mati**, dan perlakuan bawaan untuk lalu lintas yang tidak cocok dengan aturan (biasanya: masuk ditolak, keluar diizinkan). |
| **Port Docker**              | Apakah aturan Docker berlaku. Lihat [Port Docker](#port-docker).                                                                            |
| **Tersimpan dan diterapkan** | Versi aturan Anda dan versi yang dipakai server. **Perubahan belum diterapkan** berarti Anda masih perlu menerapkannya.                     |
| **Penerapan terakhir**       | Hasil tugas terakhir, atau **Menerapkan** selama tugas berjalan.                                                                            |

**Server berbeda dari dPanel** muncul kalau seseorang mengubah firewall langsung di server. Tinjau dan terapkan untuk mengembalikan aturan yang tersimpan.

## Aturan

Setiap aturan punya tindakan, port, protokol, dan siapa yang boleh terhubung.

| Tindakan                 | Artinya                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Izinkan**              | Lalu lintas boleh masuk.                                                                                                 |
| **Tolak**                | Lalu lintas dibuang tanpa jawaban.                                                                                       |
| **Tolak dengan balasan** | Lalu lintas ditolak dan pengirimnya diberi tahu.                                                                         |
| **Batasi**               | Lalu lintas boleh masuk, tetapi alamat yang terlalu sering terhubung diblokir. Berguna untuk SSH. Hanya untuk port host. |

- **Port**: satu port (`443`), rentang (`8000:8100`), atau kosong untuk semua port. Rentang membutuhkan TCP atau UDP.
- **Dari**: kosong untuk siapa saja, atau satu alamat (`203.0.113.10`) atau jaringan (`10.0.0.0/8`).
- **Catatan**: pengingat mengapa aturan itu ada.

Menambah atau menghapus aturan hanya mengubah apa yang disimpan dPanel. Server baru memakainya pada penerapan berikutnya.

### Aturan sistem dan aturan lama

Beberapa aturan menampilkan gembok, bukan tombol hapus:

- Aturan **Sistem** menjaga dPanel tetap bekerja: SSH (port 22), serta port 80 dan 443 di server yang menjalankan load balancer dPanel. Aturan ini selalu ada di urutan pertama.
- Aturan **Lama** diadopsi dari penyiapan sebelumnya dan sengaja dipertahankan.

Aturan yang terkunci tidak bisa dihapus. Menghapus aturan lain di server milik workspace membutuhkan peran admin workspace; kalau Anda tidak punya, dPanel menampilkan alasannya.

## Port Docker

Docker membuka port kontainer melewati firewall biasa, sehingga aturan host tidak melindunginya. Untuk mengaturnya:

1. Nyalakan **Port Docker** di baris status.
2. Tambahkan aturan dengan **Port ini milik kontainer Docker** dinyalakan, memakai port kontainer.
3. Tinjau dan terapkan.

Selama penyaringan Docker mati, aturan Docker tetap disimpan tetapi belum berlaku.

## Aturan yang tidak dikelola dPanel

**Tidak dikelola dPanel** menampilkan aturan yang ditambahkan seseorang langsung di server. Penerapan tetap mempertahankannya. **Adopsi** menyimpannya di dPanel agar muncul sebagai aturan Anda; tombol ini mengadopsi semua aturan yang bisa diwakili dPanel sekaligus, bukan hanya yang Anda pilih. Aturan yang tidak bisa diwakili dilewati dan dibiarkan apa adanya.

Kalau bagian ini menyebut firewall di server tidak dapat dibaca, modul firewall belum terpasang atau agen server terlalu lama. Itu wajar sebelum penerapan pertama.

## Keamanan: SSH dan pemulihan otomatis

- SSH selalu tetap terbuka, jadi dPanel tetap bisa menjangkau server. Tinjauan menampilkan **SSH tetap terbuka** sebelum Anda menerapkan.
- Menyalakan firewall meminta konfirmasi, karena setiap port tanpa aturan izin akan diblokir.
- Kalau SSH atau agen dPanel berhenti bekerja setelah perubahan, server mengembalikan firewall sebelumnya dengan sendirinya dalam beberapa menit, dan tugasnya ditandai gagal.

## Mematikan firewall

**Matikan firewall** menjalankan tugas yang mematikan firewall, sehingga semua port bisa dijangkau lagi. Aturan Anda tetap disimpan untuk penerapan berikutnya.

## Melihat port mana yang terbuka

Di tab **Jaringan**, tampilan **Port aktif** punya kolom **Firewall**: untuk setiap port yang dipakai, kolom ini menunjukkan apakah aturan mengizinkannya dari mana saja, hanya dari alamat tertentu, atau tidak sama sekali. Selama firewall mati, kolom ini menambahkan **Belum berlaku**.
