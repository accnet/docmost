import { FeaturePlaceholder } from "../../components/feature-placeholder";

interface SpacePublicSharingToggleProps {
  space?: unknown;
}

export default function SpacePublicSharingToggle(
  _props: SpacePublicSharingToggleProps,
) {
  return <FeaturePlaceholder title="Space public sharing" />;
}
