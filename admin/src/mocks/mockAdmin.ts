import { HotWalletBalance, WatcherStatus, AdminMerchant, PlatformMetrics, NetworkGasItem } from "../types/admin";

export const mockNetworkGasList: NetworkGasItem[] = [
  {
    network: "BSC",
    native_coin: "BNB",
    coin_price_usd: "642.50",
    gas_price_metric: "3.0 Gwei",
    est_sweep_fee_usd: "0.05",
    status: "OPTIMAL",
    updated_at: "Real-time",
  },
  {
    network: "POLYGON",
    native_coin: "POL",
    coin_price_usd: "0.3840",
    gas_price_metric: "32.5 Gwei",
    est_sweep_fee_usd: "0.02",
    status: "OPTIMAL",
    updated_at: "Real-time",
  },
  {
    network: "TRON",
    native_coin: "TRX",
    coin_price_usd: "0.2015",
    gas_price_metric: "31,895 Energy",
    est_sweep_fee_usd: "1.20",
    status: "OPTIMAL",
    updated_at: "Real-time",
  },
  {
    network: "SOLANA",
    native_coin: "SOL",
    coin_price_usd: "182.40",
    gas_price_metric: "5,000 Lamports",
    est_sweep_fee_usd: "0.01",
    status: "OPTIMAL",
    updated_at: "Real-time",
  },
];

export const mockPlatformMetrics: PlatformMetrics = {
  total_volume_usd: "248,500.00",
  platform_fee_revenue_usd: "994.00", // 0.4% cut collected
  active_merchants_count: 12,
  circuit_breaker_active: false,
};

export const mockHotWallets: HotWalletBalance[] = [
  {
    network: "TRON",
    symbol: "TRX",
    balance: "2,450.00 TRX",
    usd_value: "$490.00",
    energy_delegated: "3.2M Energy (Active)",
    status: "HEALTHY",
    address: "TXYZ...MasterHotWallet",
  },
  {
    network: "BSC",
    symbol: "BNB",
    balance: "0.8500 BNB",
    usd_value: "$510.00",
    status: "HEALTHY",
    address: "0xMaster...HotWalletBSC",
  },
  {
    network: "POLYGON",
    symbol: "POL",
    balance: "18.20 POL",
    usd_value: "$7.20",
    status: "LOW", // Low gas alert
    address: "0xMaster...HotWalletPOL",
  },
  {
    network: "SOLANA",
    symbol: "SOL",
    balance: "1.2400 SOL",
    usd_value: "$248.00",
    status: "HEALTHY",
    address: "SolMaster...HotWallet",
  },
];

export const mockWatchers: WatcherStatus[] = [
  {
    network: "BSC",
    current_block: "#38,124,980",
    latency_ms: 110,
    status: "ACTIVE",
    last_block_time: "2s ago",
  },
  {
    network: "POLYGON",
    current_block: "#61,240,110",
    latency_ms: 180,
    status: "ACTIVE",
    last_block_time: "3s ago",
  },
  {
    network: "TRON",
    current_block: "#65,491,200",
    latency_ms: 95,
    status: "ACTIVE",
    last_block_time: "1s ago",
  },
  {
    network: "SOLANA",
    current_block: "#289,140,200",
    latency_ms: 65,
    status: "ACTIVE",
    last_block_time: "400ms ago",
  },
];

export const mockMerchantsList: AdminMerchant[] = [
  {
    id: "m-001",
    name: "13C Demo Store",
    api_key_prefix: "13c_live_e891...",
    volume_usd: "$124,000.00",
    invoices_count: 840,
    auto_payout: true,
    status: "ACTIVE",
    created_at: "2026-09-01",
  },
  {
    id: "m-002",
    name: "CryptoGadgets Indonesia",
    api_key_prefix: "13c_live_99a2...",
    volume_usd: "$82,500.00",
    invoices_count: 512,
    auto_payout: true,
    status: "ACTIVE",
    created_at: "2026-10-15",
  },
  {
    id: "m-003",
    name: "SaaS Cloud Hosting",
    api_key_prefix: "13c_live_41bf...",
    volume_usd: "$42,000.00",
    invoices_count: 198,
    auto_payout: true,
    status: "ACTIVE",
    created_at: "2026-11-01",
  },
];

