import { useNavigate } from 'react-router-dom';
import type { DocumentListItem } from '../../types/document.types';
import { formatRelativeDate } from '../../utils/formatDate';
import { useState, useRef, useEffect } from 'react';

interface DocumentCardProps {
  document: DocumentListItem;
  onDelete?: (id: string) => void;
}

/**
 * Document card displaying title, last edited time, owner, and ownership badge.
 * Includes three-dot menu with delete option for owners.
 */
export default function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) onDelete(doc.id);
  };

  return (
    <div
      onClick={() => navigate(`/documents/${doc.id}`)}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative"
      id={`doc-card-${doc.id}`}
    >
      {/* Document preview area */}
      <div className="h-40 border-b border-gray-100 bg-gray-50 rounded-t-lg flex items-center justify-center p-4">
        <div className="w-full h-full bg-white rounded border border-gray-200 p-3 overflow-hidden">
          <div className="space-y-1.5">
            <div className="h-2.5 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-100 rounded w-full" />
            <div className="h-2 bg-gray-100 rounded w-5/6" />
            <div className="h-2 bg-gray-100 rounded w-4/5" />
            <div className="h-2 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Card info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
            {!doc.isOwner && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                Shared
              </span>
            )}
            <span className="text-xs text-gray-500">{doc.ownerName}</span>
          </div>
          <span className="text-xs text-gray-400">{formatRelativeDate(doc.updatedAt)}</span>
        </div>
      </div>

      {/* Three-dot menu for owner */}
      {doc.isOwner && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Document options"
          >
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
