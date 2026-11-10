---
title: Memakai AI di terminal
description: Pasang alat baris perintah dnocs, masuk, lalu berbicara dengan asisten AI dPanel dari terminal memakai perintah dnocs ai chat dan dnocs ai approve.
sidebar_position: 6
sidebar_icon: terminal
sidebar_label: AI di terminal
---

Asisten AI dPanel juga bisa dipakai dari terminal lewat **dnocs**, alat baris perintah dPanel. `dnocs ai chat` mengirim pesan dan mencetak jawabannya; `dnocs ai approve` menyetujui atau menolak perubahan yang diusulkan asisten. Ini asisten yang sama dengan **Tanya dPanel** (**Ask dPanel** di tampilan bahasa Inggris) di aplikasi web, dengan aturan yang sama: pertanyaan langsung dijalankan, perubahan menunggu persetujuan Anda.

Pakai cara ini kalau Anda lebih suka keyboard, atau kalau Anda ingin skrip atau agen AI coding Anda sendiri bekerja dengan dPanel. Lihat [Memakai agen AI Anda sendiri](./your-own-ai-agent.md).

## Memasang dnocs

dnocs berupa satu berkas untuk macOS dan Linux, di mesin Intel/AMD (`amd64`) maupun Apple Silicon atau ARM (`arm64`). Satu perintah memasang versi terbaru.

1. Buka terminal.
2. Jalankan pemasang:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://dnocs.devetek.app/installer.sh | sh
   ```

3. Pastikan berhasil: `dnocs --help` menampilkan daftar perintah.

Pemasang memilih berkas yang sesuai dengan mesin Anda, memeriksanya dengan checksum yang diterbitkan, lalu menaruhnya di `/usr/local/bin`. Kata sandi hanya diminta kalau perlu akses administrator untuk menulis ke sana. Tanpa akses itu, dnocs dipasang di `~/.local/bin` dan Anda diberi tahu cara menambahkan folder itu ke path.

Jalankan perintah yang sama kapan saja untuk memperbarui ke versi terbaru.

Untuk memasang versi tertentu, atau ke folder lain, atur nilainya sebelum `sh`:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://dnocs.devetek.app/installer.sh | DNOCS_VERSION=v0.1.20 DNOCS_INSTALL_DIR="$HOME/bin" sh
```

Anda bisa [membaca pemasangnya](https://dnocs.devetek.app/installer.sh) sebelum menjalankannya. Setiap versi diterbitkan di [github.com/dPanel-ID/artifacts](https://github.com/dPanel-ID/artifacts/tree/main/cli).

## Masuk dan memilih ruang kerja

1. Masuk dengan nama pengguna dPanel Anda. dnocs meminta kata sandi tanpa menampilkannya:

   ```bash
   dnocs auth login -u your-username
   ```

2. Periksa akun yang sedang dipakai: `dnocs auth info`.
3. Tampilkan daftar ruang kerja Anda dan pilih salah satu. Semua perintah setelah ini berjalan di ruang kerja tersebut:

   ```bash
   dnocs workspace list
   dnocs workspace set --id 5209311491061018854
   ```

   `dnocs workspace reset` mengembalikan Anda ke ruang kerja personal.

## Mengajukan pertanyaan

```bash
dnocs ai chat "Load balancer apa saja yang saya punya, dan engine apa yang dipakai masing-masing?"
```

dnocs mencetak **Asking the dPanel assistant…**, lalu jawabannya, tool yang dipakai setelah **Checked:**, dan ID percakapannya:

```text
You have 2 load balancers, both using the Caddy engine:
| ID | Name | Domain           | Server     | Status |
| 31 | shop | shop.example.com | web-1 (145) | ready  |
| 46 | blog | blog.example.com | web-1 (145) | ready  |
Checked: loadbalancer_list
Conversation: aic_dbltova0ehgehnm7fvhg
```

Untuk bertanya lanjutan di percakapan yang sama, berikan ID tersebut:

```bash
dnocs ai chat --conversation aic_dbltova0ehgehnm7fvhg "lalu mana yang memakai proxy Cloudflare?"
```

Tanpa `--conversation`, setiap `dnocs ai chat` memulai percakapan baru.

## Menyetujui atau menolak perubahan

Saat Anda meminta perubahan, jawabannya diakhiri dengan detail kartu dan dua perintah yang bisa Anda jalankan:

```text
Waiting for your approval: aipa_dbltp7i0ehgehnm7g01g
  Add a firewall rule on server 145: allow port 8080/tcp from any. It is stored only; the server changes when the firewall is applied.
  approve: dnocs ai approve aipa_dbltp7i0ehgehnm7g01g
  reject:  dnocs ai approve --reject aipa_dbltp7i0ehgehnm7g01g
Conversation: aic_dbltp6q0ehgehnm7fvug
```

- **Menyetujui:** `dnocs ai approve aipa_…`. Perubahan dijalankan sekali, persis seperti yang diusulkan, dengan sesi Anda. Asisten lalu melaporkan hasilnya, dan mungkin mengusulkan langkah berikutnya.
- **Menolak:** `dnocs ai approve --reject aipa_…`. Perintah ini mencetak `rejected` dan tidak ada yang berubah.

### Rahasia di terminal

- **Rahasia yang Anda ketik:** kalau sebuah perubahan butuh nilai yang hanya Anda tahu, `dnocs ai approve` menanyakan setiap nilai tanpa menampilkan apa yang Anda ketik, misalnya `WORDPRESS_DB_PASSWORD (runtime): `. Di skrip, alirkan satu nilai per baris: `printf '%s\n' "$DB_PASSWORD" | dnocs ai approve aipa_…`.
- **Rahasia yang dibuat dPanel:** kata sandi yang dibuat dicetak sekali, di bawah **Generated secrets, shown only this once. Save them now:**. dPanel tidak menyimpan salinannya.

## Mengikuti job

Menyetujui memulai sebuah job dan langsung kembali. Ikuti job itu dengan:

```bash
dnocs execution list --server-id 145 --limit 3
```

Jalankan lagi sampai job menunjukkan `succeeded` atau `failed`. Kalau gagal, tanyakan penyebabnya ke asisten: `dnocs ai chat "Kenapa job terakhir di server 145 gagal?"`.

## Perintah dnocs lainnya

dnocs bisa melakukan jauh lebih banyak daripada chat. `dnocs --help` menampilkan semua perintah, dan `dnocs <command> --help` menjelaskan satu perintah. Beberapa yang akan Anda temui di dokumentasi ini:

| Perintah                  | Fungsinya                                             |
| ------------------------- | ----------------------------------------------------- |
| `dnocs server list`       | Server Anda                                           |
| `dnocs server setup`      | Menjalankan ulang penyiapan server                    |
| `dnocs server firewall`   | Menampilkan dan mengubah firewall server              |
| `dnocs module list`       | Perangkat lunak yang bisa dipasang di server          |
| `dnocs application list`  | Aplikasi Anda                                         |
| `dnocs load-balancer log` | Permintaan yang dilayani sebuah load balancer         |
| `dnocs cluster kinds`     | Engine dan versi Kubernetes yang bisa Anda pakai      |
| `dnocs worker list`       | Apakah ruang kerja memakai worker bersama atau privat |
| `dnocs domain record`     | Melihat, menambah, mengubah, dan menghapus record DNS |
| `dnocs server user`       | Melihat, menambah, dan menghapus pengguna Linux       |
| `dnocs service-account`   | Mengelola login untuk skrip dan agen AI               |
| `dnocs module adopt`      | Mencatat MariaDB yang sudah ada di server             |

## Pertanyaan yang sering diajukan

### Apakah dnocs bisa dipakai di Windows?

Belum ada versi untuk Windows. Pakai di WSL (Windows Subsystem for Linux) dengan berkas Linux.

### Saya masuk ke dPanel dengan Google. Bisakah saya memakai dnocs?

`dnocs auth login` masuk dengan nama pengguna atau email dPanel dan kata sandi; perintah ini tidak mendukung masuk dengan Google.

### Apakah percakapan di terminal dan di web sama?

Jenis percakapannya sama, disimpan oleh dPanel untuk akun dan ruang kerja Anda. Panel web menampilkan percakapan terakhir yang Anda buka di browser itu, dan percakapan di terminal dilanjutkan dengan `--conversation`. Anda bisa menyetujui kartu dari panel web di terminal memakai ID tindakannya, sebagai pengguna yang sama di ruang kerja yang sama.
