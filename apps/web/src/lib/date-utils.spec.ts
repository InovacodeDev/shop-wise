import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DateUtils } from './date-utils'

describe('DateUtils', () => {
    beforeEach(() => {
        // Mock the current date to January 15, 2024 for consistent testing
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-15T12:00:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('isSameMonth', () => {
        it('should return true for dates in the same month', () => {
            const date1 = new Date(2024, 0, 1) // January 1, 2024
            const date2 = new Date(2024, 0, 31) // January 31, 2024
            expect(DateUtils.isSameMonth(date1, date2)).toBe(true)
        })

        it('should return false for dates in different months', () => {
            const date1 = new Date(2024, 0, 1) // January 1, 2024
            const date2 = new Date(2024, 1, 1) // February 1, 2024
            expect(DateUtils.isSameMonth(date1, date2)).toBe(false)
        })

        it('should work with string dates', () => {
            expect(DateUtils.isSameMonth('2024-01-01', '2024-01-15')).toBe(true)
            expect(DateUtils.isSameMonth('2024-01-01', '2024-02-01')).toBe(false)
        })

        it('should return false for invalid dates', () => {
            expect(DateUtils.isSameMonth('invalid', '2024-01-01')).toBe(false)
            expect(DateUtils.isSameMonth(new Date('invalid'), new Date('2024-01-01'))).toBe(false)
        })
    })

    describe('isSameDay', () => {
        it('should return true for the same day', () => {
            const date1 = new Date(2024, 0, 15, 10, 0, 0) // January 15, 2024 10:00
            const date2 = new Date(2024, 0, 15, 20, 0, 0) // January 15, 2024 20:00
            expect(DateUtils.isSameDay(date1, date2)).toBe(true)
        })

        it('should return false for different days', () => {
            const date1 = new Date(2024, 0, 15) // January 15, 2024
            const date2 = new Date(2024, 0, 16) // January 16, 2024
            expect(DateUtils.isSameDay(date1, date2)).toBe(false)
        })

        it('should work with string dates', () => {
            expect(DateUtils.isSameDay('2024-01-15', '2024-01-15')).toBe(true)
            expect(DateUtils.isSameDay('2024-01-15', '2024-01-16')).toBe(false)
        })

        it('should return false for invalid dates', () => {
            expect(DateUtils.isSameDay('invalid', '2024-01-15')).toBe(false)
        })
    })

    describe('formatDate', () => {
        it('should format date with default format', () => {
            const date = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.formatDate(date)).toBe('15/01/2024')
        })

        it('should format date with custom format', () => {
            const date = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15')
        })

        it('should work with string dates', () => {
            expect(DateUtils.formatDate('2024-01-15')).toBe('15/01/2024')
        })

        it('should return empty string for invalid dates', () => {
            expect(DateUtils.formatDate('invalid')).toBe('')
        })
    })

    describe('getStartOfDay', () => {
        it('should return start of day', () => {
            const date = new Date(2024, 0, 15, 15, 30, 45) // January 15, 2024 15:30:45
            const result = DateUtils.getStartOfDay(date)
            expect(result.getHours()).toBe(0)
            expect(result.getMinutes()).toBe(0)
            expect(result.getSeconds()).toBe(0)
            expect(result.getMilliseconds()).toBe(0)
        })

        it('should work with string dates', () => {
            const result = DateUtils.getStartOfDay('2024-01-15T15:30:45')
            expect(result.getHours()).toBe(0)
        })
    })

    describe('getEndOfDay', () => {
        it('should return end of day', () => {
            const date = new Date(2024, 0, 15, 10, 30, 45) // January 15, 2024 10:30:45
            const result = DateUtils.getEndOfDay(date)
            expect(result.getHours()).toBe(23)
            expect(result.getMinutes()).toBe(59)
            expect(result.getSeconds()).toBe(59)
            expect(result.getMilliseconds()).toBe(999)
        })
    })
    
    describe('getStartOfMonth', () => {
        it('should return start of month', () => {
            const date = new Date(2024, 0, 15) // January 15, 2024
            const result = DateUtils.getStartOfMonth(date)
            expect(result.getDate()).toBe(1)
            expect(result.getHours()).toBe(0)
            expect(result.getMinutes()).toBe(0)
        })

        it('should work with string dates', () => {
            const result = DateUtils.getStartOfMonth('2024-01-15')
            expect(result.getDate()).toBe(1)
        })
    })

    describe('getEndOfMonth', () => {
        it('should return end of month', () => {
            const date = new Date(2024, 0, 15) // January 15, 2024
            const result = DateUtils.getEndOfMonth(date)
            expect(result.getDate()).toBe(31) // January has 31 days
            expect(result.getHours()).toBe(23)
            expect(result.getMinutes()).toBe(59)
        })
    })

    describe('addDays', () => {
        it('should add days to a date', () => {
            const date = new Date(2024, 0, 15) // January 15, 2024
            const result = DateUtils.addDays(date, 5)
            expect(result.getDate()).toBe(20)
        })

        it('should work with string dates', () => {
            const result = DateUtils.addDays('2024-01-15', 10)
            expect(result.getDate()).toBe(25)
        })

        it('should handle negative days', () => {
            const date = new Date(2024, 0, 15) // January 15, 2024
            const result = DateUtils.addDays(date, -5)
            expect(result.getDate()).toBe(10)
        })
    })

    describe('subtractDays', () => {
        it('should subtract days from a date', () => {
            const date = new Date(2024, 0, 15) // January 15, 2024
            const result = DateUtils.subtractDays(date, 5)
            expect(result.getDate()).toBe(10)
        })

        it('should work with string dates', () => {
            const result = DateUtils.subtractDays('2024-01-15', 10)
            expect(result.getDate()).toBe(5)
        })
    })

    describe('getDaysDifference', () => {
        it('should calculate difference between dates', () => {
            const date1 = new Date(2024, 0, 20) // January 20, 2024
            const date2 = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.getDaysDifference(date1, date2)).toBe(5)
        })

        it('should work with string dates', () => {
            expect(DateUtils.getDaysDifference('2024-01-20', '2024-01-15')).toBe(5)
        })

        it('should return negative for reverse order', () => {
            const date1 = new Date(2024, 0, 10) // January 10, 2024
            const date2 = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.getDaysDifference(date1, date2)).toBe(-5)
        })

        it('should return 0 for invalid dates', () => {
            expect(DateUtils.getDaysDifference('invalid', '2024-01-15')).toBe(0)
        })
    })

    describe('isAfter', () => {
        it('should return true when first date is after second', () => {
            const date1 = new Date(2024, 0, 20) // January 20, 2024
            const date2 = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.isAfter(date1, date2)).toBe(true)
        })

        it('should return false when first date is before second', () => {
            const date1 = new Date(2024, 0, 10) // January 10, 2024
            const date2 = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.isAfter(date1, date2)).toBe(false)
        })

        it('should work with string dates', () => {
            expect(DateUtils.isAfter('2024-01-20', '2024-01-15')).toBe(true)
        })

        it('should return false for invalid dates', () => {
            expect(DateUtils.isAfter('invalid', '2024-01-15')).toBe(false)
        })
    })

    describe('isBefore', () => {
        it('should return true when first date is before second', () => {
            const date1 = new Date(2024, 0, 10) // January 10, 2024
            const date2 = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.isBefore(date1, date2)).toBe(true)
        })

        it('should return false when first date is after second', () => {
            const date1 = new Date(2024, 0, 20) // January 20, 2024
            const date2 = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.isBefore(date1, date2)).toBe(false)
        })

        it('should work with string dates', () => {
            expect(DateUtils.isBefore('2024-01-10', '2024-01-15')).toBe(true)
        })

        it('should return false for invalid dates', () => {
            expect(DateUtils.isBefore('invalid', '2024-01-15')).toBe(false)
        })
    }) 
    
    describe('isToday', () => {
        it('should return true for today', () => {
            const today = new Date(2024, 0, 15, 10, 0, 0) // January 15, 2024 10:00
            expect(DateUtils.isToday(today)).toBe(true)
        })

        it('should return false for yesterday', () => {
            const yesterday = new Date(2024, 0, 14) // January 14, 2024
            expect(DateUtils.isToday(yesterday)).toBe(false)
        })

        it('should work with string dates', () => {
            expect(DateUtils.isToday('2024-01-15')).toBe(true)
        })

        it('should return false for invalid dates', () => {
            expect(DateUtils.isToday('invalid')).toBe(false)
        })
    })

    describe('isYesterday', () => {
        it('should return true for yesterday', () => {
            const yesterday = new Date(2024, 0, 14) // January 14, 2024
            expect(DateUtils.isYesterday(yesterday)).toBe(true)
        })

        it('should return false for today', () => {
            const today = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.isYesterday(today)).toBe(false)
        })

        it('should work with string dates', () => {
            expect(DateUtils.isYesterday('2024-01-14')).toBe(true)
        })

        it('should return false for invalid dates', () => {
            expect(DateUtils.isYesterday('invalid')).toBe(false)
        })
    })

    describe('isTomorrow', () => {
        it('should return true for tomorrow', () => {
            const tomorrow = new Date(2024, 0, 16) // January 16, 2024
            expect(DateUtils.isTomorrow(tomorrow)).toBe(true)
        })

        it('should return false for today', () => {
            const today = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.isTomorrow(today)).toBe(false)
        })

        it('should work with string dates', () => {
            expect(DateUtils.isTomorrow('2024-01-16')).toBe(true)
        })

        it('should return false for invalid dates', () => {
            expect(DateUtils.isTomorrow('invalid')).toBe(false)
        })
    })

    describe('isValidDate', () => {
        it('should return true for valid dates', () => {
            expect(DateUtils.isValidDate(new Date(2024, 0, 15))).toBe(true)
            expect(DateUtils.isValidDate('2024-01-15')).toBe(true)
        })

        it('should return false for invalid dates', () => {
            expect(DateUtils.isValidDate('invalid')).toBe(false)
            expect(DateUtils.isValidDate(new Date('invalid'))).toBe(false)
        })
    })

    describe('getCurrentMonthRange', () => {
        it('should return current month range', () => {
            const range = DateUtils.getCurrentMonthRange()
            expect(range.start.getDate()).toBe(1)
            expect(range.start.getMonth()).toBe(0) // January (0-indexed)
            expect(range.end.getDate()).toBe(31)
            expect(range.end.getMonth()).toBe(0)
        })
    })

    describe('getRelativeTimeDescription', () => {
        it('should return "Today" for today', () => {
            const today = new Date(2024, 0, 15) // January 15, 2024
            expect(DateUtils.getRelativeTimeDescription(today)).toBe('Today')
        })

        it('should return "Yesterday" for yesterday', () => {
            const yesterday = new Date(2024, 0, 14) // January 14, 2024
            expect(DateUtils.getRelativeTimeDescription(yesterday)).toBe('Yesterday')
        })

        it('should return "Tomorrow" for tomorrow', () => {
            const tomorrow = new Date(2024, 0, 16) // January 16, 2024
            expect(DateUtils.getRelativeTimeDescription(tomorrow)).toBe('Tomorrow')
        })

        it('should return formatted date for other dates', () => {
            const otherDate = new Date(2024, 0, 10) // January 10, 2024
            expect(DateUtils.getRelativeTimeDescription(otherDate)).toBe('10/01/2024')
        })

        it('should work with string dates', () => {
            expect(DateUtils.getRelativeTimeDescription('2024-01-15')).toBe('Today')
        })

        it('should return "Invalid date" for invalid dates', () => {
            expect(DateUtils.getRelativeTimeDescription('invalid')).toBe('Invalid date')
        })
    })
})