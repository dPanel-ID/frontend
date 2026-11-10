---
title: Akun layanan
description: Beri skrip, pekerjaan CI, dan agen AI login dPanel sendiri dengan token yang bisa kedaluwarsa dan dicabut, tanpa membagikan kata sandi atau sesi seseorang.
sidebar_position: 4
sidebar_icon: key-round
---

**Akun layanan** adalah login dPanel untuk program, bukan untuk orang. Gunakan saat skrip, pekerjaan CI (build otomatis, seperti GitHub Actions), atau agen AI perlu bekerja dengan dPanel. Akun ini masuk memakai **token**, yaitu teks rahasia panjang yang berfungsi seperti kata sandi untuk satu program itu.

Mengapa tidak memakai login Anda sendiri? Sesi Anda berakhir setelah 7 hari, bisa melakukan semua yang Anda bisa, dan berhenti bekerja kalau Anda keluar dari tim. Akun layanan tetap bekerja, hanya punya akses yang Anda berikan, dan bisa dimatikan tanpa mengganggu orang lain.

## Personal atau tim

Tempat Anda membuat akun menentukan apa yang bisa dijangkaunya.

|                   | Di tim                                       | Personal                         |
| ----------------- | -------------------------------------------- | -------------------------------- |
| Buat di           | **Tim**, buka timnya, tab **Akun layanan**   | **Profil**, tab **Akun layanan** |
| Yang mengelola    | Pemilik dan admin tim                        | Anda                             |
| Bertindak sebagai | Dirinya sendiri, dengan identitasnya sendiri | Anda                             |
| Yang dijangkau    | Ruang kerja tim itu, dibatasi perannya       | Ruang kerja personal Anda saja   |
| Pengguna Linux    | Miliknya sendiri, kalau Anda menambahkannya  | Milik Anda                       |

Pilih akun tim untuk apa pun yang dipakai bersama. Akun itu tetap bekerja saat orang datang dan pergi.

## Membuat akun

1. Buka tab **Akun layanan** di tim atau profil Anda.
2. Tekan **Akun layanan baru**.
3. Isi **Nama** yang menjelaskan pemakainya, misalnya `github-actions`, dan **Deskripsi** bila perlu.
4. Untuk tim, pilih **Peran**. Berikan peran terkecil yang cukup:

   | Peran         | Yang bisa dilakukan                                         |
   | ------------- | ----------------------------------------------------------- |
   | **Viewer**    | Hanya membaca.                                              |
   | **Developer** | Men-deploy dan mengelola aplikasi.                          |
   | **DevOps**    | Mengelola server dan infrastruktur.                         |
   | **Admin**     | Mengelola seluruh tim. Hanya pemilik tim yang bisa memberi. |

5. Beri nama token sesuai tempat pemakaiannya, lalu pilih kapan **Berakhir**: 30 hari lagi, 90 hari lagi, 1 tahun lagi, atau **Tidak pernah**. Sebaiknya pilih masa berlaku.
6. Tekan **Buat**.

Sekarang token tampil di layar, diawali `dps_`.

:::warning[Salin tokennya sekarang]
Token hanya tampil sekali dan tidak bisa ditampilkan lagi, karena dPanel hanya menyimpan sidik jarinya. Simpan di pengelola kata sandi atau penyimpanan rahasia CI Anda. Perlakukan seperti kata sandi: jangan taruh di kode, obrolan, atau log.
:::

## Memakai token

Dengan [alat baris perintah dnocs](../ai/ai-in-the-terminal.md), atur `DNOCS_TOKEN`. Setiap perintah lalu memakai token itu, bukan sesi masuk, jadi pekerjaan CI tidak perlu langkah login:

```bash
DNOCS_TOKEN=dps_token_anda dnocs server list
```

Untuk memanggil API langsung, kirim token pada setiap permintaan:

```text
Authorization: Bearer dps_token_anda
```

Token sudah terikat ke satu ruang kerja, jadi ruang kerja yang dipilih dengan `dnocs workspace set` tidak berlaku untuknya.

## Mengganti atau menghentikan token

- **Mengganti token tanpa jeda:** tekan **Token baru** pada akun, ganti skrip Anda ke token baru, lalu tekan **Cabut** pada yang lama. Satu akun bisa punya 5 token aktif.
- **Menghentikan token:** tekan **Cabut**. Apa pun yang memakainya langsung berhenti, dan ini tidak bisa dibatalkan.
- **Menghapus akun:** semua tokennya langsung berhenti. Aplikasi yang di-deploy akun itu tetap berjalan, tetapi pindahkan dulu ke pemilik lain.

Setiap token menampilkan statusnya (**Aktif**, **Kedaluwarsa**, atau **Dicabut**), masa berlakunya, dan kapan terakhir dipakai. Token yang tidak pernah dipakai sebaiknya dicabut.

## Memberinya pengguna Linux di server

Akun layanan tim bisa punya pengguna Linux sendiri di server, sehingga yang dijalankannya terpisah dari berkas orang lain.

1. Buka servernya, masuk ke **Pengguna**, lalu tekan **Tambah pengguna**.
2. Atur **Add for** ke **Service account** dan pilih akunnya.
3. Simpan.

Nama pengguna Linux diambil dari akun itu. Pengguna ini tidak punya kata sandi, jadi tidak ada yang bisa masuk dengan kata sandi. Menghapus akun layanan tidak menghapus pengguna Linux ini dari server sampai Anda menghapusnya; lihat [Halaman server Anda](../servers/your-server-page.md#pengguna).

## Dari terminal

`dnocs service-account` (bentuk pendek `dnocs sa`) mengelola akun di ruang kerja yang dipilih. Tambahkan `--workspace personal` untuk akun Anda sendiri.

```bash
dnocs service-account create --name deploy-bot --role developer --expires-days 90
dnocs service-account list
dnocs service-account token create --account-id <id akun> --name rotation
dnocs service-account token revoke --account-id <id akun> --token-id <id token> --yes
dnocs service-account delete --id <id akun> --yes
```

Perintah ini tidak pernah mencetak token. dnocs menyimpannya ke berkas privat baru (izin `0600`) di `~/.devetek/service-account-tokens`, atau di `--token-file`, lalu memberi tahu lokasinya.

## Yang tidak bisa dilakukan akun layanan

Token tidak pernah bisa membuat, mengubah, atau menghapus akun layanan atau token, mengubah profil atau kata sandi, membuka terminal, memakai pengelola database, atau menjangkau administrasi platform. Semua itu selalu butuh orang. Satu pengguna atau tim bisa punya hingga 20 akun layanan.

## Pertanyaan yang sering diajukan

### Token saya hilang. Bisakah ditampilkan lagi?

Tidak. Tekan **Token baru** untuk membuat yang lain, perbarui skrip Anda, lalu cabut yang hilang.

### Apakah agen AI perlu akun layanan?

Itu cara teraman memberi akses ke agen, karena Anda memilih perannya dan bisa mencabutnya kapan saja. Lihat [Gunakan agen AI Anda sendiri](../ai/your-own-ai-agent.md).
