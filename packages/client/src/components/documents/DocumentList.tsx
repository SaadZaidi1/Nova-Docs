import type { DocumentListItem } from '../../types/document.types';
import DocumentCard from './DocumentCard';

interface DocumentListProps {
  documents: DocumentListItem[];
  onDelete?: (id: string) => void;
}

/**
 * Document list with two sections: "My Documents" and "Shared with me".
 * Shows empty states per section.
 */
export default function DocumentList({ documents, onDelete }: DocumentListProps) {
  const myDocs = documents.filter((d) => d.isOwner);
  const sharedDocs = documents.filter((d) => !d.isOwner);

  return (
    <div className="space-y-8">
      {/* My Documents */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          My Documents
        </h2>
        {myDocs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">No documents yet</p>
            <p className="text-xs text-gray-400 mt-1">Create a new document to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {myDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
            ))}
          </div>
        )}
      </section>

      {/* Shared with me */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Shared with me
        </h2>
        {sharedDocs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">No shared documents</p>
            <p className="text-xs text-gray-400 mt-1">Documents shared with you will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sharedDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
