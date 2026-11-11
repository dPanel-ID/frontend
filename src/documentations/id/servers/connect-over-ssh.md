---
title: Terhubung lewat SSH
description: Buka terminal ke server Anda langsung di browser dengan dPanel, atau masuk dari komputer sendiri memakai ssh dan kunci publik Anda.
sidebar_position: 7
sidebar_icon: square-terminal
---

dPanel menyediakan terminal di browser: tekan **Buka terminal** di bagian atas halaman server, lalu shell terbuka. Biasanya Anda tidak membutuhkannya, karena tab-tab di halaman server sudah mencakup layanan, pengguna, berkas, dan log.

- Di server yang terhubung dengan [agen dPanel](./register-a-private-machine.md), terminal diteruskan lewat agen. Yang terbuka adalah shell root, tanpa SSH dan tanpa kunci sama sekali.
- Di server yang terhubung lewat SSH, dPanel masuk dengan SSH key yang disimpannya.

Halaman ini membahas terminal. Untuk memilih cara server bergabung ke dPanel, lihat [Agen dPanel atau SSH: pilih yang mana?](./register-a-private-machine.md#agen-dpanel-atau-ssh-pilih-yang-mana).

![Sesi shell di server, langsung di dalam browser](../../assets/servers/server-terminal.webp)

Tidak ada yang perlu dipasang di komputer Anda, dan Anda tidak butuh kunci privat. Di server yang terhubung lewat SSH, sesi itu milik user login yang disiapkan dPanel. Bagian kepala server menampilkannya, misalnya `dpanel@203.0.113.10:22`.

| Server                                   | User login                     |
| ---------------------------------------- | ------------------------------ |
| Terhubung dengan agen dPanel             | `root`, lewat agen             |
| Google Cloud, AWS, Tencent Cloud (SSH)   | `ubuntu`                       |
| Alibaba Cloud                            | `root`                         |
| DigitalOcean, IDCloudHost (SSH)          | `dpanel`                       |
| Server yang Anda hubungkan lewat SSH     | User Linux yang Anda isi       |

## Dari komputer sendiri

Kalau lebih suka terminal sendiri, pakai klien SSH apa pun. Alamat server harus bisa dijangkau dari komputer Anda: lewat IP publik, atau dari jaringan sendiri untuk server rumahan. Pakai login yang tertera di kepala server, atau di server yang terhubung lewat agen, user Linux Anda sendiri.

```bash
ssh ubuntu@203.0.113.10
```

Supaya bisa, kunci publik komputer Anda harus ada di server. Kunci buatan dPanel tetap tinggal di dPanel. Tambahkan kunci Anda ke `authorized_keys` server, lewat terminal browser atau pengelola berkas.

```bash
echo "ssh-ed25519 AAAA... anda@example.com" >> ~/.ssh/authorized_keys
```

Ganti contoh itu dengan kunci publik Anda. Di komputer Anda, biasanya ada di `~/.ssh/id_ed25519.pub`.

## Pertanyaan yang sering diajukan

### Apakah saya perlu memasang sesuatu untuk memakai terminal di browser?

Tidak. **Buka terminal** bekerja di browser, lewat agen atau dengan kunci yang disimpan dPanel.

### Bisakah saya menjalankan perintah sebagai root?

Pengguna login bisa memakai `sudo`, jadi awali perintah dengan `sudo` kalau butuh hak administrator.

### Kenapa `ssh` dari komputer saya menolak dengan permission denied?

Kunci publik komputer Anda belum ada di server. Tambahkan ke `~/.ssh/authorized_keys` seperti di atas, sebagai pengguna login yang sama.

### Adakah perintah terminal sebagai ganti browser?

`dnocs server exec` menjalankan skrip shell di server lewat dPanel. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang `dnocs`.
