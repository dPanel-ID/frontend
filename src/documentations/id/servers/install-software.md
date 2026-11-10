---
title: Memasang perangkat lunak
description: Pasang basis data seperti MariaDB, runtime seperti Go, atau web server di server Ubuntu dari katalog modul dPanel, tanpa perlu SSH.
sidebar_position: 6
sidebar_icon: package-plus
---

dPanel memasang perangkat lunak di server lewat modul: buka tab **Modul** server, tekan **Tambah modul**, pilih satu, dan dPanel memasangnya untuk Anda. Modul adalah resep yang sudah teruji untuk basis data, runtime bahasa pemrograman, atau perkakas: Anda menjawab beberapa pertanyaan, lalu dPanel memasang, mengatur, dan menjalankannya di server sebagai layanan systemd (program yang terus dijalankan Linux di latar belakang), lalu mencatat apa saja yang dipasangnya. Anda tidak perlu SSH atau `apt`. Belum kenal istilahnya? Lihat [Glosarium](../getting-started/glossary.md).

## Buka katalognya

1. Buka server, lalu tab **Modul**.
2. Tekan **Tambah modul**.

**Katalog modul** mengelompokkan isinya per kategori. Saring per kategori atau ketik di kolom pencarian. Modul yang sudah ada di server ditandai **Terpasang**, dengan tombol **Kelola** alih-alih **Pasang**.

| Kategori                          | Contoh                                                            |
| --------------------------------- | ----------------------------------------------------------------- |
| **Containers**                    | Docker, serta k3s atau RKE2 untuk Kubernetes satu server          |
| **Databases**                     | MariaDB, PostgreSQL, MongoDB, Redis                               |
| **Infrastructure**                | Caddy Server, Apache APISIX dan HAProxy, engine load balancer     |
| **Programming Languages Runtime** | Node.js, Bun, Go, PHP, Python, Ruby, UV                           |
| **Security**                      | Firewall, dikelola dari tampilan [Firewall](./firewall.md) server |
| **Utilities**                     | FFmpeg, FrankenPHP                                                |

![Katalog modul berisi 20 modul dalam enam kategori: Containers, Databases, Infrastructure, Programming Languages Runtime, Security dan Utilities](../../assets/servers/server-module-catalog.webp 'Tambah modul: katalog untuk server ini. Modul yang terpasang menampilkan Kelola.')

## Memilih versi

Kalau sebuah modul memasang versi tertentu, kolom versinya berisi daftar rilis terbaru, yang terbaru di atas. Pakai yang pertama kecuali aplikasi Anda butuh versi lama.

Butuh rilis yang tidak ada di daftar? Kalau daftarnya diakhiri **Custom version…**, pilih itu lalu ketik rilisnya dengan format yang sama seperti versi di daftar (misalnya `1.26.4`). dPanel memeriksa formatnya sebelum memasang.

![Formulir pemasangan Go dengan daftar Go Version terbuka: 1.27.3, 1.27.2, 1.27.1, 1.27.0, 1.26.10 dan Custom version…](../../assets/servers/server-module-version.webp 'Lima rilis terbaru, atau Custom version… untuk rilis lain.')

## Memasang basis data

1. Tekan **Pasang** pada modul yang diinginkan, misalnya **MariaDB**.
2. Formulirnya menampilkan role yang akan dijalankan dan hanya menanyakan hal yang tidak bisa diputuskan sendiri. Untuk MariaDB: **MariaDB Version**, **Root Password**, dan **Bind Address**. Atur **Bind Address** ke `127.0.0.1` kecuali ada mesin lain yang harus terhubung langsung: nilai bawaannya, `0.0.0.0`, membuat MariaDB mendengarkan di semua alamat jaringan, dan di DigitalOcean dan IDCloudHost tidak ada yang memblokir port 3306 sampai Anda menambahkan firewall.
3. Tekan **Install role**, lalu konfirmasi.

![Formulir pemasangan MariaDB, dengan versi, kata sandi root, dan bind address](../../assets/servers/server-module-install-form.webp)

:::warning[Tentukan kata sandinya sendiri]
Kata sandi root wajib diisi, minimal 8 karakter. Tidak ada nilai bawaan, karena basis data dengan kata sandi bawaan yang sudah tersebar bisa dimasuki siapa saja. dPanel hanya menyimpannya di server dan tidak menampilkannya lagi, jadi simpan salinannya di tempat yang aman.
:::

## Setelah itu

Modul muncul di tab **Modul** dengan status **Memasang**. Basis data butuh beberapa menit. Setelah selesai:

- Tab **Modul** menampilkannya sebagai **Terpasang**, lengkap dengan versinya.
- Tab **Ringkasan** mencantumkannya di **Yang berjalan di sini**.
- Tab **Layanan** menunjukkan layanannya berjalan.

Kalau statusnya **Gagal**, buka modulnya untuk melihat penyebabnya, perbaiki, lalu pasang lagi.

## Tab Modul

Tab **Modul** menampilkan satu baris per modul dengan versi dan statusnya (**Terpasang**, **Memasang**, **Gagal**, atau **Campuran** kalau versinya berbeda-beda). Hitungan **Modul**, **Terpasang** dan **Perlu perhatian** hanya mencakup modul tingkat atas: basis data yang Anda buat di MariaDB atau PostgreSQL tampil di tampilan **Kelola** modul itu, bukan sebagai baris sendiri.

![Tab Modules dengan Caddy Server, Firewall, FrankenPHP, MariaDB dan PHP terpasang, Manage firewall di baris Firewall dan Open database di baris MariaDB](../../assets/servers/server-modules.webp 'Setiap baris menunjukkan modul, versinya, statusnya, dan pintasan seperti Buka database.')

- **Segarkan inventaris** menanyakan ke agen apa yang ada di server sekarang. Modul yang tidak lagi dilaporkan agen, misalnya yang Anda hapus manual, hilang dari daftar.
- Pilih chip versi untuk melihat apa yang dicatat dPanel tentang pemasangan itu. **Uninstall** di sana hanya menghapus catatannya dari dPanel. Programnya, datanya, dan port yang terbuka tetap ada di server.
- **Buka database** (MariaDB, PostgreSQL, MongoDB) dan **Kelola firewall** (Firewall) adalah pintasan. Lihat di bawah dan [Firewall](./firewall.md).

:::tip[Runtime untuk aplikasi]
Runtime bahasa tidak harus dipasang lebih dulu. Saat [membuat aplikasi](../applications/create-an-application.md), Anda memilih runtime-nya sebagai dependensi, dan dPanel memasangnya di server.
:::

## Sudah punya MariaDB di server?

Jika MariaDB dipasang sebelum server bergabung ke dPanel, Anda tidak perlu memasangnya ulang, dan sebaiknya jangan: pemasangan bisa memperbarui database produksi. **Adopsi** memberi tahu dPanel tentang MariaDB yang sudah ada.

1. Di tab **Modul**, tekan **Adopsi MariaDB yang sudah ada**.
2. Baca konfirmasinya, yang menyebutkan port yang ditemukan dPanel, lalu setujui.

Modul ini lalu tampil sebagai terpasang di luar dPanel (diadopsi). Tidak ada perubahan di server: tanpa paket, konfigurasi, atau restart. Anda bisa membuat database di dalamnya dan memakai **Buka database**. Sejak itu dPanel menolak memasang, memperbarui, atau menghapusnya, jadi hal itu tetap di tangan Anda.

Hanya MariaDB yang bisa diadopsi. Dari terminal, `--dry-run` menunjukkan apa yang akan dicatat:

```bash
dnocs module adopt mariadb --server-id 140 --dry-run
dnocs module adopt mariadb --server-id 140
```

## Mengelola basis data

Setelah MariaDB, PostgreSQL, atau MongoDB berstatus **Terpasang**, barisnya di tab **Modul** menampilkan **Buka database**. Tombol itu membuka pengelola basis data di `dbmanager.devetek.app` pada tab baru, sudah masuk dengan akun dPanel Anda dan langsung mengarah ke server itu.

1. Tekan **Buka database**. Anda juga bisa membuka modulnya lalu menekan **Buka database** di sana.
2. Periksa mesin basis datanya, lalu isi pengguna basis data (MariaDB memakai `root`, PostgreSQL memakai pengguna admin yang Anda pilih, dan MongoDB secara bawaan memakai `RootAdmin`) dan kata sandi yang Anda tentukan saat memasangnya.
3. Tekan **Connect**.

Dari sana Anda bisa melihat tabel, menjalankan kueri, serta membuat basis data dan pengguna dengan akses baca saja atau baca-tulis.

Pengelola basis data menjangkau basis data lewat koneksi SSH server, jadi basis data tidak perlu dibuka ke internet. Anda bisa membukanya di server yang boleh Anda ubah: server milik Anda sendiri, dan server di workspace tempat Anda punya akses editor atau lebih tinggi.

## Membuat basis data untuk aplikasi

Aplikasi seperti WordPress atau Laravel butuh basis data sendiri dan pengguna yang hanya bisa menjangkaunya. Keduanya dibuat dari modul server basis datanya sendiri, tanpa kata sandi administrator:

1. Di tab **Modul**, tekan **Tambah modul**, lalu **Kelola** pada **MariaDB** atau **PostgreSQL**. Modul itu harus sudah **Terpasang**.
2. Di bagian **Databases**, tekan **Create database**. Bagian ini menampilkan basis data yang sudah Anda buat di server ini.

![Bagian Databases di tampilan Manage MariaDB, dengan satu basis data dan tombol Create database](../../assets/servers/server-module-databases.webp)

3. Isi **Database Name** dan **Database User**, serta **Database Password** minimal 8 karakter. Nama di PostgreSQL memakai huruf kecil, angka, dan garis bawah.
4. Tekan **Install role**.

![Formulir Create database: nama basis data, pengguna, dan kata sandi](../../assets/servers/server-module-create-database.webp)

dPanel membuat basis data dan penggunanya, memberi pengguna itu semua hak hanya pada basis data tersebut, dan mengizinkannya masuk dari server itu sendiri (`127.0.0.1`), yaitu cara aplikasi di server yang sama terhubung. Membuat nama basis data yang sama lagi dengan kata sandi baru akan mengganti kata sandi penggunanya.

Arahkan aplikasi ke sana dengan variabel runtime: host `127.0.0.1`, port `3306` untuk MariaDB atau `5432` untuk PostgreSQL, nama basis data, pengguna, dan kata sandinya. Lihat [Variabel lingkungan](../applications/environment-variables.md).

Anda juga bisa meminta **Ask dPanel** memasang modul atau membuat basis data aplikasi untuk Anda; asisten membuatkan kata sandinya dan menampilkannya sekali saja. Lihat [Kumpulan prompt](../ai/prompt-cookbook.md).

## Dari terminal

CLI `dnocs` memasang modul yang sama. Pasang dengan panduan [AI di terminal](../ai/ai-in-the-terminal.md).

```bash
dnocs module list --server-id 140                      # katalog untuk server ini
dnocs module install nodejs --server-id 140 --var nodejs.nodejs_version=22
dnocs module install postgresql --server-id 140 --generate-secrets
dnocs module installed --server-id 140                 # yang terpasang, beserta ID-nya
```

`--generate-secrets` membuat kata sandi yang wajib, misalnya kata sandi admin basis data, dan menyimpannya ke berkas yang hanya bisa Anda baca; yang dicetak hanya lokasi berkasnya, tidak pernah nilainya.

## Banyak server sekaligus

Grup server memasang modul yang sama ke semua anggotanya dalam satu operasi, dan menampilkan hasilnya per server. Grup ada di **Servers**, lalu **Server groups**. Lihat [Grup server umum](../clusters/generic-groups.md).

## Pertanyaan yang sering diajukan

### Apakah saya harus memasang runtime sebelum men-deploy aplikasi?

Tidak. Saat [membuat aplikasi](../applications/create-an-application.md), Anda memilih runtime-nya sebagai dependensi dan dPanel memasangnya di server.

### Kenapa basis data aplikasi saya tidak muncul di tab Modul?

Basis data itu milik server basis datanya. Buka **Tambah modul**, lalu **Kelola** pada MariaDB atau PostgreSQL, dan lihat bagian **Databases**.

### Saya menghapus perangkat lunak secara manual. Kenapa masih tercantum?

dPanel menampilkan apa yang terakhir dilaporkan agen. Tekan **Segarkan inventaris**; modul yang tidak lagi ditemukan agen akan hilang dari daftar.

### Apakah Uninstall menghapus perangkat lunak dari server?

Tidak. **Uninstall** pada chip versi hanya menghapus catatan dPanel. Paket, datanya, dan layanannya tetap ada di server.

### Bisakah saya memasang versi yang tidak ada di daftar?

Bisa, pada modul yang mengizinkannya: pilih **Custom version…** lalu ketik rilisnya dengan format yang sama seperti versi di daftar.
