/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Sparkles, 
  Users, 
  Check, 
  X, 
  Tag, 
  Flame, 
  ShieldAlert, 
  RotateCcw,
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
  const [localWaves, setLocalWaves] = useState<SchoolWave[]>(waves);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingWave(null);
    const nextNum = waves.length + 1;
    setFormName(`Gelombang ${nextNum} (Jalur Tambahan)`);
    setFormStartDate(new Date().toISOString().substring(0, 10));
    setFormStartTime('08:00');
    
    // Default end date 30 days later
    const end = new Date();
    end.setDate(end.getDate() + 30);
    setFormEndDate(end.toISOString().substring(0, 10));
    setFormEndTime('23:59');

    setFormIsActive(waves.length === 0);
    setFormBenefits('Diskon Biaya Seragam 25% + Prioritas Pilihan Jurusan');
    setFormQuota(100);
    setFormFee('Rp 150.000');
    setFormDiscountNote('Subsidi Uang Gedung');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wave: SchoolWave) => {
    setEditingWave(wave);
    setFormName(wave.name);
    setFormStartDate(wave.startDate);
    setFormStartTime(wave.startTime || '08:00');
    setFormEndDate(wave.endDate);
    setFormEndTime(wave.endTime || '23:59');
    setFormIsActive(wave.isActive);
    setFormBenefits(wave.benefits);
    setFormQuota(wave.quota || 150);
    setFormFee(wave.fee || 'Gratis Biaya Pendaftaran');
    setFormDiscountNote(wave.discountNote || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveWave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Nama gelombang pendaftaran wajib diisi!');
      return;
    }
    if (!formStartDate || !formEndDate) {
      setFormError('Waktu mulai dan waktu berakhir pendaftaran wajib diisi lengkap!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingWave) {
        // Update existing wave
        const updated = StorageService.updateWave(
          editingWave.id,
          {
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
          },
          activeAdmin.fullName
        );

        if (updated) {
          showToast(`✓ Gelombang "${updated.name}" berhasil diperbarui.`);
        }
      } else {
        // Create new wave
        const created = StorageService.addWave(
          {
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
          },
          activeAdmin.fullName
        );
        showToast(`✓ Gelombang baru "${created.name}" berhasil ditambahkan.`);
      }

      setIsModalOpen(false);
      setLocalWaves(StorageService.getWaves());
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan gelombang pendaftaran.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = (id: string, name: string) => {
    StorageService.setActiveWave(id, activeAdmin.fullName);
    setLocalWaves(StorageService.getWaves());
    showToast(`"${name}" sekarang menjadi Gelombang Pendaftaran Aktif!`);
    if (onRefreshData) onRefreshData();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const ok = StorageService.deleteWave(deleteTarget.id, activeAdmin.fullName);
    if (ok) {
      setLocalWaves(StorageService.getWaves());
      showToast(`Gelombang "${deleteTarget.name}" berhasil dihapus.`);
      if (onRefreshData) onRefreshData();
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                Manajemen Gelombang Pendaftaran
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                {localWaves.length} Gelombang
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur waktu mulai & berakhir pendaftaran (tanggal & jam), status aktif, kuota peserta, dan promo biaya.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Gelombang Baru</span>
        </button>
      </div>

      {/* Waves Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {localWaves.map((wave, idx) => (
          <div 
            key={wave.id}
            className={`rounded-3xl p-5 border transition duration-200 relative flex flex-col justify-between ${
              wave.isActive
                ? 'bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 border-blue-300 shadow-md ring-2 ring-blue-500/30'
                : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
            }`}
          >
            <div>
              {/* Status Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  #{idx + 1}
                </span>

                <div className="flex items-center gap-1.5">
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
              </div>

              {/* Wave Name */}
              <h3 className="font-extrabold text-slate-900 text-sm mb-3">
                {wave.name}
              </h3>

              {/* Start & End Times (MANDATORY REQUIREMENT) */}
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

              {/* Meta details */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                {wave.quota && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Kuota:</span>
                    <span className="font-bold text-slate-800">{wave.quota} Siswa</span>
                  </div>
                )}
                {wave.fee && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Biaya Formulir:</span>
                    <span className="font-semibold text-emerald-700">{wave.fee}</span>
                  </div>
                )}
                {wave.benefits && (
                  <div className="mt-2 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                    <strong className="block text-[10px] uppercase font-bold text-amber-800">Keuntungan & Diskon:</strong>
                    {wave.benefits}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {!wave.isActive ? (
                <button
                  type="button"
                  onClick={() => handleSetActive(wave.id, wave.name)}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer flex items-center gap-1"
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
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  title="Ubah Jadwal Gelombang"
                >
                  <FileEdit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(wave)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Hapus Gelombang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingWave ? 'Edit Gelombang Pendaftaran' : 'Tambah Gelombang Pendaftaran Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Pastikan informasi jadwal mulai dan berakhir pendaftaran terisi dengan teliti.
                </p>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveWave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Gelombang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gelombang 1 (Jalur Prestasi & Minat)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              {/* WAKTU MULAI PENDAFTARAN (Tanggal & Jam) */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <label className="block font-extrabold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Waktu Mulai Pendaftaran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Tanggal Mulai:</span>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Jam Mulai (WIB):</span>
                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* WAKTU BERAKHIR PENDAFTARAN (Tanggal & Jam) */}
              <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2">
                <label className="block font-extrabold text-rose-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  Waktu Berakhir Pendaftaran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Tanggal Berakhir:</span>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Jam Berakhir (WIB):</span>
                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Quota & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Kuota Siswa:</label>
                  <input
                    type="number"
                    min={1}
                    value={formQuota}
                    onChange={(e) => setFormQuota(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biaya Formulir:</label>
                  <input
                    type="text"
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    placeholder="Contoh: Gratis / Rp 150.000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-emerald-700"
                  />
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Benefit / Fasilitas Gelombang:</label>
                <textarea
                  rows={2}
                  placeholder="Diskon Seragam, Gratis Biaya Pendaftaran, dll."
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Active Toggle */}
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

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSaving ? 'Menyimpan...' : (editingWave ? 'Simpan Perubahan' : 'Tambahkan Gelombang')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-center text-slate-900">
              Hapus Gelombang Pendaftaran?
            </h3>
            <p className="text-xs text-center text-slate-600 mt-1 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus jadwal pendaftaran <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
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
