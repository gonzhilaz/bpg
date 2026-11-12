"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  content: string;
}

export function Tooltip({ content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        className="text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Info"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 p-2 text-xs font-normal leading-relaxed text-zinc-200 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl pointer-events-none"
        >
          {content}
        </span>
      )}
    </span>
  );
}
