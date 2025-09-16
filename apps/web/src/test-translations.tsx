import { useI18n } from '@/hooks/useI18n'

export function TestTranslations() {
  const { t, locale, isLoading, i18n } = useI18n()

  if (isLoading) {
    return <div>Loading translations...</div>
  }

  return (
    <div className="p-4">
      <h1>Translation Test</h1>
      <p>Current Language: {locale}</p>
      
      <div className="mt-4">
        <button onClick={() => i18n.changeLanguage('en')}>English</button>
        <button onClick={() => i18n.changeLanguage('pt')} className="ml-2">Português</button>
        <button onClick={() => i18n.changeLanguage('es')} className="ml-2">Español</button>
      </div>
      
      <div className="mt-4">
        <p>Welcome: {t('Welcome Back!')}</p>
        <p>Email: {t('Email')}</p>
        <p>Login: {t('Login')}</p>
      </div>
    </div>
  )
}
