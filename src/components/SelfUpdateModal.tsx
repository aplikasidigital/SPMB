
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StudentRegistration,
  SchoolSettings,
  MajorProgram,
} from '../types/spmb';
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
  Upload,
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  majors: MajorProgram[];
  onClose: () => void;
  onPrintCard: (reg: StudentRegistration) => void;
  onOpenNotificationModal: (reg: StudentRegistration) => void;
  initialQuery?: string;
}

type DocumentField =
  | 'photoUrl'
  | 'familyCardUrl'
  | 'birthCertUrl'
  | 'parentKtpUrl';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const SelfUpdateModal: React.FC<Props> = ({
  settings,
  majors,
  onClose,
  onPrintCard,
  onOpenNotificationModal,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [foundStudent, setFoundStudent] =
    useState<StudentRegistration | null>(null);

  const [searchError, setSearchError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] =
    useState<Partial<StudentRegistration>>({});

  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const fileReaderRef = useRef<FileReader[]>([]);

  // Membersihkan timer dan FileReader ketika komponen ditutup.
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }

      fileReaderRef.current.forEach((reader) => {
        if (reader.readyState === FileReader.LOADING) {
          reader.abort();
        }
      });

      fileReaderRef.current = [];
    };
  }, []);

  // Membuat salinan data secara aman.
  const cloneData = <T,>(data: T): T => {
    if (typeof structuredClone === 'function') {
      return structuredClone(data);
    }

    return JSON.parse(JSON.stringify(data));
  };

  // Pencarian data pendaftar.
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = searchQuery.trim();

    setSearchError('');
    setUploadError('');
    setIsEditing(false);
    setSaveSuccess(false);

    if (!query) {
      setSearchError(
        'Masukkan Nomor Pendaftaran atau Email yang didaftarkan.'
      );
      return;
    }

    try {
      const result = StorageService.findRegistrant(query);

      if (!result) {
        setFoundStudent(null);
        setFormData({});

        setSearchError(
          'Data pendaftaran tidak ditemukan. Mohon periksa kembali Nomor Pendaftaran atau Email Anda.'
        );

        return;
      }

      setFoundStudent(result);
      setFormData(cloneData(result));
    } catch (error) {
      console.error('Kesalahan pencarian data:', error);

      setSearchError(
        'Terjadi kesalahan saat mencari data. Silakan coba kembali.'
      );
    }
  };

  // Pencarian otomatis berdasarkan initialQuery.
  useEffect(() => {
    if (!initialQuery.trim()) return;

    try {
      const result = StorageService.findRegistrant(initialQuery.trim());

      if (result) {
        setFoundStudent(result);
        setFormData(cloneData(result));
      } else {
        setFoundStudent(null);
        setSearchError('Data pendaftaran tidak ditemukan.');
      }
    } catch (error) {
      console.error('Kesalahan pencarian otomatis:', error);
      setSearchError('Tidak dapat mengambil data pendaftaran.');
    }
  }, [initialQuery]);

  // Memulai proses edit.
  const handleStartEdit = () => {
    if (!foundStudent) return;

    setFormData(cloneData(foundStudent));
    setIsEditing(true);
    setSaveSuccess(false);
    setSearchError('');
    setUploadError('');
  };

  // Membatalkan proses edit.
  const handleCancelEdit = () => {
    if (foundStudent) {
      setFormData(cloneData(foundStudent));
    }

    setIsEditing(false);
    setUploadError('');
    setSearchError('');
  };

  // Memperbarui data personal.
  const updatePersonalData = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      personalData: {
        ...prev.personalData!,
        [field]: value,
      },
    }));
  };

  // Memperbarui pilihan jurusan.
  const updateMajorChoice = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      majorChoice: {
        ...prev.majorChoice!,
        [field]: value,
      },
    }));
  };

  // Mengunggah dokumen dengan validasi.
  const handleFileUpload = (
    field: DocumentField,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setUploadError('');

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar.');

      input.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(
        'Ukuran file maksimal 5 MB. Silakan pilih file yang lebih kecil.'
      );

      input.value = '';
      return;
    }

    const reader = new FileReader();

    fileReaderRef.current.push(reader);

    reader.onload = () => {
      if (!mountedRef.current) return;

      if (typeof reader.result !== 'string') {
        setUploadError('File gagal dibaca.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents!,
          [field]: reader.result as string,
        },
      }));
    };

    reader.onerror = () => {
      if (mountedRef.current) {
        setUploadError('Terjadi kesalahan saat membaca file.');
      }
    };

    reader.onabort = () => {
      // Proses pembacaan file dibatalkan.
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Kesalahan upload:', error);
      setUploadError('File tidak dapat diproses.');
    }

    input.value = '';
  };

  // Menyimpan perubahan data.
  const handleSaveEdit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!foundStudent || isSaving) return;

    const fullName = formData.personalData?.fullName?.trim();
    const phone = formData.personalData?.phoneWhatsApp?.trim();

    if (!fullName) {
      setSearchError('Nama lengkap wajib diisi.');
      return;
    }

    if (!phone) {
      setSearchError('Nomor WhatsApp wajib diisi.');
      return;
    }

    if (!formData.majorChoice?.firstChoice) {
      setSearchError('Pilihan jurusan pertama wajib diisi.');
      return;
    }

    setIsSaving(true);
    setSearchError('');

    try {
      // Data lama dipertahankan, hanya field yang diedit diperbarui.
      const updatedData = {
        ...foundStudent,
        ...formData,
        personalData: {
          ...foundStudent.personalData,
          ...formData.personalData,
        },
        majorChoice: {
          ...foundStudent.majorChoice,
          ...formData.majorChoice,
        },
        documents: {
          ...foundStudent.documents,
          ...formData.documents,
        },
      } as StudentRegistration;

      const updated = StorageService.updateRegistrant(
        foundStudent.id,
        updatedData,
        `Siswa Mandiri (${fullName})`
      );

      if (!updated) {
        setSearchError(
          'Data gagal disimpan. Silakan periksa kembali dan coba lagi.'
        );
        return;
      }

      setFoundStudent(updated);
      setFormData(cloneData(updated));
      setIsEditing(false);
      setSaveSuccess(true);

      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }

      successTimer.current = setTimeout(() => {
        if (mountedRef.current) {
          setSaveSuccess(false);
        }
      }, 4000);
    } catch (error) {
      console.error('Kesalahan penyimpanan:', error);

      setSearchError(
        'Terjadi kesalahan saat menyimpan data. Silakan coba kembali.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderDocument = (
    value: string | undefined,
    label: string,
    alt: string
  ) => (
    <div>
      <div className="w-16 h-20 mx-auto rounded-lg bg-white border border-slate-300 overflow-hidden mb-1 flex items-center justify-center">
        {value ? (
          <img
            src={value}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-slate-400">
            Kosong
          </span>
        )}
      </div>
      <span className="text-[11px] text-slate-600">
        {label}
      </span>
    </div>
  );

  const renderUpload = (
    field: DocumentField,
    label: string,
    buttonLabel: string
  ) => (
    <label className="p-2 border border-dashed border-slate-300 bg-white rounded-lg text-center cursor-pointer hover:border-blue-500 block">
      <span className="text-[10px] font-bold block text-slate-700">
        {label}
      </span>

      <span className="text-[9px] text-blue-600 block mt-1">
        + {buttonLabel}
      </span>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => handleFileUpload(field, e)}
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col max-h-[92vh]">

        {/* HEADER */}
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
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PENCARIAN */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

              <input
                type="text"
                placeholder="Masukkan Nomor Pendaftaran atau Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer shrink-0"
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

          {uploadError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Data Anda telah berhasil diperbarui dan tersimpan di database sekolah!
              </span>
            </div>
          )}
        </div>

        {/* AREA DATA */}
        <div className="p-6 overflow-y-auto flex-1">

          {foundStudent ? (
            <div className="space-y-6">

              {/* STATUS PENDAFTARAN */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  foundStudent.status === 'DITERIMA'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : foundStudent.status === 'DIBATALKAN'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-blue-50 border-blue-200 text-blue-950'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      Status Seleksi:
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${
                        foundStudent.status === 'DITERIMA'
                          ? 'bg-emerald-600 text-white'
                          : foundStudent.status === 'DIBATALKAN'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {foundStudent.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base sm:text-lg mt-1">
                    {foundStudent.personalData.fullName}
                  </h4>

                  <p className="text-xs font-mono text-slate-600">
                    No. Pendaftaran:{' '}
                    <span className="font-bold text-blue-700">
                      {foundStudent.registrationNumber}
                    </span>
                    {' | '}
                    Gelombang: {foundStudent.wave}
                  </p>

                  {foundStudent.statusNote && (
                    <div className="mt-2 text-xs bg-white/80 p-2 rounded-lg border border-slate-200 text-slate-700">
                      <strong>Catatan Panitia:</strong>{' '}
                      {foundStudent.statusNote}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPrintCard(foundStudent)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Bukti PDF A4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenNotificationModal(foundStudent)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Kirim WA Konfirmasi</span>
                  </button>
                </div>
              </div>

              {/* MODE TAMPIL DATA */}
              {!isEditing ? (
                <div className="space-y-4">

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 gap-2">
                    <h5 className="font-bold text-sm text-slate-800">
                      Rincian Data Pendaftaran Anda:
                    </h5>

                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Ubah Data Saya</span>
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">

                    {/* DATA SISWA */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 block text-xs uppercase border-b border-slate-200 pb-1">
                        Data Calon Siswa
                      </span>

                      <div>
                        <strong className="text-slate-500">NISN / NIK:</strong>{' '}
                        {foundStudent.personalData.nisn} / {foundStudent.personalData.nik || '-'}
                      </div>

                      <div>
                        <strong className="text-slate-500">Tempat, Tgl Lahir:</strong>{' '}
                        {foundStudent.personalData.birthPlace}, {foundStudent.personalData.birthDate}
                      </div>

                      <div>
                        <strong className="text-slate-500">Jenis Kelamin:</strong>{' '}
                        {foundStudent.personalData.gender}
                      </div>

                      <div>
                        <strong className="text-slate-500">No. WhatsApp:</strong>{' '}
                        {foundStudent.personalData.phoneWhatsApp}
                      </div>

                      <div>
                        <strong className="text-slate-500">Email:</strong>{' '}
                        {foundStudent.personalData.email || '-'}
                      </div>

                      <div>
                        <strong className="text-slate-500">Alamat:</strong>{' '}
                        {foundStudent.personalData.address}
                      </div>
                    </div>

                    {/* DATA JURUSAN DAN ORANG TUA */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 block text-xs uppercase border-b border-slate-200 pb-1">
                        Pilihan Jurusan & Asal Sekolah
                      </span>

                      <div>
                        <strong className="text-blue-700">Pilihan 1:</strong>{' '}
                        {foundStudent.majorChoice.firstChoice}
                      </div>

                      <div>
                        <strong className="text-slate-600">Pilihan 2:</strong>{' '}
                        {foundStudent.majorChoice.secondChoice}
                      </div>

                      <div>
                        <strong className="text-slate-500">Asal SMP/MTs:</strong>{' '}
                        {foundStudent.schoolOrigin.schoolName}
                      </div>

                      <div>
                        <strong className="text-slate-500">Tahun Lulus:</strong>{' '}
                        {foundStudent.schoolOrigin.graduationYear}
                      </div>

                      <div>
                        <strong className="text-slate-500">Orang Tua:</strong>{' '}
                        {foundStudent.parentData.fatherName || foundStudent.parentData.motherName}
                      </div>

                      <div>
                        <strong className="text-slate-500">Telp Ortu:</strong>{' '}
                        {foundStudent.parentData.fatherPhone || foundStudent.parentData.motherPhone}
                      </div>
                    </div>
                  </div>

                  {/* DOKUMEN */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-800 block text-xs uppercase mb-3">
                      Berkas yang Telah Diunggah:
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                      {renderDocument(
                        foundStudent.documents.photoUrl,
                        'Pas Foto 3x4',
                        'Foto siswa'
                      )}

                      {renderDocument(
                        foundStudent.documents.familyCardUrl,
                        'Kartu Keluarga',
                        'Kartu Keluarga'
                      )}

                      {renderDocument(
                        foundStudent.documents.birthCertUrl,
                        'Akta Lahir',
                        'Akta Kelahiran'
                      )}

                      {renderDocument(
                        foundStudent.documents.parentKtpUrl,
                        'KTP Ortu',
                        'KTP Orang Tua'
                      )}
                    </div>
                  </div>
                </div>
              ) : (

                /* FORM EDIT DATA */
                <form
                  onSubmit={handleSaveEdit}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h5 className="font-bold text-sm text-slate-900">
                      Perbarui Data Anda:
                    </h5>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Lengkap
                      </label>

                      <input
                        type="text"
                        value={formData.personalData?.fullName || ''}
                        onChange={(e) =>
                          updatePersonalData('fullName', e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        No. WhatsApp
                      </label>

                      <input
                        type="tel"
                        value={formData.personalData?.phoneWhatsApp || ''}
                        onChange={(e) =>
                          updatePersonalData('phoneWhatsApp', e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email
                      </label>

                      <input
                        type="email"
                        value={formData.personalData?.email || ''}
                        onChange={(e) =>
                          updatePersonalData('email', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pilihan Jurusan 1
                      </label>

                      <select
                        value={formData.majorChoice?.firstChoice || ''}
                        onChange={(e) =>
                          updateMajorChoice('firstChoice', e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-blue-900"
                      >
                        {majors.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Domisili
                    </label>

                    <textarea
                      rows={2}
                      value={formData.personalData?.address || ''}
                      onChange={(e) =>
                        updatePersonalData('address', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  {/* UPLOAD DOKUMEN */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      Perbarui Berkas / Pas Foto:
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {renderUpload(
                        'photoUrl',
                        'Pas Foto 3x4',
                        'Unggah Foto'
                      )}

                      {renderUpload(
                        'familyCardUrl',
                        'Kartu Keluarga',
                        'Unggah KK'
                      )}

                      {renderUpload(
                        'birthCertUrl',
                        'Akta Lahir',
                        'Unggah Akta'
                      )}

                      {renderUpload(
                        'parentKtpUrl',
                        'KTP Ortu',
                        'Unggah KTP'
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500">
                      Format JPG, PNG, atau WEBP. Maksimal 5 MB per file.
                    </p>
                  </div>

                  {/* TOMBOL SIMPAN */}
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Perubahan Data</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (

            /* TAMPILAN KETIKA BELUM ADA DATA */
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
