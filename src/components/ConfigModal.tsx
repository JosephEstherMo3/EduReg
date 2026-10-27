import React, { useState } from 'react';
import {
  X,
  Database,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Activity,
  Code,
  ExternalLink,
} from 'lucide-react';
import {
  getActiveCredentials,
  saveLocalCredentials,
  resetCredentialsToEnv,
  testSupabaseConnection,
} from '../lib/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
  onOpenSchemaModal: () => void;
}

export const ConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfigUpdated,
  onOpenSchemaModal,
}) => {
  const current = getActiveCredentials();
  const [url, setUrl] = useState(current.url);
  const [anonKey, setAnonKey] = useState(current.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    statusCode?: number;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    // Save temporarily if changed
    saveLocalCredentials(url, anonKey);
    onConfigUpdated();

    const res = await testSupabaseConnection();
    setTestResult({
      tested: true,
      success: res.success,
      message: res.message,
      statusCode: res.statusCode,
    });
    setTesting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalCredentials(url, anonKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onConfigUpdated();
  };

  const handleReset = () => {
    resetCredentialsToEnv();
    const envCreds = getActiveCredentials();
    setUrl(envCreds.url);
    setAnonKey(envCreds.anonKey);
    setTestResult(null);
    onConfigUpdated();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-container">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="modal-title">Supabase Database Settings</h3>
              <p className="modal-subtitle">
                Configure connection credentials to your PostgreSQL database.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          {savedSuccess && (
            <div className="status-pill success-pill">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Credentials saved locally!
            </div>
          )}

          <div className="form-group">
            <label htmlFor="config-url" className="form-label">
              Supabase Project URL <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <Database className="input-icon" />
              <input
                id="config-url"
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="form-input font-mono text-sm"
              />
            </div>
            <small className="field-help-text">
              Located in your Supabase Dashboard under <strong>Project Settings → API</strong>.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="config-anon-key" className="form-label">
              Supabase Anon / Public API Key <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <KeyRound className="input-icon" />
              <input
                id="config-anon-key"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                required
                className="form-input font-mono text-sm"
              />
            </div>
            <small className="field-help-text">
              Public anon client key safe for browser client requests with Row Level Security (RLS).
            </small>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`test-result-box ${
                testResult.success ? 'test-success' : 'test-failure'
              }`}
            >
              <div className="test-result-header">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
                <span className="font-semibold">
                  {testResult.success
                    ? 'Connection Succeeded'
                    : `Connection Failed ${
                        testResult.statusCode ? `(HTTP ${testResult.statusCode})` : ''
                      }`}
                </span>
              </div>
              <p className="test-result-body">{testResult.message}</p>
            </div>
          )}

          {/* Tips and actions */}
          <div className="modal-quick-links">
            <button
              type="button"
              className="quick-link-btn"
              onClick={() => {
                onClose();
                onOpenSchemaModal();
              }}
            >
              <Code className="w-4 h-4 mr-1.5 text-indigo-400" />
              View Database Schema & SQL Setup
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link-btn"
            >
              <ExternalLink className="w-4 h-4 mr-1.5 text-slate-400" />
              Open Supabase Dashboard
            </a>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              title="Reset to .env defaults"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset to .env
            </button>

            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url || !anonKey}
              className="btn-secondary"
            >
              <Activity className={`w-4 h-4 mr-1.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4 mr-1.5" />
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
