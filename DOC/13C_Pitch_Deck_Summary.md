# RESUME: 13C Crypto Payment Gateway
> **Panduan Operasional & Dokumentasi Ringkas (Pitch Deck Summary)**  
> **Versi:** 1.3.0 | **Tanggal:** November 2026 | **Klasifikasi:** Executive Summary & Integration Guide  
> **Repositori:** [github.com/gonzhilaz/bpg](https://github.com/gonzhilaz/bpg)

---

## 1. Apa itu 13C?
Infrastruktur payment gateway berbasis cryptocurrency untuk toko online / merchant e-commerce, yang memungkinkan penerimaan pembayaran kripto (USDT & USDC) dengan arsitektur **non-custodial** murni.

* **Fokus Utama:** Kemandirian finansial toko online tanpa perantara penahan dana.
* **Aset Didukung:** Stablecoin USDT & USDC (pilihan utama transaksi perdagangan global).
* **Target Pengguna:** Platform e-commerce, toko digital, SaaS, penyedia layanan online.

---

## 2. Konsep Utama
* **Non-Custodial Architecture:** Dana pelanggan tidak pernah diendapkan atau ditahan di dompet platform gateway.
* **Instant Direct Forwarding:** Pembayaran yang terkonfirmasi langsung disapu (*auto-swept*) detik itu juga ke Cold Wallet / Dompet Pribadi milik merchant.
* **Aman, Transparan & Multi-Chain:** Transaksi tercatat secara publik dan kekal di blockchain dengan struktur biaya jaringan terendah.

---

## 3. Alur Transaksi (Payment Lifecycle)
```
[1. Pelanggan Bayar] ➔ [2. Alur Ephemeral] ➔ [3. Verifikasi On-Chain] ➔ [4. Auto-Sweep ke Cold Wallet] ➔ [5. Notifikasi Webhook]
```
1. **Pelanggan Membayar:** Pelanggan memilih koin/jaringan dan mentransfer USDT/USDC.
2. **Alamat Invoice Khusus:** Sistem membuat alamat deposit sementara (*ephemeral keypair*) per invoice.
3. **Verifikasi On-Chain:** Engine mendeteksi setoran dan menunggu konfirmasi blok keamanan.
4. **Penyapuan Dana:** Saldo disapu secara otomatis ke dompet pribadi merchant.
5. **Notifikasi Toko:** Webhook bertanda tangan HMAC-SHA256 dikirim ke backend merchant secara instan.

---

## 4. Jaringan Blockchain yang Didukung

| Blockchain | Standar Token | Kecepatan Konfirmasi | Estimasi Biaya Sweep | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BSC (BNB Smart Chain)** | BEP-20 (USDT / USDC) | ~ 3 Detik | ~ $0.05 | Aktif (Produksi & Testnet) |
| **Polygon PoS** | ERC-20 (USDT / USDC) | ~ 2 Detik | ~ $0.02 | Aktif (Produksi & Amoy) |
| **TRON Network** | TRC-20 (USDT) | ~ 1 Detik | ~ $1.20 | Aktif (Produksi & Shasta) |
| **Solana** | SPL Token (USDC / USDT) | ~ 400 ms | ~ $0.01 | Aktif (Produksi & Devnet) |

---

## 5. Siklus Tagihan (Invoice Lifecycle)
1. **Pembuatan Keypair Baru:** Setiap invoice menghasilkan pasangan kunci unik (ECDSA secp256k1 untuk EVM/TRON, Ed25519 untuk Solana).
2. **Enkripsi Kunci Privat:** Kunci privat alamat invoice langsung dienkripsi dengan standar militer **AES-256-GCM** sebelum disimpan ke database.
3. **Masa Berlaku Invoice:** Tagihan aktif selama **15–30 menit**. Jika kedaluwarsa tanpa setoran, alamat otomatis dinonaktifkan guna mencegah polusi status.

---

## 6. Fitur Merchant Portal
* **Registrasi & API Key:** Pembuatan akun mandiri dengan pengamanan kunci API (*Reveal Once* - hanya ditampilkan satu kali).
* **Autentikasi & Navigasi:** Dashboard interaktif modern berbasis Next.js App Router dengan statistik real-time.
* **Konfigurasi Cold Wallet:** Pengaturan alamat penampungan utama dan aktivasi auto-forwarding instan.
* **Pengaturan Biaya Gas:** Fleksibilitas pembebanan gas sweep (*Customer Surcharge* atau *Merchant Absorbed*).
* **Laporan Keuangan & Ledger:** Rekapitulasi transaksi lengkap dengan ekspor laporan CSV/Excel.
* **Monitoring & Webhook Logs:** Pelacakan status transaksi live, payload webhook, dan tombol uji kirim ulang.

---

## 7. Integrasi & Pengujian
* **Integrasi Toko Online:**
  - Pembuatan tagihan via REST API sederhana (cURL, Node.js, PHP, Python, Go).
  - Integrasi Checkout Widget siap pakai untuk halaman pembayaran toko online.
  - Verifikasi keamanan webhook menggunakan tanda tangan digital HMAC-SHA256.
* **Lingkungan Pengujian:**
  - Sandbox simulator bawaan untuk simulasi pembayaran instan tanpa modal gas.
  - Dukungan transaksi on-chain nyata via faucet testnet (BSC Testnet, Polygon Amoy, TRON Shasta, Solana Devnet).

---

## 8. DevOps & Super Admin
* **Dashboard Monitoring Operasional:** Pantau metrik sistem, throughput transaksi, dan status node blockchain.
* **Manajemen Gas Hot Wallet:** Monitoring saldo native gas (BNB, POL, TRX, SOL) dengan sistem peringatan otomatis jika saldo menipis.
* **Penyapuan Dana Manual (Manual Sweeper):** Tombol darurat untuk menyapu tagihan jika terjadi kendala pada auto-sweep.
* **Pemeliharaan Database:** Optimasi pool koneksi PostgreSQL, vacuuming, dan pembersihan log kedaluwarsa.
* **Emergency Circuit Breaker:** Pembekuan instan untuk menghentikan seluruh aktivitas payout saat insiden keamanan terdeteksi.
* **Deployment Mandiri:** Dukungan penuh Docker Compose untuk instalasi di VPS privat mana pun.

---

## 9. Struktur Biaya Transparan
* **Biaya Gateway:** **Fee Gateway (%)** dinamis dapat diatur oleh Admin (transparan & kompetitif).
* **Opsi Self-Hosted Enterprise:** **0% Biaya Gateway** jika di-deploy penuh di server privat milik merchant sendiri.
* **Komponen Laporan Keuangan:**
  - **Gross Sales:** Total nominal transaksi bruto yang dibayar pelanggan.
  - **Net Settled:** Dana bersih yang diterima di dompet merchant.
  - **Platform Fee:** Biaya layanan gateway (Fee Gateway % dinamis).
  - **Sweep Gas:** Biaya riil jaringan blockchain untuk transaksi penarikan ke Cold Wallet.

---

## 10. Keamanan Sistem (Enterprise Security)
* **Penyimpanan Kredensial:** API Key disimpan dalam bentuk hash searah **SHA-256** (kunci asli tidak dapat dibaca dari database).
* **Enkripsi Kunci Privat:** Private key alamat invoice dienkripsi di level data menggunakan **AES-256-GCM**.
* **Keamanan Webhook:** Setiap notifikasi payload diproteksi header tanda tangan **HMAC-SHA256**.
* **Proteksi Reveal-Once:** API Key dan Webhook Secret hanya dimunculkan satu kali saat pembuatan.
* **Isolasi Non-Custodial:** Dana langsung berpindah ke Cold Wallet pribadi merchant tanpa risiko penahanan pihak ketiga.

---

## 11. Kesimpulan
13C Crypto Payment Gateway adalah solusi infrastruktur pembayaran kripto non-custodial generasi baru yang menggabungkan kemudahan integrasi e-commerce tradisional dengan keamanan terdesentralisasi. Sangat ideal untuk bisnis dan toko online yang menginginkan penerimaan pembayaran USDT/USDC lintas 4 blockchain terpopuler dengan kontrol penuh atas dana tanpa perantara pihak ketiga.

---

## 12. Keunggulan Utama & Catatan Kepatuhan

### Keunggulan Utama
1. **Multi-Chain 4 Jaringan:** BSC, Polygon, TRON, dan Solana dalam satu integrasi terpadu.
2. **Alamat Unik Per Invoice:** Pelacakan setoran otomatis tanpa dependensi pada Memo/Tag.
3. **Penyapuan Instan:** Likuiditas langsung masuk ke Cold Wallet pribadi merchant.
4. **SDK & API Lengkap:** Dokumentasi REST API, Checkout Widget, dan Webhook Handler yang mudah dipasang.
5. **Transparansi Biaya:** Model biaya persentase fleksibel (Fee Gateway %) atau 0% untuk instalasi mandiri.
6. **Model Jual Putus (Sovereign Ownership):** Hak kepemilikan komersial 100% atas source code & database tanpa biaya langganan bulanan (*zero SaaS fee*) dan bebas dari ketergantungan server lisensi eksternal (*Zero-Phone-Home*).

### Hal yang Perlu Diperhatikan
* **Audit Keamanan Mandiri:** Lakukan peninjauan keamanan berkala terhadap konfigurasi server dan Cold Wallet Anda.
* **Uji Coba End-to-End:** Selalu validasi alur pembayaran di Testnet/Sandbox sebelum merilis ke lingkungan produksi.
* **Penanganan Transaksi:** Siapkan SOP untuk menangani kondisi kurang bayar (*underpaid*), salah jaringan, atau kedaluwarsa.
* **Kepatuhan Regulasi:** Pastikan operasional bisnis mematuhi regulasi perpajakan dan keuangan setempat.
