"use client";

import React, { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

export type TooltipPlacement = "auto" | "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  className?: string;
}

export function Tooltip({ content, placement = "auto", className = "" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [positionClasses, setPositionClasses] = useState("bottom-full left-1/2 -translate-x-1/2 mb-2");
  const [arrowClasses, setArrowClasses] = useState("top-full left-1/2 -translate-x-1/2 border-t-zinc-800");

  const calculatePosition = () => {
    if (!containerRef.current || typeof window === "undefined") return;
    const rect = containerRef.current.getBoundingClientRect();
    const winWidth = window.innerWidth;

    const isNearRight = rect.right > winWidth - 180;
    const isNearLeft = rect.left < 140;
    const isNearTop = rect.top < 70;

    let vClass = isNearTop || placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2";
    let hClass = "left-1/2 -translate-x-1/2";
    let arrV = isNearTop || placement === "bottom" ? "bottom-full border-b-zinc-800" : "top-full border-t-zinc-800";
    let arrH = "left-1/2 -translate-x-1/2";

    if (isNearRight || placement === "left") {
      hClass = "right-0 translate-x-0";
      arrH = "right-2 translate-x-0";
    } else if (isNearLeft || placement === "right") {
      hClass = "left-0 translate-x-0";
      arrH = "left-2 translate-x-0";
    }

    setPositionClasses(`${vClass} ${hClass}`);
    setArrowClasses(`${arrV} ${arrH}`);
  };

  const handleMouseEnter = () => {
    calculatePosition();
    setIsVisible(true);
  };

  return (
    <span ref={containerRef} className={`relative inline-flex items-center ml-1 ${className}`}>
      <button
        type="button"
        className="text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors p-0.5 rounded"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={handleMouseEnter}
        onBlur={() => setIsVisible(false)}
        onClick={() => {
          calculatePosition();
          setIsVisible(!isVisible);
        }}
        aria-label="Info"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <span
          role="tooltip"
          className={`absolute z-50 w-56 max-w-[calc(100vw-32px)] p-2.5 text-[11px] font-normal leading-relaxed text-zinc-100 bg-zinc-950/95 border border-zinc-700/80 rounded-xl shadow-2xl pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${positionClasses}`}
        >
          {content}
          <span
            className={`absolute w-0 h-0 border-4 border-transparent pointer-events-none ${arrowClasses}`}
          />
        </span>
      )}
    </span>
  );
}
