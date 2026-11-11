---
title: Firewall
description: Pilih port server mana yang bisa dijangkau dari internet, tinjau perubahannya, lalu biarkan dPanel menerapkannya dengan aman, lewat web atau CLI dnocs.
sidebar_position: 8
sidebar_icon: shield-check
---

dPanel mengelola firewall setiap server untuk Anda: Anda menyimpan daftar aturan di dPanel, meninjau apa yang akan berubah, lalu dPanel menerapkan seluruh daftar itu ke server sekaligus tanpa mengunci dirinya sendiri di luar. Firewall menentukan lalu lintas jaringan mana yang boleh masuk ke server; saat firewall nyala, hanya port yang Anda izinkan yang bisa dijangkau dari internet, sisanya diblokir. Server baru dimulai dengan firewall ini mati: sampai Anda menyalakannya, hanya firewall penyedia Anda, kalau ada, yang membatasi siapa yang bisa terhubung.

Di baliknya dPanel memakai ufw, firewall bawaan Ubuntu. **Port** adalah "pintu" bernomor di server yang didengarkan satu program, misalnya 443 untuk situs web atau 22 untuk SSH. Belum kenal istilah-istilah ini? Lihat [Glosarium](../getting-started/glossary.md).

## Membuka firewall

1. Buka **Servers**, lalu pilih server Anda.
2. Masuk ke tab **Jaringan**, lalu pilih kotak **Firewall**.

Kalau modul **Firewall** sudah terpasang, tab **Modul** juga menampilkan **Kelola firewall** di barisnya, yang membuka tampilan yang sama.

![Tampilan Firewall sebuah server: tombol Refresh, Turn off firewall, Add rule dan Review and apply di atas, baris status, dan tabel aturan berisi tiga aturan System yang terkunci serta satu aturan yang Anda tambahkan](../../assets/servers/server-firewall.webp 'Jaringan → Firewall: baris status, lalu semua aturan yang disimpan dPanel untuk server ini.')

## Cara kerjanya

1. **Tambah aturan** untuk setiap port yang harus bisa dijangkau orang, misalnya 443 untuk situs web. Belum ada yang berubah di server.
2. **Tinjau dan terapkan.** dPanel membandingkan aturan Anda dengan firewall di server, lalu menampilkan apa yang akan ditambahkan, dihapus, dan tetap ada. Tekan **Terapkan firewall** kalau sudah sesuai.
3. dPanel menjalankan tugas di server. Tampilan menunjukkan **Menerapkan firewall** dan diperbarui sendiri sampai tugas selesai.

:::tip[Penerapan pertama memasang firewall]
Server yang belum pernah punya firewall menampilkan **Modul firewall belum terpasang**. Penerapan pertama memasangnya, lalu menerapkan aturan Anda. Saat menyalakannya, Anda diminta mencentang **Saya paham bahwa menyalakan firewall memblokir setiap port tanpa aturan izin**, lalu menekan **Nyalakan dan terapkan**.
:::

## Menambah aturan

Tekan **Tambah aturan**. Panelnya menanyakan tiga hal:

| Bagian                         | Kolom                               | Yang diisi                                                                                                        |
| ------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Apa yang diizinkan**         | **Tindakan**                        | **Izinkan**, **Tolak**, **Batasi** atau **Tolak dengan balasan**. Lihat tabel di bawah.                           |
|                                | **Port**                            | Satu port (`443`), rentang (`8000:8100`), atau kosong untuk semua port. Rentang wajib **TCP** atau **UDP**.       |
|                                | **Protokol**                        | **TCP** untuk hampir semuanya (situs web, SSH, database), **UDP** untuk hal seperti DNS atau VPN, atau **Semua**. |
| **Siapa yang boleh terhubung** | **Dari**                            | Kosong untuk siapa saja, satu alamat (`203.0.113.10`) atau satu jaringan (`10.0.0.0/8`).                          |
| **Kontainer Docker**           | **Port ini milik kontainer Docker** | Nyalakan kalau port itu dipublikasikan oleh kontainer Docker. Lihat [Port Docker](#port-docker).                  |
| **Catatan**                    | **Catatan**                         | Pengingat mengapa aturan ini ada, tampil di tabel aturan.                                                         |

![Panel Add rule berisi Action, Port, Protocol, From, sakelar Docker container dan Note](../../assets/servers/server-firewall-add-rule.webp 'Tambah aturan: aturan disimpan sekarang dan sampai ke server pada penerapan berikutnya.')

| Tindakan                 | Artinya                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Izinkan**              | Membiarkan lalu lintas masuk.                                                                                 |
| **Tolak**                | Membuangnya tanpa jawaban.                                                                                    |
| **Tolak dengan balasan** | Menolaknya dan memberi tahu pengirim.                                                                         |
| **Batasi**               | Membiarkannya masuk, tetapi memblokir alamat yang terlalu sering terhubung. Cocok untuk SSH. Hanya port host. |

:::warning[Aturan kosong membuka semuanya]
Tanpa port dan tanpa alamat, aturan **Izinkan** membuat semua orang bisa menjangkau semua port. Panel memperingatkan Anda sebelum aturan itu ditambahkan.
:::

Menambah atau menghapus aturan hanya mengubah apa yang disimpan dPanel. Server baru memakainya pada penerapan berikutnya.

## Tinjau dan terapkan

**Tinjau dan terapkan** menunjukkan persis apa yang akan dilakukan: **Perubahan** (misalnya menyalakan firewall atau perlakuan bawaan baru), **Akan ditambahkan**, **Akan dihapus**, dan **Tetap ada, tidak dikelola dPanel**. Dialog ini juga memastikan **SSH tetap terbuka, jadi dPanel selalu bisa menjangkau server.**

![Dialog Review and apply: satu perubahan pada perlakuan bawaan routed, tidak ada yang ditambah atau dihapus, SSH tetap terbuka, dan tombol Apply firewall](../../assets/servers/server-firewall-review.webp 'Periksa daftarnya, lalu tekan Terapkan firewall.')

Kalau tidak ada yang berbeda, dialog menulis **Tidak ada yang berubah: server sudah sesuai.** Membuka tinjauan tidak mengubah apa pun; hanya **Terapkan firewall** yang mengubah.

## Baris status

| Bagian                       | Artinya                                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Firewall**                 | **Nyala** atau **Mati**, dan perlakuan bawaan untuk lalu lintas yang tidak cocok dengan aturan (biasanya: masuk ditolak, keluar diizinkan, diteruskan ditolak). |
| **Port Docker**              | **Disaring** atau **Tidak disaring**, dengan sakelar. Lihat [Port Docker](#port-docker).                                                                        |
| **Tersimpan dan diterapkan** | Versi aturan Anda dan versi yang dipakai server. **Perubahan belum diterapkan** berarti Anda masih perlu menerapkannya.                                         |
| **Penerapan terakhir**       | Hasil tugas terakhir (**Berhasil**, **Gagal** dan seterusnya), atau **Menerapkan** selama tugas berjalan.                                                       |

**Server berbeda dari dPanel** muncul kalau seseorang mengubah firewall langsung di server. Tinjau dan terapkan untuk mengembalikan aturan yang tersimpan.

## Aturan dan siapa yang menambahkannya

Kolom **Ditambahkan oleh** menunjukkan asal setiap aturan:

| Ditambahkan oleh | Artinya                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sistem**       | Aturan yang menjaga dPanel tetap bekerja: SSH, serta port 80 dan 443 di server yang menjalankan engine load balancer dPanel. Terkunci, selalu paling atas.           |
| **Lama**         | Aturan yang diadopsi dari penyiapan lama dan sengaja dipertahankan. Terkunci.                                                                                        |
| **Anda**         | Aturan yang ditambahkan lewat web, CLI atau asisten. Bisa Anda hapus.                                                                                                |
| **Lainnya**      | Aturan yang dibuat dPanel untuk load balancer TCP/UDP di server ini: port-nya, terbuka untuk alamat di daftar izinnya. Terkunci; ikut berubah bersama load balancer. |

Aturan yang terkunci tidak bisa dihapus. Menghapus aturan lain di server workspace membutuhkan peran admin workspace; kalau Anda tidak punya, dPanel menampilkan alasannya.

## Port Docker

Docker memublikasikan port kontainer melewati firewall biasa, jadi aturan host tidak melindunginya. Untuk mengendalikannya:

1. Nyalakan sakelar di **Port Docker** pada baris status.
2. Tambahkan aturan dengan **Port ini milik kontainer Docker** dinyalakan, memakai port kontainer.
3. Tinjau dan terapkan.

Selama penyaringan Docker mati, aturan Docker tetap tersimpan tetapi tidak berpengaruh.

## Aturan yang tidak dikelola dPanel

**Tidak dikelola dPanel** mencantumkan aturan yang ditambahkan seseorang langsung di server. Penerapan tetap mempertahankannya. **Adopsi** menyimpannya di dPanel supaya tampil sebagai aturan Anda; tombol ini mengadopsi semua aturan yang bisa direpresentasikan dPanel sekaligus, bukan hanya yang Anda pilih. Aturan yang tidak bisa direpresentasikan dilewati dan dibiarkan.

Kalau bagian ini menyebut firewall di server tidak bisa dibaca, berarti modul firewall belum terpasang atau agen server terlalu lama. Itu wajar sebelum penerapan pertama.

## Keamanan: SSH dan pemulihan otomatis

- SSH selalu tetap terbuka, di port SSH server itu walaupun bukan 22, jadi dPanel tetap bisa menjangkau server yang terhubung lewat SSH dan Anda tetap bisa masuk sendiri. Kalau sebuah perubahan akan menutup SSH, tinjauan menyebutkannya dan dPanel menolak menerapkannya.
- Server yang terhubung dengan agen dPanel dijangkau lewat koneksi keluar milik agen, jadi aturan firewall untuk lalu lintas masuk tidak memutus dPanel.
- Kalau SSH atau agen dPanel berhenti bekerja setelah perubahan, server memulihkan firewall sebelumnya dengan sendirinya dalam beberapa menit, dan tugasnya ditandai gagal. Sebelum mengubah apa pun, dPanel mencadangkan `/etc/ufw` dan `/etc/default/ufw` ke `/var/lib/dpanel-firewall/backup` dan menjalankan timer systemd `dpanel-firewall-rollback`.

## Mematikan firewall

**Matikan firewall** mengantrekan tugas yang mematikan firewall, sehingga semua port bisa dijangkau lagi. Aturan Anda tetap disimpan untuk penerapan berikutnya.

## Melihat port mana yang terbuka

Di tab **Jaringan**, tampilan **Port aktif** punya kolom **Firewall**: untuk setiap port yang dipakai, kolom ini menunjukkan **Diizinkan dari mana saja**, **Diizinkan dari** sejumlah sumber, atau **Tidak ada aturan izin**. Selama firewall mati, tertulis **Belum berlaku: firewall mati**. Lihat [Halaman server Anda](./your-server-page.md#jaringan).

## Dari terminal

CLI `dnocs` mengelola firewall yang sama. Pasang dengan panduan [AI di terminal](../ai/ai-in-the-terminal.md); cari ID server dengan `dnocs server list`.

```bash
dnocs server firewall show --server-id 140           # aturan yang disimpan dPanel
dnocs server firewall allow --server-id 140 --port 443 --proto tcp --comment "Website"
dnocs server firewall plan --server-id 140           # apa yang akan berubah; tidak mengubah apa pun
dnocs server firewall apply --server-id 140 --wait   # tambahkan --enable pertama kali, untuk menyalakannya
```

| Perintah  | Fungsinya                                                                            |
| --------- | ------------------------------------------------------------------------------------ |
| `show`    | Firewall yang disimpan dPanel, dengan ID setiap aturan.                              |
| `live`    | Firewall yang sedang berlaku di server, dibaca lewat agen.                           |
| `allow`   | Menambah aturan izin. `--rate-limit` menjadikannya aturan **Batasi**.                |
| `deny`    | Menambah aturan tolak.                                                               |
| `remove`  | Menghapus aturan tersimpan berdasarkan `--rule-id` dari `show`.                      |
| `plan`    | Menunjukkan apa yang akan diubah oleh penerapan.                                     |
| `apply`   | Menerapkan aturan tersimpan sebagai tugas. `--enable` menyalakan firewall yang mati. |
| `disable` | Mematikan firewall sebagai tugas; aturan tetap disimpan.                             |
| `import`  | Mengadopsi aturan yang sudah ada di server.                                          |

`allow` dan `deny` menerima `--port`, `--proto` (`tcp`, `udp` atau `any`), `--from`, `--comment` dan `--docker` (untuk port yang dipublikasikan Docker).

Anda juga bisa meminta **Ask dPanel** menambah aturan dan menerapkannya; asisten memperingatkan Anda kalau firewall akan memblokir load balancer TCP atau UDP yang baru. Lihat [Kumpulan prompt](../ai/prompt-cookbook.md).

## Pertanyaan yang sering diajukan

### Apakah menyalakan firewall bisa membuat saya terkunci dari server?

Tidak. SSH adalah aturan **Sistem** yang terkunci, tinjauan menolak perubahan apa pun yang menutupnya, dan server memulihkan dirinya sendiri kalau SSH atau agen berhenti bekerja setelah penerapan.

### Saya sudah menambah aturan, tetapi port-nya masih terblokir. Kenapa?

Menambah aturan hanya menyimpannya. Tekan **Tinjau dan terapkan**, lalu **Terapkan firewall**; aturan sampai ke server setelah tugasnya **Berhasil**.

### Apakah situs web saya butuh aturan?

Tidak untuk port 80 dan 443 di server yang menjalankan load balancer dPanel: dPanel menambahkannya sebagai aturan **Sistem**. Tambahkan aturan untuk port lain yang harus bisa dijangkau, misalnya database yang Anda buka hanya untuk alamat kantor.

### Kenapa server dengan firewall menyala tidak bisa masuk klaster Kubernetes?

Kubernetes mengatur aturan jaringannya sendiri dan akan bentrok dengan firewall host. Matikan firewall sebelum server dimasukkan ke klaster. Lihat [Grup server dan klaster](../clusters/overview.md).

### Apakah firewall ini menggantikan firewall penyedia cloud saya?

Tidak, firewall ini bekerja di server itu sendiri. Firewall penyedia (misalnya security group AWS) tetap berlaku di depannya, jadi sebuah port harus terbuka di keduanya.
