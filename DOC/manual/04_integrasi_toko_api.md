---

## BAB 4: TUTORIAL INTEGRASI TOKO ONLINE (MERCHANT INTEGRATION)

### 4.1 Pembuatan Tagihan via REST API
Untuk menerbitkan invoice kripto dari server backend toko online Anda, kirimkan permintaan HTTP `POST` ke endpoint `/api/v1/invoices` dengan menyertakan header otentikasi `X-API-KEY`.

#### Spesifikasi Endpoint:
* **Method:** `POST`
* **URL:** `http://localhost:8080/api/v1/invoices` (atau domain produksi gateway Anda)
* **Headers:**
  * `Content-Type: application/json`
  * `X-API-KEY: <API_KEY_MERCHANT_ANDA>`

#### Contoh Payload Request (JSON):
```json
{
  "order_id": "ORDER-20261121-001",
  "amount": 25.50,
  "currency": "USDT",
  "pay_network": "BSC",
  "fee_payer": "customer",
  "customer_email": "buyer@example.com"
}
```

#### Contoh Implementasi Multi-Bahasa:

##### A. Menggunakan cURL (Command Line / Bash)
```bash
curl -X POST http://localhost:8080/api/v1/invoices \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: 13c_live_samplekey1234567890abcdef" \
  -d '{
    "order_id": "INV-1001",
    "amount": 10.00,
    "currency": "USDT",
    "pay_network": "TRON",
    "fee_payer": "customer"
  }'
```

##### B. Menggunakan Node.js / JavaScript (Fetch API)
```javascript
const response = await fetch("http://localhost:8080/api/v1/invoices", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": process.env.PAYMENT_GATEWAY_API_KEY
  },
  body: JSON.stringify({
    order_id: "ORD-9901",
    amount: 50.00,
    currency: "USDT",
    pay_network: "POLYGON",
    fee_payer: "merchant"
  })
});

const data = await response.json();
console.log("Deposit Address:", data.deposit_address);
console.log("Checkout URL:", data.checkout_url);
```

##### C. Menggunakan PHP (cURL Native)
```php
<?php
$ch = curl_init('http://localhost:8080/api/v1/invoices');
$payload = json_encode([
    'order_id'    => 'ORD-PHP-8812',
    'amount'      => 15.00,
    'currency'    => 'USDT',
    'pay_network' => 'BSC',
    'fee_payer'   => 'customer'
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-KEY: ' . getenv('13C_API_KEY')
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

$invoice = json_decode($result, true);
header('Location: ' . $invoice['checkout_url']);
exit;
```

##### D. Menggunakan Python (Requests)
```python
import os, requests

url = "http://localhost:8080/api/v1/invoices"
headers = {
    "Content-Type": "application/json",
    "X-API-KEY": os.getenv("C13_API_KEY")
}
payload = {
    "order_id": "PY-ORDER-502",
    "amount": 100.0,
    "currency": "USDT",
    "pay_network": "SOLANA",
    "fee_payer": "customer"
}

resp = requests.post(url, json=payload, headers=headers)
print(resp.json())
```

### 4.2 Menampilkan Checkout Widget ke Pelanggan
Toko online memiliki 3 pilihan fleksibel dalam menampilkan antarmuka pembayaran:
1. **Direct Redirect:** Mengarahkan pembeli langsung ke URL yang dikembalikan API (`data.checkout_url`).
2. **Embedded iFrame:** Menyematkan tampilan checkout di dalam kontainer halaman toko:
   ```html
   <iframe src="http://localhost:8080/checkout?invoice=INV-UUID" width="100%" height="650px" frameborder="0"></iframe>
   ```
3. **Modal Overlay:** Membuka widget sebagai *pop-up dialog* di atas halaman keranjang belanja menggunakan JavaScript SDK.

### 4.3 Penanganan & Validasi Webhook (HMAC-SHA256)
Setiap kali status pembayaran berubah (`PAID`, `UNDERPAID`, `EXPIRED`), backend 13C mengirimkan notifikasi HTTP `POST` ke Webhook URL toko Anda.
Untuk memastikan payload benar-benar berasal dari sistem 13C dan belum diubah di tengah jalan, sistem menyematkan tanda tangan kriptografis pada header HTTP: `X-13C-Signature`.

#### Contoh Verifikasi Tanda Tangan Webhook di Node.js:
```javascript
const crypto = require("crypto");

app.post("/api/payment-callback", (req, res) => {
  const signature = req.headers["x-13c-signature"];
  const rawBody = JSON.stringify(req.body);
  const webhookSecret = process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).send("Invalid Webhook Signature!");
  }

  const { event, order_id, amount, status, tx_hash } = req.body;
  if (status === "PAID") {
    // Update status pesanan di database toko Anda menjadi 'Sudah Dibayar'
    markOrderAsPaid(order_id, tx_hash);
  }

  // Wajib kembalikan HTTP 200 OK agar gateway tidak mengulang pengiriman
  res.status(200).json({ received: true });
});
```

### 4.4 Plugin Resmi WooCommerce WordPress
Bagi toko online yang menggunakan platform WordPress WooCommerce:
1. Salin folder plugin `plugins/woocommerce-13c-gateway` ke direktori `wp-content/plugins/` di server WordPress Anda.
2. Buka **WP Admin -> Plugins -> Installed Plugins**, lalu klik **Activate** pada *13C Crypto Gateway for WooCommerce*.
3. Buka **WooCommerce -> Settings -> Payments -> 13C Crypto Gateway**.
4. Masukkan **Gateway API URL**, **API Key**, dan **Webhook Secret**.
5. Simpan pengaturan. Metode pembayaran kripto multi-chain kini aktif di halaman *checkout* WooCommerce Anda.
