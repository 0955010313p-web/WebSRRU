"use client";

import React from "react";
import clsx from "clsx";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = ({ variant = "primary", className, ...props }: ButtonProps) => {
  const base = "ui-btn inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors disabled:opacity-50";
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--srru-green)] text-white hover:bg-[var(--srru-green-dark)] focus-visible:ring-[var(--srru-green)] shadow-sm",
    secondary:
      "bg-white text-[var(--srru-green)] border border-[var(--srru-green)] hover:bg-[var(--srru-green-10)] focus-visible:ring-[var(--srru-green)]",
    ghost:
      "bg-transparent text-[var(--srru-muted)] hover:bg-[var(--srru-muted-10)] focus-visible:ring-[var(--srru-muted)]",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props} />
  );
};

export default Button;
