---
title: Worker VM
description: Jalankan job dPanel Anda di server atau VM yang Anda kelola. Tambahkan worker VM di dPanel, salin tokennya sekali, lalu jalankan executor dPanel di mesin sebagai service.
sidebar_position: 3
sidebar_icon: server
---

Worker VM adalah server atau VM yang Anda jalankan untuk mengambil job workspace Anda. Worker ini berjalan terus, meminta job ke dPanel, dan menjalankannya ke server Anda lewat SSH. Gunakan saat server Anda hanya bisa dijangkau dari jaringan Anda sendiri.

## Sebelum mulai

- Server atau VM Linux (Ubuntu 22.04 atau 24.04) yang bisa menjangkau server Anda lewat SSH dan `https://pawon.devetek.app` lewat HTTPS. Anda tidak perlu menambahkan kunci SSH: dPanel memberi worker akses SSH ke server Anda pada setiap job.
- Python 3 dan `pip`.

## 1. Tambahkan worker di dPanel

1. Buka **Profile** untuk workspace pribadi, atau halaman tim Anda.
2. Di **Workers**, tekan **Add worker** dan pilih **VM**.
3. **Name**: misalnya "VM Kantor".
4. **Executor ID**: 2 sampai 63 huruf kecil, angka atau tanda hubung, misalnya `office-vm-01`.
5. Tekan **Add worker**.

![Dialog Add worker pada tab VM, dengan Name Office VM dan Executor ID office-vm-01](../../assets/workers/add-vm-worker.webp 'Add worker → VM, sudah diisi.')

dPanel menampilkan **token** dan pengaturan untuk mesin. **Simpan token sekarang**: token hanya ditampilkan sekali.

![Dialog Office VM added dengan token worker tersamar dan environment untuk executor: token, ID workspace, URL manager dan ID worker](../../assets/workers/vm-worker-token.webp 'Salin blok environment sekarang; token hanya ditampilkan sekali. (Token disamarkan di gambar ini.)')

## 2. Pasang executor di mesin

```bash
python3 -m pip install --user "ansible-core>=2.16,<2.17" jmespath
base=https://raw.githubusercontent.com/dPanel-ID/artifacts/main/executor
version=$(curl -fsSL "$base/LATEST")
curl -fsSL -o dpanelprod-executor "$base/$version/dpanelprod-executor-linux-amd64"
curl -fsSL "$base/$version/SHA256SUMS" | sed 's/dpanelprod-executor-linux-amd64/dpanelprod-executor/' | grep ' dpanelprod-executor$' | sha256sum -c -
chmod +x dpanelprod-executor && sudo mv dpanelprod-executor /usr/local/bin/
```

Gunakan `dpanelprod-executor-linux-arm64` di mesin ARM.

## 3. Jalankan sebagai service

Buat `/etc/dpanel-worker.env` berisi pengaturan dari dPanel (hanya bisa dibaca root):

```bash
DPANEL_EXECUTOR_MANAGER_URL=https://pawon.devetek.app
DPANEL_EXECUTOR_TOKEN=dpw_token_anda
DPANEL_EXECUTOR_WORKSPACE_ID=group:1234567890
DPANEL_EXECUTOR_WORKER_ID=office-vm-01
ENV=production
```

Lalu buat `/etc/systemd/system/dpanel-worker.service`:

```ini
[Unit]
Description=dPanel worker
After=network-online.target

[Service]
EnvironmentFile=/etc/dpanel-worker.env
WorkingDirectory=/var/lib/dpanel-worker
ExecStart=/usr/local/bin/dpanelprod-executor
Restart=always
User=dpanel-worker

[Install]
WantedBy=multi-user.target
```

```bash
sudo useradd --system --create-home --home-dir /var/lib/dpanel-worker dpanel-worker
sudo chmod 600 /etc/dpanel-worker.env
sudo systemctl daemon-reload && sudo systemctl enable --now dpanel-worker
```

Jalankan Ansible sebagai user tersebut juga: pasang dengan `sudo -u dpanel-worker python3 -m pip install --user ...` jika Anda membuat user baru.

## 4. Beralih ke worker pribadi

Di **Workers**, pilih **Private workers** dan konfirmasi. Waktu **Last seen** worker berubah setelah worker meminta job.

![Kartu Workers yang menampilkan worker VM office-vm-01 dan worker GitHub workflow acme/dpanel-workers, dengan pilihan Private workers di samping Shared workers](../../assets/workers/worker-list.webp 'Worker Anda tampil di bawah pilihan mode. Pilih Private workers agar job dikirim ke worker tersebut.')

:::tip[Jalankan beberapa job sekaligus]
Atur `DPANEL_EXECUTOR_SLOTS=3` di file pengaturan agar satu VM menjalankan tiga job bersamaan.
:::

## Token hilang?

Tekan **New token** pada worker. Token lama langsung tidak berlaku; masukkan token baru ke `/etc/dpanel-worker.env` lalu restart service dengan `sudo systemctl restart dpanel-worker`.
