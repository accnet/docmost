import {
  ResponsiveSettingsContent,
  ResponsiveSettingsControl,
  ResponsiveSettingsRow,
} from "@/components/ui/responsive-settings-row.tsx";
import { useUpdateSpaceMutation } from "@/features/space/queries/space-query.ts";
import { ISpace } from "@/features/space/types/space.types.ts";
import { Switch, Text } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";

interface SpacePublicSharingToggleProps {
  space?: ISpace;
}

export default function SpacePublicSharingToggle(
  props: SpacePublicSharingToggleProps,
) {
  const { t } = useTranslation();
  const updateSpaceMutation = useUpdateSpaceMutation();
  const space = props.space;

  if (!space) {
    return null;
  }

  const publicSharingEnabled = space.settings?.sharing?.disabled !== true;

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSpaceMutation.mutateAsync({
      spaceId: space.id,
      disablePublicSharing: !event.currentTarget.checked,
    });
  };

  return (
    <ResponsiveSettingsRow>
      <ResponsiveSettingsContent>
        <Text size="md">{t("Space public sharing")}</Text>
        <Text size="sm" c="dimmed">
          {t(
            "Allow pages in this space to be shared publicly. Disabling this removes existing shared links for the space.",
          )}
        </Text>
      </ResponsiveSettingsContent>
      <ResponsiveSettingsControl>
        <Switch
          checked={publicSharingEnabled}
          onChange={handleToggle}
          disabled={updateSpaceMutation.isPending}
          size="md"
        />
      </ResponsiveSettingsControl>
    </ResponsiveSettingsRow>
  );
}
