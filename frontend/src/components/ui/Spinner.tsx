import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "default" | "lg" | "xl";
}

export function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary-600", sizeClasses[size], className)}
      {...props}
    />
  );
}
