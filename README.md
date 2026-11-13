# 13C Crypto Payment Gateway

Sistem payment gateway cryptocurrency non-custodial selevel OxaPay dengan arsitektur modular multi-aplikasi:

```
13C-Gateway/
├── backend/        # Core API Go & Background Watchers (BSC, Polygon, TRON, Solana) [Port 8080]
├── dashboard/      # Merchant Portal Dashboard (Next.js - Port 3001) [Live & Sandbox Toggle]
├── admin/          # Super Admin & Dev Operations Dashboard (Next.js - Port 3002)
├── demo-sandbox/   # Customer Checkout Widget & Sandbox Simulator (Next.js - Port 3000)
└── swagger/        # OpenAPI 3.0 Interactive Documentation (/swagger)
```

---

## 🚀 Panduan Ekosistem Aplikasi

### 1. `backend/` (Core Payment API & Indexer Daemon)
* **Teknologi**: Golang 1.26 (Clean Architecture, GORM, Decimal Math).
* **Port**: `http://localhost:8080`
* **Fitur**:
  * Generator alamat unik per invoice (EVM, TRON, Solana) dengan enkripsi AES-256-GCM.
  * Multi-chain Indexers memantau transfer USDT/USDC di blockchain.
  * Auto-Payout Engine (Hot Wallet -> Cold Wallet pribadi merchant).
  * Webhook Dispatcher dengan tanda tangan HMAC-SHA256 & auto-retry.
* **Cara Menjalankan**:
  ```powershell
  cd backend
  go run ./cmd/server
  ```

---

### 2. `dashboard/` (Merchant Portal)
* **Teknologi**: Next.js 16 (App Router, Tailwind CSS, Dark Neon Web3).
* **Port**: `http://localhost:3001`
* **Fitur**:
  * **Environment Toggle**: Beralih instan antara mode **`Live`** 🟢 (transaksi crypto riil) dan mode **`Sandbox`** 🟡 (pengujian aman).
  * **API Credentials**: Public API Key & Webhook Secret generator.
  * **Payout Wallets**: Pengaturan alamat Cold Wallet tujuan (TRON, BSC, Polygon, Solana) & toggle *Auto-Payout*.
  * **Log Monitoring**: Tabel riwayat invoice, settlement auto-payout, dan log webhook HMAC-SHA256.
* **Cara Menjalankan**:
  ```powershell
  cd dashboard
  npm run dev
  ```

---

### 3. `admin/` (Super Admin & Dev Operations)
* **Teknologi**: Next.js 16 (App Router, Tailwind CSS, Lucide React).
* **Port**: `http://localhost:3002`
* **Fitur**:
  * **Hot Wallet Gas Monitor**: Pantau cadangan saldo gas native (TRX + Energy Pool, BNB, POL, SOL) dengan alert otomatis jika saldo menipis (*Low Gas Alert*).
  * **Indexer Health**: Pantau block height, status aktif, dan latensi 4 node watcher (BSC, Polygon, TRON, Solana).
  * **Platform Metrics**: Total volume transaksi gateway & akumulasi keuntungan platform fee (0.4%).
  * **Merchant Administration**: Manajemen status merchant (Active / Suspend).
  * **Emergency Circuit Breaker**: Tombol darurat untuk membekukan payout otomatis sementara jika terjadi anomali blockchain.
* **Cara Menjalankan**:
  ```powershell
  cd admin
  npm run dev
  ```

---

### 4. `demo-sandbox/` (Customer Checkout & Simulator)
* **Teknologi**: Next.js 16 (App Router, QRCode.react, Lucide).
* **Port**: `http://localhost:3000`
* **Fitur**:
  * **Halaman Checkout (`/checkout/[id]`)**: Dynamic SVG QR code, 1-Click Copy, Countdown Timer (MM:SS), Web3 1-Click Pay (MetaMask/Phantom).
  * **Sandbox Simulator (`/sandbox`)**: Pengujian instan pembuatan tagihan dan tombol simulasi transfer on-chain untuk memicu pelunasan & webhook tanpa modal crypto sungguhan.
* **Cara Menjalankan**:
  ```powershell
  cd demo-sandbox
  npm run dev
  ```

---

### 5. `swagger/` (API Documentation)
* **Spesifikasi**: OpenAPI 3.0 Standard (`openapi.json`).
* **Akses Langsung**: `http://localhost:8080/swagger`

---

## 🌐 Live Vercel Production Deployments

Seluruh modul frontend telah terdeploy secara resmi di Vercel:

| Aplikasi | Lingkup / Role | URL Produksi Vercel | Status |
| :--- | :--- | :--- | :--- |
| **Merchant Dashboard** | Portal Merchant (Live & Sandbox) | [bpg-dashboard-coral.vercel.app](https://bpg-dashboard-coral.vercel.app) | 🟢 Live (200 OK) |
| **Super Admin Portal** | Dev Ops, Gas Watcher & Circuit Breaker | [bpg-admin.vercel.app](https://bpg-admin.vercel.app) | 🟢 Live (200 OK) |
| **Customer Checkout & Sandbox** | Checkout Widget & Simulator | [bpg-sandbox.vercel.app](https://bpg-sandbox.vercel.app) | 🟢 Live (200 OK) |

---

## 🐳 Panduan Deployment VPS (Backend Go & PostgreSQL)

Untuk menjalankan Backend Go daemon & indexer blockchain di server VPS:

```bash
# 1. Clone repository di VPS
git clone https://github.com/gonzhilaz/bpg.git
cd bpg

# 2. Jalankan Backend & PostgreSQL dengan Docker Compose
docker compose up -d

# 3. Verifikasi log container
docker compose logs -f backend
```
