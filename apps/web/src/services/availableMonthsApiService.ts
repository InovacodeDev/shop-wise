import { apiService } from './api';
import type { AvailableMonth, AvailableMonthsSummary } from '@/types/api';

/**
 * Gets all available months/years that have purchase data for insights and filtering
 * @param familyId - The family ID to get available months for
 * @returns Promise resolving to array of available months with metadata
 */
export async function getAvailableMonths(familyId: string): Promise<AvailableMonth[]> {
  try {
    return await apiService.getAvailableMonths(familyId);
  } catch (error) {
    console.error('Error fetching available months:', error);
    throw new Error(`Failed to fetch available months: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      cause: error,
    });
  }
}

/**
 * Gets summary statistics for all available months
 * @param familyId - The family ID to get summary for
 * @returns Promise resolving to summary statistics object
 */
export async function getAvailableMonthsSummary(familyId: string): Promise<AvailableMonthsSummary> {
  try {
    return await apiService.getAvailableMonthsSummary(familyId);
  } catch (error) {
    console.error('Error fetching available months summary:', error);
    throw new Error(`Failed to fetch available months summary: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      cause: error,
    });
  }
}

/**
 * Gets available months filtered by a date range
 * @param familyId - The family ID to get available months for
 * @param startMonth - Start month in YYYY-MM format (inclusive)
 * @param endMonth - End month in YYYY-MM format (inclusive)
 * @returns Promise resolving to filtered array of available months
 */
export async function getAvailableMonthsInRange(
  familyId: string, 
  startMonth: string, 
  endMonth: string
): Promise<AvailableMonth[]> {
  try {
    const allMonths = await getAvailableMonths(familyId);
    
    return allMonths.filter(month => {
      // Skip 'no-date' entries for range filtering
      if (month.monthYear === 'no-date') return false;
      
      return month.monthYear >= startMonth && month.monthYear <= endMonth;
    });
  } catch (error) {
    console.error('Error fetching available months in range:', error);
    throw new Error(`Failed to fetch available months in range: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      cause: error,
    });
  }
}

/**
 * Gets the most recent N months that have purchase data
 * @param familyId - The family ID to get available months for
 * @param count - Number of recent months to return
 * @returns Promise resolving to array of recent months
 */
export async function getRecentAvailableMonths(familyId: string, count: number = 6): Promise<AvailableMonth[]> {
  try {
    const allMonths = await getAvailableMonths(familyId);
    
    // Filter out 'no-date' entries and take the most recent N months
    const monthsWithDates = allMonths.filter(month => month.monthYear !== 'no-date');
    
    return monthsWithDates.slice(0, count);
  } catch (error) {
    console.error('Error fetching recent available months:', error);
    throw new Error(`Failed to fetch recent available months: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      cause: error,
    });
  }
}

/**
 * Gets available months for a specific year
 * @param familyId - The family ID to get available months for
 * @param year - Year to filter by (e.g., 2024)
 * @returns Promise resolving to array of months for the specified year
 */
export async function getAvailableMonthsForYear(familyId: string, year: number): Promise<AvailableMonth[]> {
  try {
    const allMonths = await getAvailableMonths(familyId);
    
    return allMonths.filter(month => {
      // Skip 'no-date' entries
      if (month.monthYear === 'no-date') return false;
      
      const monthYear = parseInt(month.monthYear.split('-')[0], 10);
      return monthYear === year;
    });
  } catch (error) {
    console.error('Error fetching available months for year:', error);
    throw new Error(`Failed to fetch available months for year: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      cause: error,
    });
  }
}

/**
 * Gets all unique years that have purchase data
 * @param familyId - The family ID to get available years for
 * @returns Promise resolving to array of years in descending order
 */
export async function getAvailableYears(familyId: string): Promise<number[]> {
  try {
    const allMonths = await getAvailableMonths(familyId);
    
    const years = new Set<number>();
    
    allMonths.forEach(month => {
      // Skip 'no-date' entries
      if (month.monthYear === 'no-date') return;
      
      const year = parseInt(month.monthYear.split('-')[0], 10);
      if (!isNaN(year)) {
        years.add(year);
      }
    });
    
    return Array.from(years).sort((a, b) => b - a); // Descending order
  } catch (error) {
    console.error('Error fetching available years:', error);
    throw new Error(`Failed to fetch available years: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      cause: error,
    });
  }
}