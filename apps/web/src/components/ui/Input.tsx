import React from 'react';
import clsx from 'clsx';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input = ({ className, ...props }: InputProps) => {
  const base = 'ui-input mt-1 w-full rounded-md border border-[var(--srru-card-border)] px-3 py-2 bg-[var(--srru-card)] text-[var(--foreground)] placeholder:text-[var(--srru-muted)] focus:outline-none';
  const focus = 'focus-visible:ring-2 focus-visible:ring-[var(--srru-green)] focus-visible:ring-offset-2';
  return <input className={clsx(base, focus, className)} {...props} />;
};

export default Input;
