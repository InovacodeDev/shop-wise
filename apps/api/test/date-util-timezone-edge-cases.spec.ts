import { DateUtil } from '../src/utils/date.util';

describe('DateUtil - Timezone Edge Cases', () => {
    describe('extractDateInfo with timezone handling', () => {
        it('should handle UTC midnight correctly', () => {
            const utcMidnight = new Date('2024-01-01T00:00:00.000Z');
            const result = DateUtil.extractDateInfo(utcMidnight, true);

            expect(result.isValid).toBe(true);
            expect(result.monthKey?.key).toBe('2024-01');
            expect(result.monthKey?.displayName).toBe('January 2024');
        });

        it('should handle end of month in different timezones', () => {
            // Last second of January in UTC
            const endOfJanUTC = new Date('2024-01-31T23:59:59.999Z');
            const result = DateUtil.extractDateInfo(endOfJanUTC, true);

            expect(result.isValid).toBe(true);
            expect(result.monthKey?.key).toBe('2024-01');
            expect(result.monthKey?.displayName).toBe('January 2024');
        });

        it('should handle first second of month in different timezones', () => {
            // First second of February in UTC
            const startOfFebUTC = new Date('2024-02-01T00:00:00.000Z');
            const result = DateUtil.extractDateInfo(startOfFebUTC, true);

            expect(result.isValid).toBe(true);
            expect(result.monthKey?.key).toBe('2024-02');
            expect(result.monthKey?.displayName).toBe('February 2024');
        });

        it('should handle daylight saving time transitions', () => {
            // Spring forward in US (March 10, 2024)
            const springForward = new Date('2024-03-10T07:00:00.000Z'); // 2 AM EST becomes 3 AM EDT
            const result = DateUtil.extractDateInfo(springForward, true);

            expect(result.isValid).toBe(true);
            expect(result.monthKey?.key).toBe('2024-03');
        });

        it('should handle leap year edge cases', () => {
            // February 29, 2024 (leap year)
            const leapDay = new Date('2024-02-29T12:00:00.000Z');
            const result = DateUtil.extractDateInfo(leapDay, true);

            expect(result.isValid).toBe(true);
            expect(result.monthKey?.key).toBe('2024-02');
            expect(result.monthKey?.displayName).toBe('February 2024');
        });

        it('should handle non-leap year February 28', () => {
            // February 28, 2023 (non-leap year)
            const nonLeapFeb28 = new Date('2023-02-28T23:59:59.999Z');
            const result = DateUtil.extractDateInfo(nonLeapFeb28, true);

            expect(result.isValid).toBe(true);
            expect(result.monthKey?.key).toBe('2023-02');
        });

        it('should handle year boundary transitions', () => {
            // New Year's Eve
            const newYearsEve = new Date('2023-12-31T23:59:59.999Z');
            const newYearsDay = new Date('2024-01-01T00:00:00.000Z');

            const eveResult = DateUtil.extractDateInfo(newYearsEve, true);
            const dayResult = DateUtil.extractDateInfo(newYearsDay, true);

            expect(eveResult.monthKey?.key).toBe('2023-12');
            expect(dayResult.monthKey?.key).toBe('2024-01');
        });

        it('should handle different timezone offsets consistently', () => {
            // Same moment in time, different timezone representations
            const utcTime = new Date('2024-06-15T12:00:00.000Z');
            const estTime = new Date('2024-06-15T08:00:00.000-04:00'); // EDT
            const pstTime = new Date('2024-06-15T05:00:00.000-07:00'); // PDT

            const utcResult = DateUtil.extractDateInfo(utcTime, true);
            const estResult = DateUtil.extractDateInfo(estTime, true);
            const pstResult = DateUtil.extractDateInfo(pstTime, true);

            // All should produce the same month key when using UTC
            expect(utcResult.monthKey?.key).toBe('2024-06');
            expect(estResult.monthKey?.key).toBe('2024-06');
            expect(pstResult.monthKey?.key).toBe('2024-06');
        });

        it('should handle local vs UTC extraction differences', () => {
            // Date that might be in different months depending on timezone
            const borderlineDate = new Date('2024-01-01T01:00:00.000Z');

            const utcResult = DateUtil.extractDateInfo(borderlineDate, true);
            const localResult = DateUtil.extractDateInfo(borderlineDate, false);

            expect(utcResult.monthKey?.key).toBe('2024-01');
            // Local result depends on system timezone, but should still be valid
            expect(localResult.isValid).toBe(true);
        });
    });

    describe('normalizeToUTCDate', () => {
        it('should normalize dates to UTC midnight', () => {
            const inputDate = new Date('2024-06-15T14:30:45.123Z');
            const normalized = DateUtil.normalizeToUTCDate(inputDate);

            expect(normalized).not.toBeNull();
            expect(normalized!.getUTCFullYear()).toBe(2024);
            expect(normalized!.getUTCMonth()).toBe(5); // June (0-indexed)
            expect(normalized!.getUTCDate()).toBe(15);
            expect(normalized!.getUTCHours()).toBe(0);
            expect(normalized!.getUTCMinutes()).toBe(0);
            expect(normalized!.getUTCSeconds()).toBe(0);
            expect(normalized!.getUTCMilliseconds()).toBe(0);
        });

        it('should handle null dates', () => {
            const result = DateUtil.normalizeToUTCDate(null);
            expect(result).toBeNull();
        });

        it('should handle undefined dates', () => {
            const result = DateUtil.normalizeToUTCDate(undefined);
            expect(result).toBeNull();
        });

        it('should handle invalid dates', () => {
            const invalidDate = new Date('invalid');
            const result = DateUtil.normalizeToUTCDate(invalidDate);
            expect(result).toBeNull();
        });

        it('should preserve the calendar date regardless of input timezone', () => {
            // Same calendar date in different timezones
            const utcDate = new Date('2024-06-15T00:00:00.000Z');
            const estDate = new Date('2024-06-15T04:00:00.000Z'); // 6/15 midnight EST
            const pstDate = new Date('2024-06-15T07:00:00.000Z'); // 6/15 midnight PST

            const utcNormalized = DateUtil.normalizeToUTCDate(utcDate);
            const estNormalized = DateUtil.normalizeToUTCDate(estDate);
            const pstNormalized = DateUtil.normalizeToUTCDate(pstDate);

            // All should normalize to the same UTC date
            expect(utcNormalized?.toISOString()).toBe('2024-06-15T00:00:00.000Z');
            expect(estNormalized?.toISOString()).toBe('2024-06-15T00:00:00.000Z');
            expect(pstNormalized?.toISOString()).toBe('2024-06-15T00:00:00.000Z');
        });
    });

    describe('areDatesInSameMonth', () => {
        it('should return true for dates in the same month', () => {
            const date1 = new Date('2024-06-01T00:00:00.000Z');
            const date2 = new Date('2024-06-30T23:59:59.999Z');

            expect(DateUtil.areDatesInSameMonth(date1, date2)).toBe(true);
        });

        it('should return false for dates in different months', () => {
            const date1 = new Date('2024-06-30T23:59:59.999Z');
            const date2 = new Date('2024-07-01T00:00:00.000Z');

            expect(DateUtil.areDatesInSameMonth(date1, date2)).toBe(false);
        });

        it('should return false for dates in same month but different years', () => {
            const date1 = new Date('2023-06-15T12:00:00.000Z');
            const date2 = new Date('2024-06-15T12:00:00.000Z');

            expect(DateUtil.areDatesInSameMonth(date1, date2)).toBe(false);
        });

        it('should handle null dates', () => {
            const validDate = new Date('2024-06-15T12:00:00.000Z');

            expect(DateUtil.areDatesInSameMonth(null, validDate)).toBe(false);
            expect(DateUtil.areDatesInSameMonth(validDate, null)).toBe(false);
            expect(DateUtil.areDatesInSameMonth(null, null)).toBe(false);
        });

        it('should handle invalid dates', () => {
            const validDate = new Date('2024-06-15T12:00:00.000Z');
            const invalidDate = new Date('invalid');

            expect(DateUtil.areDatesInSameMonth(invalidDate, validDate)).toBe(false);
            expect(DateUtil.areDatesInSameMonth(validDate, invalidDate)).toBe(false);
        });

        it('should handle timezone edge cases correctly', () => {
            // Dates that appear to be in different months in local time but same month in UTC
            const endOfMonthUTC = new Date('2024-06-30T23:00:00.000Z');
            const startOfNextMonthLocal = new Date('2024-07-01T01:00:00.000Z');

            // These are in different months in UTC
            expect(DateUtil.areDatesInSameMonth(endOfMonthUTC, startOfNextMonthLocal)).toBe(false);
        });
    });

    describe('Timezone consistency across operations', () => {
        it('should maintain consistency between getMonthKeyForDate and extractDateInfo', () => {
            const testDate = new Date('2024-06-15T14:30:00.000Z');

            const monthKey = DateUtil.getMonthKeyForDate(testDate, true);
            const dateInfo = DateUtil.extractDateInfo(testDate, true);

            expect(monthKey).toBe(dateInfo.monthKey?.key);
        });

        it('should handle edge case dates consistently across all methods', () => {
            const edgeCases = [
                new Date('2024-01-01T00:00:00.000Z'), // New Year midnight
                new Date('2024-12-31T23:59:59.999Z'), // End of year
                new Date('2024-02-29T12:00:00.000Z'), // Leap day
                new Date('2024-03-10T07:00:00.000Z'), // DST transition
            ];

            edgeCases.forEach((date) => {
                const monthKey = DateUtil.getMonthKeyForDate(date, true);
                const dateInfo = DateUtil.extractDateInfo(date, true);
                const displayName = DateUtil.getDisplayNameForDate(date, true);

                expect(monthKey).toBe(dateInfo.monthKey?.key);
                expect(displayName).toBe(dateInfo.monthKey?.displayName);
                expect(dateInfo.isValid).toBe(true);
            });
        });

        it('should handle international date line edge cases', () => {
            // Dates around the international date line
            const beforeDateLine = new Date('2024-06-15T11:59:59.999Z'); // UTC-12 would be previous day
            const afterDateLine = new Date('2024-06-15T12:00:00.000Z'); // UTC+12 would be next day

            const beforeKey = DateUtil.getMonthKeyForDate(beforeDateLine, true);
            const afterKey = DateUtil.getMonthKeyForDate(afterDateLine, true);

            // Both should be in the same month when using UTC
            expect(beforeKey).toBe('2024-06');
            expect(afterKey).toBe('2024-06');
        });

        it('should handle extreme timezone offsets', () => {
            // Test with extreme timezone offsets (UTC+14 and UTC-12)
            const extremePositive = new Date('2024-06-15T10:00:00.000Z'); // Would be next day in UTC+14
            const extremeNegative = new Date('2024-06-15T14:00:00.000Z'); // Would be previous day in UTC-12

            const positiveKey = DateUtil.getMonthKeyForDate(extremePositive, true);
            const negativeKey = DateUtil.getMonthKeyForDate(extremeNegative, true);

            // Both should use UTC date for consistency
            expect(positiveKey).toBe('2024-06');
            expect(negativeKey).toBe('2024-06');
        });
    });

    describe('Performance under timezone stress', () => {
        it('should handle large numbers of dates with different timezones efficiently', () => {
            const dates = Array.from({ length: 1000 }, (_, i) => {
                // Create dates with various timezone offsets
                const baseTime = new Date('2024-01-01T00:00:00.000Z').getTime();
                const randomOffset = (i % 24) * 60 * 60 * 1000; // 0-23 hour offsets
                return new Date(baseTime + randomOffset);
            });

            const startTime = performance.now();

            const monthKeys = dates.map((date) => DateUtil.getMonthKeyForDate(date, true));

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should complete within reasonable time (less than 100ms for 1000 dates)
            expect(duration).toBeLessThan(100);
            expect(monthKeys).toHaveLength(1000);

            // All dates should be processed correctly
            monthKeys.forEach((key) => {
                expect(key).toMatch(/^\d{4}-\d{2}$/);
            });
        });
    });
});
