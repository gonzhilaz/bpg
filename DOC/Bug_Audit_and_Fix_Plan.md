# Laporan Audit Teknis, Bug History & Rencana Remediasi (Remediation Plan)

**Proyek**: 13C Crypto Payment Gateway  
**Tanggal Audit**: 14 November 2026  
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
| **BUG-008** | Contract Sync | File `demo-sandbox/src/app/sandbox/page.tsx` masih mengirimkan header `X-API-KEY: cap_demo_api_key_12345678`, menyebabkan HTTP 401 saat menguji simulator terhadap backend yang telah direbrand ke `13c_demo_api_key_12345678`. | 🔴 CRITICAL | ✅ Fixed | Header disinkronkan ke `13c_demo_api_key_12345678`; verifikasi simulator pembuatan invoice berjalan 100% sukses. |
| **BUG-009** | Decimal Math & Safety | Potensi crash division by zero pada `rate_service.go` saat menghitung konversi fiat `IDR` jika nilai tukar fallback bernilai nol. | 🔴 CRITICAL | ✅ Fixed | Ditambahkan defensive zero-check `if rate.IsZero() { rate = decimal.NewFromInt(16200) }` sebelum operasi `.Div(rate)`. |
| **BUG-010** | Goroutine Lifecycle | Fungsi pengiriman webhook `deliverWithRetry` menggunakan `time.Sleep` tanpa `context.Context` sehingga goroutine tidak dapat dibatalkan saat graceful shutdown. | 🟡 MAJOR | ✅ Fixed | Parameter `ctx context.Context` ditambahkan ke `deliverWithRetry` dan diganti menggunakan `select { case <-ctx.Done(): return; case <-time.After(backoff): }`. |
| **BUG-011** | Payment Link Metrics | Saat invoice yang berasal dari Payment Link (`LINK-pl_xxx`) diselesaikan/dibayar pelanggan, metrik `total_collected` dan `payment_count` pada link tersebut tidak terakumulasi secara atomik di database. | 🔴 CRITICAL | ✅ Fixed | Ditambahkan metode `RecordPaymentBySlug` pada `payment_link_repository.go` dan dipanggil secara otomatis di dalam `invoice_service.go` saat invoice berstatus `PAID`. Dilengkapi unit test `TestPaymentLink_MetricsIncrementOnInvoicePaid`. |
| **BUG-012** | Merchant Dashboard API Sync | Halaman No-Code Payment Links (`payment-links/page.tsx`) awalnya hanya mengupdate state in-memory lokal tanpa sinkronisasi live ke endpoint backend `GET /api/v1/payment-links`, `POST /api/v1/payment-links`, dan `PATCH /api/v1/payment-links/:id/toggle`. | 🟡 MAJOR | ✅ Fixed | Diintegrasikan API call asinkronus dengan token autentikasi merchant, status loading `isCreating` untuk mencegah double-click, serta fallback optimistik jika backend offline. Modal pembuatan diekstrak ke `CreatePaymentLinkModal.tsx` agar ukuran file tetap <= 400 baris. |
| **BUG-013** | Frontend Bundle Hygiene | Import `useEffect` tidak terpakai pada `admin/src/components/ui/Tooltip.tsx`. | 🟢 MINOR | ✅ Fixed | Unused import dihapus; `tsc --noEmit` diverifikasi bersih tanpa peringatan. |

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

