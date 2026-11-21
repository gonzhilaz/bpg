---

## BAB 2: PERSIAPAN & PRASYARAT PENGUJIAN SISTEM

Sebelum memulai pengujian fungsional dan operasional 13C Crypto Payment Gateway, pastikan lingkungan pengujian telah dipersiapkan sesuai dengan petunjuk teknis berikut.

### 2.1 Prasyarat Lingkungan Perangkat Lunak (Software Prerequisites)
Pastikan komputer atau server pengujian telah terpasang perangkat lunak berikut:
1. **Go (Golang) v1.22 atau lebih baru:** Diperlukan untuk mengompilasi dan menjalankan backend engine (`go version`).
2. **Node.js v18.x atau v20.x (LTS) & npm:** Diperlukan untuk antarmuka Merchant Dashboard dan Demo Sandbox Store (`node -v && npm -v`).
3. **SQLite3:** Basis data bawaan yang tertanam otomatis tanpa konfigurasi server DBMS terpisah.
4. **Web Browser & Dompet Kripto (Non-Custodial Wallet):**
   * **Ekstensi Browser Desktop:** MetaMask (untuk BSC & Polygon), TronLink (untuk TRON), dan Phantom (untuk Solana).
   * **Aplikasi Seluler (Opsional):** Trust Wallet, Bitget Wallet, atau TokenPocket untuk menguji pemindaian QR code pada checkout widget.

### 2.2 Konfigurasi Berkas Lingkungan (.env)
Sistem menggunakan berkas konfigurasi lingkungan di masing-masing modul:

#### A. Konfigurasi Backend (`backend/.env`)
Salin berkas contoh atau buat berkas `.env` di dalam folder `backend/`:
```ini
PORT=8080
DATABASE_URL=data/gateway.db
MASTER_SECRET_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
JWT_SECRET=super-secret-jwt-key-for-local-testing-13c

# Node RPC Jaringan Testnet
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology/
TRON_RPC_URL=https://api.shasta.trongrid.io
SOLANA_RPC_URL=https://api.devnet.solana.com

# Kunci Privat Hot Wallet Pengirim Gas (Penyapuan Otomatis)
EVM_HOT_WALLET_KEY=your_testnet_evm_private_key_without_0x
TRON_HOT_WALLET_KEY=your_testnet_tron_private_key
SOLANA_HOT_WALLET_KEY=your_testnet_solana_private_key_base58
```

#### B. Konfigurasi Merchant Dashboard (`dashboard/.env.local`)
Buat berkas `.env.local` di folder `dashboard/`:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### C. Konfigurasi Demo Sandbox Store (`demo-sandbox/.env.local`)
Buat berkas `.env.local` di folder `demo-sandbox/`:
```ini
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080
```

### 2.3 Persiapan Dompet Kripto & Saldo Faucet Testnet
Untuk melakukan transaksi on-chain nyata di jaringan uji coba (*Testnet*):
* **BSC Testnet:**
  * Tambahkan RPC BSC Testnet ke MetaMask (Chain ID: `97`, Simbol: `tBNB`).
  * Ambil saldo gas gratis di Faucet resmi: `https://testnet.binance.org/faucet-smart`.
* **Polygon Amoy Testnet:**
  * Tambahkan jaringan Polygon Amoy (Chain ID: `80002`, Simbol: `POL`).
  * Ambil saldo gas di Faucet resmi: `https://faucet.polygon.technology/`.
* **TRON Shasta Testnet:**
  * Beralih ke jaringan Shasta pada dompet TronLink.
  * Minta saldo TRX testnet gratis di: `https://www.trongrid.io/shasta`.
* **Solana Devnet:**
  * Ubah pengaturan jaringan dompet Phantom ke **Devnet**.
  * Dapatkan SOL devnet melalui terminal (`solana airdrop 2`) atau situs faucet: `https://faucet.solana.com/`.

### 2.4 Pendanaan Saldo Gas Hot Wallet Platform
* Karena 13C bekerja secara non-custodial dengan penyapuan otomatis (*instant auto-sweep*), alamat dompet Hot Wallet platform wajib diisi saldo koin native secukupnya (misal: 0.02 tBNB, 2 POL, 30 Shasta TRX, 0.2 devnet SOL).
* Saldo ini berfungsi untuk membayar ongkos transaksi (*gas fee*) saat sistem memindahkan USDT dari alamat invoice ke dompet merchant.

### 2.5 Prosedur Menjalankan Layanan Pengujian
Jalankan 3 terminal PowerShell terpisah pada direktori proyek:

```powershell
# Terminal 1: Backend API Engine (Port 8080)
cd backend
go run cmd/server/main.go

# Terminal 2: Merchant Dashboard (Port 3000)
cd dashboard
npm install
npm run dev

# Terminal 3: Demo Sandbox Store (Port 3001)
cd demo-sandbox
npm install
npm run dev -- -p 3001
```

### 2.6 Panduan Pengujian Transaksi End-to-End (E2E Walkthrough)
1. **Buka Merchant Portal:** Akses `http://localhost:3000/register` dan daftarkan akun merchant baru.
2. **Amankan Kredensial:** Simpan `API Key` dan `Webhook Secret` yang ditampilkan dalam modal *Reveal Once*.
3. **Konfigurasi Dompet Penampung:** Buka menu **Wallets**, lalu masukkan alamat Cold Wallet pribadi Anda untuk menerima dana.
4. **Simulasi Transaksi Toko:**
   * Buka Demo Store di `http://localhost:3001`.
   * Pilih barang, klik **Checkout with 13C Crypto**, lalu pilih jaringan pembayaran (contoh: BSC Testnet).
   * Transfer nominal kripto yang tertera ke alamat deposit QR yang muncul di layar.
5. **Verifikasi Otomatis:**
   * Halaman checkout secara real-time beralih status: `PENDING` $\to$ `DETECTED` $\to$ `PAID`.
   * Periksa dompet Cold Wallet Anda: Saldo USDT telah masuk secara instan via Auto-Sweeper.
   * Periksa menu **Webhooks** di dashboard untuk melihat log pengiriman notifikasi sukses bertanda tangan HMAC.
6. **Alternatif Cepat (Mock Simulator):** Jika tidak memiliki saldo testnet on-chain, gunakan menu **Sandbox Simulator** di `http://localhost:3000/sandbox` untuk menguji alur secara instan tanpa menunggu konfirmasi blok blockchain.
