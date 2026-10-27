import { useState } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle,
  ShieldCheck,
  Zap,
  Mail,
} from 'lucide-react';
import { StudentRegistrationForm } from './components/StudentRegistrationForm';
import { StudentDirectory } from './components/StudentDirectory';
import type { Student } from './types/student';
import './App.css';

type ActiveTab = 'register' | 'directory';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('register');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [lastRegistered, setLastRegistered] = useState<Student | null>(null);

  const handleRegistrationSuccess = (student: Student) => {
    setLastRegistered(student);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <header className="app-navbar">
        <div className="nav-container">
          <div className="brand-group" onClick={() => setActiveTab('register')} role="button" tabIndex={0}>
            <div className="brand-logo-wrap">
              <GraduationCap className="brand-logo-icon" />
            </div>
            <div>
              <span className="brand-title">EduRegister</span>
              <span className="brand-badge">Student Portal</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs" aria-label="Main Navigation">
            <button
              type="button"
              id="tab-register"
              className={`nav-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Register Student
            </button>
            <button
              type="button"
              id="tab-directory"
              className={`nav-tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
              onClick={() => setActiveTab('directory')}
            >
              <Users className="w-4 h-4 mr-1.5" />
              Students Directory
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Tab 1: Registration Form */}
        {activeTab === 'register' && (
          <div className="registration-view-grid">
            <div className="form-column">
              <StudentRegistrationForm
                onRegistrationSuccess={handleRegistrationSuccess}
              />
            </div>

            {/* Information & Feature Highlight Sidebar */}
            <div className="sidebar-column">
              <div className="info-card">
                <div className="info-card-header">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3>Registration Guidelines</h3>
                </div>
                <ul className="info-features-list">
                  <li>
                    <strong>Official Student ID:</strong> Enter your designated ID code (e.g. STU-2026-089). Duplicate student IDs cannot be submitted.
                  </li>
                  <li>
                    <strong>Verified Contact:</strong> Use an active email address to receive registration confirmations and course schedules.
                  </li>
                  <li>
                    <strong>Program Selection:</strong> Select your intended major or study track from the official accredited list.
                  </li>
                  <li>
                    <strong>Instant Record Verification:</strong> Submissions are immediately indexed and visible in the student directory.
                  </li>
                </ul>
              </div>

              {lastRegistered && (
                <div className="last-registered-card">
                  <div className="last-reg-header">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mr-1.5" />
                    <span>Latest Confirmed Registration</span>
                  </div>
                  <div className="last-reg-body">
                    <div className="last-reg-name">{lastRegistered.full_name}</div>
                    <div className="last-reg-meta">
                      <span className="font-mono text-indigo-300">{lastRegistered.student_id}</span>
                      <span>•</span>
                      <span>{lastRegistered.course}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-text-link mt-2"
                    onClick={() => setActiveTab('directory')}
                  >
                    View in Directory →
                  </button>
                </div>
              )}

              <div className="quick-help-card">
                <h4>Admissions Office</h4>
                <p>
                  Need assistance with your enrollment details or course selection?
                </p>
                <div className="field-tags">
                  <span className="tag">Office: Registrar</span>
                  <span className="tag">Term: 2026 Academic</span>
                  <span className="tag">Enrollment: Open</span>
                </div>
                <div className="admissions-contact-box mt-3">
                  <Mail className="w-3.5 h-3.5 inline mr-1.5 text-indigo-400" />
                  <span>admissions@university.edu</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Students Directory */}
        {activeTab === 'directory' && (
          <StudentDirectory
            refreshKey={refreshKey}
            onRegisterClick={() => setActiveTab('register')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            EduRegister Student Portal • Academic Admissions & Student Information System
          </p>
          <div className="footer-links">
            <span className="footer-link-text">Academic Session 2026</span>
            <span className="bullet">•</span>
            <span className="footer-link-text">Official Student Records</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
