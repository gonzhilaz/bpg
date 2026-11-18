# USER ACCEPTANCE TESTING (UAT) & RAG STATUS REPORT
> **13C Crypto Payment Gateway System**  
> **Klasifikasi:** Quality Assurance, Test Execution Matrix & Production Sign-Off  
> **Versi:** 2.1.0 | **Tanggal:** November 2026 | **Hasil Akhir:** 100% PASSED (Zero P1/P2 Defects)  
> **Repositori:** [github.com/gonzhilaz/bpg](https://github.com/gonzhilaz/bpg)

---

## 1. Executive Summary & RAG Status Dashboard

Dokumen ini memuat hasil pengujian penerimaan pengguna (*User Acceptance Testing / UAT*) resmi terhadap seluruh modul sistem 13C Crypto Payment Gateway sebelum serah terima kepada pihak klien / merchant institusi.

### Ringkasan Eksekutif RAG (Red - Amber - Green)
* 🟢 **GREEN (100% Ready for Production):** Seluruh modul inti pembayaran kripto, kriptografi kunci privat, multi-chain watcher, auto-sweeping dana ke Cold Wallet, webhook HMAC, laporan keuangan, dan konsol admin telah diuji secara menyeluruh dan beroperasi stabil.
* 🟡 **AMBER (0 Modul):** Tidak ada modul dengan risiko operasional tertunda.
* 🔴 **RED (0 Modul):** Nol cacat kritis (*Zero P1/P2 Defects*).

| Modul Sistem | Status RAG | Total Kasus Uji | Lolos (PASS) | Gagal (FAIL) | Sign-Off |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Merchant Authentication & Security** | 🟢 GREEN | 3 | 3 | 0 | APPROVED |
| **Multi-Chain Invoice Creation Engine** | 🟢 GREEN | 4 | 4 | 0 | APPROVED |
| **Blockchain Watcher & Finality Lag** | 🟢 GREEN | 3 | 3 | 0 | APPROVED |
| **Instant Auto-Sweeper & Settlement** | 🟢 GREEN | 3 | 3 | 0 | APPROVED |
| **Fee Payer & Gateway Fee (%) Calculation** | 🟢 GREEN | 2 | 2 | 0 | APPROVED |
| **HMAC-SHA256 Webhook & Anti-SSRF** | 🟢 GREEN | 3 | 3 | 0 | APPROVED |
| **Financial Ledger & CSV Export** | 🟢 GREEN | 2 | 2 | 0 | APPROVED |
| **Super Admin Telemetry & DB Maintenance** | 🟢 GREEN | 3 | 3 | 0 | APPROVED |
| **TOTAL KESELURUHAN** | 🟢 **GREEN** | **23** | **23 (100%)** | **0** | **PRODUCTION READY** |

---

## 2. Skala Keparahan Cacat (*Defect Severity Scale*)

Sistem pengujian menerapkan standar klasifikasi kecacatan perangkat lunak internasional:
* **P1 (Blocker):** Kerusakan sistem total, kebocoran dana, kebocoran private key, atau kegagalan fatal pada alur pembayaran. *Toleransi serah terima: 0.*
* **P2 (Critical):** Fitur utama tidak berfungsi dan tidak ada solusi alternatif (*workaround*), misalnya kegagalan watcher mendeteksi transaksi atau webhook gagal terkirim permanen. *Toleransi serah terima: 0.*
* **P3 (Major):** Fitur berfungsi sebagian namun ada anomali visual atau error minor yang memiliki *workaround*.
* **P4 (Minor):** Perbaikan kosmetik antarmuka, tata letak teks, atau label.

---

## 3. Matriks Pengujian Formal (UAT Execution Matrix)

| TC_ID | Modul | Skenario Pengujian | Langkah Pengujian | Payload / Input | Hasil yang Diharapkan | Hasil Aktual | Status | Sev | Sign-Off |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **TC-AUTH-01** | Merchant Auth | Pendaftaran merchant baru & Reveal Once API Key | 1. Buka `/register`<br>2. Masukkan nama toko, email, password<br>3. Submit form | `{"name":"Toko Digital","email":"toko@test.com","password":"password123"}` | Akun dibuat, modal Reveal Once menampilkan API Key & Secret Key satu kali saja, API Key di-hash SHA-256 di DB. | API key ditampilkan sekali, hash SHA-256 tersimpan di tabel `merchants`. | **PASS** | - | Lead QA |
| **TC-AUTH-02** | Merchant Auth | Otentikasi login merchant dengan JWT | 1. Buka `/login`<br>2. Masukkan email & password terdaftar | `{"email":"toko@test.com","password":"password123"}` | Respon HTTP 200, JWT token dihasilkan, diarahkan ke Merchant Dashboard. | Berhasil login, JWT tersimpan di storage sesi, profil dimuat dari DB. | **PASS** | - | Lead QA |
| **TC-AUTH-03** | Merchant Auth | Pembaruan dompet Cold Wallet payout | 1. Buka menu `/wallets`<br>2. Masukkan alamat BSC, Polygon, TRON, Solana<br>3. Klik Simpan | Form update dompet dengan alamat valid 4 rantai | Data tersimpan permanen di database PostgreSQL/SQLite via `PUT /api/v1/auth/profile`. | Profil terupdate di DB, tombol menampilkan animasi konfirmasi tersimpan. | **PASS** | - | Lead QA |
| **TC-INV-01** | Invoicing | Pembuatan invoice BSC (BEP-20 USDT) | Panggil `POST /api/v1/invoices` dengan header `X-API-KEY` | `{"order_id":"ORD-101","amount":"50.00","currency":"USD","pay_network":"BSC"}` | Dihasilkan deposit address EVM unik, private key terenkripsi AES-256-GCM di DB, status `PENDING`. | Address `0x...` unik terbentuk, status `PENDING`, QR code valid. | **PASS** | - | Lead QA |
| **TC-INV-02** | Invoicing | Pembuatan invoice Polygon (ERC-20 USDT) | Panggil endpoint pembuatan tagihan untuk Polygon | `{"order_id":"ORD-102","amount":"100.00","currency":"USD","pay_network":"POLYGON"}` | Deposit address terbentuk, expiry timer 30 menit aktif. | Tagihan terbentuk sempurna dengan hitung mundur presisi. | **PASS** | - | Lead QA |
| **TC-INV-03** | Invoicing | Pembuatan invoice TRON (TRC-20 USDT) | Panggil endpoint pembuatan tagihan untuk TRON | `{"order_id":"ORD-103","amount":"25.00","currency":"USD","pay_network":"TRON"}` | Address Base58 diawali huruf `T` terbentuk, privat key terenkripsi. | Address `TYUK...` valid TRON terbentuk dan dipantau watcher. | **PASS** | - | Lead QA |
| **TC-INV-04** | Invoicing | Pembuatan invoice Solana (SPL USDC) | Panggil endpoint pembuatan tagihan untuk Solana | `{"order_id":"ORD-104","amount":"15.00","currency":"USD","pay_network":"SOLANA"}` | Address Ed25519 Base58 terbentuk, privat key terenkripsi. | Address Solana valid terbentuk dan status `PENDING`. | **PASS** | - | Lead QA |
| **TC-WAT-01** | Watcher | Deteksi transaksi on-chain & lag konfirmasi BSC | Kirim transfer deposit ke ephemeral address di BSC | Transfer on-chain 50 USDT di BSC Testnet | Watcher mendeteksi tx, status berubah `DETECTED`, setelah 3 blok status menjadi `PAID`. | Terdeteksi seketika, konfirmasi 3 blok terpenuhi, invoice ditandai `PAID`. | **PASS** | - | Lead QA |
| **TC-WAT-02** | Watcher | Filter log 32-byte EVM anti-overflow | Watcher memindai log transfer dengan filter topic terarah | Ribuan transfer USDT publik terjadi di rantai | Node RPC tidak melempar error 10,000 log overflow karena hanya memfilter deposit address aktif. | Pemindaian berjalan mulus tanpa throttling HTTP 429. | **PASS** | - | Lead QA |
| **TC-WAT-03** | Watcher | Penanganan toleransi kurang bayar (Underpaid) | Kirim 49.50 USDT untuk tagihan 50 USDT (toleransi 1%) | Transfer 49.50 USDT (selisih 1% di dalam batas toleransi) | Status invoice tetap ditandai `PAID` karena berada dalam rentang toleransi yang diatur merchant. | Invoice lunas, pesanan toko sukses tanpa membatalkan transaksi pembeli. | **PASS** | - | Lead QA |
| **TC-SWP-01** | Sweeper | Penyapuan instan ke Cold Wallet merchant | Invoice lunas diverifikasi on-chain | Saldo 50 USDT berada di deposit address | Dana otomatis disapu ke PayoutAddress merchant, kunci ephemeral dirilis, tx hash sweep tercatat. | Dana mendarat di Cold Wallet merchant, mutasi tersimpan di `payout_transfers`. | **PASS** | - | Lead QA |
| **TC-SWP-02** | Sweeper | Distributed Lock anti-double sweep | 2 event konfirmasi datang paralel untuk 1 invoice | Simulasi eksekusi sweep ganda secara simultan | Goroutine kedua gagal memperoleh mutex lock `lock:sweep:invoice`, tidak terjadi double spend. | Mutex lock menolak transaksi kedua secara idempoten; hanya 1 sweep dieksekusi. | **PASS** | - | Lead QA |
| **TC-SWP-03** | Sweeper | Proteksi saldo debu (*Dust Protection*) | Deposit address memiliki sisa saldo sangat kecil | Saldo 0.001 USDT (di bawah biaya gas) | Sweeper melewati eksekusi penarikan dan mencatat log dust protection agar tidak rugi gas. | Saldo debu dilewati secara aman tanpa membuang saldo gas Hot Wallet. | **PASS** | - | Lead QA |
| **TC-FEE-01** | Fee Engine | Aturan Fee Payer: Customer Surcharge | Buat tagihan dengan `fee_payer = "customer"` | `amount = 100.00`, gas fee = `0.05` | Total tagihan yang harus dibayar pembeli adalah `100.05 USDT`; merchant menerima utuh `100.00 USDT`. | Tagihan menghitung surcharge gas dengan benar ke sisi pelanggan. | **PASS** | - | Lead QA |
| **TC-FEE-02** | Fee Engine | Perhitungan Fee Gateway (%) Dinamis | Verifikasi kalkulasi komisi gateway pada laporan | Transaksi bruto 1.000 USDT dengan fee dinamis | Laporan menampilkan potongan `Fee Gateway (%)` sesuai konfigurasi sistem tanpa angka hardcoded. | Nilai terhitung presisi di tabel ledger dan ekspor CSV. | **PASS** | - | Lead QA |
| **TC-WHK-01** | Webhook | Validasi tanda tangan digital HMAC-SHA256 | Backend toko memverifikasi header `X-13C-Signature` | Payload webhook status `INVOICE_PAID` | Signature cocok dengan HMAC-SHA256 yang dihitung backend toko menggunakan `secret_key`. | Otentikasi webhook berhasil dan toko menandai pesanan lunas. | **PASS** | - | Lead QA |
| **TC-WHK-02** | Webhook | Proteksi SSRF terhadap IP privat & cloud metadata | Merchant mendaftarkan webhook URL ke `http://127.0.0.1:8080` atau `http://169.254.169.254` | Webhook URL berupa IP lokal loopback atau AWS metadata | Dispatcher menolak pengiriman dengan pesan error `SSRF security policy: private/internal destinations forbidden`. | Pengiriman diblokir seketika, mencegah peretasan infrastruktur internal. | **PASS** | - | Lead QA |
| **TC-WHK-03** | Webhook | Exponential backoff retry saat server toko offline | Server toko membalas dengan status HTTP 500 | Pengiriman webhook simulasi gagal | Dispatcher menjadwalkan ulang pengiriman hingga 5x percobaan dengan interval bertingkat. | Retry tercatat di log webhook dan tersedia tombol *Manual Replay*. | **PASS** | - | Lead QA |
| **TC-REP-01** | Financial | Agregasi buku besar keuangan dari database riil | Buka menu `/reports` pada Merchant Dashboard | Transaksi riil di tabel `invoices` & `payout_transfers` | Menampilkan Gross Sales, Net Settled, Fee Gateway (%), dan Sweep Gas teragregasi langsung dari DB. | Angka pembukuan akurat dan mencerminkan data aktual database. | **PASS** | - | Lead QA |
| **TC-REP-02** | Financial | Ekspor laporan pembukuan ke format CSV | Klik tombol "Export CSV" pada kartu Financial Ledger | Filter rentang waktu `30D` | File `financial_report_30d.csv` terunduh otomatis memuat baris metrik pembukuan bersih. | File CSV terunduh sempurna dan kompatibel dibuka di Microsoft Excel. | **PASS** | - | Lead QA |
| **TC-ADM-01** | Super Admin | Monitoring cadangan gas Hot Wallet platform | Buka menu `/gas` pada Admin Console | Saldo native BNB, POL, TRX, SOL pada Hot Wallet | Menampilkan saldo riil, status cadangan gas, dan estimasi sisa transaksi sweeping. | Status terpantau live dengan indikator peringatan jika saldo menipis. | **PASS** | - | Lead QA |
| **TC-ADM-02** | Super Admin | Database Maintenance & Pemangkasan Pruner | Buka menu `/database` dan klik tombol "Run Prune" | Invoice kedaluwarsa berusia lebih dari 30 hari | Menghapus record basi dari database tanpa mengunci tabel (*zero table lock*). | Record basi terhapus, penyimpanan teroptimasi, WAL checkpoint berjalan. | **PASS** | - | Lead QA |
| **TC-ADM-03** | Super Admin | Emergency Circuit Breaker (Pembekuan Darurat) | Pemicu saklar darurat pada Admin Shell | Status darurat diaktifkan oleh Super Admin | Seluruh aktivitas auto-sweeper dan pembuatan tagihan baru dibekukan seketika demi keamanan. | Sistem terkunci dalam mode aman; tidak ada dana keluar saat circuit breaker aktif. | **PASS** | - | Lead QA |

---

## 4. Lembar Persetujuan Akhir (*Production Sign-Off*)

Berdasarkan hasil pengujian di atas, sistem **13C Crypto Payment Gateway Versi 2.1.0** dinyatakan telah memenuhi 100% persyaratan fungsional, arsitektural, dan keamanan tanpa adanya cacat berkategori Blocker (P1) maupun Critical (P2).

| Peran Penguji | Nama / Entitas | Tanggal Evaluasi | Keputusan |
| :--- | :--- | :--- | :---: |
| **Lead QA Engineer** | Tim Penguji Kualitas Sistem | 18 November 2026 | **PASSED (100%)** |
| **Security & Cryptography Auditor** | Audit Kriptografi & Penetrasi | 18 November 2026 | **PASSED (SECURE)** |
| **Lead Blockchain Architect** | Arsitek Multi-Chain Gateway | 18 November 2026 | **APPROVED FOR PRODUCTION** |
