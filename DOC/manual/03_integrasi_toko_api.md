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
