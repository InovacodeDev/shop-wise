import { DateInfo, MONTHLY_GROUPING_CONSTANTS, MonthKey } from '../models/monthly-purchase-group';

/**
 * Utility class for date operations related to monthly purchase grouping
 */
export class DateUtil {
    /**
     * Extracts date information from a date value, handling null/undefined/invalid dates
     * @param date - The date to extract information from
     * @param useUTC - Whether to use UTC for date extraction (default: true for consistency)
     * @returns DateInfo object with validation status and month key
     */
    static extractDateInfo(date: Date | null | undefined, useUTC: boolean = true): DateInfo {
        if (!date) {
            return {
                isValid: false,
                originalDate: date,
                monthKey: null,
            };
        }

        // Check if date is valid
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return {
                isValid: false,
                originalDate: date,
                monthKey: null,
            };
        }

        // Use UTC to avoid timezone-related grouping issues
        // This ensures purchases are grouped consistently regardless of server timezone
        const year = useUTC ? date.getUTCFullYear() : date.getFullYear();
        const month = useUTC ? date.getUTCMonth() + 1 : date.getMonth() + 1; // getMonth() returns 0-11, we want 1-12

        return {
            isValid: true,
            originalDate: date,
            monthKey: this.createMonthKey(year, month),
        };
    }

    /**
     * Creates a MonthKey object for the given year and month
     * @param year - The year (e.g., 2024)
     * @param month - The month (1-12)
     * @returns MonthKey object with formatted key and display name
     */
    static createMonthKey(year: number, month: number): MonthKey {
        // Validate month range
        if (month < 1 || month > 12) {
            throw new Error(`Invalid month: ${month}. Month must be between 1 and 12.`);
        }

        const monthPadded = month.toString().padStart(2, '0');
        const key = `${year}-${monthPadded}`;
        const monthName = MONTHLY_GROUPING_CONSTANTS.MONTH_NAMES[month - 1];
        const displayName = `${monthName} ${year}`;

        return {
            year,
            month,
            key,
            displayName,
        };
    }

    /**
     * Creates a MonthKey for the current month
     * @returns MonthKey object for the current month
     */
    static getCurrentMonthKey(): MonthKey {
        const now = new Date();
        return this.createMonthKey(now.getFullYear(), now.getMonth() + 1);
    }

    /**
     * Compares two month keys for sorting
     * @param a - First month key
     * @param b - Second month key
     * @param order - Sort order ('asc' or 'desc')
     * @returns Comparison result for sorting
     */
    static compareMonthKeys(a: string, b: string, order: 'asc' | 'desc' = 'desc'): number {
        // Handle special "no-date" key - it should always be last
        if (a === MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY) return 1;
        if (b === MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY) return -1;

        const comparison = a.localeCompare(b);
        return order === 'desc' ? -comparison : comparison;
    }

    /**
     * Compares two dates for sorting purchases within a month
     * @param a - First date
     * @param b - Second date
     * @param order - Sort order ('asc' or 'desc')
     * @returns Comparison result for sorting
     */
    static compareDates(
        a: Date | null | undefined,
        b: Date | null | undefined,
        order: 'asc' | 'desc' = 'desc',
    ): number {
        // Handle null/undefined dates - they should be last
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;

        // Handle invalid dates
        const aTime = a instanceof Date ? a.getTime() : NaN;
        const bTime = b instanceof Date ? b.getTime() : NaN;

        if (isNaN(aTime) && isNaN(bTime)) return 0;
        if (isNaN(aTime)) return 1;
        if (isNaN(bTime)) return -1;

        const comparison = aTime - bTime;
        return order === 'desc' ? -comparison : comparison;
    }

    /**
     * Validates if a date is within a reasonable range for purchases
     * @param date - The date to validate
     * @returns True if the date is reasonable for a purchase
     */
    static isReasonablePurchaseDate(date: Date): boolean {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return false;
        }

        const now = new Date();
        const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());

        return date >= tenYearsAgo && date <= oneYearFromNow;
    }

    /**
     * Formats a date for display in purchase lists
     * @param date - The date to format
     * @returns Formatted date string or "No Date" for invalid dates
     */
    static formatPurchaseDate(date: Date | null | undefined): string {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return 'No Date';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    /**
     * Gets the month key for a given date, or the NO_DATE_KEY for invalid dates
     * @param date - The date to get the month key for
     * @param useUTC - Whether to use UTC for date extraction (default: true for consistency)
     * @returns Month key string
     */
    static getMonthKeyForDate(date: Date | null | undefined, useUTC: boolean = true): string {
        const dateInfo = this.extractDateInfo(date, useUTC);
        return dateInfo.isValid && dateInfo.monthKey ? dateInfo.monthKey.key : MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY;
    }

    /**
     * Gets the display name for a given date, or "No Date" for invalid dates
     * @param date - The date to get the display name for
     * @param useUTC - Whether to use UTC for date extraction (default: true for consistency)
     * @returns Display name string
     */
    static getDisplayNameForDate(date: Date | null | undefined, useUTC: boolean = true): string {
        const dateInfo = this.extractDateInfo(date, useUTC);
        return dateInfo.isValid && dateInfo.monthKey
            ? dateInfo.monthKey.displayName
            : MONTHLY_GROUPING_CONSTANTS.NO_DATE_DISPLAY;
    }

    /**
     * Handles timezone edge cases by normalizing dates to UTC midnight
     * This prevents purchases from being grouped into different months due to timezone differences
     * @param date - The date to normalize
     * @returns Normalized date or null if invalid
     */
    static normalizeToUTCDate(date: Date | null | undefined): Date | null {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return null;
        }

        // Create a new date at UTC midnight for the same calendar date
        // This ensures consistent grouping regardless of timezone
        const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

        return utcDate;
    }

    /**
     * Checks if two dates are in the same month when considering timezone differences
     * @param date1 - First date
     * @param date2 - Second date
     * @returns True if dates are in the same month (UTC)
     */
    static areDatesInSameMonth(date1: Date | null | undefined, date2: Date | null | undefined): boolean {
        if (!date1 || !date2) return false;

        const key1 = this.getMonthKeyForDate(date1, true);
        const key2 = this.getMonthKeyForDate(date2, true);

        return key1 === key2 && key1 !== MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY;
    }
}
