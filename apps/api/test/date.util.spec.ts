/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MONTHLY_GROUPING_CONSTANTS } from '../src/models/monthly-purchase-group';
import { DateUtil } from '../src/utils/date.util';

describe('DateUtil', () => {
    describe('extractDateInfo', () => {
        it('should return invalid for null date', () => {
            const result = DateUtil.extractDateInfo(null);

            expect(result.isValid).toBe(false);
            expect(result.originalDate).toBe(null);
            expect(result.monthKey).toBe(null);
        });

        it('should return invalid for undefined date', () => {
            const result = DateUtil.extractDateInfo(undefined);

            expect(result.isValid).toBe(false);
            expect(result.originalDate).toBe(undefined);
            expect(result.monthKey).toBe(null);
        });

        it('should return invalid for invalid date object', () => {
            const invalidDate = new Date('invalid-date');
            const result = DateUtil.extractDateInfo(invalidDate);

            expect(result.isValid).toBe(false);
            expect(result.originalDate).toBe(invalidDate);
            expect(result.monthKey).toBe(null);
        });

        it('should return valid info for valid date', () => {
            const validDate = new Date('2024-01-15');
            const result = DateUtil.extractDateInfo(validDate);

            expect(result.isValid).toBe(true);
            expect(result.originalDate).toBe(validDate);
            expect(result.monthKey).not.toBe(null);
            expect(result.monthKey!.year).toBe(2024);
            expect(result.monthKey!.month).toBe(1);
            expect(result.monthKey!.key).toBe('2024-01');
            expect(result.monthKey!.displayName).toBe('January 2024');
        });

        it('should handle edge case dates correctly', () => {
            // Test leap year February
            const leapYearDate = new Date('2024-02-29');
            const result = DateUtil.extractDateInfo(leapYearDate);

            expect(result.isValid).toBe(true);
            expect(result.monthKey!.month).toBe(2);
            expect(result.monthKey!.displayName).toBe('February 2024');
        });
    });

    describe('createMonthKey', () => {
        it('should create correct month key for valid inputs', () => {
            const result = DateUtil.createMonthKey(2024, 1);

            expect(result.year).toBe(2024);
            expect(result.month).toBe(1);
            expect(result.key).toBe('2024-01');
            expect(result.displayName).toBe('January 2024');
        });

        it('should pad single digit months with zero', () => {
            const result = DateUtil.createMonthKey(2024, 5);

            expect(result.key).toBe('2024-05');
            expect(result.displayName).toBe('May 2024');
        });

        it('should handle December correctly', () => {
            const result = DateUtil.createMonthKey(2024, 12);

            expect(result.key).toBe('2024-12');
            expect(result.displayName).toBe('December 2024');
        });

        it('should throw error for invalid month (too low)', () => {
            expect(() => DateUtil.createMonthKey(2024, 0)).toThrow('Invalid month: 0. Month must be between 1 and 12.');
        });

        it('should throw error for invalid month (too high)', () => {
            expect(() => DateUtil.createMonthKey(2024, 13)).toThrow(
                'Invalid month: 13. Month must be between 1 and 12.',
            );
        });

        it('should handle different years correctly', () => {
            const result2023 = DateUtil.createMonthKey(2023, 6);
            const result2024 = DateUtil.createMonthKey(2024, 6);

            expect(result2023.key).toBe('2023-06');
            expect(result2023.displayName).toBe('June 2023');
            expect(result2024.key).toBe('2024-06');
            expect(result2024.displayName).toBe('June 2024');
        });
    });

    describe('getCurrentMonthKey', () => {
        it('should return current month key', () => {
            const now = new Date();
            const result = DateUtil.getCurrentMonthKey();

            expect(result.year).toBe(now.getFullYear());
            expect(result.month).toBe(now.getMonth() + 1);
            expect(result.key).toBe(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
        });
    });

    describe('compareMonthKeys', () => {
        it('should sort month keys in descending order by default', () => {
            const result = DateUtil.compareMonthKeys('2024-01', '2024-02');
            expect(result).toBeGreaterThan(0); // 2024-01 should come after 2024-02 in desc order
        });

        it('should sort month keys in ascending order when specified', () => {
            const result = DateUtil.compareMonthKeys('2024-01', '2024-02', 'asc');
            expect(result).toBeLessThan(0); // 2024-01 should come before 2024-02 in asc order
        });

        it('should handle no-date key correctly (always last)', () => {
            const result1 = DateUtil.compareMonthKeys(MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY, '2024-01');
            const result2 = DateUtil.compareMonthKeys('2024-01', MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY);

            expect(result1).toBeGreaterThan(0); // no-date should come after regular dates
            expect(result2).toBeLessThan(0); // regular dates should come before no-date
        });

        it('should handle same keys correctly', () => {
            const result = DateUtil.compareMonthKeys('2024-01', '2024-01');
            expect(Math.abs(result)).toBe(0); // Handle -0 vs 0 issue
        });

        it('should handle cross-year comparisons', () => {
            const result = DateUtil.compareMonthKeys('2023-12', '2024-01');
            expect(result).toBeGreaterThan(0); // 2023-12 should come after 2024-01 in desc order
        });
    });

    describe('compareDates', () => {
        it('should sort dates in descending order by default', () => {
            const date1 = new Date('2024-01-15');
            const date2 = new Date('2024-01-20');
            const result = DateUtil.compareDates(date1, date2);

            expect(result).toBeGreaterThan(0); // date1 should come after date2 in desc order
        });

        it('should sort dates in ascending order when specified', () => {
            const date1 = new Date('2024-01-15');
            const date2 = new Date('2024-01-20');
            const result = DateUtil.compareDates(date1, date2, 'asc');

            expect(result).toBeLessThan(0); // date1 should come before date2 in asc order
        });

        it('should handle null dates (always last)', () => {
            const date = new Date('2024-01-15');
            const result1 = DateUtil.compareDates(null, date);
            const result2 = DateUtil.compareDates(date, null);

            expect(result1).toBeGreaterThan(0); // null should come after valid dates
            expect(result2).toBeLessThan(0); // valid dates should come before null
        });

        it('should handle undefined dates (always last)', () => {
            const date = new Date('2024-01-15');
            const result1 = DateUtil.compareDates(undefined, date);
            const result2 = DateUtil.compareDates(date, undefined);

            expect(result1).toBeGreaterThan(0); // undefined should come after valid dates
            expect(result2).toBeLessThan(0); // valid dates should come before undefined
        });

        it('should handle both null dates', () => {
            const result = DateUtil.compareDates(null, null);
            expect(result).toBe(0);
        });

        it('should handle both undefined dates', () => {
            const result = DateUtil.compareDates(undefined, undefined);
            expect(result).toBe(0);
        });

        it('should handle invalid dates (always last)', () => {
            const validDate = new Date('2024-01-15');
            const invalidDate = new Date('invalid-date');

            const result1 = DateUtil.compareDates(invalidDate, validDate);
            const result2 = DateUtil.compareDates(validDate, invalidDate);

            expect(result1).toBeGreaterThan(0); // invalid should come after valid
            expect(result2).toBeLessThan(0); // valid should come before invalid
        });

        it('should handle both invalid dates', () => {
            const invalidDate1 = new Date('invalid-date');
            const invalidDate2 = new Date(NaN);
            const result = DateUtil.compareDates(invalidDate1, invalidDate2);

            expect(result).toBe(0);
        });
    });

    describe('isReasonablePurchaseDate', () => {
        it('should return true for current date', () => {
            const now = new Date();
            expect(DateUtil.isReasonablePurchaseDate(now)).toBe(true);
        });

        it('should return true for recent past dates', () => {
            const recentDate = new Date();
            recentDate.setMonth(recentDate.getMonth() - 6);
            expect(DateUtil.isReasonablePurchaseDate(recentDate)).toBe(true);
        });

        it('should return true for dates within 10 years ago', () => {
            const oldDate = new Date();
            oldDate.setFullYear(oldDate.getFullYear() - 5);
            expect(DateUtil.isReasonablePurchaseDate(oldDate)).toBe(true);
        });

        it('should return false for dates more than 10 years ago', () => {
            const veryOldDate = new Date();
            veryOldDate.setFullYear(veryOldDate.getFullYear() - 11);
            expect(DateUtil.isReasonablePurchaseDate(veryOldDate)).toBe(false);
        });

        it('should return true for near future dates', () => {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 6);
            expect(DateUtil.isReasonablePurchaseDate(futureDate)).toBe(true);
        });

        it('should return false for far future dates', () => {
            const farFutureDate = new Date();
            farFutureDate.setFullYear(farFutureDate.getFullYear() + 2);
            expect(DateUtil.isReasonablePurchaseDate(farFutureDate)).toBe(false);
        });

        it('should return false for null date', () => {
            expect(DateUtil.isReasonablePurchaseDate(null as any)).toBe(false);
        });

        it('should return false for undefined date', () => {
            expect(DateUtil.isReasonablePurchaseDate(undefined as any)).toBe(false);
        });

        it('should return false for invalid date', () => {
            const invalidDate = new Date('invalid-date');
            expect(DateUtil.isReasonablePurchaseDate(invalidDate)).toBe(false);
        });
    });

    describe('formatPurchaseDate', () => {
        it('should format valid date correctly', () => {
            const date = new Date('2024-01-15T12:00:00.000Z'); // Use explicit UTC time
            const result = DateUtil.formatPurchaseDate(date);

            // The exact format may vary by locale, but should contain the key elements
            expect(result).toMatch(/Jan.*15.*2024/);
        });

        it('should return "No Date" for null date', () => {
            const result = DateUtil.formatPurchaseDate(null);
            expect(result).toBe('No Date');
        });

        it('should return "No Date" for undefined date', () => {
            const result = DateUtil.formatPurchaseDate(undefined);
            expect(result).toBe('No Date');
        });

        it('should return "No Date" for invalid date', () => {
            const invalidDate = new Date('invalid-date');
            const result = DateUtil.formatPurchaseDate(invalidDate);
            expect(result).toBe('No Date');
        });
    });

    describe('getMonthKeyForDate', () => {
        it('should return correct month key for valid date', () => {
            const date = new Date('2024-01-15');
            const result = DateUtil.getMonthKeyForDate(date);

            expect(result).toBe('2024-01');
        });

        it('should return NO_DATE_KEY for null date', () => {
            const result = DateUtil.getMonthKeyForDate(null);
            expect(result).toBe(MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY);
        });

        it('should return NO_DATE_KEY for undefined date', () => {
            const result = DateUtil.getMonthKeyForDate(undefined);
            expect(result).toBe(MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY);
        });

        it('should return NO_DATE_KEY for invalid date', () => {
            const invalidDate = new Date('invalid-date');
            const result = DateUtil.getMonthKeyForDate(invalidDate);
            expect(result).toBe(MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY);
        });
    });

    describe('getDisplayNameForDate', () => {
        it('should return correct display name for valid date', () => {
            const date = new Date('2024-01-15');
            const result = DateUtil.getDisplayNameForDate(date);

            expect(result).toBe('January 2024');
        });

        it('should return NO_DATE_DISPLAY for null date', () => {
            const result = DateUtil.getDisplayNameForDate(null);
            expect(result).toBe(MONTHLY_GROUPING_CONSTANTS.NO_DATE_DISPLAY);
        });

        it('should return NO_DATE_DISPLAY for undefined date', () => {
            const result = DateUtil.getDisplayNameForDate(undefined);
            expect(result).toBe(MONTHLY_GROUPING_CONSTANTS.NO_DATE_DISPLAY);
        });

        it('should return NO_DATE_DISPLAY for invalid date', () => {
            const invalidDate = new Date('invalid-date');
            const result = DateUtil.getDisplayNameForDate(invalidDate);
            expect(result).toBe(MONTHLY_GROUPING_CONSTANTS.NO_DATE_DISPLAY);
        });
    });

    describe('Month Names', () => {
        it('should have all 12 month names', () => {
            expect(MONTHLY_GROUPING_CONSTANTS.MONTH_NAMES).toHaveLength(12);
        });

        it('should have correct month names in order', () => {
            const expectedMonths = [
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
            ];

            expect(MONTHLY_GROUPING_CONSTANTS.MONTH_NAMES).toEqual(expectedMonths);
        });
    });
});
