import { create } from 'zustand';
import type { DocumentListItem, Document } from '../types/document.types';

interface DocumentState {
  documents: DocumentListItem[];
  currentDocument: Document | null;
  setDocuments: (documents: DocumentListItem[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  updateCurrentDocument: (updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
}

/**
 * Zustand document store managing document list and current editor document.
 */
export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  currentDocument: null,

  setDocuments: (documents: DocumentListItem[]) => {
    set({ documents });
  },

  setCurrentDocument: (document: Document | null) => {
    set({ currentDocument: document });
  },

  updateCurrentDocument: (updates: Partial<Document>) => {
    set((state) => ({
      currentDocument: state.currentDocument
        ? { ...state.currentDocument, ...updates }
        : null,
    }));
  },

  removeDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    }));
  },
}));
