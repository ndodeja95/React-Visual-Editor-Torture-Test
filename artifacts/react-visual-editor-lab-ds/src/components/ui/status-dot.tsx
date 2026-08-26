import type { HTMLAttributes } from 'react';

export function StatusDot({
  live = false,
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { live?: boolean }) {
  return (
    <span
      {...props}
      className={`inline-block h-[7px] w-[7px] rounded-full ${
        live ? 'bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/.16)]' : 'bg-secondary-foreground'
      } ${className}`}
      aria-label={props['aria-label'] ?? (live ? 'Live' : 'Inactive')}
    />
  );
}