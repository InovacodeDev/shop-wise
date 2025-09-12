/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException } from '@nestjs/common';

import { UuidUtil } from '../src/utils/uuid.util';

describe('UuidUtil', () => {
    describe('isValidUuid', () => {
        it('should return true for valid UUID v1 format', () => {
            const validV1Uuid = '550e8400-e29b-11d4-a716-446655440000';
            expect(UuidUtil.isValidUuid(validV1Uuid)).toBe(true);
        });

        it('should return true for valid UUID v4 format', () => {
            const validV4Uuid = '550e8400-e29b-41d4-a716-446655440000';
            expect(UuidUtil.isValidUuid(validV4Uuid)).toBe(true);
        });

        it('should return true for valid UUID v3 format', () => {
            const validV3Uuid = '550e8400-e29b-31d4-a716-446655440000';
            expect(UuidUtil.isValidUuid(validV3Uuid)).toBe(true);
        });

        it('should return true for valid UUID v5 format', () => {
            const validV5Uuid = '550e8400-e29b-51d4-a716-446655440000';
            expect(UuidUtil.isValidUuid(validV5Uuid)).toBe(true);
        });

        it('should return true for uppercase UUID', () => {
            const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000';
            expect(UuidUtil.isValidUuid(uppercaseUuid)).toBe(true);
        });

        it('should return true for mixed case UUID', () => {
            const mixedCaseUuid = '550e8400-E29B-41d4-A716-446655440000';
            expect(UuidUtil.isValidUuid(mixedCaseUuid)).toBe(true);
        });

        it('should return false for invalid UUID format - wrong length', () => {
            const invalidUuid = '550e8400-e29b-41d4-a716-44665544000';
            expect(UuidUtil.isValidUuid(invalidUuid)).toBe(false);
        });

        it('should return false for invalid UUID format - missing hyphens', () => {
            const invalidUuid = '550e8400e29b41d4a716446655440000';
            expect(UuidUtil.isValidUuid(invalidUuid)).toBe(false);
        });

        it('should return false for invalid UUID format - wrong version', () => {
            const invalidUuid = '550e8400-e29b-61d4-a716-446655440000';
            expect(UuidUtil.isValidUuid(invalidUuid)).toBe(false);
        });

        it('should return false for invalid UUID format - wrong variant', () => {
            const invalidUuid = '550e8400-e29b-41d4-c716-446655440000';
            expect(UuidUtil.isValidUuid(invalidUuid)).toBe(false);
        });

        it('should return false for invalid characters', () => {
            const invalidUuid = '550g8400-e29b-41d4-a716-446655440000';
            expect(UuidUtil.isValidUuid(invalidUuid)).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(UuidUtil.isValidUuid('')).toBe(false);
        });

        it('should return false for null input', () => {
            expect(UuidUtil.isValidUuid(null as any)).toBe(false);
        });

        it('should return false for undefined input', () => {
            expect(UuidUtil.isValidUuid(undefined as any)).toBe(false);
        });

        it('should return false for non-string input', () => {
            expect(UuidUtil.isValidUuid(123 as any)).toBe(false);
            expect(UuidUtil.isValidUuid({} as any)).toBe(false);
            expect(UuidUtil.isValidUuid([] as any)).toBe(false);
        });

        it('should return false for random string', () => {
            const randomString = 'not-a-uuid-at-all';
            expect(UuidUtil.isValidUuid(randomString)).toBe(false);
        });
    });

    describe('validateUuid', () => {
        it('should not throw for valid UUID v1 format', () => {
            const validV1Uuid = '550e8400-e29b-11d4-a716-446655440000';
            expect(() => UuidUtil.validateUuid(validV1Uuid)).not.toThrow();
        });

        it('should not throw for valid UUID v4 format', () => {
            const validV4Uuid = '550e8400-e29b-41d4-a716-446655440000';
            expect(() => UuidUtil.validateUuid(validV4Uuid)).not.toThrow();
        });

        it('should not throw for valid UUID v3 format', () => {
            const validV3Uuid = '550e8400-e29b-31d4-a716-446655440000';
            expect(() => UuidUtil.validateUuid(validV3Uuid)).not.toThrow();
        });

        it('should not throw for valid UUID v5 format', () => {
            const validV5Uuid = '550e8400-e29b-51d4-a716-446655440000';
            expect(() => UuidUtil.validateUuid(validV5Uuid)).not.toThrow();
        });

        it('should not throw for uppercase UUID', () => {
            const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000';
            expect(() => UuidUtil.validateUuid(uppercaseUuid)).not.toThrow();
        });

        it('should throw BadRequestException for invalid UUID format', () => {
            const invalidUuid = '550e8400-e29b-41d4-a716-44665544000';
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(`Invalid UUID format: ${invalidUuid}`);
        });

        it('should throw BadRequestException for missing hyphens', () => {
            const invalidUuid = '550e8400e29b41d4a716446655440000';
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(`Invalid UUID format: ${invalidUuid}`);
        });

        it('should throw BadRequestException for wrong version', () => {
            const invalidUuid = '550e8400-e29b-61d4-a716-446655440000';
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(`Invalid UUID format: ${invalidUuid}`);
        });

        it('should throw BadRequestException for wrong variant', () => {
            const invalidUuid = '550e8400-e29b-41d4-c716-446655440000';
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(`Invalid UUID format: ${invalidUuid}`);
        });

        it('should throw BadRequestException for invalid characters', () => {
            const invalidUuid = '550g8400-e29b-41d4-a716-446655440000';
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(invalidUuid)).toThrow(`Invalid UUID format: ${invalidUuid}`);
        });

        it('should throw BadRequestException for empty string', () => {
            const emptyString = '';
            expect(() => UuidUtil.validateUuid(emptyString)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(emptyString)).toThrow(`Invalid UUID format: ${emptyString}`);
        });

        it('should throw BadRequestException for null input', () => {
            const nullInput = null as any;
            expect(() => UuidUtil.validateUuid(nullInput)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(nullInput)).toThrow(`Invalid UUID format: ${nullInput}`);
        });

        it('should throw BadRequestException for undefined input', () => {
            const undefinedInput = undefined as any;
            expect(() => UuidUtil.validateUuid(undefinedInput)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(undefinedInput)).toThrow(`Invalid UUID format: ${undefinedInput}`);
        });

        it('should throw BadRequestException for non-string input', () => {
            const numberInput = 123 as any;
            expect(() => UuidUtil.validateUuid(numberInput)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(numberInput)).toThrow(`Invalid UUID format: ${numberInput}`);

            const objectInput = {} as any;
            expect(() => UuidUtil.validateUuid(objectInput)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(objectInput)).toThrow(`Invalid UUID format: ${objectInput}`);

            const arrayInput = [] as any;
            expect(() => UuidUtil.validateUuid(arrayInput)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(arrayInput)).toThrow(`Invalid UUID format: ${arrayInput}`);
        });

        it('should throw BadRequestException for random string', () => {
            const randomString = 'not-a-uuid-at-all';
            expect(() => UuidUtil.validateUuid(randomString)).toThrow(BadRequestException);
            expect(() => UuidUtil.validateUuid(randomString)).toThrow(`Invalid UUID format: ${randomString}`);
        });
    });

    describe('generateUuid', () => {
        it('should generate a valid UUID v4', () => {
            const generatedUuid = UuidUtil.generateUuid();
            expect(UuidUtil.isValidUuid(generatedUuid)).toBe(true);
        });

        it('should generate unique UUIDs', () => {
            const uuid1 = UuidUtil.generateUuid();
            const uuid2 = UuidUtil.generateUuid();
            expect(uuid1).not.toBe(uuid2);
        });

        it('should generate UUIDs in correct format', () => {
            const generatedUuid = UuidUtil.generateUuid();
            // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            // where y is one of [8, 9, a, b]
            const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(uuidV4Regex.test(generatedUuid)).toBe(true);
        });

        it('should generate multiple unique UUIDs', () => {
            const uuids = new Set();
            const count = 100;

            for (let i = 0; i < count; i++) {
                const uuid = UuidUtil.generateUuid();
                expect(UuidUtil.isValidUuid(uuid)).toBe(true);
                uuids.add(uuid);
            }

            // All generated UUIDs should be unique
            expect(uuids.size).toBe(count);
        });
    });

    describe('edge cases and boundary conditions', () => {
        it('should handle whitespace in UUID strings', () => {
            const uuidWithSpaces = ' 550e8400-e29b-41d4-a716-446655440000 ';
            expect(UuidUtil.isValidUuid(uuidWithSpaces)).toBe(false);
            expect(() => UuidUtil.validateUuid(uuidWithSpaces)).toThrow(BadRequestException);
        });

        it('should handle UUID with extra characters', () => {
            const uuidWithExtra = '550e8400-e29b-41d4-a716-446655440000x';
            expect(UuidUtil.isValidUuid(uuidWithExtra)).toBe(false);
            expect(() => UuidUtil.validateUuid(uuidWithExtra)).toThrow(BadRequestException);
        });

        it('should handle UUID with missing characters', () => {
            const shortUuid = '550e8400-e29b-41d4-a716-44665544000';
            expect(UuidUtil.isValidUuid(shortUuid)).toBe(false);
            expect(() => UuidUtil.validateUuid(shortUuid)).toThrow(BadRequestException);
        });

        it('should handle UUID with wrong hyphen positions', () => {
            const wrongHyphens = '550e840-0e29b-41d4-a716-446655440000';
            expect(UuidUtil.isValidUuid(wrongHyphens)).toBe(false);
            expect(() => UuidUtil.validateUuid(wrongHyphens)).toThrow(BadRequestException);
        });

        it('should handle all zeros UUID', () => {
            const allZeros = '00000000-0000-4000-8000-000000000000';
            expect(UuidUtil.isValidUuid(allZeros)).toBe(true);
            expect(() => UuidUtil.validateUuid(allZeros)).not.toThrow();
        });

        it('should handle all Fs UUID', () => {
            const allFs = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
            expect(UuidUtil.isValidUuid(allFs)).toBe(true);
            expect(() => UuidUtil.validateUuid(allFs)).not.toThrow();
        });
    });
});
