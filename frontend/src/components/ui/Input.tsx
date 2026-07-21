import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, rightElement, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              icon && "pl-10",
              rightElement && "pr-11",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

