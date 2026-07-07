import React from "react";

export function Card({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`ui-card rounded-2xl border border-[var(--srru-card-border)] bg-[var(--srru-card)] p-6 shadow-[var(--srru-card-shadow)] ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
