import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/login-form";
import { ShopWiseIcon } from "@/components/icons";

export const Route = createFileRoute("/login")({
    component: LoginPage,
});

function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <Link to="/">
                    <ShopWiseIcon className="w-16 h-16 text-primary" />
                </Link>
                <LoginForm />
            </div>
        </div>
    );
}
