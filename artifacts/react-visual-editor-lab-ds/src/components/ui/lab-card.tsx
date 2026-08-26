import type { HTMLAttributes } from 'react';

export function LabCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ds-card p-4 ${className}`} />;
}