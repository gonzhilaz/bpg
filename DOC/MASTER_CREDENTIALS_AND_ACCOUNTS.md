# Katalog Kredensial Resmi & Akun Bawaan (Master Credentials Manual)

**Proyek**: 13C Crypto Payment Gateway (Self-Hosted Non-Custodial Infrastructure)  
**Lingkungan**: Development, Staging & Test Environments  
**Status**: Terverifikasi Aktif & Siap Digunakan  
**Dokumen Terkait**: [DOC/SECURITY_AND_CREDENTIALS.md](file:///d:/DEVELOPMENT/Projects/Captain/DOC/SECURITY_AND_CREDENTIALS.md) | [DOC/13C_Payment_Gateway_Manual.pdf](file:///d:/DEVELOPMENT/Projects/Captain/DOC/13C_Payment_Gateway_Manual.pdf)

---

## 1. Ringkasan Tingkat Akses (Role Hierarchy)

| Tier / Peran | Entitas Pengguna | Portal Akses | Metode Autentikasi | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Root Admin** | DevOps & Platform Owner | Super Admin Portal (`:3002`) | Master Key + 2FA TOTP | Prune DB, Force Sweep, Approval Withdraw, Telemetri Hot Wallet |
| **Tier 2: Merchant** | Pemilik Toko / Bisnis | Merchant Dashboard (`:3001`) | Email + Password (Bcrypt) + 2FA | API Keys, Webhook Replay, Payment Links, Saldo Escrow |
| **Tier 3: Tester** | QA, Pembeli, Integrator | Sandbox Simulator (`:3000`) | Header API Key / Public SSE | Simulasi Checkout, Payment Simulator, Verifikasi Real-time SSE |

---

## 2. Kredensial Super Admin & DevOps Console (Tier 1)

Portal khusus untuk pengembang dan pemilik platform guna memantau kesehatan server, saldo gas hot wallet, dan persetujuan penarikan dana.

* **URL Lokal**: `http://localhost:3002/login`
* **URL Production Vercel**: `https://bpg-admin.vercel.app/login`
* **Root Admin Email**: `admin@13cgateway.internal`
* **Master Secret Key**:
  * Mode Development: `admin123`
  * Standar Konfigurasi Server: `13c-default-master-secret-key-32bytes!`
* **2FA TOTP Code**: `131313` *(Bypass development aktif; di produksi menggunakan Google Authenticator / YubiKey RFC 6238)*
* **Fitur 1-Klik**: Tombol *"Fill admin123 / 131313"* tersedia langsung di form login untuk mempermudah login instan.
* **Header Otorisasi API (cURL / Backend Script)**:
  ```http
  X-Admin-Key: 13c-default-master-secret-key-32bytes!
  Authorization: Bearer 13c-default-master-secret-key-32bytes!
  ```

---

## 3. Kredensial Merchant Portal Bawaan (Tier 2 - Default Seeded Store)

Akun merchant resmi yang di-*seed* secara otomatis ke basis data SQLite / PostgreSQL saat server pertama kali dinyalakan ([main.go](file:///d:/DEVELOPMENT/Projects/Captain/backend/cmd/server/main.go)).

* **URL Lokal**: `http://localhost:3001/login`
* **URL Production Vercel**: `https://bpg-dashboard-coral.vercel.app/login`
* **Business Email**: `demo@13c.local`
* **Password**: `password123`
* **Fitur 1-Klik**: Tombol *"Fill Demo Credentials"* di halaman login merchant otomatis mengisi email & password ini.
* **Live API Key**: `13c_demo_api_key_12345678`
* **API Key Hash (At-Rest)**: `cf52ef957ec42a8b30db80a2df39efb925b44fa7527181c00fa8e6a0d24bf5f5` *(SHA-256)*
* **Webhook HMAC Secret Key**: `13c_demo_secret_key_87654321`
* **Mode Settlement Default**: `INSTANT_FORWARD` *(Dapat diganti ke `ESCROW` di dashboard)*
* **Alamat Payout Dingin (Cold Wallet Destination)**:
  * **BNB Smart Chain (BEP-20)**: `0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019`
  * **Polygon (ERC-20)**: `0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019`
  * **TRON (TRC-20)**: `TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa`
  * **Solana (SPL)**: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

---

## 4. Kredensial Tester & Sandbox Simulator (Tier 3)

Simulator interaktif untuk pengujian alur pembayaran oleh tim QA, tester, maupun calon klien tanpa menggunakan aset kripto sungguhan.

* **URL Simulator Lokal**: `http://localhost:3000/sandbox`
* **URL Simulator Vercel**: `https://bpg-sandbox.vercel.app/sandbox`
* **Interactive API Swagger Docs**: `http://localhost:8080/swagger`
* **Order ID Pengujian Deterministik**: `ORD-98210` / `ORD-1001`
* **Header Uji API Invoicing**:
  ```http
  POST /api/v1/invoices HTTP/1.1
  Host: localhost:8080
  Content-Type: application/json
  X-API-KEY: 13c_demo_api_key_12345678

  {
    "order_id": "ORD-TEST-001",
    "amount": 25.50,
    "currency": "USD",
    "pay_currency": "USDT",
    "pay_network": "BSC"
  }
  ```
* **Simulasi Transfer On-Chain**: Tersedia tombol *"Simulate On-Chain Payment"* di halaman sandbox yang otomatis memicu SSE broadcast, webhook dispatch, dan rekonsiliasi status menjadi `PAID`.

---

## 5. Prosedur Serah Terima ke Klien (Production Handover Checklist)

Aplikasi beroperasi secara mandiri penuh (*Self-Hosted On-Premise*) tanpa memerlukan kunci lisensi maupun koneksi ke server eksternal vendor. Sebelum sistem diserah-terimakan ke klien akhir untuk digunakan di jaringan Mainnet riil dengan uang asli, lakukan langkah serah terima berikut:

1. **Ganti Master Secret Key di `.env`**:
   Buat string acak 32 karakter baru menggunakan CSPRNG:
   ```powershell
   # Contoh generate random secret di PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```
2. **Ubah `APP_ENV` menjadi `production`**:
   Otomatis mematikan endpoint simulasi sandbox dan mengunci middleware admin dari segala bypass token mock dev.
3. **Konfigurasi Alamat Hot Wallet Riil**:
   Ganti seluruh alamat cold storage (`PayoutAddressBSC`, `PayoutAddressTron`, dll) dengan alamat dompet multi-sig atau hardware wallet (Ledger/Trezor) milik klien.
4. **Aktifkan 2FA Fisik**:
   Minta klien langsung menghubungkan aplikasi Google Authenticator pada akun Super Admin dan akun Merchant.
