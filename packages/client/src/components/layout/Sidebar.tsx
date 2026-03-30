import { useNavigate } from 'react-router-dom';
import type { DocumentListItem } from '../../types/document.types';

interface SidebarProps {
  documents: DocumentListItem[];
  currentDocId?: string;
}

/**
 * Sidebar showing document lists grouped by ownership.
 */
export default function Sidebar({ documents, currentDocId }: SidebarProps) {
  const navigate = useNavigate();
  const myDocs = documents.filter((d) => d.isOwner);
  const sharedDocs = documents.filter((d) => !d.isOwner);

  return (
    <div className="py-4">
      {/* My Documents */}
      <div className="px-4 mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          📄 My Documents
        </h3>
        {myDocs.length === 0 ? (
          <p className="text-sm text-gray-400 px-2">No documents yet</p>
        ) : (
          <ul className="space-y-0.5">
            {myDocs.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition-colors ${
                    currentDocId === doc.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {doc.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Shared Documents */}
      {sharedDocs.length > 0 && (
        <div className="px-4 border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            👥 Shared with me
          </h3>
          <ul className="space-y-0.5">
            {sharedDocs.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition-colors ${
                    currentDocId === doc.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {doc.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
