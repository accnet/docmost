import { Alert, Text } from "@mantine/core";
import React from "react";

interface FeaturePlaceholderProps {
  title: string;
  description?: string;
}

export function FeaturePlaceholder({
  title,
  description = "This feature is not available in this OSS build.",
}: FeaturePlaceholderProps) {
  return (
    <Alert color="gray" variant="light">
      <Text fw={600}>{title}</Text>
      <Text size="sm">{description}</Text>
    </Alert>
  );
}
