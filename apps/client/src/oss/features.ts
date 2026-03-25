export const Feature = {
  API_KEYS: "api_keys",
  SECURITY_SETTINGS: "security_settings",
  AUDIT_LOGS: "audit_logs",
  AI: "ai",
  ATTACHMENT_INDEXING: "attachment_indexing",
  CONFLUENCE_IMPORT: "confluence_import",
  DOCX_IMPORT: "docx_import",
  COMMENT_RESOLUTION: "comment_resolution",
} as const;

export type Feature = (typeof Feature)[keyof typeof Feature];
