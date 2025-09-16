import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../empty-state';
import { Loading } from '../loading';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

// Mock the lingui hook
vi.mock('@lingui/react/macro', () => ({
    useLingui: () => ({
        t: (str: any) => str,
    }),
}));

describe('Enhanced UI Components with MD3', () => {
    describe('EmptyState', () => {
        it('renders with MD3 card variant by default', () => {
            render(
                <EmptyState
                    icon={faBoxOpen}
                    title="No items found"
                    description="There are no items to display"
                />
            );

            expect(screen.getByText('No items found')).toBeInTheDocument();
            expect(screen.getByText('There are no items to display')).toBeInTheDocument();
        });

        it('renders with minimal variant', () => {
            render(
                <EmptyState
                    icon={faBoxOpen}
                    title="No items found"
                    description="There are no items to display"
                    variant="minimal"
                />
            );

            expect(screen.getByText('No items found')).toBeInTheDocument();
        });

        it('renders with action button', () => {
            const mockAction = vi.fn();
            render(
                <EmptyState
                    icon={faBoxOpen}
                    title="No items found"
                    description="There are no items to display"
                    action={{
                        label: 'Add Item',
                        onClick: mockAction,
                    }}
                />
            );

            expect(screen.getByText('Add Item')).toBeInTheDocument();
        });
    });

    describe('Loading', () => {
        it('renders with MD3 loading indicator', () => {
            render(<Loading text="Loading data..." />);

            expect(screen.getByText('Loading data...')).toBeInTheDocument();
        });

        it('renders card variant', () => {
            render(
                <Loading
                    text="Loading..."
                    description="Please wait"
                    variant="card"
                />
            );

            expect(screen.getByText('Loading...')).toBeInTheDocument();
            expect(screen.getByText('Please wait')).toBeInTheDocument();
        });

        it('renders minimal variant', () => {
            render(<Loading text="Loading..." variant="minimal" />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });
});
