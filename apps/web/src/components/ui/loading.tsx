import React from 'react';
import { cn } from '@/lib/utils';
import { useLingui } from '@lingui/react/macro';
import { LoadingIndicator } from '@/components/md3/loading-indicator';
import { Card, CardContent } from '@/components/md3/card';

interface LoadingProps {
    text?: string;
    description?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    layout?: 'horizontal' | 'vertical';
    variant?: 'default' | 'card' | 'minimal';
}

export function Loading({
    text,
    description,
    className = '',
    size = 'md',
    layout = 'horizontal',
    variant = 'default'
}: LoadingProps) {
    const { t } = useLingui();
    const defaultText = text || t`Loading...`;

    const sizeMap = {
        sm: 'sm' as const,
        md: 'default' as const,
        lg: 'lg' as const
    };

    const paddingClasses = {
        sm: 'p-4',
        md: 'p-8',
        lg: 'p-12'
    };

    const content = (
        <>
            <LoadingIndicator
                size={sizeMap[size]}
                label={defaultText}
                showLabel={false}
                className="mb-4"
            />
            <div className="text-center">
                <h3 className="text-title-medium font-medium text-on-surface mb-2">
                    {defaultText}
                </h3>
                {description && (
                    <p className="text-body-small text-on-surface-variant">
                        {description}
                    </p>
                )}
            </div>
        </>
    );

    if (variant === 'card') {
        return (
            <Card className={cn("w-full", className)}>
                <CardContent className={cn(
                    "flex flex-col items-center justify-center text-center",
                    paddingClasses[size]
                )}>
                    {content}
                </CardContent>
            </Card>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className={cn("flex items-center justify-center space-x-3", className)}>
                <LoadingIndicator size={sizeMap[size]} />
                <span className="text-body-medium text-on-surface">{defaultText}</span>
            </div>
        );
    }

    if (layout === 'vertical') {
        return (
            <div className={cn(
                "flex flex-col items-center justify-center text-center space-y-4",
                paddingClasses[size],
                className
            )}>
                {content}
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center justify-center space-x-3",
            paddingClasses[size],
            className
        )}>
            <LoadingIndicator size={sizeMap[size]} />
            <span className="text-body-medium text-on-surface">{defaultText}</span>
        </div>
    );
}
