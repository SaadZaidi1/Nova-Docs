import { useState, useCallback } from 'react';
import { listDocuments, createDocument, deleteDocument } from '../api/documents.api';
import { useDocumentStore } from '../store/documentStore';
import { showToast } from '../components/ui/Toast';

/**
 * Hook providing document list operations with loading state.
 */
export function useDocuments() {
  const { documents, setDocuments, removeDocument } = useDocumentStore();
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDocuments();
      setDocuments(data.documents);
    } catch {
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  }, [setDocuments]);

  const handleCreate = useCallback(async () => {
    try {
      const data = await createDocument();
      return data.document;
    } catch {
      showToast('Failed to create document', 'error');
      return null;
    }
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteDocument(id);
        removeDocument(id);
        showToast('Document deleted', 'success');
      } catch {
        showToast('Failed to delete document', 'error');
      }
    },
    [removeDocument]
  );

  return {
    documents,
    loading,
    fetchDocuments,
    createDocument: handleCreate,
    deleteDocument: handleDelete,
  };
}
