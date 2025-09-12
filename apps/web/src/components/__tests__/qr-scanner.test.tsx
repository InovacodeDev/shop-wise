import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QrScannerComponent } from '../qr-scanner';

// Mock QrScanner library
vi.mock('qr-scanner', () => ({
    default: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        destroy: vi.fn(),
        setCamera: vi.fn(),
    })),
    hasCamera: vi.fn().mockResolvedValue(true),
    listCameras: vi.fn().mockResolvedValue([
        { id: 'camera1', label: 'Back Camera' },
        { id: 'camera2', label: 'Front Camera' }
    ]),
}));

describe('QrScannerComponent', () => {
    it('renders the component correctly', () => {
        const mockOnScan = vi.fn();
        
        render(
            <QrScannerComponent 
                onScan={mockOnScan}
            />
        );

        // Check for basic elements
        expect(screen.getByText('Start Scanning')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
        const mockOnScan = vi.fn();
        
        render(
            <QrScannerComponent 
                onScan={mockOnScan}
            />
        );

        expect(screen.getByText('Initializing camera...')).toBeInTheDocument();
    });
});
