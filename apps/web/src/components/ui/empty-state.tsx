import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Card, CardContent } from "@/components/md3/card";
import { Button } from "@/components/md3/button";
import { ReactNode } from "react";

interface EmptyStateProps {
    icon?: IconDefinition;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
    className?: string;
    variant?: "default" | "minimal";
}

export function EmptyState({
    icon = faBoxOpen,
    title,
    description,
    action,
    children,
    className,
    variant = "default"
}: EmptyStateProps) {
    const content = (
        <>
            <div className="mb-6 rounded-full bg-surface-variant/50 p-6 inline-flex">
                <FontAwesomeIcon icon={icon} className="h-8 w-8 text-on-surface-variant" />
            </div>
            <h3 className="text-title-large font-medium text-on-surface mb-3">{title}</h3>
            {description && (
                <p className="text-body-medium text-on-surface-variant max-w-sm mx-auto mb-6">
                    {description}
                </p>
            )}
            {action && (
                <Button
                    onClick={action.onClick}
                    variant="filled"
                    className="mb-4"
                >
                    {action.label}
                </Button>
            )}
            {children}
        </>
    );

    if (variant === "minimal") {
        return (
            <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
                {content}
            </div>
        );
    }

    return (
        <Card className={cn("w-full", className)}>
            <CardContent className="flex flex-col items-center justify-center text-center py-12 px-6">
                {content}
            </CardContent>
        </Card>
    );
}
