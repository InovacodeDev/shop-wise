# NFCe Scanner and Webcrawler Integration

This document describes the implementation of the NFCe (Nota Fiscal de Consumidor Eletrônica) scanner feature that integrates with the webcrawler API.

## Overview

The NFCe scanner feature allows users to:
1. **Scan QR codes** from NFCe receipts using their device camera
2. **Manually enter URLs** as an alternative to QR scanning
3. **Analyze receipt data** through the webcrawler API
4. **View enhanced results** with AI-processed categorization

## Features

### QR Code Scanner
- Real-time QR code detection using device camera
- Camera switching (front/back) support
- Responsive UI with loading states and error handling
- Built with `qr-scanner` library for optimal performance

### Manual URL Input
- Fallback option for when camera is unavailable
- URL validation specifically for NFCe URLs
- User-friendly error messages and guidance

### NFCe Analysis
- Integration with `/webcrawler/nfce` API endpoint for raw data extraction
- Integration with `/webcrawler/nfce/enhanced` for AI-enhanced processing
- Comprehensive data display including:
  - Store information (name, CNPJ, address)
  - Purchase details (date, total, payment method)
  - Product list with categories and pricing

## Technical Implementation

### Components

#### `QrScannerComponent` (`/src/components/qr-scanner.tsx`)
- React component wrapping the `qr-scanner` library
- Handles camera permissions and device compatibility
- Provides real-time QR code scanning with visual feedback

#### `ManualUrlInput` (`/src/components/manual-url-input.tsx`)
- Form component for manual URL entry
- Validates URLs to ensure they're NFCe-compatible
- Includes helpful instructions for users

#### `WebcrawlerPage` (`/src/routes/webcrawler/route.tsx`)
- Main page combining both scanning methods
- Manages application state (scan → loading → results/error)
- Displays comprehensive analysis results

### API Integration

#### Webcrawler Service (`/src/services/api.ts`)
Two new API methods added:

```typescript
// Get raw NFCe data
async crawlNfce(request: CrawlNfceRequest): Promise<CrawlNfceResponse>

// Get AI-enhanced NFCe data
async crawlAndEnhanceNfce(request: CrawlNfceRequest): Promise<CrawlAndEnhanceNfceResponse>
```

### Type Definitions (`/src/types/webcrawler.ts`)
Comprehensive TypeScript types for:
- NFCe product and data structures
- API request/response interfaces
- Component props and state management
- QR scanner results and configuration

## User Flow

1. **Access**: Users navigate to "NFCe Scanner" from the main navigation
2. **Choice**: Users can choose between QR scanning or manual URL entry
3. **Input**: 
   - QR Scanner: Start camera, position QR code, automatic detection
   - Manual Entry: Paste or type NFCe URL, click analyze
4. **Processing**: Application calls webcrawler API to extract and enhance data
5. **Results**: Comprehensive display of store info, purchase details, and products
6. **Reset**: Users can start a new analysis with one click

## Dependencies

### New Dependencies Added
- `qr-scanner`: Modern QR code scanning library with excellent browser support

### Existing Dependencies Utilized
- Radix UI components for consistent styling
- FontAwesome icons for visual elements
- TanStack Router for navigation
- Axios for API communication

## Testing

Basic unit tests provided for:
- QR Scanner component initialization and functionality
- Manual URL input validation and submission
- Component rendering and user interactions

## Security Considerations

- URL validation prevents malicious link processing
- Camera permissions handled gracefully with user consent
- Error boundaries prevent application crashes
- Input sanitization for all user-provided URLs

## Future Enhancements

Potential improvements for future versions:
1. **Batch Processing**: Allow multiple NFCe analysis in sequence
2. **Purchase Integration**: Direct import of NFCe data into purchase history
3. **Offline Support**: Cache mechanism for processed receipts
4. **Enhanced Validation**: More sophisticated NFCe URL pattern matching
5. **Export Features**: Export analysis results to various formats

## Browser Compatibility

The QR scanner feature requires:
- Camera access (getUserMedia API)
- Modern browser with ES2020+ support
- HTTPS for camera permissions (required in production)

Fallback to manual URL entry is available for unsupported browsers.
