---
title: Masalah umum & solusi
description: Solusi masalah umum di dPanel seputar server, peluncuran cloud, build aplikasi, GitHub, load balancer, HTTPS, DNS, log, dan akses ruang kerja.
sidebar_position: 1
sidebar_icon: circle-help
sidebar_label: Masalah umum
---

Halaman ini mengumpulkan masalah yang paling sering dialami pengguna dPanel, beserta apa yang Anda lihat dan apa yang perlu dilakukan. Setiap jawaban dimulai dari pesan atau gejala seperti yang ditampilkan dPanel. Kalau masalah Anda tidak ada di sini, tanyakan ke [Tanya dPanel](../getting-started/ask-dpanel.md) atau [hubungi dukungan](#meminta-bantuan).

## Server

### Halaman server menampilkan "Penyiapan tidak selesai"

Banner merah berarti penyedia cloud atau proses penyiapan berhenti karena error. Tekan **Lihat penyebabnya** untuk membaca alasannya. Penyebab paling umum adalah kuota akun cloud yang tidak cukup, dan kredensial yang sudah kedaluwarsa atau kurang izin. Kuota dan izin yang perlu diperiksa ada di halaman tiap penyedia: lihat [Penyedia cloud](../servers/cloud-providers/index.md).

Perbaiki penyebabnya di sisi penyedia, lalu buka tab **Pengaturan** server dan pakai **Instal ulang** di bagian **Penyiapan**, atau **Pasang ulang server** di **Tindakan lain** (⋯), untuk menjalankan penyiapan sekali lagi. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md).

### Peluncuran gagal dengan error dari penyedia

Baca alasannya di **Lihat penyebabnya**. Yang paling sering muncul:

| Error dari penyedia                                  | Yang perlu dilakukan                                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `QUOTA_EXCEEDED`, atau batas VPC atau Droplet        | Naikkan kuota atau batasnya di penyedia, atau kosongkan satu slot.                                                                                                        |
| `Forbidden.RiskControl` (Alibaba Cloud)              | Selesaikan verifikasi nama asli dan tambahkan metode pembayaran. Lihat [Alibaba Cloud](../servers/cloud-providers/provider-alibabacloud.md#akun-harus-diizinkan-membeli). |
| `UnauthorizedOperation` terkait pembayaran (Tencent) | Beri sub-user hak pembayaran. Lihat [Tencent Cloud](../servers/cloud-providers/provider-tencent.md#sub-user-harus-diizinkan-membayar).                                    |
| Saldo habis, atau tagihan ditolak (IDCloudHost)      | Isi ulang saldo akun tagihan. Lihat [IDCloudHost](../servers/cloud-providers/provider-idcloudhost.md).                                                                    |

### Kartu ukuran menampilkan "This provider can't serve that CPU and memory pair"

Penyedia tidak menjual mesin dengan kombinasi CPU dan RAM persis seperti itu. Geser salah satu slider ke nilai lain. Nilai yang tidak bisa dilayani penyedia dicoret.

### Akun cloud berstatus "Gagal terhubung"

Penyedia menolak kuncinya. Periksa kunci itu di penyedia, lalu ganti dengan **Perbarui kredensial** di menu **Lebih** (⋯) akun tersebut. Lihat [Merotasi kredensial](../servers/cloud-providers/cloud-credentials-security.md#merotasi-kredensial).

### Server tidak bisa dihapus

Penghapusan ditolak selama masih ada aplikasi atau load balancer yang memakai server itu. Hapus dulu keduanya, lalu coba lagi. Lihat [Menghapus server](../servers/delete-a-server.md).

### Dasbor menampilkan "Tidak ada kontak dengan" sebuah server

Agen dPanel di server itu sudah lama tidak melapor. Server mungkin mati, kelebihan beban, atau terputus dari jaringan. Buka dari **Perlu perhatian Anda** dengan **Buka server**, lalu periksa apakah server bisa dijangkau.

## Aplikasi

### Tombol Lanjut tetap nonaktif di langkah Setup aplikasi

Periksa **Nama aplikasi**. Nama hanya boleh berisi huruf, angka, dan spasi. Nama seperti `my-app` atau `my_app` ditolak, dan kolomnya menjelaskan alasannya di bawahnya. Gunakan `My App` sebagai gantinya. Bilah di bagian bawah formulir mencantumkan apa saja yang masih kurang.

### "Tidak ada server yang siap" saat memilih server

Hanya server yang berstatus **Siap** yang bisa menjalankan aplikasi. Tunggu sampai server baru selesai disiapkan, perbaiki server yang penyiapannya gagal, atau tekan **Tambah server baru**. Lihat [Server di dPanel](../servers/overview.md).

### "Port … sudah digunakan di server ini"

Ada layanan lain yang sudah memakai port itu. Pilih port yang tidak tercantum di **Port yang sudah digunakan**. Saat mulai, dPanel menyarankan port kosong antara 7000 dan 10000.

### Build gagal

Buka **Rilis**, cari build berstatus **Gagal**, lalu tekan **Log**. Baris-baris terakhir biasanya menyebut langkah dan error-nya. Perbaiki di repositori atau di **Pengaturan**, lalu tekan **Bangun dan rilis**. Lihat [Rilis dan rollback](../applications/deployments-and-rollback.md#membaca-log-build).

### Build berhenti setelah sekitar 20 menit

Setiap pekerjaan build dan deployment punya batas waktu bawaan 20 menit, dan log-nya berakhir dengan `context deadline exceeded`. Build yang banyak mengompilasi, atau server dengan CPU kecil, bisa melewatinya.

Batas ini bisa dinaikkan per aplikasi lewat `build.timeout` di definisi aplikasi, berupa durasi antara `1m` dan `3h`:

```yaml
build:
  timeout: 90m
```

Formulir web belum punya kolom ini. Atur di file definisi yang Anda deploy lewat alat command-line dPanel. Cara lainnya, pakai server yang lebih besar agar build lebih cepat. Lihat [Batas waktu build](../applications/build-timeout.md).

### "Sesi GitHub kedaluwarsa" atau "Hubungkan ulang GitHub"

GitHub tidak lagi mengonfirmasi akun yang tersimpan. Tekan **Hubungkan ulang GitHub** atau **Login ulang GitHub**, lalu masuk lagi ke GitHub. Aplikasi Anda tetap berjalan selama itu. Lihat [Menghubungkan GitHub](../getting-started/connect-github.md).

### Organisasi GitHub saya tidak ada di daftar

Buka **Tim GitHub** di **Buat Aplikasi** lalu pilih **Tambah akun GitHub**. Pasang GitHub App dnocs-id di organisasi itu, dan beri akses ke repositorinya.

## Load balancer, HTTPS, dan DNS

### Server saya tidak bisa dipilih sebagai gateway

Hanya server yang siap yang bisa menjalankan load balancer. Tunggu sampai penyiapan selesai, atau perbaiki servernya dulu.

### Situs belum bisa di-resolve tepat setelah load balancer dibuat

Resolver Anda mungkin masih menyimpan jawaban "tidak ditemukan" dari sebelum record-nya ada. Tunggu beberapa menit, atau periksa dengan resolver publik: `dig @1.1.1.1 app.example.com`. Untuk domain **Eksternal**, pastikan Anda sendiri sudah mengarahkan DNS-nya ke alamat publik gateway.

### Sertifikat HTTPS tidak terbit

Let's Encrypt harus bisa menjangkau gateway di port 80 dan 443, dan nama domainnya harus sudah mengarah ke gateway. Periksa keduanya; Caddy di gateway terus mencoba ulang dan mendapatkan sertifikat begitu bisa. Server yang dibuat dPanel sudah membuka port 80 dan 443; di DigitalOcean atau IDCloudHost, atau di server yang Anda hubungkan sendiri, periksa firewall Anda.

### dPanel menolak subdomain saya

Untuk domain **Terkelola**, dPanel tidak akan menimpa record DNS yang sudah ada. Pilih nama yang belum ada di zona; cari di [record DNS](../networking/dns-records.md) domain tersebut untuk memeriksanya.

## Log

### "Aplikasi ini belum punya perintah run atau server"

Log runtime berasal dari layanan yang sedang berjalan. Aplikasi tanpa perintah start, atau yang belum dirilis ke server, belum punya log. Lengkapi pengaturannya dan rilis dulu.

### Lognya kosong

Log hanya menampilkan rentang waktu yang Anda pilih. Perlebar rentangnya; yang paling panjang 10 hari. Kalau aplikasi baru saja dirilis, tunggu sebentar lalu tekan **Segarkan**. Lihat [Membaca log](../logs/reading-logs.md).

### "Lebih dari 100.000 baris" dan log tidak bisa diunduh

**Semua di rentang waktu ini** berhenti di 100.000 baris. Persempit rentang waktunya, atau unduh per halaman. Lihat [Mengunduh log](../logs/download-logs.md).

## Ruang kerja dan akses

### Server atau aplikasi saya hilang

Kemungkinan besar Anda sedang berada di ruang kerja lain. Periksa nama ruang kerja di bagian atas sidebar dan pindah kembali. Lihat [Ruang kerja](../getting-started/workspaces.md).

### Saya tidak menemukan Pindah Pemilik

dPanel tidak lagi memindahkan resource antar ruang kerja. Server, aplikasi, load balancer, domain, akun cloud, atau kunci SSH tetap berada di ruang kerja tempat ia dibuat. Buat resource baru di ruang kerja yang benar.

### "Anda tidak bisa melihat kesehatan ruang kerja ini"

Setiap anggota ruang kerja bisa membaca status eksekusi dan agennya. Jika pesan ini masih muncul, kemungkinan Anda bukan anggota ruang kerja yang dipilih: periksa pemilih ruang kerja, atau minta owner ruang kerja menambahkan Anda. Lihat [Anggota dan peran](../teams/members-and-roles.md).

### Asisten menyebut "Asisten belum tersedia"

dPanel tidak bisa menjangkau layanan asisten. Tekan **Periksa lagi** setelah beberapa saat. Lihat [Tanya dPanel](../getting-started/ask-dpanel.md).

## Meminta bantuan

Sebagian besar halaman daftar diakhiri dengan **Bantuan & Dukungan**:

- **Dokumentasi** membuka panduan ini.
- **Chat tim** membuka percakapan WhatsApp dengan tim dPanel.
- **Dukungan Email** menulis ke tim lewat email.

Saat menghubungi, sertakan nama server atau aplikasinya, apa yang Anda tekan, dan apa yang Anda lihat.
