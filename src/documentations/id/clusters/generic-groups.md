---
title: Grup server umum
description: Buat grup server umum di dPanel lalu pasang modul, deploy artefak, segarkan inventaris, reboot, atau upgrade agent di setiap server sekaligus.
sidebar_position: 2
sidebar_icon: list-checks
sidebar_label: Grup umum
---

Grup umum adalah daftar server yang disimpan. Setiap aksi yang Anda jalankan pada grup dijalankan di masing-masing servernya, dan hasil setiap server bisa dipantau di satu tempat. Server-servernya tetap mandiri: satu yang gagal tidak menghentikan yang lain.

## Membuat grup umum

1. Buka **Servers**, lalu **Server groups**, dan tekan **New group**.
2. Di **What should this group be?**, biarkan **Generic** dan tekan **Next**.
3. Isi **Name**, misalnya "Web produksi", dan **Description** bila perlu. Tekan **Next**.
4. Periksa **Review** lalu tekan **Create group**.

![Langkah pertama New group: What should this group be? dengan Generic terpilih dan Kubernetes di sebelahnya](../../assets/clusters/wizard-type.webp 'Langkah 1: pilih Generic untuk daftar server biasa, atau Kubernetes untuk klaster.')

Grup dimulai kosong. Di halamannya, tekan **Add servers** lalu pilih servernya. Satu server hanya bisa masuk satu grup.

## Menjalankan aksi di setiap server

Buka grupnya dan masuk ke **Operations**. Di **Run on this group**:

| Aksi                  | Fungsinya                                                       |
| --------------------- | --------------------------------------------------------------- |
| **Install module**    | Memasang modul dari katalog di setiap server                    |
| **Deploy artifact**   | Men-deploy satu build aplikasi ke setiap server                 |
| **Refresh inventory** | Membaca ulang modul dan layanan yang terpasang di setiap server |
| **Reboot**            | Menyalakan ulang setiap server; aplikasinya mati sebentar       |
| **Upgrade agent**     | Memasang rilis agent dPanel di setiap server                    |

Setiap aksi mencatat server yang ada di grup saat itu, lalu berjalan di masing-masing server. **Operation history** menampilkan semua yang pernah berjalan, terbaru di atas, beserta jumlah server yang berhasil dan gagal. **Open** menampilkan hasil setiap server dan tautan ke eksekusinya. Kalau ada server yang gagal, **Retry failed servers** menjalankan aksi itu lagi hanya di server tersebut.

## Mengubah atau menghapus grup

- **Add servers** dan **Remove** mengubah anggota grup. **Replace servers** menetapkan seluruh daftar sekaligus.
- **Edit** mengubah nama dan deskripsi.
- **Delete group** hanya menghapus grupnya. Server tetap berjalan seperti biasa, dan operasi sebelumnya beserta lognya tetap tersimpan.
