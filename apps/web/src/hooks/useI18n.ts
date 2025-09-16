import { useTranslation } from 'react-i18next';

export function useI18n(namespace = 'translation') {
    const { t, i18n } = useTranslation(namespace);

    return {
        t,
        i18n,
        locale: i18n.language,
        isLoading: false,
    };
}
