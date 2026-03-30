/** Standard API error response */
export interface ApiError {
  error: string;
  code?: string;
}

/** Wrapper for API responses containing documents */
export interface DocumentsResponse {
  documents: import('./document.types').DocumentListItem[];
}

/** Wrapper for single document response */
export interface DocumentResponse {
  document: import('./document.types').Document;
}

/** Wrapper for shares response */
export interface SharesResponse {
  shares: import('./document.types').ShareEntry[];
}

/** Upload response */
export interface UploadResponse {
  documentId: string;
  title: string;
}
