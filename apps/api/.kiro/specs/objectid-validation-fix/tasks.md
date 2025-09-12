# Implementation Plan

- [x]   1. Create UUID utility functions
    - Create `src/utils/uuid.util.ts` with validation and generation functions
    - Implement `isValidUuid()`, `validateUuid()`, and `generateUuid()` methods
    - Add proper error handling with BadRequestException for invalid formats
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3_

- [x]   2. Write unit tests for UUID utilities
    - Create test file for UUID utility functions
    - Test valid UUID formats (v1, v4, etc.)
    - Test invalid formats and error handling
    - Test edge cases (empty string, null, undefined)
    - _Requirements: 3.1, 4.2, 4.3_

- [x]   3. Update StoreDocument schema to use String IDs
    - Modify `src/stores/schemas/store.schema.ts` to use String type for `_id`
    - Disable automatic ObjectId generation in schema options
    - Configure schema to accept UUID strings as primary keys
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x]   4. Update StoresService with UUID validation
    - Modify `findOne()`, `update()`, and `remove()` methods in StoresService
    - Add UUID validation before MongoDB operations
    - Update error handling to use new validation utilities
    - _Requirements: 1.3, 3.1, 3.2, 4.1_

- [x]   5. Write integration tests for StoresService
    - Test StoresService methods with valid and invalid UUIDs
    - Verify proper error responses for invalid UUID formats
    - Test that UUID strings work correctly as MongoDB `_id` fields
    - Verify no BSONError exceptions occur
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [x]   6. Update ProductDocument schema to use String IDs
    - Apply String ID configuration to ProductDocument schema
    - Update schema options to disable ObjectId generation
    - Ensure compatibility with existing UUID-based operations
    - _Requirements: 2.1, 2.2, 2.3_

- [x]   7. Update ProductsService with UUID validation
    - Apply UUID validation to all MongoDB operations in ProductsService
    - Update `findOne()`, `update()`, and `remove()` methods
    - Ensure consistent error handling across all methods
    - _Requirements: 3.1, 3.2, 4.1_

- [x]   8. Update CategoryDocument schema and service
    - Configure CategoryDocument schema to use String IDs
    - Apply UUID validation to CategoriesService MongoDB operations
    - Maintain consistent error handling patterns
    - _Requirements: 2.1, 2.2, 2.3, 3.2_

- [x]   9. Update remaining schemas to use String IDs
    - Apply String ID configuration to FamilyDocument, PantryItemDocument, PurchaseDocument, ShoppingListDocument, and UserDocument schemas
    - Ensure all schemas follow the same pattern
    - Disable ObjectId generation for all schemas
    - _Requirements: 2.1, 2.2, 2.3_

- [x]   10. Update remaining services with UUID validation
    - Apply validation to FamiliesService, PantryItemsService, PurchasesService, ShoppingListsService, and UsersService
    - Ensure all services follow the same validation pattern
    - Update all MongoDB operations that use ID parameters
    - _Requirements: 3.1, 3.2, 4.1_

- [x]   11. Create comprehensive integration tests
    - Write integration tests covering all updated schemas and services
    - Test that UUID strings work as `_id` fields across all collections
    - Verify that BSONError no longer occurs with any service
    - Test error handling consistency across services
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [x]   12. Update documentation and verify compatibility
    - Document the new UUID-based `_id` configuration
    - Add examples of valid UUID formats
    - Verify that existing UUID generation in dto-mappers continues working
    - Test end-to-end functionality with UUID-based IDs
    - _Requirements: 1.1, 1.2, 2.3, 4.3_
