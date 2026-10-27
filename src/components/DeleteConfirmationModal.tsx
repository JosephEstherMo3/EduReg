import React, { useState } from 'react';
import { Trash2, AlertOctagon, Loader2, X, AlertTriangle } from 'lucide-react';
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
        setErrorMessage(error || 'Failed to remove student record. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error removing student record.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div
        className="modal-card delete-confirmation-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="delete-modal-header">
          <div className="delete-header-text">
            <h2 id="delete-dialog-title" className="delete-page-heading">
              Delete Student Record
            </h2>
            <p id="delete-dialog-desc" className="delete-page-subtext">
              This action will permanently remove the student&apos;s record from the system. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close deletion dialog"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="delete-modal-body-content">
          {/* Destructive Icon & Question */}
          <div className="delete-hero-section">
            <div className="delete-icon-circle" aria-hidden="true">
              <Trash2 className="delete-hero-icon" />
            </div>
            <h3 className="delete-question">
              Are you sure you want to <span className="highlight-delete">delete</span> this student?
            </h3>
            <div className="delete-highlight-student">
              <span className="student-name-bold">{student.full_name}</span>
              <span className="student-id-code font-mono">{student.student_id}</span>
            </div>
          </div>

          {/* Student Information Summary */}
          <div className="student-info-summary-box">
            <div className="info-summary-row">
              <span className="summary-field-label">Name</span>
              <span className="summary-field-value font-medium">{student.full_name}</span>
            </div>
            <div className="info-summary-row">
              <span className="summary-field-label">Student ID</span>
              <span className="summary-field-value font-mono text-indigo-400">{student.student_id}</span>
            </div>
            <div className="info-summary-row">
              <span className="summary-field-label">Course / Term</span>
              <div className="summary-course-stack">
                <span className="summary-course-name">{student.course}</span>
                <span className="summary-term-tag">
                  {student.academic_term || 'Academic Year 2026–2027'}
                </span>
              </div>
            </div>
            {student.email && (
              <div className="info-summary-row">
                <span className="summary-field-label">Email Address</span>
                <span className="summary-field-value text-slate-300">{student.email}</span>
              </div>
            )}
          </div>

          {/* Visible Deletion Warning Box */}
          <div className="deletion-warning-box" role="alert">
            <div className="warning-icon-wrapper">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div className="warning-content">
              <strong className="warning-title">Warning</strong>
              <p className="warning-message">
                This action will permanently delete all associated data including course records, registrations, and academic history.
              </p>
            </div>
          </div>

          {/* Dynamic Error Message */}
          {errorMessage && (
            <div className="error-alert mt-3" role="alert">
              <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="delete-modal-actions-bar">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn-secondary delete-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-danger-primary delete-confirm-btn"
            id="btn-confirm-delete"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deleting Record...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
