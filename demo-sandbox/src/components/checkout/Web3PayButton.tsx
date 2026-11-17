"use client";

import React, { useState } from "react";
import { Wallet, CheckCircle2 } from "lucide-react";
import { Network } from "../../types/invoice";
import { Button } from "../ui/Button";

interface Props {
  network: Network;
  payAmount: string;
  payCurrency: string;
  depositAddress: string;
}

export function Web3PayButton({ network, payAmount, payCurrency, depositAddress }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handle1ClickPay = async () => {
    setConnecting(true);
    setStatusMessage(null);

    try {
      if (network === "BSC" || network === "POLYGON") {
        const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
        if (!ethereum) {
          setStatusMessage("MetaMask not detected. Please use QR Code.");
          setConnecting(false);
          return;
        }

        const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
        if (!accounts || accounts.length === 0) {
          setStatusMessage("Wallet connection denied.");
          setConnecting(false);
          return;
        }

        setStatusMessage("Please confirm transaction in your wallet...");
        // In full web3 flow, calls ERC-20 contract transfer
      } else if (network === "SOLANA") {
        const solana = (window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }> } }).solana;
        if (!solana || !solana.isPhantom) {
          setStatusMessage("Phantom wallet not detected. Please use QR Code.");
          setConnecting(false);
          return;
        }

        const resp = await solana.connect();
        setStatusMessage(`Connected: ${resp.publicKey.toString().slice(0, 4)}...`);
      } else {
        setStatusMessage("Please scan QR code to pay on TRON network.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setStatusMessage(msg);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="primary"
        fullWidth
        size="lg"
        onClick={handle1ClickPay}
        isLoading={connecting}
        loadingText="Connecting..."
        icon={<Wallet className="w-4 h-4" />}
      >
        Pay with Wallet
      </Button>

      {statusMessage && (
        <div className="text-xs text-center text-zinc-400 bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-700/40 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}

