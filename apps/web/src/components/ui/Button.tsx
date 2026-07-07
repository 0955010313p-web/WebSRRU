"use client";

import React from "react";
import clsx from "clsx";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = ({ variant = "primary", className, ...props }: ButtonProps) => {
  const base = "ui-btn inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors disabled:opacity-50";
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--srru-green)] text-white hover:bg-[var(--srru-green-dark)] focus-visible:ring-[var(--srru-green)] shadow-md",
    secondary:
      "bg-white text-[var(--srru-purple)] border-2 border-[var(--srru-purple)] hover:bg-[var(--srru-purple-10)] focus-visible:ring-[var(--srru-purple)]",
    ghost:
      "bg-transparent text-[var(--srru-muted)] hover:bg-[var(--srru-muted-10)] focus-visible:ring-[var(--srru-muted)]",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props} />
  );
};

export default Button;
