import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/md3/card";
import { Button } from "@/components/md3/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown, faFilter, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/md3/input";
import { Badge } from "@/components/md3/badge";
import { cn } from "@/lib/utils";

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Column header label */
  label: string;
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** Whether the column can be filtered */
  filterable?: boolean;
  /** Custom render function for cell content */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** CSS class for the column */
  className?: string;
  /** CSS class for the header */
  headerClassName?: string;
  /** Width of the column */
  width?: string;
  /** Whether to align content to right */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  /** Data array to display */
  data: T[];
  /** Column configuration */
  columns: DataTableColumn<T>[];
  /** Optional title for the table */
  title?: string;
  /** Optional description for the table */
  description?: string;
  /** Whether to show search functionality */
  showSearch?: boolean;
  /** Placeholder text for search */
  searchPlaceholder?: string;
  /** Custom search function */
  onSearch?: (query: string, data: T[]) => T[];
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Items per page (default: 10) */
  pageSize?: number;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the table */
  tableClassName?: string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Row selection */
  selectable?: boolean;
  /** Selected rows */
  selectedRows?: T[];
  /** Selection change handler */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Custom row key extractor */
  getRowKey?: (row: T, index: number) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  showSearch = false,
  searchPlaceholder = "Search...",
  onSearch,
  showPagination = false,
  pageSize = 10,
  loading = false,
  emptyMessage = "No data available",
  className,
  tableClassName,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowKey,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: SortDirection;
  }>({ key: '', direction: null });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;

    if (onSearch) {
      return onSearch(searchQuery, data);
    }

    // Default search implementation
    return data.filter((row) => {
      return columns.some((column) => {
        const value = row[column.key];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, onSearch, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!showPagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    const column = columns.find(c => c.key === columnKey);
    if (!column?.sortable) return;

    let direction: SortDirection = 'asc';

    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
      direction = null;
    }

    setSortConfig({ key: columnKey, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey || !sortConfig.direction) {
      return faSort;
    }
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  };

  const handleRowSelection = (row: T, index: number) => {
    if (!selectable || !onSelectionChange) return;

    const rowKey = getRowKey ? getRowKey(row, index) : index.toString();
    const isSelected = selectedRows.some((selectedRow, i) => {
      const selectedKey = getRowKey ? getRowKey(selectedRow, i) : i.toString();
      return selectedKey === rowKey;
    });

    let newSelectedRows: T[];
    if (isSelected) {
      newSelectedRows = selectedRows.filter((selectedRow, i) => {
        const selectedKey = getRowKey ? getRowKey(selectedRow, i) : i.toString();
        return selectedKey !== rowKey;
      });
    } else {
      newSelectedRows = [...selectedRows, row];
    }

    onSelectionChange(newSelectedRows);
  };

  const isRowSelected = (row: T, index: number) => {
    if (!selectable) return false;
    const rowKey = getRowKey ? getRowKey(row, index) : index.toString();
    return selectedRows.some((selectedRow, i) => {
      const selectedKey = getRowKey ? getRowKey(selectedRow, i) : i.toString();
      return selectedKey === rowKey;
    });
  };

  const displayData = paginatedData;

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Search and Filters */}
        {showSearch && (
          <div className="flex items-center space-x-2 p-4 border-b">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
              />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <Badge variant="secondary">
                {sortedData.length} result{sortedData.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

        {/* Table */}
        <div className="relative">
          <Table className={cn(tableClassName)}>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === displayData.length && displayData.length > 0}
                      onChange={(e) => {
                        if (!onSelectionChange) return;
                        if (e.target.checked) {
                          onSelectionChange([...selectedRows, ...displayData.filter((row, i) => !isRowSelected(row, i))]);
                        } else {
                          onSelectionChange([]);
                        }
                      }}
                      className="rounded border-border"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.headerClassName,
                      column.sortable && "cursor-pointer select-none hover:bg-muted/50",
                      column.align === 'right' && "text-right",
                      column.align === 'center' && "text-center"
                    )}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <FontAwesomeIcon
                          icon={getSortIcon(column.key)}
                          className="w-3 h-3 text-muted-foreground"
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    {selectable && <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayData.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                displayData.map((row, index) => (
                  <TableRow
                    key={getRowKey ? getRowKey(row, index) : index}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      isRowSelected(row, index) && "bg-muted/50"
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isRowSelected(row, index)}
                          onChange={() => handleRowSelection(row, index)}
                          className="rounded border-border"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.key];
                      const content = column.render ? column.render(value, row, index) : value;

                      return (
                        <TableCell
                          key={column.key}
                          className={cn(
                            column.className,
                            column.align === 'right' && "text-right",
                            column.align === 'center' && "text-center"
                          )}
                        >
                          {content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outlined"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outlined"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outlined"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export individual components for flexibility
export {
  Table as BaseTable,
  TableBody as BaseTableBody,
  TableCell as BaseTableCell,
  TableHead as BaseTableHead,
  TableHeader as BaseTableHeader,
  TableRow as BaseTableRow,
};
