import { ApiClient } from "./apiClient";
import { MerchantProfile, DashboardInvoice, NetworkGasRate } from "../types/merchant";

export interface UpdateProfilePayload {
  name?: string;
  payout_address_bsc?: string;
  payout_address_polygon?: string;
  payout_address_tron?: string;
  payout_address_solana?: string;
  auto_payout_enabled?: boolean;
  fee_payer?: "customer" | "merchant";
  underpaid_tolerance?: number;
  webhook_url?: string;
}

export interface InvoicesListResponse {
  invoices: DashboardInvoice[];
  total: number;
  page: number;
  limit: number;
}

export interface FinancialLedgerData {
  range: string;
  gross_volume: string;
  net_settled: string;
  platform_fee: string;
  gas_fees_paid: string;
  payouts_count: number;
  avg_order: string;
}

export interface WebhookTestPayload {
  url: string;
  event: string;
  order_id: string;
  payload: Record<string, unknown>;
}

export interface WebhookTestResult {
  status_code: number;
  duration_ms: number;
  delivery_id: string;
  success: boolean;
}

export class MerchantService {
  /**
   * Fetches currently authenticated merchant profile from database
   */
  public static async getProfile() {
    return ApiClient.get<MerchantProfile>("/api/v1/auth/me");
  }

  /**
   * Updates merchant settings, cold wallet destinations, and webhook configuration
   */
  public static async updateProfile(payload: UpdateProfilePayload) {
    return ApiClient.put<MerchantProfile>("/api/v1/auth/profile", payload);
  }

  /**
   * Fetches paginated real invoices belonging to merchant
   */
  public static async getInvoices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    network?: string;
  }) {
    return ApiClient.get<InvoicesListResponse>("/api/v1/auth/invoices", params);
  }

  /**
   * Fetches real ledger accounting metrics directly from DB
   */
  public static async getLedger(range: "7D" | "30D" | "ALL" = "30D") {
    return ApiClient.get<FinancialLedgerData>("/api/v1/auth/ledger", { range });
  }

  /**
   * Rotates and regenerates live API key & HMAC secret
   */
  public static async regenerateApiKey() {
    return ApiClient.post<{
      raw_api_key: string;
      api_key_prefix: string;
      raw_secret_key: string;
    }>("/api/v1/auth/regenerate-key");
  }

  /**
   * Dispatches a live test webhook callback
   */
  public static async testWebhook(payload: WebhookTestPayload) {
    return ApiClient.post<WebhookTestResult>("/api/v1/auth/webhooks/test", payload);
  }

  /**
   * Fetches real-time multi-chain gas rates
   */
  public static async getGasRates() {
    return ApiClient.get<NetworkGasRate[]>("/api/v1/rates/gas");
  }
}
