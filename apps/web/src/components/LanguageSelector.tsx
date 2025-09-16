import { useI18n } from '@/hooks/useI18n'

export function LanguageSelector() {
  const { locale, i18n, t } = useI18n()
  const changeLanguage = (lng: string) => i18n.changeLanguage(lng)

  return (
    <select 
      value={locale} 
      onChange={(e) => changeLanguage(e.target.value)}
      className="border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
    >
      <option value="en">English</option>
      <option value="pt">Português</option>
    </select>
  )
}