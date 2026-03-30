import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDocuments, createDocument, deleteDocument } from '../api/documents.api';
import { useDocumentStore } from '../store/documentStore';
import AppShell from '../components/layout/AppShell';
import TopBar from '../components/layout/TopBar';
import DocumentList from '../components/documents/DocumentList';
import NewDocumentButton from '../components/documents/NewDocumentButton';
import UploadModal from '../components/upload/UploadModal';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { showToast } from '../components/ui/Toast';

/**
 * Dashboard page showing all accessible documents with create/upload actions.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { documents, setDocuments, removeDocument } = useDocumentStore();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await listDocuments();
      setDocuments(data.documents);
    } catch {
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  }, [setDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const data = await createDocument();
      navigate(`/documents/${data.document.id}`);
    } catch {
      showToast('Failed to create document', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      return;
    }
    try {
      await deleteDocument(id);
      removeDocument(id);
      showToast('Document deleted', 'success');
    } catch {
      showToast('Failed to delete document', 'error');
    }
  };

  return (
    <AppShell topBar={<TopBar />}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">Create, edit, and share documents</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowUpload(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </Button>
            <NewDocumentButton onClick={handleCreate} loading={creating} />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <DocumentList documents={documents} onDelete={handleDelete} />
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal isOpen={showUpload} onClose={() => { setShowUpload(false); fetchDocuments(); }} />
    </AppShell>
  );
}
