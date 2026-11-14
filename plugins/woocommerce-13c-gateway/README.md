# 13C Crypto Payment Gateway for WooCommerce (WordPress Plugin)

Modul integrasi resmi untuk menerima pembayaran mata uang kripto (**USDT** pada jaringan **TRON TRC-20**, **BNB Smart Chain BEP-20**, **Polygon**, dan **Solana**) secara langsung di toko online berbasis **WooCommerce (WordPress)** tanpa potongan komisi pihak ketiga (*zero platform percentage fee*).

---

## 🚀 Fitur Unggulan

- **Multi-Chain USDT Settlement**: Mendukung TRON (TRC-20), BSC (BEP-20), Polygon (PoS), dan Solana (SPL).
- **Ephemeral Deposit Address**: Menghasilkan alamat setoran unik sekali pakai per pesanan untuk privasi maksimal dan kemudahan rekonsiliasi.
- **HMAC-SHA256 Cryptographic Webhooks**: Verifikasi tanda tangan digital untuk konfirmasi pelunasan otomatis secara instan (*auto-complete order*).
- **Fleksibilitas Biaya Gas (Fee Payer)**: Opsi pembebanan biaya gas sweeping kepada pembeli atau ditanggung oleh merchant.
- **Dukungan Underpaid & Grace Period**: Otomatis menangani toleransi kurang bayar dan konfirmasi blok tertunda.

---

## 📦 Panduan Instalasi Cepat

### Metode 1: Upload File ZIP (Rekomendasi)
1. Unduh arsip `woocommerce-13c-gateway.zip`.
2. Masuk ke halaman admin WordPress Anda: **Plugins** $\rightarrow$ **Add New Plugin** $\rightarrow$ **Upload Plugin**.
3. Pilih file `woocommerce-13c-gateway.zip`, klik **Install Now**, lalu klik **Activate Plugin**.

### Metode 2: Salin Manual via FTP / SSH
Salin direktori `woocommerce-13c-gateway` ke folder instalasi WordPress Anda:
```bash
wp-content/plugins/woocommerce-13c-gateway/
```
Kemudian aktifkan plugin melalui menu **Plugins** di WordPress Admin.

---

## ⚙️ Konfigurasi Gateway di WooCommerce

1. Buka menu **WooCommerce** $\rightarrow$ **Settings** $\rightarrow$ tab **Payments**.
2. Klik tombol **Manage** atau **Set up** pada baris **13C Crypto Payment Gateway**.
3. Isi parameter konfigurasi berikut:
   - **Enable/Disable**: Centang untuk mengaktifkan metode pembayaran.
   - **13C Gateway Endpoint URL**: Alamat backend server gateway Anda (contoh: `https://pay.tokoanda.com` atau `http://localhost:8080`).
   - **Merchant API Key**: Masukkan API Key Anda (diawali `13c_live_...` atau `13c_test_...`) dari Merchant Dashboard 13C.
   - **Merchant Secret Key**: Kunci rahasia untuk verifikasi tanda tangan HMAC-SHA256 callback webhook.
   - **Default Settlement Network**: Pilih jaringan default (TRON, BSC, Polygon, atau Solana).
   - **Blockchain Gas Fee Payer**: Pilih `Customer pays fee at checkout` atau `Merchant absorbs fee`.
4. Klik **Save Changes**.

---

## 🔔 Pengujian Callback Webhook

URL callback webhook toko online Anda secara otomatis terbentuk di:
```text
https://domain-toko-anda.com/?wc-api=wc_gateway_13c
```
Pastikan URL ini terdaftar pada kolom **Webhook URL** di Merchant Dashboard 13C Gateway Anda.

Saat pembayaran diverifikasi di blockchain:
1. Status tagihan berubah menjadi `invoice.paid`.
2. Webhook dikirim ke WooCommerce dengan tanda tangan `X-13C-Signature`.
3. Pesanan WooCommerce otomatis beralih dari status `on-hold` ke `processing` atau `completed`, stok berkurang, dan bukti hash transaksi (`tx_hash`) dicatat di riwayat catatan pesanan (*Order Notes*).

---

## 📄 Lisensi
Didistribusikan di bawah lisensi terbuka **MIT License**.
Dibuat untuk ekosistem **13C Crypto Payment Gateway**.
