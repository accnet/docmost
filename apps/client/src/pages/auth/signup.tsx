import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { Helmet } from "react-helmet-async";
import { getAppName, isCloud } from "@/lib/config.ts";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getSetupStatus } from "@/features/auth/services/auth-service";
import { Navigate } from "react-router-dom";
import APP_ROUTE from "@/lib/app-route.ts";

export default function SignupPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "setup-status"],
    queryFn: getSetupStatus,
    enabled: !isCloud(),
  });

  if (!isCloud() && isLoading) {
    return null;
  }

  if (!isCloud() && !data?.isSetupComplete) {
    return <Navigate to={APP_ROUTE.AUTH.SETUP} replace />;
  }

  return (
    <>
      <Helmet>
        <title>
          {t("Sign Up")} - {getAppName()}
        </title>
      </Helmet>
      <SignUpForm />
    </>
  );
}
