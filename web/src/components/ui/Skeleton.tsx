import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-zinc-800/80 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>

      <div className="flex flex-col items-center space-y-3 py-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="flex justify-center py-2">
        <Skeleton className="h-44 w-44 rounded-xl" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      <div className="pt-4 border-t border-zinc-800/60 flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
