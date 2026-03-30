import apiClient from './client';
import type { SharesResponse } from '../types/api.types';
import type { ShareEntry } from '../types/document.types';

/** Get all shares for a document */
export async function getShares(documentId: string): Promise<SharesResponse> {
  const res = await apiClient.get<SharesResponse>(`/documents/${documentId}/shares`);
  return res.data;
}

/** Share a document with another user by email */
export async function createShare(
  documentId: string,
  data: { email: string; permission: 'viewer' | 'editor' }
): Promise<{ share: ShareEntry }> {
  const res = await apiClient.post<{ share: ShareEntry }>(`/documents/${documentId}/shares`, data);
  return res.data;
}

/** Revoke a share for a specific user */
export async function revokeShare(documentId: string, userId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}/shares/${userId}`);
}
