---
title: Klaster Kubernetes
description: Buat klaster Kubernetes dengan k3s atau RKE2 di server dPanel Anda, jalankan aplikasi pertama, lalu pasang di domain Anda sendiri dengan HTTPS.
sidebar_position: 3
sidebar_icon: rocket
sidebar_label: Klaster Kubernetes
---

Panduan ini membawa Anda dari dua server biasa menjadi klaster Kubernetes yang melayani aplikasi web di `https://domain-anda` dalam sekitar 30 menit. Panduan ini ditulis sambil membangun dua klaster sungguhan: **kube-k3s** dengan k3s dan **kube-rke** dengan RKE2, masing-masing dengan satu server dan satu agent.

Masih asing dengan istilahnya? Baca dulu [Grup server dan klaster](./overview.md).

## Sebelum mulai

Anda butuh server yang sudah dikelola dPanel dan berstatus **Ready**:

|               | k3s                                                | RKE2                             |
| ------------- | -------------------------------------------------- | -------------------------------- |
| Jumlah server | 1 atau lebih (1, 3, 5, atau 7 berperan **Server**) | sama                             |
| Setiap server | Memori 2 GB atau lebih                             | 2 CPU dan memori 4 GB atau lebih |
| Sistem        | Ubuntu 22.04 atau 24.04                            | sama                             |
| CPU           | amd64, arm64, atau armhf                           | amd64 atau arm64                 |

Semua server harus berada di **region yang sama**, tidak masuk grup mana pun, tidak terpasang Docker, k3s, atau RKE2, dan firewall dPanel-nya mati. Server baru yang diluncurkan dari dPanel sudah memenuhi semuanya. Lihat [Membuat server cloud](../servers/cloud-providers/create-a-cloud-server.md).

## 1. Pilih Kubernetes

1. Buka **Servers**, lalu **Server groups**, dan tekan **New group**.
2. Di **What should this group be?**, pilih **Kubernetes** lalu tekan **Next**.

![New group, langkah Type: kartu Generic dan Kubernetes, dengan PostgreSQL, MariaDB, Redis, dan Kafka bertanda Coming soon](../../assets/clusters/wizard-type.webp 'Kubernetes sudah tersedia; jenis klaster lain menyusul.')

## 2. Pilih server, peran, dan engine

1. **Name**: nama grup dan klaster, misalnya `kube-k3s`. Tambahkan **Description** bila perlu.
2. Di **Servers**, centang servernya. Setiap server yang dipilih muncul di atas dengan tombol peran:
   - **Server** menjalankan control plane. Server pertama yang Anda pilih mendapat peran ini.
   - **Agent** hanya menjalankan aplikasi Anda. Server lainnya mendapat peran ini.
     Ubah peran dengan menekan tombol yang lain.
3. Di **Engine**, pilih **k3s** atau **RKE2**. Engine yang tidak bisa berjalan di salah satu server Anda tampil pudar beserta alasannya.
4. **Version**: biarkan yang terbaru kecuali Anda butuh versi lama.
5. **Built-in ingress**: biarkan **mati**. Load balancer dPanel yang akan membawa trafik masuk (langkah 6), dan ingress bawaan engine akan merebut port 80 dan 443 darinya.

![Dua server terpilih: kube-k3s-1 berperan Server dan kube-k3s-2 berperan Agent, di atas pemilih server](../../assets/clusters/wizard-servers.webp 'Setiap server terpilih mendapat peran: Server untuk control plane, Agent untuk aplikasi.')

![Pilihan Engine dengan k3s terpilih, versi v1.37.1+k3s1, dan Built-in ingress mati](../../assets/clusters/wizard-engine.webp 'Pilih engine dan versi. Biarkan Built-in ingress mati.')

Tekan **Next**.

## 3. Periksa lalu pasang

**Review** menampilkan grup, engine, versi, dan **What will be installed where**: setiap server dengan engine, versi, dan perannya. Tekan **Create and install**.

![Langkah Review: grup kube-k3s, jenis Kubernetes, engine k3s, versi v1.37.1+k3s1, dan k3s dipasang sebagai Server di kube-k3s-1 dan sebagai Agent di kube-k3s-2](../../assets/clusters/wizard-review.webp 'Periksa apa yang dipasang di mana, lalu tekan Create and install.')

dPanel membuat grupnya dan memulai satu job pemasangan untuk semua server: server dulu, lalu agent. Wizard terus memantaunya selama berjalan.

![Langkah Installing: Installing kube-k3s, status Installing, eksekusi terakhir cluster_install Queued, dan peringatan bahwa satu server adalah titik gagal tunggal](../../assets/clusters/wizard-installing.webp 'Pemasangan masuk antrean. Dengan satu server, dPanel memperingatkan bahwa control plane tidak punya cadangan.')

:::info[Peringatan titik gagal tunggal]
Dengan satu **Server**, klaster berhenti menerima perubahan kalau server itu mati (aplikasi yang sudah berjalan tetap berjalan). Itu wajar untuk belajar dan proyek kecil. Pilih tiga server berperan **Server** kalau klaster harus tetap hidup saat kehilangan satu server.
:::

Wizard boleh ditutup; pemasangan tetap berjalan. Lamanya sekitar 10 menit untuk k3s dan 12 menit untuk RKE2.

## 4. Periksa klasternya

Buka grupnya. Tab **Cluster** menampilkan **Status**, engine dan versi, **API endpoint**, eksekusi terakhir, serta setiap node dengan peran dan statusnya. Saat pemasangan selesai, status dan setiap node bertuliskan **Ready**.

![Halaman grup kube-k3s di tab Cluster: Kubernetes, k3s v1.37.1+k3s1, status Ready, API endpoint di port 6443, cluster_install Succeeded, dan dua node, Server dan Agent, keduanya ready](../../assets/clusters/cluster-detail.webp 'Klaster yang siap: kedua node sudah bergabung dan pemasangan berhasil.')

Untuk melihat isinya, buka halaman node berperan **Server** (pilih di tabel **Nodes**) lalu tekan **Open terminal** di bagian atas. dPanel membuka shell di server itu langsung di browser, tanpa perlu kunci SSH di sisi Anda; lihat [Terhubung lewat SSH](../servers/connect-over-ssh.md). Lalu jalankan:

```bash
# k3s
sudo k3s kubectl get nodes

# RKE2
sudo /var/lib/rancher/rke2/bin/kubectl --kubeconfig /etc/rancher/rke2/rke2.yaml get nodes
```

Setiap node harus `Ready`:

```text
NAME                               STATUS   ROLES           AGE   VERSION
kube-k3s-1.c.dnocs-demo.internal   Ready    control-plane   7m    v1.37.1+k3s1
kube-k3s-2.c.dnocs-demo.internal   Ready    <none>          4m    v1.37.1+k3s1
```

## 5. Jalankan aplikasi pertama

Di terminal yang sama, simpan ini sebagai `hello.yaml`. Isinya menjalankan dua salinan halaman web kecil dan membukanya di port `30080` setiap node (sebuah **NodePort**). Untuk membuat filenya, jalankan `nano hello.yaml`, tempel teksnya, lalu tekan `Ctrl+O`, `Enter`, dan `Ctrl+X`.

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

Terapkan lalu periksa (di RKE2 pakai perintah `kubectl` yang panjang dari langkah 4):

```bash
sudo k3s kubectl apply -f hello.yaml
sudo k3s kubectl get pods -o wide
curl http://127.0.0.1:30080
```

Kubernetes menaruh satu salinan di setiap node, dan `curl` menjawab `Hello from kube-k3s, a k3s cluster on dPanel`.

## 6. Pasang di domain Anda dengan HTTPS

[Load balancer](../networking/load-balancers.md) dPanel di node **Server** membawa trafik web masuk ke klaster:

1. Buka **Load Balancers** lalu tekan **Create a load balancer**.
2. **Gateway server**: node **Server** klaster. **Web server engine**: **Caddy Server**.
3. **Domain Name**: **Managed**, **Subdomain** misalnya `kube-k3s`, dan domain Anda. Biarkan **HTTPS** aktif.
4. **Routing mode**: **L7**. **Routes**: **Type** **Proxy Pass**, **Matching Path** `/*`, alamat `127.0.0.1` dan port `30080`.
5. Tekan **Create load balancer**.

Di server baru, load balancer pertama juga memasang Caddy, yang memakan waktu sekitar 10 menit; berikutnya sekitar satu menit. Saat statusnya **Ready**, buka `https://kube-k3s.domain-anda`: halamannya datang dari salah satu salinan di klaster, dengan sertifikat HTTPS yang sah.

:::tip[Kenapa 127.0.0.1 bisa]
NodePort terbuka di **setiap** node, dan Kubernetes meneruskannya ke salinan yang berjalan, bahkan yang ada di node lain. Jadi gateway cukup mengirim trafik ke dirinya sendiri di port 30080 dan tetap menjangkau kedua salinan.
:::

## Mencopot atau menghapus klaster

Di tab **Cluster** grupnya:

- **Uninstall** menghapus engine dari setiap node. Aplikasi di klaster berhenti dan datanya di node dihapus. Server dan grup tetap ada, dan klaster bertuliskan **Uninstalled**.
- **Install again** muncul untuk klaster yang gagal dipasang atau sudah dicopot. Tombol ini memasang ulang di server yang sama dengan peran, engine, dan versi yang sama.
- **Delete cluster** hanya bisa untuk klaster yang sudah dicopot, gagal, atau belum pernah dipasang. Grupnya tetap ada sebagai grup umum, jadi bisa dihapus atau servernya dipakai lagi.

Hapus dulu load balancer yang Anda buat untuk klaster itu.

## Belum tersedia

- Menambah atau mengeluarkan node setelah pemasangan, dan meng-upgrade versi Kubernetes.
- Mengunduh kubeconfig untuk memakai `kubectl` dari komputer Anda sendiri. Untuk sementara, tekan **Open terminal** di halaman node Server.
- Membuka port klaster di firewall dPanel secara otomatis; itulah sebabnya firewall node harus mati.

## Pemecahan masalah

| Yang Anda lihat                                                                           | Solusi                                                                                                            |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Server tidak bisa dipilih: **Already in a group**                                         | Keluarkan dulu dari grupnya, atau pilih server lain.                                                              |
| Sebuah engine tampil pudar                                                                | Engine itu tidak bisa berjalan di jenis CPU salah satu server, misalnya RKE2 di Raspberry Pi 32-bit. Gunakan k3s. |
| Pembuatan gagal karena server menjalankan Docker, k3s, atau RKE2, atau firewall-nya aktif | Gunakan server baru, atau copot semua itu dan matikan firewall-nya.                                               |
| Status bertuliskan **Failed**                                                             | Buka eksekusi terakhir dari tab **Cluster** untuk membaca galatnya, perbaiki, lalu tekan **Install again**.       |
| Domain tidak menjawab                                                                     | Periksa dulu `curl http://127.0.0.1:30080` di node server, lalu status dan **Logs** load balancer.                |
