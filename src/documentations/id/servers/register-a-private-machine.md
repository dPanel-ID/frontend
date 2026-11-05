---
title: Mendaftarkan mesin privat
description: Tambahkan PC, server rumahan, atau VM di balik router ke dPanel dengan satu perintah. Tidak perlu IP publik atau port yang terbuka.
sidebar_position: 4
sidebar_icon: log-in
sidebar_label: Mesin privat
---

Mesin privat adalah komputer yang tidak bisa dijangkau dari internet: PC, server rumahan, atau VM di balik router. dPanel tidak pernah menghubunginya. Sebagai gantinya, Anda menjalankan satu perintah di mesin itu untuk memasang agen dPanel, dan agen tersebut menjaga koneksi keluar ke dPanel. Mesin itu lalu muncul di halaman server Anda.

## Yang perlu disiapkan

- Mesin Linux dengan systemd, seperti Ubuntu atau Debian, di prosesor Intel/AMD (`amd64`) atau ARM (`arm64`).
- Terminal di mesin itu yang bisa memakai `sudo`.
- Akses internet dari mesin itu. Mesin hanya terhubung keluar, jadi tidak perlu port forwarding.

## Mendaftarkannya

1. Pasang alat baris perintah dnocs di mesin itu. Ikuti [Memasang dnocs](../ai/ai-in-the-terminal.md#memasang-dnocs).
2. Masuk, lalu pilih ruang kerja tempat mesin ini berada (lewati langkah ini agar mesin tetap di ruang kerja personal Anda):

   ```bash
   dnocs auth login -u <username Anda>
   dnocs workspace list
   dnocs workspace set --id <ID ruang kerja>
   ```

3. Daftarkan mesinnya:

   ```bash
   sudo dnocs machine register
   ```

   dnocs meminta konfirmasi, memasang agen, lalu menunggu sampai server siap. Biasanya kurang dari satu menit.

Server kini muncul di [halaman server](/servers) dengan label **Privat**.

## Yang bisa dilakukan

| Bisa | Belum |
| --- | --- |
| Melihat pemakaian CPU, memori, dan disk | Build dan deploy aplikasi (rilis berikutnya) |
| Menjelajahi dan mengubah file | Membuka terminal di browser |
| Menjalankan, menghentikan, dan memulai ulang layanan | |
| Membaca log | |
| Mengelola pengguna Linux | |
| Memasang modul seperti MariaDB, Redis, atau Docker | |

## Cara modul dipasang

Mesin privat menjalankan pemasangnya sendiri, jadi tidak ada yang perlu menjangkaunya dari internet. Saat pertama kali Anda memasang modul, agen menyiapkan pemasang di mesin itu (Python dan Ansible, sekitar satu setengah menit), lalu pemasang menjalankan tugas di mesin itu sendiri dan berhenti lagi setelah 10 menit tanpa tugas. Jika mesin mati atau offline saat Anda memulai pemasangan, pemasangan akan menunggu lalu gagal; mulai lagi setelah mesin kembali online.

Mesin privat tidak akan pernah bisa memakai load balancer atau domain, karena tidak ada yang bisa menjangkaunya dari internet. Aplikasi yang berjalan di mesin itu bisa diakses dari jaringan Anda sendiri.

## Mendaftarkannya lagi

Menjalankan `sudo dnocs machine register` lagi di mesin yang sama tetap memakai server yang sama di dPanel dan memberi agennya kredensial baru. Satu mesin hanya bisa berada di satu ruang kerja, dan satu ruang kerja bisa menampung hingga 10 mesin privat.

## Menghapusnya

Hapus server di dPanel (dari halamannya, atau dengan `dnocs server delete --id <id>`). dPanel langsung menghapusnya, dan kredensial agen berhenti berlaku. Lalu hentikan agen di mesin itu:

```bash
sudo systemctl disable --now dpanel-active-agent
```
