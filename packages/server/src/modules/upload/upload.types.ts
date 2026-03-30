/** Response shape from upload endpoint */
export interface UploadResponse {
  documentId: string;
  title: string;
}

/** Supported file types for upload */
export const SUPPORTED_MIMETYPES = [
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/** Supported file extensions */
export const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.docx'];
