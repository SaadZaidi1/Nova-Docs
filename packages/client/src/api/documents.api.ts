import apiClient from './client';
import type { DocumentsResponse, DocumentResponse } from '../types/api.types';

/** List all documents accessible to the current user */
export async function listDocuments(): Promise<DocumentsResponse> {
  const res = await apiClient.get<DocumentsResponse>('/documents');
  return res.data;
}

/** Create a new blank document */
export async function createDocument(): Promise<DocumentResponse> {
  const res = await apiClient.post<DocumentResponse>('/documents');
  return res.data;
}

/** Get a single document by ID */
export async function getDocument(id: string): Promise<DocumentResponse> {
  const res = await apiClient.get<DocumentResponse>(`/documents/${id}`);
  return res.data;
}

/** Update a document's title and/or content */
export async function updateDocument(id: string, data: { title?: string; content?: string }): Promise<DocumentResponse> {
  const res = await apiClient.patch<DocumentResponse>(`/documents/${id}`, data);
  return res.data;
}

/** Delete a document */
export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}
