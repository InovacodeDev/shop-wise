import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
    "flex w-full px-4 py-3 text-body-large bg-surface-container-highest border border-outline-variant rounded-lg placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
    {
        variants: {
            variant: {
                default: "",
                filled: "bg-surface-variant border-0 border-b-2 border-outline focus:border-primary",
                outlined: "bg-transparent border-outline focus:border-primary",
            },
            size: {
                default: "px-4 py-3",
                sm: "px-3 py-2 text-body-small",
                lg: "px-6 py-4 text-body-large",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
    label?: string;
    helperText?: string;
    error?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, size, label, helperText, error, leadingIcon, trailingIcon, ...props }, ref) => {
        const inputId = React.useId();

        return (
            <div className="space-y-2">
                {label && (
                    <label htmlFor={inputId} className="block text-label-large font-medium text-on-surface">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leadingIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                            {leadingIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        className={cn(
                            inputVariants({ variant, size, className }),
                            leadingIcon && "pl-10",
                            trailingIcon && "pr-10",
                            error && "border-error focus:border-error focus:ring-error/20"
                        )}
                        ref={ref}
                        {...props}
                    />
                    {trailingIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                            {trailingIcon}
                        </div>
                    )}
                </div>
                {helperText && (
                    <p className={cn(
                        "text-body-small",
                        error ? "text-error" : "text-on-surface-variant"
                    )}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

// Password Input Component
const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);

        return (
            <Input
                {...props}
                ref={ref}
                type={showPassword ? "text" : "password"}
                className={className}
                trailingIcon={
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-on-surface/8 rounded-full transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a10.025 10.025 0 00-5.378 3.412m7.878 7.878L12 21m-1.464-1.464A10.025 10.025 0 016.344 11.878" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                }
            />
        );
    }
);
PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput, inputVariants };
