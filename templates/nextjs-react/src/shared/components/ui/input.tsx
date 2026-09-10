import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const baseInputClasses =
  'flex h-10 w-full rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (!icon) {
      return (
        <input
          ref={ref}
          className={cn(baseInputClasses, 'px-3 py-2', className)}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          {icon}
        </span>
        <input
          ref={ref}
          className={cn(baseInputClasses, 'py-2 pl-9 pr-3', className)}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';
