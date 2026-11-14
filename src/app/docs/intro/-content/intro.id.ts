import type { DocsIntroCopy } from '../-rules/intro';

export const DOCS_INTRO_ID: DocsIntroCopy = {
  hero: {
    badge: 'Pengenalan',
    title: 'Online-kan situs atau aplikasi Anda, di server milik Anda sendiri.',
    subtitle:
      'dPanel menyiapkan server untuk Anda, memasang apa yang dibutuhkan aplikasi Anda, men-deploy-nya dari GitHub, dan memberinya domain dengan HTTPS. Tidak perlu jadi ahli server, dan tidak ada yang disembunyikan dari para ahli: semua yang dilakukannya dituliskan sebagai Ansible yang tetap menjadi milik Anda.',
    primaryCta: 'Buat akun Anda',
    secondaryCta: 'Tonton dPanel di YouTube',
  },
  problems: {
    badge: 'Kenapa dPanel',
    title: 'Masalah yang diambil alih dari Anda.',
    problemLabel: 'Masalahnya',
    answerLabel: 'Dengan dPanel',
    items: [
      {
        key: 'owner',
        who: 'Anda menjalankan bisnis, toko, atau blog',
        problem:
          'Anda butuh situs yang online, cepat, dan aman, tetapi membayar orang untuk mengurus server itu mahal, dan panel hosting mengunci Anda.',
        answer:
          'Pilih server, pilih situs Anda, tambahkan domain. dPanel memasang semuanya, menyalakan HTTPS, dan mencatat setiap perubahan, dari aplikasi web atau dengan bertanya ke asisten bawaannya.',
      },
      {
        key: 'developer',
        who: 'Anda membangun aplikasi',
        problem:
          'Anda ingin push kode lalu melihatnya langsung aktif, tanpa menulis skrip deploy, unit systemd, dan konfigurasi web server sendiri.',
        answer:
          'Hubungkan repositori GitHub. dPanel mem-build setiap commit di server Anda, menyimpan setiap rilis agar bisa di-rollback, dan menampilkan log build serta log aplikasi secara langsung.',
      },
      {
        key: 'operator',
        who: 'Anda mengurus server',
        problem:
          'Mesin tersebar di beberapa cloud, dipasang manual, dan tidak ada yang yakin apa yang berubah dan kapan.',
        answer:
          'Satu daftar untuk semua server, di mana pun berjalan. Basis data, runtime, dan web server terpasang dengan cara yang sama setiap kali, setiap job tercatat lengkap dengan siapa yang menjalankan dan apa yang gagal, dan hasilnya Ansible biasa.',
      },
      {
        key: 'team',
        who: 'Anda bekerja dalam tim',
        problem:
          'Kata sandi yang dibagi-bagi, hanya satu orang yang paham cara kerja production, dan tidak ada cara aman memberi akses ke skrip.',
        answer:
          'Ruang kerja bersama dengan peran, sehingga semua orang melihat server dan perubahan yang sama. Service account memberi otomasi token sendiri, dan akses berakhir saat itu juga ketika seseorang keluar.',
      },
    ],
  },
  howItWorks: {
    badge: 'Cara kerja',
    title: 'Tiga bagian, dan kode Anda tidak pernah meninggalkan server Anda.',
    lead: 'Anda memberi tahu dPanel apa yang Anda mau. dPanel merencanakan pekerjaannya dan menyimpan catatannya. Program kecil di server Anda, agen dPanel, mengerjakannya di sana.',
    you: {
      title: 'Anda',
      items: ['Aplikasi web', 'Command line dnocs', 'Asisten Ask dPanel'],
    },
    dpanel: {
      title: 'dPanel',
      items: [
        'Merencanakan setiap job',
        'Menyimpan pengaturan dan riwayat',
        'Menyegel rahasia Anda',
        'Menampilkan log dan pemakaian',
      ],
    },
    servers: {
      title: 'Server Anda',
      items: [
        'Agen dPanel',
        'Aplikasi dan build Anda',
        'Basis data dan berkas',
        'Web server dengan HTTPS',
      ],
    },
    youToDpanel: 'HTTPS',
    serversToDpanel: 'Agen yang menghubungi keluar',
    outside: {
      title: 'Di sekitarnya',
      items: [
        {
          name: 'Cloud Anda',
          role: 'dPanel membuat dan menghapus VM dengan kunci Anda',
        },
        {
          name: 'GitHub',
          role: 'server Anda menarik kode Anda, hanya-baca',
        },
        {
          name: 'DNS Anda',
          role: 'dPanel menambahkan record untuk domain Anda',
        },
        {
          name: 'Pengunjung',
          role: 'langsung menjangkau server Anda, lewat HTTPS',
        },
      ],
    },
    steps: [
      {
        title: 'Anda meminta',
        text: 'Di aplikasi web, command line dnocs, atau asisten chat, Anda meminta sesuatu: server baru, basis data, deploy, atau domain.',
      },
      {
        title: 'dPanel merencanakan',
        text: 'dPanel memeriksa apakah Anda berhak, mengubah permintaan menjadi job, lalu mencatatnya. Kata sandi dan kunci di dalam job disegel.',
      },
      {
        title: 'Server Anda yang mengerjakan',
        text: 'Agen dPanel di server Anda mengambil job lewat koneksi yang ia buka sendiri, jadi server Anda tidak perlu membuka port untuk dPanel. Pemasangan, build, dan deploy terjadi di sana.',
      },
      {
        title: 'Pengunjung menjangkau server Anda',
        text: 'Situs Anda disajikan dari server Anda sendiri, di belakang load balancer dengan sertifikat HTTPS gratis. dPanel tidak berada di jalur pengunjung Anda.',
      },
    ],
  },
  homelab: {
    badge: 'Homelab',
    title: 'Homelab Anda, dikelola seperti data center.',
    text: 'PC di bawah meja, mini PC, NAS, atau Raspberry Pi bisa menjadi server dPanel juga. Jalankan satu perintah dan mesin itu bergabung, bahkan di balik router rumah. Lalu jalankan proyek Anda, belajar Linux dan Kubernetes, atau bagikan mesinnya ke teman dan rekan tim.',
    points: [
      'Tidak perlu IP publik, port forwarding, atau SSH: agen yang menghubungi keluar.',
      'Mesin Intel/AMD dan ARM, termasuk Raspberry Pi, dengan Ubuntu atau Debian.',
      'Bagikan di ruang kerja tim, setiap anggota dengan perannya sendiri.',
      'Tidak punya mesin cadangan? Coba dulu di kontainer Docker atau Podman.',
    ],
    cta: 'Siapkan homelab tim',
    href: '/docs/tutorials/team-homelab',
    secondaryCta: 'Hubungkan satu mesin',
    secondaryHref: '/docs/servers/register-a-private-machine',
  },
  start: {
    badge: 'Mulai',
    title: 'Dari akun kosong sampai aplikasi berjalan.',
    steps: [
      {
        title: 'Bawa server Anda, atau biarkan dPanel membuatnya',
        text: 'Buat VM di AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio, Alibaba Cloud, atau Tencent Cloud, atau hubungkan mesin yang sudah Anda jalankan dengan satu perintah pemasangan. IP publik tidak wajib.',
      },
      {
        title: 'dPanel menyiapkan servernya',
        text: 'Agen dPanel bergabung dalam beberapa menit. Lalu tambahkan apa yang dibutuhkan aplikasi Anda, seperti PHP, Node.js, MariaDB, atau Redis, masing-masing dengan satu klik.',
      },
      {
        title: 'Deploy aplikasi Anda',
        text: 'Pilih repositori GitHub Anda. dPanel mem-build rilisnya di server Anda, menjalankannya sebagai layanan, dan menyimpan setiap rilis. Atau minta Ask dPanel menyiapkannya bersama Anda.',
      },
      {
        title: 'Beri domain',
        text: 'Pasang load balancer di depannya, pilih domain, dan dPanel membuat record DNS serta sertifikat HTTPS-nya.',
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
        text: 'Buat VM di tujuh cloud atau hubungkan milik Anda sendiri, di data center maupun di rumah, dan pantau CPU, memori, serta disk.',
      },
      {
        key: 'applications',
        title: 'Aplikasi',
        text: 'Deploy dari GitHub, pantau setiap build tahap demi tahap, rollback ke rilis mana pun, dan rahasia tetap tersamarkan.',
      },
      {
        key: 'traffic',
        title: 'Domain dan HTTPS',
        text: 'Load balancer dengan Caddy, HAProxy, atau APISIX, record DNS di Cloudflare atau DigitalOcean, dan sertifikat gratis.',
      },
      {
        key: 'data',
        title: 'Basis data dan runtime',
        text: 'MariaDB, PostgreSQL, MongoDB, dan Redis pada rilis pilihan Anda, serta PHP, Node.js, Python, Go, Ruby, dan lainnya, tanpa shell.',
      },
      {
        key: 'assistant',
        title: 'Asisten dan CLI',
        text: 'Ask dPanel menyiapkan perubahan untuk Anda setujui, dan command line dnocs bisa melakukan semua yang dilakukan aplikasi web.',
      },
      {
        key: 'logs',
        title: 'Log dan aktivitas',
        text: 'Log server, build, dan aplikasi di satu tempat, dan setiap job tercatat: siapa yang menjalankan, berapa lama, dan langkah mana yang gagal.',
      },
      {
        key: 'clusters',
        title: 'Kubernetes',
        text: 'Jadikan server Anda klaster k3s atau RKE2, dengan pemeriksaan konektivitas sebelum apa pun dipasang.',
      },
      {
        key: 'teams',
        title: 'Tim',
        text: 'Ruang kerja pribadi dan tim, peran untuk setiap anggota, service account untuk otomasi, dan worker sendiri bila Anda butuh.',
      },
    ],
  },
  data: {
    badge: 'Data Anda',
    title: 'Apa yang tetap di server Anda, dan apa yang disimpan dPanel.',
    lead: 'Singkatnya: kode, basis data, dan berkas Anda tetap di server Anda. dPanel menyimpan apa yang dibutuhkan untuk mengelolanya, dan menyegel setiap rahasia.',
    columns: [
      {
        key: 'server',
        title: 'Tetap di server Anda',
        summary: 'Hal-hal yang membuat situs Anda milik Anda.',
        items: [
          'Kode sumber dan setiap build, ditarik langsung dari GitHub',
          'Basis data Anda beserta isinya',
          'Berkas unggahan, plugin, dan tema',
          'Variabel environment aplikasi, di berkas yang hanya bisa dibaca sistem',
        ],
      },
      {
        key: 'dpanel',
        title: 'Disimpan dPanel',
        summary: 'Apa yang dibutuhkannya untuk mengelola semuanya.',
        items: [
          'Akun Anda: email dan nama pengguna',
          'Pengaturan ruang kerja, detail server dan aplikasi, serta riwayat setiap job',
          'Variabel aplikasi dan token masuk, disegel dengan AES-256-GCM memakai kunci yang disimpan di luar kode, dan ditampilkan tersamarkan',
          'Kunci cloud dan penyedia DNS, terenkripsi dan tidak pernah ditampilkan lagi',
          'Log server dan aplikasi selama 3 hari, dengan kata sandi dan token disamarkan sebelum meninggalkan server Anda',
        ],
      },
      {
        key: 'outside',
        title: 'Dibagikan ke layanan pilihan Anda',
        summary: 'Hanya untuk menjalankan apa yang Anda minta.',
        items: [
          'Penyedia cloud Anda, untuk membuat dan menghapus VM',
          'GitHub, untuk membaca repositori yang Anda deploy',
          'Penyedia DNS Anda, untuk menambahkan record domain Anda',
          'Layanan model AI, untuk pesan Ask dPanel, tidak pernah rahasia Anda',
          'Let’s Encrypt, untuk menerbitkan sertifikat HTTPS',
        ],
      },
    ],
    control: {
      title: 'Anda tetap memegang kendali',
      items: [
        'Agen hanya menghubungi keluar, jadi server Anda tidak perlu membuka port untuk dPanel.',
        'Menampilkan rahasia hanya bisa dilakukan orang yang boleh mengubah aplikasi, dan tercatat.',
        'Salinan kerja sebuah job, beserta kata sandinya, dihapus 7 hari setelah job selesai.',
        'Cabut kunci cloud atau keluarkan anggota kapan saja; aksesnya berakhir saat itu juga.',
        'Jalankan job di worker Anda sendiri, bukan di worker dPanel.',
      ],
    },
    more: 'Baca detailnya di Keamanan dan data Anda',
    moreHref: '/docs/getting-started/security-and-your-data',
  },
  ownership: {
    badge: 'Tanpa kunci vendor',
    title: 'Bagian yang baru terasa enam bulan lagi.',
    lead: 'Kebanyakan panel menjadikan infrastruktur Anda milik mereka. dPanel menuliskannya untuk Anda.',
    body: 'Setiap server yang disiapkannya, dan setiap perubahan yang dilakukannya, ditulis sebagai Ansible, alat otomasi open source. Itu bukan sekadar catatan, melainkan sumbernya: jalankan lagi dan Anda mendapat mesin yang sama. Server Anda tetap mesin Ubuntu atau Debian biasa dengan layanan systemd, jadi Anda bisa terus menjalankannya tanpa dPanel. Minta saja, dan infrastruktur Anda kami tuliskan ke repositori milik Anda sendiri.',
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
      'Biznet Gio',
      'Alibaba Cloud',
      'Tencent Cloud',
      'Server Anda sendiri',
    ],
  },
  closing: {
    title: 'Mulai dari satu server.',
    text: 'Buat akun, tambahkan server, dan jalankan sesuatu sore ini juga.',
  },
};
