
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SchoolWave, AdminAccount } from '../types/spmb';
import { StorageService } from '../services/storageService';
import {
  Calendar,
  Clock,
  Plus,
  FileEdit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Flame,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';

interface Props {
  waves: SchoolWave[];
  activeAdmin: AdminAccount;
  onRefreshData?: () => void;
}

export const WaveManagementModule: React.FC<Props> = ({
  waves,
  activeAdmin,
  onRefreshData,
}) => {
  const [localWaves, setLocalWaves] = useState<SchoolWave[]>(waves || []);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWave, setEditingWave] = useState<SchoolWave | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolWave | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndDate, setFormEndDate] = useState('');
  const [formEndTime, setFormEndTime] = useState('23:59');
  const [formIsActive, setFormIsActive] = useState(false);
  const [formBenefits, setFormBenefits] = useState('');
  const [formQuota, setFormQuota] = useState<number>(150);
  const [formFee, setFormFee] = useState('Gratis Biaya Pendaftaran');
  const [formDiscountNote, setFormDiscountNote] = useState('Potongan DPP Rp 500.000');
  const [formError, setFormError] = useState('');

  // Sinkronisasi data dari parent
  useEffect(() => {
    setLocalWaves(Array.isArray(waves) ? waves : []);
  }, [waves]);

  // Membersihkan timer ketika komponen dilepas
  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToastMessage(msg);

    toastTimer.current = setTimeout(() => {
      setToastMessage(null);
      toastTimer.current = null;
    }, 3500);
  };

  // Menghasilkan tanggal lokal tanpa pergeseran UTC
  const getLocalDate = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getNextDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return getLocalDate(date);
  };

  const refreshWaves = () => {
    const latestWaves = StorageService.getWaves();
    setLocalWaves(Array.isArray(latestWaves) ? latestWaves : []);

    if (onRefreshData) {
      onRefreshData();
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormStartDate('');
    setFormStartTime('08:00');
    setFormEndDate('');
    setFormEndTime('23:59');
    setFormIsActive(false);
    setFormBenefits('');
    setFormQuota(150);
    setFormFee('Gratis Biaya Pendaftaran');
    setFormDiscountNote('Potongan DPP Rp 500.000');
    setFormError('');
  };

  const handleCloseModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingWave(null);
    setFormError('');
  };

  const handleOpenAdd = () => {
    if (isSaving) return;

    setEditingWave(null);
    resetForm();

    const currentWaves = Array.isArray(localWaves) ? localWaves : [];
    const nextNum = currentWaves.length + 1;

    setFormName(`Gelombang ${nextNum} (Jalur Tambahan)`);
    setFormStartDate(getLocalDate());
    setFormStartTime('08:00');
    setFormEndDate(getNextDate(30));
    setFormEndTime('23:59');

    setFormIsActive(currentWaves.length === 0);
    setFormBenefits('Diskon Biaya Seragam 25% + Prioritas Pilihan Jurusan');
    setFormQuota(100);
    setFormFee('Rp 150.000');
    setFormDiscountNote('Subsidi Uang Gedung');

    setIsModalOpen(true);
  };

  const handleOpenEdit = (wave: SchoolWave) => {
    if (isSaving) return;

    setEditingWave(wave);
    setFormName(wave.name || '');
    setFormStartDate(wave.startDate || '');
    setFormStartTime(wave.startTime || '08:00');
    setFormEndDate(wave.endDate || '');
    setFormEndTime(wave.endTime || '23:59');
    setFormIsActive(Boolean(wave.isActive));
    setFormBenefits(wave.benefits || '');
    setFormQuota(wave.quota ?? 150);
    setFormFee(wave.fee || 'Gratis Biaya Pendaftaran');
    setFormDiscountNote(wave.discountNote || '');
    setFormError('');

    setIsModalOpen(true);
  };

  // Validasi waktu pendaftaran
  const validateForm = (): boolean => {
    if (!formName.trim()) {
      setFormError('Nama gelombang pendaftaran wajib diisi!');
      return false;
    }

    if (!formStartDate || !formEndDate) {
      setFormError('Tanggal mulai dan berakhir pendaftaran wajib diisi!');
      return false;
    }

    if (!formStartTime || !formEndTime) {
      setFormError('Jam mulai dan berakhir pendaftaran wajib diisi!');
      return false;
    }

    if (formQuota < 1 || !Number.isFinite(formQuota)) {
      setFormError('Kuota peserta minimal 1 siswa!');
      return false;
    }

    const startDateTime = new Date(
      `${formStartDate}T${formStartTime}:00`
    ).getTime();

    const endDateTime = new Date(
      `${formEndDate}T${formEndTime}:00`
    ).getTime();

    if (
      !Number.isFinite(startDateTime) ||
      !Number.isFinite(endDateTime)
    ) {
      setFormError('Format tanggal atau jam tidak valid!');
      return false;
    }

    if (endDateTime <= startDateTime) {
      setFormError(
        'Waktu berakhir harus lebih besar daripada waktu mulai pendaftaran!'
      );
      return false;
    }

    return true;
  };

  const handleSaveWave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSaving) return;

    setFormError('');

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const waveData = {
        name: formName.trim(),
        startDate: formStartDate,
        startTime: formStartTime,
        endDate: formEndDate,
        endTime: formEndTime,
        isActive: formIsActive,
        benefits: formBenefits.trim(),
        quota: formQuota,
        fee: formFee.trim(),
        discountNote: formDiscountNote.trim(),
      };

      if (editingWave) {
        const updated = StorageService.updateWave(
          editingWave.id,
          waveData,
          activeAdmin.fullName
        );

        if (!updated) {
          throw new Error('Data gelombang tidak ditemukan atau gagal diperbarui.');
        }

        showToast(`✓ Gelombang "${updated.name}" berhasil diperbarui.`);
      } else {
        const created = StorageService.addWave(
          waveData,
          activeAdmin.fullName
        );

        if (!created) {
          throw new Error('Gagal menambahkan gelombang pendaftaran.');
        }

        showToast(
          `✓ Gelombang baru "${created.name}" berhasil ditambahkan.`
        );
      }

      setIsModalOpen(false);
      setEditingWave(null);
      refreshWaves();

    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan gelombang pendaftaran.';

      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = (id: string, name: string) => {
    if (isSaving || isDeleting) return;

    try {
      const result = StorageService.setActiveWave(
        id,
        activeAdmin.fullName
      );

      if (result === false) {
        throw new Error('Gagal mengaktifkan gelombang pendaftaran.');
      }

      refreshWaves();
      showToast(`"${name}" sekarang menjadi Gelombang Pendaftaran Aktif!`);

    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat mengaktifkan gelombang.'
      );
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);

    try {
      const ok = StorageService.deleteWave(
        deleteTarget.id,
        activeAdmin.fullName
      );

      if (!ok) {
        throw new Error('Gelombang gagal dihapus atau data tidak ditemukan.');
      }

      const deletedName = deleteTarget.name;

      setDeleteTarget(null);
      refreshWaves();

      showToast(`Gelombang "${deletedName}" berhasil dihapus.`);

    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menghapus gelombang.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-[100] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900">
                Manajemen Gelombang Pendaftaran
              </h2>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                {localWaves.length} Gelombang
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              Atur waktu mulai dan berakhir pendaftaran, status aktif,
              kuota peserta, serta promo biaya.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Gelombang Baru</span>
        </button>
      </div>

      {/* WAVE CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

        {localWaves.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-3" />

            <h3 className="font-bold text-slate-700 text-sm">
              Belum Ada Gelombang Pendaftaran
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Silakan tambahkan gelombang pendaftaran baru.
            </p>
          </div>
        ) : (
          localWaves.map((wave, idx) => (
            <div
              key={wave.id}
              className={`rounded-3xl p-5 border transition duration-200 relative flex flex-col justify-between ${
                wave.isActive
                  ? 'bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 border-blue-300 shadow-md ring-2 ring-blue-500/30'
                  : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <div>

                {/* STATUS */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </span>

                  {wave.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Flame className="w-3 h-3 text-emerald-600 animate-pulse" />
                      Sedang Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      Non-Aktif
                    </span>
                  )}
                </div>

                {/* NAME */}
                <h3 className="font-extrabold text-slate-900 text-sm mb-3">
                  {wave.name}
                </h3>

                {/* SCHEDULE */}
                <div className="space-y-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 text-xs mb-4">

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Waktu Mulai Pendaftaran
                      </span>

                      <span className="font-extrabold text-slate-800">
                        {wave.startDate}
                      </span>

                      <span className="font-mono text-emerald-700 text-[11px] font-bold ml-1.5">
                        Pukul {wave.startTime || '08:00'} WIB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Waktu Berakhir Pendaftaran
                      </span>

                      <span className="font-extrabold text-slate-800">
                        {wave.endDate}
                      </span>

                      <span className="font-mono text-rose-700 text-[11px] font-bold ml-1.5">
                        Pukul {wave.endTime || '23:59'} WIB
                      </span>
                    </div>
                  </div>

                </div>

                {/* DETAILS */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">

                  {wave.quota != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Kuota:</span>
                      <span className="font-bold text-slate-800">
                        {wave.quota} Siswa
                      </span>
                    </div>
                  )}

                  {wave.fee && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 shrink-0">Biaya Formulir:</span>
                      <span className="font-semibold text-emerald-700 text-right">
                        {wave.fee}
                      </span>
                    </div>
                  )}

                  {wave.benefits && (
                    <div className="mt-2 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                      <strong className="block text-[10px] uppercase font-bold text-amber-800">
                        Keuntungan & Diskon:
                      </strong>
                      {wave.benefits}
                    </div>
                  )}

                  {wave.discountNote && (
                    <div className="mt-2 p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                      <strong className="block text-[10px] uppercase font-bold">
                        Catatan Diskon:
                      </strong>
                      {wave.discountNote}
                    </div>
                  )}

                </div>
              </div>

              {/* ACTIONS */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">

                {!wave.isActive ? (
                  <button
                    type="button"
                    disabled={isSaving || isDeleting}
                    onClick={() => handleSetActive(wave.id, wave.name)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Jadikan Aktif</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aktif di Form Pendaftaran</span>
                  </span>
                )}

                <div className="flex items-center gap-1">

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(wave)}
                    disabled={isSaving || isDeleting}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-50 rounded-xl transition cursor-pointer"
                    title="Ubah Jadwal Gelombang"
                  >
                    <FileEdit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(wave)}
                    disabled={isSaving || isDeleting}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 rounded-xl transition cursor-pointer"
                    title="Hapus Gelombang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>

            </div>
          ))
        )}

      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">

            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSaving}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-8">

              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                <Calendar className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingWave
                    ? 'Edit Gelombang Pendaftaran'
                    : 'Tambah Gelombang Pendaftaran Baru'}
                </h3>

                <p className="text-xs text-slate-500">
                  Pastikan informasi jadwal mulai dan berakhir pendaftaran terisi dengan teliti.
                </p>
              </div>

            </div>

            {formError && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 mb-4"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={handleSaveWave}
              className="space-y-4 text-xs"
            >

              {/* NAME */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Gelombang <span className="text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Contoh: Gelombang 1 (Jalur Prestasi & Minat)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              {/* START DATE */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">

                <label className="block font-extrabold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Waktu Mulai Pendaftaran <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-2 gap-2">

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">
                      Tanggal Mulai:
                    </span>

                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">
                      Jam Mulai (WIB):
                    </span>

                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                </div>
              </div>

              {/* END DATE */}
              <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2">

                <label className="block font-extrabold text-rose-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  Waktu Berakhir Pendaftaran <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-2 gap-2">

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">
                      Tanggal Berakhir:
                    </span>

                    <input
                      type="date"
                      required
                      min={formStartDate || undefined}
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">
                      Jam Berakhir (WIB):
                    </span>

                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                </div>
              </div>

              {/* QUOTA & FEE */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Kuota Siswa:
                  </label>

                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={formQuota}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormQuota(value === '' ? 0 : Number(value));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Biaya Formulir:
                  </label>

                  <input
                    type="text"
                    maxLength={100}
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    placeholder="Contoh: Gratis / Rp 150.000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-emerald-700"
                  />
                </div>

              </div>

              {/* BENEFITS */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Benefit / Fasilitas Gelombang:
                </label>

                <textarea
                  rows={2}
                  maxLength={1000}
                  placeholder="Diskon Seragam, Gratis Biaya Pendaftaran, dll."
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* DISCOUNT NOTE */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Diskon:
                </label>

                <input
                  type="text"
                  maxLength={250}
                  value={formDiscountNote}
                  onChange={(e) => setFormDiscountNote(e.target.value)}
                  placeholder="Contoh: Subsidi Uang Gedung"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* ACTIVE TOGGLE */}
              <label className="flex items-center gap-2.5 p-3 bg-slate-50 border rounded-xl cursor-pointer">

                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />

                <span className="font-bold text-slate-800">
                  Tetapkan sebagai Gelombang Aktif saat ini
                </span>

              </label>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2 pt-3 border-t">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                >
                  {isSaving && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}

                  <span>
                    {isSaving
                      ? 'Menyimpan...'
                      : editingWave
                        ? 'Simpan Perubahan'
                        : 'Tambahkan Gelombang'}
                  </span>
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-center text-slate-900">
              Hapus Gelombang Pendaftaran?
            </h3>

            <p className="text-xs text-center text-slate-600 mt-1 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus jadwal pendaftaran{' '}
              <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="flex gap-2">

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
              >
                {isDeleting && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                )}

                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
