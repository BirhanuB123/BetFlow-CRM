"use client";

import React from "react";

/**
 * Shimmer Card Skeleton for inventory grids and stats widgets.
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="mt-4 h-7 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-3 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800/60" />
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Shimmer Table Skeleton for data tables.
 */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between p-4 px-6">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
                style={{ width: `${Math.floor(60 + Math.random() * 40)}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Shimmer Pipeline Skeleton for Kanban deal boards.
 */
export function PipelineSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40"
        >
          <div className="flex items-center justify-between pb-2">
            <div className="h-5 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          {Array.from({ length: 3 }).map((_, cardIdx) => (
            <div
              key={cardIdx}
              className="h-28 w-full animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Shimmer Form Skeleton for loading edit/create modal forms.
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-300 dark:bg-slate-700" />
      </div>
    </div>
  );
}

/**
 * Shimmer Detail Skeleton for record details (Accounts, Customers, Leads).
 */
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-6 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TableSkeleton rows={4} cols={4} />
        </div>
        <div className="space-y-4">
          <CardSkeleton count={2} />
        </div>
      </div>
    </div>
  );
}
