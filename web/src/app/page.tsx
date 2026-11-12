import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" />
            Captain Crypto Gateway
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Non-Custodial Crypto Checkout
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            OxaPay-style payment architecture with dynamic ephemeral addresses and instant auto-payout.
          </p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 text-left space-y-4 shadow-xl">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Live Interactive Demos
          </div>

          <div className="space-y-2.5">
            <Link
              href="/checkout/demo-bsc-pending"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-all group"
            >
              <div>
                <div className="text-sm font-medium text-zinc-200 group-hover:text-cyan-400 transition-colors">
                  BSC Network (USDT)
                </div>
                <div className="text-xs text-zinc-500">Status: PENDING • Countdown Active</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/checkout/demo-tron-detected"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-all group"
            >
              <div>
                <div className="text-sm font-medium text-zinc-200 group-hover:text-cyan-400 transition-colors">
                  TRON Network (USDT TRC-20)
                </div>
                <div className="text-xs text-zinc-500">Status: DETECTED • Waiting Confirmations</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/checkout/demo-solana-paid"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-all group"
            >
              <div>
                <div className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                  Solana Network (USDC SPL)
                </div>
                <div className="text-xs text-zinc-500">Status: PAID • Auto-Payout Settled</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Zero Custody Risk • Instant Auto-Forwarding</span>
        </div>
      </div>
    </main>
  );
}
