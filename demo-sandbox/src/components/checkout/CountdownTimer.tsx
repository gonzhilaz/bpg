"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface Props {
  initialSeconds?: number;
  expiresAt?: string;
  onExpire?: () => void;
}

export function CountdownTimer({ initialSeconds, expiresAt, onExpire }: Props) {
  const getSafeInitial = (): number => {
    if (typeof initialSeconds === "number" && !isNaN(initialSeconds) && initialSeconds > 0) {
      return initialSeconds;
    }
    if (expiresAt) {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    return 1800; // Standard 30:00 minutes expiration
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(getSafeInitial);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const safeSeconds = typeof secondsLeft === "number" && !isNaN(secondsLeft) ? Math.max(0, secondsLeft) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLow = safeSeconds > 0 && safeSeconds <= 300; // <= 5 minutes

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors ${
        secondsLeft === 0
          ? "bg-rose-950/40 text-rose-400 border-rose-900/50"
          : isLow
          ? "bg-amber-950/40 text-amber-300 border-amber-900/50 animate-pulse"
          : "bg-zinc-800/80 text-zinc-300 border-zinc-700/60"
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{secondsLeft === 0 ? "00:00" : formattedTime}</span>
    </div>
  );
}

