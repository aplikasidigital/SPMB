/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MajorProgram, AdmissionTrack, FeeCategory, AdminAccount } from '../types/spmb';
import { StorageService } from '../services/storageService';
import { 
  GraduationCap, 
  Plus, 
  FileEdit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Code2, 
  Network, 
  Wrench, 
  Palette, 
  Briefcase, 
  Coins, 
  Tag, 
  DollarSign, 
  Layers, 
  ShieldAlert, 
  X,
  Search,
  BookOpen,
  RefreshCw,
  Save
} from 'lucide-react';

interface Props {
  majors: MajorProgram[];
  activeAdmin: AdminAccount;
  onRefreshData?: () => void;
}

export const MajorManagementModule: React.FC<Props> = ({
  majors,
  activeAdmin,
  onRefreshData,
}) => {
  // Navigation tabs: 'majors' | 'tracks' | 'fees'
  const [activeSubTab, setActiveSubTab] = useState<'majors' | 'tracks' | 'fees'>('majors');
  const [localMajors, setLocalMajors] = useState<MajorProgram[]>(majors);
  const [localTracks, setLocalTracks] = useState<AdmissionTrack[]>(StorageService.getTracks());
  const [localFees, setLocalFees] = useState<FeeCategory[]>(StorageService.getFees());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Search filter
  const [search, setSearch] = useState('');

  // Major Modal State
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<MajorProgram | null>(null);
  const [deleteMajorTarget, setDeleteMajorTarget] = useState<MajorProgram | null>(null);

  // Major Form State
  const [mCode, setMCode] = useState('');
  const [mName, setMName] = useState('');
  const [mShortDesc, setMShortDesc] = useState('');
  const [mFullDesc, setMFullDesc] = useState('');
  const [mQuota, setMQuota] = useState<number>(72);
  const [mColor, setMColor] = useState('from-blue-600 to-indigo-600');
  const [mIcon, setMIcon] = useState('Code2');
  const [mCareers, setMCareers] = useState('');
  const [mFacilities, setMFacilities] = useState('');
  const [mBanner, setMBanner] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80');
  const [majorError, setMajorError] = useState('');

  // Track Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<AdmissionTrack | null>(null);
  const [deleteTrackTarget, setDeleteTrackTarget] = useState<AdmissionTrack | null>(null);
  const [tCode, setTCode] = useState('');
  const [tName, setTName] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tReqs, setTReqs] = useState('');
  const [tDiscount, setTDiscount] = useState('');
  const [tQuota, setTQuota] = useState<number>(50);

  // Fee Modal State
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeCategory | null>(null);
  const [deleteFeeTarget, setDeleteFeeTarget] = useState<FeeCategory | null>(null);
  const [fName, setFName] = useState('');
  const [fAmount, setFAmount] = useState('');
  const [fPeriod, setFPeriod] = useState<FeeCategory['period']>('Satu Kali');
  const [fDesc, setFDesc] = useState('');
  const [fMandatory, setFMandatory] = useState(true);
  const [fNotes, setFNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- MAJOR CRUD ---
  const handleOpenAddMajor = () => {
    setEditingMajor(null);
    setMCode('');
    setMName('');
    setMShortDesc('');
    setMFullDesc('');
    setMQuota(72);
    setMColor('from-blue-600 to-indigo-600');
    setMIcon('Code2');
    setMCareers('Web Developer, Mobile Programmer, UI/UX Designer');
    setMFacilities('Lab Komputer Core i7, Smart Classroom, Internet 500 Mbps');
    setMBanner('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80');
    setMajorError('');
    setIsMajorModalOpen(true);
  };

  const handleOpenEditMajor = (major: MajorProgram) => {
    setEditingMajor(major);
    setMCode(major.code);
    setMName(major.name);
    setMShortDesc(major.shortDesc);
    setMFullDesc(major.fullDesc);
    setMQuota(major.quota);
    setMColor(major.color);
    setMIcon(major.icon);
    setMCareers(major.careers.join(', '));
    setMFacilities(major.facilities.join(', '));
    setMBanner(major.bannerImage);
    setMajorError('');
    setIsMajorModalOpen(true);
  };

  const handleSaveMajor = (e: React.FormEvent) => {
    e.preventDefault();
    setMajorError('');

    if (!mName.trim() || !mCode.trim()) {
      setMajorError('Nama jurusan dan kode program keahlian wajib diisi!');
      return;
    }

    const careersArray = mCareers.split(',').map(s => s.trim()).filter(Boolean);
    const facilitiesArray = mFacilities.split(',').map(s => s.trim()).filter(Boolean);

    setIsSaving(true);
    try {
      if (editingMajor) {
        const updated = StorageService.updateMajor(
          editingMajor.id,
          {
            code: mCode.trim(),
            name: mName.trim(),
            shortDesc: mShortDesc.trim(),
            fullDesc: mFullDesc.trim(),
            quota: mQuota,
            color: mColor,
            icon: mIcon,
            careers: careersArray,
            facilities: facilitiesArray,
            bannerImage: mBanner.trim(),
          },
          activeAdmin.fullName
        );
        if (updated) showToast(`✓ Jurusan "${updated.name}" berhasil diperbarui.`);
      } else {
        const created = StorageService.addMajor(
          {
            code: mCode.trim(),
            name: mName.trim(),
            shortDesc: mShortDesc.trim(),
            fullDesc: mFullDesc.trim(),
            quota: mQuota,
            color: mColor,
            icon: mIcon,
            careers: careersArray,
            facilities: facilitiesArray,
            bannerImage: mBanner.trim(),
          },
          activeAdmin.fullName
        );
        showToast(`✓ Jurusan baru "${created.name}" berhasil ditambahkan.`);
      }

      setIsMajorModalOpen(false);
      setLocalMajors(StorageService.getMajors());
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setMajorError(err?.message || 'Gagal menyimpan data jurusan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteMajor = () => {
    if (!deleteMajorTarget) return;
    const ok = StorageService.deleteMajor(deleteMajorTarget.id, activeAdmin.fullName);
    if (ok) {
      setLocalMajors(StorageService.getMajors());
      showToast(`Jurusan "${deleteMajorTarget.name}" berhasil dihapus.`);
      if (onRefreshData) onRefreshData();
    }
    setDeleteMajorTarget(null);
  };

  // --- ADMISSION TRACKS CRUD ---
  const handleOpenAddTrack = () => {
    setEditingTrack(null);
    setTCode('BARU');
    setTName('');
    setTDesc('');
    setTReqs('Ijazah SMP/MTs, Kartu Keluarga, Pas Foto 3x4');
    setTDiscount('Bebas Formulir');
    setTQuota(50);
    setIsTrackModalOpen(true);
  };

  const handleOpenEditTrack = (t: AdmissionTrack) => {
    setEditingTrack(t);
    setTCode(t.code);
    setTName(t.name);
    setTDesc(t.description);
    setTReqs(t.requirements.join(', '));
    setTDiscount(t.discountInfo || '');
    setTQuota(t.quota || 50);
    setIsTrackModalOpen(true);
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return;

    const reqsArray = tReqs.split(',').map(s => s.trim()).filter(Boolean);

    if (editingTrack) {
      StorageService.updateTrack(
        editingTrack.id,
        {
          code: tCode.trim().toUpperCase(),
          name: tName.trim(),
          description: tDesc.trim(),
          requirements: reqsArray,
          discountInfo: tDiscount.trim(),
          quota: tQuota,
          isActive: true,
        },
        activeAdmin.fullName
      );
      showToast(`Jalur "${tName}" berhasil diperbarui.`);
    } else {
      StorageService.addTrack(
        {
          code: tCode.trim().toUpperCase(),
          name: tName.trim(),
          description: tDesc.trim(),
          requirements: reqsArray,
          discountInfo: tDiscount.trim(),
          quota: tQuota,
          isActive: true,
        },
        activeAdmin.fullName
      );
      showToast(`Jalur pendaftaran "${tName}" berhasil ditambahkan.`);
    }

    setIsTrackModalOpen(false);
    setLocalTracks(StorageService.getTracks());
    if (onRefreshData) onRefreshData();
  };

  const handleConfirmDeleteTrack = () => {
    if (!deleteTrackTarget) return;
    StorageService.deleteTrack(deleteTrackTarget.id, activeAdmin.fullName);
    setLocalTracks(StorageService.getTracks());
    showToast(`Jalur "${deleteTrackTarget.name}" berhasil dihapus.`);
    setDeleteTrackTarget(null);
    if (onRefreshData) onRefreshData();
  };

  // --- FEE CATEGORIES CRUD ---
  const handleOpenAddFee = () => {
    setEditingFee(null);
    setFName('');
    setFAmount('Rp 500.000');
    setFPeriod('Satu Kali');
    setFDesc('');
    setFMandatory(true);
    setFNotes('');
    setIsFeeModalOpen(true);
  };

  const handleOpenEditFee = (f: FeeCategory) => {
    setEditingFee(f);
    setFName(f.name);
    setFAmount(f.amount);
    setFPeriod(f.period);
    setFDesc(f.description);
    setFMandatory(f.isMandatory);
    setFNotes(f.notes || '');
    setIsFeeModalOpen(true);
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim() || !fAmount.trim()) return;

    if (editingFee) {
      StorageService.updateFee(
        editingFee.id,
        {
          name: fName.trim(),
          amount: fAmount.trim(),
          period: fPeriod,
          description: fDesc.trim(),
          isMandatory: fMandatory,
          notes: fNotes.trim(),
        },
        activeAdmin.fullName
      );
      showToast(`Komponen biaya "${fName}" diperbarui.`);
    } else {
      StorageService.addFee(
        {
          name: fName.trim(),
          amount: fAmount.trim(),
          period: fPeriod,
          description: fDesc.trim(),
          isMandatory: fMandatory,
          notes: fNotes.trim(),
        },
        activeAdmin.fullName
      );
      showToast(`Komponen biaya "${fName}" ditambahkan.`);
    }

    setIsFeeModalOpen(false);
    setLocalFees(StorageService.getFees());
    if (onRefreshData) onRefreshData();
  };

  const handleConfirmDeleteFee = () => {
    if (!deleteFeeTarget) return;
    StorageService.deleteFee(deleteFeeTarget.id, activeAdmin.fullName);
    setLocalFees(StorageService.getFees());
    showToast(`Komponen biaya "${deleteFeeTarget.name}" berhasil dihapus.`);
    setDeleteFeeTarget(null);
    if (onRefreshData) onRefreshData();
  };

  // Color preset options
  const colorPresets = [
    { label: 'Biru - Indigo (Teknologi / RPL)', val: 'from-blue-600 to-indigo-600' },
    { label: 'Cyan - Teal (Jaringan / TKJ)', val: 'from-cyan-600 to-teal-600' },
    { label: 'Amber - Orange (Otomotif / TKRO)', val: 'from-amber-600 to-orange-600' },
    { label: 'Ungu - Pink (Desain / DKV)', val: 'from-purple-600 to-pink-600' },
    { label: 'Emerald - Hijau (Perkantoran / MPLB)', val: 'from-emerald-600 to-teal-700' },
    { label: 'Rose - Merah (Akuntansi / AKL)', val: 'from-rose-600 to-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Tab Navigation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                Manajemen Jurusan & Data Tambahan
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                Kurikulum Merdeka
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola Program Keahlian (Jurusan), Jalur Pendaftaran Siswa Baru, dan Kategori Biaya & Beasiswa.
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('majors')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
              activeSubTab === 'majors'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Jurusan Keahlian ({localMajors.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tracks')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
              activeSubTab === 'tracks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Jalur Pendaftaran ({localTracks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('fees')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
              activeSubTab === 'fees'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Kategori Biaya ({localFees.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: JURUSAN / PROGRAM KEAHLIAN */}
      {/* ========================================================================= */}
      {activeSubTab === 'majors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari program keahlian / kode jurusan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddMajor}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Jurusan Baru</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {localMajors
              .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()))
              .map((major) => {
                const fillPercent = Math.min(100, Math.round(((major.filledCount || 0) / major.quota) * 100));

                return (
                  <div
                    key={major.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      {/* Banner Image & Gradient Accent */}
                      <div className="h-28 relative overflow-hidden bg-slate-900">
                        <img 
                          src={major.bannerImage} 
                          alt={major.name} 
                          className="w-full h-full object-cover opacity-60" 
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${major.color} opacity-80 mix-blend-multiply`} />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[11px] font-black text-slate-900 shadow">
                          {major.code}
                        </div>
                        <div className="absolute top-3 right-3 bg-slate-950/70 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold">
                          Kuota: {major.quota} Siswa
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                          {major.name}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {major.shortDesc}
                        </p>

                        {/* Quota Progress */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] text-slate-500 font-bold">Pendaftar Terverifikasi:</span>
                            <span className="font-mono font-bold text-blue-700">
                              {major.filledCount || 0} / {major.quota} ({fillPercent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${major.color} transition-all duration-500`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Careers Preview */}
                        {major.careers && major.careers.length > 0 && (
                          <div className="text-[11px] text-slate-500">
                            <strong className="text-slate-700 font-bold block mb-1">Peluang Karir / Profesi:</strong>
                            <div className="flex flex-wrap gap-1">
                              {major.careers.slice(0, 3).map((c, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] text-slate-700 font-medium">
                                  {c}
                                </span>
                              ))}
                              {major.careers.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-semibold self-center">
                                  +{major.careers.length - 3} lainnya
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">ID: {major.id}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMajor(major)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                          title="Ubah Data Jurusan"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteMajorTarget(major)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Hapus Jurusan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: JALUR PENDAFTARAN (ADMISSION TRACKS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'tracks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Daftar Jalur Masuk SPMB SMK Lentera Bangsa 2
              </h3>
              <p className="text-xs text-slate-500">
                Kelola persyaratan berkas, kuota per jalur, dan beasiswa/potongan biaya khusus.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddTrack}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Jalur Pendaftaran</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {localTracks.map((track) => (
              <div 
                key={track.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                      {track.code}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Kuota: <strong>{track.quota || 50} Siswa</strong>
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">
                    {track.name}
                  </h4>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {track.description}
                  </p>

                  {/* Requirements List */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-3 space-y-1">
                    <strong className="block text-[10px] uppercase font-bold text-slate-700">Persyaratan Khusus:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {track.requirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {track.discountInfo && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{track.discountInfo}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {track.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTrack(track)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Ubah Jalur"
                    >
                      <FileEdit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTrackTarget(track)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Hapus Jalur"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: KATEGORI BIAYA & BEASISWA */}
      {/* ========================================================================= */}
      {activeSubTab === 'fees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Struktur Biaya Sekolah & Program Beasiswa
              </h3>
              <p className="text-xs text-slate-500">
                Informasi rincian biaya pendaftaran, seragam, SPP, dan dana sarana secara transparan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddFee}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Komponen Biaya</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-bold text-[11px]">
                    <th className="p-3.5 pl-5">Nama Biaya</th>
                    <th className="p-3.5">Nominal / Tarif</th>
                    <th className="p-3.5">Periode Pembayaran</th>
                    <th className="p-3.5">Keterangan & Rincian</th>
                    <th className="p-3.5 text-center">Sifat</th>
                    <th className="p-3.5 text-right pr-5">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-5">
                        <span className="font-bold text-slate-900 block">{fee.name}</span>
                        {fee.notes && <span className="text-[10px] text-amber-700 font-medium">{fee.notes}</span>}
                      </td>
                      <td className="p-3.5 font-bold font-mono text-emerald-800 text-sm">
                        {fee.amount}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border">
                          {fee.period}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs">
                        {fee.description}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          fee.isMandatory ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {fee.isMandatory ? 'Wajib' : 'Opsional'}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditFee(fee)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteFeeTarget(fee)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD / EDIT MAJOR --- */}
      {isMajorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsMajorModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              {editingMajor ? 'Edit Program Keahlian (Jurusan)' : 'Tambah Jurusan Keahlian Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Isi data detail kurikulum, kuota penerimaan, dan fasilitas laboratorium.
            </p>

            {majorError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{majorError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMajor} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kode Singkat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PPLG / RPL"
                    value={mCode}
                    onChange={(e) => setMCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Jurusan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pengembangan Perangkat Lunak & Gim"
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ringkasan kompetensi yang dipelajari siswa..."
                  value={mShortDesc}
                  onChange={(e) => setMShortDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Lengkap Kurikulum</label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan keahlian terstandar industri..."
                  value={mFullDesc}
                  onChange={(e) => setMFullDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Kuota Siswa:</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={mQuota}
                    onChange={(e) => setMQuota(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warna Aksen Tampilan:</label>
                  <select
                    value={mColor}
                    onChange={(e) => setMColor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    {colorPresets.map((p, i) => (
                      <option key={i} value={p.val}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Peluang Karir Lulusan (Pisahkan koma):</label>
                <input
                  type="text"
                  placeholder="Contoh: Web Developer, Mobile Programmer, UI/UX Designer"
                  value={mCareers}
                  onChange={(e) => setMCareers(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fasilitas Laboratorium (Pisahkan koma):</label>
                <input
                  type="text"
                  placeholder="Contoh: Lab Komputer Core i7, Smart Classroom, Internet 500 Mbps"
                  value={mFacilities}
                  onChange={(e) => setMFacilities(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Gambar Banner / Foto Workshop:</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={mBanner}
                  onChange={(e) => setMBanner(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsMajorModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaving ? 'Menyimpan...' : (editingMajor ? 'Simpan Perubahan' : 'Tambahkan Jurusan')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD / EDIT TRACK --- */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsTrackModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              {editingTrack ? 'Edit Jalur Pendaftaran' : 'Tambah Jalur Pendaftaran Baru'}
            </h3>
            <form onSubmit={handleSaveTrack} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode</label>
                  <input
                    type="text"
                    required
                    value={tCode}
                    onChange={(e) => setTCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nama Jalur</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jalur Prestasi Olahraga"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Jalur</label>
                <textarea
                  rows={2}
                  value={tDesc}
                  onChange={(e) => setTDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Persyaratan Dokumen (Pisahkan Koma):</label>
                <input
                  type="text"
                  placeholder="Piagam Juara, Rapor SMP, SKL"
                  value={tReqs}
                  onChange={(e) => setTReqs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Potongan / Beasiswa:</label>
                  <input
                    type="text"
                    placeholder="Bebas SPP 6 Bulan"
                    value={tDiscount}
                    onChange={(e) => setTDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alokasi Kuota:</label>
                  <input
                    type="number"
                    value={tQuota}
                    onChange={(e) => setTQuota(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsTrackModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow"
                >
                  Simpan Jalur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADD / EDIT FEE --- */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsFeeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              {editingFee ? 'Edit Komponen Biaya' : 'Tambah Komponen Biaya Sekolah'}
            </h3>
            <form onSubmit={handleSaveFee} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Biaya / Komponen</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paket Seragam & Atribut"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal / Tarif</label>
                  <input
                    type="text"
                    required
                    placeholder="Rp 500.000"
                    value={fAmount}
                    onChange={(e) => setFAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold font-mono text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Periode</label>
                  <select
                    value={fPeriod}
                    onChange={(e) => setFPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    <option value="Satu Kali">Satu Kali</option>
                    <option value="Per Bulan">Per Bulan</option>
                    <option value="Per Semester">Per Semester</option>
                    <option value="Per Tahun">Per Tahun</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi & Rincian</label>
                <textarea
                  rows={2}
                  value={fDesc}
                  onChange={(e) => setFDesc(e.target.value)}
                  placeholder="Rincian item yang didapatkan siswa..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan / Subsidi</label>
                <input
                  type="text"
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  placeholder="Dapat dicicil, gratis gelombang 1, dll."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-amber-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow"
                >
                  Simpan Biaya
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODALS --- */}
      {deleteMajorTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-center text-slate-900">
              Hapus Jurusan {deleteMajorTarget.name}?
            </h3>
            <p className="text-xs text-center text-slate-600 mt-1 mb-5">
              Program keahlian ini akan dihapus dari pilihan pendaftaran siswa. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteMajorTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMajor}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Ya, Hapus Jurusan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTrackTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-center text-slate-900">
              Hapus Jalur Pendaftaran {deleteTrackTarget.name}?
            </h3>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setDeleteTrackTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTrack}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteFeeTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-center text-slate-900">
              Hapus Biaya {deleteFeeTarget.name}?
            </h3>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setDeleteFeeTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFee}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
