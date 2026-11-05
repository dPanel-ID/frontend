---
title: Memakai agen AI Anda sendiri
description: Biarkan Claude Code, Cursor, Codex, atau agen AI coding lain mengelola dPanel dengan aman lewat CLI dnocs dan asisten dPanel, serta membaca llms.txt.
sidebar_position: 7
sidebar_icon: bot
sidebar_label: Agen AI Anda sendiri
---

Kalau Anda sudah bekerja dengan agen AI coding, seperti Claude Code, Cursor, Codex, atau GitHub Copilot, agen itu bisa mengelola dPanel untuk Anda lewat **dnocs**, alat baris perintah dPanel. Agen berbicara dengan asisten dPanel memakai `dnocs ai chat`, dan setiap perubahan tetap harus disetujui lewat `dnocs ai approve`. Agen juga bisa membaca dokumentasi ini dari `llms.txt` dan `llms-full.txt`.

## Cara kerjanya

1. Anda sendiri yang memasang dnocs dan masuk. Lihat [Memakai AI di terminal](./ai-in-the-terminal.md).
2. Anda memberi tahu agen cara memakai dPanel (instruksinya ada di bawah).
3. Agen meminta apa yang Anda inginkan ke asisten dPanel, misalnya "Rilis repositori saya ke server 145 dan pasang di shop.example.com".
4. Asisten dPanel mengusulkan setiap perubahan dengan ID tindakan (`aipa_…`).
5. Perubahan baru dijalankan saat `dnocs ai approve <action-id>` dijalankan.

Agen tidak pernah memanggil API dPanel atau penyedia cloud Anda secara langsung, dan tidak pernah mengubah server secara manual. Semuanya melewati asisten dPanel, sehingga setiap perubahan diusulkan, disetujui, dan dicatat dengan cara yang sama seperti di aplikasi web.

:::warning[Tentukan siapa yang menyetujui]
Agen menjalankan perintah sebagai Anda, dengan sesi dPanel Anda. Kalau agen boleh menjalankan `dnocs ai approve` sendiri, ia bisa menyetujui perubahan atas nama Anda. Minta agen menunjukkan setiap usulan dan menunggu "ya" dari Anda sebelum menyetujui, atau jalankan sendiri perintah approve-nya. Setujui penghapusan dan resource berbayar, seperti server cloud baru, hanya setelah Anda membacanya.
:::

## Berikan instruksi ke agen Anda

Tempelkan ini ke berkas instruksi agen Anda, seperti `AGENTS.md`, `CLAUDE.md`, atau aturan Cursor, atau langsung ke chat:

```markdown
## dPanel

dPanel (https://dnocs.devetek.app) mengelola server, aplikasi, basis data, domain, dan load balancer saya.
Kelola hanya lewat CLI dnocs dan asistennya:

- `dnocs ai chat "<permintaan>"` bertanya ke asisten dPanel. Berikan ID dan nama. Asisten membaca yang
  dibutuhkannya dan, untuk setiap perubahan, mengusulkannya lalu mencetak action id (aipa\_…). Belum ada yang berubah.
- `dnocs ai chat --conversation <aic_id> "<permintaan>"` melanjutkan percakapan yang sama.
- `dnocs ai approve <aipa_id>` menjalankan satu perubahan yang diusulkan, persis seperti usulannya. `--reject` menolaknya.
  Tunjukkan setiap usulan kepada saya dan tunggu "ya" yang tegas dari saya sebelum menyetujui.
- Setujui satu perubahan setiap kali. Ikuti job-nya dengan `dnocs execution list --server-id <id> --limit 3`
  sampai statusnya succeeded atau failed; kalau gagal, tanyakan penyebabnya ke asisten.
- Jangan pernah memanggil API dPanel atau penyedia cloud secara langsung, jangan mengubah server secara manual, dan
  jangan menaruh kata sandi, token, atau kunci di pesan chat. Rahasia yang harus saya berikan diminta oleh
  `dnocs ai approve`; rahasia yang dibuat dicetak sekali oleh `dnocs ai approve`: segera serahkan kepada saya.
- Jangan memilih port: dPanel memilih port yang kosong. Untuk aplikasi tanpa definisi .devetek, beri tahu
  asisten bahasa dan versinya, perintah build, dan perintah start.
- Pertanyaan cara pakai: baca https://dnocs.devetek.app/llms.txt dan halaman yang ditautkannya.
```

Tim dPanel memakai versi instruksi yang lebih lengkap, yaitu skill **dpanel-cli-ai**, untuk menguji dPanel dari ujung ke ujung dengan agen AI (server, MariaDB, rilis WordPress, load balancer HTTPS, dan pembersihannya, semuanya lewat `dnocs ai`). Aturan di atas adalah intinya.

## Contoh permintaan yang baik untuk agen Anda

- "Dengan dPanel, rilis repositori ini ke server 145 dan pasang di domain shop.example.com dengan HTTPS."
- "Dengan dPanel, cari tahu kenapa rilis terakhir aplikasi Shop gagal dan usulkan perbaikannya."
- "Dengan dPanel, buat basis data PostgreSQL untuk aplikasi ini di server 145 dan atur variabel basis data aplikasinya."
- "Dengan dPanel, buka port 8080 di server 145 untuk API staging."

Permintaan lainnya ada di [kumpulan contoh perintah](./prompt-cookbook.md).

## Dokumentasi untuk AI: llms.txt dan llms-full.txt

Dokumentasi dPanel diterbitkan dalam dua berkas teks biasa yang bisa dibaca alat AI:

| Berkas                                                   | Isinya                                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [llms.txt](https://dnocs.devetek.app/llms.txt)           | Indeks singkat: setiap halaman dokumentasi beserta judul, tautan, dan deskripsi satu barisnya |
| [llms-full.txt](https://dnocs.devetek.app/llms-full.txt) | Seluruh dokumentasi berbahasa Inggris dalam format Markdown, halaman demi halaman             |

Arahkan agen atau chatbot Anda ke `llms.txt` untuk menemukan halaman yang tepat, atau berikan `llms-full.txt` agar ia menjawab dari seluruh isinya sekaligus. Asisten dPanel sendiri menjawab pertanyaan cara pakai dari `llms-full.txt`.

## Pertanyaan yang sering diajukan

### Apakah agen saya butuh akun dPanel sendiri?

Tidak. Agen memakai sesi dnocs yang Anda pakai saat masuk, jadi ia bekerja dengan akses dan peran Anda. Apa pun yang disetujuinya berjalan sebagai Anda.

### Bisakah agen saya melewati langkah persetujuan?

Tidak di dPanel: setiap perubahan tetap butuh `dnocs ai approve`. Namun agen yang diizinkan menjalankan perintah bisa menjalankan perintah itu sendiri, jadi minta agen menunggu "ya" dari Anda, seperti pada instruksi di atas.

### Bisakah saya memberikan sesi browser saya ke agen alih-alih masuk?

Lebih baik masuk sendiri dengan `dnocs auth login`. Sebuah sesi sama kuatnya dengan kata sandi Anda; jauhkan dari chat, berkas yang Anda bagikan, dan tangkapan layar.

### Agen apa saja yang bisa dipakai?

Agen apa pun yang bisa menjalankan perintah terminal, seperti Claude Code, Cursor, Codex, Gemini CLI, atau GitHub Copilot dalam mode agen.
