import * as React from "react";

import { materialElevation, materialShapes, materialSpacing, materialTypography } from "@/lib/material-design";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
    ({ className, style, ...props }, ref) => (
        <div
            className="relative w-full overflow-auto"
            style={{
                borderRadius: materialShapes.components.card,
                // materialElevation.level1 is an object; use its shadow string for boxShadow
                boxShadow: (materialElevation.level1 as any).shadow ?? undefined,
            }}
        >
            <table
                ref={ref}
                className={cn("w-full caption-bottom bg-surface text-on-surface", className)}
                style={{
                    ...materialTypography.bodyMedium,
                    ...style,
                }}
                {...props}
            />
        </div>
    )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, style, ...props }, ref) => (
        <thead
            ref={ref}
            className={cn("[&_tr]:border-b border-outline bg-surface-variant text-on-surface-variant", className)}
            style={{
                ...materialTypography.titleSmall,
                ...style,
            }}
            {...props}
        />
    )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tbody ref={ref} className={cn("[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-outline/50", className)} {...props} />
    )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, style, ...props }, ref) => (
        <tfoot
            ref={ref}
            className={cn("border-t border-outline bg-surface-variant/30 [&>tr]:last:border-b-0", className)}
            style={{
                ...materialTypography.titleSmall,
                ...style,
            }}
            {...props}
        />
    )
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, ref) => (
        <tr
            ref={ref}
            className={cn("transition-colors hover:bg-surface-variant/8 data-[state=selected]:bg-primary/12", className)}
            {...props}
        />
    )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className, style, ...props }, ref) => (
        <th
            ref={ref}
            className={cn(
                "text-left align-middle [&:has([role=checkbox])]:pr-0",
                className
            )}
            style={{
                height: materialSpacing['3xl'],
                paddingLeft: materialSpacing.lg,
                paddingRight: materialSpacing.lg,
                ...materialTypography.titleSmall,
                ...style,
            }}
            {...props}
        />
    )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className, style, children, ...props }, ref) => {
        // Normalize how null-ish values appear in table cells.
        // When value is the string "null" (any case) or null/undefined, show "--" instead.
        const normalizedChildren = React.Children.map(children, (child) => {
            if (child === null || child === undefined) return "--";
            if (typeof child === "string") {
                const trimmed = child.trim();
                if (trimmed.toLowerCase() === "null") return "--";
            }
            return child;
        });

        return (
            <td
                ref={ref}
                className={cn("align-middle [&:has([role=checkbox])]:pr-0", className)}
                style={{
                    padding: `${materialSpacing.lg} ${materialSpacing.lg}`,
                    ...materialTypography.bodyMedium,
                    ...style,
                }}
                {...props}
            >
                {normalizedChildren}
            </td>
        );
    }
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, style, ...props }, ref) => (
        <caption
            ref={ref}
            className={cn("text-on-surface-variant", className)}
            style={{
                marginTop: materialSpacing.lg,
                ...materialTypography.bodySmall,
                ...style,
            }}
            {...props}
        />
    )
);
TableCaption.displayName = "TableCaption";

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };

