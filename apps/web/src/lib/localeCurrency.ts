// Centralized locale -> currency / payment config utilities
export const localeToCurrency: Record<string, string> = {
  'pt': 'BRL',
  'pt-BR': 'BRL',
  'en': 'USD',
  'en-US': 'USD',
  'es': 'EUR',
  'fr': 'EUR',
  'de': 'EUR',
  'it': 'EUR',
};

export function getCurrencyFromLocale(locale: string): string {
  if (!locale) return 'USD';
  return (
    localeToCurrency[locale] ||
    localeToCurrency[locale.split('-')[0]] ||
    'USD'
  );
}

export const localeToPaymentConfig: Record<string, { currency: string; country: string }> = {
  'pt': { currency: 'BRL', country: 'BR' },
  'pt-BR': { currency: 'BRL', country: 'BR' },
  'en': { currency: 'USD', country: 'US' },
  'en-US': { currency: 'USD', country: 'US' },
  'es': { currency: 'EUR', country: 'ES' },
  'fr': { currency: 'EUR', country: 'FR' },
  'de': { currency: 'EUR', country: 'DE' },
  'it': { currency: 'EUR', country: 'IT' },
};

export function getPaymentConfigFromLocale(locale: string) {
  if (!locale) return { currency: 'USD', country: 'US' };
  return (
    localeToPaymentConfig[locale] ||
    localeToPaymentConfig[locale.split('-')[0]] ||
    { currency: 'USD', country: 'US' }
  );
}
