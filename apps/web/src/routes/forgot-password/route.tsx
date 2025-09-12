import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ShopWiseIcon } from "@/components/icons";

export const Route = createFileRoute("/forgot-password")({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <Link to="/">
                    <ShopWiseIcon className="w-10 h-10 text-primary" />
                </Link>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
