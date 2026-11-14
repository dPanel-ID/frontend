---
title: Mendiagnosis masalah dengan AI
description: Biarkan Tanya dPanel mencari tahu kenapa aplikasi, build, server, atau load balancer gagal. Asisten membaca log, mengutip penyebab, lalu mengusulkan perbaikan.
sidebar_position: 5
sidebar_icon: life-buoy
sidebar_label: Mendiagnosis masalah
---

Saat ada yang gagal di dPanel, tanyakan "Kenapa?" ke **Tanya dPanel** (**Ask dPanel** di tampilan bahasa Inggris), asisten AI dPanel. Asisten mengumpulkan bukti seperti yang dilakukan orang: deployment, log build dan runtime-nya, job yang gagal, CPU, memori, dan disk server, dan untuk situs web, log load balancer serta sertifikat HTTPS-nya. Lalu asisten mengutip baris yang penting, menyebutkan kemungkinan penyebabnya, dan mengusulkan perbaikan yang bisa Anda setujui.

Anda tidak perlu tahu di mana log-nya berada. Justru itulah gunanya.

## Tanyakan masalahnya

Ceritakan apa yang Anda lihat, dan sebutkan apa yang gagal:

- `Kenapa aplikasi Shop gagal di server 145?`
- `Kenapa build terakhir aplikasi Shop gagal?`
- `Situs saya shop.example.com menampilkan error 502. Cari tahu penyebabnya.`
- `Apakah ada job yang gagal dalam 24 jam terakhir? Jelaskan kenapa yang terakhir gagal.`
- `Server 145 terasa lambat. Apakah memori atau disknya habis?`
- `Apakah MariaDB berjalan di server 145? Kalau tidak, kenapa layanannya berhenti?`
- `Apakah load balancer untuk shop.example.com sehat? Periksa sertifikatnya dan error terbaru.`

## Membaca diagnosisnya

![Asisten memeriksa load balancer: tabel status dan sertifikat HTTPS-nya, permintaan terbaru beserta kode statusnya, dan kesimpulannya](../../assets/ai/diagnose-answer.webp 'Diperiksa mencantumkan setiap sumber yang dibaca asisten sebelum menjawab.')

Diagnosis yang baik punya tiga bagian:

1. **Buktinya**: baris error dari log, pesan job yang gagal, atau angka seperti "disk penuh 97%".
2. **Kemungkinan penyebabnya**, dengan kata-kata sederhana.
3. **Perbaikannya**, di dPanel. Kalau perbaikannya berupa perubahan, misalnya memperbarui perintah build lalu merilis ulang, asisten mengusulkannya sebagai kartu untuk Anda setujui.

Untuk job yang gagal, asisten mengutip tugas yang pertama kali gagal, bukan langkah yang hanya menghasilkan peringatan: langkah yang boleh dilewati sebuah modul, misalnya menghentikan layanan yang belum ada, dihitung sebagai peringatan, bukan sebagai error.

Kalau buktinya belum meyakinkan, asisten menyebutkan apa yang sudah diperiksanya dan apa yang belum bisa dipastikan. **Diperiksa:** (**Checked:**) di bawah jawaban mencantumkan setiap sumber yang dibacanya, seperti **deployment get**, **application logs**, dan **server usage**.

## Apa yang diperiksa asisten

| Masalah                             | Yang dibaca asisten                                                        | Perbaikan yang biasa diusulkan                                                          |
| ----------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Build gagal                         | Log build-nya                                                              | Memperbaiki perintah build atau runtime yang kurang, lalu merilis ulang                 |
| Aplikasi tidak mau jalan atau crash | Deployment, log runtime, memori dan disk server                            | Memperbaiki perintah start atau variabel lingkungan, lalu merilis ulang                 |
| Situs web menampilkan error         | Load balancer, log akses dan sertifikatnya, serta aplikasi di belakangnya  | Mengubah rute load balancer, atau memperbaiki aplikasinya                               |
| Job gagal                           | Job, tugas yang pertama kali gagal, dan error-nya                          | Menjalankan ulang penyiapan server, memasang modul yang kurang, mencoba lagi            |
| Perangkat lunak terpasang tapi mati | Layanan di server dan baris status terakhir dari layanan yang gagal        | Memperbaiki penyebab yang disebutkan, lalu menyalakan ulang layanan atau memasang ulang |
| Server lambat atau penuh            | Penggunaan CPU, memori, dan disk                                           | Server yang lebih besar, atau menghapus build lama                                      |
| Port tidak merespons                | Aturan firewall server dan apa yang akan berubah kalau firewall diterapkan | Mengizinkan port lalu menerapkan firewall                                               |

## Mengikuti job yang lama

Build, rilis, pemasangan, dan penyiapan server butuh beberapa menit. Setelah Anda menyetujui salah satunya, asisten memeriksanya sekali lalu melapor. Asisten tidak terus memantaunya. Tanyakan lagi untuk melihat perkembangannya:

- `Apakah rilis Shop sudah selesai?`
- `Apakah pemasangan MariaDB di server 145 berhasil?`

Anda juga bisa mengikuti job sendiri. Lihat [Membaca log](../logs/reading-logs.md) dan [Log aplikasi](../applications/application-logs.md).

## Kapan perlu memeriksa sendiri

Asisten membaca log yang sama dengan yang bisa Anda buka, jadi ia bisa melewatkan apa yang tidak tertulis di log. Periksa sendiri, atau tanyakan ke orang lain, kalau:

- jawaban menyebutkan bahwa buktinya belum meyakinkan;
- masalahnya ada di kode aplikasi Anda sendiri;
- masalahnya ada di luar dPanel, seperti registrar domain atau layanan pihak ketiga.

Lihat [Pemecahan masalah](../troubleshooting/faq.md) untuk masalah umum dan cara mengatasinya.

## Pertanyaan yang sering diajukan

### Bisakah asisten membaca data di basis data saya untuk mencari bug?

Tidak. Asisten tidak bisa menjalankan SQL atau membaca data Anda. Ia bisa memberi tautan DB Manager supaya Anda bisa melihatnya sendiri.

### Bisakah asisten masuk ke server saya untuk memeriksa sesuatu?

Tidak. Asisten tidak punya akses shell atau SSH. Ia membaca apa yang dilaporkan dPanel dan agent dPanel di server, seperti log dan penggunaan resource.

### Apakah asisten akan memperbaiki masalah tanpa bertanya?

Tidak. Setiap perbaikan adalah kartu yang menunggu Anda menekan **Setujui**. Lihat [Setujui atau tolak perubahan](./approvals-and-secrets.md).

### Asisten bilang permintaan saya "needed too many steps". Apa yang harus saya lakukan?

Tanyakan satu hal setiap kali, dan sebutkan namanya: "Kenapa build terakhir aplikasi Shop gagal?" alih-alih "Apa yang salah dengan semuanya?".
