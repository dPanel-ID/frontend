---
title: Grup server dan klaster
description: Apa itu grup server di dPanel, beda grup umum dan klaster, serta apa itu Kubernetes, k3s, dan RKE2, dijelaskan dengan bahasa sederhana.
sidebar_position: 1
sidebar_icon: boxes
sidebar_label: Apa itu grup atau klaster
---

Begitu server Anda lebih dari satu, pekerjaan yang sama mulai diulang-ulang: memasang Node.js di setiap server web, memperbarui agent di semua server, me-reboot semuanya setelah pembaruan. **Grup server** menyatukan server-server itu di bawah satu nama, jadi cukup dikerjakan sekali.

Sebagian perangkat lunak butuh lebih dari itu: beberapa server harus **bekerja sama sebagai satu sistem**, sehingga kalau satu server mati, yang lain tetap jalan. Itulah **klaster**. Di dPanel, klaster dibangun di atas grup server, jadi keduanya dibuat di tempat yang sama.

![Halaman Server groups dengan dua grup Kubernetes, kube-rke dan kube-k3s, masing-masing Ready dengan dua server](../../assets/clusters/groups-list.webp 'Servers → Server groups: setiap grup di workspace, jenisnya, statusnya, dan servernya.')

## Dua jenis grup

Saat Anda menekan **New group**, dPanel pertama-tama bertanya **What should this group be?**

|                        | Grup umum (Generic)                                                        | Grup klaster (Kubernetes)                                              |
| ---------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Apa itu                | Daftar server yang disimpan                                                | Server-server yang bersama-sama menjalankan satu klaster Kubernetes    |
| Server-servernya       | Tetap mandiri. Masing-masing mengerjakan tugasnya sendiri                  | Berbagi pekerjaan. Aplikasi bisa pindah di antara mereka               |
| Gunanya                | Pasang modul, deploy, segarkan, reboot, atau upgrade di semuanya sekaligus | Menjalankan aplikasi kontainer yang tetap hidup walau satu server mati |
| Kalau satu server mati | Hanya hasil server itu yang gagal; yang lain tetap berhasil                | Klaster memindahkan aplikasinya ke server yang masih hidup             |
| Mengubah anggotanya    | Tambah atau keluarkan server kapan saja                                    | Ditetapkan saat dibuat                                                 |
| Contoh                 | "Semua server web produksi": pasang PHP 8.5 di 12 server                   | "kube-k3s": klaster Kubernetes kecil di dua VM atau tiga Raspberry Pi  |

Bayangkan grup umum sebagai **milis**: satu pesan, semua orang dapat salinannya, masing-masing bertindak sendiri. Klaster adalah **tim**: anggotanya membagi pekerjaan dan saling menggantikan.

Panduan: [Grup umum](./generic-groups.md) dan [Klaster Kubernetes](./kubernetes.md).

## Apa itu Kubernetes

**Kubernetes** (sering ditulis **K8s**) menjalankan aplikasi Anda di dalam **kontainer** di beberapa server, dan menjaganya tetap berjalan.

- Anda menyebutkan yang Anda mau, misalnya "dua salinan aplikasi web saya".
- Kubernetes memutuskan server mana yang menjalankan setiap salinan.
- Kalau satu salinan crash, ia menyalakan yang baru. Kalau satu server mati, salinannya dinyalakan di server lain.
- Permintaan dibagi ke semua salinan, jadi satu salinan yang sibuk tidak memperlambat semuanya.

Klaster Kubernetes punya dua peran:

| Peran      | Sebutan lain          | Tugasnya                                                                                                    |
| ---------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Server** | control plane, master | Otaknya: menyimpan kondisi klaster dan memutuskan di mana aplikasi berjalan. Bisa ikut menjalankan aplikasi |
| **Agent**  | worker node           | Ototnya: menjalankan aplikasi Anda. Tambah agent untuk menambah kapasitas                                   |

Satu server cukup untuk mulai. Agar klaster tetap jalan saat kehilangan satu server, gunakan **tiga server** (jumlah ganjil, supaya mereka selalu bisa sepakat siapa yang memimpin).

## k3s atau RKE2

dPanel memasang Kubernetes dengan salah satu dari dua **engine**. Keduanya Kubernetes bersertifikat, jadi aplikasi dan perintah `kubectl` yang sama berjalan di keduanya.

|                 | k3s                                          | RKE2                                                               |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Singkatnya      | Kubernetes ringan dalam satu program kecil   | Kubernetes dari Rancher yang fokus pada keamanan, siap CIS         |
| Berjalan di     | amd64, arm64, dan armhf (Raspberry Pi)       | amd64 dan arm64                                                    |
| Server terkecil | 1 CPU, memori 1 GB (2 GB lebih nyaman)       | 2 CPU, memori 4 GB                                                 |
| Cocok untuk     | Belajar, VM kecil, Raspberry Pi, lokasi edge | Produksi, pekerjaan yang diatur regulasi, tim yang butuh hardening |
| Lama pemasangan | Sekitar 10 menit untuk dua server            | Sekitar 12 menit untuk dua server                                  |

Ragu? Mulai dengan **k3s**. Anda bisa membuat klaster RKE2 nanti di server lain.

:::tip[Hanya satu mesin?]
Untuk satu mesin Anda tidak butuh grup. `k3s` dan `rke2` juga modul biasa: buka servernya, masuk ke **Modules**, lalu pasang salah satunya untuk mendapat Kubernetes satu server. Lihat [Memasang perangkat lunak](../servers/install-software.md).
:::

## Aturan yang menjaga server Anda

- **Satu server hanya bisa masuk satu grup.** Pemilih server menandai server yang **Already in a group**.
- **Server sebuah klaster hanya berubah lewat klaster.** Server tidak bisa dikeluarkan dari grup klaster secara manual, dan server yang menjadi node klaster tidak bisa dihapus. Ini mencegah node yang setengah dikeluarkan merusak klaster.
- **Kubernetes memiliki servernya sendiri.** dPanel menolak server yang sudah menjalankan Docker, k3s, atau RKE2, dan server yang firewall dPanel-nya aktif, karena mereka akan berebut aturan jaringan yang sama.
- **Satu region per klaster.** Server harus berada di region yang sama. Anggota klaster terus-menerus berkomunikasi, dan koneksi lambat antar-region membuat klaster tidak stabil.
- **Izin.** Membuat, mencopot, dan menghapus klaster butuh izin **cluster editor** dan **server editor** di workspace. Owner dan admin punya keduanya.
