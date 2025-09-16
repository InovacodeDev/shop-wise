import { Button } from '@/components/md3/button';
import { Input } from '@/components/md3/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/hooks/useI18n';
import type { ManualUrlInputProps } from '@/types/webcrawler';
import { faLink, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export function ManualUrlInput({ onSubmit, isLoading = false, className = '' }: ManualUrlInputProps) {
    const { t } = useI18n();
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string>('');

    const validateUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);

            // Check if it looks like an NFCe URL
            const isNfceUrl =
                url.includes('nfce.') ||
                url.includes('nfce/') ||
                url.includes('fazenda.') ||
                url.includes('.gov.br') ||
                url.includes('nfe.');

            if (!isNfceUrl) {
                setError(t('invalidNfceUrl'));
                return false;
            }

            setError('');
            return true;
        } catch {
            setError(t('invalidUrl'));
            return false;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            setError(t('urlIsRequired'));
            return;
        }

        if (validateUrl(url.trim())) {
            onSubmit(url.trim());
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setUrl(newUrl);

        // Clear error when user starts typing
        if (error && newUrl.trim()) {
            setError('');
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="nfce-url">{t('nfceUrl')}</Label>
                    <Input
                        id="nfce-url"
                        type="url"
                        placeholder={t('pasteTheNfceUrlHere')}
                        value={url}
                        onChange={handleUrlChange}
                        disabled={isLoading}
                        className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                    <p className="text-sm text-gray-600">
                        {t('pasteTheFullNfceUrlFromQrCode')}
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !url.trim()}
                >
                    {isLoading ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
                            {t('Analyzing')}
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faLink} className="w-4 h-4 mr-2" />
                            {t('analyzeNfce')}
                        </>
                    )}
                </Button>
            </form>

            <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium">{t('howToGetTheNfceUrl')}</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>{t('findTheQrCodeOnYourReceipt')}</li>
                    <li>{t('useAQrCodeReaderOnYourPhone')}</li>
                    <li>{t('copyAndPasteTheFullUrlHere')}</li>
                </ul>
            </div>
        </div>
    );
}
