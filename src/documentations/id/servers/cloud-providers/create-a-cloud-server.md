---
title: Membuat server cloud
description: Luncurkan VPS Ubuntu di AWS, Google Cloud, DigitalOcean, IDCloudHost, Alibaba Cloud, atau Tencent Cloud dari dPanel, langkah demi langkah, dalam 10–20 menit.
sidebar_position: 1
sidebar_icon: cloud-upload
---

dPanel meluncurkan server Ubuntu baru (VM) di akun cloud Anda sendiri dari satu formulir: pilih penyedia, region, ukuran, dan rilis Ubuntu, lalu dPanel membuat mesinnya dan membuka SSH, HTTP, serta HTTPS. Secara bawaan, mesin memasang agen dPanel saat pertama kali menyala dan bergabung ke dPanel dengan sendirinya, jadi dPanel tidak perlu memasang SSH key di mesin itu. Server siap dalam sekitar 10 sampai 20 menit.

Sudah punya server, seperti VPS atau mesin di rumah? Anda tidak butuh halaman ini: [hubungkan dengan agen dPanel](../register-a-private-machine.md).

Panduan ini memakai Google Cloud. Penyedia lain menanyakan hal yang sama dengan urutan yang sama. Perbedaannya dibahas di [Penyedia cloud](./index.md), yang punya halaman tersendiri untuk tiap penyedia.

## Yang perlu disiapkan

- Akun cloud di dPanel. Lihat [Sebelum mulai](../before-you-start.md).
- SSH key, hanya jika server perlu bergabung lewat SSH, atau jika Anda meluncurkan di Biznet Gio atau Alibaba Cloud. Dengan agen dPanel, Anda tidak butuh kunci.
- Kuota yang cukup di penyedia untuk satu mesin lagi.

## Buka formulirnya

Buka **Server**, lalu **Buat Server**, lalu **Luncurkan server**.

Formulirnya satu halaman dengan empat langkah bernomor. Panel **Review** di kanan terisi sambil Anda menjawab. Penghitungnya, misalnya **3/9**, menunjukkan berapa jawaban yang sudah masuk.

## Langkah 1: Provider and project

1. **Provider**: tempat mesin berjalan.
2. **Cloud project**: akun cloud mana yang membayarnya. **Add project** menghubungkan akun lain.

![Langkah 1 formulir peluncuran, dengan Google Cloud dan proyek cloud terpilih](../../../assets/servers/create-step1-provider.webp)

## Langkah 2: Location

- **Region** adalah wilayah tempat mesin berjalan. Pilih yang dekat dengan pengguna Anda.
- **Zone** adalah satu pusat data di dalam region itu. Mana saja boleh. Google Cloud, Alibaba Cloud, dan Tencent Cloud menanyakannya.
- **Network** terisi otomatis. Di sebagian besar penyedia, dPanel membuat `dpanel-network` saat pertama kali meluncurkan mesin di sebuah region, lalu memakainya lagi. Di AWS, Google Cloud, Alibaba Cloud, dan Tencent Cloud, dPanel hanya membuka port TCP 22 (SSH), 80 (HTTP), dan 443 (HTTPS) di penyedia. Di DigitalOcean dan IDCloudHost, dPanel tidak membuat firewall penyedia, jadi nyalakan [firewall](../firewall.md) dPanel atau tambahkan firewall di penyedia.

## Langkah 3: Cara dPanel terhubung

Langkah ini menentukan cara server baru bergabung ke dPanel, dan apakah server mendapat IP publik. Ragu? Biarkan pilihan bawaannya. [Agen dPanel atau SSH: pilih yang mana?](../register-a-private-machine.md#agen-dpanel-atau-ssh-pilih-yang-mana) membandingkan keduanya.

- **Agen dPanel** terpilih dan ditandai **Direkomendasikan**. VM memasang agen dPanel saat pertama kali menyala lalu terhubung keluar ke dPanel. Tidak ada SSH key dPanel yang dipasang di VM, dan tidak ada port yang perlu dibuka. Server tampil **Ready** begitu agennya terhubung, beberapa menit setelah VM dibuat.
- **SSH** adalah alternatifnya: dPanel memasang **SSH key** yang Anda pilih di VM, masuk lewat SSH, lalu memasang agennya. **Create SSH key** membuat kunci baru di sini. SSH membutuhkan IP publik.

| Penyedia                          | Cara bergabung              | IP publik                                         |
| --------------------------------- | --------------------------- | ------------------------------------------------- |
| AWS, Google Cloud, Tencent Cloud  | Agen dPanel atau SSH        | Anda yang memilih                                 |
| DigitalOcean                      | Agen dPanel atau SSH        | Selalu (Droplet selalu mendapatkannya)            |
| IDCloudHost                       | Agen dPanel atau SSH        | Selalu (VM tanpa IP publik tidak bisa ke internet) |
| Biznet Gio, Alibaba Cloud         | Untuk saat ini hanya SSH    | Selalu (SSH membutuhkannya)                       |

Di penyedia yang hanya bisa bergabung lewat SSH, formulir memberi tahu hal itu dan meminta SSH key.

![Langkah 3, How dPanel connects: dPanel agent terpilih, SSH sebagai alternatif, dan tombol Give the VM a public IP](../../../assets/servers/create-step-connect.webp 'Agen dPanel adalah pilihan bawaan: tidak ada kunci dPanel di VM, dan IP publik opsional di Google Cloud, AWS, dan Tencent Cloud.')

### IP publik

**Beri VM IP publik** menyala secara bawaan. Biarkan menyala kalau VM akan melayani situs web: pengunjung dan sertifikat HTTPS load balancer membutuhkannya. Matikan di AWS, Google Cloud, atau Tencent Cloud untuk VM yang tidak boleh dijangkau dari internet. VM itu tetap bergabung ke dPanel lewat agen; SSH tidak tersedia tanpa IP publik.

VM tanpa IP publik tetap butuh akses internet keluar, agar agennya bisa terhubung:

- **Di `dpanel-network`**, jaringan yang dibuat dPanel, dPanel menambahkan akses internet keluar (NAT) untuk Anda. Di Google Cloud berupa Cloud NAT, yang ditagih per VM yang memakainya. Di AWS dan Tencent Cloud berupa NAT gateway, yang ditagih penyedia untuk setiap jam keberadaannya; dPanel menghapusnya saat Anda menghapus VM tanpa IP publik terakhir di jaringan itu.
- **Di jaringan atau subnet yang Anda pilih sendiri**, dPanel tidak menambahkan apa pun. Jaringan itu harus sudah memberi VM akses internet keluar, atau agen tidak bisa terhubung dan server tetap dalam proses.

## Langkah 4: Size and image

1. **Server name** adalah nama mesin di dPanel dan di penyedia.
2. **Ubuntu release**: 24.04 LTS terpilih secara bawaan; 26.04 LTS ditandai **Newest**. LTS berarti pembaruan keamanan selama bertahun-tahun.
3. **Size**: geser slider **CPU** dan **RAM** ke ukuran yang Anda inginkan, dan **Storage** ke ukuran disk dalam GB.

![Langkah 3 formulir peluncuran dengan slider CPU, RAM, dan Storage serta ukuran yang akan diluncurkan dPanel](../../../assets/servers/create-step2-location-size.webp)

Kartu di bawah slider menyebutkan dengan tepat apa yang akan Anda dapatkan:

- **You get**: penyedia yang menerima pasangan CPU dan memori apa pun, seperti Google Cloud dan IDCloudHost, meluncurkan ukuran persis itu.
- **Cheapest match**: penyedia dengan tipe instance tetap, seperti AWS, DigitalOcean, Alibaba Cloud, dan Tencent Cloud, meluncurkan tipe termurah dengan CPU dan memori minimal sebesar itu. **Rounded up from** muncul jika tipenya lebih besar dari yang Anda minta, dan kartu itu menampilkan harga bulanan jika penyedia memberikannya.

| Slider  | Rentang                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| CPU     | 1, 2, 4, 8, atau 16 vCPU. Nilai yang tidak bisa dilayani penyedia dicoret.                                                         |
| RAM     | 1 sampai 64 GB. Menggeser CPU memindahkan RAM ke pasangan terdekat yang dijual penyedia.                                           |
| Storage | 20 sampai 500 GB dengan kelipatan 10 GB (40 sampai 500 GB di Alibaba Cloud). DigitalOcean dan Tencent Cloud menentukannya sendiri. |

Di penyedia dengan tipe tetap, **Choose the instance type yourself** membuka daftar lengkap milik penyedia sebagai pengganti slider. **Use the size sliders instead** kembali ke slider. Biznet Gio tetap memakai pilihan **Product** dan **Billing Cycle** miliknya sendiri.

:::tip[Mulai dari yang kecil]
1 vCPU dan RAM 2 GB sudah cukup untuk mencoba dPanel dengan satu aplikasi kecil. Anda bisa meluncurkan server yang lebih besar nanti dan memindahkan aplikasi ke sana.
:::

## Luncurkan

Saat panel Review bertuliskan **Ready to launch**, semua jawaban sudah lengkap.

1. Tekan **Launch server**.
2. Di dialog yang terbuka (**Server Anda sedang menyala** untuk agen, **Server Anda sedang dibuat** untuk SSH), tekan **Buka server** untuk memantau prosesnya, atau **Luncurkan lagi**.

**Clear form** mengosongkan formulir.

## Setelah itu

Banner biru memberi tahu bahwa dPanel sedang menyiapkan server. Biasanya 10 sampai 20 menit:

1. Penyedia membuat mesinnya.
2. Dengan agen dPanel, mesin memasang agen saat pertama kali menyala, dan server menjadi **Ready** begitu agen terhubung, biasanya 1 sampai 5 menit setelah mesin aktif. Di AWS, alamatnya bisa baru muncul beberapa menit setelah **Ready**. Dengan SSH, dPanel masuk, memasang agennya, dan membaca isi mesin.
3. dPanel membuka port yang dibutuhkan.

Begitu banner hilang dan lencananya bertuliskan **Ready**, server siap dipakai. Selanjutnya, [pasang perangkat lunak](../install-software.md) di server itu atau [buat aplikasi](../../applications/create-an-application.md).

:::warning[Kalau setup gagal]
Banner merah muncul dengan tombol **Lihat penyebabnya**, berisi alasan dari penyedia atau dari proses setup. Penyebab yang paling sering: kuota akun cloud tidak cukup, atau kredensialnya sudah kedaluwarsa. Kalau penyedia tidak pernah membuat mesinnya, **Instal ulang** tidak bisa membantu: perbaiki penyebab yang ditampilkan, hapus server di dPanel, lalu luncurkan lagi. Kalau mesinnya ada dan hanya setup yang gagal, pakai **Instal ulang** di tab **Pengaturan** server. Lihat [Masalah yang sering muncul](../../troubleshooting/faq.md#server).
:::

:::tip[Tagihan berjalan sejak sekarang]
Penyedia menagih mesin selama mesin itu ada, termasuk selama setup. [Hapus servernya](../delete-a-server.md) kalau sudah tidak dipakai: menghapus server di dPanel juga menghapus VM-nya di penyedia.
:::

## Dari terminal

`dnocs server create-cloud` meluncurkan server cloud dari terminal. Perintah ini menanyakan cara server bergabung (agen dPanel lebih dulu) dan apakah server mendapat IP publik, lalu menunggu sampai server siap. Untuk skrip, berikan semuanya sebagai flag:

```bash
dnocs server create-cloud --cloud-project-id <id> --join agent --public-ip=false --yes --vm-json '{...}' --wait 30m
```

| Flag                 | Artinya                                                        |
| -------------------- | -------------------------------------------------------------- |
| `--cloud-project-id` | Akun cloud tempat server diluncurkan                           |
| `--join`             | `agent` (direkomendasikan) atau `ssh`                          |
| `--secret-id`        | SSH key yang dipasang di VM, hanya dengan `--join ssh`         |
| `--public-ip`        | `true` atau `false`                                            |
| `--vm-json`          | Region, ukuran, image, dan nama VM, dalam JSON                 |
| `--yes`              | Lewati pertanyaan konfirmasi                                   |
| `--wait`             | Berapa lama menunggu server siap, misalnya `30m`               |

`dnocs server create` membuka menu berisi tiga cara menambah server: server cloud, agen dPanel (menampilkan perintah yang dijalankan di mesin Anda), dan SSH.

Untuk menemukan VM buatan dPanel yang tidak lagi terkait dengan server, misalnya setelah peluncuran gagal, jalankan `dnocs cloud-project orphans --id <ID akun cloud>`. Tambahkan `--delete` untuk menghapusnya di penyedia. Ini berlaku di AWS, Google Cloud, DigitalOcean, IDCloudHost, dan Tencent Cloud.

## Pertanyaan yang sering diajukan

### Berapa lama waktu yang dibutuhkan untuk meluncurkan server?

Sekitar 10 sampai 20 menit dari **Launch server** sampai **Ready**, sering kali lebih cepat dengan agen dPanel. Sebagian besar waktunya dipakai penyedia untuk membuat VM dan untuk memasang agen dPanel.

### Versi Ubuntu apa saja yang bisa diluncurkan?

Ubuntu 24.04 LTS dan 26.04 LTS. dPanel memilih image terbaru dari penyedia untuk rilis yang Anda pilih.

### Berapa biaya sebuah server?

Penyedia menagih Anda dengan harganya sendiri, karena server berjalan di akun Anda. Di penyedia dengan tipe instance tetap, kartu ukuran menampilkan harga bulanan penyedia jika tersedia.

### Bisakah saya memilih tipe instance tertentu, misalnya t3.small?

Bisa, di AWS, DigitalOcean, Alibaba Cloud, dan Tencent Cloud. Tekan **Choose the instance type yourself** di bawah slider, lalu pilih dari daftar penyedia.

### User login apa yang didapat server?

`ubuntu` di AWS, Google Cloud, dan Tencent Cloud, `root` di Alibaba Cloud, dan **Default User** yang Anda tentukan (bawaannya `dpanel`) di DigitalOcean dan IDCloudHost. Di server yang bergabung lewat agen, terminal di browser justru membuka shell root lewat agen. Lihat [Terhubung lewat SSH](../connect-over-ssh.md).

### Apakah server cloud butuh SSH key?

Tidak dengan agen dPanel, pilihan bawaan di AWS, Google Cloud, DigitalOcean, IDCloudHost, dan Tencent Cloud. Anda butuh kunci hanya jika memilih **SSH**, atau di Biznet Gio dan Alibaba Cloud.

### Perlukah saya mematikan IP publik?

Hanya untuk VM yang tidak boleh dijangkau dari internet, seperti database atau worker latar belakang. VM yang melayani situs web butuh IP publiknya. Di AWS dan Tencent Cloud, VM tanpa IP publik di `dpanel-network` juga berarti NAT gateway yang ditagih penyedia per jam.
