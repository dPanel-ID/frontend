---
title: Tim
description: Buat ruang kerja tim di dPanel untuk berbagi server, aplikasi, dan akun cloud dengan tim Anda, lalu ganti namanya atau hapus setelah selesai.
sidebar_position: 1
sidebar_icon: users
---

Tim di dPanel adalah ruang kerja bersama (ruang terpisah dengan server, aplikasi, dan pengaturannya sendiri; lihat [Glosarium](../getting-started/glossary.md)). Server, aplikasi, load balancer, domain, akun cloud, dan kunci SSH yang dibuat di dalamnya menjadi milik tim, dan setiap anggota bisa mengaksesnya sesuai [perannya](./members-and-roles.md). Dengan tim, rekan kerja tidak perlu lagi berbagi password server atau kunci SSH.

![Halaman Tim dalam tampilan tabel, menampilkan sebuah tim beserta statusnya, peran Anda, dan jumlah anggotanya](../../assets/teams/teams-list.webp 'Tim: semua ruang kerja tim tempat Anda bergabung, beserta peran Anda di masing-masing.')

Halaman ini diawali dengan ringkasan jumlah: tim yang Anda ikuti, tim yang **Milik Anda**, tim yang **Dibagikan ke Anda**, dan **Workspace aktif** Anda. Tabelnya mencantumkan setiap tim dengan **Status**, **Peran Anda**, **Anggota**, serta kapan tim itu dibuat dan diperbarui.

## Membuat tim

1. Buka pemilih ruang kerja di bagian atas sidebar lalu tekan **Ruang kerja baru**. Atau buka **Tim** dan tekan **Tambah Tim**.
2. **Nama ruang kerja**: nama yang mudah dikenali tim Anda, misalnya "Tim Backend".
3. Tambahkan deskripsi kalau membantu rekan yang nanti berpindah ke ruang kerja ini.
4. Tekan **Buat ruang kerja**.

Anda menjadi **Owner** tim yang baru dibuat.

## Langkah berikutnya

Pindah ke ruang kerja baru itu (lihat [Ruang kerja](../getting-started/workspaces.md)), lalu tambahkan rekan kerja Anda. Lihat [Anggota dan peran](./members-and-roles.md).

## Membuka tim

Di halaman **Tim**, pilih baris sebuah tim, atau tekan **Detil** (ikon mata) di baris itu. Halaman tim menampilkan jumlah anggota, **Peran Anda**, status tim, dan kapan tim dibuat, lalu tabel **Anggota** berisi nama, `@username`, peran setiap anggota, dan kapan mereka bergabung.

Di bawah daftar anggota, kartu **Worker** menampilkan **Tempat pekerjaan berjalan** untuk tim ini: **Worker bersama (dPanel)** atau **Worker privat**. Hanya owner dan admin tim yang bisa mengubahnya; anggota lain hanya bisa melihat. Lihat [Ringkasan worker](../workers/overview.md).

## Mengganti nama tim

1. Buka timnya.
2. Tekan **Ubah**.
3. Di **Ubah Tim**, ganti **Nama Tim** atau deskripsinya.
4. Simpan.

## Menghapus tim

1. Di halaman **Tim**, tekan **Hapus** (ikon tempat sampah) di baris tim tersebut. Hanya tim yang **Milik Anda** yang bisa dihapus.
2. Konfirmasi **Hapus Tim**.

:::danger[Pastikan tidak ada lagi yang dibutuhkan]
Menghapus tim berarti menghapus ruang kerjanya. Resource di dalam tim tidak bisa dipindahkan ke ruang kerja lain, jadi hapus tim hanya jika Anda tidak lagi membutuhkan apa pun di dalamnya. Hapus dulu server-servernya kalau Anda ingin penyedia cloud berhenti menagih. Lihat [Menghapus server](../servers/delete-a-server.md).
:::

## Pertanyaan yang sering diajukan

### Apa bedanya ruang kerja pribadi dengan tim?

Ruang kerja pribadi hanya milik Anda. Tim adalah ruang kerja bersama: semua yang dibuat di dalamnya milik tim, dan setiap anggota bekerja sesuai perannya.

### Bisakah saya memindahkan server dari ruang kerja pribadi ke tim?

Bisa, satu kali, dengan alat baris perintah dnocs: `dnocs transfer server --id <ID server> --to "<nama tim>"`. Tambahkan `--include-dependencies` untuk ikut memindahkan kunci SSH dan cloud project-nya. Anda butuh hak editor di tim itu. Setelah itu server tetap di tim; tidak bisa dipindah ke ruang kerja lain atau kembali. Cara yang sama berlaku untuk aplikasi, domain, load balancer, cloud project, dan kunci SSH. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang dnocs.

### Siapa yang bisa menghapus tim?

Hanya pemiliknya. Tombol hapus hanya muncul pada tim yang **Milik Anda**.

### Bisakah tim menjalankan pekerjaan di worker sendiri?

Bisa. Owner atau admin bisa mengalihkan tim ke **Worker privat** di halaman tim. Lihat [Ringkasan worker](../workers/overview.md).
