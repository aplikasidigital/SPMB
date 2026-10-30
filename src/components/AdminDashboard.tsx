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
  ActivityLog 
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
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer, 
  Eye, 
  FileEdit, 
  Trash2, 
  Download, 
  Settings, 
  FileSpreadsheet, 
  UserPlus, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  X, 
  Check, 
  LogOut,
  ChevronDown,
  FileText,
  Save,
  AlertCircle,
  PlusCircle,
  Upload,
  User,
  School,
  Calendar,
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  GraduationCap,
  Layers,
  Megaphone
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

  // Local synced registrants state to guarantee instantaneous re-renders
  const [localRegistrants, setLocalRegistrants] = useState<StudentRegistration[]>(propRegistrants);

  useEffect(() => {
    setLocalRegistrants(propRegistrants);
  }, [propRegistrants]);

  // Main navigation tabs: Dashboard & Poster, Form Desk, Pendaftar, Gelombang, Jurusan, Analitik, Log
  const [activeTab, setActiveTab] = useState<'dashboard_poster' | 'spmb_form' | 'pendaftar' | 'waves_mgmt' | 'majors_mgmt' | 'analitik' | 'log'>('dashboard_poster');
  
  // Sub-view inside the SPMB menu: 'create' for new form input, 'crud_list' for managing/editing existing registrants
  const [spmbSubView, setSpmbSubView] = useState<'create' | 'crud_list'>('create');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterMajor, setFilterMajor] = useState<string>('ALL');
  const [filterWave, setFilterWave] = useState<string>('ALL');

  // In-app Delete Confirmation Modal State (Global Delete Bug Fix)
  const [deleteTarget, setDeleteTarget] = useState<StudentRegistration | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Detail Modal State
  const [viewStudent, setViewStudent] = useState<StudentRegistration | null>(null);

  // Status Change Modal State
  const [statusModalStudent, setStatusModalStudent] = useState<StudentRegistration | null>(null);
  const [newStatus, setNewStatus] = useState<StudentRegistration['status']>('DITERIMA');
  const [statusNote, setStatusNote] = useState('');

  // Edit Modal State
  const [editStudent, setEditStudent] = useState<StudentRegistration | null>(null);

  // --- STATE FOR ADMIN SPMB CREATE FORM ---
  const initialAdminFormData = {
    wave: waves.find(w => w.isActive)?.name || waves[0]?.name || 'Gelombang 1',
    status: 'DITERIMA' as StudentRegistration['status'],
    statusNote: 'Data pendaftar telah diverifikasi langsung oleh Admin Panitia SPMB.',
    personalData: {
      nik: '',
      nisn: '',
      fullName: '',
      gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
      birthPlace: 'Karawang',
      birthDate: '2009-01-01',
      religion: 'Islam',
      address: '',
      rtRw: '001/001',
      village: '',
      district: '',
      city: 'Kabupaten Karawang',
      province: 'Jawa Barat',
      phoneWhatsApp: '',
      email: '',
      hobby: '',
      ambition: '',
    },
    parentData: {
      fatherName: '',
      fatherJob: 'Karyawan Swasta',
      fatherPhone: '',
      motherName: '',
      motherJob: 'Ibu Rumah Tangga',
      motherPhone: '',
      guardianName: '',
      monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
      parentAddress: '',
    },
    schoolOrigin: {
      schoolName: '',
      schoolAddress: '',
      graduationYear: '2026',
      examNumberOrSkl: '',
      averageScore: '85.0',
    },
    majorChoice: {
      firstChoice: majors[0]?.name || 'Pengembangan Perangkat Lunak & Gim',
      secondChoice: majors[1]?.name || 'Teknik Jaringan Komputer & Telekomunikasi',
    },
    documents: {
      photoUrl: '',
      familyCardUrl: '',
      birthCertUrl: '',
      parentKtpUrl: '',
      reportOrDiplomaUrl: '',
      kipKpsUrl: '',
    },
    customFields: {} as Record<string, string>,
  };

  const [adminFormData, setAdminFormData] = useState(initialAdminFormData);
  const [formError, setFormError] = useState('');
  const [lastCreatedStudent, setLastCreatedStudent] = useState<StudentRegistration | null>(null);

  // Filter logic
  const filteredRegistrants = localRegistrants.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchQuery = !q ||
      r.personalData.fullName.toLowerCase().includes(q) ||
      r.registrationNumber.toLowerCase().includes(q) ||
      (r.personalData.nisn || '').toLowerCase().includes(q) ||
      (r.personalData.familyCardNumber || '').toLowerCase().includes(q) ||
      r.personalData.phoneWhatsApp.toLowerCase().includes(q);

    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchMajor = filterMajor === 'ALL' || r.majorChoice.firstChoice === filterMajor;
    const matchWave = filterWave === 'ALL' || r.wave === filterWave;

    return matchQuery && matchStatus && matchMajor && matchWave;
  });

  // Helper for notification toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --- DELETE LOGIC (FOOLPROOF FIX WITHOUT WINDOW.CONFIRM) ---
  const handleInitiateDelete = (student: StudentRegistration) => {
    setDeleteTarget(student);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    const targetRegNum = deleteTarget.registrationNumber;
    const targetName = deleteTarget.personalData.fullName;

    // 1. Delete from StorageService
    const success = StorageService.deleteRegistrant(targetId, activeAdmin.fullName);

    if (success) {
      // 2. Proactively update local state for immediate re-render
      setLocalRegistrants(prev => prev.filter(r => r.id !== targetId && r.registrationNumber !== targetRegNum));

      // 3. Notify parent app if callback provided
      if (onRefreshData) {
        onRefreshData();
      }

      showToast(`Data pendaftar "${targetName}" (${targetRegNum}) berhasil dihapus.`);
    }

    setDeleteTarget(null);
  };

  // --- STATUS UPDATE LOGIC ---
  const handleConfirmStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalStudent) return;
    setIsActionLoading(true);

    try {
      StorageService.updateRegistrantStatus(
        statusModalStudent.id,
        newStatus,
        statusNote,
        activeAdmin.fullName
      );

      // Update local state immediately
      setLocalRegistrants(prev => prev.map(r => {
        if (r.id === statusModalStudent.id || r.registrationNumber === statusModalStudent.registrationNumber) {
          return {
            ...r,
            status: newStatus,
            statusNote,
            verifiedBy: activeAdmin.fullName,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        }
        return r;
      }));

      if (onRefreshData) onRefreshData();

      showToast(`✓ Status ${statusModalStudent.personalData.fullName} berhasil diubah menjadi: ${newStatus}`);
      setStatusModalStudent(null);
    } catch (err: any) {
      showToast(`Gagal mengubah status: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- EDIT SAVE LOGIC ---
  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setIsActionLoading(true);

    try {
      const updated = StorageService.updateRegistrant(editStudent.id, editStudent, activeAdmin.fullName);

      if (updated) {
        setLocalRegistrants(prev => prev.map(r => r.id === updated.id ? updated : r));
        if (onRefreshData) onRefreshData();
        showToast(`✓ Data pendaftar ${updated.personalData.fullName} berhasil diperbarui.`);
      }

      setEditStudent(null);
    } catch (err: any) {
      showToast(`Gagal memperbarui data: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- ADMIN SPMB CREATE FORM SUBMIT ---
  const handleAdminFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!adminFormData.personalData.fullName.trim()) {
      setFormError('Nama lengkap calon siswa wajib diisi!');
      return;
    }
    if (!adminFormData.personalData.nisn.trim()) {
      setFormError('NISN calon siswa wajib diisi!');
      return;
    }
    if (!adminFormData.personalData.phoneWhatsApp.trim()) {
      setFormError('Nomor WhatsApp wajib diisi!');
      return;
    }
    if (!adminFormData.schoolOrigin.schoolName.trim()) {
      setFormError('Nama asal sekolah SMP/MTs wajib diisi!');
      return;
    }

    setIsActionLoading(true);
    try {
      const created = StorageService.addRegistrant({
        wave: adminFormData.wave,
        status: adminFormData.status,
        statusNote: adminFormData.statusNote,
        personalData: adminFormData.personalData,
        parentData: adminFormData.parentData,
        schoolOrigin: adminFormData.schoolOrigin,
        majorChoice: adminFormData.majorChoice,
        documents: adminFormData.documents,
        customFields: adminFormData.customFields,
      });

      // Update local state immediately
      setLocalRegistrants(prev => [created, ...prev]);
      if (onRefreshData) onRefreshData();

      setLastCreatedStudent(created);
      showToast(`✓ Pendaftaran baru (${created.registrationNumber}) atas nama ${created.personalData.fullName} berhasil disimpan!`);

      // Reset form
      setAdminFormData({
        ...initialAdminFormData,
        wave: adminFormData.wave,
      });
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan data pendaftar.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Admin form document upload handler
  const handleFileUpload = (field: keyof typeof adminFormData.documents, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Ukuran file maksimal 5MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [field]: reader.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                    Panel Panitia SPMB
                  </h1>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSuperAdmin
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-purple-400 text-slate-950'
                  }`}>
                    {isSuperAdmin ? 'ADMIN UTAMA' : 'ADMIN BAYANGAN'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {activeAdmin.fullName} ({settings.schoolName})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Spreadsheet & Excel Sync */}
              <button
                onClick={onOpenSpreadsheetSync}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Rekap Spreadsheet & Excel</span>
              </button>

              {/* Pengumuman & Promo Shortcut (Super Admin Only) */}
              {isSuperAdmin && (
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  title="Kelola Pengumuman, Brosur, Spanduk & Poster"
                >
                  <Megaphone className="w-4 h-4" />
                  <span className="hidden md:inline">Pengumuman & Promo</span>
                </button>
              )}

              {/* App Settings (Super Admin Only) */}
              {isSuperAdmin ? (
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-700"
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Pengaturan Aplikasi</span>
                </button>
              ) : (
                <div
                  title="Menu Pengaturan hanya dapat diakses oleh Admin Utama"
                  className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 italic px-2"
                >
                  (Pengaturan terkunci)
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl transition cursor-pointer border border-rose-800"
                title="Keluar dari sesi admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Admin Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex-wrap">
            {/* 1. Dashboard & Poster SPMB */}
            <button
              onClick={() => setActiveTab('dashboard_poster')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'dashboard_poster'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-300" />
              <span>Dashboard & Poster</span>
            </button>

            {/* 2. Formulir Pendaftaran Siswa Baru (SPMB / Admin Desk) */}
            <button
              onClick={() => setActiveTab('spmb_form')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'spmb_form'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>Admin Desk SPMB</span>
            </button>

            {/* 3. Data & Rekap Pendaftar */}
            <button
              onClick={() => setActiveTab('pendaftar')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'pendaftar'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Data Pendaftar ({localRegistrants.length})</span>
            </button>

            {/* 4. Manajemen Gelombang Pendaftaran */}
            <button
              onClick={() => setActiveTab('waves_mgmt')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'waves_mgmt'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Gelombang ({waves.length})</span>
            </button>

            {/* 5. Manajemen Jurusan & Data Tambahan */}
            <button
              onClick={() => setActiveTab('majors_mgmt')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'majors_mgmt'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>Jurusan & Biaya</span>
            </button>

            {/* 6. Analitik & Kuota */}
            <button
              onClick={() => setActiveTab('analitik')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'analitik'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Analitik</span>
            </button>

            {/* 7. Log Aktivitas */}
            <button
              onClick={() => setActiveTab('log')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'log'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Log ({logs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('spmb_form');
                setSpmbSubView('create');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Input Pendaftar Baru</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD & POSTER SPMB */}
        {/* ========================================================================= */}
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

        {/* ========================================================================= */}
        {/* TAB 2: FORMULIR INPUT DATA CALON SISWA BARU (ADMIN DESK) */}
        {/* ========================================================================= */}
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

        {/* ========================================================================= */}
        {/* TAB 3: MANAJEMEN GELOMBANG PENDAFTARAN */}
        {/* ========================================================================= */}
        {activeTab === 'waves_mgmt' && (
          <WaveManagementModule
            waves={waves}
            activeAdmin={activeAdmin}
            onRefreshData={onRefreshData}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MANAJEMEN JURUSAN & DATA TAMBAHAN */}
        {/* ========================================================================= */}
        {activeTab === 'majors_mgmt' && (
          <MajorManagementModule
            majors={majors}
            activeAdmin={activeAdmin}
            onRefreshData={onRefreshData}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DATA & REKAP PENDAFTAR (EXISTING FULL MANAGEMENT) */}
        {/* ========================================================================= */}
        {activeTab === 'pendaftar' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="grid sm:grid-cols-12 gap-3 items-center">
                {/* Search Field (5 cols) */}
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

                {/* Filter Jurusan (3 cols) */}
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

                {/* Filter Status (2 cols) */}
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

                {/* Filter Gelombang (2 cols) */}
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

              {/* Filter feedback */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>
                  Menampilkan <strong>{filteredRegistrants.length}</strong> dari total <strong>{localRegistrants.length}</strong> pendaftar
                </span>
                {(search || filterStatus !== 'ALL' || filterMajor !== 'ALL' || filterWave !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilterStatus('ALL');
                      setFilterMajor('ALL');
                      setFilterWave('ALL');
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Registrants Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                    {filteredRegistrants.length > 0 ? (
                      filteredRegistrants.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition">
                          {/* No Pendaftaran & Tgl */}
                          <td className="p-3 pl-4">
                            <span className="font-mono font-bold text-blue-900 block">{r.registrationNumber}</span>
                            <span className="text-[10px] text-slate-400">{r.createdAt.substring(0, 10)}</span>
                          </td>

                          {/* Nama & NISN */}
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block uppercase">{r.personalData.fullName}</span>
                            <span className="text-[11px] font-mono text-slate-500">NISN: {r.personalData.nisn}</span>
                          </td>

                          {/* Jurusan */}
                          <td className="p-3">
                            <span className="font-semibold text-slate-800 block">{r.majorChoice.firstChoice}</span>
                            <span className="text-[10px] text-slate-400">Pilihan 2: {r.majorChoice.secondChoice}</span>
                          </td>

                          {/* Asal Sekolah */}
                          <td className="p-3">
                            <span className="text-slate-700">{r.schoolOrigin.schoolName}</span>
                          </td>

                          {/* Kontak */}
                          <td className="p-3 font-mono">
                            <a
                              href={`https://wa.me/${r.personalData.phoneWhatsApp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {r.personalData.phoneWhatsApp}
                            </a>
                          </td>

                          {/* Status */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setStatusModalStudent(r);
                                setNewStatus(r.status);
                                setStatusNote(r.statusNote || '');
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide cursor-pointer hover:opacity-80 transition ${
                                r.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                r.status === 'DIBATALKAN' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                r.status === 'VERIFIKASI_BERKAS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                                'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                              title="Klik untuk mengubah status"
                            >
                              {r.status}
                            </button>
                          </td>

                          {/* Aksi */}
                          <td className="p-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Detail Berkas */}
                              <button
                                type="button"
                                onClick={() => setViewStudent(r)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Lihat Profil & Berkas Lengkap"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Cetak Bukti A4 */}
                              <button
                                type="button"
                                onClick={() => onPrintCard(r)}
                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Cetak Bukti A4 Presisi"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Notifikasi WhatsApp / Email */}
                              <button
                                type="button"
                                onClick={() => onOpenNotificationModal(r)}
                                className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Kirim Notifikasi WA / Email"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>

                              {/* Edit Data */}
                              <button
                                type="button"
                                onClick={() => setEditStudent(JSON.parse(JSON.stringify(r)))}
                                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Ubah Data Pendaftar"
                              >
                                <FileEdit className="w-4 h-4" />
                              </button>

                              {/* Hapus (Fixed with In-App Confirmation Modal) */}
                              <button
                                type="button"
                                onClick={() => handleInitiateDelete(r)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Hapus Data Pendaftar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Tidak ada data pendaftar yang sesuai dengan pencarian atau filter yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ANALITIK DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'analitik' && (
          <AnalyticsDashboard
            registrants={localRegistrants}
            majors={majors}
            waves={waves}
            logs={logs}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LOG AKTIVITAS */}
        {/* ========================================================================= */}
        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Log Riwayat Transaksi & Aktivitas Sistem SPMB
            </h3>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === 'REGISTRATION' ? 'bg-blue-100 text-blue-800' :
                        log.type === 'STATUS_CHANGE' ? 'bg-emerald-100 text-emerald-800' :
                        log.type === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {log.action}
                      </span>
                      {log.targetId && (
                        <span className="font-mono text-slate-500 font-semibold">{log.targetId}</span>
                      )}
                    </div>
                    <p className="text-slate-800">{log.details}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Dilakukan oleh: {log.performedBy}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- IN-APP CONFIRMATION MODAL FOR DELETING (FIX GLOBAL DELETE BUG) --- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-center text-slate-900">
              Konfirmasi Hapus Data Pendaftar
            </h3>
            <p className="text-xs text-center text-slate-600 mt-1 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus data calon siswa ini secara permanen dari server? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs mb-5 space-y-1.5">
              <div><strong className="text-slate-600">Nama Siswa:</strong> <span className="font-bold text-slate-900 uppercase">{deleteTarget.personalData.fullName}</span></div>
              <div><strong className="text-slate-600">No. Pendaftaran:</strong> <span className="font-mono text-blue-700 font-bold">{deleteTarget.registrationNumber}</span></div>
              <div><strong className="text-slate-600">Pilihan Jurusan:</strong> <span className="text-slate-800">{deleteTarget.majorChoice.firstChoice}</span></div>
              <div><strong className="text-slate-600">Asal SMP/MTs:</strong> <span className="text-slate-800">{deleteTarget.schoolOrigin.schoolName}</span></div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/25 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: VIEW STUDENT DETAIL & DOCUMENTS --- */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
              <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden border shrink-0">
                {viewStudent.documents.photoUrl ? (
                  <img src={viewStudent.documents.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">Foto 3x4</div>
                )}
              </div>
              <div>
                <span className="font-mono font-bold text-blue-700 text-xs">{viewStudent.registrationNumber}</span>
                <h3 className="font-extrabold text-lg uppercase text-slate-900">{viewStudent.personalData.fullName}</h3>
                <p className="text-xs text-slate-500">
                  NISN: {viewStudent.personalData.nisn} | NIK: {viewStudent.personalData.nik || '-'}
                </p>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    viewStudent.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-800' :
                    viewStudent.status === 'DIBATALKAN' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {viewStudent.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div><strong>Jurusan 1:</strong> {viewStudent.majorChoice.firstChoice}</div>
                <div><strong>Jurusan 2:</strong> {viewStudent.majorChoice.secondChoice}</div>
                <div><strong>Asal Sekolah:</strong> {viewStudent.schoolOrigin.schoolName}</div>
                <div><strong>Nilai Rata-rata:</strong> {viewStudent.schoolOrigin.averageScore || '-'}</div>
                <div><strong>No WhatsApp:</strong> {viewStudent.personalData.phoneWhatsApp}</div>
                <div><strong>Email:</strong> {viewStudent.personalData.email || '-'}</div>
                <div className="sm:col-span-2"><strong>Alamat:</strong> {viewStudent.personalData.address}</div>
                <div><strong>Nama Orang Tua:</strong> {viewStudent.parentData.fatherName || viewStudent.parentData.motherName}</div>
                <div><strong>Kontak Ortu:</strong> {viewStudent.parentData.fatherPhone || viewStudent.parentData.motherPhone}</div>
              </div>

              {/* Berkas Lampiran */}
              <div>
                <span className="font-bold text-slate-800 block mb-2">Berkas Persyaratan Diunggah:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2 border rounded-xl">
                    <span className="text-[10px] font-bold block mb-1">Kartu Keluarga</span>
                    {viewStudent.documents.familyCardUrl ? (
                      <a href={viewStudent.documents.familyCardUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold block text-xs underline">Lihat KK</a>
                    ) : (
                      <span className="text-slate-400">Belum ada</span>
                    )}
                  </div>
                  <div className="p-2 border rounded-xl">
                    <span className="text-[10px] font-bold block mb-1">Akta Lahir</span>
                    {viewStudent.documents.birthCertUrl ? (
                      <a href={viewStudent.documents.birthCertUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold block text-xs underline">Lihat Akta</a>
                    ) : (
                      <span className="text-slate-400">Belum ada</span>
                    )}
                  </div>
                  <div className="p-2 border rounded-xl">
                    <span className="text-[10px] font-bold block mb-1">KTP Orang Tua</span>
                    {viewStudent.documents.parentKtpUrl ? (
                      <a href={viewStudent.documents.parentKtpUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold block text-xs underline">Lihat KTP</a>
                    ) : (
                      <span className="text-slate-400">Belum ada</span>
                    )}
                  </div>
                  <div className="p-2 border rounded-xl">
                    <span className="text-[10px] font-bold block mb-1">Ijazah / SKL</span>
                    {viewStudent.documents.reportOrDiplomaUrl ? (
                      <a href={viewStudent.documents.reportOrDiplomaUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold block text-xs underline">Lihat SKL</a>
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
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Cetak Bukti A4
              </button>
              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: UBAH STATUS PENDAFTAR --- */}
      {statusModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setStatusModalStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Ubah Status Pendaftaran Siswa
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {statusModalStudent.personalData.fullName} ({statusModalStudent.registrationNumber})
            </p>

            <form onSubmit={handleConfirmStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Status Baru:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="DITERIMA">DITERIMA (Lolos Seleksi)</option>
                  <option value="VERIFIKASI_BERKAS">VERIFIKASI_BERKAS (Lengkapi Dokumen)</option>
                  <option value="PENDING">PENDING (Menunggu Evaluasi)</option>
                  <option value="DIBATALKAN">DIBATALKAN (Tidak Memenuhi Syarat)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Alasan untuk Siswa:</label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Selamat, berkas lengkap dan dinyatakan diterima pada Jurusan PPLG."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow cursor-pointer transition"
                >
                  {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isActionLoading ? 'Menyimpan...' : 'Simpan Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADMIN EDIT STUDENT FULL DATA (UPDATE) --- */}
      {editStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Edit Data Pendaftar (Admin Master Control - Update)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nomor Registrasi: <span className="font-mono text-blue-700 font-bold">{editStudent.registrationNumber}</span>
            </p>

            <form onSubmit={handleSaveStudentEdit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    value={editStudent.personalData.fullName}
                    onChange={(e) => setEditStudent({
                      ...editStudent,
                      personalData: { ...editStudent.personalData, fullName: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={editStudent.personalData.nisn}
                    onChange={(e) => setEditStudent({
                      ...editStudent,
                      personalData: { ...editStudent.personalData, nisn: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jurusan Pilihan 1</label>
                  <select
                    value={editStudent.majorChoice.firstChoice}
                    onChange={(e) => setEditStudent({
                      ...editStudent,
                      majorChoice: { ...editStudent.majorChoice, firstChoice: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-blue-900"
                  >
                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={editStudent.personalData.phoneWhatsApp}
                    onChange={(e) => setEditStudent({
                      ...editStudent,
                      personalData: { ...editStudent.personalData, phoneWhatsApp: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asal Sekolah (SMP/MTs)</label>
                  <input
                    type="text"
                    required
                    value={editStudent.schoolOrigin.schoolName}
                    onChange={(e) => setEditStudent({
                      ...editStudent,
                      schoolOrigin: { ...editStudent.schoolOrigin, schoolName: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Rapor / Ujian</label>
                  <input
                    type="text"
                    value={editStudent.schoolOrigin.averageScore || ''}
                    onChange={(e) => setEditStudent({
                      ...editStudent,
                      schoolOrigin: { ...editStudent.schoolOrigin, averageScore: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Domisili Siswa</label>
                <input
                  type="text"
                  value={editStudent.personalData.address || ''}
                  onChange={(e) => setEditStudent({
                    ...editStudent,
                    personalData: { ...editStudent.personalData, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Ayah / Ibu</label>
                  <input
                    type="text"
                    value={editStudent.parentData.fatherName || editStudent.parentData.motherName || ''}
                    onChange={(e) => setEditStudent({
                      ...editStudent,
                      parentData: { ...editStudent.parentData, fatherName: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pendaftaran</label>
                  <select
                    value={editStudent.status}
                    onChange={(e) => setEditStudent({
                      ...editStudent,
                      status: e.target.value as any
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    <option value="DITERIMA">DITERIMA</option>
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIKASI_BERKAS">VERIFIKASI_BERKAS</option>
                    <option value="DIBATALKAN">DIBATALKAN</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow cursor-pointer transition"
                >
                  {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isActionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
