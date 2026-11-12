---
title: Kubernetes dengan k3s
description: Buat klaster Kubernetes k3s di server dPanel Anda langkah demi langkah, jalankan aplikasi pertama, lalu sajikan di domain Anda dengan HTTPS.
sidebar_position: 3
sidebar_icon: rocket
sidebar_label: Kubernetes dengan k3s
---

Panduan ini membangun klaster k3s sungguhan, **kube-k3s**, di dua server dan menyajikan aplikasi web darinya di `https://kube-k3s.example.com`. Ikuti dengan server dan domain Anda sendiri; lamanya sekitar 30 menit, sebagian besar menunggu.

k3s adalah engine yang ringan: satu program kecil, cukup dengan memori 2 GB dan bisa di Raspberry Pi. Untuk produksi yang di-hardening, lihat [Kubernetes dengan RKE2](./kubernetes-rke2.md). Masih asing dengan istilahnya? Baca dulu [Grup server dan klaster](./overview.md).

## Sebelum mulai

Anda butuh server yang sudah dikelola dPanel dan berstatus **Ready**. Panduan ini memakai dua:

| Server     | Peran di klaster | Ukuran                    |
| ---------- | ---------------- | ------------------------- |
| kube-k3s-1 | **Server**       | 2 CPU, 4 GB, Ubuntu 24.04 |
| kube-k3s-2 | **Agent**        | 2 CPU, 4 GB, Ubuntu 24.04 |

- **Ukuran:** memori 2 GB atau lebih per server sudah nyaman; 1 GB adalah batas minimum. amd64, arm64, atau armhf (Raspberry Pi) bisa semua.
- **Sistem:** Ubuntu. Panduan ini memakai Ubuntu 24.04.
- **Region yang sama** untuk semua server, tidak masuk grup mana pun, tanpa Docker, k3s, atau RKE2, dan firewall dPanel mati.
- **Dalam satu jaringan privat,** supaya server bisa saling terhubung. Server yang bergabung lewat agen dPanel bisa dipakai, sama seperti server yang terhubung lewat SSH. Lihat [Aturan yang menjaga server Anda](./overview.md#aturan-yang-menjaga-server-anda).

Server baru yang diluncurkan dari dPanel dalam project cloud dan region yang sama sudah memenuhi semuanya, apa pun cara terhubungnya. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md). Saat firewall dPanel mati, tidak ada yang memblokir port di server. Di DigitalOcean dan IDCloudHost dPanel juga tidak membuat firewall penyedia, jadi port 30080 dan API Kubernetes di port 6443 bisa dijangkau dari internet. Tambahkan firewall penyedia kalau Anda tidak menginginkannya.

## 1. Mulai grup Kubernetes

1. Buka **Servers**, lalu **Server groups**, dan tekan **New group**.
2. Di **What should this group be?**, pilih **Kubernetes** lalu tekan **Next**.

![New group, langkah Type: kartu Kubernetes terpilih di samping Generic, dengan PostgreSQL, MariaDB, Redis, dan Kafka bertanda Coming soon](../../assets/clusters/wizard-type-kubernetes.webp 'Pilih Kubernetes. Jenis klaster lain menyusul.')

## 2. Pilih server dan perannya

1. **Name**: `kube-k3s`. **Description**: apa saja yang membantu, misalnya "k3s cluster serving kube-k3s.example.com".
2. Di **Servers**, centang **kube-k3s-1** dulu, lalu **kube-k3s-2**. Ketik di **Search servers** untuk menemukannya dengan cepat.
3. Setiap server terpilih muncul di atas dengan tombol peran. Yang pertama mendapat **Server** (control plane), yang lain **Agent** (hanya aplikasi). Tekan tombol yang lain untuk mengubah peran.

![Dua server terpilih: kube-k3s-1 berperan Server dan kube-k3s-2 berperan Agent, di atas pemilih server](../../assets/clusters/k3s-wizard-servers.webp 'kube-k3s-1 menjalankan control plane, kube-k3s-2 menjalankan aplikasi.')

## 3. Pilih k3s

Gulir ke **Engine**:

1. Pilih **k3s**.
2. **Version**: biarkan yang terbaru, di sini `v1.37.1+k3s1`.
3. **Built-in ingress**: biarkan **mati**. Load balancer dPanel yang membawa trafik web masuk (langkah 8), dan ingress bawaan k3s akan merebut port 80 dan 443 darinya.

![Pilihan Engine dengan k3s terpilih, versi v1.37.1+k3s1, dan Built-in ingress mati](../../assets/clusters/k3s-wizard-engine.webp 'Pilih k3s dan biarkan Built-in ingress mati.')

Tekan **Next**.

## 4. Periksa lalu pasang

**Review** menampilkan apa yang dipasang di mana: k3s sebagai **Server** di kube-k3s-1 dan sebagai **Agent** di kube-k3s-2. Tekan **Create and install**.

![Langkah Review: grup kube-k3s, jenis Kubernetes, engine k3s, versi v1.37.1+k3s1, k3s dipasang sebagai Server di kube-k3s-1 dan sebagai Agent di kube-k3s-2](../../assets/clusters/k3s-wizard-review.webp 'Periksa apa yang dipasang di mana, lalu tekan Create and install.')

dPanel membuat grupnya dan memulai satu job pemasangan untuk kedua server: server dulu, lalu agent.

![Langkah Installing: Installing kube-k3s, status Installing, eksekusi terakhir cluster_install Queued, dan peringatan bahwa satu server adalah titik gagal tunggal](../../assets/clusters/k3s-wizard-installing.webp 'Pemasangan masuk antrean. Dengan satu server, dPanel memperingatkan bahwa control plane tidak punya cadangan.')

:::info[Peringatan titik gagal tunggal]
Dengan satu **Server**, klaster berhenti menerima perubahan kalau server itu mati; aplikasi yang sudah berjalan tetap berjalan. Itu wajar untuk belajar dan proyek kecil. Pakai tiga server berperan **Server** kalau klaster harus tetap hidup saat kehilangan satu server.
:::

Wizard boleh ditutup; pemasangan tetap berjalan. Lamanya sekitar 10 menit.

## 5. Periksa klasternya

Buka grupnya (**Open group page**, atau pilih di **Server groups**). Tab **Cluster** menampilkan engine dan versi, **API endpoint**, eksekusi terakhir, dan setiap node dengan perannya. Saat pemasangan selesai, status dan kedua node bertuliskan **Ready**.

![Grup kube-k3s di tab Cluster: Kubernetes, k3s v1.37.1+k3s1, status Ready, API endpoint di port 6443, cluster_install Succeeded, dan dua node, Server dan Agent, keduanya ready](../../assets/clusters/cluster-detail.webp 'Klaster k3s yang siap: kedua node sudah bergabung dan pemasangan berhasil.')

## 6. Buka terminal di node Server

Anda berbicara dengan Kubernetes lewat `kubectl`, yang dijalankan di terminal pada node berperan **Server**. dPanel membuka terminal itu di browser Anda; tidak perlu kunci SSH atau alat apa pun di komputer Anda.

1. Di tab **Cluster**, pilih **kube-k3s-1** di tabel **Nodes**. (Atau buka **Servers** lalu pilih di sana.)
2. Di kanan atas halaman server, tekan **Open terminal**.

![Header halaman server kube-k3s-1 dengan tombol Open terminal di kanan atas](../../assets/clusters/server-open-terminal.webp 'Open terminal ada di kanan atas setiap halaman server.')

Terminal terbuka di bagian bawah halaman, masuk sebagai user login server. Jalankan:

```bash
sudo k3s kubectl get nodes
```

Kedua node bertuliskan `Ready`. k3s menyertakan `kubectl` di dalam perintah `k3s`, jadi setiap perintah diawali `sudo k3s kubectl`.

## 7. Jalankan aplikasi pertama

Di terminal yang sama, buat `hello.yaml`: jalankan `nano hello.yaml`, tempel teks di bawah, lalu tekan `Ctrl+O`, `Enter`, dan `Ctrl+X`. Isinya menjalankan dua salinan halaman web kecil dan membukanya di port `30080` setiap node (sebuah **NodePort**):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 2
  selector:
    matchLabels: { app: hello }
  template:
    metadata:
      labels: { app: hello }
    spec:
      containers:
        - name: hello
          image: hashicorp/http-echo:1.0
          args:
            [
              '-listen=:8080',
              '-text=Hello from kube-k3s, a k3s cluster on dPanel',
            ]
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: hello
spec:
  type: NodePort
  selector: { app: hello }
  ports:
    - { port: 80, targetPort: 8080, nodePort: 30080 }
```

Terapkan lalu periksa:

```bash
sudo k3s kubectl apply -f hello.yaml
sudo k3s kubectl get pods -o wide
curl http://127.0.0.1:30080
```

Kubernetes menaruh satu salinan di setiap node, dan `curl` menjawab dengan halamannya:

![Terminal browser di kube-k3s-1: kubectl get nodes menampilkan dua node Ready, kubectl get pods menampilkan satu pod hello di setiap node, dan curl menjawab Hello from kube-k3s, a k3s cluster on dPanel](../../assets/clusters/k3s-terminal.webp 'Kedua node Ready, satu salinan aplikasi di masing-masing, dan aplikasi menjawab di port 30080.')

## 8. Sajikan di domain Anda dengan HTTPS

[Load balancer](../networking/load-balancers.md) dPanel di node **Server** membawa trafik web masuk ke klaster:

1. Buka **Load Balancers** lalu tekan **Create a load balancer**.
2. **Gateway server**: **kube-k3s-1**. **Web server engine**: **Caddy Server**.
3. **Domain Name**: **Managed**, **Subdomain** `kube-k3s`, dan domain Anda. Biarkan **HTTPS** aktif.
4. **Routing mode**: **L7**. **Routes**: **Type** **Proxy Pass**, **Matching Path** `/*`, alamat `127.0.0.1` dan port `30080`.
5. Tekan **Create load balancer**.

Di server baru, load balancer pertama juga memasang Caddy, yang bisa memakan waktu sekitar 10 menit; berikutnya sekitar satu menit. Saat statusnya **Ready**, buka `https://kube-k3s.domain-anda`. Halamannya bertuliskan `Hello from kube-k3s, a k3s cluster on dPanel`, dengan sertifikat HTTPS yang sah.

:::tip[Kenapa 127.0.0.1 bisa]
NodePort terbuka di **setiap** node, dan Kubernetes meneruskannya ke salinan yang berjalan, bahkan yang ada di node lain. Jadi gateway cukup mengirim trafik ke dirinya sendiri di port 30080 dan tetap menjangkau kedua salinan.
:::

## Mencopot, memasang lagi, atau menghapus

Di tab **Cluster** grupnya:

- **Uninstall** menghapus k3s dari kedua node. Aplikasi di klaster berhenti dan datanya di node dihapus. Server dan grup tetap ada; klaster bertuliskan **Uninstalled**.
- **Install again** muncul kalau pemasangan gagal atau setelah dicopot. Tombol ini memasang di server yang sama dengan peran dan versi yang sama.
- **Delete cluster** bisa untuk klaster yang sudah dicopot, gagal, atau belum pernah dipasang. Grupnya tetap ada sebagai grup umum; hapus grup itu agar servernya bisa dipakai klaster lain.

Hapus dulu load balancer yang Anda buat untuk klaster itu.

## Belum tersedia

- Menambah atau mengeluarkan node setelah pemasangan, dan meng-upgrade versi Kubernetes.
- Mengunduh kubeconfig untuk `kubectl` di komputer Anda sendiri. Untuk sementara gunakan **Open terminal** di node Server.
- Membuka port klaster di firewall dPanel secara otomatis; itulah sebabnya firewall node harus mati.

## Pemecahan masalah

| Yang Anda lihat                                                                             | Solusi                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server tidak bisa dipilih: **Already in a group**                                           | Keluarkan dulu dari grupnya, atau pilih server lain.                                                                                                                                                                                |
| Pembuatan gagal: server sudah menjalankan Docker, k3s, atau RKE2                            | Gunakan server baru, atau copot perangkat lunak itu dulu. Kalau Anda menghapusnya manual, tekan **Refresh inventory** di tab **Modules** server agar dPanel tahu sudah tidak ada.                                                   |
| Status bertuliskan **Failed**                                                               | Baca **Penyebab gagal** di bagian atas tab **Cluster**, perbaiki, lalu tekan **Install again**.                                                                                                                                     |
| **Cluster preflight failed:** sebuah server tidak bisa menjangkau server lain di suatu port | Tabel **Pemeriksaan konektivitas** mencantumkan setiap jalur yang terblokir. Izinkan port itu antar server di firewall atau security group cloud Anda, atau pindahkan server ke satu jaringan privat, lalu tekan **Install again**. |
| Sebuah server **did not accept the cluster job's SSH sign-in**                              | Lihat **Akses klaster** server itu di tabel **Nodes**. Pastikan agennya online (terlihat di halaman server), lalu tekan **Install again**.                                                                                          |
| Pembuatan ditolak: tidak ada server yang bergabung lewat agen yang sedang online            | Nyalakan salah satu server, atau tunggu sampai agennya online, lalu coba lagi.                                                                                                                                                      |
| `kubectl` menolak dengan permission denied                                                  | Awali perintahnya dengan `sudo k3s kubectl`.                                                                                                                                                                                        |
| Domain tidak menjawab                                                                       | Periksa dulu `curl http://127.0.0.1:30080` di kube-k3s-1, lalu status dan **Logs** load balancer.                                                                                                                                   |

## Dari terminal

Klaster yang sama bisa dibuat dengan CLI `dnocs`, memakai ID server dari `dnocs server list`:

```bash
dnocs cluster create --name kube-k3s --engine k3s --server <ID node Server> --agent <ID node Agent>
dnocs cluster detail --id <ID klaster>
```

`dnocs cluster install` memasang ulang setelah gagal, sedangkan `dnocs cluster uninstall` dan `dnocs cluster delete` menghapusnya. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang `dnocs`.

## Pertanyaan yang sering diajukan

### Berapa lama pemasangannya?

Sekitar 10 menit untuk dua server. Wizard boleh ditutup; pemasangan tetap berjalan dan tab **Cluster** menampilkan progresnya.

### Bisakah saya menambah node ke klaster nanti?

Belum. Server dan perannya ditetapkan saat klaster dibuat. Untuk mengubahnya, uninstall dan hapus klasternya, lalu buat yang baru.

### Bagaimana memakai kubectl dari komputer saya sendiri?

Mengunduh kubeconfig belum tersedia. Pakai **Open terminal** di node **Server** dan jalankan `sudo k3s kubectl` di sana.

### Pemasangannya gagal. Lalu bagaimana?

Buka eksekusi terakhir dari tab **Cluster** untuk membaca error-nya, perbaiki penyebabnya, lalu tekan **Install again**. Server, peran, engine, dan versinya tetap sama.
