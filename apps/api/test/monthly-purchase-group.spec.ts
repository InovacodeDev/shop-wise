import {
    DateInfo,
    MONTHLY_GROUPING_CONSTANTS,
    MonthKey,
    MonthlyGroupingOptions,
    MonthlyGroupingResult,
    MonthlyPurchaseGroup,
} from '../src/models/monthly-purchase-group';
import { Purchase } from '../src/models/purchase';

describe('MonthlyPurchaseGroup Types', () => {
    describe('MonthlyPurchaseGroup interface', () => {
        it('should create a valid MonthlyPurchaseGroup object', () => {
            const mockPurchases: Purchase[] = [
                {
                    _id: 'purchase-1',
                    familyId: 'family-1',
                    purchasedBy: 'user-1',
                    storeId: 'store-1',
                    accessKey: 'access-key-1',
                    date: new Date('2024-01-15'),
                    totalAmount: 100.5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const monthlyGroup: MonthlyPurchaseGroup = {
                monthYear: '2024-01',
                displayName: 'January 2024',
                totalAmount: 100.5,
                purchaseCount: 1,
                purchases: mockPurchases,
            };

            expect(monthlyGroup.monthYear).toBe('2024-01');
            expect(monthlyGroup.displayName).toBe('January 2024');
            expect(monthlyGroup.totalAmount).toBe(100.5);
            expect(monthlyGroup.purchaseCount).toBe(1);
            expect(monthlyGroup.purchases).toHaveLength(1);
            expect(monthlyGroup.purchases[0]._id).toBe('purchase-1');
        });
    });

    describe('MonthKey interface', () => {
        it('should create a valid MonthKey object', () => {
            const monthKey: MonthKey = {
                year: 2024,
                month: 3,
                key: '2024-03',
                displayName: 'March 2024',
            };

            expect(monthKey.year).toBe(2024);
            expect(monthKey.month).toBe(3);
            expect(monthKey.key).toBe('2024-03');
            expect(monthKey.displayName).toBe('March 2024');
        });
    });

    describe('DateInfo interface', () => {
        it('should create a valid DateInfo object for valid date', () => {
            const date = new Date('2024-02-20');
            const monthKey: MonthKey = {
                year: 2024,
                month: 2,
                key: '2024-02',
                displayName: 'February 2024',
            };

            const dateInfo: DateInfo = {
                isValid: true,
                originalDate: date,
                monthKey: monthKey,
            };

            expect(dateInfo.isValid).toBe(true);
            expect(dateInfo.originalDate).toBe(date);
            expect(dateInfo.monthKey).toEqual(monthKey);
        });

        it('should create a valid DateInfo object for invalid date', () => {
            const dateInfo: DateInfo = {
                isValid: false,
                originalDate: null,
                monthKey: null,
            };

            expect(dateInfo.isValid).toBe(false);
            expect(dateInfo.originalDate).toBe(null);
            expect(dateInfo.monthKey).toBe(null);
        });
    });

    describe('MonthlyGroupingOptions interface', () => {
        it('should create valid options with all properties', () => {
            const options: MonthlyGroupingOptions = {
                includeNoDateGroup: true,
                sortOrder: 'desc',
                purchaseSortOrder: 'asc',
            };

            expect(options.includeNoDateGroup).toBe(true);
            expect(options.sortOrder).toBe('desc');
            expect(options.purchaseSortOrder).toBe('asc');
        });

        it('should create valid options with partial properties', () => {
            const options: MonthlyGroupingOptions = {
                sortOrder: 'asc',
            };

            expect(options.sortOrder).toBe('asc');
            expect(options.includeNoDateGroup).toBeUndefined();
            expect(options.purchaseSortOrder).toBeUndefined();
        });
    });

    describe('MonthlyGroupingResult interface', () => {
        it('should create a valid MonthlyGroupingResult object', () => {
            const mockGroups: MonthlyPurchaseGroup[] = [
                {
                    monthYear: '2024-01',
                    displayName: 'January 2024',
                    totalAmount: 150.75,
                    purchaseCount: 2,
                    purchases: [],
                },
            ];

            const result: MonthlyGroupingResult = {
                groups: mockGroups,
                totalPurchases: 2,
                validDatePurchases: 2,
                invalidDatePurchases: 0,
                overallTotal: 150.75,
            };

            expect(result.groups).toHaveLength(1);
            expect(result.totalPurchases).toBe(2);
            expect(result.validDatePurchases).toBe(2);
            expect(result.invalidDatePurchases).toBe(0);
            expect(result.overallTotal).toBe(150.75);
        });
    });

    describe('MONTHLY_GROUPING_CONSTANTS', () => {
        it('should have correct constant values', () => {
            expect(MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY).toBe('no-date');
            expect(MONTHLY_GROUPING_CONSTANTS.NO_DATE_DISPLAY).toBe('No Date');
            expect(MONTHLY_GROUPING_CONSTANTS.DEFAULT_OPTIONS.includeNoDateGroup).toBe(true);
            expect(MONTHLY_GROUPING_CONSTANTS.DEFAULT_OPTIONS.sortOrder).toBe('desc');
            expect(MONTHLY_GROUPING_CONSTANTS.DEFAULT_OPTIONS.purchaseSortOrder).toBe('desc');
            expect(MONTHLY_GROUPING_CONSTANTS.MONTH_NAMES).toHaveLength(12);
            expect(MONTHLY_GROUPING_CONSTANTS.MONTH_NAMES[0]).toBe('January');
            expect(MONTHLY_GROUPING_CONSTANTS.MONTH_NAMES[11]).toBe('December');
        });
    });
});
