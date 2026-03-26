import { Button, Divider, Stack } from "@mantine/core";
import { isGoogleOauthEnabled } from "@/lib/config.ts";

export default function SsoLogin() {
  if (!isGoogleOauthEnabled()) {
    return null;
  }

  return (
    <Stack gap="md" mb="md">
      <Button
        component="a"
        href="/api/sso/google"
        variant="default"
        fullWidth
      >
        Continue with Google
      </Button>
      <Divider label="or" labelPosition="center" />
    </Stack>
  );
}
