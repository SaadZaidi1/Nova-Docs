import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, updateDocument } from '../api/documents.api';
import { useDocumentStore } from '../store/documentStore';
import TopBar from '../components/layout/TopBar';
import Editor from '../components/editor/Editor';
import ShareModal from '../components/sharing/ShareModal';
import Spinner from '../components/ui/Spinner';
import { showToast } from '../components/ui/Toast';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDocument, setCurrentDocument, updateCurrentDocument } = useDocumentStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showShare, setShowShare] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDocument(id);
        setCurrentDocument(data.document);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('You do not have access to this document');
        } else if (err.response?.status === 404) {
          setError('Document not found');
        } else {
          setError('Failed to load document');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();

    return () => {
      setCurrentDocument(null);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [id, setCurrentDocument]);

  const saveDocument = useCallback(
    async (content?: string) => {
      if (!id || !currentDocument) return;
      const contentToSave = content || pendingContentRef.current;
      if (contentToSave === null) return;

      setSaveStatus('saving');
      try {
        await updateDocument(id, { content: contentToSave, title: currentDocument.title });
        setSaveStatus('saved');
        pendingContentRef.current = null;
        setTimeout(() => setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev)), 2000);
      } catch {
        setSaveStatus('unsaved');
        showToast('Failed to save document', 'error');
      }
    },
    [id, currentDocument]
  );

  const handleContentChange = useCallback(
    (content: string) => {
      pendingContentRef.current = content;
      setSaveStatus('unsaved');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => saveDocument(content), 2000);
    },
    [saveDocument]
  );

  const handleTitleChange = useCallback(
    async (title: string) => {
      if (!id) return;
      updateCurrentDocument({ title });
      try {
        await updateDocument(id, { title });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev)), 2000);
      } catch {
        showToast('Failed to save title', 'error');
      }
    },
    [id, updateCurrentDocument]
  );

  // Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveDocument();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveDocument]);

  const isEditable = currentDocument?.permission === 'owner' || currentDocument?.permission === 'editor';

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-surface-secondary">
        <TopBar />
        <div className="flex items-center justify-center flex-1">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-surface-secondary">
        <TopBar />
        <div className="flex flex-col items-center justify-center flex-1">
          <p className="text-lg font-medium text-gray-700">{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentDocument) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar
        title={currentDocument.title}
        onTitleChange={isEditable ? handleTitleChange : undefined}
        saveStatus={saveStatus}
        onShareClick={() => setShowShare(true)}
        showDocumentControls
      />
      <Editor
        content={currentDocument.content}
        editable={isEditable ?? false}
        onChange={handleContentChange}
      />
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        documentId={currentDocument.id}
        isOwner={currentDocument.isOwner}
      />
    </div>
  );
}
