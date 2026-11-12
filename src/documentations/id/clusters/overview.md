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

Panduan: [Grup umum](./generic-groups.md), [Kubernetes dengan k3s](./kubernetes-k3s.md), dan [Kubernetes dengan RKE2](./kubernetes-rke2.md).

## Apa itu Kubernetes

**Kubernetes** (sering ditulis **K8s**) menjalankan aplikasi Anda di dalam **kontainer** di beberapa server, dan menjaganya tetap berjalan. Kontainer adalah aplikasi yang dikemas bersama semua yang dibutuhkannya, sehingga berjalan dengan cara yang sama di server mana pun. Istilah lain seperti ini ada di [Glosarium](../getting-started/glossary.md).

- Anda menyebutkan yang Anda mau, misalnya "dua salinan aplikasi web saya".
- Kubernetes memutuskan server mana yang menjalankan setiap salinan.
- Kalau satu salinan crash, ia menyalakan yang baru. Kalau satu server mati, salinannya dinyalakan di server lain.
- Permintaan dibagi ke semua salinan, jadi satu salinan yang sibuk tidak memperlambat semuanya.

Klaster Kubernetes punya dua peran:

| Peran      | Sebutan lain          | Tugasnya                                                                                                    |
| ---------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Server** | control plane, master | Otaknya: menyimpan kondisi klaster dan memutuskan di mana aplikasi berjalan. Bisa ikut menjalankan aplikasi |
| **Agent**  | worker node           | Ototnya: menjalankan aplikasi Anda. Tambah agent untuk menambah kapasitas                                   |

**Node** adalah satu server di dalam klaster. Peran **Server** dan **Agent** di atas adalah peran Kubernetes. Keduanya tidak sama dengan server dPanel, agen dPanel, atau worker dPanel.

Satu server cukup untuk mulai. Agar klaster tetap jalan saat kehilangan satu server, gunakan **tiga server** (jumlah ganjil, supaya mereka selalu bisa sepakat siapa yang memimpin).

## k3s atau RKE2

dPanel memasang Kubernetes dengan salah satu dari dua **engine**. Keduanya Kubernetes bersertifikat, jadi aplikasi dan perintah `kubectl` yang sama berjalan di keduanya.

|                              | k3s                                          | RKE2                                                               |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Singkatnya                   | Kubernetes ringan dalam satu program kecil   | Kubernetes dari Rancher yang fokus pada keamanan, siap CIS         |
| Berjalan di                  | amd64, arm64, dan armhf (Raspberry Pi)       | amd64 dan arm64                                                    |
| Server terkecil              | 1 CPU, memori 1 GB (2 GB lebih nyaman)       | 2 CPU, memori 4 GB                                                 |
| Cocok untuk                  | Belajar, VM kecil, Raspberry Pi, lokasi edge | Produksi, pekerjaan yang diatur regulasi, tim yang butuh hardening |
| Lama pemasangan              | Sekitar 10 menit untuk dua server            | Sekitar 12 menit untuk dua server                                  |
| Panduan langkah demi langkah | [Kubernetes dengan k3s](./kubernetes-k3s.md) | [Kubernetes dengan RKE2](./kubernetes-rke2.md)                     |

Ragu? Mulai dengan **k3s**. Anda bisa membuat klaster RKE2 nanti di server lain.

:::tip[Hanya satu mesin?]
Untuk satu mesin Anda tidak butuh grup. `k3s` dan `rke2` juga modul biasa: buka servernya, masuk ke **Modules**, lalu pasang salah satunya untuk mendapat Kubernetes satu server. Lihat [Memasang perangkat lunak](../servers/install-software.md).
:::

## Aturan yang menjaga server Anda

- **Satu server hanya bisa masuk satu grup.** Pemilih server menandai server yang **Already in a group**. Wizard Kubernetes tidak menawarkan server yang sudah dihapus.
- **Server sebuah klaster hanya berubah lewat klaster.** Server tidak bisa dikeluarkan dari grup klaster secara manual, dan server yang menjadi node klaster tidak bisa dihapus. Ini mencegah node yang setengah dikeluarkan merusak klaster.
- **Kubernetes memiliki servernya sendiri.** dPanel menolak server yang sudah menjalankan Docker, k3s, atau RKE2, dan server yang [firewall](../servers/firewall.md) dPanel-nya aktif, karena mereka akan berebut aturan jaringan yang sama.
- **Server klaster harus bisa saling terhubung.** Tempatkan semuanya dalam satu jaringan privat: project cloud, jaringan, dan region yang sama. Server yang terhubung lewat SSH maupun yang bergabung lewat [agen dPanel](../servers/register-a-private-machine.md) sama-sama bisa, dan satu klaster boleh mencampur keduanya. Sebelum memasang apa pun, dPanel memeriksa setiap server bisa menjangkau server lain di port yang dibutuhkan Kubernetes. Kalau ada port yang terblokir, klaster bertuliskan **Failed** beserta server, port, dan kemungkinan penyebabnya, dan tidak ada yang dipasang.
- **Satu region untuk control plane.** Server dengan peran **Server** harus berada di region yang sama. Anggota klaster terus-menerus berkomunikasi, dan koneksi lambat antar-region membuat klaster tidak stabil. **Agent** di region lain boleh, tetapi dPanel memperingatkan bahwa lalu lintasnya menyeberang region.
- **Izin.** Membuat, mencopot, dan menghapus klaster butuh izin **cluster editor** dan **server editor** di workspace. Owner dan admin punya keduanya.

## Dari terminal

CLI `dnocs` punya perintah yang sama: `dnocs server group` untuk grup dan `dnocs cluster` untuk klaster (`kinds`, `create`, `detail`, `install`, `uninstall`, `delete`). `dnocs cluster kinds` menampilkan engine dan versi yang bisa dipilih. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasangnya.

Anda juga bisa meminta **Ask dPanel** membuat grup atau klaster untuk Anda; asisten menampilkan rencananya dulu untuk Anda setujui. Lihat [Kumpulan prompt](../ai/prompt-cookbook.md).

## Pertanyaan yang sering diajukan

### Apakah aplikasi saya butuh klaster?

Tidak. Kebanyakan aplikasi berjalan baik di satu server sebagai [aplikasi](../applications/overview.md) dPanel. Pakai klaster kalau aplikasi harus tetap berjalan saat sebuah server mati, atau kalau Anda memang sudah bekerja dengan Kubernetes.

### Berapa server yang dibutuhkan klaster?

Satu sudah cukup untuk mulai. Agar control plane tetap hidup saat kehilangan satu server, beri tiga server peran **Server**. Jumlah node **Server** harus ganjil, paling banyak tujuh.

### Bisakah grup umum yang sudah ada dijadikan klaster?

Tidak. Jenisnya dipilih saat Anda menekan **New group**. Menghapus klaster justru sebaliknya: grupnya tetap ada sebagai grup umum dengan server yang sama.

### Engine mana yang sebaiknya saya pilih?

Mulai dengan **k3s**. Lebih ringan dan bisa berjalan di Raspberry Pi. Pilih **RKE2** untuk server produksi yang diperketat dengan memori minimal 4 GB.
