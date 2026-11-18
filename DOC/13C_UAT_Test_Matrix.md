# USER ACCEPTANCE TESTING (UAT) PROTOCOL & VERIFICATION WORKBOOK
> **13C Crypto Payment Gateway System**  
> **Klasifikasi:** Quality Assurance, UAT Test Execution Protocol & Client Acceptance Matrix  
> **Versi:** 2.1.0 | **Tanggal:** November 2026 | **Status UAT:** READY FOR CLIENT TESTING  
> **Repositori:** [github.com/gonzhilaz/bpg](https://github.com/gonzhilaz/bpg)

---

## 1. Executive Summary & RAG Readiness Status

Dokumen ini adalah **Protokol dan Lembar Kerja Pengujian Penerimaan Pengguna (*User Acceptance Testing / UAT*)** resmi untuk memandu pemilik bisnis / klien dalam menguji, memverifikasi, dan menandatangani serah terima sistem **13C Crypto Payment Gateway**.

### Status Kesiapan RAG (Red - Amber - Green)
* 🟢 **Internal Engineering & SIT (System Integration Testing):** 100% Lolos pengujian unit, integrasi database riil, dan analisis statis (`go test`, `go vet`, `tsc --noEmit`).
* 🟡 **Client User Acceptance Testing (UAT):** **READY FOR TESTING**. Lembar kerja ini disiapkan agar pemilik / klien dapat memvalidasi langsung setiap skenario di lingkungan staging/sandbox sebelum *production sign-off*.
* 🔴 **Cacat Kritis (P1 / P2):** Nol cacat kritis yang teridentifikasi pada pengujian internal developer.

| Modul Sistem | Status SIT Developer | Status UAT Klien | Total Skenario | Hasil Verifikasi Klien |
| :--- | :---: | :---: | :---: | :---: |
| **Merchant Authentication & Security** | 🟢 VERIFIED | 🟡 READY FOR TEST | 3 | [   ] PENDING TESTING |
| **Multi-Chain Invoice Creation Engine** | 🟢 VERIFIED | 🟡 READY FOR TEST | 4 | [   ] PENDING TESTING |
| **Blockchain Watcher & Finality Lag** | 🟢 VERIFIED | 🟡 READY FOR TEST | 3 | [   ] PENDING TESTING |
| **Instant Auto-Sweeper & Settlement** | 🟢 VERIFIED | 🟡 READY FOR TEST | 3 | [   ] PENDING TESTING |
| **Fee Payer & Gateway Fee (%) Calculation** | 🟢 VERIFIED | 🟡 READY FOR TEST | 2 | [   ] PENDING TESTING |
| **HMAC-SHA256 Webhook & Anti-SSRF** | 🟢 VERIFIED | 🟡 READY FOR TEST | 3 | [   ] PENDING TESTING |
| **Financial Ledger & CSV Export** | 🟢 VERIFIED | 🟡 READY FOR TEST | 2 | [   ] PENDING TESTING |
| **Super Admin Telemetry & DB Maintenance** | 🟢 VERIFIED | 🟡 READY FOR TEST | 3 | [   ] PENDING TESTING |
| **TOTAL KESELURUHAN** | 🟢 **100% SIT PASSED** | 🟡 **READY FOR TEST** | **23** | **MENUNGGU UJI RIIL KLIEN** |

---

## 2. Skala Keparahan Cacat (*Defect Severity Scale*)

Klien dapat mencatat setiap temuan anomali selama pengujian berdasarkan kriteria berikut:
* **P1 (Blocker):** Kerusakan fatal, kebocoran dana kripto, kebocoran private key, atau transaksi macet total. *Toleransi serah terima: 0.*
* **P2 (Critical):** Fungsi utama tidak berjalan (misal: webhook tidak terkirim sama sekali atau deposit tidak terdeteksi). *Toleransi serah terima: 0.*
* **P3 (Major):** Fitur berjalan namun terdapat inkonsistensi minor yang memiliki solusi sementara (*workaround*).
* **P4 (Minor):** Masalah kosmetik antarmuka, tata letak teks, atau label.

---

## 3. Matriks Pengujian Formal (UAT Execution Matrix)

Gunakan tabel lembar kerja ini saat melakukan pengujian interaktif langsung pada antarmuka dan API:

| TC_ID | Modul | Skenario Pengujian | Langkah Pengujian Riil | Payload / Input | Kriteria Hasil yang Diharapkan | Hasil Uji Riil Klien | Status UAT | Paraf |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-AUTH-01** | Merchant Auth | Pendaftaran merchant baru & Reveal Once API Key | 1. Buka `/register`<br>2. Masukkan nama toko, email, password<br>3. Submit form | Nama toko, email unik, password >= 6 karakter | Modal Reveal Once menampilkan API Key & Webhook Secret satu kali saja; hash SHA-256 tersimpan di database. | | [ ] PASS<br>[ ] FAIL | |
| **TC-AUTH-02** | Merchant Auth | Otentikasi login merchant dengan JWT | 1. Buka `/login`<br>2. Masukkan email & password terdaftar | Email & password terdaftar | Berhasil login, diarahkan ke Dashboard, sesi login tersimpan. | | [ ] PASS<br>[ ] FAIL | |
| **TC-AUTH-03** | Merchant Auth | Pembaruan dompet Cold Wallet payout | 1. Buka menu `/wallets`<br>2. Masukkan alamat BSC, Polygon, TRON, Solana<br>3. Klik Simpan | Alamat dompet valid untuk 4 jaringan | Data tersimpan permanen di database riil; tombol menampilkan feedback visual tersimpan. | | [ ] PASS<br>[ ] FAIL | |
| **TC-INV-01** | Invoicing | Pembuatan invoice BSC (BEP-20 USDT) | Buat invoice via REST API atau menu tagihan | `order_id`, `amount`, `pay_network: BSC` | Deposit address `0x...` unik terbentuk, private key terenkripsi AES-256-GCM, QR code valid. | | [ ] PASS<br>[ ] FAIL | |
| **TC-INV-02** | Invoicing | Pembuatan invoice Polygon (ERC-20 USDT) | Buat invoice untuk Polygon PoS | `amount`, `pay_network: POLYGON` | Deposit address Polygon unik terbentuk, timer countdown aktif. | | [ ] PASS<br>[ ] FAIL | |
| **TC-INV-03** | Invoicing | Pembuatan invoice TRON (TRC-20 USDT) | Buat invoice untuk TRON Network | `amount`, `pay_network: TRON` | Address Base58 diawali huruf `T` terbentuk, terpantau watcher. | | [ ] PASS<br>[ ] FAIL | |
| **TC-INV-04** | Invoicing | Pembuatan invoice Solana (SPL USDC) | Buat invoice untuk Solana Network | `amount`, `pay_network: SOLANA` | Address Ed25519 Base58 terbentuk, status `PENDING`. | | [ ] PASS<br>[ ] FAIL | |
| **TC-WAT-01** | Watcher | Deteksi transaksi on-chain & lag konfirmasi | Kirim transfer deposit uji ke alamat tagihan | Transfer kripto sesuai nominal tagihan | Watcher mendeteksi transaksi, status berubah `DETECTED`, setelah konfirmasi blok terpenuhi status menjadi `PAID`. | | [ ] PASS<br>[ ] FAIL | |
| **TC-WAT-02** | Watcher | Filter log 32-byte EVM anti-overflow | Watcher memindai transfer pada RPC publik | Volume transfer publik di jaringan | RPC tidak melempar error 10,000 log overflow karena filter topic 32-byte aktif. | | [ ] PASS<br>[ ] FAIL | |
| **TC-WAT-03** | Watcher | Penanganan toleransi kurang bayar (*Underpaid*) | Kirim nominal dengan selisih kecil dalam batas toleransi | Pembayaran 49.50 USDT untuk tagihan 50 USDT (toleransi 1%) | Status invoice tetap ditandai `PAID` karena masih dalam batas toleransi merchant. | | [ ] PASS<br>[ ] FAIL | |
| **TC-SWP-01** | Sweeper | Penyapuan instan ke Cold Wallet merchant | Selesaikan pelunasan invoice | Saldo token berada di deposit address | Dana otomatis disapu ke PayoutAddress merchant, tx hash tercatat di `payout_transfers`. | | [ ] PASS<br>[ ] FAIL | |
| **TC-SWP-02** | Sweeper | Distributed Lock anti-double sweep | Simulasi dua event konfirmasi blok bersamaan | 2 pemicu konfirmasi paralel | Mutex lock menolak transaksi kedua secara idempoten; hanya 1 proses sweep dieksekusi. | | [ ] PASS<br>[ ] FAIL | |
| **TC-SWP-03** | Sweeper | Proteksi saldo debu (*Dust Protection*) | Deposit address memiliki sisa saldo < 1 USDT | Saldo sangat kecil di bawah estimasi biaya gas | Sweeper melewati deposit debu agar tidak menguras saldo gas Hot Wallet secara merugikan. | | [ ] PASS<br>[ ] FAIL | |
| **TC-FEE-01** | Fee Engine | Aturan Fee Payer: Customer Surcharge | Buat tagihan dengan `fee_payer = "customer"` | `amount = 100`, estimasi gas = `0.05` | Pelanggan membayar `100.05 USDT`; merchant menerima bersih `100.00 USDT`. | | [ ] PASS<br>[ ] FAIL | |
| **TC-FEE-02** | Fee Engine | Perhitungan Fee Gateway (%) Dinamis | Verifikasi potongan fee gateway pada buku besar | Transaksi bruto dengan persentase fee platform | Laporan menampilkan potongan `Fee Gateway (%)` sesuai konfigurasi sistem tanpa angka hardcoded. | | [ ] PASS<br>[ ] FAIL | |
| **TC-WHK-01** | Webhook | Validasi tanda tangan digital HMAC-SHA256 | Backend toko menerima callback `INVOICE_PAID` | Header `X-13C-Signature` dan raw payload | Signature cocok dengan HMAC-SHA256 yang dihitung toko menggunakan Webhook Secret. | | [ ] PASS<br>[ ] FAIL | |
| **TC-WHK-02** | Webhook | Proteksi SSRF terhadap IP privat & metadata | Daftarkan webhook URL ke `http://127.0.0.1` atau `169.254.169.254` | Webhook URL berupa IP lokal loopback atau AWS metadata | Dispatcher menolak pengiriman dan mencatat error pencegahan SSRF. | | [ ] PASS<br>[ ] FAIL | |
| **TC-WHK-03** | Webhook | Exponential backoff retry saat server toko offline | Simulasi server toko mengembalikan HTTP 500 | Pengiriman webhook gagal | Dispatcher menjadwalkan ulang pengiriman bertingkat hingga 5x percobaan; tombol Manual Replay aktif. | | [ ] PASS<br>[ ] FAIL | |
| **TC-REP-01** | Financial | Agregasi buku besar keuangan dari database riil | Buka menu `/reports` pada Merchant Dashboard | Transaksi riil di database | Menampilkan Gross Sales, Net Settled, Fee Gateway (%), dan Sweep Gas terhitung akurat dari DB riil. | | [ ] PASS<br>[ ] FAIL | |
| **TC-REP-02** | Financial | Ekspor laporan pembukuan ke format CSV | Klik tombol "Export CSV" pada kartu Financial Ledger | Filter rentang waktu `30D` | File CSV terunduh otomatis memuat data mutasi keuangan bersih. | | [ ] PASS<br>[ ] FAIL | |
| **TC-ADM-01** | Super Admin | Monitoring cadangan gas Hot Wallet platform | Buka menu `/gas` pada Admin Console | Saldo native BNB, POL, TRX, SOL pada Hot Wallet | Menampilkan saldo live Hot Wallet dengan peringatan jika cadangan gas menipis. | | [ ] PASS<br>[ ] FAIL | |
| **TC-ADM-02** | Super Admin | Database Maintenance & Pemangkasan Pruner | Buka menu `/database` dan klik "Run Prune" | Data tagihan kedaluwarsa berusia > 30 hari | Record basi terhapus dari database tanpa mengunci tabel (*zero table lock*). | | [ ] PASS<br>[ ] FAIL | |
| **TC-ADM-03** | Super Admin | Emergency Circuit Breaker (Pembekuan Darurat) | Pemicu saklar darurat pada Admin Console | Status darurat diaktifkan oleh Admin | Pembuatan tagihan baru dan seluruh proses auto-sweeper dibekukan seketika demi keselamatan dana. | | [ ] PASS<br>[ ] FAIL | |

---

## 4. Lembar Berita Acara Serah Terima (*Acceptance Sign-Off Certificate*)

Lembar berita acara ini ditandatangani bersama setelah seluruh skenario pengujian riil di atas diselesaikan dan diverifikasi oleh pihak klien/pembeli:

### Pernyataan Bersama
Dengan ini dinyatakan bahwa pengujian penerimaan pengguna (*User Acceptance Testing*) terhadap perangkat lunak **13C Crypto Payment Gateway Versi 2.1.0** telah dilaksanakan. Sistem diserahkan dalam kondisi baik, tanpa cacat kritis terbuka (P1/P2), dan siap dioperasikan secara mandiri (*self-hosted*).

<br>

| PIHAK PENGEMBANG / PENJUAL | PIHAK KLIEN / PEMBELI SISTEM |
| :--- | :--- |
| **Nama:** ___________________________ | **Nama:** ___________________________ |
| **Jabatan:** Lead Architect / Vendor | **Jabatan:** Platform Owner / Buyer |
| **Tanggal:** ___________________________ | **Tanggal:** ___________________________ |
| **Tanda Tangan:**<br><br><br>___________________________ | **Tanda Tangan:**<br><br><br>___________________________ |
| **Status Akhir:** [ ] APPROVED FOR PRODUCTION | **Status Akhir:** [ ] ACCEPTED & SIGNED OFF |
