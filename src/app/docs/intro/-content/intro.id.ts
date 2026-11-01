import type { DocsIntroCopy } from '../-rules/intro';

export const DOCS_INTRO_ID: DocsIntroCopy = {
  hero: {
    badge: 'Pengenalan',
    title: 'Server, aplikasi, dan domain Anda dalam satu tempat.',
    subtitle:
      'dPanel menjalankan server baru di penyedia cloud Anda, atau menghubungkan server yang sudah Anda punya, lalu menyiapkannya dan men-deploy aplikasi Anda. Semua yang dibangunnya dituliskan sebagai Ansible yang tetap menjadi milik Anda.',
    primaryCta: 'Buat akun Anda',
    secondaryCta: 'Tonton dPanel di YouTube',
  },
  start: {
    badge: 'Mulai',
    title: 'Dari akun kosong sampai aplikasi berjalan.',
    steps: [
      {
        title: 'Bawa server Anda, atau biarkan dPanel membuatnya',
        text: 'Hubungkan mesin yang sudah Anda jalankan lewat SSH, atau buat VM di AWS, Google Cloud, DigitalOcean, IDCloudHost, Alibaba Cloud, atau Tencent Cloud. Keduanya sama saja: dPanel yang melanjutkan.',
      },
      {
        title: 'dPanel menyiapkan servernya',
        text: 'Siap dalam sekitar 10 sampai 20 menit, tanpa panduan konfigurasi yang harus diikuti dan tanpa pemasangan manual.',
      },
      {
        title: 'Deploy aplikasi Anda',
        text: 'Arahkan dPanel ke repositori Git Anda. Ia membangun rilisnya, mengirimkannya ke server, dan mencatat setiap percobaan.',
      },
      {
        title: 'Beri domain',
        text: 'Tambahkan record DNS dan pasang load balancer di depannya saat Anda siap menerima trafik sungguhan.',
      },
    ],
  },
  capabilities: {
    badge: 'Isi panel',
    title: 'Satu panel untuk seluruh infrastruktur Anda.',
    items: [
      {
        key: 'servers',
        title: 'Server',
        text: 'Buat mesin baru atau hubungkan milik Anda, dan pantau CPU, memori, serta disk seluruh armada.',
      },
      {
        key: 'applications',
        title: 'Aplikasi',
        text: 'Deploy dari Git, simpan setiap artefak, dan lihat rilis mana yang benar-benar sedang berjalan.',
      },
      {
        key: 'traffic',
        title: 'Trafik',
        text: 'Load balancer, domain, dan record DNS, dikelola berdampingan dengan server di belakangnya.',
      },
      {
        key: 'data',
        title: 'Data dan layanan',
        text: 'Pasang basis data dan layanan yang dibutuhkan aplikasi Anda, tanpa membuka sesi shell.',
      },
      {
        key: 'activity',
        title: 'Aktivitas',
        text: 'Setiap operasi tercatat: siapa yang menjalankannya, berapa lama, dan apa yang gagal bila ada.',
      },
      {
        key: 'teams',
        title: 'Tim',
        text: 'Bekerja sendiri di ruang kerja pribadi, atau berbagi satu ruang kerja dengan tim Anda.',
      },
    ],
  },
  ownership: {
    badge: 'Tanpa kunci vendor',
    title: 'Bagian yang baru terasa enam bulan lagi.',
    lead: 'Kebanyakan panel menjadikan infrastruktur Anda milik mereka. dPanel menuliskannya untuk Anda.',
    body: 'Setiap server yang dibangunnya, dan setiap perubahan yang dilakukannya, ditulis sebagai Ansible. Itu bukan sekadar catatan, melainkan sumbernya: jalankan lagi dan Anda mendapat mesin yang sama persis, setiap kali. Anda bisa menjalankannya sendiri, tanpa dPanel sama sekali. Repositorinya masih privat untuk saat ini, jadi belum ada pull request yang bisa Anda tinjau — tetapi minta saja, dan infrastruktur Anda kami tuliskan ke repositori milik Anda sendiri, dalam stack lain seperti OpenTofu bila Anda lebih suka.',
  },
  guides: {
    badge: 'Panduan',
    title: 'Baca cara kerjanya.',
  },
  providers: {
    title: 'Bekerja dengan',
    items: [
      'AWS',
      'Google Cloud',
      'DigitalOcean',
      'IDCloudHost',
      'Alibaba Cloud',
      'Tencent Cloud',
      'Server Anda sendiri via SSH',
    ],
  },
  closing: {
    title: 'Mulai dari satu server.',
    text: 'Buat akun, hubungkan penyedia cloud, dan jalankan sesuatu sore ini juga.',
  },
};
