'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const TOOLBAR_BUTTONS = [
  { cmd: 'bold', label: 'B', title: 'Bold', style: 'font-bold' },
  { cmd: 'italic', label: 'I', title: 'Italic', style: 'italic' },
  { cmd: 'underline', label: 'U', title: 'Underline', style: 'underline' },
];

const BLOCK_BUTTONS = [
  { tag: 'h1', label: 'H1', title: 'Heading 1' },
  { tag: 'h2', label: 'H2', title: 'Heading 2' },
  { tag: 'h3', label: 'H3', title: 'Heading 3' },
  { tag: 'p', label: 'P', title: 'Paragraph' },
];

export default function RichTextEditor({ value, onChange, minHeight = 300 }: RichTextEditorProps) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external value → editor (only when value changes externally)
  useEffect(() => {
    if (mode === 'visual' && editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        isInternalUpdate.current = true;
        editorRef.current.innerHTML = value;
        isInternalUpdate.current = false;
      }
    }
  }, [value, mode]);

  const handleInput = useCallback(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  function execCmd(cmd: string) {
    // execCommand is deprecated but remains the only zero-dependency way to
    // support inline formatting on contentEditable. All major browsers still
    // implement it; it can be replaced with a proper WYSIWYG library if needed.
    document.execCommand(cmd, false);
    editorRef.current?.focus();
    handleInput();
  }

  function formatBlock(tag: string) {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    handleInput();
  }

  function insertList(ordered: boolean) {
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false);
    editorRef.current?.focus();
    handleInput();
  }

  function insertLink() {
    const url = window.prompt('Enter URL:', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
      editorRef.current?.focus();
      handleInput();
    }
  }

  function switchToVisual() {
    setMode('visual');
    // value is already up-to-date from html textarea
  }

  function switchToHtml() {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    setMode('html');
  }

  const btnClass = 'px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors';

  return (
    <div className="border border-slate-500 rounded overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-800 px-2 py-1.5 flex flex-wrap items-center gap-1 border-b border-slate-600">
        {/* Mode toggle */}
        <div className="flex rounded overflow-hidden border border-slate-600 mr-2">
          <button
            type="button"
            onClick={switchToVisual}
            className={`px-2 py-0.5 text-xs transition-colors ${mode === 'visual' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={switchToHtml}
            className={`px-2 py-0.5 text-xs transition-colors ${mode === 'html' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
          >
            HTML
          </button>
        </div>

        {mode === 'visual' && (
          <>
            <div className="w-px h-5 bg-slate-600 mx-0.5" />
            {TOOLBAR_BUTTONS.map(b => (
              <button key={b.cmd} type="button" onClick={() => execCmd(b.cmd)} title={b.title}
                className={`${btnClass} ${b.style}`}>
                {b.label}
              </button>
            ))}

            <div className="w-px h-5 bg-slate-600 mx-0.5" />
            {BLOCK_BUTTONS.map(b => (
              <button key={b.tag} type="button" onClick={() => formatBlock(b.tag)} title={b.title}
                className={btnClass}>
                {b.label}
              </button>
            ))}

            <div className="w-px h-5 bg-slate-600 mx-0.5" />
            <button type="button" onClick={() => insertList(false)} title="Unordered List" className={btnClass}>UL</button>
            <button type="button" onClick={() => insertList(true)} title="Ordered List" className={btnClass}>OL</button>

            <div className="w-px h-5 bg-slate-600 mx-0.5" />
            <button type="button" onClick={insertLink} title="Insert Link" className={btnClass}>Link</button>
          </>
        )}
      </div>

      {/* Visual editor */}
      {mode === 'visual' && (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="w-full px-3 py-2 bg-slate-600 text-white text-sm focus:outline-none prose prose-invert max-w-none"
          style={{ minHeight }}
          data-placeholder="Write your content here…"
        />
      )}

      {/* HTML source editor */}
      {mode === 'html' && (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-600 text-white text-sm font-mono focus:outline-none resize-y"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
