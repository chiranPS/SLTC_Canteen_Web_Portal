import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-900/10",
        secondary: "bg-secondary-400 text-secondary-950 hover:bg-secondary-500 shadow-sm",
        outline: "border-2 border-gray-200 bg-transparent hover:bg-gray-50 text-gray-900",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-900/10",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 py-2 text-sm",
        lg: "h-14 px-8 text-base rounded-2xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
