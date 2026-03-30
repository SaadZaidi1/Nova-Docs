import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import { showToast } from '../ui/Toast';
import { getShares, createShare, revokeShare } from '../../api/sharing.api';
import type { ShareEntry } from '../../types/document.types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  isOwner: boolean;
}

/**
 * Share modal for managing document sharing.
 * Shows current shares, allows adding by email, and revoking access.
 */
export default function ShareModal({ isOpen, onClose, documentId, isOwner }: ShareModalProps) {
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'viewer' | 'editor'>('viewer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && isOwner) {
      loadShares();
    }
  }, [isOpen, documentId, isOwner]);

  const loadShares = async () => {
    setLoading(true);
    try {
      const data = await getShares(documentId);
      setShares(data.shares);
    } catch {
      // Non-owners can't view shares - that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setSubmitting(true);
    try {
      const data = await createShare(documentId, { email: email.trim(), permission });
      setShares((prev) => [data.share, ...prev]);
      setEmail('');
      showToast('Document shared successfully', 'success');
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.error || 'Failed to share';
      if (status === 404) {
        setError('No user found with that email address');
      } else if (status === 409) {
        setError('Document is already shared with this user');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await revokeShare(documentId, userId);
      setShares((prev) => prev.filter((s) => s.userId !== userId));
      showToast('Access revoked', 'success');
    } catch {
      showToast('Failed to revoke access', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share document" maxWidth="max-w-md">
      {/* Share form - owner only */}
      {isOwner && (
        <form onSubmit={handleShare} className="space-y-3 mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                id="share-email-input"
              />
            </div>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'viewer' | 'editor')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="share-permission-select"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={submitting} size="sm">
            Share
          </Button>
        </form>
      )}

      {/* Current shares list */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">People with access</h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : shares.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            {isOwner ? 'No one else has access yet' : 'You have access to this document'}
          </p>
        ) : (
          <ul className="space-y-2">
            {shares.map((share) => (
              <li key={share.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                    {share.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{share.userName}</p>
                    <p className="text-xs text-gray-500">{share.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    share.permission === 'editor'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {share.permission === 'editor' ? 'Editor' : 'Viewer'}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => handleRevoke(share.userId)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Revoke access"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
