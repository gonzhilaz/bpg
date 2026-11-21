# Panduan Operasional & Dokumentasi Resmi 13C Crypto Payment Gateway

**Versi**: 2.2.0 (Enterprise Edition)  
**Tanggal**: November 2026  
**Klasifikasi**: User Manual, Technical Specification & Integration Guide  
**Repositori**: [https://github.com/gonzhilaz/bpg.git](https://github.com/gonzhilaz/bpg.git)

---

## DAFTAR ISI LENGKAP

1. **Bab 1: Gambaran Umum & Spesifikasi Arsitektur Non-Custodial**
   * 1.1 Prinsip Non-Custodial & Kedaulatan Dana
   * 1.2 Multi-Chain Network Matrix (BSC, Polygon, TRON, Solana)
   * 1.3 Siklus Tagihan 1 Invoice = 1 Dedicated Ephemeral Address
   * 1.4 Protokol Keamanan & API Key Hashing At-Rest

2. **Bab 2: Panduan Pengguna Merchant Portal & Keterangan UI**
   * 2.1 Pendaftaran Akun & Protokol *Reveal Once* API Key
   * 2.2 Autentikasi, Multi-Route Sidebar & Navigasi
   * 2.3 Manajemen Tagihan Pelanggan (`/invoices`) & Filter Dropdown
   * 2.4 Konfigurasi Cold Wallet Payout & Gas Policy (`/wallets`)
   * 2.5 Pemantauan Laporan Keuangan (Financial Ledger) & Ekspor CSV
   * 2.6 Log Webhook & Tombol Test Ping / Manual Replay
   * 2.7 Manajemen Multi-Toko (*Multi-Store per Merchant*)

3. **Bab 3: Tutorial Integrasi Toko Online (Merchant Integration)**
   * 3.1 Pembuatan Tagihan via REST API (cURL, Node.js, PHP, Python)
   * 3.2 Menampilkan Checkout Widget ke Pelanggan
   * 3.3 Penanganan & Validasi Tanda Tangan Kriptografis Webhook (HMAC-SHA256)
   * 3.4 Plugin Resmi WooCommerce WordPress (`plugins/woocommerce-13c-gateway`)

4. **Bab 4: Panduan Pengujian Sandbox & Jaringan Testnet**
   * 4.1 Menggunakan Sandbox Simulator Bawaan
   * 4.2 Pengujian Transaksi On-Chain Menggunakan Faucet Testnet Resmi
   * 4.3 Simulasi Edge Cases (Underpaid, Overpaid, Expired)

5. **Bab 5: Panduan DevOps & Super Admin Portal**
   * 5.1 Dashboard Monitoring Operasional Platform
   * 5.2 Manajemen Cadangan Gas Hot Wallet & Alert Otomatis
   * 5.3 Prosedur Penyapuan Dana Manual (*Manual Sweeper*)
   * 5.4 Pemeliharaan Database (Pool Connection & Pruning Expired Records)
   * 5.5 Emergency Circuit Breaker (Prosedur Darurat Pembekuan Payout)
   * 5.6 Deployment Mandiri di Server VPS Menggunakan Docker Compose
   * 5.7 Resolusi Dinamis Endpoint (Zero Hardcoded Localhost & Cloud Ready)

6. **Bab 6: Manajemen Dinamis RPC, Keamanan 2FA & Next.js BFF Proxy**
   * 6.1 Manajemen Dinamis Multi-Chain RPC Node
   * 6.2 Autentikasi Ganda (2FA) Super Admin & Merchant Guard
   * 6.3 Enkoding & Proteksi Link API via Next.js BFF Reverse Proxy
   * 6.4 Tata Kelola Merchant Lengkap (Full CRUD Governance & Action Buttons)

7. **Bab 7: Sistem Escrow, Buku Besar Saldo Internal & Workflow Withdrawal**
   * 7.1 Arsitektur Hybrid: Non-Custodial Instant Forward vs. Escrow Balance
   * 7.2 Permintaan Penarikan Dana (*Merchant Withdrawal*)
   * 7.3 Tata Kelola Persetujuan Super Admin (*Approve & Broadcast vs. Reject & Refund*)

8. **Bab 8: Model Kepemilikan Mandiri (White-Label Sovereignty & Jual Putus)**
   * 8.1 Jaminan Nol Telemetri (*Zero-Phone-Home Guarantee*)
   * 8.2 Kedaulatan Master Secret & Kunci Privat (*Self-Sovereignty*)
   * 8.3 Kemudahan White-Labeling & Rebranding

9. **Bab 9: Fitur Tingkat Tinggi & Optimisasi Industri**
   * 9.1 Real-Time Server-Sent Events (SSE) pada Checkout Widget
   * 9.2 Efisiensi Gas Biaya Sweeping via TRON Energy Rental
   * 9.3 Indeks Komposit Database & Automated Pruner Worker

10. **Bab 10: Integrasi Hybrid dengan Payment Gateway Fiat (Studi Kasus Kaguh.id)**
    * 10.1 Arsitektur Unified Gateway: Fiat + Crypto Channel
    * 10.2 Pemetaan Produk (`product_code`) pada `POST /v2/transactions`
    * 10.3 Konversi Kurs Otomatis (IDR $\leftrightarrow$ USDT) via Rate Service
    * 10.4 Webhook Bridge Callback (13C Engine $\to$ Kaguh API $\to$ Toko Merchant)
    * 10.5 Tampilan Terpadu di Kaguh Business Portal (`business.kaguh.id`)

11. **Bab 11: Panduan Pemecahan Masalah Komprehensif (Troubleshooting & FAQs)**
    * 11.1 Transaksi Kurang Bayar (*Underpaid Invoice*) & Ambang Batas Toleransi
    * 11.2 Tagihan Kedaluwarsa (*Expired Invoice*) Saat Dana Baru Dikirim
    * 11.3 RPC Node Timeout / Rate Limit (HTTP 429) & Failover Otomatis
    * 11.4 Kegagalan Pengiriman Webhook & Prosedur Manual Replay
    * 11.5 Saldo Gas Hot Wallet Menipis & Peringatan Ambang Batas
    * 11.6 Penanganan SQLite Lock (`database is locked`) & WAL Tuning

12. **Bab 12: Panduan Proteksi Kode Sumber & Kompilasi Biner Aman**
    * 12.1 Strip Debugging Symbols & DWARF Information (`-ldflags="-s -w"`)
    * 12.2 Obfuscasi Tingkat Lanjut Menggunakan Garble (`-literals -tiny`)
    * 12.3 Distribusi Berbasis Docker Distroless / Scratch (*Zero Source Code Delivery*)
    * 12.4 Proteksi Frontend Next.js (Disable Source Maps & Standalone Output)

---

## BAB 1: GAMBARAN UMUM & SPESIFIKASI ARSITEKTUR

### 1.1 Prinsip Non-Custodial & Kedaulatan Dana
13C Crypto Payment Gateway dirancang untuk memecahkan kelemahan terbesar payment gateway sentralistik konvensional, yaitu risiko pembekuan dana sepihak (*fund freezing*) dan biaya perantara ganda.

Dengan arsitektur **Non-Custodial Instant Forwarding**, sistem 13C tidak pernah mengendapkan saldo merchant di akun perantara. Setiap pembayaran yang diverifikasi on-chain langsung disapu (*swept*) ke **Cold Wallet Pribadi Merchant** yang aman.

```mermaid
flowchart LR
    Buyer["Pembeli (USDT / USDC)"] -->|"Bayar ke Deposit Address"| Ephemeral["Alamat Tagihan Ephemeral"]
    Ephemeral -->|"Auto-Sweeper Instan"| ColdWallet["Cold Wallet Pribadi Merchant"]
    Ephemeral -.->|"Deteksi On-Chain"| Indexer["Watcher Daemon Memindai Log"]
    Indexer -.->|"Callback Terverifikasi"| Webhook["Webhook HMAC Dikirim ke Toko"]
```

### 1.2 Multi-Chain Network Matrix
Sistem secara *native* mendukung 4 ekosistem blockchain utama dunia dengan biaya transaksi rendah dan finalitas blok instan:

| Blockchain | Standar Token | Satuan Biaya Gas | Kecepatan Konfirmasi | Estimasi Biaya Sweep |
| :--- | :--- | :--- | :--- | :--- |
| **BSC (BNB Smart Chain)** | BEP-20 (USDT / USDC) | Gwei (Native BNB) | ~3 Detik | ~$0.05 |
| **Polygon PoS** | ERC-20 (USDT / USDC) | Gwei (Native POL) | ~2 Detik | ~$0.02 |
| **TRON Network** | TRC-20 (USDT) | Energy & Bandwidth (TRX) | ~1 Detik | ~$1.20 |
| **Solana** | SPL Token (USDC / USDT) | Lamports (Native SOL) | ~400 Milidetik | ~$0.01 |

### 1.3 Siklus Tagihan 1 Invoice = 1 Dedicated Ephemeral Address
1. **Generasi Kunci Kriptografi**: Saat toko memanggil endpoint pembuatan invoice, backend Go membangkitkan pasangan kunci (*keypair*) baru secara dinamis menggunakan algoritma kriptografi standar industri (ECDSA secp256k1 untuk EVM/TRON dan Ed25519 untuk Solana).
2. **Enkripsi Kunci Privat**: Kunci privat dari alamat deposit langsung dienkripsi menggunakan sandi militer **AES-256-GCM** sebelum disimpan ke database.
3. **Masa Berlaku Tagihan**: Tagihan memiliki masa aktif 15–30 menit dengan hitung mundur presisi. Alamat yang kedaluwarsa tanpa pelunasan otomatis dinonaktifkan.


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


## BAB 3: TUTORIAL INTEGRASI TOKO ONLINE (MERCHANT INTEGRATION)

### 3.1 Pembuatan Tagihan via REST API (cURL, Node.js, PHP, Python)
Endpoint pembuatan faktur kripto:
`POST /api/v1/invoices`
Header yang wajib disertakan:
* `Content-Type: application/json`
* `X-API-KEY: <Production_API_Key_Anda>`

Payload JSON Pembuatan Invoice:
```json
{
  "order_id": "ORDER-99821",
  "amount": "25.00",
  "currency": "USD",
  "pay_network": "TRON",
  "fee_payer": "customer",
  "callback_url": "https://tokoanda.com/api/webhooks/13c"
}
```

#### Contoh Integrasi cURL (Terminal / Bash)
```bash
curl -X POST https://api.gatewayanda.com/api/v1/invoices \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: 13c_live_a1b2c3d4e5f6..." \
  -d '{
    "order_id": "ORDER-99821",
    "amount": "25.00",
    "currency": "USD",
    "pay_network": "TRON",
    "fee_payer": "customer"
  }'
```

#### Contoh Integrasi Node.js (TypeScript / JavaScript)
```typescript
import axios from 'axios';

async function createCryptoInvoice(orderId: string, amountUSD: number, network: string) {
  const response = await axios.post('https://api.gatewayanda.com/api/v1/invoices', {
    order_id: orderId,
    amount: amountUSD.toFixed(2),
    currency: 'USD',
    pay_network: network, // 'BSC' | 'POLYGON' | 'TRON' | 'SOLANA'
    fee_payer: 'customer'
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.THIRTEENC_API_KEY!
    }
  });

  return response.data.data; // { invoice_id, deposit_address, pay_amount, expires_at, qr_code }
}
```

#### Contoh Integrasi PHP (Native / Laravel / WooCommerce)
```php
<?php
$apiKey = getenv('THIRTEENC_API_KEY');
$url = 'https://api.gatewayanda.com/api/v1/invoices';

$payload = json_encode([
    'order_id'    => 'ORD-' . time(),
    'amount'      => '50.00',
    'currency'    => 'USD',
    'pay_network' => 'BSC',
    'fee_payer'   => 'customer'
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-KEY: ' . $apiKey
]);

$result = json_decode(curl_exec($ch), true);
curl_close($ch);

$depositAddress = $result['data']['deposit_address'];
$amountToPay    = $result['data']['pay_amount'];
```

#### Contoh Integrasi Python (FastAPI / Django / Flask)
```python
import os
import requests

def create_crypto_invoice(order_id: str, amount_usd: float, network: str = "POLYGON"):
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": os.getenv("THIRTEENC_API_KEY")
    }
    data = {
        "order_id": order_id,
        "amount": f"{amount_usd:.2f}",
        "currency": "USD",
        "pay_network": network,
        "fee_payer": "customer"
    }
    res = requests.post("https://api.gatewayanda.com/api/v1/invoices", json=data, headers=headers)
    res.raise_for_status()
    return res.json()["data"]
```

### 3.2 Menampilkan Checkout Widget ke Pelanggan
Setelah invoice berhasil dibangkitkan, arahkan pembeli ke halaman Checkout Widget:

![Customer Checkout Widget](images/06_checkout_widget.png)

Pilihan Metode Penampilan Widget:
1. **Direct Redirect**: Arahkan peramban pelanggan langsung ke URL checkout:
   `https://pay.gatewayanda.com/pay/{invoice_id}`
2. **Embedded Modal / Iframe**:
   ```html
   <iframe 
     src="https://pay.gatewayanda.com/pay/INV-88912" 
     width="420" 
     height="620" 
     style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
   </iframe>
   ```

Fitur Unggulan Widget Checkout:
* **Penghitung Waktu Mundur Real-Time (Countdown Timer)**: Memberikan estimasi waktu sisa sebelum kunci ephemeral kedaluwarsa (15–30 menit).
* **QR Code Dinamis**: Kompatibel dengan dompet mobile (Trust Wallet, TronLink, Phantom, MetaMask).
* **Tombol Salin Cepat (1-Click Copy)**: Memudahkan pembeli menyalin alamat deposit dan nominal tanpa risiko salah ketik.
* **Server-Sent Events (SSE)**: Halaman widget mendeteksi pembayaran masuk secara sub-detik (< 500ms) tanpa perlu pembeli memuat ulang layar.

### 3.3 Penanganan & Validasi Tanda Tangan Kriptografis Webhook (HMAC-SHA256)
Ketika pembayaran diverifikasi on-chain, gateway mengirimkan request `POST` ke `callback_url` merchant dengan header tanda tangan:
`X-13C-Signature: <hmac_sha256_hex>`

Contoh Payload Webhook:
```json
{
  "event": "invoice.paid",
  "data": {
    "invoice_id": "INV-77192",
    "order_id": "ORDER-99821",
    "status": "PAID",
    "pay_network": "TRON",
    "currency": "USDT",
    "amount_requested": "25.00",
    "amount_received": "25.00",
    "tx_hash": "a4b5c6...7788",
    "paid_at": "2026-11-18T14:32:01Z"
  }
}
```

Verifikasi Tanda Tangan di Backend Merchant (Node.js):
```javascript
import crypto from 'crypto';

function verifyWebhook(rawBody, signatureHeader, webhookSecret) {
  const calculatedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  // Wajib menggunakan timingSafeEqual untuk mencegah timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSig, 'hex'),
    Buffer.from(signatureHeader, 'hex')
  );
}
```

### 3.4 Plugin Resmi WooCommerce WordPress (`plugins/woocommerce-13c-gateway`)
Bagi pengguna CMS WordPress WooCommerce:
1. Unduh arsip zip plugin dari `plugins/woocommerce-13c-gateway.zip`.
2. Buka **WP-Admin $\to$ Plugins $\to$ Add New $\to$ Upload Plugin**.
3. Masukkan **API Key** dan **Webhook Secret** di menu **WooCommerce $\to$ Settings $\to$ Payments $\to$ 13C Crypto**.
4. Pembeli di toko WooCommerce otomatis dapat memilih opsi bayar kripto dengan konfirmasi status pesanan otomatis menjadi `Processing` atau `Completed`.


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


---

## BAB 6: MANAJEMEN NODE RPC & KONSOL SUPER ADMIN

### 6.1 Manajemen Node RPC Dinamis (Multi-Chain Failover)
Infrastruktur 13C Payment Gateway tidak bergantung pada satu penyedia RPC blockchain. Super Admin dapat mendaftarkan beberapa endpoint RPC untuk masing-masing jaringan (BSC, Polygon, TRON, Solana) langsung dari antarmuka Web Console:
* **Circuit Breaker per RPC:** Sistem secara otomatis mendeteksi latensi tinggi (>3.000 ms) atau tingkat kegagalan (*HTTP 429 Too Many Requests / 5xx*) dan mengalihkan panggilan ke node RPC sekunder secara transparan.
* **Health Check Otomatis:** Daemon latar belakang mengirimkan ping JSON-RPC berkala (`eth_blockNumber`, `getLatestBlock`, dsb.) setiap 30 detik untuk memastikan node dalam kondisi sinkron.

### 6.2 Otentikasi Super Admin & Keamanan 2FA (TOTP)
Akses ke Super Admin Console dilindungi oleh lapisan keamanan berlapis:
1. **Otentikasi Kredensial & TOTP:** Menggunakan kombinasi email/password terenkripsi `bcrypt` dan verifikasi One-Time Password berbasis RFC 6238 (Google Authenticator / Authy).
2. **Next.js BFF Reverse Proxy (Anti-Inspection):**
   * Seluruh panggilan API dari browser admin dialihkan melalui Next.js Backend-for-Frontend (BFF) di `/api/admin/*`.
   * Endpoint backend internal Go (`http://localhost:8080`) tidak pernah diekspos langsung ke publik.
   * Header otorisasi JWT disematkan di sisi server (*Server-Side Route Handler*) sehingga token tidak dapat diinspeksi atau dicuri melalui DevTools browser.

### 6.3 Manajemen Merchant & Toko (Full CRUD)
Super Admin memiliki kendali penuh terhadap operasional seluruh ekosistem:
* **Aktivasi & Penonaktifan:** Menonaktifkan merchant nakal secara instan tanpa mengganggu merchant lain.
* **Override Biaya Layanan:** Mengatur persentase potongan platform fee (misal 0.5% atau 1%) per merchant.
* **Monitoring Volume Transaksi:** Grafik real-time agregat volume transaksi, rasio keberhasilan invoice, dan cadangan gas native platform.

---

## BAB 7: ARSITEKTUR ESCROW VS INSTANT FORWARD & PENARIKAN

### 7.1 Perbandingan Mode Settlement

```mermaid
flowchart TD
    subgraph MODE_A["Mode 1: Instant Direct Sweep"]
        A1["Pelanggan Bayar ke Ephemeral Address"] --> A2["Watcher Deteksi Konfirmasi On-Chain"]
        A2 --> A3["Auto-Sweeper Kirim Langsung ke Cold Wallet Merchant"]
        A3 --> A4["Zero Custody - Dana Langsung Milik Merchant"]
    end

    subgraph MODE_B["Mode 2: Escrow Ledger Settlement"]
        B1["Pelanggan Bayar ke Ephemeral Address"] --> B2["Sweeper Mengumpulkan Dana ke Hot/Warm Pool"]
        B2 --> B3["Saldo Dicatat di Internal Merchant Ledger"]
        B3 --> B4["Merchant Mengajukan Penarikan (Payout Request)"]
        B4 --> B5["Super Admin Menyetujui & Eksekusi Batch Transfer"]
    end
```

### 7.2 Alur Pengajuan & Persetujuan Penarikan (Escrow Payout)
1. **Pengajuan oleh Merchant:**
   * Merchant membuka menu **Payout / Withdraw** di portal.
   * Memilih mata uang (USDT/USDC) dan jaringan tujuan.
   * Memasukkan nominal penarikan (minimal \$10).
   * Status mutasi tercatat sebagai `PENDING_APPROVAL`.
2. **Review & Persetujuan Super Admin:**
   * Admin memeriksa keabsahan transaksi pada tabel **Settlement Queue**.
   * Menekan tombol **Approve**: Sistem menandatangani transaksi on-chain dari Warm Pool ke dompet merchant dan mencatat hash transaksi.
   * Menekan tombol **Reject**: Sistem membatalkan penarikan dan mengembalikan saldo ke buku besar merchant disertai catatan alasan penolakan.

---

## BAB 8: WHITE-LABEL SOVEREIGNTY (KEDAULATAN KEPEMILIKAN)

### 8.1 Jaminan Jual Putus (Zero-Phone-Home)
Sistem 13C Payment Gateway dirancang sebagai platform mandiri (*Perpetual Sovereign Architecture*):
* **Tanpa Lisensi Server Vendor:** Tidak ada panggilan berkala (*heartbeat / phone home*) ke server vendor.
* **Tanpa Token Aktivasi / DRM:** Sistem berjalan 100% mandiri pada server Anda tanpa ketergantungan koneksi eksternal apa pun selain node RPC blockchain.
* **Privasi Total:** Data transaksi, daftar pelanggan, kunci privat dompet, dan omzet bisnis tersimpan secara eksklusif di server privat Anda.

### 8.2 Tata Kelola Master Key Enkripsi
* Kunci enkripsi database (`MASTER_SECRET_KEY`) dikonfigurasi melalui berkas `.env` server Anda.
* Kunci privat alamat deposit sementara dienkripsi secara simetris menggunakan algoritma **AES-256-GCM** sebelum disimpan di database.
* Anda memegang kontrol mutlak atas cadangan kunci, frase pemulihan Hot Wallet, dan master secret key tanpa campur tangan pihak ketiga.

---

## BAB 9: FITUR LANJUTAN & OPTIMASI TEKNIS

### 9.1 Server-Sent Events (SSE) pada Checkout Widget
Halaman checkout widget (`/checkout?invoice=...`) dilengkapi dengan koneksi **Server-Sent Events (SSE)** real-time:
* Pelanggan tidak perlu me-refresh halaman saat menunggu konfirmasi blockchain.
* Begitu transaksi terdeteksi di mempool atau kedalaman blok terpenuhi, widget secara instan berubah status menjadi `DETECTED` kemudian `PAID` dengan animasi sukses interaktif.
* Dilengkapi *fallback polling* otomatis jika browser pelanggan memblokir koneksi SSE.

### 9.2 Optimasi Biaya Gas TRON (Energy Rental)
Transaksi transfer token TRC-20 pada jaringan TRON membutuhkan energi besar (~65.000 Energy per transfer) yang jika dibayar dengan TRX mentah (*burn TRX*) dapat menghabiskan 13 - 27 TRX per transaksi.
* **Dukungan Delegasi Energi:** 13C mendukung integrasi dengan penyedia sewa energi TRON (Feee.io / JustLend).
* **Penghematan Signifikan:** Biaya transaksi TRC-20 berkurang hingga 70%–85%, memaksimalkan margin keuntungan platform dan merchant.

### 9.3 Indeks Majemuk Basis Data & Pemangkas Otomatis (Pruner)
* **Kueri Skala Jutaan Record:** Tabel `invoices` dan `webhook_logs` diindeks menggunakan *B-Tree Composite Indexes* (`(merchant_id, status, created_at)` dan `(pay_network, address)`).
* **Automated Data Pruner:** Daemon pembersih membersihkan log webhook berhasil yang berumur lebih dari 30 hari secara berkala pada jam non-sibuk (*off-peak hours*) untuk menjaga ukuran file database tetap ramping dan responsif.


---

## BAB 10: INTEGRASI HYBRID FIAT GATEWAY (KAGUH.ID)

### 10.1 Konsep Solusi Hybrid (Fiat + Kripto)
Banyak merchant digital memerlukan penerimaan pembayaran dua arah: mata uang fiat lokal Indonesia (Rupiah/IDR melalui QRIS, Virtual Account BCA/BRI/Mandiri, E-Wallet) dan mata uang kripto global (USDT & USDC).

Platform 13C Crypto Payment Gateway dirancang untuk dapat digabungkan secara mulus dengan penyedia Fiat Payment Gateway, seperti **Kaguh.id** (`https://docs.kaguh.id/` & `https://business.kaguh.id/`).

```mermaid
flowchart TD
    Customer["Pelanggan di Toko Online"] --> Checkout["Halaman Checkout Terpadu (Unified Checkout)"]
    
    Checkout -->|"Pilih Bayar Rupiah (QRIS / VA)"| KaguhGateway["Kaguh.id API Engine (/v2/transactions)"]
    Checkout -->|"Pilih Bayar Kripto (USDT / USDC)"| C13Gateway["13C Crypto Gateway Engine (/api/v1/invoices)"]

    KaguhGateway -->|"QRIS / VA Terbit (IDR)"| FiatSettlement["Rekening Bank Merchant (IDR via Kaguh)"]
    C13Gateway -->|"Ephemeral Address Terbit"| CryptoSettlement["Cold Wallet Pribadi (USDT On-Chain)"]

    KaguhGateway -.->|"Webhook Notifikasi Fiat"| UnifiedWebhook["Backend Toko Online Merchant"]
    C13Gateway -.->|"Webhook HMAC Kripto"| UnifiedWebhook
```

### 10.2 Arsitektur Alur Transaksi Kaguh.id (`/v2/transactions`)
Sesuai dengan spesifikasi OpenAPI v2.0 Kaguh.id, setiap transaksi fiat dibuat melalui endpoint:
`POST https://api.kaguh.id/v2/transactions`

#### Parameter Transaksi Kaguh:
* `partner_order_id`: ID unik transaksi dari sistem merchant.
* `product_code`: Kode kanal pembayaran (misal `QRIS`, `VA_BCA`, `VA_MANDIRI`, `OVO`, `DANA`).
* `amount`: Nominal tagihan dalam mata uang Rupiah (IDR).
* `customer_name`: Nama pembeli.
* `customer_email`: Alamat email pembeli.
* `callback_url`: URL webhook untuk menerima update status transaksi.

### 10.3 Pemetaan Kanal Kripto 13C pada Ekosistem Kaguh
Jika Kaguh bertindak sebagai agregator pembayaran utama (*Single Entry-Point*), kanal 13C didaftarkan sebagai saluran pembayaran digital dengan `product_code` khusus:
* `CRYPTO_USDT_TRON` : Tether pada jaringan TRON (TRC-20)
* `CRYPTO_USDT_BSC`  : Tether pada jaringan Binance Smart Chain (BEP-20)
* `CRYPTO_USDT_POL`  : Tether pada jaringan Polygon (ERC-20)
* `CRYPTO_USDT_SOL`  : Tether pada jaringan Solana (SPL)

#### Alur Eksekusi Bridge API:
```mermaid
sequenceDiagram
    autonumber
    actor User as Pelanggan
    participant Store as Toko Online / Frontend
    participant Kaguh as Kaguh API Engine
    participant Bridge as 13C Hybrid Adapter
    participant Core as 13C Core Engine
    participant Chain as Blockchain Network

    User->>Store: Pilih Bayar Kripto (USDT-TRON)
    Store->>Kaguh: POST /v2/transactions (product_code: CRYPTO_USDT_TRON, amount: 155000 IDR)
    Kaguh->>Bridge: Forward Request ke 13C Adapter
    Bridge->>Core: Konversi IDR ke USDT via RateService (misal $10 USDT)
    Core->>Chain: Generate Ephemeral Address (TRC-20)
    Core-->>Bridge: Invoice Created (address, usdt_amount, qr_url, expired_at)
    Bridge-->>Kaguh: Response Terstandarisasi Kaguh
    Kaguh-->>Store: Render Halaman Bayar Kripto
    User->>Chain: Transfer 10 USDT
    Chain-->>Core: On-Chain Confirmed
    Core->>Bridge: Trigger Internal Webhook
    Bridge->>Kaguh: POST Callback Transaksi Sukses
    Kaguh->>Store: Webhook Lunas (Order Updated)
```

### 10.4 Layanan Konversi Kurs Otomatis (Rate Service)
Untuk menghubungkan nilai Rupiah (IDR) pada tagihan Kaguh dengan nominal token kripto (USDT):
1. **Ticker Otomatis:** Modul `RateService` pada 13C melakukan agregasi kurs real-time dari bursa terdaftar (Indodax, Tokocrypto, atau Binance P2P IDR).
2. **Perlindungan Volatilitas (Price Lock Period):** Nilai kurs dikunci (*locked*) selama durasi aktif invoice (misal 15 menit). Jika nilai $1 \text{ USDT} = \text{Rp } 15.800$, maka tagihan Rp 158.000 akan menghasilkan nilai pembayaran tepat $10,000000 \text{ USDT}$.
3. **Penyelarasan Webhook (Webhook Harmonization):**
   Payload webhook dari 13C diterjemahkan ke format payload standar Kaguh:
   ```json
   {
     "status": "SUCCESS",
     "partner_order_id": "ORD-20261121-001",
     "transaction_id": "TX-13C-98234710",
     "product_code": "CRYPTO_USDT_TRON",
     "amount": 158000,
     "crypto_amount": "10.000000",
     "crypto_currency": "USDT",
     "tx_hash": "a8f3b2c1e4d56789...",
     "paid_at": "2026-11-21T18:45:00Z"
   }
   ```


---

## BAB 11: PANDUAN PEMECAHAN MASALAH (TROUBLESHOOTING & FAQ)

### 11.1 Kasus Pembayaran Kurang (*Underpaid Invoices*)
* **Masalah:** Pelanggan mengirimkan nominal lebih sedikit dari tagihan karena terpotong biaya transfer dari bursa (misal transfer $10, namun bursa memotong fee $1 sehingga hanya sampai $9).
* **Solusi Otomatis:**
  * 13C menyediakan fitur `underpaid_threshold_percentage` (default 1% - 2%).
  * Jika selisih berada dalam ambang batas toleransi, status invoice tetap otomatis diubah menjadi `PAID` dan webhook dikirimkan.
  * Jika selisih melebihi toleransi, status menjadi `UNDERPAID`. Widget menampilkan sisa kekurangan dana yang wajib disetor pelanggan sebelum kedaluwarsa.

### 11.2 Kasus Pembayaran Kedaluwarsa (*Expired / Late Payment*)
* **Masalah:** Pelanggan baru mentransfer setelah batas waktu 15 menit berakhir, atau transaksi tertahan lama di mempool blockchain.
* **Penanganan:**
  * Alamat deposit tetap dipantau oleh *Late Sweeper Worker* hingga 24 jam.
  * Jika dana mendarat setelah status menjadi `EXPIRED`, dana tidak akan hilang. Sistem otomatis melakukan sweeping ke Cold Wallet merchant dan menandai invoice sebagai `SETTLED_AFTER_EXPIRY` pada buku besar keuangan.

### 11.3 Gangguan Koneksi Node RPC (*RPC Drop & Timeout*)
* **Gejala:** Watcher terlambat mendeteksi konfirmasi transaksi atau muncul log `HTTP 429 Too Many Requests`.
* **Langkah Pemulihan:**
  1. Masuk ke **Super Admin Console -> RPC Management**.
  2. Tambahkan endpoint RPC cadangan (misal dari Ankr, Alchemy, atau QuickNode).
  3. Aktifkan saklar **Auto-Failover** agar sistem berpindah node secara otomatis saat node utama mengalami *rate-limit*.

### 11.4 Peringatan Saldo Cadangan Gas Menipis (*Low Hot Wallet Gas*)
* **Gejala:** Dashboard Super Admin menampilkan badge merah *Warning: Gas Low*, dan auto-sweeping tertunda.
* **Langkah Pemulihan:**
  1. Periksa saldo dompet Hot Wallet pada jaringan yang bermasalah (BNB, POL, TRX, atau SOL).
  2. Lakukan deposit koin native secukupnya (misal 0.05 BNB, 10 MATIC, 50 TRX, atau 0.1 SOL) ke alamat Hot Wallet yang tertera di konsol admin.
  3. Tekan tombol **Trigger Manual Sweeper** untuk mengeksekusi antrean transaksi yang tertahan.

### 11.5 Optimasi SQLite WAL Mode (*Database Locked Fix*)
* **Gejala:** Pesan error `database is locked (5)` pada log backend Go saat volume transaksi simultan tinggi.
* **Solusi Arsitektural:**
  * Pastikan koneksi database menggunakan flag **WAL (Write-Ahead Logging)** dan `busy_timeout=5000`:
    ```go
    db, err := sql.Open("sqlite3", "file:data/gateway.db?_journal_mode=WAL&_busy_timeout=5000&_synchronous=NORMAL")
    ```
  * Mode WAL memungkinkan operasi pembacaan (*read*) berjalan bersamaan tanpa pernah terblokir oleh operasi penulisan (*write*).

---

## BAB 12: PROTEKSI DAN OBFUSKASI KODE SUMBER (JUAL PUTUS)

Saat menjual aplikasi dengan skema jual putus (*outright sale*), Anda mungkin ingin mendistribusikan aplikasi tanpa menyertakan kode sumber mentah (*un-obfuscated plain code*) agar hak cipta dan logika internal sistem tetap terlindungi dari penyalinan tidak sah.

```mermaid
flowchart LR
    Source["Go Backend Source Code (.go)"] --> Garble["Garble Obfuscator (-literals -tiny)"]
    Garble --> Stripped["Stripped Binary (-ldflags='-s -w')"]
    Stripped --> Container["Distroless / Scratch Docker Image"]
    Container --> Client["Klien / Pembeli (Zero Source Code Visible)"]
```

### 12.1 Kompilasi Biner Terproteksi (Stripping Symbols)
Gunakan flag `-ldflags="-s -w"` saat melakukan build Go untuk menghapus seluruh tabel simbol debug dan informasi penelusuran (*DWARF debugging information*):
```bash
go build -ldflags="-s -w" -trimpath -o build/gateway_server cmd/server/main.go
```
* Efek: Binary menjadi 40% lebih kecil dan program decompiler (IDA Pro, Ghidra) tidak dapat menampilkan nama fungsi asli.

### 12.2 Obfuskasi Tingkat Lanjut Menggunakan Garble
Untuk perlindungan maksimal, gunakan tool `garble` (obfuskator resmi komunitas Go):
```bash
# Instalasi Garble
go install mvdan.cc/garble@latest

# Kompilasi dengan enkripsi literal string dan obfuskasi token
garble -literals -tiny build -ldflags="-s -w" -trimpath -o build/gateway_secure cmd/server/main.go
```
* **Enkripsi Literal (`-literals`):** Seluruh string teks (seperti SQL query, nama tabel, rute endpoint) dienkripsi secara acak di dalam memori biner sehingga tidak dapat dibaca menggunakan perintah `strings`.
* **Pengacakan Nama (`-tiny`):** Nama paket, fungsi, struct, dan variabel diubah menjadi karakter acak non-semantik (misal `f8g9a()`).

### 12.3 Distribusi Menggunakan Docker Distroless / Scratch
Untuk distribusi profesional ke klien tanpa mengekspos sistem file server:
1. Gunakan *Multi-Stage Dockerfile* dengan basis image `gcr.io/distroless/static-debian12` atau `scratch`.
2. Di dalam kontainer akhir, hanya ada 1 file biner yang telah diobfuskasi tanpa ada shell (`sh`/`bash`), tanpa package manager, dan tanpa compiler.
3. Klien hanya menerima Docker image yang siap dijalankan melalui `docker compose up -d` dengan kinerja tinggi dan tingkat keamanan tingkat enterprise.
