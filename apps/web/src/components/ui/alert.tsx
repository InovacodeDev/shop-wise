import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { materialColors, materialTypography, materialShapes, materialSpacing, materialElevation } from "@/lib/material-design";

const alertVariants = cva(
    "relative w-full border [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    {
        variants: {
            variant: {
                default: "bg-surface text-on-surface border-outline",
                destructive: "bg-error-container text-on-error-container border-error [&>svg]:text-error",
                warning: "bg-tertiary-container text-on-tertiary-container border-tertiary [&>svg]:text-tertiary",
                success: "bg-primary-container text-on-primary-container border-primary [&>svg]:text-primary",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, style, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        style={{
            borderRadius: materialShapes.components.card,
            padding: materialSpacing.lg,
            boxShadow: materialElevation.level1,
            ...style,
        }}
        {...props}
    />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, style, ...props }, ref) => (
        <h5
            ref={ref}
            className={cn("mb-1 leading-none tracking-tight", className)}
            style={{
                ...materialTypography.titleMedium,
                marginBottom: materialSpacing.sm,
                ...style,
            }}
            {...props}
        />
    )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, style, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("text-sm [&_p]:leading-relaxed", className)}
            style={{
                ...materialTypography.bodyMedium,
                ...style,
            }}
            {...props}
        />
    )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
