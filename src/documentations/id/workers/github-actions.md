---
title: Worker GitHub Actions
description: Jalankan job dPanel di GitHub Actions dalam lima menit. Daftarkan repositori, commit workflow pendek dengan dPanel-ID/worker-action, lalu beralih.
sidebar_position: 2
sidebar_icon: git-branch
---

Worker GitHub Actions menjalankan job workspace dPanel Anda di repositori GitHub Anda sendiri. GitHub Actions adalah fitur bawaan GitHub untuk menjalankan skrip, yang disebut workflow, di mesin milik GitHub. dPanel memulai workflow Anda setiap kali ada job yang menunggu; setiap run mengambil satu job, menjalankannya ke server Anda lewat SSH, lalu selesai. Tidak ada token yang perlu disalin: run masuk ke dPanel dengan token identitas GitHub, dan dPanel memastikan run itu berasal dari repositori dan workflow yang Anda daftarkan.

## Sebelum mulai

- Repositori GitHub yang bisa Anda push. Repositori baru yang privat pun boleh.
- Server yang sudah terhubung ke dPanel lewat SSH. Tidak ada yang perlu disiapkan lagi di server. Server yang terhubung dengan [agen dPanel](../servers/register-a-private-machine.md) menjalankan pemasangan dan deploy di dirinya sendiri, jadi worker ini tidak terhubung ke server itu.

:::info[Tidak perlu menambahkan kunci SSH]
Anda **tidak** perlu menambahkan kunci SSH apa pun ke GitHub, ke secrets repositori, maupun ke server Anda. Pada setiap job, dPanel memberi run akses SSH yang sama dengan yang sudah dipakai dPanel untuk server Anda, dan run melupakannya begitu selesai.

Satu-satunya yang perlu dicek: jika firewall di server Anda hanya mengizinkan SSH (port 22) dari alamat IP tertentu, runner GitHub tidak bisa terhubung. Dalam kasus itu, gunakan [worker VM](./vm.md) di dalam jaringan Anda.
:::

## 1. Daftarkan repositori di dPanel

1. Buka **Profile** untuk workspace pribadi Anda, atau halaman tim untuk sebuah tim.
2. Di **Workers**, tekan **Add worker** dan pilih **GitHub workflow**.
3. **Name**: nama apa saja untuk membedakan worker, misalnya "GitHub CI".
4. **Repository**: `owner/name`, atau tempel tautan GitHub.
5. Biarkan **Workflow file** `dpanel-worker.yml` dan **Branch or tag** `main` kecuali Anda butuh yang lain.
6. Tekan **Add worker**.

![Dialog Add worker pada tab GitHub workflow, dengan Name GitHub CI, Repository acme/dpanel-workers, Workflow file dpanel-worker.yml dan Branch or tag main](../../assets/workers/add-github-worker.webp 'Add worker → GitHub workflow, sudah diisi.')

dPanel menampilkan file workflow untuk workspace Anda. Salin file itu.

![Dialog GitHub CI added yang menampilkan file workflow .github/workflows/dpanel-worker.yml yang memakai dPanel-ID/worker-action@v1 dengan nilai workspace](../../assets/workers/github-worker-workflow.webp 'dPanel memberi file workflow dengan nilai workspace Anda sudah terisi. Tekan Copy.')

![Bagian akhir dialog GitHub CI added dengan tiga langkah: commit file, pasang aplikasi GitHub dnocs-id, beralih ke worker pribadi](../../assets/workers/github-worker-steps.webp 'dPanel menampilkan langkah berikutnya: tiga langkah selanjutnya di panduan ini.')

## 2. Tambahkan file workflow

Commit file sebagai `.github/workflows/dpanel-worker.yml` di branch yang Anda daftarkan:

```yaml
name: dPanel worker

on:
  repository_dispatch:
    types: [dpanel-worker]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  worker:
    runs-on: ubuntu-24.04
    timeout-minutes: 60
    steps:
      - uses: dPanel-ID/worker-action@v1
        with:
          workspace: group:1234567890
```

Ganti `group:1234567890` dengan nilai dari dPanel. Nilai ini menunjukkan workspace Anda: `group:<id tim>` untuk tim, `user:<id Anda>` untuk workspace pribadi.

:::info[Yang dilakukan action]
[`dPanel-ID/worker-action`](https://github.com/dPanel-ID/worker-action) memeriksa izin identitas, memasang Ansible, mengunduh executor dPanel dan memeriksa checksum-nya, lalu menjalankan satu job. Input opsional: `manager-url`, `executor-version` dan `idle-timeout`.
:::

## 3. Izinkan dPanel memulai workflow

Pasang aplikasi GitHub dPanel (**dnocs-id**) di repositori tersebut. dPanel memakainya hanya untuk memulai workflow Anda dengan event `repository_dispatch`, yang membutuhkan izin **Contents: read and write**.

## 4. Beralih ke worker pribadi

Kembali ke **Workers**, pilih **Private workers** dan konfirmasi **Switch to private workers**. Mulai sekarang setiap job workspace ini berjalan di workflow Anda.

![Kartu Workers yang menampilkan worker VM office-vm-01 dan worker GitHub workflow acme/dpanel-workers, dengan pilihan Private workers di samping Shared workers](../../assets/workers/worker-list.webp 'Worker Anda tampil di bawah pilihan mode. Pilih Private workers agar job dikirim ke worker tersebut.')

## Pastikan berjalan

Jalankan job apa saja, misalnya pasang modul di salah satu server Anda. Dalam beberapa detik, run **dPanel worker** muncul di tab **Actions** repositori Anda. Run itu mengambil job dan selesai saat job selesai; progres job tampil di dPanel seperti biasa.

Anda juga bisa menekan **Run workflow** di tab **Actions**: tanpa job yang menunggu, run akan masuk, menunggu dua menit, lalu selesai dengan sukses, tanda bahwa setup sudah benar.

## Berapa banyak run

Setiap job mendapat run sendiri, jadi beberapa job berjalan bersamaan, hingga 10 per workspace. Job di server yang sama tetap berjalan bergantian.

## Pemecahan masalah

| Yang Anda lihat                                       | Perbaikan                                                                                                                                                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Run gagal dengan "Add 'permissions: id-token: write'" | Tambahkan blok `permissions` dari file di atas.                                                                                                                                                          |
| Tidak ada run saat job menunggu                       | Pasang aplikasi **dnocs-id** di repositori, dan pastikan workspace memakai **Private workers**.                                                                                                          |
| Run berjalan tetapi tidak mengambil job               | Nilai `workspace`, repositori, file workflow atau branch berbeda dari yang didaftarkan di dPanel.                                                                                                        |
| Job gagal terhubung ke server                         | Firewall memblokir SSH (port 22) dari runner GitHub. Buka port 22 di server tersebut, atau gunakan [worker VM](./vm.md) di dalam jaringan Anda. Tidak ada kunci yang kurang: dPanel yang menyediakannya. |

Untuk berhenti, pilih lagi **Shared workers (dPanel)**, atau hapus worker. File workflow tetap ada di repositori; hapus di sana jika tidak diperlukan lagi.

## Pertanyaan yang sering diajukan

### Apakah ini memakai menit GitHub Actions saya?

Ya. Setiap job berjalan sebagai satu run workflow di repositori Anda, jadi dihitung ke menit Actions repositori itu. Run di repositori publik gratis di runner standar GitHub.

### Apakah saya perlu menyimpan token dPanel di GitHub?

Tidak. Run masuk dengan token identitas milik GitHub sendiri. Itu sebabnya workflow membutuhkan `permissions: id-token: write`.

### Bisakah saya mendaftarkan worker dari terminal?

Bisa. `dnocs worker add --type github --name ci --repository owner/name` mendaftarkannya dan mencetak file workflow-nya. Tambahkan `--workflow` atau `--ref` jika berbeda dari `dpanel-worker.yml` dan `main`.

### Berapa job yang berjalan bersamaan?

Hingga 10 per workspace, satu job per run. Job di server yang sama tetap berjalan bergantian.
