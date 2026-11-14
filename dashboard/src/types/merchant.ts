export type Network = "BSC" | "POLYGON" | "TRON" | "SOLANA";
export type EnvironmentMode = "LIVE" | "SANDBOX";

export interface MerchantProfile {
  id: string;
  name: string;
  api_key: string;
  secret_key: string;
  payout_address_bsc: string;
  payout_address_polygon: string;
  payout_address_tron: string;
  payout_address_solana: string;
  auto_payout_enabled: boolean;
  fee_payer: "customer" | "merchant";
  underpaid_tolerance?: number;
  webhook_url: string;
}

export interface NetworkGasRate {
  network: Network;
  native_coin: string;
  coin_price_usd: string;
  gas_price_metric: string;
  est_sweep_fee_usd: string;
  status: "OPTIMAL" | "CONGESTED";
}

export interface DashboardInvoice {
  id: string;
  order_id: string;
  amount_requested: string;
  currency_requested: string;
  pay_currency: string;
  pay_network: Network;
  pay_amount: string;
  base_amount?: string;
  network_fee?: string;
  fee_payer?: "customer" | "merchant";
  received_amount: string;
  deposit_address: string;
  status: "PENDING" | "DETECTED" | "PAID" | "UNDERPAID" | "EXPIRED";
  created_at: string;
  is_sandbox?: boolean;
}

export interface PayoutRecord {
  id: string;
  invoice_id: string;
  network: Network;
  payout_tx_hash: string;
  recipient_address: string;
  amount_sent: string;
  network_fee_paid: string;
  status: "COMPLETED" | "SUBMITTED" | "FAILED";
  created_at: string;
  is_sandbox?: boolean;
}

export interface WebhookLog {
  id: string;
  event: string;
  order_id: string;
  url: string;
  status_code: number;
  signature: string;
  timestamp: string;
}

export interface WithdrawalItem {
  id: string;
  amount: string;
  currency: string;
  network: Network;
  target_address: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  tx_hash?: string;
  admin_notes?: string;
  requested_at: string;
}

export interface EscrowSummary {
  available_balance_usd: string;
  locked_balance_usd: string;
  total_escrow_usd: string;
  min_withdrawal_usd: string;
  settlement_mode: string;
}

export interface PaymentLinkItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  amount?: string;
  currency: string;
  pay_network: Network;
  is_active: boolean;
  total_collected: string;
  payment_count: number;
  created_at: string;
}

export interface WebhookDeliveryLog {
  id: string;
  event: string;
  order_id: string;
  url: string;
  status_code: number;
  duration_ms: number;
  signature: string;
  payload: string;
  response_body: string;
  timestamp: string;
}
