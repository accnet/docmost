import ShareModal from "@/features/share/components/share-modal.tsx";

interface PageShareModalProps {
  readOnly?: boolean;
}

export function PageShareModal(props: PageShareModalProps) {
  return <ShareModal readOnly={props.readOnly ?? false} />;
}
