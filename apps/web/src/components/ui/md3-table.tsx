import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/md3/card";
import { LoadingIndicator } from "@/components/md3/loading-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { faTable } from "@fortawesome/free-solid-svg-icons";

// MD3 Table variants
const tableVariants = cva(
    "w-full border-collapse",
    {
        variants: {
            variant: {
                // Default table with subtle borders
                default: "",
                // Striped rows for better readability
                striped: "[&>tbody>tr:nth-child(odd)]:bg-surface-variant/20",
                // Dense layout for data-heavy tables
                dense: "",
                // Bordered for clear separation
                bordered: "border border-outline-variant",
            },
            size: {
                sm: "[&>thead>tr>th]:px-2 [&>thead>tr>th]:py-2 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-2",
                default: "[&>thead>tr>th]:px-4 [&>thead>tr>th]:py-3 [&>tbody>tr>td]:px-4 [&>tbody>tr>td]:py-3",
                lg: "[&>thead>tr>th]:px-6 [&>thead>tr>th]:py-4 [&>tbody>tr>td]:px-6 [&>tbody>tr>td]:py-4",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

// Table container with MD3 styling
const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement> & VariantProps<typeof tableVariants>
>(({ className, variant, size, ...props }, ref) => (
    <div className="w-full overflow-auto rounded-lg border border-outline-variant">
        <table
            ref={ref}
            className={cn(tableVariants({ variant, size }), className)}
            {...props}
        />
    </div>
));
Table.displayName = "Table";

// Table header with MD3 surface colors
const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead
        ref={ref}
        className={cn(
            "bg-surface-container-highest border-b border-outline-variant",
            "[&>tr]:border-b [&>tr]:border-outline-variant",
            className
        )}
        {...props}
    />
));
TableHeader.displayName = "TableHeader";

// Table body with hover states
const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn(
            "[&>tr:last-child]:border-0 [&>tr]:border-b [&>tr]:border-outline-variant/50",
            "[&>tr]:hover:bg-surface-container/30 [&>tr]:transition-colors",
            className
        )}
        {...props}
    />
));
TableBody.displayName = "TableBody";

// Table footer
const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "bg-surface-container-high border-t border-outline-variant",
            "[&>tr]:last-child:border-b-0",
            "font-medium text-on-surface",
            className
        )}
        {...props}
    />
));
TableFooter.displayName = "TableFooter";

// Table row
const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b border-outline-variant/50 transition-colors",
            "hover:bg-surface-container/30 data-[state=selected]:bg-primary-container/30",
            className
        )}
        {...props}
    />
));
TableRow.displayName = "TableRow";

// Table header cell with proper typography
const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "text-left align-middle font-medium text-on-surface",
            "text-label-large tracking-wide",
            "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
            className
        )}
        {...props}
    />
));
TableHead.displayName = "TableHead";

// Table cell with MD3 typography
const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            "align-middle text-body-medium text-on-surface",
            "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
            className
        )}
        {...props}
    />
));
TableCell.displayName = "TableCell";

// Table caption
const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn(
            "mt-4 text-body-small text-on-surface-variant text-center",
            className
        )}
        {...props}
    />
));
TableCaption.displayName = "TableCaption";

// Enhanced table container with loading and empty states
interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    loading?: boolean;
    empty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    loadingText?: string;
    variant?: "card" | "default";
}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
    ({
        title,
        description,
        loading,
        empty,
        emptyTitle = "No data available",
        emptyDescription = "There are no items to display",
        loadingText = "Loading data...",
        variant = "default",
        children,
        className,
        ...props
    }, ref) => {
        const content = (
            <>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingIndicator
                            size="lg"
                            showLabel
                            label={loadingText}
                            labelPosition="bottom"
                        />
                    </div>
                ) : empty ? (
                    <div className="py-8">
                        <EmptyState
                            icon={faTable}
                            title={emptyTitle}
                            description={emptyDescription}
                            variant="minimal"
                        />
                    </div>
                ) : (
                    children
                )}
            </>
        );

        if (variant === "card") {
            return (
                <Card ref={ref} className={cn("w-full", className)} {...props}>
                    {(title || description) && (
                        <CardHeader>
                            {title && <CardTitle className="text-headline-small">{title}</CardTitle>}
                            {description && (
                                <p className="text-body-medium text-on-surface-variant mt-1">
                                    {description}
                                </p>
                            )}
                        </CardHeader>
                    )}
                    <CardContent className="p-0">
                        {content}
                    </CardContent>
                </Card>
            );
        }

        return (
            <div ref={ref} className={cn("w-full space-y-4", className)} {...props}>
                {(title || description) && (
                    <div className="space-y-2">
                        {title && <h2 className="text-headline-small font-medium text-on-surface">{title}</h2>}
                        {description && (
                            <p className="text-body-medium text-on-surface-variant">
                                {description}
                            </p>
                        )}
                    </div>
                )}
                {content}
            </div>
        );
    }
);
DataTable.displayName = "DataTable";

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
    DataTable,
    tableVariants,
};
