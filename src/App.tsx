import { useState } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle,
  ShieldCheck,
  Zap,
  Mail,
  Search,
  Bell,
  ChevronDown,
  Home,
  BookOpen,
  FileText,
  Settings,
  Menu,
  X,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { StudentRegistrationForm } from './components/StudentRegistrationForm';
import { StudentDirectory } from './components/StudentDirectory';
import type { Student } from './types/student';
import './App.css';

type NavSection = 'dashboard' | 'students' | 'courses' | 'registrations' | 'reports' | 'settings';

function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('students');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [lastRegistered, setLastRegistered] = useState<Student | null>({
    id: 'sample-latest-id',
    full_name: 'Charlotte Esthy',
    student_id: 'STU-2026-4356',
    email: 'charlotteesthy49@gmail.com',
    phone: '+2348162600530',
    course: 'Information Technology',
    academic_term: 'Academic Year 2026 - 2027',
    created_at: new Date('2026-10-27T09:30:00Z').toISOString(),
  });
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);

  const handleRegistrationSuccess = (student: Student) => {
    setLastRegistered(student);
    setRefreshKey((prev) => prev + 1);
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSection('students');
  };

  const navigateTo = (section: NavSection) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-shell-enterprise">
      {/* ==============================================================================
          Top Application Header (Matching Screenshot)
          ============================================================================== */}
      <header className="enterprise-top-header">
        <div className="header-left-zone">
          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* EduRegister Brand Badge in Header */}
          <div
            className="header-brand-wrap"
            onClick={() => navigateTo('dashboard')}
            role="button"
            tabIndex={0}
          >
            <div className="brand-seal-icon">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="brand-text-block">
              <span className="brand-title-main">EduRegister</span>
              <span className="brand-subtitle-badge">STUDENT PORTAL</span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="header-center-zone">
          <form onSubmit={handleGlobalSearchSubmit} className="global-search-form">
            <Search className="global-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name, student ID, email, or phone..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (activeSection !== 'students') {
                  setActiveSection('students');
                }
              }}
              className="global-search-input"
              aria-label="Global search students"
            />
            {globalSearch && (
              <button
                type="button"
                className="clear-search-pill"
                onClick={() => setGlobalSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>
        </div>

        {/* Admin & Notifications Right Area */}
        <div className="header-right-zone">
          {/* Notification Button with Red Badge */}
          <div className="notification-btn-wrapper">
            <button
              type="button"
              className="header-icon-action-btn"
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="notification-badge-red">1</span>
            </button>

            {showNotificationPopup && (
              <div className="notification-dropdown-card">
                <div className="notification-header">
                  <span className="font-semibold text-xs">System Notifications</span>
                  <span className="text-xs text-indigo-400 font-mono">Session 2026</span>
                </div>
                <div className="notification-list">
                  <div className="notification-item unread">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-200">
                        Enrollment database online
                      </p>
                      <span className="text-xs text-slate-400">All student records synced</span>
                    </div>
                  </div>
                  <div className="notification-item">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-200">
                        Directory protection active
                      </p>
                      <span className="text-xs text-slate-400">Restricted staff access enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Display (Purple Circle JE • Joseph Esther • Admin • Chevron) */}
          <div className="admin-profile-pill" title="Administrator Profile">
            <div className="admin-avatar-circle" aria-hidden="true">
              <span>JE</span>
            </div>
            <div className="admin-info-labels">
              <span className="admin-user-name">Joseph Esther</span>
              <span className="admin-user-role">Admin</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </div>
        </div>
      </header>

      {/* ==============================================================================
          Main Enterprise Body (Sidebar + Content Viewport)
          ============================================================================== */}
      <div className="enterprise-body-layout">
        {/* Backdrop for mobile sidebar drawer */}
        {isMobileMenuOpen && (
          <div
            className="mobile-sidebar-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar Navigation (Matching Screenshot) */}
        <aside className={`enterprise-left-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-inner-nav">
            <nav className="sidebar-nav-list" aria-label="Portal Navigation">
              {/* 1. Dashboard */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigateTo('dashboard')}
              >
                <Home className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Dashboard</span>
                {activeSection === 'dashboard' && <ChevronRight className="active-arrow" />}
              </button>

              {/* 2. Students Directory */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeSection === 'students' ? 'active' : ''}`}
                onClick={() => navigateTo('students')}
              >
                <Users className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Students</span>
                {activeSection === 'students' && <ChevronRight className="active-arrow" />}
              </button>

              {/* 3. Courses */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeSection === 'courses' ? 'active' : ''}`}
                onClick={() => navigateTo('courses')}
              >
                <BookOpen className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Courses</span>
                {activeSection === 'courses' && <ChevronRight className="active-arrow" />}
              </button>

              {/* 4. Registrations */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeSection === 'registrations' ? 'active' : ''}`}
                onClick={() => navigateTo('registrations')}
              >
                <Zap className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Registrations</span>
                {activeSection === 'registrations' && <ChevronRight className="active-arrow" />}
              </button>

              {/* 5. Reports */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeSection === 'reports' ? 'active' : ''}`}
                onClick={() => navigateTo('reports')}
              >
                <FileText className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Reports</span>
                {activeSection === 'reports' && <ChevronRight className="active-arrow" />}
              </button>

              {/* 6. Settings */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                onClick={() => navigateTo('settings')}
              >
                <Settings className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Settings</span>
                {activeSection === 'settings' && <ChevronRight className="active-arrow" />}
              </button>
            </nav>

            {/* Sidebar Bottom Institution Badge (Matching Screenshot) */}
            <div className="sidebar-bottom-badge">
              <div className="institution-info-row">
                <div className="institution-seal-mini">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="institution-name">EduRegister</div>
                  <div className="institution-term-sub">Academic Session</div>
                  <div className="institution-term-year">2026 - 2027</div>
                </div>
              </div>
              <div className="system-live-pill">
                <span className="live-status-indicator" />
                <span>Registrar Services Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="enterprise-main-viewport">
          {/* ==========================================================================
              VIEW: Students Directory (Screen 1)
              ========================================================================== */}
          {activeSection === 'students' && (
            <StudentDirectory
              refreshKey={refreshKey}
              onRegisterClick={() => setActiveSection('registrations')}
              externalSearch={globalSearch}
            />
          )}

          {/* ==========================================================================
              VIEW: Student Registration Form (Screen 3)
              ========================================================================== */}
          {activeSection === 'registrations' && (
            <div className="registration-view-grid">
              <div className="form-column">
                <StudentRegistrationForm
                  onRegistrationSuccess={handleRegistrationSuccess}
                />
              </div>

              {/* Right-Side Registration Panels */}
              <div className="sidebar-column">
                <div className="info-card">
                  <div className="info-card-header">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <h3>Registration Guidelines</h3>
                  </div>
                  <ul className="info-features-list">
                    <li>
                      <div className="guideline-item-header">
                        <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <strong>1. Official Student ID</strong>
                      </div>
                      <p className="guideline-item-desc">
                        Provide the designated institutional matriculation code (e.g. STU-2026-4821). Duplicate IDs are rejected automatically.
                      </p>
                    </li>
                    <li>
                      <div className="guideline-item-header">
                        <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <strong>2. Verified Contact</strong>
                      </div>
                      <p className="guideline-item-desc">
                        Use an authentic email address and phone number to receive enrollment confirmations and course schedules.
                      </p>
                    </li>
                    <li>
                      <div className="guideline-item-header">
                        <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <strong>3. Program Selection</strong>
                      </div>
                      <p className="guideline-item-desc">
                        Select the accredited degree program and academic term assigned for this matriculation cohort.
                      </p>
                    </li>
                    <li>
                      <div className="guideline-item-header">
                        <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <strong>4. Instant Record Verification</strong>
                      </div>
                      <p className="guideline-item-desc">
                        Once saved, student records can be printed immediately with a cryptographic QR admission slip.
                      </p>
                    </li>
                  </ul>
                </div>

                {/* Latest Confirmed Registration */}
                {lastRegistered && (
                  <div className="last-registered-card">
                    <div className="last-reg-header">
                      <div className="status-badge-confirmed">
                        <span className="status-circle-dot" />
                        <span>Confirmed</span>
                      </div>
                      <span className="last-reg-heading">Latest Confirmed Registration</span>
                    </div>

                    <div className="last-reg-body">
                      <div className="last-reg-name">{lastRegistered.full_name}</div>
                      <div className="last-reg-details-grid">
                        <div className="last-reg-kv">
                          <span className="kv-label">ID:</span>
                          <span className="kv-val font-mono text-indigo-300">{lastRegistered.student_id}</span>
                        </div>
                        <div className="last-reg-kv">
                          <span className="kv-label">Program:</span>
                          <span className="kv-val">{lastRegistered.course}</span>
                        </div>
                        <div className="last-reg-kv">
                          <span className="kv-label">Date:</span>
                          <span className="kv-val">
                            {new Date(lastRegistered.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-text-link view-in-dir-btn mt-2"
                      onClick={() => setActiveSection('students')}
                    >
                      View in Directory →
                    </button>
                  </div>
                )}

                {/* Admissions Office */}
                <div className="quick-help-card">
                  <div className="help-card-header">
                    <h4>Admissions Office</h4>
                    <span className="office-status-pill">Active</span>
                  </div>
                  <p className="help-card-intro">
                    Need assistance with your enrollment details or course selection?
                  </p>
                  <div className="field-tags">
                    <span className="tag">Office: Registrar</span>
                    <span className="tag">Term: 2026 Academic</span>
                    <span className="tag">Enrollment: Open</span>
                  </div>
                  <div className="admissions-contact-box mt-3">
                    <Mail className="w-4 h-4 inline mr-2 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm font-mono text-slate-200">admissions@university.edu</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================================
              VIEW: Dashboard Overview
              ========================================================================== */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-overview-container">
              <div className="dashboard-hero-panel">
                <div className="dashboard-welcome">
                  <h1 className="hero-heading">Academic Administration Portal</h1>
                  <p className="hero-subheading">
                    Welcome back, <strong className="text-white">Joseph Esther</strong>. Overview of student admissions, registrations, and academic programs for the 2026–2027 term.
                  </p>
                </div>
                <div className="dashboard-quick-actions">
                  <button
                    type="button"
                    onClick={() => navigateTo('registrations')}
                    className="banner-action-btn banner-btn-solid-purple"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Student Registration
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('students')}
                    className="banner-action-btn banner-btn-outline"
                  >
                    <Users className="w-4 h-4 mr-1.5" />
                    Open Directory
                  </button>
                </div>
              </div>

              {/* Fast Stats Row */}
              <div className="dashboard-stats-row">
                <div className="dash-stat-card">
                  <div className="stat-icon-wrap bg-indigo-500-10">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Student Records</span>
                    <span className="stat-number">Active</span>
                    <span className="stat-footnote">Synchronized with Supabase</span>
                  </div>
                </div>

                <div className="dash-stat-card">
                  <div className="stat-icon-wrap bg-blue-500-10">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Academic Offerings</span>
                    <span className="stat-number">8 Programs</span>
                    <span className="stat-footnote">Accredited degree tracks</span>
                  </div>
                </div>

                <div className="dash-stat-card">
                  <div className="stat-icon-wrap bg-emerald-500-10">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Active Academic Session</span>
                    <span className="stat-number">2026–2027</span>
                    <span className="stat-footnote">Fall & Spring Cohorts</span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="dash-cards-grid">
                <div className="overview-card" onClick={() => navigateTo('students')}>
                  <div className="card-top-row">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="card-nav-title">Student Directory & Records</h3>
                  <p className="card-nav-desc">
                    Search matriculated students, view contact details, edit records, print official admission slips, or export full roster to CSV.
                  </p>
                  <span className="card-nav-action-text">Launch Directory →</span>
                </div>

                <div className="overview-card" onClick={() => navigateTo('registrations')}>
                  <div className="card-top-row">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="card-nav-title">New Student Registration</h3>
                  <p className="card-nav-desc">
                    Enroll students with automated ID generation, duplicate email and phone checks, program assignment, and immediate verification.
                  </p>
                  <span className="card-nav-action-text">Register Student →</span>
                </div>

                <div className="overview-card" onClick={() => navigateTo('courses')}>
                  <div className="card-top-row">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="card-nav-title">Course Offerings Catalog</h3>
                  <p className="card-nav-desc">
                    Browse degree tracks including Computer Science, Software Engineering, Cybersecurity, AI, and Business Administration.
                  </p>
                  <span className="card-nav-action-text">View Courses →</span>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================================
              VIEW: Courses Catalog
              ========================================================================== */}
          {activeSection === 'courses' && (
            <div className="catalog-container">
              <div className="catalog-header">
                <div>
                  <h1 className="section-title">Academic Degree Programs</h1>
                  <p className="section-subtitle">
                    Accredited undergraduate and professional tracks available for 2026–2027 enrollment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('registrations')}
                  className="banner-action-btn banner-btn-solid-purple"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Enroll in Program
                </button>
              </div>

              <div className="courses-grid-cards">
                {[
                  { name: 'Computer Science', code: 'CS-401', credits: 120, dept: 'School of Computing' },
                  { name: 'Software Engineering', code: 'SE-302', credits: 128, dept: 'School of Computing' },
                  { name: 'Data Science & Analytics', code: 'DS-204', credits: 124, dept: 'School of Mathematics' },
                  { name: 'Cybersecurity', code: 'CY-501', credits: 120, dept: 'Security & Systems' },
                  { name: 'Information Technology', code: 'IT-101', credits: 118, dept: 'Applied Sciences' },
                  { name: 'Artificial Intelligence', code: 'AI-602', credits: 130, dept: 'Cognitive Computing' },
                  { name: 'Electrical Engineering', code: 'EE-200', credits: 132, dept: 'Faculty of Engineering' },
                  { name: 'Business Administration', code: 'BA-110', credits: 116, dept: 'School of Management' },
                ].map((course) => (
                  <div key={course.code} className="program-card">
                    <div className="program-card-badge">
                      <GraduationCap className="w-4 h-4 text-indigo-400 mr-1.5" />
                      <span>{course.dept}</span>
                    </div>
                    <h3 className="program-title">{course.name}</h3>
                    <div className="program-meta-row">
                      <span className="program-code font-mono">{course.code}</span>
                      <span className="bullet">•</span>
                      <span>{course.credits} Credits</span>
                      <span className="bullet">•</span>
                      <span className="text-emerald-400">Enrollment Open</span>
                    </div>
                    <button
                      type="button"
                      className="btn-text-link mt-2"
                      onClick={() => navigateTo('registrations')}
                    >
                      Register student in track →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================================================
              VIEW: Reports
              ========================================================================== */}
          {activeSection === 'reports' && (
            <div className="reports-container">
              <div className="catalog-header">
                <div>
                  <h1 className="section-title">Institutional Reports & Audit Center</h1>
                  <p className="section-subtitle">
                    Official enrollment analytics, admissions logs, and student database exports.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('students')}
                  className="banner-action-btn banner-btn-outline"
                >
                  Access CSV Exporter in Directory
                </button>
              </div>

              <div className="reports-cards-grid">
                <div className="report-card">
                  <div className="report-card-top">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <span className="badge-pill">Ready</span>
                  </div>
                  <h3>Full Matriculation Roster</h3>
                  <p>Comprehensive export of all registered students including IDs, contact information, and degree programs.</p>
                  <button
                    type="button"
                    onClick={() => navigateTo('students')}
                    className="btn-text-link mt-2"
                  >
                    Download from Directory →
                  </button>
                </div>

                <div className="report-card">
                  <div className="report-card-top">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="badge-pill">Compliant</span>
                  </div>
                  <h3>Admissions Audit Log</h3>
                  <p>Automated record tracking with timestamps, ID generation sequences, and duplicate validation checks.</p>
                  <span className="text-xs text-slate-400 mt-2 block">Updated continuously</span>
                </div>

                <div className="report-card">
                  <div className="report-card-top">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="badge-pill">Session 2026</span>
                  </div>
                  <h3>Cohort Term Distribution</h3>
                  <p>Term allocations covering Academic Year 2026-2027, Fall 2026, and Spring 2027 enrollment streams.</p>
                  <span className="text-xs text-slate-400 mt-2 block">Accredited Academic Terms</span>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================================
              VIEW: Settings
              ========================================================================== */}
          {activeSection === 'settings' && (
            <div className="settings-container">
              <div className="catalog-header">
                <div>
                  <h1 className="section-title">System Settings & Administration</h1>
                  <p className="section-subtitle">
                    Configure institutional preferences, security passcodes, and academic session properties.
                  </p>
                </div>
              </div>

              <div className="settings-cards-list">
                <div className="setting-box">
                  <div className="setting-info">
                    <h4>Staff Access Security</h4>
                    <p>Directory records are protected by admissions passcode <code>admin123</code> to safeguard private student data.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('students')}
                    className="banner-action-btn banner-btn-outline"
                  >
                    Open Directory Passcode Gate
                  </button>
                </div>

                <div className="setting-box">
                  <div className="setting-info">
                    <h4>Current Academic Session</h4>
                    <p>Official registration session configured as <strong>Academic Year 2026–2027</strong>.</p>
                  </div>
                  <span className="tag font-mono">ACTIVE_TERM_2026</span>
                </div>

                <div className="setting-box">
                  <div className="setting-info">
                    <h4>Admissions Notification Dispatch</h4>
                    <p>Official notifications and registrar inquiries dispatched to <code>admissions@university.edu</code>.</p>
                  </div>
                  <span className="tag">VERIFIED_OFFICE</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
