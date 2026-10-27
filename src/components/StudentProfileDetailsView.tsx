import React, { useState } from 'react';
import {
  ArrowLeft,
  Printer,
  Download,
  Edit2,
  User,
  IdCard,
  Calendar,
  GraduationCap,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  ShieldCheck,
  Zap,
  QrCode,
  Check,
} from 'lucide-react';
import type { Student } from '../types/student';
import { generateQRCodeSVG } from '../utils/qrCode';
import { EditStudentModal } from './EditStudentModal';
import { RegistrationSlipModal } from './RegistrationSlipModal';

interface Props {
  student: Student;
  onBack: () => void;
  onStudentUpdated: (updated: Student) => void;
}

export const StudentProfileDetailsView: React.FC<Props> = ({
  student,
  onBack,
  onStudentUpdated,
}) => {
  const [currentStudent, setCurrentStudent] = useState<Student>(student);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  const qrPayload = JSON.stringify({
    id: currentStudent.student_id,
    name: currentStudent.full_name,
    course: currentStudent.course,
    term: currentStudent.academic_term || 'Academic Year 2026 - 2027',
    verified: true,
  });

  const qrSvg = generateQRCodeSVG(qrPayload, 150);

  const handlePrint = () => {
    setIsSlipModalOpen(true);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleUpdate = (updated: Student) => {
    setCurrentStudent(updated);
    onStudentUpdated(updated);
  };

  return (
    <div className="student-profile-page-container">
      {/* Top Header Controls (Back button on left, Action buttons on right) */}
      <div className="profile-top-controls-bar">
        <button
          type="button"
          onClick={onBack}
          className="back-to-directory-btn"
          aria-label="Back to Students Directory"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Students Directory</span>
        </button>

        <div className="profile-top-actions">
          <button
            type="button"
            onClick={handlePrint}
            className="profile-action-btn profile-btn-outline"
            title="Print Official Record Slip"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Print Record</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="profile-action-btn profile-btn-outline"
            title="Export Profile as PDF"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="profile-action-btn profile-btn-outline"
            title="Edit Student Information"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Edit Record</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Banner (Matching Exact Screenshot) */}
      <div className="profile-hero-banner">
        <div className="profile-hero-left">
          <div className="profile-large-avatar-circle" aria-hidden="true">
            <User className="w-9 h-9 text-white" />
          </div>

          <div className="profile-hero-identity">
            <h1 className="profile-hero-name">{currentStudent.full_name}</h1>
            <div className="profile-hero-sub-row">
              <span className="profile-hero-id font-mono">{currentStudent.student_id}</span>
              <span className="profile-hero-registered-tag">
                <span className="registered-dot" />
                <span>Registered Student</span>
              </span>
            </div>
          </div>
        </div>

        <div className="profile-hero-right">
          <div className="status-pill-active">
            <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>Active</span>
          </div>
          <span className="profile-hero-term-label">
            {currentStudent.academic_term || 'Academic Year 2026 – 2027'}
          </span>
        </div>
      </div>

      {/* Two Column Layout (Left: Personal Details & QR, Right: 3 Stacked Cards) */}
      <div className="profile-details-grid-two">
        {/* ======================================================================
            Left Card: Personal & Matriculation Details with Integrated QR Code
            ====================================================================== */}
        <div className="profile-card profile-main-info-card">
          <div className="profile-info-inner-split">
            {/* Left Column: QR Code Box */}
            <div className="profile-qr-box-col">
              <div className="profile-qr-white-card">
                <div
                  className="profile-qr-svg-holder"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </div>
              <div className="profile-qr-scan-badge">
                <QrCode className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Scan QR Code</span>
              </div>
            </div>

            {/* Right Column: 8 Structured Field Rows */}
            <div className="profile-fields-list-col">
              {/* 1. Full Name */}
              <div className="profile-field-row">
                <div className="field-icon-wrap">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="field-data-wrap">
                  <span className="field-label-text">Full Name</span>
                  <span className="field-value-text font-semibold text-white">
                    {currentStudent.full_name}
                  </span>
                </div>
              </div>

              {/* 2. Student ID */}
              <div className="profile-field-row">
                <div className="field-icon-wrap">
                  <IdCard className="w-4 h-4 text-slate-400" />
                </div>
                <div className="field-data-wrap">
                  <span className="field-label-text">Student ID</span>
                  <span className="student-id-dark-pill font-mono">
                    {currentStudent.student_id}
                  </span>
                </div>
              </div>

              {/* 3. Academic Term */}
              <div className="profile-field-row">
                <div className="field-icon-wrap">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <div className="field-data-wrap">
                  <span className="field-label-text">Academic Term</span>
                  <span className="field-value-text">
                    {currentStudent.academic_term || 'Academic Year 2026–2027'}
                  </span>
                </div>
              </div>

              {/* 4. Program / Course */}
              <div className="profile-field-row">
                <div className="field-icon-wrap">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                </div>
                <div className="field-data-wrap">
                  <span className="field-label-text">Program / Course</span>
                  <span className="course-purple-pill">
                    {currentStudent.course}
                  </span>
                </div>
              </div>

              {/* 5. Registered Email */}
              <div className="profile-field-row">
                <div className="field-icon-wrap">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div className="field-data-wrap">
                  <span className="field-label-text">Registered Email</span>
                  <a
                    href={`mailto:${currentStudent.email}`}
                    className="field-value-text text-slate-200 hover:text-indigo-300"
                  >
                    {currentStudent.email}
                  </a>
                </div>
              </div>

              {/* 6. Phone Number */}
              <div className="profile-field-row">
                <div className="field-icon-wrap">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div className="field-data-wrap">
                  <span className="field-label-text">Phone Number</span>
                  <span className="field-value-text">
                    {currentStudent.phone || 'No phone recorded'}
                  </span>
                </div>
              </div>

              {/* 7. Registration Timestamp */}
              <div className="profile-field-row">
                <div className="field-icon-wrap">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="field-data-wrap">
                  <span className="field-label-text">Registration Timestamp</span>
                  <span className="field-value-text">
                    {new Date(currentStudent.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* 8. Reference ID */}
              <div className="profile-field-row">
                <div className="field-icon-wrap">
                  <IdCard className="w-4 h-4 text-slate-400" />
                </div>
                <div className="field-data-wrap">
                  <span className="field-label-text">Reference ID</span>
                  <span className="field-value-text font-mono text-slate-300 text-xs">
                    {currentStudent.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================
            Right Column: 3 Stacked Cards
            ====================================================================== */}
        <div className="profile-side-cards-col">
          {/* Card 1: Academic Information */}
          <div className="profile-card profile-academic-card">
            <div className="profile-card-header">
              <div className="card-header-icon-circle bg-circle-purple">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <h3 className="profile-card-title">Academic Information</h3>
            </div>

            <div className="academic-subcards-row">
              {/* Course / Program Box */}
              <div className="academic-subbox">
                <div className="subbox-icon-square">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="subbox-text-wrap">
                  <span className="subbox-label">Course / Program</span>
                  <span className="subbox-value font-semibold">{currentStudent.course}</span>
                </div>
              </div>

              {/* Academic Year Box */}
              <div className="academic-subbox">
                <div className="subbox-icon-square">
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div className="subbox-text-wrap">
                  <span className="subbox-label">Academic Year</span>
                  <span className="subbox-value font-semibold">
                    {currentStudent.academic_term
                      ? currentStudent.academic_term.replace(/Academic Year /i, '').trim()
                      : '2026 – 2027'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Registration Status */}
          <div className="profile-card profile-status-card">
            <div className="profile-card-header">
              <div className="card-header-icon-circle bg-circle-blue">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <h3 className="profile-card-title">Registration Status</h3>
            </div>

            <div className="registration-status-green-box">
              <div className="status-green-icon-wrap">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="status-green-text-col">
                <h4 className="status-green-heading">Active Registration</h4>
                <p className="status-green-desc">
                  Student is currently enrolled and active in the system.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="profile-card profile-actions-card">
            <div className="profile-card-header">
              <div className="card-header-icon-circle bg-circle-purple">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="profile-card-title">Quick Actions</h3>
            </div>

            <div className="quick-actions-btns-row">
              <button
                type="button"
                onClick={handlePrint}
                className="quick-action-pill-btn quick-action-btn-outline"
                title="Print Admission Slip"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                <span>Print Record</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="quick-action-pill-btn quick-action-btn-outline"
                title="Export as PDF"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>Export PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="quick-action-pill-btn quick-action-btn-purple"
                title="Edit Student Record"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Edit Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        student={currentStudent}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onStudentUpdated={handleUpdate}
      />

      {/* Registration Slip Modal (for Printing) */}
      <RegistrationSlipModal
        student={currentStudent}
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
      />
    </div>
  );
};
