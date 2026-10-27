import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  IdCard,
  Mail,
  GraduationCap,
  Phone,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { Student, StudentFormData, FormErrors } from '../types/student';
import { updateStudent, checkStudentIdExists } from '../lib/supabaseClient';

interface Props {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: (updatedStudent: Student) => void;
}

const COURSES = [
  'Computer Science',
  'Software Engineering',
  'Data Science & Analytics',
  'Cybersecurity',
  'Information Technology',
  'Artificial Intelligence',
  'Electrical Engineering',
  'Business Administration',
];

const ACADEMIC_TERMS = [
  'Fall 2026',
  'Spring 2027',
  'Summer 2026',
  'Academic Year 2026-2027',
];

export const EditStudentModal: React.FC<Props> = ({
  student,
  isOpen,
  onClose,
  onStudentUpdated,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: '',
    studentId: '',
    email: '',
    course: '',
    phone: '',
    academicTerm: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.full_name,
        studentId: student.student_id,
        email: student.email,
        course: student.course,
        phone: student.phone || '',
        academicTerm: student.academic_term || 'Fall 2026',
      });
      setErrors({});
      setErrorMessage(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!formData.studentId.trim()) errs.studentId = 'Student ID is required.';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Valid email is required.';
    }
    if (!formData.course) errs.course = 'Please select a course.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    setIsSaving(true);
    try {
      // Check for duplicate Student ID excluding this student
      if (formData.studentId.trim().toLowerCase() !== student.student_id.toLowerCase()) {
        const { exists } = await checkStudentIdExists(formData.studentId, student.id);
        if (exists) {
          setErrors((prev) => ({
            ...prev,
            studentId: `Student ID "${formData.studentId.trim()}" is already in use.`,
          }));
          setIsSaving(false);
          return;
        }
      }

      const { data, error } = await updateStudent(student.id, formData);

      if (error) {
        setErrorMessage(error);
      } else {
        const updated: Student = {
          ...student,
          full_name: formData.fullName.trim(),
          student_id: formData.studentId.trim(),
          email: formData.email.trim(),
          course: formData.course.trim(),
          phone: formData.phone?.trim() || undefined,
          academic_term: formData.academicTerm?.trim() || undefined,
          ...(data || {}),
        };
        onStudentUpdated(updated);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during update.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-container">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="modal-title">Edit Student Profile</h3>
              <p className="modal-subtitle">Update academic registration details.</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close edit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          {errorMessage && (
            <div className="error-alert" role="alert">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="edit-fullName" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <div className={`input-wrapper ${errors.fullName ? 'input-error' : ''}`}>
              <User className="input-icon" />
              <input
                id="edit-fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                required
                className="form-input"
              />
            </div>
            {errors.fullName && <span className="field-error-message">{errors.fullName}</span>}
          </div>

          {/* Student ID */}
          <div className="form-group">
            <label htmlFor="edit-studentId" className="form-label">
              Student ID <span className="required-star">*</span>
            </label>
            <div className={`input-wrapper ${errors.studentId ? 'input-error' : ''}`}>
              <IdCard className="input-icon" />
              <input
                id="edit-studentId"
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData((p) => ({ ...p, studentId: e.target.value }))}
                required
                className="form-input font-mono"
              />
            </div>
            {errors.studentId && <span className="field-error-message">{errors.studentId}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="edit-email" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <div className={`input-wrapper ${errors.email ? 'input-error' : ''}`}>
              <Mail className="input-icon" />
              <input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
                className="form-input"
              />
            </div>
            {errors.email && <span className="field-error-message">{errors.email}</span>}
          </div>

          {/* Course */}
          <div className="form-group">
            <label htmlFor="edit-course" className="form-label">
              Course / Program <span className="required-star">*</span>
            </label>
            <div className={`input-wrapper ${errors.course ? 'input-error' : ''}`}>
              <GraduationCap className="input-icon" />
              <select
                id="edit-course"
                value={formData.course}
                onChange={(e) => setFormData((p) => ({ ...p, course: e.target.value }))}
                required
                className="form-select"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {errors.course && <span className="field-error-message">{errors.course}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="edit-phone" className="form-label">
              Phone Number
            </label>
            <div className="input-wrapper">
              <Phone className="input-icon" />
              <input
                id="edit-phone"
                type="tel"
                placeholder="e.g. +1 (555) 019-2834"
                value={formData.phone || ''}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          {/* Academic Term */}
          <div className="form-group">
            <label htmlFor="edit-term" className="form-label">
              Academic Term
            </label>
            <div className="input-wrapper">
              <Calendar className="input-icon" />
              <select
                id="edit-term"
                value={formData.academicTerm || 'Fall 2026'}
                onChange={(e) => setFormData((p) => ({ ...p, academicTerm: e.target.value }))}
                className="form-select"
              >
                {ACADEMIC_TERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary" id="btn-save-student-edit">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
