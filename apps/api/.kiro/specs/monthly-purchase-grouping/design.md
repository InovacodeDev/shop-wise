# Design Document

## Overview

This design implements monthly grouping of purchases by creating a new API endpoint that returns purchases organized by month and year, along with corresponding updates to the web application to display this grouped data. The solution maintains backward compatibility while providing enhanced user experience through better temporal organization of purchase data.

## Architecture

### API Layer Changes

The solution introduces a new endpoint `/families/:familyId/purchases/by-month` while preserving the existing `/families/:familyId/purchases` endpoint for backward compatibility. The new endpoint will:

1. Retrieve all purchases for a family using the existing service method
2. Apply client-side grouping logic to organize purchases by month/year
3. Calculate summary statistics for each month
4. Return structured monthly data with proper sorting

### Web Application Changes

The web application will be updated to:

1. Add a new API service method for the monthly endpoint
2. Update purchase-related components to consume and display monthly grouped data
3. Implement collapsible/expandable month sections
4. Maintain existing functionality for components that require flat purchase lists

## Components and Interfaces

### API Components

#### New Controller Method

```typescript
@Get('by-month')
findAllByMonth(@Param('familyId') familyId: string): Promise<MonthlyPurchaseGroup[]>
```

#### New Service Method

```typescript
async findAllByMonth(familyId: string): Promise<MonthlyPurchaseGroup[]>
```

#### New Response Interface

```typescript
interface MonthlyPurchaseGroup {
    monthYear: string; // "2024-01" format for sorting
    displayName: string; // "January 2024" for display
    totalAmount: number; // Sum of all purchases in this month
    purchaseCount: number; // Number of purchases in this month
    purchases: Purchase[]; // Array of purchases for this month
}
```

### Web Application Components

#### Updated API Service

```typescript
// New method in ApiService class
async getPurchasesByMonth(familyId: string): Promise<MonthlyPurchaseGroup[]>
```

#### New Purchase Service Method

```typescript
// New method in purchaseApiService.ts
export async function getPurchasesByMonth(familyId: string): Promise<MonthlyPurchaseGroup[]>;
```

#### Updated Type Definitions

```typescript
// Addition to types/api.ts
export interface MonthlyPurchaseGroup {
    monthYear: string;
    displayName: string;
    totalAmount: number;
    purchaseCount: number;
    purchases: Purchase[];
}
```

## Data Models

### Monthly Grouping Logic

The grouping algorithm will:

1. **Date Processing**: Extract month and year from each purchase's date field
2. **Null Date Handling**: Group purchases with null/invalid dates into a special "No Date" category
3. **Month Key Generation**: Create sortable keys in "YYYY-MM" format
4. **Display Name Generation**: Create human-readable month names like "January 2024"
5. **Summary Calculation**: Compute total amount and purchase count for each group

### Data Flow

```
Raw Purchases → Date Extraction → Monthly Grouping → Summary Calculation → Sorting → Response
```

### Sorting Strategy

1. **Primary Sort**: Month groups by monthYear descending (newest first)
2. **Secondary Sort**: Purchases within each month by date descending (newest first)
3. **Special Handling**: "No Date" group appears last

## Error Handling

### API Error Scenarios

1. **Invalid Family ID**: Return 400 Bad Request with validation message
2. **Family Not Found**: Return 404 Not Found
3. **Database Errors**: Return 500 Internal Server Error with generic message
4. **Empty Results**: Return empty array (not an error)

### Web Application Error Handling

1. **Network Errors**: Display user-friendly error message with retry option
2. **API Errors**: Show specific error messages from API responses
3. **Loading States**: Implement proper loading indicators during data fetch
4. **Fallback Behavior**: Fall back to flat list view if monthly grouping fails

### Edge Case Handling

1. **Invalid Dates**: Group into "No Date" category
2. **Future Dates**: Include in appropriate month group
3. **Very Old Dates**: Include in appropriate month group
4. **Timezone Considerations**: Use UTC dates for consistency

## Testing Strategy

### API Testing

#### Unit Tests

- Test monthly grouping logic with various date scenarios
- Test summary calculation accuracy
- Test sorting behavior
- Test edge cases (null dates, invalid dates, empty results)
- Test error handling for invalid inputs

#### Integration Tests

- Test full endpoint functionality with real database
- Test backward compatibility of existing endpoint
- Test performance with large datasets
- Test concurrent access scenarios

### Web Application Testing

#### Component Tests

- Test monthly display component rendering
- Test expand/collapse functionality
- Test summary information display
- Test error state handling
- Test loading state behavior

#### Integration Tests

- Test API service integration
- Test data flow from API to components
- Test user interaction scenarios
- Test responsive behavior

### Test Data Scenarios

1. **Normal Case**: Purchases spread across multiple months
2. **Single Month**: All purchases in one month
3. **No Purchases**: Empty family purchase history
4. **Invalid Dates**: Mix of valid and invalid purchase dates
5. **Large Dataset**: Performance testing with many purchases
6. **Edge Dates**: Purchases at month boundaries

## Implementation Phases

### Phase 1: API Implementation

1. Create new controller method
2. Implement service method with grouping logic
3. Add response interface definitions
4. Write unit tests for grouping logic
5. Add integration tests for new endpoint

### Phase 2: Web API Integration

1. Add new method to ApiService class
2. Update type definitions
3. Add wrapper method to purchaseApiService
4. Write tests for new service methods

### Phase 3: UI Implementation

1. Create monthly purchase display component
2. Implement expand/collapse functionality
3. Update existing purchase views to use monthly data
4. Add loading and error states
5. Write component tests

### Phase 4: Integration and Testing

1. End-to-end testing of complete flow
2. Performance testing and optimization
3. User acceptance testing
4. Documentation updates

## Performance Considerations

### API Performance

- **In-Memory Grouping**: Grouping logic runs in application memory for fast processing
- **Database Optimization**: Leverage existing database queries and indexes
- **Response Size**: Monthly grouping may increase response size but improves client-side performance
- **Caching Strategy**: Consider implementing response caching for frequently accessed data

### Web Application Performance

- **Lazy Loading**: Consider lazy loading of purchase details within collapsed months
- **Virtual Scrolling**: Implement if dealing with very large numbers of monthly groups
- **State Management**: Efficient state updates for expand/collapse operations
- **Memory Management**: Proper cleanup of component state and event listeners

## Security Considerations

### API Security

- **Authorization**: Ensure family membership validation for all requests
- **Input Validation**: Validate family ID format and existence
- **Rate Limiting**: Apply existing rate limiting policies to new endpoint
- **Data Exposure**: Ensure no sensitive data leakage in error responses

### Web Application Security

- **Data Sanitization**: Sanitize all displayed data to prevent XSS
- **Authentication**: Ensure proper authentication before API calls
- **Error Information**: Avoid exposing sensitive information in error messages
