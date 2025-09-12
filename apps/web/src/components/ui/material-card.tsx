import React from 'react';
import { cn } from '@/lib/utils';
import { materialComponents, materialElevation, materialShapes } from '@/lib/material-design';
import { VariantProps, cva } from 'class-variance-authority';

const materialCardVariants = cva(
  "rounded-lg border transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        elevated: "bg-card text-card-foreground shadow-sm hover:shadow-md",
        filled: "bg-primary/5 text-card-foreground border-primary/20",
        outlined: "bg-card text-card-foreground border-border hover:border-primary/50",
      },
      elevation: {
        0: "shadow-none",
        1: "shadow-sm",
        2: "shadow",
        3: "shadow-md",
        4: "shadow-lg",
        5: "shadow-xl",
      },
      size: {
        sm: "p-4",
        md: "p-6", 
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      }
    },
    defaultVariants: {
      variant: "elevated",
      elevation: 1,
      size: "md",
      interactive: false,
    },
  }
);

export interface MaterialCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof materialCardVariants> {
  asChild?: boolean;
}

const MaterialCard = React.forwardRef<HTMLDivElement, MaterialCardProps>(
  ({ className, variant, elevation, size, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'div' : 'div';

    return (
      <Comp
        ref={ref}
        className={cn(materialCardVariants({ variant, elevation, size, interactive }), className)}
        style={{
          borderRadius: materialComponents.card.borderRadius,
        }}
        {...props}
      />
    );
  }
);
MaterialCard.displayName = "MaterialCard";

const MaterialCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
MaterialCardHeader.displayName = "MaterialCardHeader";

const MaterialCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    variant?: 'headline' | 'title' | 'body';
  }
>(({ className, variant = 'title', ...props }, ref) => {
  const headingStyles = {
    headline: "text-2xl font-normal tracking-tight", // Material 3 headlineSmall
    title: "text-lg font-medium tracking-tight",     // Material 3 titleLarge  
    body: "text-base font-medium",                   // Material 3 bodyLarge
  };

  return (
    <h3
      ref={ref}
      className={cn(
        "leading-none",
        headingStyles[variant],
        className
      )}
      {...props}
    />
  );
});
MaterialCardTitle.displayName = "MaterialCardTitle";

const MaterialCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
MaterialCardDescription.displayName = "MaterialCardDescription";

const MaterialCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
MaterialCardContent.displayName = "MaterialCardContent";

const MaterialCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 gap-2", className)}
    {...props}
  />
));
MaterialCardFooter.displayName = "MaterialCardFooter";

// Material 3 specific card variants
export const StatCard = React.forwardRef<
  HTMLDivElement,
  MaterialCardProps & {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
    icon?: React.ReactNode;
  }
>(({ title, value, subtitle, trend, icon, className, ...props }, ref) => (
  <MaterialCard
    ref={ref}
    variant="elevated"
    elevation={1}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <MaterialCardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <MaterialCardDescription className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </MaterialCardDescription>
          <div className="text-3xl font-semibold tracking-tight text-foreground mb-1">
            {value}
          </div>
          {subtitle && (
            <MaterialCardDescription className="text-xs">
              {subtitle}
            </MaterialCardDescription>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-medium flex items-center",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground/60 text-2xl">
            {icon}
          </div>
        )}
      </div>
    </MaterialCardContent>
  </MaterialCard>
));
StatCard.displayName = "StatCard";

export const ActionCard = React.forwardRef<
  HTMLDivElement,
  MaterialCardProps & {
    title: string;
    description?: string;
    action?: React.ReactNode;
    media?: React.ReactNode;
  }
>(({ title, description, action, media, className, ...props }, ref) => (
  <MaterialCard
    ref={ref}
    variant="outlined"
    interactive={!!action}
    className={cn("group", className)}
    {...props}
  >
    {media && (
      <div className="w-full h-48 bg-muted rounded-t-lg overflow-hidden">
        {media}
      </div>
    )}
    <MaterialCardContent className={cn(media ? "p-4" : "p-6")}>
      <MaterialCardTitle variant="title" className="mb-2">
        {title}
      </MaterialCardTitle>
      {description && (
        <MaterialCardDescription className="mb-4">
          {description}
        </MaterialCardDescription>
      )}
      {action && (
        <MaterialCardFooter className="px-0 pb-0">
          {action}
        </MaterialCardFooter>
      )}
    </MaterialCardContent>
  </MaterialCard>
));
ActionCard.displayName = "ActionCard";

export {
  MaterialCard,
  MaterialCardHeader,
  MaterialCardTitle,
  MaterialCardDescription,
  MaterialCardContent,
  MaterialCardFooter,
};
