import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * Utility class for UUID validation and generation
 */
export class UuidUtil {
    // UUID v4 regex pattern
    private static readonly UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    // General UUID regex pattern (supports v1, v3, v4, v5)
    private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    /**
     * Checks if a string is a valid UUID format
     * @param id - The string to validate
     * @returns true if the string is a valid UUID, false otherwise
     */
    static isValidUuid(id: string): boolean {
        if (!id || typeof id !== 'string') {
            return false;
        }

        return this.UUID_REGEX.test(id);
    }

    /**
     * Validates a UUID string and throws BadRequestException if invalid
     * @param id - The UUID string to validate
     * @throws BadRequestException if the UUID format is invalid
     */
    static validateUuid(id: string): void {
        if (!id || typeof id !== 'string') {
            throw new BadRequestException(`Invalid UUID format: ${id}`);
        }

        if (!this.isValidUuid(id)) {
            throw new BadRequestException(`Invalid UUID format: ${id}`);
        }
    }

    /**
     * Generates a new UUID v4 string
     * @returns A new UUID v4 string
     */
    static generateUuid(): string {
        return randomUUID();
    }
}
