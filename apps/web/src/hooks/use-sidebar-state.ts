import { useCallback, useEffect, useState } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebar_state';
const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Custom hook to manage sidebar state with persistence
 * Uses localStorage as primary storage and cookies as fallback
 */
export function useSidebarState(defaultOpen: boolean = true) {
    // Function to get saved state from localStorage or cookie
    const getSavedState = useCallback(() => {
        if (typeof window === 'undefined') return defaultOpen;

        try {
            // Try localStorage first
            const localStorageValue = localStorage.getItem(SIDEBAR_STORAGE_KEY);
            if (localStorageValue !== null) {
                return localStorageValue === 'true';
            }

            // Fallback to cookie
            const cookies = document.cookie.split(';');
            const sidebarCookie = cookies.find((cookie) => cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`));

            if (sidebarCookie) {
                const value = sidebarCookie.split('=')[1];
                return value === 'true';
            }
        } catch (error) {
            console.warn('Error reading sidebar state:', error);
        }

        return defaultOpen;
    }, [defaultOpen]);

    // Function to save state
    const saveState = useCallback((state: boolean) => {
        if (typeof window === 'undefined') return;

        try {
            // Save to localStorage
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(state));
            // Also save to cookie as fallback
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${state}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
        } catch (error) {
            console.warn('Error saving sidebar state:', error);
        }
    }, []);

    // Initialize state from saved value
    const [isOpen, setIsOpen] = useState(() => getSavedState());

    // Load saved state on mount (handles SSR)
    useEffect(() => {
        const savedState = getSavedState();
        if (savedState !== isOpen) {
            setIsOpen(savedState);
        }
    }, [getSavedState, isOpen]);

    // Function to update state and persist it
    const setOpen = useCallback(
        (value: boolean | ((prev: boolean) => boolean)) => {
            setIsOpen((prev) => {
                const newState = typeof value === 'function' ? value(prev) : value;
                saveState(newState);
                return newState;
            });
        },
        [saveState],
    );

    // Toggle function
    const toggle = useCallback(() => {
        setOpen((prev) => !prev);
    }, [setOpen]);

    return {
        isOpen,
        setOpen,
        toggle,
        getSavedState,
        saveState,
    };
}
