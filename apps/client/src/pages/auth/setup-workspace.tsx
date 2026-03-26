import { SetupWorkspaceForm } from "@/features/auth/components/setup-workspace-form.tsx";
import { Helmet } from "react-helmet-async";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import APP_ROUTE from "@/lib/app-route.ts";
import { getAppName } from "@/lib/config.ts";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getSetupStatus } from "@/features/auth/services/auth-service";

export default function SetupWorkspace() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "setup-status"],
    queryFn: getSetupStatus,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && data?.isSetupComplete) {
      navigate(APP_ROUTE.AUTH.LOGIN);
    }
  }, [data?.isSetupComplete, isLoading, navigate]);

  if (isLoading) {
    return <div></div>;
  }

  if (!data?.isSetupComplete) {
    return (
      <>
        <Helmet>
          <title>
            {t("Setup Workspace")} - {getAppName()}
          </title>
        </Helmet>
        <SetupWorkspaceForm />
      </>
    );
  }

  return null;
}
