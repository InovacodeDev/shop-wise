import type { Config } from 'tailwindcss';

export default {
    darkMode: ['class'],
    content: ['./index.html', './src/styles/app.css', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            fontFamily: {
                body: ['var(--font-sans)', 'sans-serif'],
                headline: ['var(--font-sans)', 'sans-serif'],
                code: ['monospace'],
            },
            fontSize: {
                // M3 Typography Scale
                'display-large': ['3.5rem', { lineHeight: '4rem', fontWeight: '400' }], // 57px
                'display-medium': ['2.8125rem', { lineHeight: '3.25rem', fontWeight: '400' }], // 45px
                'display-small': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '400' }], // 36px
                'headline-large': ['2rem', { lineHeight: '2.5rem', fontWeight: '400' }], // 32px
                'headline-medium': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '400' }], // 28px
                'headline-small': ['1.5rem', { lineHeight: '2rem', fontWeight: '400' }], // 24px
                'title-large': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '400' }], // 22px
                'title-medium': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }], // 16px
                'title-small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14px
                'label-large': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14px
                'label-medium': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }], // 12px
                'label-small': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500' }], // 11px
                'body-large': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16px
                'body-medium': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
                'body-small': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }], // 12px
            },
            scale: {
                '102': '1.02',
            },
            colors: {
                // Legacy shadcn/ui compatibility
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',

                // M3 Color System - Main roles
                'primary-container': 'hsl(var(--primary-container))',
                'on-primary': 'hsl(var(--on-primary))',
                'on-primary-container': 'hsl(var(--on-primary-container))',

                'secondary-container': 'hsl(var(--secondary-container))',
                'on-secondary': 'hsl(var(--on-secondary))',
                'on-secondary-container': 'hsl(var(--on-secondary-container))',

                tertiary: 'hsl(var(--tertiary))',
                'tertiary-container': 'hsl(var(--tertiary-container))',
                'on-tertiary': 'hsl(var(--on-tertiary))',
                'on-tertiary-container': 'hsl(var(--on-tertiary-container))',

                error: 'hsl(var(--error))',
                'error-container': 'hsl(var(--error-container))',
                'on-error': 'hsl(var(--on-error))',
                'on-error-container': 'hsl(var(--on-error-container))',

                // M3 Surface roles
                surface: 'hsl(var(--surface))',
                'surface-dim': 'hsl(var(--surface-dim))',
                'surface-bright': 'hsl(var(--surface-bright))',
                'surface-container-lowest': 'hsl(var(--surface-container-lowest))',
                'surface-container-low': 'hsl(var(--surface-container-low))',
                'surface-container': 'hsl(var(--surface-container))',
                'surface-container-high': 'hsl(var(--surface-container-high))',
                'surface-container-highest': 'hsl(var(--surface-container-highest))',
                'surface-variant': 'hsl(var(--surface-variant))',
                'on-surface': 'hsl(var(--on-surface))',
                'on-surface-variant': 'hsl(var(--on-surface-variant))',

                // M3 Outline roles
                outline: 'hsl(var(--outline))',
                'outline-variant': 'hsl(var(--outline-variant))',

                // M3 Other roles
                'inverse-surface': 'hsl(var(--inverse-surface))',
                'inverse-on-surface': 'hsl(var(--inverse-on-surface))',
                'inverse-primary': 'hsl(var(--inverse-primary))',
                scrim: 'hsl(var(--scrim))',
                shadow: 'hsl(var(--shadow))',

                // State layers (for interaction states)
                'primary-8': 'hsl(var(--primary) / 0.08)',
                'primary-12': 'hsl(var(--primary) / 0.12)',
                'primary-hover': 'hsl(var(--primary) / 0.08)',
                'primary-focus': 'hsl(var(--primary) / 0.12)',
                'primary-pressed': 'hsl(var(--primary) / 0.12)',
                'on-surface-8': 'hsl(var(--on-surface) / 0.08)',
                'on-surface-12': 'hsl(var(--on-surface) / 0.12)',
                'on-surface-hover': 'hsl(var(--on-surface) / 0.08)',
                'on-surface-focus': 'hsl(var(--on-surface) / 0.12)',
                'on-surface-pressed': 'hsl(var(--on-surface) / 0.12)',

                // Sidebar compatibility
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    ring: 'hsl(var(--sidebar-ring))',
                },

                // Category colors (business logic specific)
                category: {
                    'produce-and-eggs': 'hsl(var(--color-category-produce-and-eggs))',
                    'produce-and-eggs-foreground': 'hsl(var(--color-category-produce-and-eggs-foreground))',
                    'meat-and-seafood': 'hsl(var(--color-category-meat-and-seafood))',
                    'meat-and-seafood-foreground': 'hsl(var(--color-category-meat-and-seafood-foreground))',
                    'bakery-and-deli': 'hsl(var(--color-category-bakery-and-deli))',
                    'bakery-and-deli-foreground': 'hsl(var(--color-category-bakery-and-deli-foreground))',
                    'dairy-and-chilled': 'hsl(var(--color-category-dairy-and-chilled))',
                    'dairy-and-chilled-foreground': 'hsl(var(--color-category-dairy-and-chilled-foreground))',
                    'pantry-and-dry-goods': 'hsl(var(--color-category-pantry-and-dry-goods))',
                    'pantry-and-dry-goods-foreground': 'hsl(var(--color-category-pantry-and-dry-goods-foreground))',
                    'breakfast-and-snacks': 'hsl(var(--color-category-breakfast-and-snacks))',
                    'breakfast-and-snacks-foreground': 'hsl(var(--color-category-breakfast-and-snacks-foreground))',
                    'frozen-foods': 'hsl(var(--color-category-frozen-foods))',
                    'frozen-foods-foreground': 'hsl(var(--color-category-frozen-foods-foreground))',
                    beverages: 'hsl(var(--color-category-beverages))',
                    'beverages-foreground': 'hsl(var(--color-category-beverages-foreground))',
                    'cleaning-and-household': 'hsl(var(--color-category-cleaning-and-household))',
                    'cleaning-and-household-foreground': 'hsl(var(--color-category-cleaning-and-household-foreground))',
                    'personal-care': 'hsl(var(--color-category-personal-care))',
                    'personal-care-foreground': 'hsl(var(--color-category-personal-care-foreground))',
                    'baby-and-child-care': 'hsl(var(--color-category-baby-and-child-care))',
                    'baby-and-child-care-foreground': 'hsl(var(--color-category-baby-and-child-care-foreground))',
                    'pet-supplies': 'hsl(var(--color-category-pet-supplies))',
                    'pet-supplies-foreground': 'hsl(var(--color-category-pet-supplies-foreground))',
                    'home-and-general': 'hsl(var(--color-category-home-and-general))',
                    'home-and-general-foreground': 'hsl(var(--color-category-home-and-general-foreground))',
                    pharmacy: 'hsl(var(--color-category-pharmacy))',
                    'pharmacy-foreground': 'hsl(var(--color-category-pharmacy-foreground))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0',
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                    to: {
                        height: '0',
                    },
                },
                'aurora-sm': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'aurora-md': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'aurora-lg': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'aurora-sm': 'aurora-sm 20s linear infinite',
                'aurora-md': 'aurora-md 20s linear infinite',
                'aurora-lg': 'aurora-lg 20s linear infinite',
            },
        },
    },
    plugins: [],
} satisfies Config;
