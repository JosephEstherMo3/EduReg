import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import type { Student } from '../types/student';
import { deleteStudent } from '../lib/supabaseClient';

interface Props {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onStudentDeleted: (studentId: string) => void;
}

export const DeleteConfirmationModal: React.FC<Props> = ({
  student,
  isOpen,
  onClose,
  onStudentDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const { success, error } = await deleteStudent(student.id, student.student_id);
      if (success) {
        onStudentDeleted(student.id);
        onClose();
      } else {
        setErrorMessage(error || 'Failed to remove record.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error removing student.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card delete-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-body">
          <div className="delete-icon-wrapper">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>

          <h3 className="delete-title">Delete Student Record?</h3>
          <p className="delete-subtitle">
            Are you sure you want to remove <strong>{student.full_name}</strong> (
            <span className="font-mono text-indigo-300">{student.student_id}</span>)? This action
            cannot be undone.
          </p>

          {errorMessage && (
            <div className="error-alert mt-3" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="delete-actions-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-danger"
              id="btn-confirm-delete"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Confirm Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
