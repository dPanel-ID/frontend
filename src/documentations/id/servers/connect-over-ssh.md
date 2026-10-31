---
title: 'Terhubung lewat SSH'
description: 'Terminal di browser, dan menghubungkan dari komputer Anda sendiri.'
sidebar_position: 7
---

Sebagian besar waktu Anda tidak memerlukan terminal: tab yang ada sudah mencakup layanan, pengguna, berkas dan log. Saat memang perlu, tekan Open terminal di bagian atas halaman server. dPanel masuk memakai kunci yang disimpannya lalu menurunkan Anda ke shell.

![Sesi shell server di dalam browser](../../assets/servers/server-terminal.png)

Tidak ada yang perlu dipasang di komputer Anda dan Anda tidak memerlukan kunci privatnya. Sesi ini memakai pengguna login yang disiapkan dPanel, yaitu ubuntu di Google Cloud dan AWS, serta dpanel di DigitalOcean.

## Dari komputer Anda sendiri

Bila lebih suka terminal sendiri, hubungkan dengan klien SSH apa pun memakai login yang tertera di kepala halaman server.

```bash
ssh ubuntu@203.0.113.10
```

Agar bisa, kunci publik komputer Anda harus ada di server. Kunci yang dibuat dPanel tetap berada di dalam dPanel, jadi tambahkan kunci Anda ke berkas authorized_keys milik server, lewat tab Files atau terminal browser di atas.

```bash
echo "ssh-ed25519 AAAA... anda@contoh.com" >> ~/.ssh/authorized_keys
```

Ganti contoh itu dengan kunci publik Anda. Di komputer Anda biasanya ada di ~/.ssh/id_ed25519.pub.
