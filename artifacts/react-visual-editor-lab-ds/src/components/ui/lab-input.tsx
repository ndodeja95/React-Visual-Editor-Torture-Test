import { forwardRef, type InputHTMLAttributes } from 'react';

export const LabInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function LabInput({ className = '', ...props }, ref) {
    return <input {...props} ref={ref} className={`ds-control-input ${className}`} />;
  },
);