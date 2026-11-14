import { MerchantProfile, DashboardInvoice, PayoutRecord, WebhookLog, NetworkGasRate, WithdrawalItem, EscrowSummary } from "../types/merchant";

export const mockNetworkGasRates: NetworkGasRate[] = [
  {
    network: "BSC",
    native_coin: "BNB",
    coin_price_usd: "642.50",
    gas_price_metric: "3.0 Gwei",
    est_sweep_fee_usd: "0.05",
    status: "OPTIMAL",
  },
  {
    network: "POLYGON",
    native_coin: "POL",
    coin_price_usd: "0.3840",
    gas_price_metric: "32.5 Gwei",
    est_sweep_fee_usd: "0.02",
    status: "OPTIMAL",
  },
  {
    network: "TRON",
    native_coin: "TRX",
    coin_price_usd: "0.2015",
    gas_price_metric: "31,895 Energy",
    est_sweep_fee_usd: "1.20",
    status: "OPTIMAL",
  },
  {
    network: "SOLANA",
    native_coin: "SOL",
    coin_price_usd: "182.40",
    gas_price_metric: "5,000 Lamports",
    est_sweep_fee_usd: "0.01",
    status: "OPTIMAL",
  },
];

export const mockLiveProfile: MerchantProfile = {
  id: "m-80123-live",
  name: "13C Demo Store",
  api_key: "13c_live_e89104fa28b57199c01128ad",
  secret_key: "13c_sec_live_99f2b8471a2e8c4598012f",
  payout_address_bsc: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
  payout_address_polygon: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
  payout_address_tron: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
  payout_address_solana: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  auto_payout_enabled: true,
  fee_payer: "customer",
  underpaid_tolerance: 0.0,
  webhook_url: "https://myshop.com/api/webhooks/crypto",
};

export const mockSandboxProfile: MerchantProfile = {
  id: "m-80123-test",
  name: "13C Demo Store (Sandbox)",
  api_key: "13c_test_demo_api_key_12345678",
  secret_key: "13c_test_demo_secret_key_87654321",
  payout_address_bsc: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
  payout_address_polygon: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
  payout_address_tron: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
  payout_address_solana: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  auto_payout_enabled: true,
  fee_payer: "customer",
  underpaid_tolerance: 0.0,
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

export const mockMerchantWithdrawals: WithdrawalItem[] = [
  {
    id: "wd-m-101",
    amount: "150.00",
    currency: "USDT",
    network: "TRON",
    target_address: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
    status: "PENDING",
    requested_at: "2026-11-13T10:15:00Z",
  },
  {
    id: "wd-m-100",
    amount: "280.00",
    currency: "USDT",
    network: "BSC",
    target_address: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
    status: "COMPLETED",
    tx_hash: "0xescrow_payout_bsc_784921901a8b",
    requested_at: "2026-11-10T14:30:00Z",
  },
];

export const mockEscrowSummary: EscrowSummary = {
  available_balance_usd: "850.00",
  locked_balance_usd: "150.00",
  total_escrow_usd: "1000.00",
  min_withdrawal_usd: "50.00",
  settlement_mode: "ESCROW_BALANCE",
};
