import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ShopWiseIcon } from "@/components/icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

const resetPasswordSearchSchema = z.object({
    token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
    component: ResetPasswordPage,
    validateSearch: resetPasswordSearchSchema,
});

function ResetPasswordPage() {
    const { token } = Route.useSearch();

    if (!token) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <Link to="/">
                        <ShopWiseIcon className="w-10 h-10 text-primary" />
                    </Link>
                    <div className="text-center p-8">
                        <h1 className="text-2xl font-headline mb-4">Invalid Reset Link</h1>
                        <p className="text-muted-foreground mb-6">
                            This password reset link is invalid or has expired.
                        </p>
                        <Link to="/forgot-password">
                            <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
                                Request New Reset Link
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <Link to="/">
                    <ShopWiseIcon className="w-10 h-10 text-primary" />
                </Link>
                <ResetPasswordForm token={token} />
            </div>
        </div>
    );
}