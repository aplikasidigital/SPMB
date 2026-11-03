
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { SchoolSettings, AdminAccount } from '../types/spmb';
import {
  GraduationCap,
  Menu,
  X,
  Search,
  ShieldCheck,
  Share2,
  Sparkles,
  PhoneCall,
  LogOut,
  UserCheck,
  Download,
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  activeAdmin: AdminAccount | null;
  onOpenRegister: () => void;
  onOpenCheckStatus: () => void;
  onOpenAdminLogin: () => void;
  onOpenShareModal: () => void;
  onOpenAdminDashboard: () => void;
  onLogoutAdmin: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenBlankForm?: () => void;
}

export const Navbar: React.FC<Props> = ({
  settings,
  activeAdmin,
  onOpenRegister,
  onOpenCheckStatus,
  onOpenAdminLogin,
  onOpenShareModal,
  onOpenAdminDashboard,
  onLogoutAdmin,
  onNavigateSection,
  onOpenBlankForm,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Menutup menu mobile ketika ukuran layar berubah ke desktop.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Menghindari scroll halaman ketika menu mobile terbuka.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // Menangani navigasi sekaligus menutup menu.
  const handleNavClick = useCallback(
    (sectionId: string) => {
      setMobileMenuOpen(false);

      try {
        onNavigateSection(sectionId);
      } catch (error) {
        console.error('Gagal melakukan navigasi:', error);
      }
    },
    [onNavigateSection]
  );

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleAction = useCallback(
    (action: () => void) => {
      setMobileMenuOpen(false);

      try {
        action();
      } catch (error) {
        console.error('Terjadi kesalahan saat menjalankan aksi:', error);
      }
    },
    []
  );

  const whatsappNumber = String(settings.whatsappNumber || '').replace(
    /[^0-9]/g,
    ''
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        'Halo Panitia SPMB SMK Lentera Bangsa 2'
      )}`
    : '';

  const navigationItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'pengumuman', label: 'Pengumuman', highlight: true },
    { id: 'jurusan', label: 'Jurusan & Keahlian' },
    { id: 'alur', label: 'Alur & Syarat' },
    { id: 'media', label: 'Media & Galeri' },
    { id: 'jadwal', label: 'Jadwal Gelombang' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">

      {/* TOP ANNOUNCEMENT BAR */}
      {settings.announcementTicker && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-600 text-white text-xs py-1.5 px-4 font-medium overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide shrink-0">
                INFO PPDB
              </span>

              <span className="truncate">
                {settings.announcementTicker}
              </span>
            </div>

            {whatsappUrl && (
              <div className="hidden md:flex items-center gap-3 shrink-0 text-[11px] text-blue-100">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-400" />
                  Hotline: +{whatsappNumber}
                </a>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LOGO & BRAND */}
          <button
            type="button"
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-3 cursor-pointer group text-left min-w-0"
            aria-label="Kembali ke halaman beranda"
          >
            <div className="relative w-12 h-12 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                <GraduationCap className="w-7 h-7 text-blue-700" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl font-sans group-hover:text-blue-600 transition leading-tight">
                  {settings.schoolName || 'SMK LENTERA BANGSA 2'}
                </span>

                <span className="bg-blue-100 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                  SPMB {settings.academicYear}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sistem Penerimaan Murid Baru Terpadu
              </p>
            </div>
          </button>

          {/* DESKTOP NAVIGATION */}
          <nav
            className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600"
            aria-label="Navigasi utama"
          >
            {navigationItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`hover:text-blue-600 transition py-1 cursor-pointer flex items-center gap-1.5 ${
                  item.highlight
                    ? 'text-rose-600 font-extrabold'
                    : ''
                }`}
              >
                <span>{item.label}</span>

                {item.highlight && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* DESKTOP ACTION BUTTONS */}
          <div className="hidden sm:flex items-center gap-3">

            {/* SHARE */}
            <button
              type="button"
              onClick={() => handleAction(onOpenShareModal)}
              title="Bagikan Link SPMB"
              aria-label="Bagikan Link SPMB"
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* BLANK FORM */}
            {onOpenBlankForm && (
              <button
                type="button"
                onClick={() => handleAction(onOpenBlankForm)}
                title="Download / Cetak Formulir Blanko Isian Manual (PDF A4)"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">
                  Cetak Formulir Blanko
                </span>
              </button>
            )}

            {/* CHECK STATUS */}
            <button
              type="button"
              onClick={() => handleAction(onOpenCheckStatus)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-600" />
              <span>Cek Status / Edit Data</span>
            </button>

            {/* REGISTER */}
            <button
              type="button"
              onClick={() => handleAction(onOpenRegister)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Daftar Sekarang</span>
            </button>

            {/* ADMIN */}
            {activeAdmin ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">

                <button
                  type="button"
                  onClick={() => handleAction(onOpenAdminDashboard)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onLogoutAdmin)}
                  title="Logout Admin"
                  aria-label="Logout Admin"
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleAction(onOpenAdminLogin)}
                title="Portal Petugas / Admin"
                aria-label="Admin Portal"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}

          </div>

          {/* MOBILE BUTTONS */}
          <div className="flex items-center gap-2 sm:hidden shrink-0">

            <button
              type="button"
              onClick={() => handleAction(onOpenRegister)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Daftar
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="sm:hidden absolute left-0 right-0 top-full border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl max-h-[calc(100dvh-80px)] overflow-y-auto"
        >

          {/* NAVIGATION LINKS */}
          <nav
            className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100"
            aria-label="Navigasi mobile"
          >
            {navigationItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`text-left py-2 px-3 text-sm rounded-lg transition ${
                  item.highlight
                    ? 'font-extrabold text-rose-600 hover:bg-rose-50'
                    : 'font-semibold text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {item.label}

                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleAction(onOpenShareModal)}
              className="text-left py-2 px-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
          </nav>

          {/* BLANK FORM */}
          {onOpenBlankForm && (
            <button
              type="button"
              onClick={() => handleAction(onOpenBlankForm)}
              className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl hover:bg-amber-200 transition"
            >
              <Download className="w-4 h-4 text-amber-700" />
              <span>Download / Cetak Formulir Blanko (Manual)</span>
            </button>
          )}

          {/* CHECK STATUS */}
          <button
            type="button"
            onClick={() => handleAction(onOpenCheckStatus)}
            className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition"
          >
            <Search className="w-4 h-4" />
            Cek Status & Update Data Mandiri
          </button>

          {/* REGISTER */}
          <button
            type="button"
            onClick={() => handleAction(onOpenRegister)}
            className="w-full flex items-center justify-center gap-2 mt-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Formulir Pendaftaran Siswa Baru
          </button>

          {/* ADMIN PANEL */}
          {activeAdmin ? (
            <div className="flex gap-2 mt-3 pt-2 border-t border-slate-100">

              <button
                type="button"
                onClick={() => handleAction(onOpenAdminDashboard)}
                className="flex-1 py-2.5 text-xs font-bold text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  Admin Panel (
                  {activeAdmin.role === 'SUPER_ADMIN'
                    ? 'Admin Utama'
                    : 'Sub-Admin'}
                  )
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onLogoutAdmin)}
                className="px-4 py-2.5 text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition"
              >
                Logout
              </button>

            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleAction(onOpenAdminLogin)}
              className="w-full text-center mt-3 py-2 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Login Khusus Petugas SPMB
            </button>
          )}

        </div>
      )}

    </header>
  );
};

export default Navbar;
