# Captain Crypto Payment Gateway

Sistem payment gateway cryptocurrency non-custodial selevel OxaPay dengan 4 aplikasi terpisah:

```
Captain/
├── backend/        # Core API Go & Background Watchers (BSC, Polygon, TRON, Solana)
├── dashboard/      # Merchant Portal Dashboard (Next.js - Port 3001)
├── demo-sandbox/   # Customer Checkout Widget & Sandbox Simulator (Next.js - Port 3000)
└── swagger/        # OpenAPI 3.0 Interactive Documentation
```

---

## 🚀 4 Aplikasi Terpisah

### 1. `backend/` (Core Payment API & Indexer Daemon)
* **Teknologi**: Golang 1.26 (Clean Architecture, GORM, Decimal Math).
* **Fitur**:
  * Generator alamat unik per invoice (EVM, TRON, Solana) dengan enkripsi AES-256-GCM.
  * Multi-chain Indexers memantau transfer USDT/USDC di blockchain.
  * Auto-Payout Engine (Hot Wallet -> Cold Wallet pribadi merchant).
  * Webhook Dispatcher dengan tanda tangan HMAC-SHA256 & auto-retry.
* **Cara Menjalankan**:
  ```powershell
  cd backend
  go run ./cmd/server
  # Berjalan di http://localhost:8080
  ```

---

### 2. `dashboard/` (Merchant Portal)
* **Teknologi**: Next.js 16 (App Router, Tailwind CSS, Dark Neon Web3).
* **Fitur**:
  * Manajemen API Key & Webhook Secret.
  * Konfigurasi alamat Cold Wallet (BSC, Polygon, TRON, Solana) & Toggle Auto-Payout.
  * Monitoring live invoice status & riwayat settlement auto-payout.
* **Cara Menjalankan**:
  ```powershell
  cd dashboard
  npm run dev
  # Berjalan di http://localhost:3001
  ```

---

### 3. `demo-sandbox/` (Customer Checkout & Simulator)
* **Teknologi**: Next.js 16 (App Router, Tailwind CSS, QRCode.react, Lucide).
* **Fitur**:
  * **Halaman Checkout**: Dynamic SVG QR code, 1-Click Copy Amount & Address, Live Countdown Timer (MM:SS), Web3 1-Click Wallet Pay (MetaMask/Phantom).
  * **Sandbox Simulator (`/sandbox`)**: Form pembuatan invoice uji coba & simulator transfer blockchain instan untuk pengujian end-to-end.
* **Cara Menjalankan**:
  ```powershell
  cd demo-sandbox
  npm run dev
  # Berjalan di http://localhost:3000
  ```

---

### 4. `swagger/` (API Documentation)
* **Spesifikasi**: OpenAPI 3.0 Standard (`openapi.json`).
* **Fitur**: Dark-mode Swagger UI dengan tombol "Try it out" interaktif.
* **Akses**:
  * Langsung via backend: `http://localhost:8080/swagger`
  * Standalone file: `swagger/index.html`
