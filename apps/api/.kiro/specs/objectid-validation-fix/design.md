# Design Document

## Overview

This design addresses the BSONError issues in the ShopWise Backend by configuring MongoDB schemas to use UUID strings as `_id` fields instead of ObjectIds. The solution eliminates the need for ObjectId conversion by making MongoDB natively work with the existing UUID-based ID system.

## Architecture

The solution follows a schema-first approach:

1. **Schema Layer**: Configure Mongoose schemas to use String type for `_id` fields
2. **Utility Layer**: UUID validation and generation functions
3. **Service Layer**: Updated service methods with proper UUID validation
4. **Error Handling Layer**: Consistent error responses for invalid UUIDs

## Components and Interfaces

### UUID Utilities

```typescript
// src/utils/uuid.util.ts
export class UuidUtil {
    static isValidUuid(id: string): boolean;
    static validateUuid(id: string): void; // throws BadRequestException if invalid
    static generateUuid(): string;
}
```

### Updated Schema Pattern

All Mongoose schemas will be configured to use String IDs:

```typescript
@Schema({
    collection: 'stores',
    timestamps: false,
    _id: false, // Disable automatic ObjectId generation
})
export class StoreDocument extends Document<string> {
    @Prop({ type: String, required: true, unique: true })
    _id: string;

    // ... other properties
}

// Configure schema to use string IDs
StoreSchema.add({ _id: { type: String, required: true } });
```

### Updated Service Pattern

Services will use UUID validation before MongoDB operations:

```typescript
async findOne(_id: ID): Promise<Entity> {
  UuidUtil.validateUuid(_id);
  const doc = await this.entityModel.findById(_id).lean().exec();
  // ... rest of the method
}
```

## Data Models

### Schema Configuration Changes

Each schema needs these modifications:

1. Disable automatic ObjectId generation: `_id: false` in schema options
2. Add explicit `_id` field with String type
3. Ensure Document extends with `<string>` type parameter

### Existing Models Compatibility

No changes to existing model interfaces:

- `ID = string` type definition remains unchanged
- UUID-based identifiers in create operations continue working
- BaseModel interface remains the same

## Error Handling

### Invalid UUID Format

```typescript
// Input: "invalid-uuid-format"
// Response: 400 Bad Request
{
  "statusCode": 400,
  "message": "Invalid UUID format: invalid-uuid-format",
  "error": "Bad Request"
}
```

### Valid UUID, Document Not Found

```typescript
// Input: "550e8400-e29b-41d4-a716-446655440000" (valid UUID)
// Response: 404 Not Found
{
  "statusCode": 404,
  "message": "Store with ID \"550e8400-e29b-41d4-a716-446655440000\" not found",
  "error": "Not Found"
}
```

## Testing Strategy

### Unit Tests

- Test UUID utility functions with various input formats
- Test schema configurations with UUID strings
- Test service methods with valid and invalid UUIDs
- Test error handling scenarios

### Integration Tests

- Test complete request/response cycles with invalid UUIDs
- Test MongoDB operations with UUID strings as `_id`
- Test that BSONError no longer occurs
- Test error responses match expected format

### Test Cases

1. Valid v4 UUID format
2. Valid v1 UUID format
3. Invalid UUID format
4. Empty string ID
5. Null/undefined ID
6. Valid UUID but non-existent document

## Implementation Notes

### Affected Schemas

All Mongoose schemas need updates:

- StoreDocument
- ProductDocument
- CategoryDocument
- FamilyDocument
- PantryItemDocument
- PurchaseDocument
- ShoppingListDocument
- UserDocument

### Schema Migration Strategy

1. Update schema definitions to use String `_id`
2. Ensure existing data compatibility (if any ObjectIds exist)
3. Test with both new UUID documents and any existing data

### MongoDB Operations

All MongoDB operations will work natively with UUID strings:

- `findById(uuid)` - works directly
- `findByIdAndUpdate(uuid, ...)` - works directly
- `findByIdAndDelete(uuid)` - works directly
- `deleteOne({ _id: uuid })` - works directly

### Backward Compatibility

The solution maintains full backward compatibility:

- Existing UUID creation logic unchanged
- API contracts remain the same
- Only internal schema configuration changes
