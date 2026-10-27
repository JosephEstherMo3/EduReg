import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `-- ==============================================================================
-- Student Registration Schema & Row Level Security (RLS) Setup
-- Table: public.students
-- ==============================================================================

-- 1. Create the students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    student_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    course TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create unique index for fast lookups & deduplication
CREATE UNIQUE INDEX IF NOT EXISTS students_student_id_unique_idx ON public.students (student_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow anonymous & authenticated visitors to insert registrations
DROP POLICY IF EXISTS "Allow public insert to students" ON public.students;
CREATE POLICY "Allow public insert to students"
ON public.students
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Policy: Allow visitors to query students (for duplicate check & directory)
DROP POLICY IF EXISTS "Allow public select to verify student_id" ON public.students;
CREATE POLICY "Allow public select to verify student_id"
ON public.students
FOR SELECT
TO anon, authenticated
USING (true);`;

export const SchemaGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card schema-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-container">
              <Terminal className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="modal-title">Supabase SQL Schema & RLS Setup</h3>
              <p className="modal-subtitle">
                Run this SQL in your Supabase SQL Editor to provision the table and policies.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="schema-instructions-card">
            <h4>Quick Setup Steps:</h4>
            <ol>
              <li>
                Open your{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-link"
                >
                  Supabase Project Dashboard <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>
              <li>Navigate to the <strong>SQL Editor</strong> tab on the left sidebar.</li>
              <li>Click <strong>New Query</strong>, paste the SQL below, and click <strong>Run</strong>.</li>
            </ol>
          </div>

          <div className="code-block-container">
            <div className="code-block-header">
              <span className="code-block-filename">supabase/schema.sql</span>
              <button
                type="button"
                onClick={handleCopy}
                className="copy-sql-btn"
                id="btn-copy-schema-sql"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 mr-1" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="sql-code-display">
              <code>{SQL_SCHEMA}</code>
            </pre>
          </div>

          <div className="security-note">
            <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <p>
              <strong>Row Level Security (RLS) is enabled:</strong> The declared policies permit
              client web browsers to execute safe inserts and duplicate check queries without exposing administrative credentials.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button type="button" onClick={handleCopy} className="btn-primary">
            {copied ? 'Copied to Clipboard' : 'Copy SQL Script'}
          </button>
        </div>
      </div>
    </div>
  );
};
