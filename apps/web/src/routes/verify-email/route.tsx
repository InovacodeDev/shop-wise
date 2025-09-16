import { Button } from "@/components/md3/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from "@/hooks/useI18n";
import { apiService } from "@/services/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setStatus("error");
        setErrorMessage(t("invalidOrMissingVerificationToken"));
        return;
      }
      try {
        await apiService.verifyEmail(token);
        if (!cancelled) setStatus("success");
      } catch (e: any) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(e?.message || t("couldNotVerifyEmail"));
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  function goHome() {
    navigate({ to: "/home" });
  }

  function goLogin() {
    navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("emailVerification")}</CardTitle>
            <CardDescription>
              {status === "pending" && t("verifyingYourEmailPleaseWait")}
              {status === "success" && t("yourEmailWasVerifiedSuccessfully")}
              {status === "error" && (errorMessage || t("couldNotVerifyEmail"))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "pending" && (
              <p>{t("processing")}</p>
            )}
            {status === "success" && (
              <div className="flex gap-2">
                <Button onClick={goHome} className="w-full">{t("goToHome")}</Button>
              </div>
            )}
            {status === "error" && (
              <div className="flex gap-2">
                <Button variant="outlined" onClick={goHome} className="w-1/2">{t("goToHome")}</Button>
                <Button onClick={goLogin} className="w-1/2">{t("goToLogin")}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
