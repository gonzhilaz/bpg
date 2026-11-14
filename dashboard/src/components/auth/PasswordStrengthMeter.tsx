"use client";

import React, { useMemo } from "react";
import { Check, X } from "lucide-react";

interface Props {
  password: string;
}

export function PasswordStrengthMeter({ password }: Props) {
  const analysis = useMemo(() => {
    const hasMinLen = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let score = 0;
    if (hasMinLen) score++;
    if (hasLower && hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    let label = "Too weak";
    let colorClass = "bg-rose-500";
    let textClass = "text-rose-400";

    if (score === 1) {
      label = "Weak";
      colorClass = "bg-rose-500";
      textClass = "text-rose-400";
    } else if (score === 2) {
      label = "Fair";
      colorClass = "bg-amber-500";
      textClass = "text-amber-400";
    } else if (score === 3) {
      label = "Strong";
      colorClass = "bg-emerald-400";
      textClass = "text-emerald-400";
    } else if (score === 4) {
      label = "Very Strong";
      colorClass = "bg-cyan-400";
      textClass = "text-cyan-400";
    }

    return {
      score,
      label,
      colorClass,
      textClass,
      hasMinLen,
      hasMixedCase: hasLower && hasUpper,
      hasNumber,
      hasSpecial,
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1 font-sans">
      {/* 4 Segment Progress Bar */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step <= analysis.score ? analysis.colorClass : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {/* Label & Score */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-500">Password Security</span>
        <span className={`font-semibold ${analysis.textClass}`}>{analysis.label}</span>
      </div>

      {/* Security requirements checklist */}
      <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400 pt-1">
        <div className="flex items-center gap-1">
          {analysis.hasMinLen ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <X className="w-3 h-3 text-zinc-600" />
          )}
          <span className={analysis.hasMinLen ? "text-zinc-300" : ""}>Min 8 characters</span>
        </div>
        <div className="flex items-center gap-1">
          {analysis.hasMixedCase ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <X className="w-3 h-3 text-zinc-600" />
          )}
          <span className={analysis.hasMixedCase ? "text-zinc-300" : ""}>Uppercase & lowercase</span>
        </div>
        <div className="flex items-center gap-1">
          {analysis.hasNumber ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <X className="w-3 h-3 text-zinc-600" />
          )}
          <span className={analysis.hasNumber ? "text-zinc-300" : ""}>At least 1 number</span>
        </div>
        <div className="flex items-center gap-1">
          {analysis.hasSpecial ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <X className="w-3 h-3 text-zinc-600" />
          )}
          <span className={analysis.hasSpecial ? "text-zinc-300" : ""}>Special symbol</span>
        </div>
      </div>
    </div>
  );
}
