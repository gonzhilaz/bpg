import React from "react";
import { CheckCircle2, Clock, Loader2, AlertCircle, XCircle } from "lucide-react";
import { InvoiceStatus } from "../../types/invoice";

interface Props {
  status: InvoiceStatus;
}

export function PaymentStatusPill({ status }: Props) {
  switch (status) {
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Paid
        </span>
      );
    case "DETECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Detected
        </span>
      );
    case "UNDERPAID":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Underpaid
        </span>
      );
    case "EXPIRED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Expired
        </span>
      );
    case "PENDING":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          Pending
        </span>
      );
  }
}
