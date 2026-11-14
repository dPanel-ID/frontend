---
title: Batasan dan privasi AI
description: Apa yang dilihat dan disimpan asisten AI dPanel, apa yang disembunyikan, ke mana pesan Anda dikirim, batasannya, dan saat Tanya dPanel sibuk atau mati.
sidebar_position: 8
sidebar_icon: key-round
sidebar_label: Batasan dan privasi
---

**Tanya dPanel** (**Ask dPanel** di tampilan bahasa Inggris), asisten AI dPanel, hanya bekerja di dalam dPanel, dengan akses Anda sendiri, di ruang kerja Anda saat ini. Asisten tidak pernah melihat kata sandi, token, kunci, atau nilai variabel lingkungan Anda. Pesan Anda, beserta apa yang dibaca asisten untuk menjawabnya, dikirim ke layanan model AI untuk menyusun jawaban, jadi jangan pernah mengetik rahasia di chat.

## Apa yang bisa dilihat asisten

- **Hanya ruang kerja Anda saat ini.** Pindah ruang kerja untuk bertanya tentang ruang kerja lain.
- **Hanya yang bisa dilihat akun Anda.** Asisten membaca dPanel sebagai Anda, dengan akses yang sama seperti halaman yang Anda buka.
- **Nama, bukan rahasia.** dPanel membuang kata sandi, token, kunci, cookie, dan kredensial dari semua data sebelum dibaca asisten, dan hanya menunjukkan nama variabel lingkungan, tidak pernah nilainya.
- **Bukan data di basis data Anda.** Asisten tidak bisa menjalankan SQL atau membaca baris data.
- **Bukan server Anda secara langsung.** Asisten tidak punya akses shell atau SSH; ia membaca apa yang dilaporkan dPanel dan agent dPanel, seperti log dan penggunaan resource.
- **Dokumentasi ini.** Asisten menjawab pertanyaan cara pakai dari dokumentasi dPanel yang diterbitkan.

## Ke mana pesan Anda dikirim

1. Pesan Anda dikirim ke dPanel.
2. dPanel mengirimkannya, beserta percakapan sejauh ini dan hasil dari apa yang dibaca asisten, ke layanan model AI yang menyusun jawaban. Rahasia dibuang lebih dulu, seperti dijelaskan di atas.
3. dPanel menyimpan percakapan, supaya Anda bisa membukanya lagi, beserta catatan setiap tool yang dipakai asisten, yang terhubung ke riwayat audit ruang kerja.

Karena itu aturannya sederhana: **jangan pernah mengetik kata sandi, token, atau kunci di chat**. Kalau telanjur, anggap nilai itu sudah bocor dan segera ganti. Asisten tidak akan mengulang atau memakainya, dan akan meminta Anda mengetiknya di kartu persetujuan. Lihat [Setujui atau tolak perubahan](./approvals-and-secrets.md#rahasia-yang-anda-ketik).

Di luar chat, dPanel menyimpan rahasia yang Anda berikan dalam bentuk terenkripsi dan menyamarkan nilai variabel di layar. Lihat [Keamanan dan data Anda](../getting-started/security-and-your-data.md).

## Siapa yang bisa melihat percakapan Anda

- **Anda.** Percakapan milik orang yang memulainya, di ruang kerja tempat percakapan itu dimulai.
- **Bukan rekan tim Anda.** Mereka tidak bisa membuka percakapan Anda atau menyetujui kartu Anda.
- **Perubahan Anda tetap terlihat seperti biasa.** Perubahan yang disetujui berjalan sebagai job dPanel biasa, sehingga muncul di aktivitas dan riwayat audit ruang kerja, sama seperti perubahan yang dibuat dari halaman.

Browser Anda mengingat percakapan mana yang terakhir dibuka untuk setiap ruang kerja, supaya panel bisa menampilkannya lagi. Tekan **Percakapan baru** untuk memulai yang bersih.

## Batasan

| Batasan                                      | Artinya                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Hanya topik dPanel                           | Pertanyaan tentang hal lain dijawab bahwa asisten hanya bisa membantu soal dPanel                                 |
| Kartu persetujuan kedaluwarsa setelah 24 jam | Minta lagi untuk mendapatkan kartu baru                                                                           |
| Satu job pada satu waktu per server          | Setujui perubahan di server yang sama satu per satu                                                               |
| Job yang lama hanya diperiksa sekali         | Setelah rilis atau pemasangan, tanyakan lagi untuk melihat perkembangannya                                        |
| Harga hanya perkiraan                        | Harga server cloud berasal dari pengetahuan umum tentang harga publik, bukan dari tagihan penyedia Anda           |
| Belum semua tersedia lewat chat              | Misalnya menambah record DNS secara manual, mengelola anggota tim, dan menghubungkan akun cloud: pakai halamannya |
| Permintaan yang terlalu luas                 | Permintaan yang butuh terlalu banyak langkah akan berhenti; tanyakan satu hal setiap kali                         |

Asisten bisa keliru. Baca setiap kartu sebelum menyetujuinya, dan cocokkan jawaban penting dengan halamannya di dPanel; setiap jawaban mencantumkan ID dan nama agar Anda bisa melakukannya.

## Saat asisten sibuk atau tidak tersedia

Empat pesan terakhir di tabel ini dikirim oleh server asisten dan selalu tampil dalam bahasa Inggris.

| Pesan                                                                       | Yang perlu dilakukan                                                                               |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Asisten belum tersedia**                                                  | dPanel tidak bisa menjangkau asisten. Tekan **Periksa lagi** sebentar lagi                         |
| **Masuk untuk memakai asisten**                                             | Tekan **Masuk**; sesi Anda sudah berakhir                                                          |
| The assistant is busy right now. Please try again in a minute.              | Asisten sedang sibuk karena terlalu banyak permintaan. Tunggu semenit lalu tekan **Coba lagi**     |
| The AI model is unavailable right now. Please try again later.              | Layanan model AI sedang tidak tersedia. Coba lagi nanti, atau pakai halaman dPanel                 |
| The assistant took too long to answer. Please try again.                    | Asisten terlalu lama menjawab. Tekan **Coba lagi**, atau ajukan pertanyaan yang lebih sempit       |
| That request needed too many steps. Please ask for something more specific. | Permintaan butuh terlalu banyak langkah. Pecah permintaannya, dan sebutkan server atau aplikasinya |

Semua yang dilakukan asisten juga bisa Anda lakukan dari halaman dPanel atau dengan alat baris perintah dnocs, jadi Anda tidak akan buntu saat asisten sedang tidak tersedia.

## Pertanyaan yang sering diajukan

### Apakah dPanel melatih model AI dengan percakapan saya?

dPanel menyimpan percakapan Anda supaya bisa dibuka lagi dan supaya perubahan yang disetujui bisa diaudit; dPanel tidak punya fitur yang melatih model dengan percakapan itu. Layanan model AI menerima setiap permintaan untuk menyusun jawaban. Karena pesan Anda keluar dari dPanel, jauhkan rahasia dari pesan.

### Bisakah saya menghapus percakapan?

Belum ada tombol hapus. **Percakapan baru** memulai percakapan yang bersih, dan percakapan lama tidak lagi ditampilkan di browser Anda.

### Bisakah asisten melihat nilai variabel lingkungan saya?

Tidak. Asisten hanya melihat nama variabel. Nilai rahasia yang Anda ketik di kartu persetujuan dikirim bersama persetujuan Anda langsung ke dPanel, yang menyimpannya dalam bentuk terenkripsi. Lihat [Keamanan dan data Anda](../getting-started/security-and-your-data.md).

### Apakah asisten tersedia di ruang kerja personal saya?

Ya. Asisten bekerja di ruang kerja personal Anda dan di setiap ruang kerja tim tempat Anda bergabung, masing-masing dengan percakapannya sendiri.
