export const Feature = {
  AI: "ai",
  ATTACHMENT_INDEXING: "attachment_indexing",
  CONFLUENCE_IMPORT: "confluence_import",
  DOCX_IMPORT: "docx_import",
  COMMENT_RESOLUTION: "comment_resolution",
} as const;

export type Feature = (typeof Feature)[keyof typeof Feature];
