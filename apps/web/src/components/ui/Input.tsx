import React from 'react';
import clsx from 'clsx';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input = ({ className, ...props }: InputProps) => {
  const base = 'ui-input mt-1 w-full rounded-xl border border-[var(--srru-card-border)] px-3 py-2.5 bg-white text-[var(--foreground)] placeholder:text-[var(--srru-muted)] focus:outline-none shadow-sm';
  const focus = 'focus-visible:ring-2 focus-visible:ring-[var(--srru-green)] focus-visible:ring-offset-2';
  return <input className={clsx(base, focus, className)} {...props} />;
};

export default Input;
