'use client';

import { useState } from 'react';
import { CaseNote } from '@/app/types/legal';
import { createCaseNote, deleteCaseNote } from "@/app/lib/api"

interface NotesTabProps {
  caseId: number;
  tenant: string;
  notes: CaseNote[];
  onNoteAdded: () => void;
}

export default function NotesTab({ caseId, tenant, notes, onNoteAdded }: NotesTabProps) {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [noteType, setNoteType] = useState('General');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !authorName) return;

    try {
      setLoading(true);
      await createCaseNote(tenant, caseId, {
        author_name: authorName,
        note_type: noteType,
        content,
        is_pinned: isPinned,
      });
      setContent('');
      onNoteAdded(); // Refresh parent case data
    } catch (err) {
      alert('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  // Sort pinned notes to top
  const sortedNotes = [...notes].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));

  return (
    <div className="space-y-6">
      {/* Note Creator Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Add Case Note</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Author Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="p-2 border rounded-md text-sm"
            required
          />
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            className="p-2 border rounded-md text-sm bg-white"
          >
            <option value="General">General</option>
            <option value="Strategy">Strategy</option>
            <option value="Court Action">Court Action</option>
            <option value="Client Contact">Client Contact</option>
          </select>
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span>Pin to top</span>
          </label>
        </div>
        <textarea
          placeholder="Type note details..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full p-2 border rounded-md text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Post Note'}
        </button>
      </form>

      {/* Notes Feed */}
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No notes recorded for this case yet.</p>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border ${
                note.is_pinned ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">{note.author_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {note.note_type}
                  </span>
                  {note.is_pinned && (
                    <span className="text-xs text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                      📌 Pinned
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleString()}
                </span>
                <button
      onClick={async () => {
        if (confirm("Are you sure you want to delete this note?")) {
          await deleteCaseNote(tenant, caseId, note.id);
          onNoteAdded(); // Refresh state
        }
      }}
      className="text-xs text-red-500 hover:text-red-700 font-medium px-1"
    >
      Delete
    </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}