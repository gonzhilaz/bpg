---

## BAB 3: PANDUAN PENGGUNA MERCHANT PORTAL & KETERANGAN UI

### 3.1 Pendaftaran Akun & Protokol Reveal Once API Key
1. **Pendaftaran:** Akses rute `/register` pada browser. Masukkan Nama Usaha, Email aktif, dan Password aman (minimal 8 karakter).
2. **Kartu Kredensial (Reveal Once):**
   * Begitu pendaftaran sukses, sistem menampilkan modal dialog khusus yang memuat **API Key** dan **Webhook Secret**.
   * **PENTING:** Kunci mentah (*raw plaintext*) ini hanya ditampilkan **SATU KALI SAJA**. Sistem hanya menyimpan versi *SHA-256 hash* di database.
   * Merchant wajib menekan tombol **Salin Kunci** dan menyimpannya di tempat yang aman (misalnya *password manager* atau berkas `.env` toko online).
3. **Regenerasi Kunci Darurat:** Jika API Key hilang atau bocor, merchant dapat membuka menu **Settings** dan menekan tombol **Regenerate API Key**. Seluruh kunci lama seketika tidak berlaku.

### 3.2 Autentikasi, Multi-Route Sidebar & Navigasi
Portal Merchant dirancang dengan layout modern berbasis Next.js App Router dengan *persistent left sidebar*:
* **Dashboard Overview (`/`):** Menampilkan ringkasan volume bruto, jumlah transaksi sukses, grafik tren 7 hari, dan status konektivitas basis data.
* **Invoices (`/invoices`):** Daftar lengkap tagihan pembayaran pelanggan.
* **Wallets & Gas (`/wallets`):** Pengaturan alamat cold wallet penampung dana per jaringan.
* **Financial Ledger (`/ledger`):** Buku besar pembukuan akuntansi dana masuk dan biaya jaringan.
* **Webhooks (`/webhooks`):** Pengaturan endpoint notifikasi dan log audit pengiriman callback.
* **Sandbox Simulator (`/sandbox`):** Laboratorium simulasi transaksi tanpa biaya.
* **Tombol Logout:** Berada di sudut kiri bawah untuk memutus sesi JWT dan menghapus token dari memori lokal.

### 3.3 Manajemen Tagihan Pelanggan (`/invoices`)
Halaman ini menampilkan tabel seluruh transaksi yang diterbitkan toko:
* **Komponen Filter Dropdown:**
  * **Filter Status:** Menyaring invoice berdasarkan status `ALL`, `PENDING`, `DETECTED`, `PAID`, `UNDERPAID`, `EXPIRED`.
  * **Filter Jaringan:** Menyaring berdasarkan chain (`BSC`, `POLYGON`, `TRON`, `SOLANA`).
* **Fitur Live Search:** Pencarian instan berdasarkan Order ID toko atau Deposit Address.
* **Tindakan Baris:** Menekan baris tagihan akan membuka detail invoice, hash transaksi on-chain di blockchain explorer, dan payload webhook terkait.

### 3.4 Konfigurasi Cold Wallet Payout & Gas Policy (`/wallets`)
Pada menu ini, merchant menentukan ke mana dana USDT/USDC akan diteruskan secara instan:
1. **Pengaturan Alamat Payout:**
   * **EVM Payout Address (BSC & Polygon):** Wajib alamat hex 42 karakter (`0x...`).
   * **TRON Payout Address:** Wajib alamat Base58 diawali huruf `T` (34 karakter).
   * **Solana Payout Address:** Wajib alamat Base58 publik Solana (32-44 karakter).
2. **Kebijakan Pembebanan Biaya Gas (Gas Policy):**
   * **Customer Surcharge:** Biaya gas sweeping ditambahkan ke nominal bayar pembeli. Merchant menerima dana bersih utuh sesuai harga barang.
   * **Merchant Absorbed:** Pembeli membayar tepat sesuai harga barang. Biaya gas penyapuan dipotong dari saldo akhir yang mendarat di dompet merchant.

### 3.5 Pemantauan Laporan Keuangan (Financial Ledger) & Ekspor CSV
Menu `/ledger` mencatat pergerakan akuntansi secara detail:
* **Gross Inflow:** Total nominal yang dibayarkan pelanggan di blockchain.
* **Gas Network Fee:** Biaya riil jaringan yang dikeluarkan Hot Wallet untuk proses sweeping.
* **Platform Fee:** Biaya jasa gateway (jika dikonfigurasi oleh Super Admin).
* **Net Settled:** Nominal bersih yang diterima pada Cold Wallet pribadi merchant.
* **Tombol Export CSV:** Mengunduh seluruh riwayat pembukuan dalam format spreadsheet CSV untuk rekonsiliasi keuangan bulanan.

### 3.6 Log Webhook & Tombol Test Ping / Manual Replay
Menu `/webhooks` memberikan kendali penuh terhadap integrasi callback:
* **Webhook URL:** Masukkan alamat URL backend toko Anda (misal: `https://tokosaya.com/api/payment-callback`).
* **Tombol Test Ping:** Mengirimkan sampel payload dummy bertanda tangan HMAC-SHA256 untuk memverifikasi apakah server toko merchant merespons dengan HTTP status 200 OK.
* **Tabel Log Callback:** Menampilkan riwayat percobaan pengiriman, response code dari server merchant, durasi latensi, serta payload yang dikirim.
* **Tombol Resend / Replay:** Jika server toko merchant sempat mengalami *downtime*, merchant dapat menekan tombol **Replay** untuk mengirim ulang webhook transaksi tersebut.

### 3.7 Manajemen Multi-Toko (Multi-Store per Merchant)
Bagi merchant yang memiliki beberapa cabang bisnis atau unit usaha terpisah:
* Merchant dapat membuat entitas **Store** baru di bawah satu akun organisasi login.
* Setiap toko memiliki nama unik, URL webhook tersendiri, dan alamat Cold Wallet terpisah.
* Beralih antar toko dilakukan melalui *Store Switcher* pada bagian atas sidebar tanpa perlu keluar-masuk akun.
