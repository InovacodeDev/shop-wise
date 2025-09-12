import { format, isValid, parseISO, startOfDay, endOfDay, startOfMonth, endOfMonth, isSameMonth, isSameDay, addDays, subDays, differenceInDays, isAfter, isBefore, isToday, isYesterday, isTomorrow } from 'date-fns'

/**
 * Utility functions for date operations
 */
export class DateUtils {
    /**
     * Check if two dates are in the same month
     */
    static isSameMonth(date1: Date | string, date2: Date | string): boolean {
        const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
        const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
        
        if (!isValid(d1) || !isValid(d2)) {
            return false
        }
        
        return isSameMonth(d1, d2)
    }

    /**
     * Check if two dates are the same day
     */
    static isSameDay(date1: Date | string, date2: Date | string): boolean {
        const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
        const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
        
        if (!isValid(d1) || !isValid(d2)) {
            return false
        }
        
        return isSameDay(d1, d2)
    }

    /**
     * Format date to a readable string
     */
    static formatDate(date: Date | string, formatString: string = 'dd/MM/yyyy'): string {
        const d = typeof date === 'string' ? parseISO(date) : date
        
        if (!isValid(d)) {
            return ''
        }
        
        return format(d, formatString)
    }

    /**
     * Get the start of the day for a given date
     */
    static getStartOfDay(date: Date | string): Date {
        const d = typeof date === 'string' ? parseISO(date) : date
        return startOfDay(d)
    }

    /**
     * Get the end of the day for a given date
     */
    static getEndOfDay(date: Date | string): Date {
        const d = typeof date === 'string' ? parseISO(date) : date
        return endOfDay(d)
    }

    /**
     * Get the start of the month for a given date
     */
    static getStartOfMonth(date: Date | string): Date {
        const d = typeof date === 'string' ? parseISO(date) : date
        return startOfMonth(d)
    }

    /**
     * Get the end of the month for a given date
     */
    static getEndOfMonth(date: Date | string): Date {
        const d = typeof date === 'string' ? parseISO(date) : date
        return endOfMonth(d)
    }   
 /**
     * Add days to a date
     */
    static addDays(date: Date | string, days: number): Date {
        const d = typeof date === 'string' ? parseISO(date) : date
        return addDays(d, days)
    }

    /**
     * Subtract days from a date
     */
    static subtractDays(date: Date | string, days: number): Date {
        const d = typeof date === 'string' ? parseISO(date) : date
        return subDays(d, days)
    }

    /**
     * Get the difference in days between two dates
     */
    static getDaysDifference(date1: Date | string, date2: Date | string): number {
        const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
        const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
        
        if (!isValid(d1) || !isValid(d2)) {
            return 0
        }
        
        return differenceInDays(d1, d2)
    }

    /**
     * Check if the first date is after the second date
     */
    static isAfter(date1: Date | string, date2: Date | string): boolean {
        const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
        const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
        
        if (!isValid(d1) || !isValid(d2)) {
            return false
        }
        
        return isAfter(d1, d2)
    }

    /**
     * Check if the first date is before the second date
     */
    static isBefore(date1: Date | string, date2: Date | string): boolean {
        const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
        const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
        
        if (!isValid(d1) || !isValid(d2)) {
            return false
        }
        
        return isBefore(d1, d2)
    }

    /**
     * Check if a date is today
     */
    static isToday(date: Date | string): boolean {
        const d = typeof date === 'string' ? parseISO(date) : date
        
        if (!isValid(d)) {
            return false
        }
        
        return isToday(d)
    }

    /**
     * Check if a date is yesterday
     */
    static isYesterday(date: Date | string): boolean {
        const d = typeof date === 'string' ? parseISO(date) : date
        
        if (!isValid(d)) {
            return false
        }
        
        return isYesterday(d)
    }

    /**
     * Check if a date is tomorrow
     */
    static isTomorrow(date: Date | string): boolean {
        const d = typeof date === 'string' ? parseISO(date) : date
        
        if (!isValid(d)) {
            return false
        }
        
        return isTomorrow(d)
    }

    /**
     * Check if a date is valid
     */
    static isValidDate(date: Date | string): boolean {
        const d = typeof date === 'string' ? parseISO(date) : date
        return isValid(d)
    }

    /**
     * Get a date range for the current month
     */
    static getCurrentMonthRange(): { start: Date; end: Date } {
        const now = new Date()
        return {
            start: startOfMonth(now),
            end: endOfMonth(now)
        }
    }

    /**
     * Get relative time description (today, yesterday, tomorrow, or formatted date)
     */
    static getRelativeTimeDescription(date: Date | string): string {
        const d = typeof date === 'string' ? parseISO(date) : date
        
        if (!isValid(d)) {
            return 'Invalid date'
        }
        
        if (isToday(d)) {
            return 'Today'
        }
        
        if (isYesterday(d)) {
            return 'Yesterday'
        }
        
        if (isTomorrow(d)) {
            return 'Tomorrow'
        }
        
        return format(d, 'dd/MM/yyyy')
    }
}