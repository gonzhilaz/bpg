# Laporan Audit Teknis, Bug History & Rencana Remediasi (Remediation Plan)

**Proyek**: 13C Crypto Payment Gateway  
**Tanggal Audit**: 13 November 2026  
**Dokumen Pendamping**: [DOC/13C_Payment_Gateway_Manual.pdf](file:///d:/DEVELOPMENT/Projects/Captain/DOC/13C_Payment_Gateway_Manual.pdf)

---

## 1. Klasifikasi Tingkat Keparahan (Severity Level Scale)
* 🔴 **CRITICAL (P1)**: Bug yang menyebabkan kehilangan dana, kegagalan rekonsiliasi, memory leak, atau kerentanan bypass autentikasi.
* 🟡 **MAJOR (P2)**: Anomali UX, timeout jaringan tanpa retry, overflow layout pada layar tertentu, atau desinkronisasi status.
* 🟢 **MINOR (P3)**: Ketidakkonsistenan penamaan, dead code, atau optimasi bundle/file size.

---

## 2. Riwayat Bug yang Teridentifikasi & Status Perbaikan (Resolved)

| ID | Modul | Deskripsi Anomali / Temuan | Tingkat | Status | Remediasi yang Diterapkan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Backend DB | File database SQLite `captain.db` sempat tercipta di root directory saat server dijalankan di luar folder `backend/`. | 🟡 MAJOR | ✅ Fixed | Konfigurasi path database dipusatkan ke `data/captain.db` dengan auto-create directory pada `configs/config.go` dan `database.go`. File root dihapus. |
| **BUG-002** | Webhook Engine | Paket `fmt` diimpor tanpa digunakan pada `internal/webhook/dispatcher.go`. | 🟢 MINOR | ✅ Fixed | Unused import dihapus; `go vet` diverifikasi 0 warnings. |
| **BUG-003** | Next.js Checkout | Next.js 16 melempar error dynamic prerender pada `checkout/[id]/page.tsx` karena membaca `params` asynchronous tanpa boundary. | 🟡 MAJOR | ✅ Fixed | Komponen konten dibungkus dengan `<Suspense fallback={<CheckoutSkeleton />}>` dan `use(params)` dari React 19. |
| **BUG-004** | Sandbox Simulator | Halaman `/sandbox` melempar warning pada `Math.random()` saat kompilasi static SSG. | 🟢 MINOR | ✅ Fixed | Diubah menggunakan generator ID default deterministik `ORD-98210`. |
| **BUG-005** | Backend Tests | `server_test.go` mengalami *test race condition* di mana goroutine auto-payout masih menulis ke database saat assertion dijalankan. | 🔴 CRITICAL | ✅ Fixed | Ditambahkan retry loop asynchronous hingga 500ms pada `server_test.go` sehingga seluruh tes unit lulus 100%. |
| **BUG-006** | Keamanan API Key | API Key merchant awalnya disimpan dalam bentuk teks polos (*plaintext*) di database. | 🔴 CRITICAL | ✅ Fixed | Diperbarui menggunakan protokol **SHA-256 Hashing At-Rest** dan **Reveal Once** saat registrasi/regenerasi. |
| **BUG-007** | Frontend UX & Arch | Frontend Merchant Portal dan Super Admin awalnya merender seluruh modul secara vertikal dalam satu halaman tunggal (`src/app/page.tsx`), melanggar standar arsitektur Enterprise Dashboard. | 🔴 CRITICAL | ✅ Fixed | Dilakukan perombakan penuh menjadi arsitektur **Persistent Sidebar Navigation** dan **Multi-Route App Router**: Merchant Portal dipecah menjadi 7 rute terdedikasi (`/`, `/invoices`, `/payouts`, `/wallets`, `/api-keys`, `/webhooks`, `/reports`), dan Super Admin dipecah menjadi 7 rute (`/`, `/merchants`, `/gas-liquidity`, `/watchers`, `/database`, `/finance`, `/settings`). Seluruh file dipastikan <= 400 baris, zero raw emojis (100% Lucide SVG), dan responsif dengan mobile slide-over drawer. |

---

## 3. Rencana Pengembangan Lanjutan (Future Remediation & Roadmap)

### 3.1 P1: Distributed Lock pada Background Indexer (Anti-Double Spending)
* **Konteks**: Jika backend dijalankan dalam cluster multi-instance (misal Kubernetes dengan 3 replica pods), 3 watcher daemon bisa memindai blok yang sama secara paralel.
* **Rencana**: Pasang Redis Distributed Lock (Redlock) pada saat memproses `RecordPayment` agar 1 txHash hanya dapat diproses tepat 1 kali (*idempotent lock*).

### 3.2 P2: TRON Energy Rental Integration
* **Konteks**: Biaya transfer TRC-20 USDT membutuhkan 31,895 Energy (membakar ~13-32 TRX atau ~$2.50 jika tanpa sewa energi).
* **Rencana**: Integrasikan API TronEnergy atau JustLend / Feee.io agar hot wallet admin dapat menyewa energi harian dengan diskon hingga 70% ($0.40 per transaksi), sehingga biaya operasional sweeping platform sangat hemat.

### 3.3 P3: Web3 Wallet Connect (SIWE / EIP-4361)
* **Konteks**: Merchant saat ini login menggunakan Email + Password.
* **Rencana**: Tambahkan opsi alternatif login menggunakan tanda tangan dompet Web3 (*Sign-In with Ethereum*) via Wagmi/RainbowKit.

---
*Dokumen ini merupakan catatan teknis internal engineering dan dipisahkan murni dari buku panduan pengguna akhir.*

