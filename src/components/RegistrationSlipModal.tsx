import React from 'react';
import {
  X,
  Printer,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  IdCard,
  ShieldCheck,
} from 'lucide-react';
import type { Student } from '../types/student';
import { generateQRCodeSVG } from '../utils/qrCode';

interface Props {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationSlipModal: React.FC<Props> = ({ student, isOpen, onClose }) => {
  if (!isOpen || !student) return null;

  const qrPayload = JSON.stringify({
    id: student.student_id,
    name: student.full_name,
    course: student.course,
    term: student.academic_term || '2026 Academic Year',
    verified: true,
  });

  const qrSvg = generateQRCodeSVG(qrPayload, 140);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop slip-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card slip-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Controls Header (hidden in print) */}
        <div className="slip-modal-toolbar no-print">
          <div className="toolbar-title">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span>Official Student Registration Slip</span>
          </div>
          <div className="toolbar-buttons">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary slip-print-btn"
              id="btn-print-slip"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save PDF
            </button>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close registration slip"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate / Slip Card */}
        <div className="printable-slip" id="printable-student-slip">
          {/* Slip Header */}
          <div className="slip-header">
            <div className="slip-institution-seal">
              <GraduationCap className="w-10 h-10 text-slate-800" />
            </div>
            <div className="slip-institution-info">
              <h1 className="slip-university-title">EduRegister University</h1>
              <p className="slip-sub-dept">Office of Academic Admissions & Student Records</p>
              <p className="slip-document-title">Official Student Admission Slip & Verification</p>
            </div>
            <div className="slip-verified-badge">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 inline mr-1" />
              <span>OFFICIALLY VERIFIED</span>
            </div>
          </div>

          <div className="slip-divider"></div>

          {/* Slip Main Body */}
          <div className="slip-body">
            {/* Student Photo Box & QR */}
            <div className="slip-media-col">
              <div className="slip-student-avatar">
                <span className="slip-avatar-initials">
                  {student.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
                <span className="slip-avatar-label">Verified Photo</span>
              </div>

              {/* QR Code */}
              <div className="slip-qr-box">
                <div
                  className="slip-qr-image"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                  aria-label="Student Verification QR Code"
                />
                <span className="slip-qr-caption">Scan to Verify Record</span>
              </div>
            </div>

            {/* Student Data Fields */}
            <div className="slip-info-col">
              <div className="slip-field-group primary-highlight">
                <span className="slip-label">STUDENT FULL NAME</span>
                <span className="slip-value-lg">{student.full_name}</span>
              </div>

              <div className="slip-grid-two">
                <div className="slip-field-group">
                  <span className="slip-label">STUDENT ID NUMBER</span>
                  <span className="slip-value-id font-mono">
                    <IdCard className="w-4 h-4 inline mr-1 text-slate-600" />
                    {student.student_id}
                  </span>
                </div>

                <div className="slip-field-group">
                  <span className="slip-label">ACADEMIC TERM</span>
                  <span className="slip-value">
                    <Calendar className="w-4 h-4 inline mr-1 text-slate-600" />
                    {student.academic_term || 'Fall 2026 Academic Year'}
                  </span>
                </div>
              </div>

              <div className="slip-field-group">
                <span className="slip-label">PROGRAM / COURSE OF STUDY</span>
                <span className="slip-value font-semibold">{student.course}</span>
              </div>

              <div className="slip-grid-two">
                <div className="slip-field-group">
                  <span className="slip-label">REGISTERED EMAIL</span>
                  <span className="slip-value text-sm">
                    <Mail className="w-3.5 h-3.5 inline mr-1 text-slate-600" />
                    {student.email}
                  </span>
                </div>

                <div className="slip-field-group">
                  <span className="slip-label">TELEPHONE / MOBILE</span>
                  <span className="slip-value text-sm">
                    <Phone className="w-3.5 h-3.5 inline mr-1 text-slate-600" />
                    {student.phone || 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="slip-field-group">
                <span className="slip-label">REGISTRATION TIMESTAMP & RECORD ID</span>
                <span className="slip-value-meta font-mono text-xs">
                  {new Date(student.created_at).toLocaleString()} • Ref: {student.id}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode & Signature Footer */}
          <div className="slip-footer">
            <div className="slip-barcode-area">
              <div className="mock-barcode" aria-hidden="true">
                <div className="barcode-lines"></div>
              </div>
              <span className="barcode-text font-mono">*{student.student_id}*</span>
            </div>

            <div className="slip-signature-area">
              <div className="signature-line">
                <ShieldCheck className="w-4 h-4 text-slate-500 inline mr-1" />
                Registrar Authorized Digital Signature
              </div>
              <span className="signature-caption">Office of the University Registrar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
