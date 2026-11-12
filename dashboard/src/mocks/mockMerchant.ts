import { MerchantProfile, DashboardInvoice, PayoutRecord, WebhookLog } from "../types/merchant";

export const mockLiveProfile: MerchantProfile = {
  id: "m-80123-live",
  name: "Captain Demo Store",
  api_key: "cap_live_e89104fa28b57199c01128ad",
  secret_key: "sec_live_99f2b8471a2e8c4598012f",
  payout_address_bsc: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
  payout_address_polygon: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
  payout_address_tron: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
  payout_address_solana: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  auto_payout_enabled: true,
  webhook_url: "https://myshop.com/api/webhooks/crypto",
};

export const mockSandboxProfile: MerchantProfile = {
  id: "m-80123-test",
  name: "Captain Demo Store (Sandbox)",
  api_key: "cap_test_demo_api_key_12345678",
  secret_key: "sec_test_demo_secret_key_87654321",
  payout_address_bsc: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
  payout_address_polygon: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
  payout_address_tron: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
  payout_address_solana: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  auto_payout_enabled: true,
  webhook_url: "https://myshop.com/api/webhooks/crypto",
};

export const mockLiveInvoices: DashboardInvoice[] = [
  {
    id: "inv-live-001",
    order_id: "ORD-98214",
    amount_requested: "250.00",
    currency_requested: "USD",
    pay_currency: "USDT",
    pay_network: "BSC",
    pay_amount: "250.0000",
    received_amount: "0.0000",
    deposit_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    status: "PENDING",
    created_at: "2026-11-12 16:30",
    is_sandbox: false,
  },
  {
    id: "inv-live-002",
    order_id: "ORD-98215",
    amount_requested: "500.00",
    currency_requested: "USD",
    pay_currency: "USDT",
    pay_network: "TRON",
    pay_amount: "500.0000",
    received_amount: "500.0000",
    deposit_address: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
    status: "PAID",
    created_at: "2026-11-12 16:25",
    is_sandbox: false,
  },
];

export const mockSandboxInvoices: DashboardInvoice[] = [
  {
    id: "inv-test-101",
    order_id: "TEST-ORD-01",
    amount_requested: "20.00",
    currency_requested: "USD",
    pay_currency: "USDT",
    pay_network: "TRON",
    pay_amount: "20.0000",
    received_amount: "20.0000",
    deposit_address: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
    status: "PAID",
    created_at: "Just now",
    is_sandbox: true,
  },
  {
    id: "inv-test-102",
    order_id: "TEST-ORD-02",
    amount_requested: "15.00",
    currency_requested: "USD",
    pay_currency: "USDT",
    pay_network: "BSC",
    pay_amount: "15.0000",
    received_amount: "0.0000",
    deposit_address: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
    status: "PENDING",
    created_at: "5 mins ago",
    is_sandbox: true,
  },
];

export const mockLivePayouts: PayoutRecord[] = [
  {
    id: "pay-live-01",
    invoice_id: "inv-live-002",
    network: "TRON",
    payout_tx_hash: "a4f8812e...tron",
    recipient_address: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
    amount_sent: "500.0000",
    network_fee_paid: "2.1000",
    status: "COMPLETED",
    created_at: "2026-11-12 16:26",
    is_sandbox: false,
  },
];

export const mockSandboxPayouts: PayoutRecord[] = [
  {
    id: "pay-test-01",
    invoice_id: "inv-test-101",
    network: "TRON",
    payout_tx_hash: "0xsimulated_payout_hash_testnet",
    recipient_address: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
    amount_sent: "20.0000",
    network_fee_paid: "0.0000",
    status: "COMPLETED",
    created_at: "Just now",
    is_sandbox: true,
  },
];

export const mockSandboxWebhookLogs: WebhookLog[] = [
  {
    id: "wh-test-01",
    event: "invoice.paid",
    order_id: "TEST-ORD-01",
    url: "https://myshop.com/api/webhooks/crypto",
    status_code: 200,
    signature: "hmac_sha256_9a41b2c...38",
    timestamp: "Just now",
  },
];
