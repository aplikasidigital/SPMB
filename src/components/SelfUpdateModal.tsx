/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentRegistration, SchoolSettings, MajorProgram } from '../types/spmb';
import { StorageService } from '../services/storageService';
import { 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  FileEdit, 
  Save, 
  MessageCircle, 
  Send, 
  User, 
  Phone, 
  Upload,
  Calendar,
  Sparkles
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  majors: MajorProgram[];
  onClose: () => void;
  onPrintCard: (reg: StudentRegistration) => void;
  onOpenNotificationModal: (reg: StudentRegistration) => void;
  initialQuery?: string;
}

export const SelfUpdateModal: React.FC<Props> = ({
  settings,
  majors,
  onClose,
  onPrintCard,
  onOpenNotificationModal,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [foundStudent, setFoundStudent] = useState<StudentRegistration | null>(
    initialQuery ? StorageService.findRegistrant(initialQuery) || null : null
  );
  const [searchError, setSearchError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit states
  const [formData, setFormData] = useState<Partial<StudentRegistration>>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setIsEditing(false);
    setSaveSuccess(false);

    if (!searchQuery.trim()) {
      setSearchError('Masukkan Nomor Pendaftaran atau Email yang didaftarkan.');
      return;
    }

    const res = StorageService.findRegistrant(searchQuery);
    if (!res) {
      setSearchError('Data pendaftaran tidak ditemukan. Mohon periksa kembali Nomor Pendaftaran atau Email Anda.');
      setFoundStudent(null);
    } else {
      setFoundStudent(res);
      setFormData(JSON.parse(JSON.stringify(res))); // clone
    }
  };

  const handleStartEdit = () => {
    if (foundStudent) {
      setFormData(JSON.parse(JSON.stringify(foundStudent)));
      setIsEditing(true);
      setSaveSuccess(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundStudent) return;

    const updated = StorageService.updateRegistrant(
      foundStudent.id,
      formData,
      `Siswa Mandiri (${foundStudent.personalData.fullName})`
    );

    if (updated) {
      setFoundStudent(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const handleFileUpload = (field: 'photoUrl' | 'familyCardUrl' | 'birthCertUrl' | 'parentKtpUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...(prev.documents || {}),
            [field]: reader.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Cek Status & Update Data Mandiri
              </h3>
              <p className="text-xs text-slate-400">
                Layanan mandiri peserta SPMB {settings.schoolName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Masukkan Nomor Pendaftaran (misal: LB2-2026-0001) atau Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
            >
              Cari Data
            </button>
          </form>

          {searchError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data Anda telah berhasil diperbarui dan tersimpan di database sekolah!</span>
            </div>
          )}
        </div>

        {/* Result Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {foundStudent ? (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                foundStudent.status === 'DITERIMA' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
                foundStudent.status === 'DIBATALKAN' ? 'bg-rose-50 border-rose-300 text-rose-950' :
                'bg-blue-50 border-blue-200 text-blue-950'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Status Seleksi:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${
                      foundStudent.status === 'DITERIMA' ? 'bg-emerald-600 text-white' :
                      foundStudent.status === 'DIBATALKAN' ? 'bg-rose-600 text-white' :
                      'bg-amber-500 text-slate-950'
                    }`}>
                      {foundStudent.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base sm:text-lg mt-1">
                    {foundStudent.personalData.fullName}
                  </h4>
                  <p className="text-xs font-mono text-slate-600">
                    No. Pendaftaran: <span className="font-bold text-blue-700">{foundStudent.registrationNumber}</span> | Gelombang: {foundStudent.wave}
                  </p>
                  {foundStudent.statusNote && (
                    <div className="mt-2 text-xs bg-white/80 p-2 rounded-lg border border-slate-200 text-slate-700">
                      <strong>Catatan Panitia:</strong> {foundStudent.statusNote}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onPrintCard(foundStudent)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Bukti PDF A4</span>
                  </button>
                  <button
                    onClick={() => onOpenNotificationModal(foundStudent)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Kirim WA Konfirmasi</span>
                  </button>
                </div>
              </div>

              {/* View / Edit Mode Switcher */}
              {!isEditing ? (
                /* --- VIEW DATA SUMMARY --- */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h5 className="font-bold text-sm text-slate-800">Rincian Data Pendaftaran Anda:</h5>
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Ubah / Perbarui Data Saya</span>
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 block text-xs uppercase border-b border-slate-200 pb-1">
                        Data Calon Siswa
                      </span>
                      <div><strong className="text-slate-500">NISN / NIK:</strong> {foundStudent.personalData.nisn} / {foundStudent.personalData.nik || '-'}</div>
                      <div><strong className="text-slate-500">Tempat, Tgl Lahir:</strong> {foundStudent.personalData.birthPlace}, {foundStudent.personalData.birthDate}</div>
                      <div><strong className="text-slate-500">Jenis Kelamin:</strong> {foundStudent.personalData.gender}</div>
                      <div><strong className="text-slate-500">No. WhatsApp:</strong> {foundStudent.personalData.phoneWhatsApp}</div>
                      <div><strong className="text-slate-500">Email:</strong> {foundStudent.personalData.email || '-'}</div>
                      <div><strong className="text-slate-500">Alamat:</strong> {foundStudent.personalData.address}</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 block text-xs uppercase border-b border-slate-200 pb-1">
                        Pilihan Jurusan & Asal Sekolah
                      </span>
                      <div><strong className="text-blue-700">Pilihan 1 (Utama):</strong> {foundStudent.majorChoice.firstChoice}</div>
                      <div><strong className="text-slate-600">Pilihan 2:</strong> {foundStudent.majorChoice.secondChoice}</div>
                      <div><strong className="text-slate-500">Asal SMP/MTs:</strong> {foundStudent.schoolOrigin.schoolName}</div>
                      <div><strong className="text-slate-500">Tahun Lulus:</strong> {foundStudent.schoolOrigin.graduationYear}</div>
                      <div><strong className="text-slate-500">Orang Tua:</strong> {foundStudent.parentData.fatherName || foundStudent.parentData.motherName}</div>
                      <div><strong className="text-slate-500">Telp Ortu:</strong> {foundStudent.parentData.fatherPhone || foundStudent.parentData.motherPhone}</div>
                    </div>
                  </div>

                  {/* Documents Preview */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-800 block text-xs uppercase mb-3">
                      Berkas yang Telah Diunggah:
                    </span>
                    <div className="grid grid-cols-4 gap-3 text-center text-xs">
                      <div>
                        <div className="w-16 h-20 mx-auto rounded-lg bg-white border border-slate-300 overflow-hidden mb-1 flex items-center justify-center">
                          {foundStudent.documents.photoUrl ? (
                            <img src={foundStudent.documents.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-400">Kosong</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600">Pas Foto 3x4</span>
                      </div>
                      <div>
                        <div className="w-16 h-20 mx-auto rounded-lg bg-white border border-slate-300 overflow-hidden mb-1 flex items-center justify-center">
                          {foundStudent.documents.familyCardUrl ? (
                            <img src={foundStudent.documents.familyCardUrl} alt="KK" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-400">Kosong</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600">Kartu Keluarga</span>
                      </div>
                      <div>
                        <div className="w-16 h-20 mx-auto rounded-lg bg-white border border-slate-300 overflow-hidden mb-1 flex items-center justify-center">
                          {foundStudent.documents.birthCertUrl ? (
                            <img src={foundStudent.documents.birthCertUrl} alt="Akta" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-400">Kosong</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600">Akta Lahir</span>
                      </div>
                      <div>
                        <div className="w-16 h-20 mx-auto rounded-lg bg-white border border-slate-300 overflow-hidden mb-1 flex items-center justify-center">
                          {foundStudent.documents.parentKtpUrl ? (
                            <img src={foundStudent.documents.parentKtpUrl} alt="KTP" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-400">Kosong</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600">KTP Ortu</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- EDIT FORM MANDIRI --- */
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h5 className="font-bold text-sm text-slate-900">Perbarui Data Anda:</h5>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={formData.personalData?.fullName || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          personalData: { ...formData.personalData!, fullName: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
                      <input
                        type="text"
                        value={formData.personalData?.phoneWhatsApp || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          personalData: { ...formData.personalData!, phoneWhatsApp: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.personalData?.email || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          personalData: { ...formData.personalData!, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pilihan Jurusan 1</label>
                      <select
                        value={formData.majorChoice?.firstChoice || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          majorChoice: { ...formData.majorChoice!, firstChoice: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-blue-900"
                      >
                        {majors.map((m) => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili</label>
                    <textarea
                      rows={2}
                      value={formData.personalData?.address || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        personalData: { ...formData.personalData!, address: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    ></textarea>
                  </div>

                  {/* Re-upload Document Slots */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Perbarui Berkas / Pas Foto:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label className="p-2 border border-dashed border-slate-300 bg-white rounded-lg text-center cursor-pointer hover:border-blue-500 block">
                        <span className="text-[10px] font-bold block text-slate-700">Pas Foto 3x4</span>
                        <span className="text-[9px] text-blue-600 block mt-1">+ Unggah Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload('photoUrl', e)}
                        />
                      </label>
                      <label className="p-2 border border-dashed border-slate-300 bg-white rounded-lg text-center cursor-pointer hover:border-blue-500 block">
                        <span className="text-[10px] font-bold block text-slate-700">Kartu Keluarga</span>
                        <span className="text-[9px] text-blue-600 block mt-1">+ Unggah KK</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload('familyCardUrl', e)}
                        />
                      </label>
                      <label className="p-2 border border-dashed border-slate-300 bg-white rounded-lg text-center cursor-pointer hover:border-blue-500 block">
                        <span className="text-[10px] font-bold block text-slate-700">Akta Lahir</span>
                        <span className="text-[9px] text-blue-600 block mt-1">+ Unggah Akta</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload('birthCertUrl', e)}
                        />
                      </label>
                      <label className="p-2 border border-dashed border-slate-300 bg-white rounded-lg text-center cursor-pointer hover:border-blue-500 block">
                        <span className="text-[10px] font-bold block text-slate-700">KTP Ortu</span>
                        <span className="text-[9px] text-blue-600 block mt-1">+ Unggah KTP</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload('parentKtpUrl', e)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan Data</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                Silakan cari data Anda terlebih dahulu menggunakan kolom pencarian di atas.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan Nomor Pendaftaran resmi atau alamat email saat mendaftar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
