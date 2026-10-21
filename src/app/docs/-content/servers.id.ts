import type { DocsSection } from '../-rules/content';

const IMAGES = '/docs/servers';

/** Panduan server, dalam Bahasa Indonesia. Ditulis mengikuti produk nyata. */
export const SERVERS_SECTION_ID: DocsSection = {
  slug: 'servers',
  title: 'Server',
  summary:
    'Membuat server di penyedia cloud, melihat isinya, memasang basis data, lalu menghapusnya setelah selesai.',
  pages: [
    {
      slug: 'overview',
      title: 'Apa itu server di sini',
      summary:
        'Satu mesin Linux yang dikelola dPanel untuk Anda, dan dua cara menambahkannya.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Server adalah satu mesin Linux yang dikelola dPanel untuk Anda. Mesin itu bisa dibuat dPanel di akun cloud Anda, atau mesin yang sudah Anda sewa lalu Anda hubungkan sendiri.',
        },
        {
          kind: 'paragraph',
          text: 'Begitu server masuk ke dPanel, semua hal di bawah ini dilakukan dari browser, tanpa terminal di komputer Anda.',
        },
        {
          kind: 'list',
          items: [
            'Melihat kondisinya, serta pemakaian prosesor, memori dan disk.',
            'Memasang perangkat lunak, misalnya basis data atau runtime bahasa pemrograman.',
            'Menjalankan dan menghentikan layanan di dalamnya.',
            'Mengelola akun pengguna Linux.',
            'Menelusuri berkas dan membaca log.',
            'Membuka terminal.',
          ],
        },
        { kind: 'heading', text: 'Dua cara menambah server' },
        {
          kind: 'table',
          head: ['', 'Buat server cloud', 'Hubungkan server sendiri'],
          rows: [
            [
              'Cocok untuk',
              'Anda butuh mesin baru dan punya akun cloud',
              'Mesin Anda sudah berjalan',
            ],
            [
              'Yang dilakukan dPanel',
              'Membuat mesin, lalu menyiapkannya',
              'Terhubung lewat SSH, lalu menyiapkannya',
            ],
            [
              'Yang diperlukan',
              'Cloud project dan SSH key di dPanel',
              'Server Ubuntu atau Debian yang bisa dijangkau',
            ],
            ['Waktu', 'Sekitar 10 sampai 20 menit', 'Sekitar 5 menit'],
          ],
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-choose-path.png`,
          alt: 'Halaman buat server, menawarkan server cloud atau server sendiri',
          caption: 'Servers, lalu Create Server, menawarkan kedua jalur.',
        },
        {
          kind: 'paragraph',
          text: 'Panduan ini mengikuti jalur pertama, dari daftar kosong sampai server basis data yang berjalan, lalu kembali kosong lagi.',
        },
      ],
    },
    {
      slug: 'before-you-start',
      title: 'Sebelum mulai',
      summary:
        'Dua hal yang disiapkan sekali, lalu dipakai ulang untuk server berikutnya.',
      blocks: [
        { kind: 'heading', text: 'SSH key' },
        {
          kind: 'paragraph',
          text: 'SSH key adalah sepasang berkas yang menggantikan kata sandi saat sebuah komputer masuk ke server. Satu bagian bersifat publik dan ditulis ke server; bagian lain bersifat privat dan tidak pernah keluar dari dPanel.',
        },
        {
          kind: 'paragraph',
          text: 'Anda tidak perlu membuatnya manual. Buka Backend, lalu SSH keys, lalu Create SSH key, dan beri nama yang mudah dikenali.',
        },
        {
          kind: 'list',
          items: [
            'Jenis kunci: pilih "For current servers" kecuali ada yang menolaknya. Kunci itu lebih pendek dan cepat, serta diterima semua Linux masa kini. "For older servers" adalah cadangannya, dan menanyakan ukuran kunci.',
            'Bagian privat tidak ditampilkan lagi. dPanel menyimpannya terenkripsi dan memakainya untuk Anda. Halaman kunci menampilkan bagian publik, yang aman disalin, dan fingerprint untuk dibandingkan dengan laporan server.',
          ],
        },
        { kind: 'heading', text: 'Cloud project' },
        {
          kind: 'paragraph',
          text: 'Cloud project adalah sambungan dPanel ke akun Anda di penyedia cloud. Di sana tersimpan kredensial yang memungkinkan dPanel membuat mesin atas nama Anda. Buka Backend, lalu Cloud projects, lalu Add project, dan tempelkan kredensial dari penyedia Anda.',
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Siapa yang membayar mesinnya',
          text: 'Mesin dibuat di dalam akun cloud Anda sendiri, jadi penyedia menagih Anda langsung. dPanel tidak menjual ulang mesin itu.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-step1-provider.png`,
          alt: 'Formulir peluncuran menampilkan cloud project dan SSH key yang siap dipilih',
          caption:
            'Jika keduanya siap, formulir menawarkannya, bukan meminta Anda menyambungkan.',
        },
      ],
    },
    {
      slug: 'create-a-cloud-server',
      title: 'Membuat server cloud',
      summary:
        'Formulir peluncuran, langkah demi langkah, sampai mesin berjalan.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Panduan ini memakai Google Cloud. AWS dan DigitalOcean menanyakan hal yang sama dengan urutan sama; perbedaannya ada di halaman penyedia cloud.',
        },
        {
          kind: 'paragraph',
          text: 'Buka Servers, lalu Create Server, lalu Launch a server. Formulirnya satu halaman dengan tiga langkah bernomor dan panel ringkasan di kanan yang terisi seiring jawaban Anda. Angka di atasnya, misalnya 3/9, menunjukkan jumlah jawaban yang sudah lengkap.',
        },
        { kind: 'heading', text: 'Langkah 1, provider dan project' },
        {
          kind: 'list',
          items: [
            'Provider: tempat mesin akan berjalan.',
            'Cloud project: akun cloud mana yang membayarnya.',
            'SSH key: kunci yang dipakai dPanel untuk menjangkau mesin.',
          ],
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-step1-provider.png`,
          alt: 'Langkah pertama formulir, berisi provider, cloud project dan SSH key',
        },
        { kind: 'heading', text: 'Langkah 2, lokasi' },
        {
          kind: 'list',
          items: [
            'Region adalah wilayah dunia tempat mesin berjalan. Pilih yang dekat dengan penggunanya.',
            'Zone adalah satu pusat data di dalam region itu. Mana pun boleh.',
            'Network diisikan untuk Anda. dPanel membuat jaringan dpanel-network saat pertama meluncurkan di sebuah region lalu memakainya kembali, dengan hanya SSH dan port web yang terbuka.',
          ],
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-step2-location-size.png`,
          alt: 'Langkah kedua formulir, berisi region, zone dan network',
        },
        { kind: 'heading', text: 'Langkah 3, ukuran dan image' },
        {
          kind: 'list',
          items: [
            'Server name adalah nama mesin di dPanel dan di penyedia Anda.',
            'Machine type menentukan besar prosesor dan memorinya. Ukuran kecil cukup untuk mencoba.',
            'Ubuntu release: 24.04 LTS adalah pilihan aman, dan LTS berarti pembaruan keamanan bertahun-tahun.',
            'Disk adalah ukuran penyimpanan dalam gigabyte.',
          ],
        },
        { kind: 'heading', text: 'Meluncurkan' },
        {
          kind: 'paragraph',
          text: 'Jika panel ringkasan menulis Ready to launch, semua jawaban lengkap. Tekan Launch server.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-step3-ready.png`,
          alt: 'Panel ringkasan bertuliskan siap meluncurkan',
        },
        {
          kind: 'image',
          src: `${IMAGES}/create-launched.png`,
          alt: 'Dialog yang menegaskan server sedang dibuat',
          caption: 'Pilih Open server untuk menontonnya menyala.',
        },
        {
          kind: 'paragraph',
          text: 'Spanduk biru bertuliskan dPanel is setting this server up muncul selama proses berjalan. Perkirakan 10 sampai 20 menit: penyedia membuat mesinnya, lalu dPanel memasang agennya, membaca isi mesin dan membuka port yang diperlukan. Saat spanduk hilang dan lencana berubah menjadi Ready, server siap dipakai.',
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: 'Jika penyiapan gagal',
          text: 'Spanduk merah muncul dengan tombol See what happened, yang menampilkan alasan dari penyedia atau dari proses penyiapan. Penyebab yang biasa adalah kuota akun cloud yang kurang dan kredensial yang kedaluwarsa.',
        },
      ],
    },
    {
      slug: 'cloud-providers',
      title: 'Penyedia cloud',
      summary: 'Perbedaan Google Cloud, AWS dan DigitalOcean.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Tiga penyedia dibahas di sini karena ketiganya sudah diuji dari awal sampai akhir. Penyedia lain tetap muncul di formulir dan bekerja dengan cara yang sama, dan akan mendapat bagiannya sendiri setelah melewati pengujian yang sama.',
        },
        {
          kind: 'paragraph',
          text: 'Apa pun pilihannya, formulirnya menanyakan hal yang sama dan server jadinya berperilaku identik: agen yang sama, tab yang sama, modul yang sama.',
        },
        { kind: 'heading', text: 'Google Cloud' },
        {
          kind: 'list',
          items: [
            'Lokasi ditanya dua tahap: region, lalu zone di dalamnya.',
            'Ukuran berupa machine type, misalnya e2-small.',
            'dPanel membuat dpanel-network di region itu saat pertama dipakai dan membuka SSH serta port web.',
            'Pengguna login adalah ubuntu.',
          ],
        },
        { kind: 'heading', text: 'AWS' },
        {
          kind: 'image',
          src: `${IMAGES}/create-provider-aws.png`,
          alt: 'Formulir peluncuran dengan AWS terpilih',
        },
        {
          kind: 'list',
          items: [
            'Lokasi berupa region, dan dPanel memilihkan subnet di dalamnya.',
            'Ukuran berupa instance type, misalnya t3.small.',
            'dPanel membuat jaringan dan security group sendiri saat pertama dipakai, jadi akun baru tidak perlu persiapan selain kredensial.',
            'Pengguna login adalah ubuntu.',
          ],
        },
        { kind: 'heading', text: 'DigitalOcean' },
        {
          kind: 'image',
          src: `${IMAGES}/create-provider-digitalocean.png`,
          alt: 'Formulir peluncuran dengan DigitalOcean terpilih',
        },
        {
          kind: 'list',
          items: [
            'Lokasi cukup satu pilihan: region datacenter.',
            'Ukuran berupa ukuran droplet.',
            'Pengguna login adalah dpanel, satu-satunya perbedaan yang terasa saat membuka terminal.',
          ],
        },
      ],
    },
    {
      slug: 'your-server-page',
      title: 'Halaman server Anda',
      summary: 'Fungsi setiap tab pada sebuah server.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Setiap server punya satu halaman, dan semua tindakan terhadap server itu ada di sana. Bagian kepala menampilkan nama, status siap atau tidak, alamatnya, versi Ubuntu, lokasinya, login yang dipakai dPanel, versi agen dan waktu pembuatannya.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-overview.png`,
          alt: 'Halaman server pada tab Overview',
          caption:
            'Overview: pemakaian langsung dari agen, lalu ringkasan dan detail.',
        },
        { kind: 'heading', text: 'Modules' },
        {
          kind: 'paragraph',
          text: 'Semua yang dipasang dPanel, dengan versi dan kondisinya. Add module membuka katalog.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-modules.png`,
          alt: 'Tab Modules menampilkan modul yang terpasang',
        },
        { kind: 'heading', text: 'Services' },
        {
          kind: 'paragraph',
          text: 'Semua unit systemd yang terlihat oleh agen. Service adalah program yang dijaga Linux tetap berjalan di latar belakang, misalnya basis data atau web server. Start, stop, restart atau reload lewat menu di ujung barisnya.',
        },
        {
          kind: 'paragraph',
          text: 'Kebanyakan server punya lebih dari seratus unit dan banyak yang memang Dead atau Exited, jadi angka Needs attention pada mesin baru itu wajar.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-services.png`,
          alt: 'Tab Services menampilkan unit systemd',
        },
        { kind: 'heading', text: 'Users' },
        {
          kind: 'paragraph',
          text: 'Akun Linux di mesin itu, dengan direktori home dan shell-nya. Sebagian besar entri di server baru milik sistem dan sebaiknya dibiarkan.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-users.png`,
          alt: 'Tab Users menampilkan akun Linux',
        },
        { kind: 'heading', text: 'Network' },
        {
          kind: 'paragraph',
          text: 'Port mana yang terbuka, proses mana yang memakainya, dan dari mana koneksi diizinkan. Halaman inilah yang dicek saat sesuatu tidak bisa dijangkau.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-network.png`,
          alt: 'Tab Network menampilkan port yang terbuka',
        },
        { kind: 'heading', text: 'Files dan Logs' },
        {
          kind: 'paragraph',
          text: 'Files membuka pengelola berkas untuk menelusuri, mengunggah dan melihat berkas teks. Logs menampilkan baris terbaru sebuah berkas log, terurai menjadi waktu, level dan pesan, lengkap dengan penyaring.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-logs.png`,
          alt: 'Tab Logs menampilkan baris log yang terurai',
        },
        { kind: 'heading', text: 'Settings' },
        {
          kind: 'paragraph',
          text: 'Perubahan yang jarang diperlukan, masing-masing menjelaskan dirinya: mengubah detail koneksi, menjalankan ulang penyiapan, memindahkan server ke workspace lain, dan zona berbahaya untuk menghapusnya.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-settings.png`,
          alt: 'Tab Settings berisi koneksi, penyiapan, kepemilikan dan zona berbahaya',
        },
      ],
    },
    {
      slug: 'install-software',
      title: 'Memasang perangkat lunak',
      summary: 'Menambah basis data atau runtime lewat katalog modul.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'dPanel memasang perangkat lunak melalui modul. Modul adalah resep yang sudah diuji: Anda menjawab beberapa pertanyaan, dPanel memasang, mengatur dan menjalankannya di server, lalu mencatat apa yang dipasang.',
        },
        {
          kind: 'paragraph',
          text: 'Buka server, masuk ke Modules, lalu tekan Add module. Katalog mengelompokkan isinya: basis data, runtime bahasa, kontainer, sistem manajemen konten dan infrastruktur.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-module-catalog.png`,
          alt: 'Katalog modul yang dikelompokkan per kategori',
        },
        { kind: 'heading', text: 'Memasang basis data' },
        {
          kind: 'paragraph',
          text: 'Tekan Install pada modul yang diinginkan. Formulirnya menyebutkan apa yang akan dijalankan dan hanya menanyakan hal yang tidak bisa diputuskan sendiri: untuk basis data yaitu versinya, kata sandi akun administrator, dan alamat mana yang boleh didengarkan.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-module-install-form.png`,
          alt: 'Formulir pemasangan MariaDB dengan kolom kata sandi tersamar',
        },
        {
          kind: 'callout',
          tone: 'warning',
          title: 'Tentukan sendiri kata sandinya',
          text: 'Kata sandi administrator wajib diisi dan minimal 8 karakter. Tidak ada nilai bawaan, karena basis data dengan kata sandi bawaan yang dipublikasikan bisa diakses siapa pun yang mengetahuinya. dPanel menyimpannya terenkripsi di server dan tidak menampilkannya lagi, jadi simpan salinan Anda sendiri di tempat aman.',
        },
        {
          kind: 'paragraph',
          text: 'Tekan Install role lalu konfirmasi. Modul muncul sebagai Installing, dan basis data perlu beberapa menit.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-module-installing.png`,
          alt: 'Daftar modul menampilkan MariaDB sedang dipasang',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-module-installed.png`,
          alt: 'Daftar modul menampilkan MariaDB terpasang',
          caption: 'Barisnya berubah menjadi Installed setelah selesai.',
        },
        { kind: 'heading', text: 'Memastikan hasilnya' },
        {
          kind: 'list',
          items: [
            'Tab Modules menampilkannya sebagai Installed beserta versinya.',
            'Tab Overview mencantumkannya di What runs here, sesuai laporan agen.',
            'Tab Services menampilkan layanannya berjalan.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Jika Anda mengelola banyak mesin, server group memasang modul yang sama ke seluruh anggotanya dalam satu operasi dan menampilkan hasilnya per server. Grup ada di Servers, lalu Server groups.',
        },
      ],
    },
    {
      slug: 'connect-over-ssh',
      title: 'Terhubung lewat SSH',
      summary:
        'Terminal di browser, dan menghubungkan dari komputer Anda sendiri.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Sebagian besar waktu Anda tidak memerlukan terminal: tab yang ada sudah mencakup layanan, pengguna, berkas dan log. Saat memang perlu, tekan Open terminal di bagian atas halaman server. dPanel masuk memakai kunci yang disimpannya lalu menurunkan Anda ke shell.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-terminal.png`,
          alt: 'Sesi shell server di dalam browser',
        },
        {
          kind: 'paragraph',
          text: 'Tidak ada yang perlu dipasang di komputer Anda dan Anda tidak memerlukan kunci privatnya. Sesi ini memakai pengguna login yang disiapkan dPanel, yaitu ubuntu di Google Cloud dan AWS, serta dpanel di DigitalOcean.',
        },
        { kind: 'heading', text: 'Dari komputer Anda sendiri' },
        {
          kind: 'paragraph',
          text: 'Bila lebih suka terminal sendiri, hubungkan dengan klien SSH apa pun memakai login yang tertera di kepala halaman server.',
        },
        { kind: 'code', code: 'ssh ubuntu@203.0.113.10' },
        {
          kind: 'paragraph',
          text: 'Agar bisa, kunci publik komputer Anda harus ada di server. Kunci yang dibuat dPanel tetap berada di dalam dPanel, jadi tambahkan kunci Anda ke berkas authorized_keys milik server, lewat tab Files atau terminal browser di atas.',
        },
        {
          kind: 'code',
          code: 'echo "ssh-ed25519 AAAA... anda@contoh.com" >> ~/.ssh/authorized_keys',
        },
        {
          kind: 'paragraph',
          text: 'Ganti contoh itu dengan kunci publik Anda. Di komputer Anda biasanya ada di ~/.ssh/id_ed25519.pub.',
        },
      ],
    },
    {
      slug: 'delete-a-server',
      title: 'Menghapus server',
      summary: 'Berhenti membayar mesin yang sudah tidak dipakai.',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Mesin cloud ditagih penyedia selama mesin itu ada, jadi hapus begitu Anda selesai memakainya. Buka server, masuk ke Settings, lalu lihat zona berbahaya.',
        },
        {
          kind: 'image',
          src: `${IMAGES}/server-delete.png`,
          alt: 'Dialog penghapusan, memuat daftar akibat dan meminta nama server',
          caption:
            'Dialognya menyebutkan apa yang akan terjadi dan meminta Anda mengetik namanya.',
        },
        {
          kind: 'callout',
          tone: 'danger',
          title: 'Tidak bisa dibatalkan',
          text: 'Untuk server yang dibuat dPanel, penghapusan mengeluarkannya dari dPanel dan memusnahkan mesinnya di penyedia cloud beserta seluruh isinya. Untuk server yang Anda hubungkan sendiri, dPanel hanya melupakannya dan mesin Anda tetap berjalan.',
        },
        {
          kind: 'paragraph',
          text: 'Penghapusan ditolak selama masih ada aplikasi atau load balancer yang memakai server itu, jadi hapus dulu yang lain. Barisnya kemudian menampilkan Deleting selama penyedia membongkar mesin, lalu hilang dari daftar.',
        },
        { kind: 'heading', text: 'Memastikan sudah hilang' },
        {
          kind: 'paragraph',
          text: 'Daftar Servers adalah pemeriksaan pertama. Yang kedua adalah konsol penyedia Anda: dPanel melaporkan apa yang disampaikan penyedia, jadi penghapusan yang gagal separuh jalan terlihat di sana.',
        },
      ],
    },
  ],
};
