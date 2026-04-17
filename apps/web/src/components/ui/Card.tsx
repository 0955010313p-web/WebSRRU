import React from "react";

export function Card({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      role="region"
      aria-label="card"
      className={`ui-card rounded-2xl bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
