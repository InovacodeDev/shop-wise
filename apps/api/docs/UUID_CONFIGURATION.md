# UUID-based MongoDB Configuration

## Overview

The ShopWise Backend uses UUID strings as MongoDB `_id` fields instead of the default ObjectId format. This configuration eliminates BSONError exceptions that occur when MongoDB expects ObjectIds but receives UUID strings.

## Schema Configuration

All Mongoose schemas are configured to use UUID strings as the primary key:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'stores', timestamps: false, _id: false })
export class StoreDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    // ... other properties
}

export const StoreSchema = SchemaFactory.createForClass(StoreDocument);

// Configure _id field to use UUID strings
StoreSchema.add({ _id: { type: String, required: true } });
```

### Key Configuration Elements

1. **Schema Options**: `_id: false` disables automatic ObjectId generation
2. **Document Type**: `Document<string>` specifies string type for the `_id` field
3. **Property Declaration**: `@Prop({ type: String, required: true })` defines the `_id` field as a required string
4. **Schema Addition**: `Schema.add({ _id: { type: String, required: true } })` configures the field type

## Valid UUID Formats

The system accepts multiple UUID formats:

### UUID v4 (Most Common)

```
550e8400-e29b-41d4-a716-446655440000
```

### UUID v1 (Time-based)

```
6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

### UUID v3 (Name-based using MD5)

```
6fa459ea-ee8a-3ca4-894e-db77e160355e
```

### UUID v5 (Name-based using SHA-1)

```
886313e1-3b8a-5372-9b90-0c9aee199e5d
```

## UUID Validation

The `UuidUtil` class provides validation functions:

```typescript
import { UuidUtil } from '@/utils/uuid.util';

// Check if a string is a valid UUID
const isValid = UuidUtil.isValidUuid('550e8400-e29b-41d4-a716-446655440000'); // true

// Validate and throw exception if invalid
UuidUtil.validateUuid('invalid-format'); // throws BadRequestException

// Generate a new UUID v4
const newUuid = UuidUtil.generateUuid(); // returns new UUID string
```

## Service Integration

All services use UUID validation before MongoDB operations:

```typescript
async findOne(_id: string): Promise<Store> {
    UuidUtil.validateUuid(_id); // Validates UUID format

    const doc = await this.storeModel.findById(_id).lean().exec();
    if (!doc) {
        throw new NotFoundException(`Store with ID "${_id}" not found`);
    }
    return doc;
}
```

## Error Handling

### Invalid UUID Format

```json
{
    "statusCode": 400,
    "message": "Invalid UUID format: invalid-uuid-format",
    "error": "Bad Request"
}
```

### Valid UUID, Document Not Found

```json
{
    "statusCode": 404,
    "message": "Store with ID \"550e8400-e29b-41d4-a716-446655440000\" not found",
    "error": "Not Found"
}
```

## MongoDB Operations

All standard MongoDB operations work natively with UUID strings:

```typescript
// Create with UUID
const store = new StoreModel({
    _id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Store',
});
await store.save();

// Find by UUID
const found = await StoreModel.findById('550e8400-e29b-41d4-a716-446655440000');

// Update by UUID
await StoreModel.findByIdAndUpdate('550e8400-e29b-41d4-a716-446655440000', { name: 'Updated' });

// Delete by UUID
await StoreModel.findByIdAndDelete('550e8400-e29b-41d4-a716-446655440000');
```

## Benefits

1. **No BSONError**: Eliminates ObjectId conversion errors
2. **Consistent IDs**: Uses the same UUID format throughout the application
3. **Better Debugging**: UUIDs are more readable than ObjectIds
4. **API Compatibility**: Maintains existing API contracts
5. **Type Safety**: Full TypeScript support with string-based IDs

## Migration Notes

- Existing UUID-based code continues to work without changes
- No database migration required for new installations
- The `dto-mappers.ts` utility continues to generate UUIDs using `randomUUID()`
- All API endpoints maintain the same request/response format

## Affected Schemas

The following schemas are configured to use UUID strings:

- `StoreDocument`
- `ProductDocument`
- `CategoryDocument`
- `FamilyDocument`
- `PantryItemDocument`
- `PurchaseDocument`
- `ShoppingListDocument`
- `UserDocument`

## Testing

Integration tests verify that:

- UUID strings work as MongoDB `_id` fields
- No BSONError exceptions occur
- All CRUD operations function correctly
- Error handling works as expected
- Multiple UUID formats are supported

Example test:

```typescript
it('should store and retrieve UUID strings as _id without BSONError', async () => {
    const customUuid = '550e8400-e29b-41d4-a716-446655440000';

    const storeDoc = new StoreModel({
        _id: customUuid,
        name: 'Test Store',
    });

    await expect(storeDoc.save()).resolves.toBeDefined();

    const found = await StoreModel.findById(customUuid).exec();
    expect(found).toBeDefined();
    expect(found._id).toBe(customUuid);
});
```
