import type { ButtonHTMLAttributes } from 'react';

export type LabButtonVariant = 'default' | 'primary' | 'ghost';

export interface LabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LabButtonVariant;
}

export function LabButton({
  variant = 'default',
  className = '',
  ...props
}: LabButtonProps) {
  return (
    <button
      {...props}
      className={`ds-control-button ${className}`}
      data-variant={variant}
    />
  );
}