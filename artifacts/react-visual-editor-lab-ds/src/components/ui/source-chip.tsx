import type { HTMLAttributes } from 'react';

export function SourceChip({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={`ds-source-chip ${className}`} />;
}