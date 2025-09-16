import { TestTranslations } from '@/test-translations';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/i18n-test')({
    component: TestTranslations,
});
