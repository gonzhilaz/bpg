## BAB 4: PANDUAN PENGUJIAN SANDBOX & JARINGAN TESTNET

### 4.1 Menggunakan Sandbox Simulator Bawaan
13C Gateway dilengkapi lingkungan pengujian mandiri di rute `:3000`:

![Sandbox Simulator](images/05_sandbox_simulator.png)

1. **Pembuatan Tagihan Uji**: Pilih jaringan yang ingin diuji (BSC Testnet, Polygon Amoy, TRON Nile, Solana Devnet), masukkan nominal USD, dan klik **Generate Test Invoice**.
2. **Simulasi Pembayaran 1-Klik**: Klik tombol **Simulate Payment (Sandbox)**. Backend akan menyimulasikan event transfer on-chain masuk secara instan, memicu Server-Sent Events (SSE) di widget, dan mendistribusikan notifikasi Webhook HMAC ke endpoint pengujian Anda.

### 4.2 Pengujian Transaksi On-Chain Menggunakan Faucet Testnet Resmi
Jika Anda ingin menguji transaksi kripto menggunakan dompet fisik (MetaMask, Phantom, TronLink) tanpa risiko modal riil:
* **BSC Testnet**: Ambil token tBNB dan testnet USDT di faucet resmi `https://testnet.binance.org/faucet-smart`.
* **Polygon Amoy**: Ambil testnet POL di `https://faucet.polygon.technology/`.
* **TRON Nile**: Ambil testnet TRX dan TRC-20 USDT di `https://nileex.io/join/getJoinPage`.
* **Solana Devnet**: Dapatkan SOL devnet via terminal: `solana airdrop 1 <ALAMAT_ANDA> --url devnet`.

### 4.3 Simulasi Edge Cases (Underpaid, Overpaid, Expired)
Sistem dilengkapi penanganan skenario khusus:
1. **Kurang Bayar (Underpaid)**: Jika pembeli mentransfer nominal di bawah tagihan namun masih dalam batas `underpaid_tolerance` (misal 1%), sistem tetap menandai pesanan sebagai `PAID`. Jika di luar toleransi, status menjadi `UNDERPAID` dan notifikasi khusus dikirim ke toko.
2. **Lebih Bayar (Overpaid)**: Tagihan ditandai `PAID` dengan sisa saldo lebih dicatat di buku besar internal.
3. **Kedaluwarsa (Expired)**: Tagihan yang tidak dilunasi hingga hitung mundur habis otomatis ditandai `EXPIRED` dan deposit address dinonaktifkan.

---

## BAB 5: PANDUAN DEVOPS & SUPER ADMIN PORTAL

### 5.1 Dashboard Monitoring Operasional Platform
Kunjungi Super Admin Console di rute `:3002` (Login: `admin@13cgateway.internal`):

![Super Admin Overview](images/04_admin_overview.png)

1. **Total Volume Transaksi**: Pantau akumulasi transaksi bruto seluruh merchant secara agregat.
2. **Status Kesehatan Daemon**: Indikator live status Watcher, Sweeper Engine, dan Webhook Dispatcher.
3. **Tabel Merchant Directory Governance**:

![Merchant Directory Governance](images/04_admin_merchants.png)

Admin memiliki kontrol penuh untuk menambah merchant baru, merotasi API key, mengedit penanggung gas, menangguhkan akun pelanggar, dan menghapus data merchant.

### 5.2 Manajemen Cadangan Gas Hot Wallet & Alert Otomatis
Pada rute `/gas`:

![Gas Liquidity & Sweeper Engine](images/04_admin_gas.png)

* Gateway memerlukan sedikit saldo native kripto (BNB, POL, TRX, SOL) di **Master Hot Wallet Platform** untuk membiayai eksekusi transaksi sweeping dari deposit address ke cold storage merchant.
* **Ambang Batas Peringatan (*Low Gas Alert*)**:
  - Saldo BNB < 0.05 BNB $\to$ Indikator Kuning/Merah.
  - Saldo TRX < 50 TRX $\to$ Peringatan penambahan cadangan energi.
  - Saldo POL < 5 POL $\to$ Notifikasi peringatan.

### 5.3 Prosedur Penyapuan Dana Manual (Manual Sweeper)
Jika terjadi kemacetan jaringan blockchain atau transaksi sweeping tertunda:
1. Masuk ke menu **Gas & Liquidity** di Admin Portal.
2. Pada tabel deposit address aktif, klik tombol **Manual Sweep**.
3. Sistem akan memicu konsolidasi token ke cold wallet tujuan secara instan disertai pencatatan TxHash baru.

### 5.4 Pemeliharaan Database (Pool Connection & Pruning Expired Records)
* Pada rute `/database`, klik tombol **Run Prune** untuk membersihkan invoice berstatus `EXPIRED` dan `CANCELLED` yang umurnya melewati batas retensi (30 hari).
* Transaksi berstatus `PAID` dipertahankan permanen demi kepatuhan audit keuangan.
* Operasi berjalan di bawah SQLite WAL mode dengan zero table lock.

### 5.5 Emergency Circuit Breaker (Prosedur Darurat Pembekuan Payout)
* Jika terdeteksi anomali keamanan jaringan atau eksploitasi smart contract di blockchain, Super Admin dapat mengaktifkan **Emergency Circuit Breaker**.
* Seketika, seluruh aktivitas auto-sweeping dan pembuatan invoice baru dibekukan tanpa memutus akses pembacaan dashboard atau verifikasi database.

### 5.6 Deployment Mandiri di Server VPS Menggunakan Docker Compose
Struktur file `docker-compose.yml` siap pakai:
```yaml
version: '3.8'
services:
  gateway-core:
    image: 13c-gateway-core:latest
    restart: always
    environment:
      - APP_ENV=production
      - DB_DRIVER=postgres
      - DATABASE_URL=postgres://user:pass@postgres-db:5432/13c_prod?sslmode=disable
      - MASTER_SECRET_KEY=isi_kunci_acak_32_karakter_di_sini!
      - JWT_SECRET=isi_jwt_secret_rahasia_di_sini!
    ports:
      - "8080:8080"
    depends_on:
      - postgres-db

  postgres-db:
    image: postgres:16-alpine
    restart: always
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=13c_prod
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass_kuat

  merchant-portal:
    image: 13c-dashboard:latest
    restart: always
    ports:
      - "3001:3000"

volumes:
  pgdata:
```

### 5.7 Resolusi Dinamis Endpoint (Zero Hardcoded Localhost & Cloud Ready)
Sistem menggunakan variabel lingkungan terpusat sehingga siap di-deploy ke domain publik apa pun:
* `NEXT_PUBLIC_API_URL`: Mengarah ke domain backend API (contoh: `https://api.perusahaananda.com`).
* `NEXT_PUBLIC_MERCHANT_URL`: Mengarah ke portal merchant (`https://merchant.perusahaananda.com`).
* `NEXT_PUBLIC_ADMIN_URL`: Mengarah ke konsol pengelola (`https://admin.perusahaananda.com`).
