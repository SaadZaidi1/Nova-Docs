import { useState, useCallback } from 'react';
import { getShares, createShare, revokeShare } from '../api/sharing.api';
import { showToast } from '../components/ui/Toast';
import type { ShareEntry } from '../types/document.types';

/**
 * Hook providing sharing operations with state management.
 */
export function useSharing(documentId: string) {
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShares = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShares(documentId);
      setShares(data.shares);
    } catch {
      // Non-owners can't list shares — that's expected
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const handleShare = useCallback(
    async (email: string, permission: 'viewer' | 'editor') => {
      const data = await createShare(documentId, { email, permission });
      setShares((prev) => [data.share, ...prev]);
      showToast('Document shared', 'success');
      return data.share;
    },
    [documentId]
  );

  const handleRevoke = useCallback(
    async (userId: string) => {
      await revokeShare(documentId, userId);
      setShares((prev) => prev.filter((s) => s.userId !== userId));
      showToast('Access revoked', 'success');
    },
    [documentId]
  );

  return {
    shares,
    loading,
    fetchShares,
    createShare: handleShare,
    revokeShare: handleRevoke,
  };
}
