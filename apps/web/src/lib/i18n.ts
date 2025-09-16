import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Function to load resources dynamically
const loadResources = async () => {
    const [enAll, ptAll, esAll] = await Promise.all([
        fetch('/locales/en/all-translations.json').then((res) => res.json()),
        fetch('/locales/pt/all-translations.json').then((res) => res.json()),
        fetch('/locales/es/all-translations.json').then((res) => res.json()),
    ]);

    return {
        en: {
            translation: enAll,
        },
        pt: {
            translation: ptAll,
        },
        es: {
            translation: esAll,
        },
    };
};

// Initialize i18next with dynamic resource loading
const initI18n = async () => {
    const resources = await loadResources();

    return i18next
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            lng: 'en',
            fallbackLng: 'en',
            supportedLngs: ['en', 'pt', 'es'],
            defaultNS: 'translation',
            fallbackNS: 'translation',
            interpolation: {
                escapeValue: false,
            },
            detection: {
                order: ['querystring', 'localStorage', 'navigator'],
                lookupQuerystring: 'lng',
                lookupLocalStorage: 'i18nextLng',
                caches: ['localStorage'],
            },
        });
};

// Initialize i18n
initI18n();

export default i18next;
