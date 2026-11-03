
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MajorProgram,
  AdmissionTrack,
  FeeCategory,
  AdminAccount
} from '../types/spmb';
import { StorageService } from '../services/storageService';
import {
  GraduationCap,
  Plus,
  FileEdit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DollarSign,
  Layers,
  ShieldAlert,
  X,
  Search,
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
  const [activeSubTab, setActiveSubTab] = useState<'majors' | 'tracks' | 'fees'>('majors');

  const [localMajors, setLocalMajors] = useState<MajorProgram[]>(majors);
  const [localTracks, setLocalTracks] = useState<AdmissionTrack[]>([]);
  const [localFees, setLocalFees] = useState<FeeCategory[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTrackSaving, setIsTrackSaving] = useState(false);
  const [isFeeSaving, setIsFeeSaving] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const [search, setSearch] = useState('');

  // MAJOR MODAL
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<MajorProgram | null>(null);
  const [deleteMajorTarget, setDeleteMajorTarget] = useState<MajorProgram | null>(null);

  const [mCode, setMCode] = useState('');
  const [mName, setMName] = useState('');
  const [mShortDesc, setMShortDesc] = useState('');
  const [mFullDesc, setMFullDesc] = useState('');
  const [mQuota, setMQuota] = useState(72);
  const [mColor, setMColor] = useState('from-blue-600 to-indigo-600');
  const [mIcon, setMIcon] = useState('Code2');
  const [mCareers, setMCareers] = useState('');
  const [mFacilities, setMFacilities] = useState('');
  const [mBanner, setMBanner] = useState(
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
  );
  const [majorError, setMajorError] = useState('');

  // TRACK MODAL
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<AdmissionTrack | null>(null);
  const [deleteTrackTarget, setDeleteTrackTarget] = useState<AdmissionTrack | null>(null);

  const [tCode, setTCode] = useState('');
  const [tName, setTName] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tReqs, setTReqs] = useState('');
  const [tDiscount, setTDiscount] = useState('');
  const [tQuota, setTQuota] = useState(50);

  // FEE MODAL
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeCategory | null>(null);
  const [deleteFeeTarget, setDeleteFeeTarget] = useState<FeeCategory | null>(null);

  const [fName, setFName] = useState('');
  const [fAmount, setFAmount] = useState('');
  const [fPeriod, setFPeriod] = useState<FeeCategory['period']>('Satu Kali');
  const [fDesc, setFDesc] = useState('');
  const [fMandatory, setFMandatory] = useState(true);
  const [fNotes, setFNotes] = useState('');

  // INITIALIZATION & CLEANUP
  useEffect(() => {
    mounted.current = true;

    const loadData = () => {
      try {
        setLocalMajors(StorageService.getMajors() || majors || []);
        setLocalTracks(StorageService.getTracks() || []);
        setLocalFees(StorageService.getFees() || []);
      } catch (error) {
        console.error('Gagal memuat data manajemen:', error);
        setLocalMajors(majors || []);
      }
    };

    loadData();

    return () => {
      mounted.current = false;

      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
        toastTimer.current = null;
      }
    };
  }, []);

  // Synchronize external major data
  useEffect(() => {
    if (Array.isArray(majors)) {
      setLocalMajors(majors);
    }
  }, [majors]);

  const refreshData = () => {
    try {
      setLocalMajors(StorageService.getMajors() || []);
      setLocalTracks(StorageService.getTracks() || []);
      setLocalFees(StorageService.getFees() || []);

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Gagal memperbarui data:', error);
      showToast('Gagal memperbarui tampilan data.');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      if (mounted.current) {
        setToastMessage(null);
      }
    }, 3500);
  };

  const colorPresets = [
    { label: 'Biru - Indigo (Teknologi / RPL)', val: 'from-blue-600 to-indigo-600' },
    { label: 'Cyan - Teal (Jaringan / TKJ)', val: 'from-cyan-600 to-teal-600' },
    { label: 'Amber - Orange (Otomotif / TKRO)', val: 'from-amber-600 to-orange-600' },
    { label: 'Ungu - Pink (Desain / DKV)', val: 'from-purple-600 to-pink-600' },
    { label: 'Emerald - Hijau (Perkantoran / MPLB)', val: 'from-emerald-600 to-teal-700' },
    { label: 'Rose - Merah (Akuntansi / AKL)', val: 'from-rose-600 to-red-600' },
  ];

  const filteredMajors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return localMajors.filter((major) =>
      !keyword ||
      (major.name || '').toLowerCase().includes(keyword) ||
      (major.code || '').toLowerCase().includes(keyword)
    );
  }, [localMajors, search]);

  // ==========================================
  // MAJOR CRUD
  // ==========================================

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
    setMCode(major.code || '');
    setMName(major.name || '');
    setMShortDesc(major.shortDesc || '');
    setMFullDesc(major.fullDesc || '');
    setMQuota(major.quota || 72);
    setMColor(major.color || 'from-blue-600 to-indigo-600');
    setMIcon(major.icon || 'Code2');
    setMCareers((major.careers || []).join(', '));
    setMFacilities((major.facilities || []).join(', '));
    setMBanner(major.bannerImage || '');
    setMajorError('');
    setIsMajorModalOpen(true);
  };

  const handleSaveMajor = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    setMajorError('');

    if (!mName.trim() || !mCode.trim()) {
      setMajorError('Nama jurusan dan kode program keahlian wajib diisi!');
      return;
    }

    if (!Number.isFinite(mQuota) || mQuota < 1) {
      setMajorError('Kuota siswa minimal 1.');
      return;
    }

    const data = {
      code: mCode.trim().toUpperCase(),
      name: mName.trim(),
      shortDesc: mShortDesc.trim(),
      fullDesc: mFullDesc.trim(),
      quota: mQuota,
      color: mColor,
      icon: mIcon,
      careers: mCareers.split(',').map(s => s.trim()).filter(Boolean),
      facilities: mFacilities.split(',').map(s => s.trim()).filter(Boolean),
      bannerImage: mBanner.trim(),
    };

    setIsSaving(true);

    try {
      if (editingMajor) {
        const updated = StorageService.updateMajor(
          editingMajor.id,
          data,
          activeAdmin.fullName
        );

        if (updated === false || updated == null) {
          throw new Error('Data jurusan gagal diperbarui.');
        }

        showToast(`Jurusan "${data.name}" berhasil diperbarui.`);
      } else {
        const created = StorageService.addMajor(
          data,
          activeAdmin.fullName
        );

        if (!created) {
          throw new Error('Data jurusan gagal ditambahkan.');
        }

        showToast(`Jurusan baru "${data.name}" berhasil ditambahkan.`);
      }

      setIsMajorModalOpen(false);
      refreshData();

    } catch (error: any) {
      console.error('Major CRUD Error:', error);
      setMajorError(error?.message || 'Gagal menyimpan data jurusan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteMajor = () => {
    if (!deleteMajorTarget) return;

    try {
      const ok = StorageService.deleteMajor(
        deleteMajorTarget.id,
        activeAdmin.fullName
      );

      if (!ok) {
        throw new Error('Jurusan gagal dihapus.');
      }

      showToast(`Jurusan "${deleteMajorTarget.name}" berhasil dihapus.`);
      refreshData();

    } catch (error: any) {
      console.error(error);
      showToast(error?.message || 'Gagal menghapus jurusan.');
    } finally {
      setDeleteMajorTarget(null);
    }
  };

  // ==========================================
  // ADMISSION TRACK CRUD
  // ==========================================

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

  const handleOpenEditTrack = (track: AdmissionTrack) => {
    setEditingTrack(track);
    setTCode(track.code || '');
    setTName(track.name || '');
    setTDesc(track.description || '');
    setTReqs((track.requirements || []).join(', '));
    setTDiscount(track.discountInfo || '');
    setTQuota(track.quota || 50);
    setIsTrackModalOpen(true);
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();

    if (isTrackSaving) return;

    if (!tName.trim() || !tCode.trim()) {
      showToast('Kode dan nama jalur wajib diisi.');
      return;
    }

    if (!Number.isFinite(tQuota) || tQuota < 1) {
      showToast('Kuota jalur minimal 1.');
      return;
    }

    setIsTrackSaving(true);

    try {
      const data = {
        code: tCode.trim().toUpperCase(),
        name: tName.trim(),
        description: tDesc.trim(),
        requirements: tReqs.split(',').map(s => s.trim()).filter(Boolean),
        discountInfo: tDiscount.trim(),
        quota: tQuota,
        isActive: true,
      };

      if (editingTrack) {
        const result = StorageService.updateTrack(
          editingTrack.id,
          data,
          activeAdmin.fullName
        );

        if (result === false) {
          throw new Error('Gagal memperbarui jalur pendaftaran.');
        }

        showToast(`Jalur "${data.name}" berhasil diperbarui.`);
      } else {
        const result = StorageService.addTrack(
          data,
          activeAdmin.fullName
        );

        if (!result) {
          throw new Error('Gagal menambahkan jalur pendaftaran.');
        }

        showToast(`Jalur "${data.name}" berhasil ditambahkan.`);
      }

      setIsTrackModalOpen(false);
      refreshData();

    } catch (error: any) {
      console.error('Track CRUD Error:', error);
      showToast(error?.message || 'Gagal menyimpan jalur.');
    } finally {
      setIsTrackSaving(false);
    }
  };

  const handleConfirmDeleteTrack = () => {
    if (!deleteTrackTarget) return;

    try {
      const result = StorageService.deleteTrack(
        deleteTrackTarget.id,
        activeAdmin.fullName
      );

      if (!result) {
        throw new Error('Gagal menghapus jalur pendaftaran.');
      }

      showToast(`Jalur "${deleteTrackTarget.name}" berhasil dihapus.`);
      refreshData();

    } catch (error: any) {
      console.error(error);
      showToast(error?.message || 'Gagal menghapus jalur.');
    } finally {
      setDeleteTrackTarget(null);
    }
  };

  // ==========================================
  // FEE CRUD
  // ==========================================

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

  const handleOpenEditFee = (fee: FeeCategory) => {
    setEditingFee(fee);
    setFName(fee.name || '');
    setFAmount(fee.amount || '');
    setFPeriod(fee.period);
    setFDesc(fee.description || '');
    setFMandatory(fee.isMandatory);
    setFNotes(fee.notes || '');
    setIsFeeModalOpen(true);
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();

    if (isFeeSaving) return;

    if (!fName.trim() || !fAmount.trim()) {
      showToast('Nama biaya dan nominal wajib diisi.');
      return;
    }

    setIsFeeSaving(true);

    try {
      const data = {
        name: fName.trim(),
        amount: fAmount.trim(),
        period: fPeriod,
        description: fDesc.trim(),
        isMandatory: fMandatory,
        notes: fNotes.trim(),
      };

      if (editingFee) {
        const result = StorageService.updateFee(
          editingFee.id,
          data,
          activeAdmin.fullName
        );

        if (result === false) {
          throw new Error('Gagal memperbarui komponen biaya.');
        }

        showToast(`Komponen biaya "${data.name}" diperbarui.`);
      } else {
        const result = StorageService.addFee(
          data,
          activeAdmin.fullName
        );

        if (!result) {
          throw new Error('Gagal menambahkan komponen biaya.');
        }

        showToast(`Komponen biaya "${data.name}" ditambahkan.`);
      }

      setIsFeeModalOpen(false);
      refreshData();

    } catch (error: any) {
      console.error('Fee CRUD Error:', error);
      showToast(error?.message || 'Gagal menyimpan komponen biaya.');
    } finally {
      setIsFeeSaving(false);
    }
  };

  const handleConfirmDeleteFee = () => {
    if (!deleteFeeTarget) return;

    try {
      const result = StorageService.deleteFee(
        deleteFeeTarget.id,
        activeAdmin.fullName
      );

      if (!result) {
        throw new Error('Gagal menghapus komponen biaya.');
      }

      showToast(`Komponen biaya "${deleteFeeTarget.name}" berhasil dihapus.`);
      refreshData();

    } catch (error: any) {
      console.error(error);
      showToast(error?.message || 'Gagal menghapus biaya.');
    } finally {
      setDeleteFeeTarget(null);
    }
  };

  // ==========================================
  // REUSABLE INPUT CLASS
  // ==========================================

  const inputClass =
    'w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';

  const closeAllModals = () => {
    if (isSaving || isTrackSaving || isFeeSaving) return;

    setIsMajorModalOpen(false);
    setIsTrackModalOpen(false);
    setIsFeeModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* TOAST */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-[100] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900">
                Manajemen Jurusan & Data Tambahan
              </h2>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                Kurikulum Merdeka
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              Kelola Program Keahlian, Jalur Pendaftaran Siswa Baru, dan Kategori Biaya & Beasiswa.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold w-full md:w-auto overflow-x-auto">

          <button type="button" onClick={() => setActiveSubTab('majors')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl shrink-0 ${activeSubTab === 'majors' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}>
            <GraduationCap className="w-4 h-4" />
            Jurusan ({localMajors.length})
          </button>

          <button type="button" onClick={() => setActiveSubTab('tracks')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl shrink-0 ${activeSubTab === 'tracks' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}>
            <Layers className="w-4 h-4" />
            Jalur ({localTracks.length})
          </button>

          <button type="button" onClick={() => setActiveSubTab('fees')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl shrink-0 ${activeSubTab === 'fees' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}>
            <DollarSign className="w-4 h-4" />
            Biaya ({localFees.length})
          </button>
        </div>
      </div>

      {/* ================================= */}
      {/* MAJOR LIST */}
      {/* ================================= */}

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

            <button type="button" onClick={handleOpenAddMajor}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
              <Plus className="w-4 h-4" />
              Tambah Jurusan Baru
            </button>
          </div>

          {filteredMajors.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">Data jurusan tidak ditemukan.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredMajors.map((major) => {
              const quota = Math.max(0, Number(major.quota) || 0);
              const filled = Math.max(0, Number(major.filledCount) || 0);

              const fillPercent = quota > 0
                ? Math.min(100, Math.round((filled / quota) * 100))
                : 0;

              return (
                <div key={major.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">

                  <div>
                    <div className="h-28 relative overflow-hidden bg-slate-900">

                      {major.bannerImage && (
                        <img
                          src={major.bannerImage}
                          alt={major.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}

                      <div className={`absolute inset-0 bg-gradient-to-t ${major.color || 'from-blue-600 to-indigo-600'} opacity-80 mix-blend-multiply`} />

                      <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-xl text-[11px] font-black text-slate-900">
                        {major.code}
                      </div>

                      <div className="absolute top-3 right-3 bg-slate-950/70 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold">
                        Kuota: {quota} Siswa
                      </div>
                    </div>

                    <div className="p-5 space-y-3">

                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {major.name}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {major.shortDesc}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">

                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] text-slate-500 font-bold">
                            Pendaftar Terverifikasi:
                          </span>

                          <span className="font-mono font-bold text-blue-700">
                            {filled} / {quota} ({fillPercent}%)
                          </span>
                        </div>

                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${major.color || 'from-blue-600 to-indigo-600'} transition-all duration-500`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>

                      {major.careers?.length > 0 && (
                        <div className="text-[11px] text-slate-500">

                          <strong className="text-slate-700 block mb-1">
                            Peluang Karir / Profesi:
                          </strong>

                          <div className="flex flex-wrap gap-1">
                            {major.careers.slice(0, 3).map((career, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] text-slate-700">
                                {career}
                              </span>
                            ))}

                            {major.careers.length > 3 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{major.careers.length - 3} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">

                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {major.id}
                    </span>

                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handleOpenEditMajor(major)}
                        title="Ubah Data Jurusan"
                        className="p-1.5 text-slate-600 hover:text-blue-600 rounded-xl">
                        <FileEdit className="w-4 h-4" />
                      </button>

                      <button type="button" onClick={() => setDeleteMajorTarget(major)}
                        title="Hapus Jurusan"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl">
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

      {/* ================================= */}
      {/* TRACK LIST */}
      {/* ================================= */}

      {activeSubTab === 'tracks' && (
        <div className="space-y-4">

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Daftar Jalur Masuk SPMB SMK Lentera Bangsa 2
              </h3>

              <p className="text-xs text-slate-500">
                Kelola persyaratan berkas, kuota per jalur, dan beasiswa.
              </p>
            </div>

            <button type="button" onClick={handleOpenAddTrack}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
              <Plus className="w-4 h-4" />
              Tambah Jalur Pendaftaran
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">

            {localTracks.map((track) => (
              <div key={track.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">

                <div>

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                      {track.code}
                    </span>

                    <span className="text-xs font-bold text-slate-500">
                      Kuota: {track.quota || 50} Siswa
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">
                    {track.name}
                  </h4>

                  <p className="text-xs text-slate-600 mb-3">
                    {track.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-2xl border text-xs mb-3">

                    <strong className="block text-[10px] uppercase mb-2">
                      Persyaratan Khusus:
                    </strong>

                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {(track.requirements || []).map((requirement, i) => (
                        <li key={i}>{requirement}</li>
                      ))}
                    </ul>
                  </div>

                  {track.discountInfo && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      {track.discountInfo}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t flex items-center justify-between">

                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {track.id}
                  </span>

                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleOpenEditTrack(track)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 rounded-xl">
                      <FileEdit className="w-4 h-4" />
                    </button>

                    <button type="button" onClick={() => setDeleteTrackTarget(track)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>

          {localTracks.length === 0 && (
            <div className="bg-white rounded-2xl border p-10 text-center text-sm text-slate-500">
              Belum ada data jalur pendaftaran.
            </div>
          )}
        </div>
      )}

      {/* ================================= */}
      {/* FEE LIST */}
      {/* ================================= */}

      {activeSubTab === 'fees' && (
        <div className="space-y-4">

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Struktur Biaya Sekolah & Program Beasiswa
              </h3>

              <p className="text-xs text-slate-500">
                Informasi rincian biaya pendaftaran, seragam, SPP, dan dana sarana.
              </p>
            </div>

            <button type="button" onClick={handleOpenAddFee}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
              <Plus className="w-4 h-4" />
              Tambah Komponen Biaya
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b uppercase font-bold text-[11px]">
                    <th className="p-3.5 pl-5">Nama Biaya</th>
                    <th className="p-3.5">Nominal</th>
                    <th className="p-3.5">Periode</th>
                    <th className="p-3.5">Keterangan</th>
                    <th className="p-3.5 text-center">Sifat</th>
                    <th className="p-3.5 text-right pr-5">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {localFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50">

                      <td className="p-3.5 pl-5">
                        <span className="font-bold text-slate-900 block">
                          {fee.name}
                        </span>

                        {fee.notes && (
                          <span className="text-[10px] text-amber-700">
                            {fee.notes}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-bold font-mono text-emerald-800">
                        {fee.amount}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">
                          {fee.period}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 max-w-xs">
                        {fee.description}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          fee.isMandatory
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {fee.isMandatory ? 'Wajib' : 'Opsional'}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1">

                          <button type="button" onClick={() => handleOpenEditFee(fee)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg">
                            <FileEdit className="w-4 h-4" />
                          </button>

                          <button type="button" onClick={() => setDeleteFeeTarget(fee)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>

            {localFees.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                Belum ada komponen biaya.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* MAJOR MODAL */}
      {/* ================================= */}

      {isMajorModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">

          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">

            <button type="button" onClick={closeAllModals}
              disabled={isSaving}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:opacity-40">
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
                <AlertCircle className="w-4 h-4 shrink-0" />
                {majorError}
              </div>
            )}

            <form onSubmit={handleSaveMajor} className="space-y-4 text-xs">

              <div className="grid grid-cols-3 gap-3">

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kode Singkat *
                  </label>

                  <input required value={mCode}
                    onChange={(e) => setMCode(e.target.value)}
                    placeholder="PPLG / RPL"
                    className={`${inputClass} font-bold uppercase`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Jurusan *
                  </label>

                  <input required value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder="Pengembangan Perangkat Lunak & Gim"
                    className={`${inputClass} font-bold`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Singkat
                </label>

                <textarea rows={2} value={mShortDesc}
                  onChange={(e) => setMShortDesc(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Lengkap Kurikulum
                </label>

                <textarea rows={3} value={mFullDesc}
                  onChange={(e) => setMFullDesc(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Kuota Siswa
                  </label>

                  <input type="number" min="1" required value={mQuota}
                    onChange={(e) => setMQuota(Math.max(0, Number(e.target.value) || 0))}
                    className={`${inputClass} font-bold font-mono`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Warna Aksen Tampilan
                  </label>

                  <select value={mColor}
                    onChange={(e) => setMColor(e.target.value)}
                    className={`${inputClass} font-semibold`}
                  >
                    {colorPresets.map((preset) => (
                      <option key={preset.val} value={preset.val}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Peluang Karir Lulusan (Pisahkan koma)
                </label>

                <input value={mCareers}
                  onChange={(e) => setMCareers(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fasilitas Laboratorium (Pisahkan koma)
                </label>

                <input value={mFacilities}
                  onChange={(e) => setMFacilities(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL Gambar Banner / Foto Workshop
                </label>

                <input type="url" value={mBanner}
                  onChange={(e) => setMBanner(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">

                <button type="button" onClick={closeAllModals}
                  disabled={isSaving}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Batal
                </button>

                <button type="submit" disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md">
                  {isSaving
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Save className="w-3.5 h-3.5" />
                  }

                  {isSaving ? 'Menyimpan...' : editingMajor ? 'Simpan Perubahan' : 'Tambahkan Jurusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* TRACK MODAL */}
      {/* ================================= */}

      {isTrackModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">

          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">

            <button type="button" onClick={closeAllModals}
              disabled={isTrackSaving}
              className="absolute top-4 right-4 p-2 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              {editingTrack ? 'Edit Jalur Pendaftaran' : 'Tambah Jalur Pendaftaran Baru'}
            </h3>

            <form onSubmit={handleSaveTrack} className="space-y-3.5 text-xs">

              <div className="grid grid-cols-3 gap-2">

                <div>
                  <label className="block font-bold mb-1">Kode</label>

                  <input required value={tCode}
                    onChange={(e) => setTCode(e.target.value)}
                    className={`${inputClass} font-bold uppercase`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold mb-1">Nama Jalur</label>

                  <input required value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    className={`${inputClass} font-bold`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Deskripsi Jalur</label>

                <textarea rows={2} value={tDesc}
                  onChange={(e) => setTDesc(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">
                  Persyaratan Dokumen (Pisahkan Koma)
                </label>

                <input value={tReqs}
                  onChange={(e) => setTReqs(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">

                <div>
                  <label className="block font-bold mb-1">
                    Potongan / Beasiswa
                  </label>

                  <input value={tDiscount}
                    onChange={(e) => setTDiscount(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Alokasi Kuota</label>

                  <input type="number" min="1" required value={tQuota}
                    onChange={(e) => setTQuota(Math.max(0, Number(e.target.value) || 0))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">

                <button type="button" onClick={closeAllModals}
                  disabled={isTrackSaving}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Batal
                </button>

                <button type="submit" disabled={isTrackSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 disabled:opacity-60 text-white font-bold rounded-xl">
                  {isTrackSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {isTrackSaving ? 'Menyimpan...' : 'Simpan Jalur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* FEE MODAL */}
      {/* ================================= */}

      {isFeeModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">

          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">

            <button type="button" onClick={closeAllModals}
              disabled={isFeeSaving}
              className="absolute top-4 right-4 p-2 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              {editingFee ? 'Edit Komponen Biaya' : 'Tambah Komponen Biaya Sekolah'}
            </h3>

            <form onSubmit={handleSaveFee} className="space-y-3.5 text-xs">

              <div>
                <label className="block font-bold mb-1">Nama Biaya / Komponen</label>

                <input required value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder="Contoh: Paket Seragam & Atribut"
                  className={`${inputClass} font-bold`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">

                <div>
                  <label className="block font-bold mb-1">Nominal / Tarif</label>

                  <input required value={fAmount}
                    onChange={(e) => setFAmount(e.target.value)}
                    placeholder="Rp 500.000"
                    className={`${inputClass} font-bold font-mono text-emerald-800`}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Periode</label>

                  <select value={fPeriod}
                    onChange={(e) => setFPeriod(e.target.value as FeeCategory['period'])}
                    className={`${inputClass} font-bold`}
                  >
                    <option value="Satu Kali">Satu Kali</option>
                    <option value="Per Bulan">Per Bulan</option>
                    <option value="Per Semester">Per Semester</option>
                    <option value="Per Tahun">Per Tahun</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Deskripsi & Rincian</label>

                <textarea rows={2} value={fDesc}
                  onChange={(e) => setFDesc(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">
                  Catatan Tambahan / Subsidi
                </label>

                <input value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  className={inputClass}
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border cursor-pointer">
                <input type="checkbox" checked={fMandatory}
                  onChange={(e) => setFMandatory(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="font-bold text-slate-700">
                  Komponen biaya wajib dibayarkan
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t">

                <button type="button" onClick={closeAllModals}
                  disabled={isFeeSaving}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Batal
                </button>

                <button type="submit" disabled={isFeeSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 disabled:opacity-60 text-white font-bold rounded-xl">
                  {isFeeSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {isFeeSaving ? 'Menyimpan...' : 'Simpan Biaya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* DELETE CONFIRMATION MODALS */}
      {/* ================================= */}

      {deleteMajorTarget && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-center text-slate-900">
              Hapus Jurusan {deleteMajorTarget.name}?
            </h3>

            <p className="text-xs text-center text-slate-600 mt-2 mb-5">
              Program keahlian ini akan dihapus dari pilihan pendaftaran siswa. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-2">

              <button type="button" onClick={() => setDeleteMajorTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Batal
              </button>

              <button type="button" onClick={handleConfirmDeleteMajor}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl">
                Ya, Hapus Jurusan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTrackTarget && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-center text-slate-900">
              Hapus Jalur Pendaftaran {deleteTrackTarget.name}?
            </h3>

            <div className="flex gap-2 mt-5">

              <button type="button" onClick={() => setDeleteTrackTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Batal
              </button>

              <button type="button" onClick={handleConfirmDeleteTrack}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteFeeTarget && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-center text-slate-900">
              Hapus Biaya {deleteFeeTarget.name}?
            </h3>

            <div className="flex gap-2 mt-5">

              <button type="button" onClick={() => setDeleteFeeTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Batal
              </button>

              <button type="button" onClick={handleConfirmDeleteFee}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
