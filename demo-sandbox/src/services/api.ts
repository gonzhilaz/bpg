import { ApiResponse, Invoice } from "../types/invoice";
import { mockInvoices } from "../mocks/mockInvoice";
import { getEnvUrl } from "../utils/env";

const API_BASE_URL = getEnvUrl.api();

export async function fetchInvoiceById(id: string): Promise<Invoice> {
  // Check if it's a demo mock ID first
  if (mockInvoices[id]) {
    return mockInvoices[id];
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404 && mockInvoices["demo-bsc-pending"]) {
        return mockInvoices["demo-bsc-pending"];
      }
      throw new Error(`Invoice fetch failed with status ${res.status}`);
    }

    const json: ApiResponse<Invoice> = await res.json();
    return json.data;
  } catch (err) {
    // Graceful fallback to mock data for local testing
    if (mockInvoices[id]) {
      return mockInvoices[id];
    }
    return mockInvoices["demo-bsc-pending"];
  }
}

