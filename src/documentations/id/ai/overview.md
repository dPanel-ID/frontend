---
title: Tanya dPanel, asisten AI
description: Tanya dPanel adalah asisten AI bawaan dPanel. Bertanyalah dengan bahasa sehari-hari; asisten membaca ruang kerja Anda, menjawab, dan mengusulkan perubahan.
sidebar_position: 1
sidebar_icon: sparkles
sidebar_label: Apa itu Tanya dPanel
---

**Tanya dPanel** (**Ask dPanel** di tampilan bahasa Inggris) adalah asisten AI yang terpasang di dPanel. Anda mengetik pertanyaan atau permintaan dengan bahasa sehari-hari, misalnya "Kenapa situs saya mati?" atau "Buatkan basis data MariaDB untuk WordPress", lalu asisten memeriksa ruang kerja Anda, menjawab, dan menyiapkan perubahan untuk Anda setujui. Tidak ada yang berubah sampai Anda menekan **Setujui**.

Anda tidak perlu hafal perintah server untuk memakainya. Kalau Anda belum pernah mengelola server, asisten ini cara yang baik untuk belajar: tanyakan arti sesuatu, dan asisten menjawab berdasarkan dokumentasi ini beserta tautan ke halamannya.

![Panel Asisten dPanel yang terbuka di samping dasbor, dengan tiga contoh pertanyaan](../../assets/getting-started/assistant.webp 'Asisten terbuka di samping halaman mana pun dan bekerja di ruang kerja Anda saat ini.')

## Di mana menemukannya

Setelah masuk, tekan **Tanya dPanel** di kanan bawah halaman mana pun. Panel **Asisten dPanel** (**dPanel assistant**) terbuka di sisi kanan. Di ponsel, tombolnya hanya menampilkan ikon chat.

![Tombol bundar Tanya dPanel di kanan bawah dasbor](../../assets/ai/launcher-button.webp 'Tombolnya ada di kanan bawah setiap halaman.')

Anda juga bisa berbicara dengan asisten yang sama dari terminal lewat `dnocs ai chat`. Lihat [Memakai AI di terminal](./ai-in-the-terminal.md).

## Apa yang bisa dilakukannya

| Anda ingin…                                             | Yang dilakukan asisten                                                                                                                                                                                                            |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Belajar cara melakukan sesuatu di dPanel                | Mencari di dokumentasi ini dan menjawab dengan langkah-langkahnya beserta tautan ke halamannya                                                                                                                                    |
| Melihat apa yang Anda punya                             | Menampilkan dan menjelaskan server (beserta CPU, memori, disk, dan apakah layanannya berjalan), aplikasi, deployment, basis data, domain, record DNS, load balancer, kunci SSH, akun cloud, grup server, cluster, worker, dan job |
| Mencari tahu kenapa sesuatu gagal                       | Membaca log build dan runtime, error job, log load balancer, dan sertifikat, lalu menyebutkan kemungkinan penyebab dan perbaikannya. Lihat [Mendiagnosis masalah dengan AI](./diagnose-problems.md)                               |
| Meluncurkan atau menyiapkan server                      | Mengusulkan server cloud baru (dengan perkiraan biaya) yang bergabung lewat agen dPanel, menjalankan ulang penyiapan server, atau memasang perangkat lunak seperti PHP, Node.js, MariaDB, atau PostgreSQL                         |
| Menambahkan basis data untuk aplikasi                   | Mengusulkan basis data dan pengguna MariaDB atau PostgreSQL; dPanel membuat kata sandinya dan menampilkannya sekali kepada Anda. Asisten juga memberi tautan **DB Manager** untuk menelusuri datanya                              |
| Membuat, mengatur, dan merilis aplikasi                 | Membaca repositori GitHub Anda, menanyakan cara membuild dan menjalankannya, memilihkan port yang kosong, mengatur variabel lingkungan, dan mengusulkan rilisnya                                                                  |
| Memasang aplikasi di sebuah domain                      | Mengusulkan load balancer dengan HTTPS gratis di Caddy, APISIX, atau HAProxy, atau load balancer TCP/UDP (L4) untuk kebutuhan seperti basis data                                                                                  |
| Membuka atau menutup port                               | Mengusulkan aturan firewall dan penerapannya ke server, serta memperingatkan Anda kalau firewall akan memblokir load balancer TCP/UDP yang baru                                                                                   |
| Mengelompokkan server atau membangun cluster Kubernetes | Mengusulkan grup server serta cluster k3s atau RKE2, dan bisa memasang ulang cluster yang gagal                                                                                                                                   |
| Memilih tempat job dijalankan                           | Memberi tahu apakah ruang kerja memakai worker bersama atau privat, dan mengusulkan peralihannya                                                                                                                                  |
| Melihat siapa yang mengubah sesuatu                     | Membaca riwayat audit ruang kerja (butuh level admin ruang kerja)                                                                                                                                                                 |
| Bersih-bersih                                           | Mengusulkan penghapusan dengan urutan yang benar, dan memberi tahu apa yang harus dihapus lebih dulu                                                                                                                              |

Lihat [kumpulan contoh perintah](./prompt-cookbook.md) untuk permintaan siap salin bagi setiap kebutuhan di atas.

## Apa yang tidak bisa dilakukannya

- **Asisten tidak bisa mengubah apa pun tanpa Anda.** Setiap perubahan menunggu di kartu persetujuan. Lihat [Setujui atau tolak perubahan](./approvals-and-secrets.md).
- **Asisten tidak bisa melihat rahasia Anda.** Kata sandi, token, kunci, dan nilai variabel lingkungan disembunyikan darinya; asisten hanya melihat nama variabel.
- **Asisten tidak bisa masuk ke server Anda.** Ia tidak punya akses shell atau SSH. Ia hanya bekerja lewat dPanel, sebagai Anda.
- **Asisten tidak bisa membaca data di dalam basis data Anda** atau menjalankan SQL. Sebagai gantinya ia memberi tautan DB Manager.
- **Asisten tidak bisa melakukan apa yang tidak bisa dilakukan akun Anda.** Peran Anda di ruang kerja tetap berlaku. Lihat [Anggota dan peran](../teams/members-and-roles.md).
- **Asisten hanya membantu urusan dPanel.** Pertanyaan tentang hal lain dijawab dengan sopan bahwa ia hanya bisa membantu soal dPanel.
- **Beberapa hal belum tersedia lewat chat**, seperti menambah atau mengubah record DNS secara manual, mengubah anggota tim, atau menghubungkan akun cloud. Asisten akan memberi tahu dan menunjukkan halaman yang tepat.

Selengkapnya di [Batasan dan privasi AI](./limits-and-privacy.md).

## Cara asisten menjaga keamanan Anda

1. **Membaca langsung dijalankan.** Pertanyaan hanya membaca dPanel, jadi Anda langsung mendapat jawaban.
2. **Perubahan menunggu Anda.** Apa pun yang membuat, mengubah, menghapus, atau memakan biaya muncul sebagai kartu bertanda **Menunggu persetujuan Anda**, lengkap dengan apa yang akan terjadi. Perubahan hanya dijalankan saat Anda menekan **Setujui**, persis seperti yang ditampilkan, dan hanya sekali.
3. **Hanya Anda yang bisa menyetujui.** Percakapan milik orang yang memulainya. Rekan tim Anda tidak bisa melihatnya atau menyetujui kartunya, dan perubahan dijalankan dengan akses Anda sendiri.
4. **Rahasia tetap di luar chat.** Kata sandi yang harus Anda berikan diketik di kolom pada kartu, tidak pernah di chat. Kata sandi yang dibuat dPanel untuk Anda ditampilkan sekali di kartu setelah Anda menyetujuinya.
5. **Persetujuan kedaluwarsa.** Kartu yang tidak dijawab kedaluwarsa setelah 24 jam. Minta lagi untuk mendapatkan kartu baru.
6. **Semuanya tercatat.** Perubahan yang disetujui menjalankan job dPanel biasa, yang muncul di aktivitas dan riwayat audit ruang kerja seperti perubahan lainnya.

## Langkah berikutnya

- [Percakapan AI pertama Anda](./first-conversation.md): panduan singkat dengan tangkapan layar.
- [Kumpulan contoh perintah](./prompt-cookbook.md): permintaan nyata untuk tugas sehari-hari.
- [Setujui atau tolak perubahan](./approvals-and-secrets.md): cara membaca kartu.
- [Memakai agen AI Anda sendiri](./your-own-ai-agent.md): biarkan Claude Code, Cursor, atau agen lain bekerja lewat dPanel.
- Belum kenal istilahnya? Lihat [Glosarium](../getting-started/glossary.md).

## Pertanyaan yang sering diajukan

### Apakah bertanya bisa memakan biaya?

Tidak. Pertanyaan hanya membaca dPanel. Hanya perubahan yang disetujui yang bisa memakan biaya, dan biayanya sama seperti kalau Anda melakukannya sendiri: server cloud baru, misalnya, ditagih oleh penyedia cloud Anda. Asisten menyebutkannya sebelum Anda menyetujui, beserta perkiraan harganya.

### Apakah asisten bisa mengubah server saya tanpa bertanya?

Tidak. Pertanyaan hanya membaca. Setiap perubahan menunggu Anda menekan **Setujui** di kartunya, atau menjalankan `dnocs ai approve` di terminal.

### Di ruang kerja mana asisten bekerja?

Di ruang kerja tempat Anda berada saat bertanya. Pindah ruang kerja dulu untuk bertanya tentang ruang kerja lain. Lihat [Ruang kerja](../getting-started/workspaces.md).

### Bolehkah saya bertanya dalam bahasa Indonesia?

Boleh. Bertanyalah dalam bahasa Indonesia atau Inggris, dan asisten menjawab dalam bahasa yang sama.

### Apakah rekan tim saya bisa melihat percakapan saya?

Tidak. Percakapan bersifat pribadi bagi orang yang memulainya. Rekan tim melihat perubahan yang Anda setujui, karena perubahan itu berjalan sebagai job dPanel biasa.
