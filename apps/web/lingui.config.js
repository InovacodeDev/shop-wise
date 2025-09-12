import { defineConfig } from '@lingui/cli';

export default defineConfig({
    sourceLocale: 'en',
    // Keep English as source and expose Portuguese translations
    locales: ['en', 'pt'],
    catalogs: [
        {
            // Use PO files for translations (extraction/compile will target .po)
            path: '<rootDir>/src/locales/{locale}/messages',
            include: ['src'],
            format: 'po',
        },
    ],
});
