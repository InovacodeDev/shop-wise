/**
 * Represents a month/year that has purchase data available
 * Used for insights, filtering, and analytics features
 */
export interface AvailableMonth {
    /** Month/year key in YYYY-MM format or 'no-date' for purchases without dates */
    monthYear: string;

    /** Human-readable display name (e.g., "January 2024" or "No Date") */
    displayName: string;

    /** Total number of purchases in this month */
    purchaseCount: number;

    /** Total amount spent in this month */
    totalAmount: number;

    /** Date of the earliest purchase in this month (null for no-date category) */
    earliestPurchase: string | null;

    /** Date of the latest purchase in this month (null for no-date category) */
    latestPurchase: string | null;
}

/**
 * Summary statistics for available months
 * Useful for insights and analytics dashboards
 */
export interface AvailableMonthsSummary {
    /** Total number of months with purchase data */
    totalMonths: number;

    /** Total number of purchases across all months */
    totalPurchases: number;

    /** Total amount spent across all months */
    totalAmount: number;

    /** Average purchases per month */
    averagePurchasesPerMonth: number;

    /** Average amount spent per month */
    averageAmountPerMonth: number;

    /** Earliest month with purchase data */
    earliestMonth: string | null;

    /** Latest month with purchase data */
    latestMonth: string | null;

    /** Month with the highest spending */
    highestSpendingMonth: AvailableMonth | null;

    /** Month with the most purchases */
    mostActiveMonth: AvailableMonth | null;
}
