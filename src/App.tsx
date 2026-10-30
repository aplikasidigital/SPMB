/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  StudentRegistration, 
  SchoolSettings, 
  MajorProgram, 
  SchoolWave, 
  AdminAccount, 
  ActivityLog,
  SchoolAnnouncement 
} from './types/spmb';
import { StorageService } from './services/storageService';
import { SupabaseService } from './services/supabaseClient';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { MajorsSection } from './components/MajorsSection';
import { FlowAndScheduleSection } from './components/FlowAndScheduleSection';
import { PromoMediaSection } from './components/PromoMediaSection';
import { Footer } from './components/Footer';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationSuccessModal } from './components/RegistrationSuccessModal';
import { SelfUpdateModal } from './components/SelfUpdateModal';
import { PrintableRegistrationCard } from './components/PrintableRegistrationCard';
import { PrintableRecapTable } from './components/PrintableRecapTable';
import { PrintableBlankRegistrationForm } from './components/PrintableBlankRegistrationForm';
import { NotificationModal } from './components/NotificationModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AppSettingsModal } from './components/AppSettingsModal';
import { SpreadsheetSyncModal } from './components/SpreadsheetSyncModal';
import { ShareModal } from './components/ShareModal';

export default function App() {
  // App-wide state
  const [settings, setSettings] = useState<SchoolSettings>(StorageService.getSettings());
  const [majors, setMajors] = useState<MajorProgram[]>(StorageService.getMajors());
  const [waves, setWaves] = useState<SchoolWave[]>(StorageService.getWaves());
  const [registrants, setRegistrants] = useState<StudentRegistration[]>(StorageService.getRegistrants());
  const [admins, setAdmins] = useState<AdminAccount[]>(StorageService.getAdmins());
  const [logs, setLogs] = useState<ActivityLog[]>(StorageService.getLogs());
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(StorageService.getAnnouncements());
  const [activeAdmin, setActiveAdmin] = useState<AdminAccount | null>(StorageService.getActiveSession());

  // Modal Visibility States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedMajorForRegister, setSelectedMajorForRegister] = useState<string | undefined>(undefined);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRegistration, setSuccessRegistration] = useState<StudentRegistration | null>(null);

  const [showCheckStatusModal, setShowCheckStatusModal] = useState(false);
  const [checkStatusQuery, setCheckStatusQuery] = useState('');

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAppSettingsModal, setShowAppSettingsModal] = useState(false);
  const [showSpreadsheetSyncModal, setShowSpreadsheetSyncModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Printing & Notification
  const [printableRegistration, setPrintableRegistration] = useState<StudentRegistration | null>(null);
  const [printableRecapActive, setPrintableRecapActive] = useState(false);
  const [showPrintableBlankForm, setShowPrintableBlankForm] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState<StudentRegistration | null>(null);

  // Reload data helper
  const reloadAllData = () => {
    setSettings(StorageService.getSettings());
    setMajors(StorageService.getMajors());
    setWaves(StorageService.getWaves());
    setRegistrants(StorageService.getRegistrants());
    setAdmins(StorageService.getAdmins());
    setLogs(StorageService.getLogs());
    setAnnouncements(StorageService.getAnnouncements());
    setActiveAdmin(StorageService.getActiveSession());
  };

  // Sync with localStorage & Supabase Realtime changes across tabs/windows
  useEffect(() => {
    const handleStorageUpdate = () => {
      reloadAllData();
    };

    window.addEventListener('spmb-storage-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    // Initial background Supabase REST sync test & settings fetch
    StorageService.fetchFromSupabase().catch(() => {});
    SupabaseService.fetchSettings().then((res) => {
      if (res.success && res.data) {
        StorageService.saveSettings(res.data);
        reloadAllData();
      }
    }).catch(() => {});

    // Subscribe to Realtime Postgres changes from Supabase
    const unsubscribeRealtime = SupabaseService.subscribeToRealtimeChanges(
      () => {
        // Realtime change in registrations detected
        StorageService.fetchFromSupabase().then(() => reloadAllData()).catch(() => {});
      },
      () => {
        // Realtime change in settings detected
        SupabaseService.fetchSettings().then((res) => {
          if (res.success && res.data) {
            StorageService.saveSettings(res.data);
            reloadAllData();
          }
        }).catch(() => {});
      }
    );

    // Check URL parameters for QR Code verification or action triggers
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const verifyParam = urlParams.get('verify');
      const actionParam = urlParams.get('action');

      if (verifyParam) {
        setCheckStatusQuery(verifyParam);
        setShowCheckStatusModal(true);
      } else if (actionParam === 'register') {
        setShowRegisterModal(true);
      } else if (actionParam === 'admin') {
        setShowAdminLoginModal(true);
      }
    }

    return () => {
      window.removeEventListener('spmb-storage-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      unsubscribeRealtime();
    };
  }, []);

  // Smooth scroll to anchor
  const handleNavigateSection = (sectionId: string) => {
    if (showAdminDashboard) {
      setShowAdminDashboard(false);
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Major selection from cards
  const handleSelectMajorFromCard = (majorName: string) => {
    setSelectedMajorForRegister(majorName);
    setShowRegisterModal(true);
  };

  // Registration successful callback
  const handleSuccessRegistered = (created: StudentRegistration) => {
    setShowRegisterModal(false);
    setSuccessRegistration(created);
    setShowSuccessModal(true);
    reloadAllData();
  };

  // Admin Login success
  const handleSuccessAdminLogin = (admin: AdminAccount) => {
    setActiveAdmin(admin);
    setShowAdminLoginModal(false);
    setShowAdminDashboard(true);
  };

  const handleLogoutAdmin = () => {
    StorageService.setActiveSession(null);
    setActiveAdmin(null);
    setShowAdminDashboard(false);
    reloadAllData();
  };

  const activeWave = waves.find(w => w.isActive) || waves[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Precision A4 Print Styles & Render Target (Always in DOM for window.print()) */}
      {printableRegistration && (
        <PrintableRegistrationCard
          registration={printableRegistration}
          settings={settings}
          onClose={() => setPrintableRegistration(null)}
          isModal={true}
        />
      )}

      {/* Precision Printable Recap Table Modal */}
      {printableRecapActive && (
        <PrintableRecapTable
          registrants={registrants}
          settings={settings}
          onClose={() => setPrintableRecapActive(false)}
        />
      )}

      {/* Main App Bar */}
      <Navbar
        settings={settings}
        activeAdmin={activeAdmin}
        onOpenRegister={() => {
          setSelectedMajorForRegister(undefined);
          setShowRegisterModal(true);
        }}
        onOpenCheckStatus={() => {
          setCheckStatusQuery('');
          setShowCheckStatusModal(true);
        }}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        onOpenAdminDashboard={() => setShowAdminDashboard(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onNavigateSection={handleNavigateSection}
        onOpenBlankForm={() => setShowPrintableBlankForm(true)}
      />

      {/* Main View Router: If Admin Dashboard is active, render Admin panel, otherwise render Landing Page */}
      {showAdminDashboard && activeAdmin ? (
        <main className="flex-1">
          <AdminDashboard
            settings={settings}
            majors={majors}
            waves={waves}
            registrants={registrants}
            admins={admins}
            logs={logs}
            activeAdmin={activeAdmin}
            onLogout={handleLogoutAdmin}
            onOpenSettings={() => setShowAppSettingsModal(true)}
            onOpenSpreadsheetSync={() => setShowSpreadsheetSyncModal(true)}
            onPrintCard={(reg) => setPrintableRegistration(reg)}
            onOpenNotificationModal={(reg) => setNotificationTarget(reg)}
            onOpenAddStudentModal={() => {
              setSelectedMajorForRegister(undefined);
              setShowRegisterModal(true);
            }}
            onRefreshData={reloadAllData}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* Section 1: Hero Section */}
          <div id="beranda">
            <HeroSection
              settings={settings}
              activeWave={activeWave}
              totalRegistrants={registrants.length}
              onOpenRegister={() => {
                setSelectedMajorForRegister(undefined);
                setShowRegisterModal(true);
              }}
              onOpenCheckStatus={() => {
                setCheckStatusQuery('');
                setShowCheckStatusModal(true);
              }}
              onOpenShareModal={() => setShowShareModal(true)}
              onNavigateSection={handleNavigateSection}
            />
          </div>

          {/* Section 1.5: Pengumuman & Info Penting SPMB */}
          <AnnouncementsSection
            announcements={announcements}
            settings={settings}
            onOpenRegister={() => {
              setSelectedMajorForRegister(undefined);
              setShowRegisterModal(true);
            }}
          />

          {/* Section 2: Majors / Keahlian */}
          <MajorsSection
            majors={majors}
            onSelectMajor={handleSelectMajorFromCard}
          />

          {/* Section 3: Alur Pendaftaran & Jadwal */}
          <FlowAndScheduleSection
            waves={waves}
            onOpenRegister={() => {
              setSelectedMajorForRegister(undefined);
              setShowRegisterModal(true);
            }}
            onOpenCheckStatus={() => {
              setCheckStatusQuery('');
              setShowCheckStatusModal(true);
            }}
            onOpenBlankForm={() => setShowPrintableBlankForm(true)}
          />

          {/* Section 4: Media Promosi Dinamis */}
          <PromoMediaSection
            settings={settings}
            onOpenRegister={() => {
              setSelectedMajorForRegister(undefined);
              setShowRegisterModal(true);
            }}
          />
        </main>
      )}

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onOpenCheckStatus={() => {
          setCheckStatusQuery('');
          setShowCheckStatusModal(true);
        }}
        onOpenRegister={() => {
          setSelectedMajorForRegister(undefined);
          setShowRegisterModal(true);
        }}
        onOpenShareModal={() => setShowShareModal(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* --- ALL INTERACTIVE MODALS --- */}

      {/* 1. Formulir Pendaftaran Siswa Baru */}
      {showRegisterModal && (
        <RegistrationForm
          majors={majors}
          waves={waves}
          settings={settings}
          defaultMajor={selectedMajorForRegister}
          onClose={() => setShowRegisterModal(false)}
          onSuccessRegistered={handleSuccessRegistered}
        />
      )}

      {/* 2. Modal Sukses Terdaftar */}
      {showSuccessModal && successRegistration && (
        <RegistrationSuccessModal
          registration={successRegistration}
          settings={settings}
          onClose={() => setShowSuccessModal(false)}
          onPrintCard={(reg) => setPrintableRegistration(reg)}
          onOpenNotificationModal={(reg) => setNotificationTarget(reg)}
          onOpenUpdateMandiri={(reg) => {
            setCheckStatusQuery(reg.registrationNumber);
            setShowCheckStatusModal(true);
          }}
        />
      )}

      {/* 3. Cek Status & Update Data Mandiri */}
      {showCheckStatusModal && (
        <SelfUpdateModal
          settings={settings}
          majors={majors}
          initialQuery={checkStatusQuery}
          onClose={() => setShowCheckStatusModal(false)}
          onPrintCard={(reg) => setPrintableRegistration(reg)}
          onOpenNotificationModal={(reg) => setNotificationTarget(reg)}
        />
      )}

      {/* 4. Notifikasi Otomatis (WhatsApp & Email) */}
      {notificationTarget && (
        <NotificationModal
          registration={notificationTarget}
          settings={settings}
          onClose={() => setNotificationTarget(null)}
        />
      )}

      {/* 5. Keamanan Login Admin */}
      {showAdminLoginModal && (
        <AdminLoginModal
          onClose={() => setShowAdminLoginModal(false)}
          onSuccessLogin={handleSuccessAdminLogin}
        />
      )}

      {/* 6. Pengaturan Aplikasi & Manajemen Admin Bayangan (Super Admin Only) */}
      {showAppSettingsModal && activeAdmin && (
        <AppSettingsModal
          settings={settings}
          admins={admins}
          activeAdmin={activeAdmin}
          onClose={() => setShowAppSettingsModal(false)}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            reloadAllData();
          }}
        />
      )}

      {/* 7. Spreadsheet & Supabase Sync Modal */}
      {showSpreadsheetSyncModal && (
        <SpreadsheetSyncModal
          registrants={registrants}
          settings={settings}
          onClose={() => setShowSpreadsheetSyncModal(false)}
          onPrintRecapPdf={() => {
            setShowSpreadsheetSyncModal(false);
            setPrintableRecapActive(true);
          }}
        />
      )}

      {/* 8. Bagikan Link Modal */}
      {showShareModal && (
        <ShareModal
          settings={settings}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* 9. Printable Blank Registration Form (Manual Handwriting A4 Format) */}
      {showPrintableBlankForm && (
        <PrintableBlankRegistrationForm
          settings={settings}
          majors={majors}
          onClose={() => setShowPrintableBlankForm(false)}
        />
      )}
    </div>
  );
}
