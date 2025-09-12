import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/md3/button";
import { Input } from "@/components/md3/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, ReactNode } from "react";
import { useLingui } from '@lingui/react/macro';

interface DeleteConfirmationDialogProps {
    triggerButton: ReactNode;
    title: string;
    description: string;
    confirmButtonText: string;
    onConfirm: () => Promise<void>;
}

export function DeleteConfirmationDialog({
    triggerButton,
    title,
    description,
    confirmButtonText,
    onConfirm,
}: DeleteConfirmationDialogProps) {
    const { t } = useLingui();
    const [isOpen, setIsOpen] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            // Generate a new 4-digit random code when the dialog opens
            const newCode = Math.floor(1000 + Math.random() * 9000).toString();
            setConfirmationCode(newCode);
            setInputCode(""); // Reset input
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            toast({
                title: t`Success!`,
                description: t`Operation completed successfully.`,
            });
            setIsOpen(false);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t`Error`,
                description: error.message || t`An unexpected error occurred. Please try again.`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isCodeMatch = inputCode === confirmationCode;

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                        <span>
                            {t`To confirm, please enter the code <b>${confirmationCode}</b> in the box below.`}
                        </span>
                    </p>
                    <Input
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder={t`Enter the confirmation code`}
                        autoFocus
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{t`Cancel`}</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleConfirm} disabled={!isCodeMatch || isLoading}>
                        {isLoading ? t`Processing...` : confirmButtonText}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
