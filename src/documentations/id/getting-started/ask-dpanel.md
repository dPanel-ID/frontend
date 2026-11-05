---
title: Tanya dPanel (asisten AI)
description: Tanya dPanel adalah asisten AI bawaan dPanel. Buka dari halaman mana pun, bertanya dengan bahasa sehari-hari, lalu setujui perubahan yang diusulkannya.
sidebar_position: 6
sidebar_icon: sparkles
sidebar_label: Tanya dPanel
---

**Tanya dPanel** (**Ask dPanel** di tampilan bahasa Inggris) adalah asisten AI yang terpasang di dPanel. Tekan **Tanya dPanel** di kanan bawah halaman mana pun, ajukan pertanyaan atau ceritakan apa yang Anda inginkan dengan bahasa sehari-hari, dan asisten menjawab berdasarkan ruang kerja Anda dan dokumentasi ini. Setiap perubahan yang disiapkannya menunggu di sebuah kartu sampai Anda menekan **Setujui**.

![Panel Asisten dPanel yang terbuka di samping dasbor, dengan tiga contoh pertanyaan](../../assets/getting-started/assistant.webp 'Asisten bekerja di ruang kerja Anda saat ini, dengan akses Anda sendiri.')

## Mulai dalam dua menit

1. Tekan **Tanya dPanel** di kanan bawah halaman mana pun. Panel **Asisten dPanel** (**dPanel assistant**) terbuka.
2. Tekan salah satu contoh pertanyaan, seperti **Server mana saja yang sedang berhenti?**, atau ketik pertanyaan Anda sendiri di **Tanyakan tentang server, aplikasi, domain…**.
3. Tekan Enter. Selama bekerja, panel menampilkan **Memeriksa dPanel…**.
4. Baca jawabannya. **Diperiksa:** di bawahnya mencantumkan apa saja yang dilihat asisten.
5. Kalau asisten mengusulkan perubahan, baca kartu bertanda **Menunggu persetujuan Anda**, lalu tekan **Setujui** atau **Tolak**.

Panduan lengkap beserta tangkapan layar ada di [Percakapan AI pertama Anda](../ai/first-conversation.md).

## Apa yang bisa ditanyakan

- "Bagaimana cara menghubungkan server saya sendiri?" (dijawab dari dokumentasi, beserta tautannya)
- "Kenapa aplikasi Shop gagal di server 145?"
- "Di server 145, buat basis data MariaDB bernama wordpress dengan pengguna bernama wp."
- "Pasang aplikasi Shop di shop.example.com dengan HTTPS."
- "Di server 145, izinkan port TCP 8080 lalu terapkan firewall."

Contoh lainnya ada di [kumpulan contoh perintah](../ai/prompt-cookbook.md).

## Semua tentang asisten

Bagian [Asisten AI](../ai/overview.md) membahasnya secara lengkap:

- [Apa itu Tanya dPanel](../ai/overview.md): apa yang bisa dan tidak bisa dilakukannya, serta cara asisten menjaga keamanan Anda.
- [Setujui atau tolak perubahan](../ai/approvals-and-secrets.md): membaca kartu, menangani rahasia, dan apa yang terjadi saat Anda menutup chat.
- [Mendiagnosis masalah dengan AI](../ai/diagnose-problems.md): biarkan asisten mencari tahu kenapa sesuatu gagal.
- [Memakai AI di terminal](../ai/ai-in-the-terminal.md): `dnocs ai chat` dan `dnocs ai approve`.
- [Memakai agen AI Anda sendiri](../ai/your-own-ai-agent.md): Claude Code, Cursor, dan lainnya, ditambah `llms.txt`.
- [Batasan dan privasi AI](../ai/limits-and-privacy.md): apa yang dilihat, disimpan, dan dikirim asisten.

## Pertanyaan yang sering diajukan

### Apakah asisten bisa mengubah server saya tanpa bertanya?

Tidak. Pertanyaan hanya membaca. Setiap perubahan menunggu Anda menekan **Setujui** di kartunya.

### Apakah asisten bisa melihat ruang kerja lain atau data orang lain?

Tidak. Asisten bekerja di ruang kerja Anda saat ini, dengan akses Anda sendiri, sama persis seperti halaman yang Anda buka sendiri.

### Bolehkah saya mengetik kata sandi di chat?

Jangan pernah. Pesan dikirim ke layanan model AI. Kalau sebuah perubahan membutuhkan kata sandi, kartunya menyediakan kolom khusus untuk itu. Lihat [Setujui atau tolak perubahan](../ai/approvals-and-secrets.md).
