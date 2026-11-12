export type Network = "BSC" | "POLYGON" | "TRON" | "SOLANA";

export type InvoiceStatus =
  | "PENDING"
  | "DETECTED"
  | "CONFIRMED"
  | "PAID"
  | "UNDERPAID"
  | "OVERPAID"
  | "EXPIRED"
  | "CANCELLED";

export interface Invoice {
  id: string;
  order_id: string;
  amount_requested: string;
  currency_requested: string;
  pay_currency: string;
  pay_network: Network;
  pay_amount: string;
  fee_payer?: "customer" | "merchant";
  base_amount?: string;
  network_fee?: string;
  deposit_address: string;
  status: InvoiceStatus;
  received_amount: string;
  remaining_amount: string;
  expires_at: string;
  seconds_remaining: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
  error?: unknown;
}

