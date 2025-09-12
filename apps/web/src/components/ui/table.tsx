import * as React from "react";

import { cn } from "@/lib/utils";
import { materialColors, materialTypography, materialShapes, materialSpacing, materialElevation } from "@/lib/material-design";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
    ({ className, style, ...props }, ref) => (
        <div
            className="relative w-full overflow-auto"
            style={{
                borderRadius: materialShapes.components.card,
                boxShadow: materialElevation.level1,
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
    ({ className, style, ...props }, ref) => (
        <td
            ref={ref}
            className={cn("align-middle [&:has([role=checkbox])]:pr-0", className)}
            style={{
                padding: `${materialSpacing.lg} ${materialSpacing.lg}`,
                ...materialTypography.bodyMedium,
                ...style,
            }}
            {...props}
        />
    )
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

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
