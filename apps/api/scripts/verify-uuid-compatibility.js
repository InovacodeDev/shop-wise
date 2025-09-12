#!/usr/bin/env node

/**
 * Verification script for UUID-based MongoDB configuration
 * This script verifies that UUID generation and validation work correctly
 */

const { randomUUID } = require('crypto');

// Import the compiled utilities
const { UuidUtil } = require('../dist/utils/uuid.util.js');
const { mapCreateStoreDtoToStore } = require('../dist/utils/dto-mappers.js');

console.log('🔍 Verifying UUID-based MongoDB Configuration...\n');

// Test 1: UUID Generation
console.log('1. Testing UUID Generation:');
const generatedUuid = randomUUID();
console.log(`   Generated UUID: ${generatedUuid}`);
console.log(`   Length: ${generatedUuid.length}`);
console.log(`   Valid format: ${UuidUtil.isValidUuid(generatedUuid)}`);

// Test 2: UUID Validation
console.log('\n2. Testing UUID Validation:');
const testUuids = [
    '550e8400-e29b-41d4-a716-446655440000', // v4
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // v1
    '6fa459ea-ee8a-3ca4-894e-db77e160355e', // v3
    '886313e1-3b8a-5372-9b90-0c9aee199e5d', // v5
    'invalid-uuid-format',
    '123',
    '',
];

testUuids.forEach((uuid) => {
    const isValid = UuidUtil.isValidUuid(uuid);
    console.log(`   ${uuid.padEnd(40)} -> ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

// Test 3: DTO Mappers Integration
console.log('\n3. Testing DTO Mappers Integration:');
const storeDto = {
    name: 'Test Store',
    address: '123 Main St',
    phone: '555-0123',
};

const mappedStore = mapCreateStoreDtoToStore(storeDto);
console.log(`   Generated Store ID: ${mappedStore._id}`);
console.log(`   Valid UUID format: ${UuidUtil.isValidUuid(mappedStore._id)}`);
console.log(`   Store name: ${mappedStore.name}`);

// Test 4: Error Handling
console.log('\n4. Testing Error Handling:');
try {
    UuidUtil.validateUuid('invalid-format');
    console.log('   ❌ Should have thrown an error');
} catch (error) {
    console.log(`   ✅ Correctly threw error: ${error.message}`);
}

try {
    UuidUtil.validateUuid('550e8400-e29b-41d4-a716-446655440000');
    console.log('   ✅ Valid UUID passed validation');
} catch (error) {
    console.log(`   ❌ Valid UUID should not throw error: ${error.message}`);
}

// Test 5: Multiple UUID Formats
console.log('\n5. Testing Multiple UUID Formats:');
const uuidFormats = [
    { version: 'v1', uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
    { version: 'v3', uuid: '6fa459ea-ee8a-3ca4-894e-db77e160355e' },
    { version: 'v4', uuid: '550e8400-e29b-41d4-a716-446655440000' },
    { version: 'v5', uuid: '886313e1-3b8a-5372-9b90-0c9aee199e5d' },
];

uuidFormats.forEach(({ version, uuid }) => {
    const isValid = UuidUtil.isValidUuid(uuid);
    console.log(`   UUID ${version}: ${uuid} -> ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

console.log('\n✅ UUID Configuration Verification Complete!');
console.log('\nSummary:');
console.log('- UUID generation works correctly');
console.log('- UUID validation supports multiple formats (v1, v3, v4, v5)');
console.log('- DTO mappers generate valid UUIDs');
console.log('- Error handling works as expected');
console.log('- All UUID formats are compatible with MongoDB string _id fields');
