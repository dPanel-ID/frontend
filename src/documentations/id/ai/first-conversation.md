---
title: Percakapan AI pertama Anda
description: Langkah demi langkah percakapan pertama dengan Tanya dPanel, asisten AI dPanel. Buka panel, ajukan pertanyaan, baca jawaban, dan lihat apa yang diperiksanya.
sidebar_position: 2
sidebar_icon: message-square
sidebar_label: Percakapan pertama
---

Percakapan pertama Anda dengan **Tanya dPanel** (**Ask dPanel** di tampilan bahasa Inggris), asisten AI dPanel, hanya butuh sekitar dua menit: buka panel, ajukan pertanyaan, lalu baca jawabannya. Halaman ini memandu Anda lengkap dengan tangkapan layar. Tidak ada langkah di sini yang mengubah server Anda.

Anda perlu akun dPanel dan sudah masuk. Lihat [Masuk](../getting-started/sign-in.md). Punya satu server akan membantu, tetapi tidak wajib; kalau belum punya, ajukan pertanyaan cara pakai saja.

## 1. Buka asisten

1. Masuk dan buka halaman mana pun, misalnya **Dasbor**.
2. Tekan **Tanya dPanel** di kanan bawah.
3. Panel **Asisten dPanel** (**dPanel assistant**) terbuka. Di bawah **Tanyakan tentang infrastruktur Anda** (**Ask about your infrastructure**) ada tiga contoh pertanyaan.

![Panel asisten yang masih kosong dengan judul Ask about your infrastructure dan tiga contoh pertanyaan](../../assets/ai/panel-empty.webp 'Tekan salah satu contoh pertanyaan, atau ketik pertanyaan Anda sendiri di bagian bawah.')

Kalimat di bawah judul, **Bekerja di workspace Anda saat ini. Perubahan hanya dijalankan setelah Anda setujui.**, merangkum seluruh cara asisten menjaga keamanan dalam satu kalimat. Asisten hanya melihat ruang kerja yang tampil di bagian atas sidebar. Lihat [Ruang kerja](../getting-started/workspaces.md) kalau Anda punya lebih dari satu.

## 2. Ajukan pertanyaan

1. Tekan **Server mana saja yang sedang berhenti?**, atau ketik pertanyaan Anda sendiri di **Tanyakan tentang server, aplikasi, domain…**.
2. Tekan Enter untuk mengirim. Shift+Enter membuat baris baru.
3. Selama bekerja, panel menampilkan **Memeriksa dPanel… tugas yang lebih panjang bisa memakan satu sampai dua menit.**

## 3. Baca jawabannya

Jawaban muncul di bawah pertanyaan Anda, sering kali berupa tabel singkat berisi ID dan nama setiap resource.

![Asisten menjawab bahwa tidak ada server yang berhenti, dengan tabel dua server yang siap dan baris Checked: server list](../../assets/ai/first-answer.webp 'Di bawah setiap jawaban, Diperiksa mencantumkan apa saja yang dilihat asisten.')

Di bawah jawaban, **Diperiksa:** (**Checked:**) mencantumkan apa yang dilihat asisten untuk menjawab, seperti **server list**. Dari situ Anda tahu bahwa jawabannya berasal dari ruang kerja Anda yang sebenarnya, bukan tebakan.

ID di jawaban adalah angka yang sama dengan yang Anda lihat di dPanel, jadi Anda bisa mencari server atau aplikasinya sendiri, atau memakai ID itu di pertanyaan berikutnya: "Tampilkan detail server 140".

## 4. Ajukan pertanyaan cara pakai

Asisten juga mengenal dokumentasi ini. Tanyakan cara melakukan sesuatu, dan asisten menjawab dengan langkah-langkahnya beserta tautan ke halamannya.

![Asisten menjelaskan cara melakukan rollback aplikasi dalam lima langkah bernomor, diakhiri tautan Docs dan Checked: docs search](../../assets/ai/howto-answer.webp 'Jawaban cara pakai berasal dari dokumentasi dPanel, beserta tautan ke halamannya.')

Contoh pertanyaan cara pakai yang bagus untuk memulai:

- "Apa itu load balancer, dan apakah saya membutuhkannya?"
- "Bagaimana cara menghubungkan server saya sendiri ke dPanel?"
- "Bagaimana cara mengembalikan aplikasi ke build sebelumnya?"
- "Apa yang ditampilkan tampilan Builds di sebuah aplikasi?"

## 5. Lanjutkan, atau mulai dari awal

- **Ajukan pertanyaan lanjutan.** Asisten mengingat percakapan, jadi "lalu mana yang paling banyak memakai disk?" bisa dipakai setelah pertanyaan tentang server.
- **Mulai dari awal.** Tekan **Percakapan baru** di bagian atas panel untuk mengosongkan chat. Memulai percakapan baru tidak membatalkan apa pun.
- **Tutup panel.** Tekan **×**. dPanel mengingat percakapan terakhir Anda untuk setiap ruang kerja di browser ini, jadi percakapan itu masih ada saat Anda membuka panel lagi, termasuk kartu yang masih menunggu persetujuan.

## 6. Coba perubahan pertama Anda (opsional)

Kalau sudah siap, minta sesuatu yang kecil, misalnya "Di server 140, buat basis data MariaDB bernama blog dengan pengguna bernama blog". Asisten memeriksa apa yang dibutuhkannya lalu menampilkan kartu bertanda **Menunggu persetujuan Anda**. Baca kartunya, lalu tekan **Setujui** untuk menjalankannya atau **Tolak** untuk membatalkannya. Baca [Setujui atau tolak perubahan](./approvals-and-secrets.md) sebelum persetujuan pertama Anda.

## Tips bertanya

- **Spesifiklah.** "Kenapa build terakhir My Shop gagal?" jauh lebih baik daripada "Ada yang rusak".
- **Sebut namanya.** Pakai nama atau ID server, aplikasi, atau domain.
- **Katakan apa yang Anda mau, bukan caranya.** "Pasang aplikasi saya di shop.example.com dengan HTTPS" sudah cukup; asisten yang menyusun langkah-langkahnya.
- **Jangan pernah menempelkan kata sandi, token, atau kunci** di chat. Lihat [Batasan dan privasi AI](./limits-and-privacy.md).

## Pertanyaan yang sering diajukan

### Panel menampilkan "Masuk untuk memakai asisten". Apa yang harus saya lakukan?

Tekan **Masuk**. Asisten bekerja dengan akses dPanel Anda sendiri, jadi Anda harus masuk terlebih dahulu.

### Panel menampilkan "Asisten belum tersedia". Lalu bagaimana?

dPanel tidak bisa menjangkau layanan asisten. Tunggu sebentar, lalu tekan **Periksa lagi**.

### Jawaban gagal dengan pesan "Asisten tidak dapat menjawab pesan ini". Apakah ada yang rusak?

Biasanya tidak. Tekan **Coba lagi**. Kalau terus gagal, ajukan pertanyaan yang lebih pendek dan spesifik.

### Kenapa pertanyaan panjang bisa memakan satu sampai dua menit?

Asisten mungkin membaca beberapa hal sebelum menjawab, seperti sebuah deployment, log build-nya, dan penggunaan disk server. Setiap pembacaan butuh waktu sebentar.
