export type Network = "BSC" | "POLYGON" | "TRON" | "SOLANA";

export interface HotWalletBalance {
  network: Network;
  symbol: string;
  balance: string;
  usd_value: string;
  energy_delegated?: string;
  status: "HEALTHY" | "LOW" | "CRITICAL";
  address: string;
}

export interface WatcherStatus {
  network: Network;
  current_block: string;
  latency_ms: number;
  status: "ACTIVE" | "SYNCING" | "STALLED";
  last_block_time: string;
}

export interface AdminMerchant {
  id: string;
  name: string;
  api_key_prefix: string;
  volume_usd: string;
  invoices_count: number;
  auto_payout: boolean;
  status: "ACTIVE" | "SUSPENDED";
  created_at: string;
}

export interface PlatformMetrics {
  total_volume_usd: string;
  platform_fee_revenue_usd: string; // 0.4% cut
  active_merchants_count: number;
  circuit_breaker_active: boolean;
}

