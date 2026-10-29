/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolSettings, AdminAccount } from '../types/spmb';
import { 
  GraduationCap, 
  Menu, 
  X, 
  Search, 
  FileEdit, 
  ShieldCheck, 
  Share2, 
  Sparkles,
  PhoneCall,
  LogOut,
  UserCheck,
  Download,
  FileText
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

  const handleNavClick = (sectionId: string) => {
    onNavigateSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      {settings.announcementTicker && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-600 text-white text-xs py-1.5 px-4 font-medium overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide shrink-0">
                INFO PPDB
              </span>
              <span className="truncate">{settings.announcementTicker}</span>
            </div>
            <div className="hidden md:flex items-center gap-3 shrink-0 text-[11px] text-blue-100">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=Halo%20Panitia%20SPMB%20SMK%20Lentera%20Bangsa%202`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1 transition"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                Hotline: +{settings.whatsappNumber}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                <GraduationCap className="w-7 h-7 text-blue-700" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl font-sans group-hover:text-blue-600 transition">
                  {settings.schoolName || 'SMK LENTERA BANGSA 2'}
                </span>
                <span className="bg-blue-100 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-200">
                  SPMB {settings.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sistem Penerimaan Murid Baru Terpadu
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              onClick={() => handleNavClick('beranda')}
              className="hover:text-blue-600 transition py-1 cursor-pointer"
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick('pengumuman')}
              className="hover:text-blue-600 transition py-1 cursor-pointer flex items-center gap-1.5 text-rose-600 font-extrabold"
            >
              <span>Pengumuman</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </button>
            <button
              onClick={() => handleNavClick('jurusan')}
              className="hover:text-blue-600 transition py-1 cursor-pointer"
            >
              Jurusan & Keahlian
            </button>
            <button
              onClick={() => handleNavClick('alur')}
              className="hover:text-blue-600 transition py-1 cursor-pointer"
            >
              Alur & Syarat
            </button>
            <button
              onClick={() => handleNavClick('media')}
              className="hover:text-blue-600 transition py-1 cursor-pointer"
            >
              Media & Galeri
            </button>
            <button
              onClick={() => handleNavClick('jadwal')}
              className="hover:text-blue-600 transition py-1 cursor-pointer"
            >
              Jadwal Gelombang
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Bagikan Link */}
            <button
              onClick={onOpenShareModal}
              title="Bagikan Link SPMB"
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Download / Cetak Blanko Formulir Manual */}
            {onOpenBlankForm && (
              <button
                onClick={onOpenBlankForm}
                title="Download / Cetak Formulir Blanko Isian Manual (PDF A4)"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">Cetak Formulir Blanko</span>
              </button>
            )}

            {/* Cek Status & Update Mandiri */}
            <button
              onClick={onOpenCheckStatus}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-600" />
              <span>Cek Status / Edit Data</span>
            </button>

            {/* Tombol Daftar Sekarang */}
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Daftar Sekarang</span>
            </button>

            {/* Admin Portal Trigger (Disguised & Secure) */}
            {activeAdmin ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={onOpenAdminDashboard}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  title="Logout Admin"
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                title="Portal Petugas / Admin"
                aria-label="Admin Portal"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={onOpenRegister}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm"
            >
              Daftar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => handleNavClick('beranda')}
              className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick('pengumuman')}
              className="text-left py-2 px-3 text-sm font-extrabold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5"
            >
              <span>Pengumuman</span>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
            <button
              onClick={() => handleNavClick('jurusan')}
              className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Jurusan
            </button>
            <button
              onClick={() => handleNavClick('alur')}
              className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Alur & Syarat
            </button>
            <button
              onClick={() => handleNavClick('jadwal')}
              className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Jadwal
            </button>
            <button
              onClick={() => handleNavClick('media')}
              className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Media Promo
            </button>
            <button
              onClick={onOpenShareModal}
              className="text-left py-2 px-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
          </div>

            {onOpenBlankForm && (
              <button
                onClick={() => {
                  onOpenBlankForm();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl"
              >
                <Download className="w-4 h-4 text-amber-700" />
                <span>Download / Cetak Formulir Blanko (Manual)</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenCheckStatus();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-800 text-sm font-bold rounded-xl"
            >
              <Search className="w-4 h-4" />
              Cek Status & Update Data Mandiri
            </button>

            <button
              onClick={() => {
                onOpenRegister();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Formulir Pendaftaran Siswa Baru
            </button>

            {activeAdmin ? (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onOpenAdminDashboard();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-center bg-emerald-600 text-white rounded-lg"
                >
                  Buka Admin Panel ({activeAdmin.role === 'SUPER_ADMIN' ? 'Admin Utama' : 'Sub-Admin'})
                </button>
                <button
                  onClick={() => {
                    onLogoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-xs font-bold bg-rose-100 text-rose-700 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
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
