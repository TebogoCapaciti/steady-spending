import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-12 text-center shadow-sm">
      <Illustration />
      <h3 className="mt-6 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function Illustration() {
  return (
    <svg
      viewBox="0 0 120 80"
      className="h-20 w-32 text-primary"
      fill="none"
      aria-hidden="true"
    >
      <rect x="10" y="16" width="100" height="52" rx="12" className="fill-current opacity-10" />
      <path
        d="M22 56c10 0 12-14 22-14s12 10 22 10 14-18 24-18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-70"
      />
      <circle cx="44" cy="42" r="4" className="fill-current" />
      <circle cx="88" cy="34" r="4" className="fill-current opacity-60" />
    </svg>
  );
}
