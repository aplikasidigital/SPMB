/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  StudentRegistration,
  SchoolSettings,
  MajorProgram,
  SchoolWave,
  AdminAccount,
  ActivityLog,
} from '../types/spmb';

import { StorageService } from '../services/storageService';

import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdminDeskFormModule } from './AdminDeskFormModule';
import { SPMBPosterBanner } from './SPMBPosterBanner';
import { WaveManagementModule } from './WaveManagementModule';
import { MajorManagementModule } from './MajorManagementModule';

import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  FileEdit,
  Trash2,
  FileSpreadsheet,
  UserPlus,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  X,
  LogOut,
  Settings,
  FileText,
  Save,
  AlertTriangle,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Megaphone,
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  majors: MajorProgram[];
  waves: SchoolWave[];
  registrants: StudentRegistration[];
  admins: AdminAccount[];
  logs: ActivityLog[];
  activeAdmin: AdminAccount;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenSpreadsheetSync: () => void;
  onPrintCard: (reg: StudentRegistration) => void;
  onOpenNotificationModal: (reg: StudentRegistration) => void;
  onOpenAddStudentModal: () => void;
  onRefreshData?: () => void;
}

type DashboardTab =
  | 'dashboard_poster'
  | 'spmb_form'
  | 'pendaftar'
  | 'waves_mgmt'
  | 'majors_mgmt'
  | 'analitik'
  | 'log';

const ITEMS_PER_PAGE = 50;

export const AdminDashboard: React.FC<Props> = ({
  settings,
  majors,
  waves,
  registrants: propRegistrants,
  admins,
  logs,
  activeAdmin,
  onLogout,
  onOpenSettings,
  onOpenSpreadsheetSync,
  onPrintCard,
  onOpenNotificationModal,
  onOpenAddStudentModal,
  onRefreshData,
}) => {
  const isSuperAdmin = activeAdmin.role === 'SUPER_ADMIN';

  // =========================================================
  // STATE UTAMA
  // =========================================================

  const [localRegistrants, setLocalRegistrants] =
    useState<StudentRegistration[]>(propRegistrants || []);

  const [activeTab, setActiveTab] =
    useState<DashboardTab>('dashboard_poster');

  const [spmbSubView, setSpmbSubView] =
    useState<'create' | 'crud_list'>('create');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMajor, setFilterMajor] = useState('ALL');
  const [filterWave, setFilterWave] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteTarget, setDeleteTarget] =
    useState<StudentRegistration | null>(null);

  const [viewStudent, setViewStudent] =
    useState<StudentRegistration | null>(null);

  const [statusModalStudent, setStatusModalStudent] =
    useState<StudentRegistration | null>(null);

  const [newStatus, setNewStatus] =
    useState<StudentRegistration['status']>('DITERIMA');

  const [statusNote, setStatusNote] = useState('');

  const [editStudent, setEditStudent] =
    useState<StudentRegistration | null>(null);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [isActionLoading, setIsActionLoading] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // =========================================================
  // SINKRONISASI DATA DARI KOMPONEN INDUK
  // =========================================================

  useEffect(() => {
    setLocalRegistrants(propRegistrants || []);
  }, [propRegistrants]);

  // Bersihkan timer notifikasi saat komponen dilepas.
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // =========================================================
  // NOTIFIKASI
  // =========================================================

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);

    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  // =========================================================
  // FILTER DATA PENDAFTAR
  // Menggunakan useMemo agar pencarian tidak dihitung ulang
  // ketika komponen mengalami render karena perubahan lain.
  // =========================================================

  const filteredRegistrants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return localRegistrants.filter((r) => {
      const fullName = String(r.personalData?.fullName || '').toLowerCase();
      const registrationNumber = String(r.registrationNumber || '').toLowerCase();
      const nisn = String(r.personalData?.nisn || '').toLowerCase();
      const familyCardNumber = String(
        r.personalData?.familyCardNumber || ''
      ).toLowerCase();
      const phone = String(
        r.personalData?.phoneWhatsApp || ''
      ).toLowerCase();

      const matchQuery =
        !query ||
        fullName.includes(query) ||
        registrationNumber.includes(query) ||
        nisn.includes(query) ||
        familyCardNumber.includes(query) ||
        phone.includes(query);

      const matchStatus =
        filterStatus === 'ALL' || r.status === filterStatus;

      const matchMajor =
        filterMajor === 'ALL' ||
        r.majorChoice?.firstChoice === filterMajor;

      const matchWave =
        filterWave === 'ALL' || r.wave === filterWave;

      return (
        matchQuery &&
        matchStatus &&
        matchMajor &&
        matchWave
      );
    });
  }, [
    localRegistrants,
    search,
    filterStatus,
    filterMajor,
    filterWave,
  ]);

  // =========================================================
  // PAGINATION
  // Membatasi jumlah baris yang dirender agar tabel tidak berat.
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRegistrants.length / ITEMS_PER_PAGE)
  );

  const paginatedRegistrants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredRegistrants.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredRegistrants, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterMajor, filterWave]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =========================================================
  // REFRESH DATA
  // =========================================================

  const refreshData = () => {
    try {
      onRefreshData?.();
    } catch (error) {
      console.error('Gagal memperbarui data dari komponen induk:', error);
    }
  };

  // =========================================================
  // HAPUS DATA PENDAFTAR
  // =========================================================

  const handleInitiateDelete = (student: StudentRegistration) => {
    if (isActionLoading) return;

    setDeleteTarget(student);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || isActionLoading) return;

    setIsActionLoading(true);

    try {
      const targetId = deleteTarget.id;
      const targetRegNum = deleteTarget.registrationNumber;
      const targetName = deleteTarget.personalData.fullName;

      const success = StorageService.deleteRegistrant(
        targetId,
        activeAdmin.fullName
      );

      if (!success) {
        showToast('Data gagal dihapus. Silakan periksa kembali.');
        return;
      }

      setLocalRegistrants((previous) =>
        previous.filter(
          (r) =>
            r.id !== targetId &&
            r.registrationNumber !== targetRegNum
        )
      );

      setDeleteTarget(null);

      showToast(
        `Data pendaftar "${targetName}" (${targetRegNum}) berhasil dihapus.`
      );

      refreshData();
    } catch (error: any) {
      console.error('Kesalahan menghapus pendaftar:', error);

      showToast(
        `Gagal menghapus data: ${
          error?.message || 'Terjadi kesalahan pada sistem.'
        }`
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // =========================================================
  // UBAH STATUS PENDAFTAR
  // =========================================================

  const handleConfirmStatus = (e: React.FormEvent) => {
    e.preventDefault();

    if (!statusModalStudent || isActionLoading) return;

    setIsActionLoading(true);

    try {
      const student = statusModalStudent;

      StorageService.updateRegistrantStatus(
        student.id,
        newStatus,
        statusNote,
        activeAdmin.fullName
      );

      const updatedAt = new Date()
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19);

      setLocalRegistrants((previous) =>
        previous.map((r) => {
          if (
            r.id === student.id ||
            r.registrationNumber === student.registrationNumber
          ) {
            return {
              ...r,
              status: newStatus,
              statusNote,
              verifiedBy: activeAdmin.fullName,
              updatedAt,
            };
          }

          return r;
        })
      );

      setStatusModalStudent(null);

      showToast(
        `Status ${student.personalData.fullName} berhasil diubah menjadi ${newStatus}.`
      );

      refreshData();
    } catch (error: any) {
      console.error('Kesalahan mengubah status:', error);

      showToast(
        `Gagal mengubah status: ${
          error?.message || 'Terjadi kesalahan.'
        }`
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // =========================================================
  // SIMPAN EDIT DATA PENDAFTAR
  // =========================================================

  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editStudent || isActionLoading) return;

    setIsActionLoading(true);

    try {
      const updated = StorageService.updateRegistrant(
        editStudent.id,
        editStudent,
        activeAdmin.fullName
      );

      if (updated) {
        setLocalRegistrants((previous) =>
          previous.map((r) =>
            r.id === updated.id ? updated : r
          )
        );

        showToast(
          `Data pendaftar ${updated.personalData.fullName} berhasil diperbarui.`
        );

        refreshData();
        setEditStudent(null);
      } else {
        showToast('Data belum berhasil diperbarui.');
      }
    } catch (error: any) {
      console.error('Kesalahan memperbarui data:', error);

      showToast(
        `Gagal memperbarui data: ${
          error?.message || 'Terjadi kesalahan.'
        }`
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // =========================================================
  // RESET FILTER
  // =========================================================

  const handleResetFilter = () => {
    setSearch('');
    setFilterStatus('ALL');
    setFilterMajor('ALL');
    setFilterWave('ALL');
    setCurrentPage(1);
  };

  // =========================================================
  // KOMPONEN TAMPILAN
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">

      {/* =====================================================
          HEADER ADMIN
      ===================================================== */}

      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16 py-2 gap-3">

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-tight">
                    Panel Panitia SPMB
                  </h1>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isSuperAdmin
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-purple-400 text-slate-950'
                    }`}
                  >
                    {isSuperAdmin ? 'ADMIN UTAMA' : 'ADMIN BAYANGAN'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 truncate">
                  {activeAdmin.fullName} ({settings.schoolName})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">

              <div
                title="Panel administrasi aktif"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Panel Aktif</span>
              </div>

              <button
                type="button"
                onClick={onOpenSpreadsheetSync}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">
                  Rekap Spreadsheet & Excel
                </span>
              </button>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition"
                  title="Kelola Pengumuman, Brosur, Spanduk & Poster"
                >
                  <Megaphone className="w-4 h-4" />
                  <span className="hidden md:inline">
                    Pengumuman & Promo
                  </span>
                </button>
              )}

              {isSuperAdmin ? (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700"
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">
                    Pengaturan Aplikasi
                  </span>
                </button>
              ) : (
                <div className="hidden sm:block text-[11px] text-slate-500 italic px-2">
                  Pengaturan terkunci
                </div>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl transition border border-rose-800"
                title="Keluar dari sesi admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NOTIFIKASI TOAST
      ===================================================== */}

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-[100] max-w-sm bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* =====================================================
          KONTEN UTAMA
      ===================================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ===================================================
            NAVIGASI TAB
        =================================================== */}

        <div className="flex items-center justify-between flex-wrap gap-3">

          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex-wrap">

            <button
              type="button"
              onClick={() => setActiveTab('dashboard_poster')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'dashboard_poster'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Poster</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('spmb_form')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'spmb_form'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Admin Desk SPMB</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pendaftar')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'pendaftar'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Data Pendaftar ({localRegistrants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('waves_mgmt')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'waves_mgmt'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Gelombang ({waves.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('majors_mgmt')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'majors_mgmt'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Jurusan & Biaya</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analitik')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'analitik'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Analitik</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('log')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'log'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Log ({logs.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('spmb_form');
              setSpmbSubView('create');
              onOpenAddStudentModal();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Input Pendaftar Baru</span>
          </button>
        </div>

        {/* ===================================================
            TAB DASHBOARD & POSTER
        =================================================== */}

        {activeTab === 'dashboard_poster' && (
          <SPMBPosterBanner
            settings={settings}
            majors={majors}
            waves={waves}
            registrants={localRegistrants}
            activeAdmin={activeAdmin}
            onNavigateToFormDesk={() => setActiveTab('spmb_form')}
            onNavigateToWaves={() => setActiveTab('waves_mgmt')}
            onNavigateToMajors={() => setActiveTab('majors_mgmt')}
            onOpenSpreadsheetSync={onOpenSpreadsheetSync}
          />
        )}

        {/* ===================================================
            TAB ADMIN DESK SPMB
        =================================================== */}

        {activeTab === 'spmb_form' && (
          <AdminDeskFormModule
            settings={settings}
            majors={majors}
            waves={waves}
            registrants={localRegistrants}
            activeAdmin={activeAdmin}
            onRefreshData={onRefreshData}
            onPrintCard={onPrintCard}
            onOpenNotificationModal={onOpenNotificationModal}
          />
        )}

        {/* ===================================================
            TAB MANAJEMEN GELOMBANG
        =================================================== */}

        {activeTab === 'waves_mgmt' && (
          <WaveManagementModule
            waves={waves}
            activeAdmin={activeAdmin}
            onRefreshData={onRefreshData}
          />
        )}

        {/* ===================================================
            TAB MANAJEMEN JURUSAN
        =================================================== */}

        {activeTab === 'majors_mgmt' && (
          <MajorManagementModule
            majors={majors}
            activeAdmin={activeAdmin}
            onRefreshData={onRefreshData}
          />
        )}

        {/* ===================================================
            TAB DATA PENDAFTAR
        =================================================== */}

        {activeTab === 'pendaftar' && (
          <div className="space-y-4">

            {/* FILTER DATA */}

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">

              <div className="grid sm:grid-cols-12 gap-3 items-center">

                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />

                  <input
                    type="text"
                    placeholder="Cari nama siswa, nomor pendaftaran, NISN, no HP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={filterMajor}
                    onChange={(e) => setFilterMajor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none"
                  >
                    <option value="ALL">Semua Jurusan</option>

                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none font-semibold"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="DITERIMA">DITERIMA</option>
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIKASI_BERKAS">VERIFIKASI</option>
                    <option value="DIBATALKAN">DIBATALKAN</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={filterWave}
                    onChange={(e) => setFilterWave(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none"
                  >
                    <option value="ALL">Semua Gelombang</option>

                    {waves.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">

                <span>
                  Menampilkan{' '}
                  <strong>{paginatedRegistrants.length}</strong> data dari{' '}
                  <strong>{filteredRegistrants.length}</strong> hasil pencarian.
                  Total data: <strong>{localRegistrants.length}</strong>
                </span>

                {(search ||
                  filterStatus !== 'ALL' ||
                  filterMajor !== 'ALL' ||
                  filterWave !== 'ALL') && (
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* TABEL PENDAFTAR */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-left text-xs border-collapse">

                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
                      <th className="p-3 pl-4">No. Pendaftaran</th>
                      <th className="p-3">Nama Siswa & NISN</th>
                      <th className="p-3">Jurusan Pilihan 1</th>
                      <th className="p-3">Asal Sekolah</th>
                      <th className="p-3">Kontak WA</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right pr-4">Aksi Kelola</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {paginatedRegistrants.length > 0 ? (
                      paginatedRegistrants.map((r) => {
                        const phone = String(
                          r.personalData?.phoneWhatsApp || ''
                        );

                        const phoneDigits = phone.replace(/\D/g, '');

                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-slate-50/80 transition"
                          >

                            <td className="p-3 pl-4">
                              <span className="font-mono font-bold text-blue-900 block">
                                {r.registrationNumber}
                              </span>

                              <span className="text-[10px] text-slate-400">
                                {String(r.createdAt || '').substring(0, 10)}
                              </span>
                            </td>

                            <td className="p-3">
                              <span className="font-bold text-slate-900 block uppercase">
                                {r.personalData.fullName}
                              </span>

                              <span className="text-[11px] font-mono text-slate-500">
                                NISN: {r.personalData.nisn}
                              </span>
                            </td>

                            <td className="p-3">
                              <span className="font-semibold text-slate-800 block">
                                {r.majorChoice.firstChoice}
                              </span>

                              <span className="text-[10px] text-slate-400">
                                Pilihan 2: {r.majorChoice.secondChoice}
                              </span>
                            </td>

                            <td className="p-3">
                              <span className="text-slate-700">
                                {r.schoolOrigin.schoolName}
                              </span>
                            </td>

                            <td className="p-3 font-mono">
                              {phoneDigits ? (
                                <a
                                  href={`https://wa.me/${phoneDigits}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-700 hover:underline flex items-center gap-1"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {phone}
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusModalStudent(r);
                                  setNewStatus(r.status);
                                  setStatusNote(r.statusNote || '');
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide hover:opacity-80 transition ${
                                  r.status === 'DITERIMA'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : r.status === 'DIBATALKAN'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : r.status === 'VERIFIKASI_BERKAS'
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                                title="Klik untuk mengubah status"
                              >
                                {r.status}
                              </button>
                            </td>

                            <td className="p-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">

                                <button
                                  type="button"
                                  onClick={() => setViewStudent(r)}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                                  title="Lihat Profil & Berkas Lengkap"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onPrintCard(r)}
                                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                                  title="Cetak Bukti A4"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onOpenNotificationModal(r)}
                                  className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                                  title="Kirim Notifikasi WA / Email"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditStudent(
                                      JSON.parse(JSON.stringify(r))
                                    )
                                  }
                                  className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
                                  title="Ubah Data Pendaftar"
                                >
                                  <FileEdit className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleInitiateDelete(r)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Hapus Data Pendaftar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-slate-400"
                        >
                          Tidak ada data pendaftar yang sesuai dengan
                          pencarian atau filter yang dipilih.
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}

              {filteredRegistrants.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between flex-wrap gap-3 p-4 border-t border-slate-100">

                  <p className="text-xs text-slate-500">
                    Halaman {currentPage} dari {totalPages}
                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Sebelumnya
                    </button>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Berikutnya
                    </button>

                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ===================================================
            TAB ANALITIK
        =================================================== */}

        {activeTab === 'analitik' && (
          <AnalyticsDashboard
            registrants={localRegistrants}
            majors={majors}
            waves={waves}
            logs={logs}
          />
        )}

        {/* ===================================================
            TAB LOG AKTIVITAS
        =================================================== */}

        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">

            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Log Riwayat Transaksi & Aktivitas Sistem SPMB
            </h3>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">

              {logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="py-3 flex items-start justify-between gap-4 text-xs"
                  >

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.type === 'REGISTRATION'
                              ? 'bg-blue-100 text-blue-800'
                              : log.type === 'STATUS_CHANGE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.type === 'DELETE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.action}
                        </span>

                        {log.targetId && (
                          <span className="font-mono text-slate-500 font-semibold">
                            {log.targetId}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-800 break-words">
                        {log.details}
                      </p>

                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Dilakukan oleh: {log.performedBy}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-8 text-xs">
                  Belum ada riwayat aktivitas.
                </p>
              )}

            </div>
          </div>
        )}

      </div>

      {/* =====================================================
          MODAL KONFIRMASI HAPUS
      ===================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-center text-slate-900">
              Konfirmasi Hapus Data Pendaftar
            </h3>

            <p className="text-xs text-center text-slate-600 mt-1 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus data calon siswa ini?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs mb-5 space-y-1.5">

              <div>
                <strong>Nama Siswa:</strong>{' '}
                <span className="font-bold uppercase">
                  {deleteTarget.personalData.fullName}
                </span>
              </div>

              <div>
                <strong>No. Pendaftaran:</strong>{' '}
                <span className="font-mono text-blue-700 font-bold">
                  {deleteTarget.registrationNumber}
                </span>
              </div>

              <div>
                <strong>Pilihan Jurusan:</strong>{' '}
                {deleteTarget.majorChoice.firstChoice}
              </div>

              <div>
                <strong>Asal SMP/MTs:</strong>{' '}
                {deleteTarget.schoolOrigin.schoolName}
              </div>

            </div>

            <div className="flex gap-2">

              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isActionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}

                <span>
                  {isActionLoading ? 'Menghapus...' : 'Ya, Hapus'}
                </span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL DETAIL PENDAFTAR
      ===================================================== */}

      {viewStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">

          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto p-6 max-h-[90vh] overflow-y-auto">

            <button
              type="button"
              onClick={() => setViewStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b">

              <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden border shrink-0">

                {viewStudent.documents.photoUrl ? (
                  <img
                    src={viewStudent.documents.photoUrl}
                    alt="Foto siswa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                    Foto 3x4
                  </div>
                )}

              </div>

              <div className="min-w-0">
                <span className="font-mono font-bold text-blue-700 text-xs">
                  {viewStudent.registrationNumber}
                </span>

                <h3 className="font-extrabold text-lg uppercase text-slate-900 break-words">
                  {viewStudent.personalData.fullName}
                </h3>

                <p className="text-xs text-slate-500">
                  NISN: {viewStudent.personalData.nisn} | NIK:{' '}
                  {viewStudent.personalData.nik || '-'}
                </p>

                <div className="mt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      viewStudent.status === 'DITERIMA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewStudent.status === 'DIBATALKAN'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {viewStudent.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">

              <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">

                <div>
                  <strong>Jurusan 1:</strong>{' '}
                  {viewStudent.majorChoice.firstChoice}
                </div>

                <div>
                  <strong>Jurusan 2:</strong>{' '}
                  {viewStudent.majorChoice.secondChoice}
                </div>

                <div>
                  <strong>Asal Sekolah:</strong>{' '}
                  {viewStudent.schoolOrigin.schoolName}
                </div>

                <div>
                  <strong>Nilai Rata-rata:</strong>{' '}
                  {viewStudent.schoolOrigin.averageScore || '-'}
                </div>

                <div>
                  <strong>No WhatsApp:</strong>{' '}
                  {viewStudent.personalData.phoneWhatsApp}
                </div>

                <div>
                  <strong>Email:</strong>{' '}
                  {viewStudent.personalData.email || '-'}
                </div>

                <div className="sm:col-span-2">
                  <strong>Alamat:</strong>{' '}
                  {viewStudent.personalData.address}
                </div>

                <div>
                  <strong>Nama Orang Tua:</strong>{' '}
                  {viewStudent.parentData.fatherName ||
                    viewStudent.parentData.motherName ||
                    '-'}
                </div>

                <div>
                  <strong>Kontak Ortu:</strong>{' '}
                  {viewStudent.parentData.fatherPhone ||
                    viewStudent.parentData.motherPhone ||
                    '-'}
                </div>

              </div>

              {/* BERKAS LAMPIRAN */}

              <div>
                <span className="font-bold text-slate-800 block mb-2">
                  Berkas Persyaratan Diunggah:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">

                  <div className="p-2 border rounded-xl">
                    <span className="text-[10px] font-bold block mb-1">
                      Kartu Keluarga
                    </span>

                    {viewStudent.documents.familyCardUrl ? (
                      <a
                        href={viewStudent.documents.familyCardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold block text-xs underline"
                      >
                        Lihat KK
                      </a>
                    ) : (
                      <span className="text-slate-400">Belum ada</span>
                    )}
                  </div>

                  <div className="p-2 border rounded-xl">
                    <span className="text-[10px] font-bold block mb-1">
                      Akta Lahir
                    </span>

                    {viewStudent.documents.birthCertUrl ? (
                      <a
                        href={viewStudent.documents.birthCertUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold block text-xs underline"
                      >
                        Lihat Akta
                      </a>
                    ) : (
                      <span className="text-slate-400">Belum ada</span>
                    )}
                  </div>

                  <div className="p-2 border rounded-xl">
                    <span className="text-[10px] font-bold block mb-1">
                      KTP Orang Tua
                    </span>

                    {viewStudent.documents.parentKtpUrl ? (
                      <a
                        href={viewStudent.documents.parentKtpUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold block text-xs underline"
                      >
                        Lihat KTP
                      </a>
                    ) : (
                      <span className="text-slate-400">Belum ada</span>
                    )}
                  </div>

                  <div className="p-2 border rounded-xl">
                    <span className="text-[10px] font-bold block mb-1">
                      Ijazah / SKL
                    </span>

                    {viewStudent.documents.reportOrDiplomaUrl ? (
                      <a
                        href={viewStudent.documents.reportOrDiplomaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold block text-xs underline"
                      >
                        Lihat SKL
                      </a>
                    ) : (
                      <span className="text-slate-400">Belum ada</span>
                    )}
                  </div>

                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end gap-2">

              <button
                type="button"
                onClick={() => {
                  onPrintCard(viewStudent);
                  setViewStudent(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Cetak Bukti A4
              </button>

              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL UBAH STATUS
      ===================================================== */}

      {statusModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">

            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => setStatusModalStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Ubah Status Pendaftaran Siswa
            </h3>

            <p className="text-xs text-slate-500 mb-4">
              {statusModalStudent.personalData.fullName} (
              {statusModalStudent.registrationNumber})
            </p>

            <form
              onSubmit={handleConfirmStatus}
              className="space-y-4 text-xs"
            >

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Status Baru:
                </label>

                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(
                      e.target.value as StudentRegistration['status']
                    )
                  }
                  disabled={isActionLoading}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="DITERIMA">
                    DITERIMA (Lolos Seleksi)
                  </option>

                  <option value="VERIFIKASI_BERKAS">
                    VERIFIKASI_BERKAS (Lengkapi Dokumen)
                  </option>

                  <option value="PENDING">
                    PENDING (Menunggu Evaluasi)
                  </option>

                  <option value="DIBATALKAN">
                    DIBATALKAN (Tidak Memenuhi Syarat)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan / Alasan untuk Siswa:
                </label>

                <textarea
                  rows={3}
                  placeholder="Masukkan catatan untuk siswa..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  disabled={isActionLoading}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => setStatusModalStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow transition"
                >
                  {isActionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}

                  <span>
                    {isActionLoading ? 'Menyimpan...' : 'Simpan Status'}
                  </span>
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL EDIT DATA PENDAFTAR
      ===================================================== */}

      {editStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">

          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto p-6 max-h-[90vh] overflow-y-auto">

            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => setEditStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Edit Data Pendaftar
            </h3>

            <p className="text-xs text-slate-500 mb-4">
              Nomor Registrasi:{' '}
              <span className="font-mono text-blue-700 font-bold">
                {editStudent.registrationNumber}
              </span>
            </p>

            <form
              onSubmit={handleSaveStudentEdit}
              className="space-y-4 text-xs"
            >

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa
                  </label>

                  <input
                    type="text"
                    required
                    value={editStudent.personalData.fullName}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        personalData: {
                          ...editStudent.personalData,
                          fullName: e.target.value,
                        },
                      })
                    }
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NISN
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={editStudent.personalData.nisn}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        personalData: {
                          ...editStudent.personalData,
                          nisn: e.target.value,
                        },
                      })
                    }
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>

              </div>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jurusan Pilihan 1
                  </label>

                  <select
                    value={editStudent.majorChoice.firstChoice}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        majorChoice: {
                          ...editStudent.majorChoice,
                          firstChoice: e.target.value,
                        },
                      })
                    }
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-blue-900"
                  >
                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. WhatsApp
                  </label>

                  <input
                    type="text"
                    required
                    value={editStudent.personalData.phoneWhatsApp}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        personalData: {
                          ...editStudent.personalData,
                          phoneWhatsApp: e.target.value,
                        },
                      })
                    }
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>

              </div>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Asal Sekolah (SMP/MTs)
                  </label>

                  <input
                    type="text"
                    required
                    value={editStudent.schoolOrigin.schoolName}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        schoolOrigin: {
                          ...editStudent.schoolOrigin,
                          schoolName: e.target.value,
                        },
                      })
                    }
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nilai Rapor / Ujian
                  </label>

                  <input
                    type="text"
                    value={editStudent.schoolOrigin.averageScore || ''}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        schoolOrigin: {
                          ...editStudent.schoolOrigin,
                          averageScore: e.target.value,
                        },
                      })
                    }
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>

              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Domisili Siswa
                </label>

                <input
                  type="text"
                  value={editStudent.personalData.address || ''}
                  onChange={(e) =>
                    setEditStudent({
                      ...editStudent,
                      personalData: {
                        ...editStudent.personalData,
                        address: e.target.value,
                      },
                    })
                  }
                  disabled={isActionLoading}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Ayah / Ibu
                  </label>

                  <input
                    type="text"
                    value={
                      editStudent.parentData.fatherName ||
                      editStudent.parentData.motherName ||
                      ''
                    }
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        parentData: {
                          ...editStudent.parentData,
                          fatherName: e.target.value,
                        },
                      })
                    }
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Pendaftaran
                  </label>

                  <select
                    value={editStudent.status}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        status: e.target.value as StudentRegistration['status'],
                      })
                    }
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    <option value="DITERIMA">DITERIMA</option>
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIKASI_BERKAS">
                      VERIFIKASI_BERKAS
                    </option>
                    <option value="DIBATALKAN">DIBATALKAN</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow transition"
                >
                  {isActionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}

                  <span>
                    {isActionLoading
                      ? 'Menyimpan...'
                      : 'Simpan Perubahan'}
                  </span>
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
