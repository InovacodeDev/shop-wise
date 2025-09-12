"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faArrowLeft, faMicrophone, faCamera } from "@fortawesome/free-solid-svg-icons";

import { cn } from "@/lib/utils";
import { Button } from "./button";

// MD3 Search variants following Material Design 3 specifications
const searchVariants = cva([
    // Base styles
    "relative flex items-center rounded-full transition-all duration-200",
    "border border-outline focus-within:border-primary",
    "focus-within:ring-2 focus-within:ring-primary/20"
], {
    variants: {
        variant: {
            // Search Bar: 56dp height, full-width
            bar: [
                "h-14 w-full bg-surface-container-highest",
                "shadow-sm hover:shadow-md"
            ],
            // Search View: Docked/Undocked modes
            view: [
                "h-14 w-full bg-surface",
                "border-b border-outline-variant shadow-sm"
            ],
            // Compact Search: 48dp height
            compact: [
                "h-12 bg-surface-variant",
                "hover:bg-surface-container-highest"
            ]
        },
        state: {
            default: "",
            active: "ring-2 ring-primary/20 border-primary",
            error: "border-error ring-2 ring-error/20"
        }
    },
    defaultVariants: {
        variant: "bar",
        state: "default"
    }
});

const searchInputVariants = cva([
    "flex-1 bg-transparent border-0 outline-none text-on-surface",
    "placeholder:text-on-surface-variant",
    "text-base leading-6"
], {
    variants: {
        variant: {
            bar: "px-4",
            view: "px-4",
            compact: "px-3 text-sm"
        }
    },
    defaultVariants: {
        variant: "bar"
    }
});

// Search Bar Component
interface SearchBarProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof searchVariants> {
    onSearch?: (query: string) => void;
    onClear?: () => void;
    showMic?: boolean;
    showCamera?: boolean;
    leadingIcon?: React.ReactNode;
    trailingActions?: React.ReactNode;
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
    loading?: boolean;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(({
    className,
    variant = "bar",
    state,
    value,
    onChange,
    onSearch,
    onClear,
    onFocus,
    onBlur,
    showMic = false,
    showCamera = false,
    leadingIcon,
    trailingActions,
    suggestions = [],
    onSuggestionClick,
    loading = false,
    placeholder = "Search",
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!, []);

    const currentValue = value !== undefined ? value : internalValue;
    const showSuggestions = isFocused && suggestions.length > 0 && currentValue;
    const searchState = state || (isFocused ? "active" : "default");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (value === undefined) {
            setInternalValue(newValue);
        }
        onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch?.(currentValue as string);
        }
        props.onKeyDown?.(e);
    };

    const handleClear = () => {
        if (value === undefined) {
            setInternalValue("");
        }
        onClear?.();
        inputRef.current?.focus();
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Delay to allow suggestion clicks
        setTimeout(() => setIsFocused(false), 150);
        onBlur?.(e);
    };

    return (
        <div className="relative w-full">
            <div className={cn(searchVariants({ variant, state: searchState }), className)}>
                {/* Leading Icon */}
                <div className="flex-shrink-0 pl-4">
                    {leadingIcon || (
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="w-5 h-5 text-on-surface-variant"
                        />
                    )}
                </div>

                {/* Search Input */}
                <input
                    ref={inputRef}
                    className={cn(searchInputVariants({ variant }))}
                    type="search"
                    value={currentValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    {...props}
                />

                {/* Trailing Actions */}
                <div className="flex-shrink-0 flex items-center gap-1 pr-2">
                    {loading && (
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    )}

                    {currentValue && !loading && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 hover:bg-on-surface/8"
                            onClick={handleClear}
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-on-surface-variant" />
                        </Button>
                    )}

                    {showMic && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 hover:bg-on-surface/8"
                        >
                            <FontAwesomeIcon icon={faMicrophone} className="w-4 h-4 text-on-surface-variant" />
                        </Button>
                    )}

                    {showCamera && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 hover:bg-on-surface/8"
                        >
                            <FontAwesomeIcon icon={faCamera} className="w-4 h-4 text-on-surface-variant" />
                        </Button>
                    )}

                    {trailingActions}
                </div>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container rounded-lg border border-outline-variant shadow-lg z-50 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            className="w-full px-4 py-3 text-left hover:bg-surface-container-highest text-on-surface text-sm border-b border-outline-variant last:border-0"
                            onClick={() => {
                                onSuggestionClick?.(suggestion);
                                setIsFocused(false);
                            }}
                        >
                            <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-on-surface-variant mr-3" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});
SearchBar.displayName = "SearchBar";

// Search View Component (Full-screen search experience)
interface SearchViewProps {
    value?: string;
    onChange?: (value: string) => void;
    onBack?: () => void;
    onSearch?: (query: string) => void;
    placeholder?: string;
    suggestions?: string[];
    recentSearches?: string[];
    onSuggestionClick?: (suggestion: string) => void;
    onRecentSearchClick?: (search: string) => void;
    onRecentSearchDelete?: (search: string) => void;
    children?: React.ReactNode;
}

const SearchView = React.forwardRef<HTMLInputElement, SearchViewProps>(({
    value,
    onChange,
    onBack,
    onSearch,
    placeholder = "Search",
    suggestions = [],
    recentSearches = [],
    onSuggestionClick,
    onRecentSearchClick,
    onRecentSearchDelete,
    children
}, ref) => {
    const [query, setQuery] = React.useState(value || "");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!, []);

    const currentQuery = value !== undefined ? value : query;
    const showSuggestions = currentQuery && suggestions.length > 0;
    const showRecents = !currentQuery && recentSearches.length > 0;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (value === undefined) {
            setQuery(newValue);
        }
        onChange?.(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch?.(currentQuery);
        }
    };

    return (
        <div className="fixed inset-0 bg-surface z-50 flex flex-col">
            {/* Search Header */}
            <div className={cn(searchVariants({ variant: "view" }), "flex-shrink-0")}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 ml-2"
                    onClick={onBack}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 text-on-surface" />
                </Button>

                <input
                    ref={inputRef}
                    className={cn(searchInputVariants({ variant: "view" }), "mr-4")}
                    type="search"
                    value={currentQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus
                />
            </div>

            {/* Search Content */}
            <div className="flex-1 overflow-y-auto">
                {children ? (
                    children
                ) : (
                    <>
                        {/* Suggestions */}
                        {showSuggestions && (
                            <div className="border-b border-outline-variant">
                                <div className="p-4 text-sm font-medium text-on-surface-variant">
                                    Suggestions
                                </div>
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="w-full px-4 py-3 text-left hover:bg-surface-container-highest flex items-center gap-3"
                                        onClick={() => onSuggestionClick?.(suggestion)}
                                    >
                                        <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-on-surface-variant" />
                                        <span className="text-on-surface">{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Recent Searches */}
                        {showRecents && (
                            <div>
                                <div className="p-4 text-sm font-medium text-on-surface-variant">
                                    Recent searches
                                </div>
                                {recentSearches.map((search, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center hover:bg-surface-container-highest"
                                    >
                                        <button
                                            className="flex-1 px-4 py-3 text-left flex items-center gap-3"
                                            onClick={() => onRecentSearchClick?.(search)}
                                        >
                                            <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-on-surface-variant" />
                                            <span className="text-on-surface">{search}</span>
                                        </button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-8 h-8 mr-2"
                                            onClick={() => onRecentSearchDelete?.(search)}
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-on-surface-variant" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});
SearchView.displayName = "SearchView";

// Compact Search (for toolbars)
interface CompactSearchProps extends Omit<SearchBarProps, 'variant'> {
    expanded?: boolean;
    onToggle?: () => void;
}

const CompactSearch = React.forwardRef<HTMLInputElement, CompactSearchProps>(({
    expanded = false,
    onToggle,
    className,
    ...props
}, ref) => {
    return (
        <div className={cn("transition-all duration-200", expanded ? "w-full" : "w-12")}>
            {expanded ? (
                <SearchBar
                    ref={ref}
                    variant="compact"
                    className={className}
                    autoFocus
                    {...props}
                />
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full"
                    onClick={onToggle}
                >
                    <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-on-surface-variant" />
                </Button>
            )}
        </div>
    );
});
CompactSearch.displayName = "CompactSearch";

export {
    SearchBar,
    SearchView,
    CompactSearch,
    searchVariants
};
