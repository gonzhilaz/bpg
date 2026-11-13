# 13C Payment Gateway — Enterprise Security & Credentials Manual

---

## 1. Zero Trust Security Architecture Overview

The **13C Payment Gateway** is engineered with a strict **Defense-in-Depth** and **Zero-Trust** security posture. In non-custodial crypto payment infrastructure, security is paramount because on-chain transactions are immutable and irreversible.

```mermaid
flowchart TD
    Client["Merchant App / Client"] -->|"1. TLS 1.3 / HTTPS"| Proxy["Next.js Reverse Proxy / BFF"]
    Proxy -->|"2. Internal Network (Masked API)"| Core["13C Go Gateway Core"]
    Core -->|"3. SHA-256 Hash Check"| DB[("PostgreSQL Cluster (SSL Mode)")]
    Core -->|"4. CSPRNG Signed Tx"| Nodes["Multi-Chain RPC Nodes (BSC, Polygon, TRON, Solana)"]
    Core -->|"5. HMAC-SHA256"| Webhook["Merchant Webhook Listener"]
```

---

## 2. Database Connection Architecture & Credentials

### 2.1 Principle of Least Privilege
The database cluster enforces role-based access. The application service must **never** connect as the PostgreSQL `postgres` superuser in production.

| Role | Username | Permissions | Usage |
| :--- | :--- | :--- | :--- |
| **App Service** | `pg_13c_app` | `SELECT, INSERT, UPDATE, DELETE` on operational tables | Main API & Watchers |
| **Migrations** | `pg_13c_migrator` | `CREATE, ALTER, DROP, REFERENCES` | CI/CD schema migration |
| **Read-Only / BI** | `pg_13c_ro` | `SELECT` on projection views | Financial ledger reports |

### 2.2 Connection String Format (SSL Enforced)
```env
# Production PostgreSQL Connection URI (Strict SSL Mode)
DATABASE_URL="postgres://pg_13c_app:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=verify-full&sslrootcert=/etc/ssl/certs/pg_ca.crt"

# Default Standalone Parameters
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_NAME="13c_gateway"
DB_USER="pg_13c_app"
DB_PASSWORD="${VAULT_STORED_SECURE_PASSWORD}"
DB_SSL_MODE="require"
```

### 2.3 High-Scale Connection Pool Configuration
```env
# Connection Pool Allocation Tuning
DB_MAX_OPEN_CONNS=100
DB_MAX_IDLE_CONNS=25
DB_CONN_MAX_LIFETIME="15m"
DB_CONN_MAX_IDLE_TIME="5m"
```

---

## 3. Merchant API Key & Authentication Architecture

### 3.1 Strict 1 Merchant = 1 API Key Model
* **CSPRNG Generation**: Keys are generated using 32 bytes of cryptographically secure random entropy:
  `13c_live_` + `hex_encode(crypto/rand.Read(32))`
* **Zero Plaintext Storage**: The database **never** stores the raw API key. It stores only the `SHA-256` hash of the key (`api_key_hash`), preventing credential exposure even in the event of an unauthorized database dump.
* **Reveal-Once Guarantee**: The raw key is returned exactly once during registration or regeneration.

### 3.2 HMAC-SHA256 Webhook Verification Protocol
Every webhook dispatch includes cryptographic integrity headers:
```http
POST /api/webhooks/crypto HTTP/1.1
Host: merchant-store.com
Content-Type: application/json
X-13C-Signature: sha256=4f3c7e8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d
X-13C-Timestamp: 1794554831
```

Verification snippet in Go:
```go
mac := hmac.New(sha256.New(), []byte(merchantWebhookSecret))
mac.Write(payloadBytes)
expectedSignature := hex.EncodeToString(mac.Sum(nil))
if !hmac.Equal([]byte(receivedSignature), []byte(expectedSignature)) {
    // Reject forged webhook payload
    return ErrInvalidSignature
}
```

---

## 4. Super Admin Dual-Factor Authentication (2FA)

Access to the Super Admin console is strictly gated:
1. **Root Dev Admin ID**: Internal domain email (`admin@13cgateway.internal`).
2. **Master Secret Key**: 128-bit master entropy key stored in environment variables.
3. **2FA TOTP**: 6-digit Time-Based One-Time Password RFC 6238 (compatible with Google Authenticator, YubiKey).
4. **Anti-Brute Force Lockout**: Automatic 60-second lockout after 5 consecutive failed attempts.

```env
ADMIN_ROOT_USER="admin@13cgateway.internal"
ADMIN_MASTER_SECRET_KEY="${VAULT_ADMIN_SECRET}"
ADMIN_2FA_TOTP_SEED="${VAULT_TOTP_SEED}"
```

---

## 5. Multi-Chain RPC Node Endpoints

The gateway supports dynamic adding, testing, and pruning of RPC endpoints without downtime:

| Network | Primary RPC Provider | Endpoint | Protocol |
| :--- | :--- | :--- | :--- |
| **TRON** | Trongrid Direct | `https://api.trongrid.io` | JSON-RPC |
| **BSC** | BNB Chain Official | `https://bsc-dataseed.binance.org` | JSON-RPC / WSS |
| **POLYGON** | Polygon PoS Direct | `https://polygon-rpc.com` | JSON-RPC |
| **SOLANA** | Solana Mainnet-Beta | `https://api.mainnet-beta.solana.com` | JSON-RPC / WSS |

Backup and private dedicated nodes (QuickNode, Alchemy, Infura, Ankr) can be added dynamically via the **System Health / RPC Manager** pane.

---

## 6. API Obfuscation & Next.js BFF Reverse Proxy

### Why Browser DevTools Cannot See Backend Infrastructure
When a client inspects the Network tab in Chrome DevTools:
1. Requests are directed to the relative Next.js route `/api/proxy/[...path]`.
2. The browser never sees the backend IP address, port `8080`, or internal microservice endpoints.
3. Server-side proxy forwards requests internally and strips sensitive CORS/infrastructure headers.
4. Security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Cache-Control: no-store`) are enforced on all responses.

---

## 7. Master Production Environment Template (`.env.production.example`)

```env
# Application Server
PORT=8080
APP_ENV=production
GATEWAY_BASE_URL=https://gateway.13c.network

# Database Cluster
DATABASE_URL=postgres://pg_13c_app:PASSWORD_HERE@db.internal:5432/13c_gateway?sslmode=verify-full

# Hot Wallet Sweeper Seeds (Encrypted via KMS)
HOT_WALLET_TRON_PRIVATE_KEY="kms://arn:aws:kms:region:account:key/tron_key"
HOT_WALLET_EVM_PRIVATE_KEY="kms://arn:aws:kms:region:account:key/evm_key"
HOT_WALLET_SOLANA_PRIVATE_KEY="kms://arn:aws:kms:region:account:key/solana_key"

# Admin 2FA
ADMIN_ROOT_USER=admin@13cgateway.internal
ADMIN_MASTER_KEY=REPLACE_WITH_CSPRNG_KEY
ADMIN_TOTP_SECRET=REPLACE_WITH_BASE32_TOTP_SECRET
```

