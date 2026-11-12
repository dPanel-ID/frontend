---
title: Berbagi homelab dengan tim
description: Hubungkan server rumahan, PC, dan Raspberry Pi Anda ke dPanel dengan agen dPanel dan taruh di ruang kerja tim, agar semua anggota tim bisa mengelolanya sesuai perannya. Tidak perlu SSH, IP publik, atau port yang terbuka.
sidebar_position: 4
sidebar_icon: users
sidebar_label: Homelab tim
---

Mesin homelab bergabung ke dPanel dengan agen dPanel: Anda menjalankan satu perintah di setiap mesin, lalu agen menyambung keluar ke dPanel. Anda tidak perlu SSH, IP publik, atau port forwarding di router. Belum pernah menghubungkan mesin? Ikuti dulu [Hubungkan server dengan agen dPanel](../servers/register-a-private-machine.md); panduan itu menjelaskan setiap langkah untuk satu mesin.

Mesin yang Anda hubungkan masuk ke ruang kerja yang Anda pilih: ruang kerja yang sedang dipilih di dPanel saat Anda memilih **Ambil perintah pemasangan**, atau ruang kerja yang dipilih di dnocs saat Anda memakai `sudo dnocs machine register`. Jika itu ruang kerja personal, hanya Anda yang bisa melihatnya. Tutorial ini menaruh mesin homelab di **ruang kerja tim**, sehingga seluruh tim berbagi mesin yang sama: setiap anggota membuka server yang sama, memasang perangkat lunak, dan men-deploy aplikasi, sesuai peran yang Anda berikan.

Kami memakai ruang kerja bernama **Home Lab** dengan dua mesin:

- `homelab-nas`, dihubungkan langsung ke ruang kerja (Bagian 2).
- `homelab-pi`, yang sudah terhubung di ruang kerja personal lalu dipindahkan ke ruang kerja tim (Bagian 3).

Keduanya tidak punya IP publik maupun port yang terbuka. Mereka terhubung ke dPanel lewat agen, seperti dijelaskan di [Hubungkan server dengan agen dPanel](../servers/register-a-private-machine.md).

## Yang perlu disiapkan

- Ruang kerja tim, dan peran yang boleh menambah server ke ruang kerja itu: Owner, Admin, atau DevOps. Buat ruang kerja dari pemilih ruang kerja dengan **New workspace** (lihat [Ruang kerja](../getting-started/workspaces.md)).
- ID ruang kerja. Anda bisa melihatnya di pemilih ruang kerja, atau dengan `dnocs workspace list`.
- Di setiap mesin: Linux dengan systemd di Intel/AMD (`amd64`) atau ARM (`arm64`), `sudo`, dan akses internet. dnocs hanya dibutuhkan untuk cara baris perintah dan untuk memindahkan mesin (Bagian 3): [Memasang dnocs](../ai/ai-in-the-terminal.md#memasang-dnocs).

## Tidak punya mesin cadangan? Coba di kontainer

Anda bisa mencoba seluruh tutorial ini tanpa PC cadangan: jalankan kontainer Linux dengan Docker atau Podman di laptop atau server mana pun, lalu hubungkan kontainer itu seolah-olah mesin homelab. Setiap kontainer menjadi satu server tersendiri di dPanel. Cara ini bisa dipakai dengan Ubuntu 24.04, Ubuntu 26.04, dan Debian 13, di Linux, macOS, maupun Windows (Docker Desktop).

:::warning[Hanya untuk mencoba dPanel]
Kontainer menjalankan systemd dan agen dPanel, yang memasang perangkat lunak dan layanan sistem, jadi kontainer dijalankan dengan `--privileged`: kekuasaannya hampir sama dengan administrator komputer Anda. Pakai untuk mencoba dPanel, bukan untuk menjalankan situs sungguhan; untuk itu, hubungkan mesin atau VM sungguhan.
:::

**1. Simpan berkas ini** dengan nama `Containerfile` di folder kosong. Berkas ini memasang systemd (agen dPanel berjalan sebagai layanan sistem), `sudo`, dan `curl`, serta menambah pengguna bernama `dpanel` yang boleh memakai `sudo`. Berkas `/etc/machine-id` yang kosong membuat setiap kontainer mendapat ID mesin sendiri, jadi masing-masing menjadi server terpisah.

```dockerfile
ARG BASE=docker.io/library/ubuntu:24.04
FROM ${BASE}
ENV container=docker
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      systemd systemd-sysv sudo curl ca-certificates iproute2 \
 && apt-get clean && rm -rf /var/lib/apt/lists/* \
 && rm -f /var/lib/dbus/machine-id && : > /etc/machine-id
RUN useradd -m -s /bin/bash -G sudo dpanel \
 && echo 'dpanel ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/dpanel
STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
```

**2. Buat image** untuk Linux yang ingin dicoba. Pilih satu baris:

```bash
docker build -f Containerfile --build-arg BASE=docker.io/library/ubuntu:24.04 -t dpanel-lab-ubuntu24 .
docker build -f Containerfile --build-arg BASE=docker.io/library/ubuntu:26.04 -t dpanel-lab-ubuntu26 .
docker build -f Containerfile --build-arg BASE=docker.io/library/debian:13 -t dpanel-lab-debian13 .
```

Dengan Podman, tulis `podman build`, bukan `docker build`; sisanya sama.

**3. Jalankan kontainer** yang menyalakan systemd. `--hostname` adalah nama server di dPanel. Perintahnya satu baris, jadi bisa dipakai di bash, zsh, PowerShell, maupun Command Prompt:

```bash
docker run -d --name homelab-nas --hostname homelab-nas --privileged --cgroupns=host -v /sys/fs/cgroup:/sys/fs/cgroup:rw dpanel-lab-ubuntu24
```

Pakai image yang Anda buat di langkah 2: misalnya `dpanel-lab-debian13` untuk Debian 13 atau `dpanel-lab-ubuntu26` untuk Ubuntu 26.04.

:::note[Di Windows]
Jalankan perintahnya di PowerShell atau Command Prompt dengan Docker Desktop menyala. Docker Desktop memerlukan WSL 2; kalau belum terpasang, `wsl --install --no-distribution` hanya memasang yang dibutuhkan Docker Desktop, tanpa mengunduh distribusi Linux lengkap.
:::

Dengan Podman, yang menyalakan systemd sendiri jika image menjalankan `/sbin/init`:

```bash
sudo podman run -d --name homelab-nas --hostname homelab-nas dpanel-lab-ubuntu24
```

Setelah beberapa detik, `docker exec homelab-nas systemctl is-system-running` (atau `sudo podman exec …`) menampilkan `running` atau `degraded`; keduanya tidak masalah.

**4. Hubungkan ke dPanel**, dengan dua cara yang sama seperti di [Bagian 2](#bagian-2-hubungkan-mesin-langsung-ke-ruang-kerja):

- **Perintah satu baris dari situs web.** Buka shell di kontainer dengan `docker exec -it homelab-nas bash`, tempel perintah dari **Get install command**, lalu tekan Enter.
- **dnocs.** Buka shell sebagai pengguna `dpanel`, pasang dnocs, masuk, lalu hubungkan:

  ```bash
  docker exec -it -u dpanel -w /home/dpanel homelab-nas bash
  curl --proto '=https' --tlsv1.2 -sSf https://dnocs.devetek.app/installer.sh | sh
  dnocs auth login -u <nama pengguna Anda>
  dnocs workspace set --id <id ruang kerja>
  sudo dnocs machine register
  ```

  Mendaftar dengan Google? Lihat [Memakai dnocs dengan akun Google](#memakai-dnocs-dengan-akun-google).

Dalam satu menit server tampil **Ready** di dPanel. Jalankan kontainer lain dengan nama lain (`homelab-pi`, …) atau image lain untuk mendapat server tambahan.

:::tip[Jalankan dnocs machine register dengan sudo, dari pengguna yang sudah masuk]
`dnocs machine register` memasang layanan sistem, jadi harus berjalan sebagai root, dan membaca sesi masuk milik pengguna yang mengetik `sudo`. Masuklah sebagai `dpanel` lalu jalankan `sudo dnocs machine register`. Shell root (`sudo su -`, `sudo -s`, atau `docker exec` tanpa `-u dpanel`) tidak punya sesi masuk sendiri, jadi dnocs menjawab `please login first using 'dnocs auth login'`; jalankan `dnocs auth login` dulu di shell itu, atau kembali ke pengguna `dpanel`.
:::

**5. Setelah selesai**, hapus server di dPanel (**Settings** di halaman server, atau `dnocs server delete --id <id server>`), lalu hapus kontainernya dengan `docker rm -f homelab-nas` (atau `sudo podman rm -f homelab-nas`). Menyalakan ulang kontainer tetap memakai server yang sama.

## Bagian 1: Pilih ruang kerja tim

Di dPanel, buka pemilih ruang kerja di kiri atas. Sumber daya personal dan ruang kerja tim dipisahkan; kolom ID menampilkan ID setiap ruang kerja.

![Dialog Select workspace dengan ruang kerja personal dan ruang kerja tim Home Lab, ID-nya 1305126145648220810, dan peran Owner](../../assets/tutorials/homelab-workspace-picker.webp)

## Bagian 2: Hubungkan mesin langsung ke ruang kerja

Dari situs web:

1. Pindahkan dPanel ke ruang kerja **Home Lab** di pemilih ruang kerja.
2. Buka **Server**, lalu **Buat Server**.
3. Di kartu **Hubungkan server dengan agen dPanel**, ketik `homelab-nas` sebagai nama server lalu pilih **Ambil perintah pemasangan**.
4. Pilih **Salin**, lalu tempel perintahnya di terminal mesin itu dan jalankan. Perintah ini meminta `sudo`.
5. Kartu menampilkan **Terhubung!** begitu agen terhubung, biasanya kurang dari satu menit. Server dibuat di ruang kerja Home Lab.

Perintahnya hanya bisa dipakai sekali, selama 2 jam; ambil perintah baru untuk setiap mesin. Mesin tidak butuh dnocs dan tidak perlu masuk akun.

**Lebih suka baris perintah?** Di mesin itu, masuk sebagai pengguna biasa, arahkan dnocs ke ruang kerja tim, lalu hubungkan mesinnya:

```bash
dnocs auth login -u <username Anda>
dnocs workspace set --id <ID ruang kerja>
sudo dnocs machine register
```

Mendaftar dengan Google? Lihat [Memakai dnocs dengan akun Google](#memakai-dnocs-dengan-akun-google).

dnocs menyebut nama ruang kerja dalam pertanyaannya, jadi Anda bisa memastikan pilihan Anda benar sebelum mengonfirmasi. Setelah itu dnocs membuat user Linux untuk akun dPanel Anda, memasang agen, dan menunggu sampai server siap, biasanya kurang dari satu menit. Server dibuat di ruang kerja itu. Untuk membaca skrip pemasangannya sebelum dijalankan, pakai `sudo dnocs machine register --print-only`.

![Terminal di homelab-nas: dnocs workspace list, dnocs workspace set ke Home Lab, lalu sudo dnocs machine register yang menanyakan pendaftaran ke ruang kerja Home Lab dan melaporkan server 209 siap](../../assets/tutorials/homelab-register.webp)

## Bagian 3: Pindahkan mesin dari ruang kerja personal

Mesin yang sebelumnya Anda hubungkan di ruang kerja personal bisa dipindahkan ke tim dengan `dnocs transfer`. Mesin itu tetap memakai ID server, agen, perangkat lunak yang terpasang, dan aplikasinya:

```bash
dnocs transfer server --id <ID server> --to "<nama atau ID ruang kerja>"
```

dnocs menampilkan apa yang dipindahkan dan meminta konfirmasi (`--yes` melewati pertanyaan itu). Pemindahan hanya satu arah: setelah server berada di sebuah ruang kerja, server itu tidak bisa kembali ke ruang kerja personal atau pindah lagi ke ruang kerja lain.

![Terminal di homelab-pi: dnocs transfer server 210 ke Home Lab melaporkan berhasil dipindahkan, lalu dnocs server list di ruang kerja Home Lab menampilkan homelab-pi dan homelab-nas, keduanya siap](../../assets/tutorials/homelab-transfer.webp)

Menjalankan `sudo dnocs machine register` lagi di mesin yang sudah dipindahkan hanya berhasil dari ruang kerja tempat mesin itu sekarang berada; dari ruang kerja personal dnocs menolaknya, sehingga mesin tidak bisa keluar dari tim secara tidak sengaja.

## Bagian 4: Periksa server di ruang kerja

Pindahkan dPanel ke ruang kerja tim lalu buka **Servers**. Kedua mesin ada di sana dengan lencana **Private**, dimiliki oleh ruang kerja, beserta siapa yang menambahkannya.

![Halaman server Home Lab yang menampilkan homelab-pi dan homelab-nas, keduanya Private dan Ready, pemilik Home Lab, dibuat oleh orang yang mendaftarkannya](../../assets/tutorials/homelab-servers.webp)

Setiap halaman server menampilkan ruang kerja sebagai **Ownership**-nya. Semua yang ada di [panduan agen dPanel](../servers/register-a-private-machine.md) bekerja sama persis di sini: modul, aplikasi, terminal, file, log, pengelola database, dan load balancer. Pekerjaan untuk server ini tetap berjalan di mesin itu sendiri, apa pun worker yang dipakai ruang kerja.

![Halaman server homelab-pi di ruang kerja Home Lab: alamat lokal, koneksi lewat agen dPanel, Ownership Home Lab, dan Redis terpasang](../../assets/tutorials/homelab-server.webp)

## Bagian 5: Undang tim Anda

Buka **Teams**, lalu ruang kerjanya, untuk melihat anggota dan worker ruang kerja itu.

![Halaman tim Home Lab dengan anggotanya, peran Owner Anda, dan bagian worker yang memakai worker bersama dPanel](../../assets/tutorials/homelab-team.webp)

Pilih **Add Member**, pilih orangnya dan peran yang ia dapat. Peran menentukan apa yang bisa ia lakukan dengan homelab:

![Dialog Add New People: pemilih pengguna dan peran ruang kerja Owner, Admin, DevOps, Developer, Viewer, dan Billing](../../assets/tutorials/homelab-add-member.webp)

| Peran | Terhadap server homelab |
| --- | --- |
| Owner, Admin | Semuanya, termasuk menambah dan menghapus server serta anggota |
| DevOps | Menambah dan mengelola server, memasang modul, membuka terminal dan database; tidak bisa menghapus |
| Developer | Men-deploy dan mengelola aplikasi di server; melihat server tetapi tidak bisa mengubahnya atau membuka terminalnya; tidak bisa menghapus |
| Viewer | Hanya melihat: server, pemakaian, log, dan pekerjaan |

Lihat [Anggota dan peran](../teams/members-and-roles.md) untuk rincian setiap peran.

## Memakai dnocs dengan akun Google

`dnocs auth login` masuk dengan username dan password, sedangkan akun yang dibuat lewat Google belum punya password dPanel. Pilih salah satu:

- **Atur password.** Di dPanel, buka profil Anda, pilih **Edit profile**, isi **New password** dan **Retype password**, lalu simpan. Setelah itu jalankan `dnocs auth login -u <username Anda>`; username Anda tertera di profil.
- **Pakai token akun layanan.** Buat [akun layanan](../teams/service-accounts.md) beserta tokennya, lalu jalankan dnocs dengan token itu: `DNOCS_TOKEN=dps_token_anda dnocs server list`. Untuk ruang kerja tim, pemilik atau admin ruang kerja membuat akun layanan **ruang kerja**, yang tokennya bertindak di ruang kerja itu.

## Perlu diketahui

- Satu ruang kerja bisa menghubungkan hingga 10 mesin dengan cara ini (server cloud yang dibuat dPanel tidak dihitung), dan satu mesin hanya berada di satu ruang kerja pada satu waktu.
- Untuk menerbitkan situs dari mesin homelab, tambahkan load balancer dan teruskan (forward) port 80 dan 443 di router Anda ke mesin itu. Lihat [Pasang load balancer di server ini](../servers/register-a-private-machine.md#pasang-load-balancer-di-server-ini).
- Mengeluarkan seseorang dari ruang kerja langsung mencabut aksesnya ke server-server itu; mesinnya tetap berjalan.
- Menghapus server di dPanel langsung menghapusnya dan mencabut kredensial agennya. Setelah itu hentikan agen di mesin dengan `sudo systemctl disable --now dpanel-agent`.
