'use client';

import { useRef, useState } from 'react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}

export default function ImageUploadField({ label, value, onChange, accept = 'image/*' }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/backoffice/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        const e = await res.json();
        setError(e.error ?? 'Upload failed');
      }
    } catch {
      setError('Upload error');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="block text-slate-400 text-sm mb-1">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="border border-dashed border-slate-500 rounded p-4 bg-slate-600 space-y-3"
      >
        {/* Preview */}
        {value && (
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="h-16 w-auto max-w-[160px] object-contain rounded border border-slate-500 bg-slate-700"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-red-400 hover:text-red-300 text-xs mt-1"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 bg-slate-500 hover:bg-slate-400 disabled:opacity-50 text-white text-xs rounded transition-colors"
          >
            {uploading ? 'Uploading…' : value ? 'Replace Image' : 'Upload Image'}
          </button>
          <span className="text-slate-400 text-xs">or drag & drop (max 5 MB)</span>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
