import { EditorContent, EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Toolbar from './Toolbar';
import { usePageBreaks } from '../../hooks/usePageBreaks';
import { useRef } from 'react';

interface EditorProps {
  content: string;
  editable: boolean;
  onChange: (content: string) => void;
}

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Placeholder.configure({
    placeholder: 'Start typing your document…',
  }),
  CharacterCount,
];

export default function Editor({ content, editable, onChange }: EditorProps) {
  let parsedContent: string | object = '';
  if (content) {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = content;
    }
  }

  return (
    <EditorProvider
      extensions={extensions}
      content={parsedContent}
      editable={editable}
      onUpdate={({ editor }) => {
        const json = editor.getJSON();
        onChange(JSON.stringify(json));
      }}
      slotBefore={editable ? <Toolbar /> : undefined}
    >
      <div className="flex-1 overflow-y-auto bg-[#E8EAED]">
        <EditorCanvas />
      </div>
    </EditorProvider>
  );
}

function EditorCanvas() {
  const { editor } = useCurrentEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const breakCount = usePageBreaks(containerRef as React.RefObject<HTMLElement>);
  const PAGE_HEIGHT = 1056;

  if (!editor) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '24px',
        paddingBottom: '48px',
        minHeight: '100%',
      }}
    >
      <div style={{ position: 'relative', width: '816px' }} ref={containerRef}>
        <div className={!editor.isEditable ? 'opacity-90' : ''}>
          <EditorContent editor={editor} className="tiptap-editor" />
        </div>
        
        {Array.from({ length: breakCount }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${(i + 1) * PAGE_HEIGHT - 12}px`,
              left: 0,
              right: 0,
              height: '24px',
              background: '#E8EAED',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}
      </div>
    </div>
  );
}
