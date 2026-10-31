---
title: 'Sebelum mulai'
description: 'Dua hal yang disiapkan sekali, lalu dipakai ulang untuk server berikutnya.'
sidebar_position: 2
---

## SSH key

SSH key adalah sepasang berkas yang menggantikan kata sandi saat sebuah komputer masuk ke server. Satu bagian bersifat publik dan ditulis ke server; bagian lain bersifat privat dan tidak pernah keluar dari dPanel.

Anda tidak perlu membuatnya manual. Buka Backend, lalu SSH keys, lalu Create SSH key, dan beri nama yang mudah dikenali.

- Jenis kunci: pilih "For current servers" kecuali ada yang menolaknya. Kunci itu lebih pendek dan cepat, serta diterima semua Linux masa kini. "For older servers" adalah cadangannya, dan menanyakan ukuran kunci.
- Bagian privat tidak ditampilkan lagi. dPanel menyimpannya terenkripsi dan memakainya untuk Anda. Halaman kunci menampilkan bagian publik, yang aman disalin, dan fingerprint untuk dibandingkan dengan laporan server.

## Cloud project

Cloud project adalah sambungan dPanel ke akun Anda di penyedia cloud. Di sana tersimpan kredensial yang memungkinkan dPanel membuat mesin atas nama Anda. Buka Backend, lalu Cloud projects, lalu Add project, dan tempelkan kredensial dari penyedia Anda.

:::info[Siapa yang membayar mesinnya]
Mesin dibuat di dalam akun cloud Anda sendiri, jadi penyedia menagih Anda langsung. dPanel tidak menjual ulang mesin itu.
:::

![Formulir peluncuran menampilkan cloud project dan SSH key yang siap dipilih](../../assets/servers/create-step1-provider.png 'Jika keduanya siap, formulir menawarkannya, bukan meminta Anda menyambungkan.')
