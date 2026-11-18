# TECHNICAL SPECIFICATION DOCUMENT (TSD)
> **13C Non-Custodial Multi-Chain Crypto Payment Gateway**  
> **Klasifikasi:** Enterprise Architecture & Technical Specification Blueprint  
> **Versi:** 2.1.0 | **Tanggal:** November 2026 | **Status:** Production-Ready  
> **Repositori:** [github.com/gonzhilaz/bpg](https://github.com/gonzhilaz/bpg)

---

## 1. Executive Summary & Architectural Scope
13C Crypto Payment Gateway adalah infrastruktur pemrosesan pembayaran cryptocurrency berskala enterprise yang mengimplementasikan arsitektur **Non-Custodial Instant Forwarding**. Sistem ini memungkinkan toko online dan merchant e-commerce menerima pembayaran stablecoin (USDT & USDC) lintas 4 jaringan blockchain terpopuler (BSC, Polygon, TRON, dan Solana) dengan kepastian dana langsung disapu (*swept*) ke Cold Storage pribadi milik merchant tanpa pengendapan dana di pihak ketiga.

### Core Architectural Axioms
1. **Zero-Custody Guarantee:** Gateway tidak pernah menyimpan atau menahan likuiditas merchant. Kunci privat alamat deposit sementara hanya berumur pendek (*ephemeral*) dan langsung dihapus logikanya setelah proses penyapuan selesai.
2. **1 Invoice = 1 Ephemeral Address:** Setiap tagihan memiliki pasangan kunci kriptografis tersendiri, menghilangkan kebutuhan Memo/Tag dan mencegah tabrakan deposit antar pelanggan.
3. **Cryptographic Defense-in-Depth:** Kunci privat dienkripsi at-rest menggunakan **AES-256-GCM**, kredensial API disimpan sebagai hash searah **SHA-256**, dan webhook diotentikasi via **HMAC-SHA256**.
4. **White-Label Sovereign Ownership:** Arsitektur mandiri (*Zero-Phone-Home*) yang memberikan hak kepemilikan komersial penuh kepada pembeli untuk mengoperasikan platform di server privat tanpa ketergantungan lisensi eksternal atau risiko *remote shutdown*.

---

## 2. C4 Architecture Model

### 2.1 Level 1: System Context Diagram
```mermaid
flowchart TD
    Customer["Pelanggan Toko (Customer)"]
    Merchant["Merchant / Toko Online"]
    Admin["Super Admin & DevOps"]
    
    subgraph System["13C Payment Gateway System"]
        CoreAPI["13C Core API Engine (Go)"]
        Dash["Merchant Portal (Next.js)"]
        AdminPortal["Admin Console (Next.js)"]
    end
    
    Blockchains["4 Blockchain Networks (BSC, Polygon, TRON, Solana)"]
    ColdWallet["Merchant Cold Storage (Ledger/Trezor/Safe)"]
    StoreBackend["Merchant Store Backend / Webhook Receiver"]

    Customer -->|"Bayar USDT/USDC ke Deposit Address"| Blockchains
    Merchant -->|"Kelola Akun, Cold Wallet & API Keys"| Dash
    Dash -->|"REST API (JWT)"| CoreAPI
    Admin -->|"Monitoring Hot Wallet & DB Maintenance"| AdminPortal
    AdminPortal -->|"Admin REST API (Master Secret)"| CoreAPI
    
    CoreAPI -->|"Scan Block & Event Logs"| Blockchains
    CoreAPI -->|"Sweep Dana Otomatis"| ColdWallet
    CoreAPI -->|"Notifikasi Transaksi (HMAC-SHA256)"| StoreBackend
```

### 2.2 Level 2: Container Topology Diagram
```mermaid
flowchart LR
    subgraph ClientLayer["Frontend Client Tier"]
        UI_Dash["Merchant Dashboard\n(Next.js App Router :3001)"]
        UI_Admin["Admin Telemetry Console\n(Next.js App Router :3002)"]
        UI_Widget["Checkout Widget / Sandbox\n(Next.js :3000)"]
    end

    subgraph AppTier["Application Core Tier (Go Engine :8080)"]
        GinRouter["Gin HTTP Router & Middlewares\n(CORS, RateLimiter, JWT/APIKey Auth)"]
        InvoiceSvc["Invoice & Pricing Service"]
        PayoutEngine["Payout & Sweeper Engine"]
        WebhookDisp["Webhook Dispatcher\n(SSRF Guard & Retry Backoff)"]
        WatcherMgr["Watcher Daemon Manager"]
        PrunerWorker["Automated DB Pruner Daemon"]
    end

    subgraph DataTier["Data & Security Storage Tier"]
        DB[(PostgreSQL / SQLite WAL Engine)]
        LockMgr["In-Memory / Distributed Mutex Lock"]
        KMS["AES-256-GCM Cryptographic Vault"]
    end

    UI_Dash -->|"HTTP / REST"| GinRouter
    UI_Admin -->|"HTTP / REST"| GinRouter
    UI_Widget -->|"HTTP / SSE"| GinRouter

    GinRouter --> InvoiceSvc
    GinRouter --> PayoutEngine
    InvoiceSvc --> KMS
    InvoiceSvc --> DB
    PayoutEngine --> LockMgr
    PayoutEngine --> DB
    WatcherMgr --> DB
    WatcherMgr --> PayoutEngine
    WatcherMgr --> WebhookDisp
    PrunerWorker --> DB
```

---

## 3. Database Architecture & Relational Data Dictionary

### 3.1 Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
    MERCHANT ||--o{ INVOICE : generates
    MERCHANT ||--o{ PAYMENT_LINK : creates
    MERCHANT ||--o{ WITHDRAWAL_REQUEST : submits
    INVOICE ||--o{ BLOCKCHAIN_TRANSACTION : records
    INVOICE ||--o{ PAYOUT_TRANSFER : triggers

    MERCHANT {
        uuid id PK
        string email UK
        string password_hash
        string name
        string role
        string status
        string api_key UK
        string api_key_hash "index"
        string api_key_prefix
        string secret_key
        string payout_address_bsc
        string payout_address_polygon
        string payout_address_tron
        string payout_address_solana
        boolean auto_payout_enabled
        string fee_payer
        numeric underpaid_tolerance
        numeric balance_usd
        text webhook_url
        boolean two_factor_enabled
        timestamptz created_at
    }

    INVOICE {
        uuid id PK
        uuid merchant_id FK "index"
        string order_id "index"
        numeric amount_requested
        string currency_requested
        string pay_currency
        string pay_network "composite index"
        numeric pay_amount
        numeric received_amount
        string status "composite index"
        string deposit_address "unique index"
        text encrypted_priv_key
        text callback_url
        string payout_address
        timestamptz expires_at "composite index"
        timestamptz paid_at
        timestamptz created_at
    }

    BLOCKCHAIN_TRANSACTION {
        uuid id PK
        uuid invoice_id FK "index"
        string tx_hash "unique index"
        string network
        string from_address
        string to_address
        numeric amount
        string token_symbol
        uint64 block_number
        uint64 confirmations
        string status
        timestamptz detected_at
    }

    PAYOUT_TRANSFER {
        uuid id PK
        uuid invoice_id FK "index"
        uuid merchant_id FK
        string network
        string tx_hash "unique index"
        string from_address
        string to_address
        numeric amount
        numeric fee_paid
        string status
        timestamptz created_at
    }

    PAYMENT_LINK {
        uuid id PK
        uuid merchant_id FK "index"
        string slug "unique index"
        string title
        text description
        numeric amount
        string currency
        string pay_network
        boolean is_active
        numeric total_collected
        int payment_count
        timestamptz created_at
    }
```

### 3.2 Indexing Strategy & Concurrency Tuning
* **Composite Index `idx_invoices_watcher`:** Terpasang pada kolom `(pay_network, status, expires_at)`. Memungkinkan background watcher memindai ribuan tagihan aktif dalam kompleksitas waktu **O(log N)** tanpa *full table scan*.
* **Composite Index `idx_merchant_created`:** Terpasang pada `(merchant_id, created_at)` untuk eksekusi paginasi dashboard instan.
* **Database Connection Pooling:**
  * **PostgreSQL:** `MaxOpenConns = 100`, `MaxIdleConns = 10`, `ConnMaxLifetime = 1 Hour`.
  * **SQLite WAL Mode:** Diaktifkan `PRAGMA journal_mode=WAL;`, `PRAGMA busy_timeout=5000;`, dan `PRAGMA synchronous=NORMAL;` untuk menjamin nol kegagalan lock saat multi-goroutine paralel membaca dan menulis data.

---

## 4. Cryptographic Protocols & Key Management System (KMS)

### 4.1 Ephemeral Keypair Lifecycle
Untuk setiap invoice yang dibuat, sistem mengeksekusi pembangkitan kunci kriptografis dinamis:
1. **EVM Networks (BSC & Polygon) & TRON:** Menggunakan kurva eliptis **ECDSA secp256k1**. Alamat TRON diturunkan dari *uncompressed public key* (Keccak-256, ambil 20-byte terakhir, prefix byte `0x41`, dan dienkode ke **Base58Check**).
2. **Solana Network:** Menggunakan algoritma tanda tangan digital **Ed25519 (Edwards-curve Digital Signature)** dengan pengkodean alamat **Base58**.

### 4.2 Sandi Simetris AES-256-GCM
Kunci privat alamat deposit dienkripsi di level memori sebelum menyentuh storage database:
$$\text{Ciphertext} = \mathbf{AES\text{-}256\text{-}GCM}(\text{PlaintextKey}, \mathbf{K}_{\text{master}}, \mathbf{IV}_{12\text{-byte}})$$
* **Panjang Kunci Master ($\mathbf{K}_{\text{master}}$):** 256 bit (32 byte) derivasi rahasia master platform.
* **Inisialisasi Vektor (IV / Nonce):** 12 byte bilangan acak kriptografis kripto (`crypto/rand`) yang di-*generate* unik per invoice (mencegah serangan replay dan *known-plaintext attack*).
* **Tag Otentikasi (Auth Tag):** 16 byte (128 bit) tag integritas Galois/Counter Mode. Jika satu bit ciphertext di database dimanipulasi, dekripsi otomatis melempar error otentikasi.

### 4.3 Kredensial API At-Rest
* API Key disimpan dalam bentuk hash kriptografis **SHA-256** searah (`api_key_hash`).
* Kolom `api_key_prefix` menyimpan 12 karakter depan untuk *indexed lookup*, sedangkan pencocokan akhir divalidasi terhadap hash SHA-256. Jika database bocor, penyerang tidak dapat merekonstruksi API key asli.

### 4.4 Webhook HMAC-SHA256
Setiap callback HTTP ke toko online merchant disertai header tanda tangan kriptografis:
$$\text{Signature} = \mathbf{HMAC\text{-}SHA256}(\text{RawPayloadJSON}, \mathbf{S}_{\text{merchant}})$$
Verifikasi pada backend merchant wajib menggunakan pembandingan waktu konstan (*constant-time comparison*) untuk memitigasi *timing attacks*.

---

## 5. Multi-Chain Watcher Engine & Anti-Reorg Matrix

### 5.1 Mekanisme Pemindaian On-Chain (Targeted Polling)
Background watcher memindai transaksi masuk secara asinkron tanpa membebani node RPC publik:
* **EVM Watcher (BSC & Polygon):** Menggunakan `eth_getLogs` dengan filter topic alamat 32-byte zero-padded (`topics: [TRANSFER_TOPIC, nil, activeAddressTopics]`). Pendekatan ini membatasi log transfer hanya pada alamat deposit yang sedang aktif, mencegah *10,000 log overflow error* pada RPC publik.
* **TRON Watcher:** Mengintegrasikan pemindaian event TRC-20 via TronGrid API dengan manajemen sewa energi harian (*energy delegation*), memangkas biaya gas operasional sweeping platform hingga 80%.
* **Solana Watcher:** Memindai transfer token SPL via JSON-RPC `getSignaturesForAddress` dan `getTransaction` dengan commitment level `confirmed`.

### 5.2 Block Confirmation Lag Depth Matrix
Untuk mencegah serangan *blockchain reorg* dan *double-spending*, status invoice tidak langsung diubah menjadi `PAID` pada blok pertama, melainkan mengikuti matriks konfirmasi kedalaman blok berikut:

| Jaringan Blockchain | Standar Token | Block Time | Konfirmasi Blok Minimum | Waktu Tunggu Finalitas |
| :--- | :--- | :--- | :--- | :--- |
| **BNB Smart Chain (BSC)** | BEP-20 | ~3.0 detik | **3 Blok** | ~9.0 detik |
| **Polygon PoS** | ERC-20 | ~2.1 detik | **15 Blok** | ~31.5 detik |
| **TRON Network** | TRC-20 | ~3.0 detik | **19 Konfirmasi** | ~57.0 detik |
| **Solana** | SPL Token | ~400 ms | **32 Slot (Finalized)** | ~12.8 detik |

### 5.3 Invoice Finite State Machine (FSM)
```mermaid
stateDiagram-v2
    [*] --> PENDING : Invoice Dibuat
    PENDING --> DETECTED : Transaksi Masuk Ditemukan On-Chain
    PENDING --> EXPIRED : Batas Waktu 30 Menit Habis
    DETECTED --> PAID : Kedalaman Blok Konfirmasi Tercapai & Lunas
    DETECTED --> UNDERPAID : Nominal Masuk < Tagihan (Di Luar Toleransi)
    DETECTED --> EXPIRED : Reorg Terdeteksi / Transaksi Dibatalkan
    PAID --> [*] : Auto-Swept ke Cold Wallet & Webhook Terkirim
    UNDERPAID --> [*] : Notifikasi Kurang Bayar Dikirim ke Toko
    EXPIRED --> [*] : Alamat Deposit Dinonaktifkan
```

---

## 6. Concurrency Control, Distributed Lock & Idempotency

### 6.1 Mutex & Distributed Lock Management
Untuk mencegah *race condition* pada saat penyapuan dana (*auto-sweeper*), sistem menerapkan penguncian terdistribusi:
* Kunci penguncian berformat `lock:sweep:invoice:<invoice_id>`.
* Menggunakan waktu sewa (*TTL lease*) 30 detik dengan rilis otomatis (*defer release*).
* Jika dua event konfirmasi blok datang bersamaan untuk invoice yang sama, goroutine kedua gagal mendapatkan lock dan langsung keluar secara idempoten.

### 6.2 Idempotency Webhook & Delivery Guarantee
* Setiap pengiriman webhook menyertakan header `X-13C-Delivery-ID` dan `Idempotency-Key` bernilai UUID unik.
* Dispatcher menerapkan pola *Exponential Backoff Retry* (hingga 5 kali percobaan) dengan interval $2^n \times 1\text{ detik}$.
* Jika endpoint merchant sedang down, webhook delivery ditandai `FAILED` di database dan dapat dipicu ulang melalui tombol *Manual Replay* di portal merchant.

---

## 7. Security Architecture & STRIDE Threat Modeling

| Ancaman (STRIDE) | Skenario Risiko | Mitigasi Arsitektur 13C Gateway |
| :--- | :--- | :--- |
| **Spoofing** | Penyerang memalsukan notifikasi webhook status lunas ke toko merchant. | Tanda tangan digital **HMAC-SHA256** wajib diverifikasi oleh backend toko menggunakan kunci rahasia yang hanya diketahui merchant. |
| **Tampering** | Kunci privat deposit di database diubah atau dimanipulasi oleh pihak tak berwenang. | Kunci privat dienkripsi dengan **AES-256-GCM** dengan otentikasi tag 128-bit; perubahan 1 bit membatalkan dekripsi. |
| **Repudiation** | Merchant menyangkal telah mengubah alamat Cold Wallet payout. | Audit log persisten mencatat riwayat mutasi profil beserta timestamp, IP asal, dan user-agent. |
| **Information Disclosure** | Database dump bocor ke publik. | Zero plaintext API keys (disimpan sebagai hash SHA-256), zero plaintext private keys (dienkripsi AES-256-GCM). |
| **Denial of Service** | Flooding request pembuatan invoice untuk menghabiskan memori server. | Rate limiting bertingkat (15 req/menit untuk auth, 60 req/menit untuk invoice publik) dan koneksi pool terbatas. |
| **Elevation of Privilege** | Merchant memanggil endpoint manajemen database atau sweeping manual. | Isolasi otentikasi middleware terpisah: rute admin diwajibkan menyertakan header `X-Admin-Key` dengan verifikasi master secret. |
| **SSRF (Server-Side Request Forgery)** | Merchant mendaftarkan Webhook URL ke IP lokal server (127.0.0.1 atau 169.254.169.254) untuk mencuri metadata cloud. | Webhook dispatcher memvalidasi URL terhadap daftar hitam IP privat (RFC 1918), IP loopback, dan *cloud metadata endpoints*. |
| **Vendor Lock-in & Backdoor** | Server gateway dimatikan sepihak atau data transaksi dibocorkan ke server vendor. | **Zero-Phone-Home Architecture**: Gateway beroperasi 100% otonom di server privat pembeli tanpa panggilan telemetri dan tanpa remote kill-switch vendor. |

---

## 8. DevOps, Deployment Topology & Disaster Recovery

### 8.1 Docker Multi-Stage Containerization
Sistem dikemas menggunakan multi-stage Docker build untuk menghasilkan artefak biner distroless berukuran minimal tanpa dependensi build compiler di image produksi:
* **Ukuran Image Go Backend:** ~28 MB (berbasis Alpine Linux dengan sertifikat CA resmi).
* **Eksekusi Non-Root:** Kontainer berjalan di bawah user UID 10001 (bukan root) untuk memitigasi risiko eskalasi kontainer.

### 8.2 Topologi Docker Compose Produksi
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
      - POSTGRES_PASSWORD=secure_pass

  merchant-dashboard:
    image: 13c-dashboard:latest
    restart: always
    ports:
      - "3001:3000"

volumes:
  pgdata:
```

### 8.3 Disaster Recovery, RPO & RTO
* **Recovery Point Objective (RPO):** < 1 menit menggunakan PostgreSQL Continuous Archiving / WAL Streaming.
* **Recovery Time Objective (RTO):** < 5 menit untuk restart kontainer otomatis via Docker orchestrator.
* **Automated Data Pruning:** Pekerja latar belakang (*Pruner Worker*) membersihkan invoice kedaluwarsa secara berkala setiap 24 jam dengan batas retensi 30 hari untuk menjaga performa indeks B-Tree database.
