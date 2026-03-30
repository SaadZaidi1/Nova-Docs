import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface TopBarProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  saveStatus?: 'saving' | 'saved' | 'unsaved' | 'idle';
  onShareClick?: () => void;
  showDocumentControls?: boolean;
}

/**
 * Google Docs-style top bar with editable title, save status, and user controls.
 */
export default function TopBar({
  title,
  onTitleChange,
  saveStatus = 'idle',
  onShareClick,
  showDocumentControls = false,
}: TopBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title || '');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditTitle(title || '');
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (editTitle.trim() && editTitle !== title && onTitleChange) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title || '');
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSave();
    if (e.key === 'Escape') {
      setEditTitle(title || '');
      setIsEditingTitle(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const saveStatusText: Record<string, { text: string; color: string }> = {
    saving: { text: 'Saving…', color: 'text-yellow-600' },
    saved: { text: 'All changes saved', color: 'text-green-600' },
    unsaved: { text: 'Unsaved changes', color: 'text-orange-500' },
    idle: { text: '', color: '' },
  };

  const statusInfo = saveStatusText[saveStatus];

  return (
    <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between flex-shrink-0 z-10">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-lg font-semibold text-gray-800 hidden sm:inline">Nova Docs</span>
        </button>

        {showDocumentControls && (
          <div className="flex items-center min-w-0 ml-2">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-medium text-gray-800 border-b-2 border-primary-500 outline-none bg-transparent px-1 min-w-[200px]"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-medium text-gray-800 hover:bg-gray-100 px-2 py-0.5 rounded truncate max-w-[300px] transition-colors"
                title="Click to rename"
              >
                {title || 'Untitled Document'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Center: Save status */}
      {showDocumentControls && statusInfo.text && (
        <div className="hidden md:flex items-center">
          <span className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
        </div>
      )}

      {/* Right: Share + Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {showDocumentControls && onShareClick && (
          <button
            onClick={onShareClick}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm"
            id="share-button"
          >
            Share
          </button>
        )}

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-primary-200 transition-all"
            title={user?.name}
            id="user-avatar-button"
          >
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                id="logout-button"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
