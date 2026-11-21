## BAB 2: PANDUAN PENGGUNA MERCHANT PORTAL

### 2.1 Pendaftaran Akun & Protokol Reveal Once API Key
Untuk mendaftarkan akun merchant baru, kunjungi rute `/register`:

![Registrasi Merchant](images/03_merchant_register.png)

1. Masukkan **Nama Toko / Perusahaan**, **Business Email**, dan **Password** (minimal 6 karakter).
2. Klik tombol **Generate API Key & Register**.
3. **PENTING (Protokol Reveal Once)**: Sistem akan menampilkan kartu modal khusus yang memuat **Production API Key** dan **Webhook Secret**.
   * *Kunci ini hanya ditampilkan satu kali demi alasan keamanan tingkat tinggi.*
   * Segera klik tombol salin (*copy*) dan simpan di password manager atau file konfigurasi `.env` server toko Anda.
   * Di dalam database 13C Gateway, API Key disimpan dalam bentuk hash **SHA-256**, sehingga kunci asli tidak dapat dibaca oleh siapa pun jika database diretas.

### 2.2 Autentikasi & Arsitektur Multi-Route Sidebar
Kunjungi halaman login di `/login`:

![Login Merchant](images/02_merchant_login.png)

1. Masukkan email bisnis dan password yang telah didaftarkan.
2. Setelah berhasil masuk, Anda akan diarahkan ke **Merchant Portal** berbasis **Persistent Sidebar** dan **Multi-Route Navigation**:

![Merchant Overview](images/01_merchant_overview.png)

Merchant Portal dipecah menjadi beberapa rute terdedikasi:
* **`/` (Overview & KPI)**: Menampilkan metrik volume kotor, total settled, pesanan aktif, ringkasan saldo gas, dan 5 invoice terbaru.
* **`/invoices` (Invoices & Orders)**: Tabel pencarian tagihan lengkap dengan live filter pencarian, filter jaringan blockchain, dan status order.
* **`/payouts` (Payouts & Settlements)**: Riwayat transfer non-custodial ke cold wallet merchant dilengkapi tautan langsung ke explorer blockchain (BscScan, Tronscan, Polygonscan, Solscan).
* **`/wallets` (Wallets & Gas Policy)**: Konfigurasi alamat cold wallet tujuan settlement, toggle auto-payout, dan pemilih kebijakan penanggung gas (Fee Payer).
* **`/api-keys` (API Credentials)**: Kredensial API Key publik, Secret Key HMAC-SHA256, modal Reveal Once, dan cuplikan kode integrasi cURL / Node.js.
* **`/webhooks` (Webhook Logs)**: Konfigurasi callback URL, log pengiriman notifikasi HTTP POST, inspeksi status code (200 OK), dan tombol Test Ping.
* **`/reports` (Financial Ledger)**: Buku besar akuntansi pembukuan, akumulasi pendapatan bruto, potongan fee gateway (dinamis / %), biaya gas, dan tombol ekspor CSV.

### 2.3 Manajemen Tagihan Pelanggan (`/invoices`)
Pada halaman **Invoices & Orders**:

![Merchant Invoices Table](images/01_merchant_invoices.png)

1. **Pencarian Real-Time**: Masukkan nomor Order ID, Invoice ID, atau Deposit Address pada kolom pencarian untuk melacak transaksi secara instan.
2. **Filter Jaringan & Status Dropdown**: Gunakan dropdown ringkas untuk memfilter berdasarkan rantai blockchain (All Networks, BSC, Polygon, TRON, Solana) dan status (`All Statuses`, `PAID`, `DETECTED`, `PENDING`, `UNDERPAID`).
3. **Tri-State Resilience**: Jika tidak ada data yang cocok, sistem menyajikan *Empty State* informatif lengkap dengan tombol **Reset Filter**.

### 2.4 Konfigurasi Cold Wallet Payout & Gas Policy (`/wallets`)
Pada halaman **Wallets & Gas Policy**:

![Merchant Wallets & Gas Policy](images/01_merchant_wallets.png)

1. Masukkan alamat cold wallet penerima untuk masing-masing jaringan:
   * **TRON Address**: Alamat Base58 berawalan huruf `T` (misal dompet TronLink, Ledger, atau Binance).
   * **BSC Address**: Alamat 0x EVM (Trust Wallet, MetaMask, Safe).
   * **Polygon Address**: Alamat 0x EVM.
   * **Solana Address**: Alamat Base58 Solana (Phantom, Solflare).
2. Pastikan centang toggle **Auto-Payout** aktif agar dana otomatis diteruskan begitu transaksi terdeteksi.
3. **Pengaturan Fee Payer (Customer Surcharge vs. Merchant Absorbed)**:
   * **Opsi Customer (Direkomendasikan)**: Biaya gas jaringan ditambahkan ke total invoice tagihan pembeli. Pembeli membayar produk + gas surcharge, merchant menerima nominal bersih 100%.
   * **Opsi Merchant**: Pembeli membayar nominal pas harga produk, biaya gas penyapuan dipotong dari saldo yang masuk ke cold wallet merchant.
4. **Live Coin & Gas Matrix**: Pantau harga real-time koin native (BNB, POL, TRX, SOL) serta estimasi biaya transaksi sweeping terkini.

### 2.5 Pemantauan Laporan Keuangan (Financial Ledger) & Ekspor CSV
Kartu **Financial Ledger** menyediakan data audit pembukuan yang transparan:
* **Gross Sales**: Total akumulasi volume penjualan kotor.
* **Net Settled**: Total dana bersih yang telah sukses mendarat di Cold Wallet Anda.
* **Fee Gateway (%)**: Akumulasi potongan biaya pemrosesan gateway (dapat dikonfigurasi dinamis oleh Admin).
* **Sweep Gas**: Estimasi biaya gas jaringan yang dikeluarkan untuk sweeping on-chain.
* **Filter Rentang Waktu**: Pilih `7D` (7 hari terakhir), `30D` (30 hari terakhir), atau `ALL` (sepanjang waktu).
* **Ekspor CSV**: Klik tombol **Export CSV** untuk mengunduh laporan pembukuan langsung ke komputer Anda dalam format spreadsheet.

### 2.6 Log Webhook & Tombol Test Ping / Manual Replay
* **Tabel Recent Invoices**: Menampilkan nomor pesanan, nominal kripto, jaringan, deposit address, indikator Fee Payer, dan status terkini (`PENDING`, `DETECTED`, `PAID`, `UNDERPAID`, `EXPIRED`).
* **Tabel Settlement Transfers**: Menampilkan bukti tx hash on-chain dari penyapuan dana ke cold wallet Anda.
* **Kartu Webhook Delivery Logs**: Menampilkan riwayat pengiriman notifikasi HTTP POST ke server toko Anda lengkap dengan kode HTTP respons (200 OK) dan tanda tangan HMAC.
* **Tombol Manual Replay**: Jika endpoint toko sempat offline saat transaksi terjadi, merchant dapat mengklik tombol Replay untuk memicu ulang pengiriman webhook secara instan.

### 2.7 Manajemen Multi-Toko (Multi-Store per Merchant)
Bagi merchant yang memiliki beberapa toko online atau cabang bisnis:
1. **Strategi Prefix Order ID**: Sistem secara otomatis mengisolasi transaksi antar toko menggunakan prefix order unik (contoh: `STORE1-ORD-101`, `STORE2-ORD-202`). Filter pencarian dashboard dapat menyaring data berdasarkan prefix toko secara instan.
2. **Kustomisasi Callback Dinamis per Tagihan**: Setiap request pembuatan invoice dapat menyertakan parameter `callback_url` spesifik untuk toko yang bersangkutan, sehingga notifikasi diarahkan langsung ke domain masing-masing toko.
3. **Multi-Akun Merchant Terisolasi**: Super Admin dapat mendaftarkan beberapa entitas merchant untuk grup bisnis yang sama, memberikan pemisahan API Key, laporan pembukuan, dan dompet cold storage yang terpisah 100%.
