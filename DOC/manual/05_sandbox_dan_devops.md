---

## BAB 5: PENGUJIAN TRANSAKSI DI LINGKUNGAN SANDBOX & EDGE CASES

### 5.1 Menggunakan Sandbox Simulator Bawaan
Untuk memfasilitasi pengujian cepat oleh tim pengembang toko tanpa harus menunggu konfirmasi blok blockchain atau mengeluarkan koin gas nyata:
1. Akses menu **Sandbox Simulator** (`/sandbox`) pada Merchant Portal.
2. Masukkan parameter tagihan (Order ID, Nominal, dan Jaringan yang diinginkan).
3. Klik tombol **Buat Tagihan Uji Coba**.
4. Sistem akan menampilkan tombol simulasi interaktif:
   * **Simulate Full Payment (100%):** Memalsukan deposit saldo penuh, memicu watcher, sweeper, dan pengiriman webhook sukses `INVOICE_PAID`.
   * **Simulate Underpayment (Kurang Bayar):** Menyetor nominal di bawah tagihan (misal $8 dari tagihan $10) untuk menguji respon toko terhadap event `INVOICE_UNDERPAID`.
   * **Simulate Expiry (Kedaluwarsa):** Mempercepat waktu invoice hingga kedaluwarsa untuk menguji event `INVOICE_EXPIRED`.

### 5.2 Pengujian Transaksi On-Chain Nyata (Testnet Faucets)
Jika ingin menguji aliran blockchain sesungguhnya dari dompet non-custodial:
1. Pastikan Anda memiliki saldo testnet (tBNB di BSC Testnet, POL di Polygon Amoy, Shasta TRX di TRON, atau devnet SOL di Solana).
2. Buat invoice melalui Demo Store (`http://localhost:3001`) atau via REST API.
3. Buka dompet MetaMask / TronLink / Phantom Anda, lalu kirimkan token USDT testnet ke alamat deposit ephemeral yang tertera pada invoice.
4. Perhatikan terminal backend:
   * Dalam hitungan detik, Watcher mencatat log: `[WATCHER] Detected deposit of X USDT on chain Y`.
   * Setelah konfirmasi kedalaman blok terpenuhi, status berubah menjadi `PAID`.
   * Auto-sweeper langsung mengeksekusi transfer dari alamat deposit ke dompet Payout merchant Anda.

---

## BAB 6: OPERASIONAL DEVOPS & KONSOL SUPER ADMIN

### 6.1 Dashboard Monitoring Operasional Platform
Konsol Super Admin (`/admin`) menyediakan visibilitas menyeluruh terhadap kesehatan platform:
* **Total Volume & Transaksi:** Agregasi volume kumulatif dari seluruh merchant.
* **Cadangan Gas Platform:** Indikator visual saldo native Hot Wallet (BNB, POL, TRX, SOL) secara real-time.
* **Status Worker Background:** Indikator kondisi aktif daemon Watcher, Sweeper, dan Webhook Dispatcher.

### 6.2 Manajemen Cadangan Gas Hot Wallet & Alert Otomatis
Platform memerlukan koin native pada dompet Hot Wallet penampung untuk mendanai gas fee saat melakukan sweeping USDT/USDC ke Cold Wallet merchant:
* **Ambang Batas Peringatan (Low Gas Alert):** Jika saldo koin native berada di bawah ambang batas aman (misal < 0.01 BNB, < 1 POL, < 20 TRX, < 0.05 SOL), sistem memicu indikator peringatan berwarna merah pada dashboard.
* **Prosedur Top-Up:** Super Admin cukup mentransfer koin native tambahan ke alamat Hot Wallet yang tertera di kartu status admin.

### 6.3 Prosedur Penyapuan Dana Manual (Manual Sweeper)
Jika terjadi kondisi darurat di mana transaksi on-chain tertahan (misalnya karena lonjakan gas fee mendadak di jaringan blockchain):
1. Masuk ke halaman **Admin -> Sweeper Operations**.
2. Cari invoice yang berstatus `PAID_UNSWEPT`.
3. Klik tombol **Trigger Sweep Now**.
4. Sistem akan mencoba kembali proses penandatanganan dan broadcast transaksi sweeping dengan batas gas yang disesuaikan.

### 6.4 Pemeliharaan Basis Data & Pruning Otomatis
* **Connection Pooling:** SQLite dikonfigurasi dengan mode WAL (*Write-Ahead Logging*) dan `max_open_conns=1` untuk penulisan serta pembacaan konkurensi tanpa hambatan.
* **Automated Log Pruner:** Background worker secara berkala menghapus riwayat log webhook sukses yang berumur lebih dari 30 hari untuk menjaga ukuran database tetap ringan dan cepat.

### 6.5 Emergency Circuit Breaker (Saklar Darurat)
Jika terdeteksi keganjilan keamanan pada node RPC atau jaringan blockchain:
1. Buka **Admin -> System Controls**.
2. Geser saklar **Emergency Circuit Breaker** ke posisi `ACTIVE`.
3. Seluruh pembuatan invoice baru dan proses auto-sweeping seketika dihentikan sementara, melindungi aset sistem hingga kondisi kembali normal.

### 6.6 Deployment Mandiri Menggunakan Docker Compose
Sistem dapat dideploy di VPS Linux (Ubuntu/Debian) mana pun dengan mudah menggunakan berkas `docker-compose.yml`:
```yaml
version: '3.8'
services:
  gateway-backend:
    build: ./backend
    restart: always
    ports:
      - "8080:8080"
    env_file: ./backend/.env
    volumes:
      - ./data:/app/data

  merchant-dashboard:
    build: ./dashboard
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8080
```
Cukup jalankan satu perintah: `docker compose up -d` untuk menjalankan seluruh ekosistem.
