import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ManualUrlInput } from '../manual-url-input';

describe('ManualUrlInput', () => {
    it('renders the component correctly', () => {
        const mockOnSubmit = vi.fn();

        render(<ManualUrlInput onSubmit={mockOnSubmit} />);

        expect(screen.getByText('NFCe URL')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('https://nfce.fazenda...')).toBeInTheDocument();
        expect(screen.getByText('Analyze NFCe')).toBeInTheDocument();
    });

    it('validates URL correctly', () => {
        const mockOnSubmit = vi.fn();

        render(<ManualUrlInput onSubmit={mockOnSubmit} />);

        const input = screen.getByPlaceholderText('https://nfce.fazenda...');
        const button = screen.getByText('Analyze NFCe');

        // Test invalid URL
        fireEvent.change(input, { target: { value: 'invalid-url' } });
        fireEvent.click(button);

        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with valid NFCe URL', () => {
        const mockOnSubmit = vi.fn();

        render(<ManualUrlInput onSubmit={mockOnSubmit} />);

        const input = screen.getByPlaceholderText('https://nfce.fazenda...');
        const button = screen.getByText('Analyze NFCe');

        const validUrl = 'https://nfce.fazenda.sp.gov.br/qrcode?p=35220316716114000119650010000000001000000001|2|1|1|6DD5...';

        fireEvent.change(input, { target: { value: validUrl } });
        fireEvent.click(button);

        expect(mockOnSubmit).toHaveBeenCalledWith(validUrl);
    });

    it('shows loading state when isLoading is true', () => {
        const mockOnSubmit = vi.fn();

        render(<ManualUrlInput onSubmit={mockOnSubmit} isLoading={true} />);

        expect(screen.getByText('Analyzing...')).toBeInTheDocument();

        const input = screen.getByPlaceholderText('https://nfce.fazenda...');
        expect(input).toBeDisabled();
    });
});
