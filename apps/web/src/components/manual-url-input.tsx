import { useState } from 'react';
import { Button } from '@/components/md3/button';
import { Input } from '@/components/md3/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { ManualUrlInputProps } from '@/types/webcrawler';
import { useLingui } from '@lingui/react/macro';

export function ManualUrlInput({ onSubmit, isLoading = false, className = '' }: ManualUrlInputProps) {
    const { t } = useLingui();
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
                setError(t`Please enter a valid NFCe URL`);
                return false;
            }

            setError('');
            return true;
        } catch {
            setError(t`Please enter a valid URL`);
            return false;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            setError(t`Please enter a URL`);
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
                    <Label htmlFor="nfce-url">{t`NFCe URL`}</Label>
                    <Input
                        id="nfce-url"
                        type="url"
                        placeholder={t`https://nfce.fazenda...`}
                        value={url}
                        onChange={handleUrlChange}
                        disabled={isLoading}
                        className={error ? 'border-red-500' : ''}
                    />
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                    <p className="text-sm text-gray-600">
                        {t`Paste the NFCe URL you want to analyze here`}
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
                            {t`Analyzing...`}
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faLink} className="w-4 h-4 mr-2" />
                            {t`Analyze NFCe`}
                        </>
                    )}
                </Button>
            </form>

            <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium">{t`How to get the NFCe URL:`}</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>{t`Access the QR code of your fiscal receipt`}</li>
                    <li>{t`Use a QR code reader to obtain the URL`}</li>
                    <li>{t`Paste the full URL in the field above`}</li>
                </ul>
            </div>
        </div>
    );
}
