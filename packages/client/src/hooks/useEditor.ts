import { useState, useCallback, useRef, useEffect } from 'react';
import { updateDocument } from '../api/documents.api';
import { showToast } from '../components/ui/Toast';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved';

/**
 * Hook managing editor auto-save with debounce and manual save.
 */
export function useEditor(documentId: string | undefined) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (data: { title?: string; content?: string }) => {
      if (!documentId) return;
      setSaveStatus('saving');
      try {
        await updateDocument(documentId, data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
      } catch {
        setSaveStatus('unsaved');
        showToast('Failed to save', 'error');
      }
    },
    [documentId]
  );

  const debouncedSave = useCallback(
    (data: { title?: string; content?: string }) => {
      setSaveStatus('unsaved');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => save(data), 2000);
    },
    [save]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return { saveStatus, save, debouncedSave };
}
