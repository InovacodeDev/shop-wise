import { cn } from "@/lib/utils";
import { materialColors, materialShapes } from "@/lib/material-design";

function Skeleton({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse bg-surface-variant/30", className)}
            style={{
                borderRadius: materialShapes.corner.small,
                ...style,
            }}
            {...props}
        />
    );
}

export { Skeleton };
