import React from 'react';
import clsx from 'clsx';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input = ({ className, ...props }: InputProps) => {
  const base = 'ui-input mt-1 w-full rounded-md border px-3 py-2 bg-white text-[var(--foreground)] placeholder:opacity-60 focus:outline-none';
  const focus = 'focus-visible:ring-2 focus-visible:ring-[var(--srru-green)] focus-visible:ring-offset-2';
  return <input className={clsx(base, focus, className)} {...props} />;
};

export default Input;
