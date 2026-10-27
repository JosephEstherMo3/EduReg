import React, { useState } from 'react';
import {
  User,
  IdCard,
  Mail,
  GraduationCap,
  Phone,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Wand2,
  Printer,
  ChevronDown,
} from 'lucide-react';
import type { Student, StudentFormData, FormErrors } from '../types/student';
import {
  registerStudent,
  checkStudentIdExists,
  checkEmailExists,
  checkPhoneExists,
  getActiveCredentials,
} from '../lib/supabaseClient';
import { RegistrationSlipModal } from './RegistrationSlipModal';

interface Props {
  onRegistrationSuccess: (student: Student) => void;
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

export const StudentRegistrationForm: React.FC<Props> = ({
  onRegistrationSuccess,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: '',
    studentId: '',
    email: '',
    course: '',
    phone: '',
    academicTerm: 'Academic Year 2026-2027',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successStudent, setSuccessStudent] = useState<Student | null>(null);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);

  const { isConfigured } = getActiveCredentials();

  // Validate a single field
  const validateField = (field: keyof StudentFormData, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
        if (!/^[a-zA-Z\s'.-]+$/.test(value.trim())) {
          return 'Full name should only contain letters, spaces, hyphens, or apostrophes.';
        }
        return undefined;

      case 'studentId':
        if (!value.trim()) return 'Student ID is required.';
        if (value.trim().length < 3) return 'Student ID must be at least 3 characters.';
        if (!/^[A-Za-z0-9_-]+$/.test(value.trim())) {
          return 'Student ID can only contain letters, numbers, hyphens, and underscores.';
        }
        return undefined;

      case 'email':
        if (!value.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address (e.g. student@university.edu).';
        }
        return undefined;

      case 'course':
        if (!value.trim()) return 'Please select or enter a course of study.';
        return undefined;

      case 'phone':
        if (value.trim() && !/^[+0-9\s()-]{7,20}$/.test(value.trim())) {
          return 'Please enter a valid phone number.';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof StudentFormData>).forEach((key) => {
      const error = validateField(key, formData[key] || '');
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = async (field: keyof StudentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field] || '');
    setErrors((prev) => ({ ...prev, [field]: error }));

    // Check for duplicate Student ID if format is valid and configured
    if (field === 'studentId' && !error && formData.studentId.trim() && isConfigured) {
      setIsCheckingDuplicate(true);
      const { exists } = await checkStudentIdExists(formData.studentId);
      setIsCheckingDuplicate(false);

      if (exists) {
        setErrors((prev) => ({
          ...prev,
          studentId: `Student ID "${formData.studentId.trim()}" is already registered in the system.`,
        }));
      }
    }

    // Check for duplicate email on blur
    if (field === 'email' && !error && formData.email.trim() && isConfigured) {
      const { exists } = await checkEmailExists(formData.email);
      if (exists) {
        setErrors((prev) => ({
          ...prev,
          email: `This email address is already registered. Please use a different email.`,
        }));
      }
    }

    // Check for duplicate phone on blur (if provided)
    if (field === 'phone' && !error && formData.phone?.trim() && isConfigured) {
      const { exists } = await checkPhoneExists(formData.phone);
      if (exists) {
        setErrors((prev) => ({
          ...prev,
          phone: `This phone number is already registered. Please use a different number.`,
        }));
      }
    }
  };

  // Auto-generate student ID helper
  const handleGenerateStudentId = () => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generated = `STU-${year}-${randomDigits}`;
    setFormData((prev) => ({ ...prev, studentId: generated }));
    setTouched((prev) => ({ ...prev, studentId: true }));
    setErrors((prev) => ({ ...prev, studentId: undefined }));

    if (isConfigured) {
      setIsCheckingDuplicate(true);
      checkStudentIdExists(generated).then(({ exists }) => {
        setIsCheckingDuplicate(false);
        if (exists) {
          handleGenerateStudentId();
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    setTouched({
      fullName: true,
      studentId: true,
      email: true,
      course: true,
      phone: true,
      academicTerm: true,
    });

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Pre-flight checks for duplicates
      const { exists: idExists } = await checkStudentIdExists(formData.studentId);
      if (idExists) {
        setErrors((prev) => ({
          ...prev,
          studentId: `Student ID "${formData.studentId.trim()}" is already registered in the system.`,
        }));
        setSubmitError(`Student ID "${formData.studentId.trim()}" already exists. Please use a different ID.`);
        setIsSubmitting(false);
        return;
      }

      const { exists: emailExists } = await checkEmailExists(formData.email);
      if (emailExists) {
        setErrors((prev) => ({
          ...prev,
          email: `This email address is already registered in the system.`,
        }));
        setSubmitError(`Email "${formData.email.trim()}" is already registered. Each student must use a unique email address.`);
        setIsSubmitting(false);
        return;
      }

      if (formData.phone?.trim()) {
        const { exists: phoneExists } = await checkPhoneExists(formData.phone);
        if (phoneExists) {
          setErrors((prev) => ({
            ...prev,
            phone: `This phone number is already registered in the system.`,
          }));
          setSubmitError(`Phone number "${formData.phone.trim()}" is already registered. Please use a different phone number.`);
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Submit record
      const result = await registerStudent(formData);

      if (result.error) {
        setSubmitError(result.error);
      } else if (result.data) {
        setSuccessStudent(result.data);
        onRegistrationSuccess(result.data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      studentId: '',
      email: '',
      course: '',
      phone: '',
      academicTerm: 'Academic Year 2026-2027',
    });
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setSuccessStudent(null);
  };

  return (
    <div className="registration-card">
      {/* Registration Page Header Panel (Section 19) */}
      <div className="registration-page-header">
        <div className="reg-header-icon-badge" aria-hidden="true">
          <GraduationCap className="reg-header-icon" />
        </div>
        <div className="reg-header-titles">
          <h2 className="registration-title">Student Registration</h2>
          <p className="registration-subtitle">
            Please fill in the student details below to complete enrollment.
          </p>
        </div>
      </div>

      {/* Success Notification State */}
      {successStudent ? (
        <div className="success-banner" role="status" aria-live="polite">
          <div className="success-icon-wrapper">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="success-content">
            <h3 className="success-title">Registration Successful!</h3>
            <p className="success-message">
              The student record has been securely verified and saved in the official repository.
            </p>
            <div className="registered-details-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{successStudent.full_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Student ID:</span>
                <span className="detail-value font-mono text-indigo-300">{successStudent.student_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address:</span>
                <span className="detail-value">{successStudent.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Course:</span>
                <span className="detail-value">{successStudent.course}</span>
              </div>
              {successStudent.phone && (
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{successStudent.phone}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Academic Term:</span>
                <span className="detail-value">
                  {successStudent.academic_term || 'Academic Year 2026-2027'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Reference ID:</span>
                <span className="detail-value text-xs font-mono text-slate-400">
                  {successStudent.id}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Registered At:</span>
                <span className="detail-value text-xs text-slate-400">
                  {new Date(successStudent.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="success-actions-row">
              <button
                type="button"
                id="btn-print-from-success"
                onClick={() => setShowSlipModal(true)}
                className="btn-primary"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Admission Slip & QR Code
              </button>

              <button
                type="button"
                id="btn-register-another"
                onClick={handleResetForm}
                className="btn-secondary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Register Another Student
              </button>
            </div>
          </div>

          {/* Printable Slip Modal */}
          <RegistrationSlipModal
            student={successStudent}
            isOpen={showSlipModal}
            onClose={() => setShowSlipModal(false)}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="registration-form" id="student-reg-form">
          {/* Global error alert */}
          {submitError && (
            <div className="error-alert" role="alert">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <div className="error-alert-content">
                <strong>Registration Alert:</strong> {submitError}
              </div>
            </div>
          )}

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <div className={`input-wrapper ${errors.fullName && touched.fullName ? 'input-error' : ''}`}>
              <User className="input-icon" aria-hidden="true" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                disabled={isSubmitting}
                className="form-input"
                aria-required="true"
                aria-invalid={!!(errors.fullName && touched.fullName)}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
            </div>
            {errors.fullName && touched.fullName && (
              <span id="fullName-error" className="field-error-message">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Student ID with Auto-Generate Action */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="studentId" className="form-label">
                Student ID <span className="required-star">*</span>
              </label>
              <div className="id-label-actions">
                <button
                  type="button"
                  onClick={handleGenerateStudentId}
                  disabled={isSubmitting}
                  className="btn-text-link id-gen-btn"
                  title="Generate a unique student ID automatically"
                  aria-label="Auto-generate student ID"
                >
                  <Wand2 className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  Auto-Generate ID
                </button>
                {isCheckingDuplicate && (
                  <span className="checking-indicator">
                    <Loader2 className="w-3 h-3 animate-spin mr-1" /> Checking...
                  </span>
                )}
              </div>
            </div>
            <div className={`input-wrapper ${errors.studentId && touched.studentId ? 'input-error' : ''}`}>
              <IdCard className="input-icon" aria-hidden="true" />
              <input
                id="studentId"
                name="studentId"
                type="text"
                placeholder="e.g. STU-2026-4821"
                value={formData.studentId}
                onChange={(e) => handleChange('studentId', e.target.value)}
                onBlur={() => handleBlur('studentId')}
                disabled={isSubmitting}
                className="form-input font-mono"
                aria-required="true"
                aria-invalid={!!(errors.studentId && touched.studentId)}
                aria-describedby={errors.studentId ? 'studentId-error' : undefined}
              />
            </div>
            {errors.studentId && touched.studentId && (
              <span id="studentId-error" className="field-error-message">
                {errors.studentId}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <div className={`input-wrapper ${errors.email && touched.email ? 'input-error' : ''}`}>
              <Mail className="input-icon" aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                disabled={isSubmitting}
                className="form-input"
                aria-required="true"
                aria-invalid={!!(errors.email && touched.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && touched.email && (
              <span id="email-error" className="field-error-message">
                {errors.email}
              </span>
            )}
          </div>

          {/* Course / Program Selection */}
          <div className="form-group">
            <label htmlFor="course" className="form-label">
              Course / Program <span className="required-star">*</span>
            </label>
            <div className={`input-wrapper select-wrapper-styled ${errors.course && touched.course ? 'input-error' : ''}`}>
              <GraduationCap className="input-icon" aria-hidden="true" />
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={(e) => handleChange('course', e.target.value)}
                onBlur={() => handleBlur('course')}
                disabled={isSubmitting}
                className="form-input form-select"
                aria-required="true"
                aria-invalid={!!(errors.course && touched.course)}
                aria-describedby={errors.course ? 'course-error' : undefined}
              >
                <option value="">Select an accredited degree program...</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-dropdown-chevron" aria-hidden="true" />
            </div>
            {errors.course && touched.course && (
              <span id="course-error" className="field-error-message">
                {errors.course}
              </span>
            )}
          </div>

          {/* Phone Number + Academic Term (Side-by-side on desktop, stacked on mobile) */}
          <div className="form-row-two">
            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="optional-tag">(Optional)</span>
              </label>
              <div className={`input-wrapper ${errors.phone && touched.phone ? 'input-error' : ''}`}>
                <Phone className="input-icon" aria-hidden="true" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  disabled={isSubmitting}
                  className="form-input"
                  aria-invalid={!!(errors.phone && touched.phone)}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
              </div>
              {errors.phone && touched.phone && (
                <span id="phone-error" className="field-error-message">
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Academic Term */}
            <div className="form-group">
              <label htmlFor="academicTerm" className="form-label">
                Academic Term <span className="required-star">*</span>
              </label>
              <div className="input-wrapper select-wrapper-styled">
                <Calendar className="input-icon" aria-hidden="true" />
                <select
                  id="academicTerm"
                  name="academicTerm"
                  value={formData.academicTerm}
                  onChange={(e) => handleChange('academicTerm', e.target.value)}
                  disabled={isSubmitting}
                  className="form-input form-select"
                  aria-required="true"
                >
                  {ACADEMIC_TERMS.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-dropdown-chevron" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Primary Action Button (Section 24) */}
          <button
            type="submit"
            disabled={isSubmitting || isCheckingDuplicate}
            className="btn-primary w-full submit-btn-large"
            id="btn-complete-registration"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing Enrollment...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Complete Registration
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
