---
title: Kubernetes dengan RKE2
description: Buat klaster Kubernetes RKE2 di server dPanel Anda langkah demi langkah, jalankan aplikasi pertama, lalu sajikan di domain Anda dengan HTTPS.
sidebar_position: 4
sidebar_icon: shield-check
sidebar_label: Kubernetes dengan RKE2
---

Panduan ini membangun klaster Kubernetes RKE2 sungguhan dengan dPanel, **kube-rke**, di dua server dan menyajikan aplikasi web darinya di `https://kube-rke.devetek.app`. Ikuti dengan server dan domain Anda sendiri; lamanya sekitar 30 menit, sebagian besar menunggu.

RKE2 adalah Kubernetes dari Rancher yang fokus pada keamanan: bawaan siap CIS, plugin jaringan Canal, dan control plane-nya (etcd, API server, scheduler) berjalan sebagai pod yang terlihat. RKE2 butuh server lebih besar daripada k3s dan hanya berjalan di amd64 dan arm64. Untuk mesin kecil atau Raspberry Pi, lihat [Kubernetes dengan k3s](./kubernetes-k3s.md). Masih asing dengan istilahnya? Baca dulu [Grup server dan klaster](./overview.md).

## Sebelum mulai

Anda butuh server yang sudah dikelola dPanel dan berstatus **Ready**. Panduan ini memakai dua:

| Server     | Peran di klaster | Ukuran                    |
| ---------- | ---------------- | ------------------------- |
| kube-rke-1 | **Server**       | 2 CPU, 4 GB, Ubuntu 24.04 |
| kube-rke-2 | **Agent**        | 2 CPU, 4 GB, Ubuntu 24.04 |

- **Ukuran:** 2 CPU dan memori 4 GB atau lebih per server, amd64 atau arm64. RKE2 menjalankan lebih banyak pod sistem daripada k3s; server yang lebih kecil kewalahan.
- **Sistem:** Ubuntu. Panduan ini diuji di Ubuntu 24.04.
- **Region yang sama** untuk semua server, tidak masuk grup mana pun, tanpa Docker, k3s, atau RKE2, dan firewall dPanel mati.

Server baru yang diluncurkan dari dPanel sudah memenuhi semuanya. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md).

## 1. Mulai grup Kubernetes

1. Buka **Servers**, lalu **Server groups**, dan tekan **New group**.
2. Di **What should this group be?**, pilih **Kubernetes** lalu tekan **Next**.

![New group, langkah Type: kartu Kubernetes terpilih di samping Generic, dengan PostgreSQL, MariaDB, Redis, dan Kafka bertanda Coming soon](../../assets/clusters/wizard-type-kubernetes.webp 'Pilih Kubernetes. Jenis klaster lain menyusul.')

## 2. Pilih server dan perannya

1. **Name**: `kube-rke`. **Description**: apa saja yang membantu, misalnya "RKE2 cluster serving kube-rke.devetek.app".
2. Di **Servers**, ketik `kube-rke` di **Search servers**, lalu centang **kube-rke-1** dulu dan **kube-rke-2** kedua.
3. Setiap server terpilih muncul di atas dengan tombol peran. Yang pertama mendapat **Server** (control plane), yang lain **Agent** (hanya aplikasi). Tekan tombol yang lain untuk mengubah peran.

![Langkah Configuration dengan nama kube-rke, deskripsi, dan dua server terpilih: kube-rke-1 berperan Server dan kube-rke-2 berperan Agent](../../assets/clusters/rke2-wizard-servers.webp 'Pencarian mempersempit daftar; kube-rke-1 menjalankan control plane, kube-rke-2 menjalankan aplikasi.')

## 3. Pilih RKE2

Gulir ke **Engine**:

1. Pilih **RKE2**. Di server amd64 dengan memori cukup, pilihan ini sudah terpilih.
2. **Version**: biarkan yang terbaru, di sini `v1.37.1+rke2r1`.
3. **Built-in ingress**: biarkan **mati**. Load balancer dPanel yang membawa trafik web masuk (langkah 8), dan ingress-nginx bawaan RKE2 akan merebut port 80 dan 443 darinya.

![Pilihan Engine dengan RKE2 terpilih, versi v1.37.1+rke2r1, dan Built-in ingress mati](../../assets/clusters/rke2-wizard-engine.webp 'Pilih RKE2 dan biarkan Built-in ingress mati.')

Tekan **Next**.

## 4. Periksa lalu pasang

**Review** menampilkan apa yang dipasang di mana: RKE2 sebagai **Server** di kube-rke-1 dan sebagai **Agent** di kube-rke-2. Tekan **Create and install**.

![Langkah Review: grup kube-rke, jenis Kubernetes, engine RKE2, versi v1.37.1+rke2r1, RKE2 dipasang sebagai Server di kube-rke-1 dan sebagai Agent di kube-rke-2](../../assets/clusters/rke2-wizard-review.webp 'Periksa apa yang dipasang di mana, lalu tekan Create and install.')

dPanel membuat grupnya dan memulai satu job pemasangan untuk kedua server: server dulu, lalu agent.

![Langkah Installing: Installing kube-rke, status Installing, engine RKE2 v1.37.1+rke2r1, eksekusi terakhir cluster_install Queued, dan peringatan titik gagal tunggal](../../assets/clusters/rke2-wizard-installing.webp 'Pemasangan masuk antrean.')

:::info[Peringatan titik gagal tunggal]
Dengan satu **Server**, klaster berhenti menerima perubahan kalau server itu mati; aplikasi yang sudah berjalan tetap berjalan. Pakai tiga server berperan **Server** kalau klaster harus tetap hidup saat kehilangan satu server.
:::

Wizard boleh ditutup; pemasangan tetap berjalan. Lamanya sekitar 12 menit: RKE2 menarik lebih banyak image daripada k3s.

## 5. Periksa klasternya

Buka grupnya (**Open group page**, atau pilih di **Server groups**). Tab **Cluster** menampilkan engine dan versi, **API endpoint**, eksekusi terakhir, dan setiap node dengan perannya. Saat pemasangan selesai, status dan kedua node bertuliskan **Ready**.

![Grup kube-rke di tab Cluster: Kubernetes, RKE2 v1.37.1+rke2r1, status Ready, API endpoint di port 6443, cluster_install Succeeded, dan dua node, Server dan Agent, keduanya ready](../../assets/clusters/rke2-cluster-detail.webp 'Klaster RKE2 yang siap: kedua node sudah bergabung dan pemasangan berhasil.')

## 6. Buka terminal di node Server

Anda berbicara dengan Kubernetes lewat `kubectl`, yang dijalankan di terminal pada node berperan **Server**. dPanel membuka terminal itu di browser Anda; tidak perlu kunci SSH atau alat apa pun di komputer Anda.

1. Di tab **Cluster**, pilih **kube-rke-1** di tabel **Nodes**. (Atau buka **Servers** lalu pilih di sana.)
2. Di kanan atas halaman server, tekan **Open terminal**.

![Header halaman server kube-rke-1 dengan tombol Open terminal di kanan atas](../../assets/clusters/rke2-open-terminal.webp 'Open terminal ada di kanan atas setiap halaman server.')

Terminal terbuka di bagian bawah halaman. RKE2 menyimpan `kubectl` dan kubeconfig-nya di folder sendiri, jadi atur sekali untuk setiap terminal:

```bash
sudo -i
export PATH=$PATH:/var/lib/rancher/rke2/bin
export KUBECONFIG=/etc/rancher/rke2/rke2.yaml
kubectl get nodes
```

Kedua node bertuliskan `Ready`. RKE2 menamai node sesuai ID server di dPanel, misalnya `dpanel-186`. Sisa panduan ini memakai shell root tersebut.

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
              '-text=Hello from kube-rke, a RKE2 cluster on dPanel',
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
kubectl apply -f hello.yaml
kubectl get pods -o wide
curl http://127.0.0.1:30080
```

Kubernetes menaruh satu salinan di setiap node, dan `curl` menjawab dengan halamannya:

![Terminal browser di kube-rke-1: kubectl get nodes menampilkan dpanel-186 dan dpanel-187 Ready, kubectl get pods menampilkan satu pod hello di setiap node, dan curl menjawab Hello from kube-rke, a RKE2 cluster on dPanel](../../assets/clusters/rke2-terminal.webp 'Kedua node Ready, satu salinan aplikasi di masing-masing, dan aplikasi menjawab di port 30080.')

## 8. Sajikan di domain Anda dengan HTTPS

[Load balancer](../networking/load-balancers.md) dPanel di node **Server** membawa trafik web masuk ke klaster:

1. Buka **Load Balancers** lalu tekan **Create a load balancer**.
2. **Gateway server**: **kube-rke-1**. **Web server engine**: **Caddy Server**.
3. **Domain Name**: **Managed**, **Subdomain** `kube-rke`, dan domain Anda. Biarkan **HTTPS** aktif.
4. **Routing mode**: **L7**. **Routes**: **Type** **Proxy Pass**, **Matching Path** `/*`, alamat `127.0.0.1` dan port `30080`.
5. Tekan **Create load balancer**.

Di server baru, load balancer pertama juga memasang Caddy, yang memakan waktu sekitar 10 menit; berikutnya sekitar satu menit. Saat statusnya **Ready**, buka `https://kube-rke.domain-anda`. Halamannya bertuliskan `Hello from kube-rke, a RKE2 cluster on dPanel`, dengan sertifikat HTTPS yang sah.

:::tip[Kenapa 127.0.0.1 bisa]
NodePort terbuka di **setiap** node, dan Kubernetes meneruskannya ke salinan yang berjalan, bahkan yang ada di node lain. Jadi gateway cukup mengirim trafik ke dirinya sendiri di port 30080 dan tetap menjangkau kedua salinan.
:::

## Mencopot, memasang lagi, atau menghapus

Di tab **Cluster** grupnya:

- **Uninstall** menghapus RKE2 dari kedua node (menjalankan skrip uninstall bawaan RKE2). Aplikasi di klaster berhenti dan datanya di node dihapus. Server dan grup tetap ada; klaster bertuliskan **Uninstalled**.
- **Install again** muncul kalau pemasangan gagal atau setelah dicopot. Tombol ini memasang di server yang sama dengan peran dan versi yang sama.
- **Delete cluster** bisa untuk klaster yang sudah dicopot, gagal, atau belum pernah dipasang. Grupnya tetap ada sebagai grup umum; hapus grup itu agar servernya bisa dipakai klaster lain.

Klaster di panduan ini melewati ketiganya: awalnya dibuat dari baris perintah, lalu dicopot, dihapus bersama grupnya, dan dibuat lagi di dua server yang sama lewat wizard di atas.

Hapus dulu load balancer yang Anda buat untuk klaster itu.

## Belum tersedia

- Menambah atau mengeluarkan node setelah pemasangan, dan meng-upgrade versi Kubernetes.
- Mengunduh kubeconfig untuk `kubectl` di komputer Anda sendiri. Untuk sementara gunakan **Open terminal** di node Server.
- Membuka port klaster di firewall dPanel secara otomatis; itulah sebabnya firewall node harus mati.

## Pemecahan masalah

| Yang Anda lihat                                                  | Solusi                                                                                                                                                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RKE2 tampil pudar                                                | Salah satu server adalah ARM 32-bit (armhf). Gunakan [k3s](./kubernetes-k3s.md) di sana.                                                                                          |
| Server tidak bisa dipilih: **Already in a group**                | Keluarkan dulu dari grupnya, atau pilih server lain.                                                                                                                              |
| Pembuatan gagal: server sudah menjalankan Docker, k3s, atau RKE2 | Gunakan server baru, atau copot perangkat lunak itu dulu. Kalau Anda menghapusnya manual, tekan **Refresh inventory** di tab **Modules** server agar dPanel tahu sudah tidak ada. |
| Status bertuliskan **Failed**                                    | Buka eksekusi terakhir dari tab **Cluster** untuk membaca galatnya, perbaiki, lalu tekan **Install again**.                                                                       |
| `kubectl: command not found`                                     | Jalankan dulu baris `sudo -i` dan dua baris `export` dari langkah 6 di terminal itu.                                                                                              |
| Domain tidak menjawab                                            | Periksa dulu `curl http://127.0.0.1:30080` di kube-rke-1, lalu status dan **Logs** load balancer.                                                                                 |

## Dari terminal

Klaster yang sama bisa dibuat dengan CLI `dnocs`, memakai ID server dari `dnocs server list`:

```bash
dnocs cluster create --name kube-rke --engine rke2 --server <ID node Server> --agent <ID node Agent>
dnocs cluster detail --id <ID klaster>
```

`dnocs cluster install` memasang ulang setelah gagal, sedangkan `dnocs cluster uninstall` dan `dnocs cluster delete` menghapusnya. Lihat [AI di terminal](../ai/ai-in-the-terminal.md) untuk memasang `dnocs`.

## Pertanyaan yang sering diajukan

### Berapa lama pemasangannya?

Sekitar 12 menit untuk dua server. Wizard boleh ditutup; pemasangan tetap berjalan dan tab **Cluster** menampilkan progresnya.

### Bisakah saya menambah node ke klaster nanti?

Belum. Server dan perannya ditetapkan saat klaster dibuat. Untuk mengubahnya, uninstall dan hapus klasternya, lalu buat yang baru.

### Bagaimana memakai kubectl dari komputer saya sendiri?

Mengunduh kubeconfig belum tersedia. Pakai **Open terminal** di node **Server** dan jalankan `kubectl` di sana setelah baris `sudo -i` dan `export` dari langkah 6.

### Pemasangannya gagal. Lalu bagaimana?

Buka eksekusi terakhir dari tab **Cluster** untuk membaca error-nya, perbaiki penyebabnya, lalu tekan **Install again**. Server, peran, engine, dan versinya tetap sama.
