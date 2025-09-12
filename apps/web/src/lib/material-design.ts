/**
 * Material Design 3 Token System Utilities
 *
 * This file provides utilities for working with M3 design tokens
 * and helps with the gradual migration from legacy tokens to M3 tokens.
 * Following the official M3 design system specifications.
 */
import { cn } from './utils';

export { cn };

/**
 * M3 Surface Elevation Levels
 * Maps elevation levels to appropriate M3 surface tokens
 */
export const surfaceElevation = {
    0: 'bg-surface text-on-surface', // No elevation
    1: 'bg-surface-container-low text-on-surface', // Low elevation
    2: 'bg-surface-container text-on-surface', // Default container
    3: 'bg-surface-container-high text-on-surface', // High elevation
    4: 'bg-surface-container-highest text-on-surface', // Highest elevation
} as const;

/**
 * M3 Typography Scale Classes
 * Pre-defined combinations of typography tokens
 */
export const typography = {
    displayLarge: 'text-display-large font-normal text-on-surface',
    displayMedium: 'text-display-medium font-normal text-on-surface',
    displaySmall: 'text-display-small font-normal text-on-surface',
    headlineLarge: 'text-headline-large font-normal text-on-surface',
    headlineMedium: 'text-headline-medium font-normal text-on-surface',
    headlineSmall: 'text-headline-small font-normal text-on-surface',
    titleLarge: 'text-title-large font-normal text-on-surface',
    titleMedium: 'text-title-medium font-medium text-on-surface',
    titleSmall: 'text-title-small font-medium text-on-surface',
    labelLarge: 'text-label-large font-medium text-on-surface-variant',
    labelMedium: 'text-label-medium font-medium text-on-surface-variant',
    labelSmall: 'text-label-small font-medium text-on-surface-variant',
    bodyLarge: 'text-body-large font-normal text-on-surface',
    bodyMedium: 'text-body-medium font-normal text-on-surface',
    bodySmall: 'text-body-small font-normal text-on-surface-variant',
} as const;

/**
 * M3 Component State Classes
 * Interactive state utilities following M3 patterns
 */
export const interactionStates = {
    primary: 'hover:bg-primary/8 focus:bg-primary/12 active:bg-primary/12 transition-colors duration-200',
    surface: 'hover:bg-on-surface/8 focus:bg-on-surface/12 active:bg-on-surface/12 transition-colors duration-200',
    error: 'hover:bg-error/8 focus:bg-error/12 active:bg-error/12 transition-colors duration-200',
} as const;

/**
 * M3 Border and Outline Utilities
 */
export const borders = {
    default: 'border border-outline-variant',
    strong: 'border border-outline',
    none: 'border-none',
} as const;

/**
 * Get appropriate surface class for elevation level
 */
export function getSurfaceElevation(level: keyof typeof surfaceElevation) {
    return surfaceElevation[level];
}

/**
 * Get typography class with proper M3 tokens
 */
export function getTypography(variant: keyof typeof typography) {
    return typography[variant];
}

/**
 * Get interaction state classes
 */
export function getInteractionStates(type: keyof typeof interactionStates) {
    return interactionStates[type];
}

/**
 * Create a properly styled M3 card
 */

/**
 * Create M3-compliant button classes
 */
export function createM3ButtonClasses(
    variant: 'filled' | 'outlined' | 'text' = 'filled',
    size: 'sm' | 'md' | 'lg' = 'md',
) {
    const baseClasses = cn(
        'inline-flex items-center justify-center font-medium',
        'transition-all',
        materialMotion.transitions.color.duration,
        materialMotion.transitions.elevation.duration,
    );

    const variants = {
        filled: cn(
            'bg-primary text-on-primary',
            'hover:shadow-md active:shadow-lg',
            'hover:bg-primary/90',
            materialMotion.classes.hoverLift,
        ),
        outlined: cn(
            borders.strong,
            'bg-transparent text-primary',
            'hover:bg-primary/8 active:bg-primary/12',
            materialMotion.transitions.color.property,
        ),
        text: cn(
            'bg-transparent text-primary',
            'hover:bg-primary/8 active:bg-primary/12',
            materialMotion.transitions.color.property,
        ),
    };

    const sizes = {
        sm: cn('px-3 py-2 text-label-medium', `border-radius: ${materialShapes.components.button.standard}`),
        md: cn('px-6 py-3 text-label-large', `border-radius: ${materialShapes.components.button.standard}`),
        lg: cn('px-8 py-4 text-label-large', `border-radius: ${materialShapes.components.button.standard}`),
    };

    return cn(baseClasses, variants[variant], sizes[size]);
}

/**
 * Create M3-compliant input classes
 */
export function createM3InputClasses() {
    return cn(
        'w-full px-4 py-3',
        'bg-surface-container-highest text-on-surface',
        borders.default,
        'placeholder:text-on-surface-variant',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
        `border-radius: ${materialShapes.components.textField.outlined}`,
        materialMotion.transitions.color.property,
        materialMotion.classes.focusRing,
    );
}

/**
 * Create M3-compliant card classes with proper elevation
 */
export function createM3CardClasses(elevation: keyof typeof materialElevation = 'level1') {
    const elevationStyles = materialElevation[elevation];

    return cn(
        getSurfaceElevation(1), // Use surface elevation mapping
        borders.default,
        `border-radius: ${materialShapes.components.card}`,
        'p-4',
        materialMotion.transitions.elevation.property,
        'transition-shadow',
        materialMotion.transitions.elevation.duration,
    );
}

/**
 * Create M3-compliant icon button classes
 */
export function createM3IconButtonClasses(size: 'small' | 'medium' | 'large' = 'medium') {
    const sizeConfig = materialIcons.iconButton.sizes[size];

    return cn(
        'inline-flex items-center justify-center',
        'bg-transparent text-on-surface-variant',
        'hover:bg-on-surface/8 active:bg-on-surface/12',
        'rounded-full',
        materialMotion.transitions.color.property,
        materialMotion.classes.hoverLift,
        {
            'w-8 h-8': size === 'small',
            'w-10 h-10': size === 'medium',
            'w-12 h-12': size === 'large',
        },
    );
}

/**
 * Apply M3 elevation styles to an element
 */
export function applyElevation(level: keyof typeof materialElevation) {
    const elevation = materialElevation[level];
    return {
        boxShadow: elevation.shadow,
        backgroundColor: `var(--${elevation.surfaceColor})`,
    };
}

/**
 * Apply M3 typography styles - handles both simple and editorial typography
 */
export function applyTypography(variant: keyof typeof materialTypography) {
    const typo = materialTypography[variant];

    // Handle editorial typography (nested structure)
    if (typeof typo === 'object' && 'pullQuote' in typo) {
        // For editorial types, return the entire object structure
        return typo;
    }

    // Handle standard typography
    const standardTypo = typo as {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
        letterSpacing: string;
        fontFamily: string;
    };

    return {
        fontSize: standardTypo.fontSize,
        fontWeight: standardTypo.fontWeight,
        lineHeight: standardTypo.lineHeight,
        letterSpacing: standardTypo.letterSpacing,
        fontFamily: standardTypo.fontFamily,
    };
}

/**
 * Apply M3 motion transitions
 */
export function applyMotion(transitionType: keyof typeof materialMotion.transitions) {
    const motion = materialMotion.transitions[transitionType];
    return {
        transition: `${motion.property} ${motion.duration} ${motion.easing}`,
    };
}

/**
 * Legacy token to M3 token mapping
 * Helps with gradual migration
 */
export const legacyToM3TokenMap = {
    // Background colors
    'bg-background': 'bg-surface',
    'text-foreground': 'text-on-surface',
    'bg-card': 'bg-surface-container',
    'text-card-foreground': 'text-on-surface',
    'bg-muted': 'bg-surface-variant',
    'text-muted-foreground': 'text-on-surface-variant',

    // Border colors
    'border-border': 'border-outline-variant',
    'border-input': 'border-outline-variant',

    // Interactive states
    'hover:bg-muted': 'hover:bg-on-surface/8',
    'hover:bg-accent': 'hover:bg-primary-container',
} as const;

/**
 * Convert legacy class to M3 equivalent
 */
export function convertLegacyToM3(legacyClass: string): string {
    return legacyToM3TokenMap[legacyClass as keyof typeof legacyToM3TokenMap] || legacyClass;
}

/**
 * Helper to combine M3 classes safely
 */
export function m3(...classes: (string | undefined | null | false)[]): string {
    return cn(...classes);
}

/**
 * Material Design 3 Spacing System
 * Consistent spacing values based on 4px grid
 */
export const materialSpacing = {
    xs: '4px', // 0.25rem
    sm: '8px', // 0.5rem
    md: '16px', // 1rem
    lg: '24px', // 1.5rem
    xl: '32px', // 2rem
    '2xl': '40px', // 2.5rem
    '3xl': '48px', // 3rem
    '4xl': '64px', // 4rem
    '5xl': '80px', // 5rem
    '6xl': '96px', // 6rem
} as const;

/**
 * Material Design 3 Shape System
 * Following M3 shape tokens and corner radius specifications
 * Ref: https://m3.material.io/styles/shape/overview-principles
 */
export const materialShapes = {
    // Corner radius tokens
    corner: {
        none: '0px', // For elements that should appear flush with their container
        extraSmall: '4px', // Small components like chips
        small: '8px', // Medium components like cards
        medium: '12px', // Larger components like dialogs
        large: '16px', // Large components like bottom sheets
        extraLarge: '28px', // Very large components like modal dialogs
        full: '50%', // Fully rounded elements like FABs and icons
    },

    // Component-specific shape tokens
    components: {
        // Cards and containers
        card: '12px',

        // Interactive elements
        button: {
            standard: '20px',
            fab: '16px',
            extendedFab: '16px',
        },

        // Input elements
        textField: {
            filled: '4px 4px 0px 0px', // Top corners only
            outlined: '4px',
        },

        // Navigation
        navigationBar: '0px',
        navigationRail: '0px',
        navigationDrawer: '0px 16px 16px 0px', // Right corners only

        // Surfaces
        dialog: '28px',
        bottomSheet: '28px 28px 0px 0px', // Top corners only
        sideSheet: '0px 28px 28px 0px', // Right corners only
        tooltip: '4px',
        snackbar: '4px',

        // Selection controls
        checkbox: '2px',
        switch: '12px',
        radioButton: '50%',

        // Others
        chip: '8px',
        menu: '4px',
        progressIndicator: '50%',
    },

    // Shape morph animations - used for component state changes
    morph: {
        duration: '300ms',
        easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)', // Standard easing
    },
} as const;

/**
 * Material Design 3 Elevation System
 * Following M3 elevation specifications with tonal surface approach
 * Ref: https://m3.material.io/styles/elevation/overview
 */
export const materialElevation = {
    // Level 0: At rest - no elevation
    level0: {
        shadow: 'none',
        tonalElevation: 0,
        surfaceColor: 'surface',
    },
    // Level 1: Slightly raised - components like cards at rest
    level1: {
        shadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        tonalElevation: 1,
        surfaceColor: 'surface-container-low',
    },
    // Level 2: Raised - components like cards when hovered/focused
    level2: {
        shadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        tonalElevation: 3,
        surfaceColor: 'surface-container',
    },
    // Level 3: Higher elevation - modal dialogs, menus
    level3: {
        shadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
        tonalElevation: 6,
        surfaceColor: 'surface-container-high',
    },
    // Level 4: Navigation drawers, modal bottom sheets
    level4: {
        shadow: '0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
        tonalElevation: 8,
        surfaceColor: 'surface-container-high',
    },
    // Level 5: Navigation rail, modal side sheets
    level5: {
        shadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
        tonalElevation: 12,
        surfaceColor: 'surface-container-highest',
    },
} as const;

/**
 * Material Design 3 Component Specifications
 * Pre-defined component styling configurations
 */
export const materialComponents = {
    card: {
        borderRadius: '12px',
        elevation: materialElevation.level1,
    },
    textField: {
        height: {
            outlined: '56px',
            filled: '56px',
        },
        borderRadius: '4px',
    },
    list: {
        itemHeight: {
            oneLineText: '56px',
            twoLineText: '72px',
            threeLineText: '88px',
        },
    },
    button: {
        height: {
            small: '32px',
            medium: '40px',
            large: '48px',
        },
        borderRadius: '20px',
    },
    dialog: {
        borderRadius: '28px',
        elevation: materialElevation.level3,
    },
} as const;

/**
 * Material Design 3 Color System
 * Core color roles and their semantic meanings
 */
export const materialColors = {
    primary: 'hsl(var(--primary))',
    onPrimary: 'hsl(var(--on-primary))',
    primaryContainer: 'hsl(var(--primary-container))',
    onPrimaryContainer: 'hsl(var(--on-primary-container))',

    secondary: 'hsl(var(--secondary))',
    onSecondary: 'hsl(var(--on-secondary))',
    secondaryContainer: 'hsl(var(--secondary-container))',
    onSecondaryContainer: 'hsl(var(--on-secondary-container))',

    tertiary: 'hsl(var(--tertiary))',
    onTertiary: 'hsl(var(--on-tertiary))',
    tertiaryContainer: 'hsl(var(--tertiary-container))',
    onTertiaryContainer: 'hsl(var(--on-tertiary-container))',

    error: 'hsl(var(--error))',
    onError: 'hsl(var(--on-error))',
    errorContainer: 'hsl(var(--error-container))',
    onErrorContainer: 'hsl(var(--on-error-container))',

    surface: 'hsl(var(--surface))',
    onSurface: 'hsl(var(--on-surface))',
    surfaceVariant: 'hsl(var(--surface-variant))',
    onSurfaceVariant: 'hsl(var(--on-surface-variant))',

    outline: 'hsl(var(--outline))',
    outlineVariant: 'hsl(var(--outline-variant))',

    inverseSurface: 'hsl(var(--inverse-surface))',
    inverseOnSurface: 'hsl(var(--inverse-on-surface))',
    inversePrimary: 'hsl(var(--inverse-primary))',
} as const;

/**
 * Material Design 3 Typography System
 * Following M3 typography tokens and type scale specifications
 * Ref: https://m3.material.io/styles/typography/type-scale-tokens
 */
export const materialTypography = {
    // Display styles - reserved for short, important text or numerals
    displayLarge: {
        fontSize: '3.5rem', // 56px
        fontWeight: 400,
        lineHeight: '4rem', // 64px
        letterSpacing: '-0.01562em', // -0.25px
        fontFamily: 'inherit', // Use project's font
    },
    displayMedium: {
        fontSize: '2.8125rem', // 45px
        fontWeight: 400,
        lineHeight: '3.25rem', // 52px
        letterSpacing: '0em',
        fontFamily: 'inherit',
    },
    displaySmall: {
        fontSize: '2.25rem', // 36px
        fontWeight: 400,
        lineHeight: '2.75rem', // 44px
        letterSpacing: '0em',
        fontFamily: 'inherit',
    },

    // Headline styles - for high-emphasis text
    headlineLarge: {
        fontSize: '2rem', // 32px
        fontWeight: 400,
        lineHeight: '2.5rem', // 40px
        letterSpacing: '0em',
        fontFamily: 'inherit',
    },
    headlineMedium: {
        fontSize: '1.75rem', // 28px
        fontWeight: 400,
        lineHeight: '2.25rem', // 36px
        letterSpacing: '0em',
        fontFamily: 'inherit',
    },
    headlineSmall: {
        fontSize: '1.5rem', // 24px
        fontWeight: 400,
        lineHeight: '2rem', // 32px
        letterSpacing: '0em',
        fontFamily: 'inherit',
    },

    // Title styles - for medium-emphasis text
    titleLarge: {
        fontSize: '1.375rem', // 22px
        fontWeight: 400,
        lineHeight: '1.75rem', // 28px
        letterSpacing: '0em',
        fontFamily: 'inherit',
    },
    titleMedium: {
        fontSize: '1rem', // 16px
        fontWeight: 500,
        lineHeight: '1.5rem', // 24px
        letterSpacing: '0.00938em', // 0.15px
        fontFamily: 'inherit',
    },
    titleSmall: {
        fontSize: '0.875rem', // 14px
        fontWeight: 500,
        lineHeight: '1.25rem', // 20px
        letterSpacing: '0.00714em', // 0.1px
        fontFamily: 'inherit',
    },

    // Label styles - for text on components
    labelLarge: {
        fontSize: '0.875rem', // 14px
        fontWeight: 500,
        lineHeight: '1.25rem', // 20px
        letterSpacing: '0.00714em', // 0.1px
        fontFamily: 'inherit',
    },
    labelMedium: {
        fontSize: '0.75rem', // 12px
        fontWeight: 500,
        lineHeight: '1rem', // 16px
        letterSpacing: '0.03125em', // 0.5px
        fontFamily: 'inherit',
    },
    labelSmall: {
        fontSize: '0.6875rem', // 11px
        fontWeight: 500,
        lineHeight: '1rem', // 16px
        letterSpacing: '0.03125em', // 0.5px
        fontFamily: 'inherit',
    },

    // Body styles - for longer passages of text
    bodyLarge: {
        fontSize: '1rem', // 16px
        fontWeight: 400,
        lineHeight: '1.5rem', // 24px
        letterSpacing: '0.03125em', // 0.5px
        fontFamily: 'inherit',
    },
    bodyMedium: {
        fontSize: '0.875rem', // 14px
        fontWeight: 400,
        lineHeight: '1.25rem', // 20px
        letterSpacing: '0.01563em', // 0.25px
        fontFamily: 'inherit',
    },
    bodySmall: {
        fontSize: '0.75rem', // 12px
        fontWeight: 400,
        lineHeight: '1rem', // 16px
        letterSpacing: '0.025em', // 0.4px
        fontFamily: 'inherit',
    },

    // Editorial treatments - special formatting
    editorial: {
        pullQuote: {
            fontSize: '1.75rem', // 28px
            fontWeight: 400,
            lineHeight: '2.25rem', // 36px
            letterSpacing: '0em',
            fontStyle: 'italic',
            fontFamily: 'inherit',
        },
        caption: {
            fontSize: '0.75rem', // 12px
            fontWeight: 400,
            lineHeight: '1rem', // 16px
            letterSpacing: '0.025em', // 0.4px
            opacity: 0.6,
            fontFamily: 'inherit',
        },
        overline: {
            fontSize: '0.625rem', // 10px
            fontWeight: 500,
            lineHeight: '1rem', // 16px
            letterSpacing: '0.15em', // 1.5px
            textTransform: 'uppercase' as const,
            fontFamily: 'inherit',
        },
    },
} as const;

/**
 * Material Design 3 Icon System
 * Following M3 icon specifications with FontAwesome integration
 * Ref: https://m3.material.io/styles/icons/overview
 */
export const materialIcons = {
    // Icon sizes following M3 specifications
    sizes: {
        small: '16px', // Small icons for compact components
        medium: '24px', // Standard icon size
        large: '32px', // Large icons for emphasis
        extraLarge: '48px', // Very large icons for hero sections
    },

    // Icon states and treatments
    states: {
        enabled: {
            opacity: 1,
            transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        },
        disabled: {
            opacity: 0.38,
            transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        },
        hover: {
            transform: 'scale(1.1)',
            transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        },
        pressed: {
            transform: 'scale(0.95)',
            transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        },
    },

    // Icon button specifications
    iconButton: {
        sizes: {
            small: {
                size: '32px',
                iconSize: '16px',
                padding: '8px',
            },
            medium: {
                size: '40px',
                iconSize: '20px',
                padding: '10px',
            },
            large: {
                size: '48px',
                iconSize: '24px',
                padding: '12px',
            },
        },
        borderRadius: '50%',
    },

    // Common icon mappings for FontAwesome
    // These provide semantic meaning to specific icons
    semantic: {
        // Navigation
        menu: 'fa-bars',
        close: 'fa-xmark',
        back: 'fa-arrow-left',
        forward: 'fa-arrow-right',
        up: 'fa-chevron-up',
        down: 'fa-chevron-down',

        // Actions
        add: 'fa-plus',
        edit: 'fa-pen',
        delete: 'fa-trash',
        search: 'fa-magnifying-glass',
        filter: 'fa-filter',
        sort: 'fa-sort',
        refresh: 'fa-arrows-rotate',

        // Status
        success: 'fa-check',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',

        // User actions
        favorite: 'fa-heart',
        favoriteBorder: 'fa-heart-o',
        share: 'fa-share',
        download: 'fa-download',
        upload: 'fa-upload',

        // Settings and controls
        settings: 'fa-gear',
        visibility: 'fa-eye',
        visibilityOff: 'fa-eye-slash',
        moreHorizontal: 'fa-ellipsis',
        moreVertical: 'fa-ellipsis-vertical',
    },
} as const;

/**
 * Material Design 3 Motion System
 * Following M3 motion specifications for easing and duration
 * Ref: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 */
export const materialMotion = {
    // Duration tokens - semantic naming for different types of animations
    duration: {
        // Short durations for simple property changes
        short1: '50ms', // Opacity changes, simple transforms
        short2: '100ms', // Selection controls state changes
        short3: '150ms', // Component state changes
        short4: '200ms', // Simple component entrances/exits

        // Medium durations for moderate complexity animations
        medium1: '250ms', // Complex component state changes
        medium2: '300ms', // Component entrances/exits with transforms
        medium3: '350ms', // Container transforms
        medium4: '400ms', // Large component transitions

        // Long durations for complex or large-scale animations
        long1: '450ms', // Large surface entrances/exits
        long2: '500ms', // Screen transitions
        long3: '550ms', // Complex screen transitions
        long4: '600ms', // Large-scale morphing animations

        // Extra long for very complex animations
        extraLong1: '700ms',
        extraLong2: '800ms',
        extraLong3: '900ms',
        extraLong4: '1000ms',
    },

    // Easing curves - following M3 specifications
    easing: {
        // Linear easing for continuous animations
        linear: 'cubic-bezier(0, 0, 1, 1)',

        // Standard easing curve - most common, balanced
        standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',

        // Emphasized easing - for important transitions
        emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',

        // Decelerated easing - for entrances
        decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

        // Accelerated easing - for exits
        accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
    },

    // Transition patterns for common animations
    transitions: {
        // Fade transitions
        fade: {
            duration: '150ms',
            easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
            property: 'opacity',
        },

        // Scale transitions (for buttons, chips)
        scale: {
            duration: '200ms',
            easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
            property: 'transform',
        },

        // Slide transitions (for drawers, sheets)
        slide: {
            duration: '300ms',
            easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
            property: 'transform',
        },

        // Morph transitions (for shape changes)
        morph: {
            duration: '300ms',
            easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
            property: 'border-radius, width, height',
        },

        // Elevation transitions (for cards, buttons)
        elevation: {
            duration: '150ms',
            easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
            property: 'box-shadow',
        },

        // Color transitions
        color: {
            duration: '100ms',
            easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
            property: 'background-color, color, border-color',
        },
    },

    // Pre-built animation classes for common patterns
    classes: {
        // Entrance animations
        enterFade: 'animate-fade-in duration-150',
        enterScale: 'animate-scale-in duration-200',
        enterSlide: 'animate-slide-in duration-300',

        // Exit animations
        exitFade: 'animate-fade-out duration-150',
        exitScale: 'animate-scale-out duration-200',
        exitSlide: 'animate-slide-out duration-300',

        // Hover animations
        hoverLift: 'transition-all duration-150 hover:scale-105 hover:shadow-lg',
        hoverGlow: 'transition-all duration-150 hover:brightness-110',

        // Focus animations
        focusRing: 'transition-all duration-150 focus:ring-2 focus:ring-primary/20',

        // Loading animations
        pulse: 'animate-pulse duration-1000',
        bounce: 'animate-bounce duration-1000',
        spin: 'animate-spin duration-1000',
    },
} as const;

export const m3ColorRoles = {
    // Primary: Main brand color and its variants
    primary: {
        base: 'bg-primary text-on-primary',
        container: 'bg-primary-container text-on-primary-container',
    },

    // Secondary: Supporting color for UI elements
    secondary: {
        base: 'bg-secondary text-on-secondary',
        container: 'bg-secondary-container text-on-secondary-container',
    },

    // Tertiary: Additional accent color
    tertiary: {
        base: 'bg-tertiary text-on-tertiary',
        container: 'bg-tertiary-container text-on-tertiary-container',
    },

    // Error: For error states and destructive actions
    error: {
        base: 'bg-error text-on-error',
        container: 'bg-error-container text-on-error-container',
    },

    // Surface: Background colors with hierarchy
    surface: {
        base: 'bg-surface text-on-surface',
        variant: 'bg-surface-variant text-on-surface-variant',
        dim: 'bg-surface-dim text-on-surface',
        bright: 'bg-surface-bright text-on-surface',
        containerLowest: 'bg-surface-container-lowest text-on-surface',
        containerLow: 'bg-surface-container-low text-on-surface',
        container: 'bg-surface-container text-on-surface',
        containerHigh: 'bg-surface-container-high text-on-surface',
        containerHighest: 'bg-surface-container-highest text-on-surface',
    },
} as const;
