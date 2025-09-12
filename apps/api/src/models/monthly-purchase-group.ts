import { Purchase } from './purchase';

/**
 * Interface representing a group of purchases for a specific month and year
 */
export interface MonthlyPurchaseGroup {
    /** Month and year in YYYY-MM format for sorting (e.g., "2024-01") */
    monthYear: string;

    /** Human-readable month and year for display (e.g., "January 2024") */
    displayName: string;

    /** Total amount spent for all purchases in this month */
    totalAmount: number;

    /** Number of purchases in this month */
    purchaseCount: number;

    /** Array of purchases for this month, sorted by date descending */
    purchases: Purchase[];
}

/**
 * Utility type for month key generation and sorting
 */
export interface MonthKey {
    /** Year as number (e.g., 2024) */
    year: number;

    /** Month as number (1-12) */
    month: number;

    /** Formatted key for sorting (YYYY-MM) */
    key: string;

    /** Display name for the month (e.g., "January 2024") */
    displayName: string;
}

/**
 * Utility type for date extraction and validation
 */
export interface DateInfo {
    /** Whether the date is valid */
    isValid: boolean;

    /** The original date value */
    originalDate: Date | null | undefined;

    /** Extracted month key if date is valid, null otherwise */
    monthKey: MonthKey | null;
}

/**
 * Configuration options for monthly grouping
 */
export interface MonthlyGroupingOptions {
    /** Whether to include purchases with invalid/null dates in a "No Date" group */
    includeNoDateGroup?: boolean;

    /** Sort order for monthly groups (default: 'desc' for newest first) */
    sortOrder?: 'asc' | 'desc';

    /** Sort order for purchases within each month (default: 'desc' for newest first) */
    purchaseSortOrder?: 'asc' | 'desc';
}

/**
 * Constants for monthly grouping functionality
 */
export const MONTHLY_GROUPING_CONSTANTS = {
    /** Key used for purchases with no valid date */
    NO_DATE_KEY: 'no-date',

    /** Display name for purchases with no valid date */
    NO_DATE_DISPLAY: 'No Date',

    /** Default grouping options */
    DEFAULT_OPTIONS: {
        includeNoDateGroup: true,
        sortOrder: 'desc' as const,
        purchaseSortOrder: 'desc' as const,
    },

    /** Month names for display formatting */
    MONTH_NAMES: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
} as const;

/**
 * Type for month names
 */
export type MonthName = (typeof MONTHLY_GROUPING_CONSTANTS.MONTH_NAMES)[number];

/**
 * Result type for monthly grouping operations
 */
export interface MonthlyGroupingResult {
    /** Array of monthly purchase groups */
    groups: MonthlyPurchaseGroup[];

    /** Total number of purchases processed */
    totalPurchases: number;

    /** Number of purchases with valid dates */
    validDatePurchases: number;

    /** Number of purchases with invalid/null dates */
    invalidDatePurchases: number;

    /** Overall total amount across all groups */
    overallTotal: number;
}
