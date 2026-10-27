import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  IdCard,
  GraduationCap,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  Edit2,
  Trash2,
  Printer,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import type { Student } from '../types/student';
import { fetchAllStudents, getActiveCredentials } from '../lib/supabaseClient';
import { RegistrationSlipModal } from './RegistrationSlipModal';
import { EditStudentModal } from './EditStudentModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface Props {
  refreshKey: number;
  onRegisterClick: () => void;
  externalSearch?: string;
}

const ADMIN_PASSCODE = 'admin123';
const SESSION_UNLOCK_KEY = 'student_directory_admin_unlocked';
const PAGE_SIZE = 8;

export const StudentDirectory: React.FC<Props> = ({
  refreshKey,
  onRegisterClick,
  externalSearch = '',
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(externalSearch);
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync external search from header if provided
  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== searchQuery) {
      setSearchQuery(externalSearch);
      setCurrentPage(1);
    }
  }, [externalSearch]);

  // Admin Lock State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_UNLOCK_KEY) === 'true';
  });
  const [passcodeAttempt, setPasscodeAttempt] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<boolean>(false);

  // Modals
  const [slipStudent, setSlipStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<Student | null>(null);

  const { isConfigured } = getActiveCredentials();

  const loadStudents = useCallback(async () => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { students: data, error: fetchErr } = await fetchAllStudents(200);

    if (fetchErr) {
      setError(fetchErr);
    } else {
      setStudents(data);
    }
    setLoading(false);
  }, [isConfigured]);

  useEffect(() => {
    let ignore = false;
    async function sync() {
      if (!isConfigured) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const { students: data, error: fetchErr } = await fetchAllStudents(200);

      if (!ignore) {
        if (fetchErr) {
          setError(fetchErr);
        } else {
          setStudents(data);
        }
        setLoading(false);
      }
    }

    if (isUnlocked) {
      sync();
    }

    return () => {
      ignore = true;
    };
  }, [refreshKey, isConfigured, isUnlocked]);

  // Derived filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        s.full_name.toLowerCase().includes(query) ||
        s.student_id.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        (s.phone && s.phone.includes(query));

      const matchesCourse =
        selectedCourse === 'ALL' || s.course.toLowerCase() === selectedCourse.toLowerCase();

      return matchesSearch && matchesCourse;
    });
  }, [students, searchQuery, selectedCourse]);

  // Unique courses for filter
  const uniqueCourses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.course) set.add(s.course);
    });
    return Array.from(set).sort();
  }, [students]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  const startIdx = filteredStudents.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, filteredStudents.length);

  // Passcode verification
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeAttempt.trim() === ADMIN_PASSCODE) {
      setIsUnlocked(true);
      setPasscodeError(false);
      sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true');
      loadStudents();
    } else {
      setPasscodeError(true);
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    setPasscodeAttempt('');
    setPasscodeError(false);
  };

  // Toast feedback helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student update / delete callbacks
  const handleStudentUpdated = (updated: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
    triggerToast(`Record for ${updated.full_name} successfully updated.`);
  };

  const handleStudentDeleted = (deletedId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== deletedId));
    triggerToast('Student record permanently deleted.');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = ['ID', 'Full Name', 'Student ID', 'Email', 'Phone', 'Course', 'Academic Term', 'Registered At'];
    const rows = filteredStudents.map((s) => [
      `"${s.id}"`,
      `"${s.full_name.replace(/"/g, '""')}"`,
      `"${s.student_id}"`,
      `"${s.email}"`,
      `"${s.phone || ''}"`,
      `"${s.course.replace(/"/g, '""')}"`,
      `"${s.academic_term || 'Fall 2026'}"`,
      `"${s.created_at}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eduregister_students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If locked, render the Admin Passcode Gate (Option D)
  if (!isUnlocked) {
    return (
      <div className="directory-lock-wrapper">
        <div className="lock-card">
          <div className="lock-icon-container">
            <Lock className="w-9 h-9 text-indigo-400" />
          </div>
          <h2 className="lock-title">Registrar Protected Directory</h2>
          <p className="lock-subtitle">
            Student directory records and contact details are restricted to authorized admissions staff.
          </p>

          <form onSubmit={handleUnlock} className="lock-form">
            <div className={`input-wrapper ${passcodeError ? 'input-error' : ''}`}>
              <KeyRound className="input-icon" />
              <input
                type="password"
                placeholder="Enter admissions passcode..."
                value={passcodeAttempt}
                onChange={(e) => {
                  setPasscodeAttempt(e.target.value);
                  setPasscodeError(false);
                }}
                required
                className="form-input"
                id="input-admin-passcode"
                autoFocus
                aria-label="Admin passcode"
              />
            </div>

            {passcodeError && (
              <span className="field-error-message text-center">
                Incorrect passcode. Please check and try again.
              </span>
            )}

            <button type="submit" className="btn-primary w-full" id="btn-unlock-directory">
              <Unlock className="w-4 h-4 mr-2" />
              Unlock Directory
            </button>
          </form>

          <div className="lock-footer-hint">
            <ShieldCheck className="w-4 h-4 mr-1 text-slate-500 inline" />
            <span>Default passcode: <code>admin123</code></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="directory-container">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="feedback-toast" role="status" aria-live="polite">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen 1 Header */}
      <div className="directory-header">
        <div className="directory-title-block">
          <h1 className="section-title">
            Registered Students Directory
          </h1>
          <p className="section-subtitle">
            Browse, search, edit, and print official records for registered students.
          </p>
        </div>

        <div className="directory-actions">
          <button
            type="button"
            id="btn-refresh-students"
            onClick={loadStudents}
            disabled={loading || !isConfigured}
            className="btn-secondary"
            title="Refresh student records"
            aria-label="Refresh student list"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            id="btn-export-csv"
            onClick={handleExportCSV}
            disabled={filteredStudents.length === 0}
            className="btn-secondary"
            title="Download CSV of current list"
            aria-label="Export students to CSV"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </button>

          <button
            type="button"
            id="btn-new-student-from-dir"
            onClick={onRegisterClick}
            className="btn-primary"
            title="Register a new student"
            aria-label="New student registration"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            New Student
          </button>

          <button
            type="button"
            onClick={handleLock}
            className="btn-secondary lock-btn"
            title="Lock Directory for privacy"
            aria-label="Lock student directory"
          >
            <Lock className="w-4 h-4 mr-1.5 text-slate-400" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Directory Statistics (3 Professional Cards) */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header-row">
            <span className="metric-label">Total Registered</span>
            <div className="metric-icon-wrap" aria-hidden="true">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <span className="metric-value">{students.length}</span>
          <span className="metric-sub">Active Records</span>
        </div>

        <div className="metric-card">
          <div className="metric-header-row">
            <span className="metric-label">Active Programs</span>
            <div className="metric-icon-wrap" aria-hidden="true">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="metric-value">{uniqueCourses.length}</span>
          <span className="metric-sub">Unique study fields</span>
        </div>

        <div className="metric-card">
          <div className="metric-header-row">
            <span className="metric-label">Filtered Results</span>
            <div className="metric-icon-wrap" aria-hidden="true">
              <Filter className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="metric-value">{filteredStudents.length}</span>
          <span className="metric-sub">Matching search criteria</span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" aria-hidden="true" />
          <input
            type="text"
            id="search-students"
            placeholder="Search by name, student ID, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search student records"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
              aria-label="Clear search query"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-select-wrapper">
          <Filter className="filter-icon" aria-hidden="true" />
          <select
            id="filter-course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="filter-select"
            aria-label="Filter students by course"
          >
            <option value="ALL">All Courses ({students.length})</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fetch Error Banner */}
      {error && (
        <div className="error-alert" role="alert">
          <div>
            <strong>Failed to fetch student records:</strong> {error}
          </div>
          <button
            type="button"
            onClick={loadStudents}
            className="btn-text-link"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Student Table */}
      <div className="table-responsive-wrapper">
        {loading ? (
          <div className="table-loading-state">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
            <p>Loading registered student records...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Users className="w-10 h-10 text-slate-500" />
            </div>
            <h3>No student records found</h3>
            <p>
              {students.length === 0
                ? "No students have been registered yet. Click below to add the first student!"
                : "No student records match the active search query and course filters."}
            </p>
            {students.length === 0 ? (
              <button
                type="button"
                id="btn-empty-register"
                onClick={onRegisterClick}
                className="btn-primary mt-4"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Register First Student
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCourse('ALL');
                }}
                className="btn-secondary mt-4"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <table className="student-table" id="students-data-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Student ID</th>
                <th scope="col">Contact</th>
                <th scope="col">Course / Term</th>
                <th scope="col">Registered</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="student-row">
                  {/* Student identity cell */}
                  <td>
                    <div className="student-cell-identity">
                      <div className="student-avatar" aria-hidden="true">
                        {student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="student-names-col">
                        <div className="student-name font-semibold">{student.full_name}</div>
                        <div className="student-uuid" title={student.id}>
                          Ref: {student.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Student ID pill */}
                  <td>
                    <span className="student-id-badge font-mono">
                      <IdCard className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                      {student.student_id}
                    </span>
                  </td>

                  {/* Contact cell */}
                  <td>
                    <div className="contact-cell-stack">
                      <span className="student-email-link">
                        <Mail className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
                        <a href={`mailto:${student.email}`} title={`Email ${student.email}`}>
                          {student.email}
                        </a>
                      </span>
                      {student.phone ? (
                        <span className="student-phone-cell">
                          <Phone className="w-3 h-3 mr-1 text-slate-500 flex-shrink-0" />
                          <span>{student.phone}</span>
                        </span>
                      ) : (
                        <span className="student-phone-cell text-muted">
                          <Phone className="w-3 h-3 mr-1 text-slate-600 flex-shrink-0" />
                          <span>No phone recorded</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Course / Term cell */}
                  <td>
                    <div className="course-term-stack">
                      <span className="course-badge">
                        <GraduationCap className="w-3.5 h-3.5 mr-1 text-indigo-300" />
                        <span>{student.course}</span>
                      </span>
                      <span className="term-sub-badge">
                        {student.academic_term || 'Fall 2026'}
                      </span>
                    </div>
                  </td>

                  {/* Registered Date cell */}
                  <td>
                    <span className="date-cell">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>
                        {new Date(student.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </td>

                  {/* Actions cell */}
                  <td>
                    <div className="row-actions-group">
                      <button
                        type="button"
                        onClick={() => setSlipStudent(student)}
                        className="action-icon-btn slip-btn"
                        title="View & Print Official Registration Slip"
                        aria-label={`Print slip for ${student.full_name}`}
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditStudent(student)}
                        className="action-icon-btn edit-btn"
                        title="Edit Student Record"
                        aria-label={`Edit ${student.full_name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetStudent(student)}
                        className="action-icon-btn delete-btn"
                        title="Delete Student Record"
                        aria-label={`Delete ${student.full_name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="directory-footer-pagination">
        <div className="pagination-info">
          Showing <span className="font-medium text-slate-200">{startIdx}</span>–
          <span className="font-medium text-slate-200">{endIdx}</span> of{' '}
          <span className="font-medium text-slate-200">{filteredStudents.length}</span> students
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`page-num-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <RegistrationSlipModal
        student={slipStudent}
        isOpen={Boolean(slipStudent)}
        onClose={() => setSlipStudent(null)}
      />

      <EditStudentModal
        student={editStudent}
        isOpen={Boolean(editStudent)}
        onClose={() => setEditStudent(null)}
        onStudentUpdated={handleStudentUpdated}
      />

      <DeleteConfirmationModal
        student={deleteTargetStudent}
        isOpen={Boolean(deleteTargetStudent)}
        onClose={() => setDeleteTargetStudent(null)}
        onStudentDeleted={handleStudentDeleted}
      />
    </div>
  );
};
