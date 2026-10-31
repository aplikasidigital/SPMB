/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MajorProgram, SchoolSettings, SchoolWave, StudentRegistration } from '../types/spmb';
import { StorageService } from '../services/storageService';
import { 
  X, 
  Check, 
  User, 
  Users, 
  School, 
  GraduationCap, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Printer, 
  MessageCircle, 
  FileCheck, 
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface Props {
  majors: MajorProgram[];
  waves: SchoolWave[];
  settings: SchoolSettings;
  defaultMajor?: string;
  onClose: () => void;
  onSuccessRegistered: (registration: StudentRegistration) => void;
}

export const RegistrationForm: React.FC<Props> = ({
  majors,
  waves,
  settings,
  defaultMajor,
  onClose,
  onSuccessRegistered,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form State
  const [wave, setWave] = useState(waves.find(w => w.isActive)?.name || waves[0]?.name || 'Gelombang 1');

  // Step 1: Personal
  const [personalData, setPersonalData] = useState({
    familyCardNumber: '',
    nik: '',
    nisn: '',
    fullName: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    birthPlace: '',
    birthDate: '',
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
  });

  // Step 2: Parent
  const [parentData, setParentData] = useState({
    fatherName: '',
    fatherJob: '',
    fatherPhone: '',
    motherName: '',
    motherJob: '',
    motherPhone: '',
    livingStatus: 'Tinggal bersama' as 'Tinggal bersama' | 'Keluarga lengkap' | 'Yatim' | 'Piatu' | 'Yatim Piatu' | string,
    guardianName: '',
    guardianPhone: '',
    monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
    parentAddress: '',
  });

  // Step 3: School Origin & Major Choices
  const [schoolOrigin, setSchoolOrigin] = useState({
    schoolName: '',
    schoolAddress: '',
    graduationYear: '2026',
    examNumberOrSkl: '',
    averageScore: '85.0',
  });

  const [majorChoice, setMajorChoice] = useState({
    firstChoice: defaultMajor || majors[0]?.name || 'Pengembangan Perangkat Lunak & Gim',
    secondChoice: majors[1]?.name || 'Teknik Jaringan Komputer & Telekomunikasi',
  });

  // Step 4: Documents (Base64)
  const [documents, setDocuments] = useState<{
    photoUrl?: string;
    familyCardUrl?: string;
    birthCertUrl?: string;
    parentKtpUrl?: string;
    reportOrDiplomaUrl?: string;
    kipKpsUrl?: string;
  }>({});

  // Dynamic Custom Fields defined by Admin
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  // File upload reader helper
  const handleFileUpload = (field: keyof typeof documents, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Ukuran file maksimal 5MB! Silakan pilih file yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments(prev => ({
          ...prev,
          [field]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validations per step
  const validateStep1 = () => {
    if (!personalData.fullName.trim()) return 'Nama lengkap calon siswa wajib diisi.';
    // NISN tidak wajib diisi (opsional)
    if (!personalData.phoneWhatsApp.trim()) return 'Nomor WhatsApp wajib diisi untuk notifikasi konfirmasi.';
    if (!personalData.birthPlace.trim() || !personalData.birthDate.trim()) return 'Tempat dan tanggal lahir wajib diisi.';
    if (!personalData.address.trim()) return 'Alamat domisili lengkap wajib diisi.';
    return null;
  };

  const validateStep2 = () => {
    if (!parentData.fatherName.trim() && !parentData.motherName.trim()) {
      return 'Mohon cantumkan minimal satu nama orang tua (Ayah atau Ibu).';
    }
    return null;
  };

  const validateStep3 = () => {
    if (!schoolOrigin.schoolName.trim()) return 'Nama asal SMP/MTs wajib diisi.';
    if (!majorChoice.firstChoice) return 'Pilihan jurusan 1 wajib dipilih.';
    return null;
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setErrorMessage(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setErrorMessage(err); return; }
      setStep(3);
    } else if (step === 3) {
      const err = validateStep3();
      if (err) { setErrorMessage(err); return; }
      setStep(4);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const created = StorageService.addRegistrant({
        wave,
        personalData,
        parentData,
        schoolOrigin,
        majorChoice,
        documents,
        customFields,
      });

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore if canvas confetti context fails
      }

      setIsSubmitting(false);
      onSuccessRegistered(created);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Gagal menyimpan pendaftaran. Silakan coba kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Formulir Pendaftaran Siswa Baru (SPMB)
              </h3>
              <p className="text-xs text-blue-100">
                {settings.schoolName} — Tahun Ajaran {settings.academicYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-blue-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>1</span>
            <span className="hidden sm:inline">Data Diri</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-2">
            <div className={`h-full bg-blue-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-blue-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>2</span>
            <span className="hidden sm:inline">Data Orang Tua</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-2">
            <div className={`h-full bg-blue-600 transition-all ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-blue-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>3</span>
            <span className="hidden sm:inline">Jurusan & Sekolah</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-2">
            <div className={`h-full bg-blue-600 transition-all ${step >= 4 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-blue-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>4</span>
            <span className="hidden sm:inline">Kelengkapan Berkas (Offline)</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* --- STEP 1: DATA DIRI CALON SISWA --- */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Identitas Lengkap Calon Peserta Didik
                </h4>
                <p className="text-xs text-slate-500">Sesuaikan data dengan Akta Kelahiran dan Kartu Keluarga.</p>
              </div>

              {/* Gelombang Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gelombang Pendaftaran:</label>
                <select
                  value={wave}
                  onChange={(e) => setWave(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {waves.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} {w.isActive ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    value={personalData.fullName}
                    onChange={(e) => setPersonalData({ ...personalData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Kartu Keluarga (KK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit Nomor KK"
                    value={personalData.familyCardNumber}
                    onChange={(e) => setPersonalData({ ...personalData, familyCardNumber: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIK (Nomor Induk Kependudukan)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit NIK Siswa"
                    value={personalData.nik}
                    onChange={(e) => setPersonalData({ ...personalData, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      NISN (Nomor Induk Siswa Nasional)
                    </label>
                    <span className="text-[10px] text-slate-400 italic">Tidak Wajib Diisi</span>
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10 digit NISN (Opsional)"
                    value={personalData.nisn}
                    onChange={(e) => setPersonalData({ ...personalData, nisn: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={personalData.gender}
                    onChange={(e) => setPersonalData({ ...personalData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agama</label>
                  <select
                    value={personalData.religion}
                    onChange={(e) => setPersonalData({ ...personalData, religion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Lahir <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Karawang"
                    value={personalData.birthPlace}
                    onChange={(e) => setPersonalData({ ...personalData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={personalData.birthDate}
                    onChange={(e) => setPersonalData({ ...personalData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Handphone / WhatsApp Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={personalData.phoneWhatsApp}
                    onChange={(e) => setPersonalData({ ...personalData, phoneWhatsApp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Notifikasi pendaftaran akan dikirim ke nomor ini</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email Calon Siswa
                  </label>
                  <input
                    type="email"
                    placeholder="contoh@gmail.com"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Tabel / Grid Alamat Domisili Terstruktur */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Alamat Domisili Lengkap (Tabel / Grid Terstruktur)
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Wajib & Akurat
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Kampung / Dusun / Nama Jalan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kp. Babakan / Jl. Surotokunto No. 12"
                      value={personalData.address}
                      onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. RT / RW <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 003 / 007"
                      value={personalData.rtRw}
                      onChange={(e) => setPersonalData({ ...personalData, rtRw: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      3. Desa / Kelurahan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Desa/Kelurahan"
                      value={personalData.village}
                      onChange={(e) => setPersonalData({ ...personalData, village: e.target.value })}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      4. Kecamatan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Kecamatan"
                      value={personalData.district}
                      onChange={(e) => setPersonalData({ ...personalData, district: e.target.value })}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      5. Kabupaten / Kota <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Kabupaten/Kota"
                      value={personalData.city}
                      onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      6. Propinsi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Propinsi"
                      value={personalData.province}
                      onChange={(e) => setPersonalData({ ...personalData, province: e.target.value })}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 2: DATA ORANG TUA / WALI --- */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Data Orang Tua / Wali Calon Siswa
                </h4>
                <p className="text-xs text-slate-500">Data ini dibutuhkan untuk verifikasi administrasi dan kontak darurat sekolah.</p>
              </div>

              {/* Status Tinggal Orang Tua */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                <label className="block text-xs font-bold text-blue-950 mb-1">
                  Status Tinggal Calon Siswa Bersama Orang Tua: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={parentData.livingStatus || 'Tinggal bersama'}
                  onChange={(e) => setParentData({ ...parentData, livingStatus: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-xs sm:text-sm font-semibold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Tinggal bersama">Tinggal bersama</option>
                  <option value="Keluarga lengkap">Keluarga lengkap</option>
                  <option value="Yatim">Yatim</option>
                  <option value="Piatu">Piatu</option>
                  <option value="Yatim Piatu">Yatim Piatu</option>
                </select>
                <p className="text-[11px] text-blue-700">
                  Pilihan status tinggal untuk pendataan beasiswa dan penyesuaian bimbingan siswa.
                </p>
              </div>

              {/* Data Ayah / Wali */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-800 block">
                    Data Ayah / Wali
                  </span>
                  <span className="text-[10px] text-slate-500">Kandung atau Wali</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ayah / Wali</label>
                    <input
                      type="text"
                      placeholder="Nama Lengkap Ayah / Wali"
                      value={parentData.fatherName}
                      onChange={(e) => setParentData({ ...parentData, fatherName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan Ayah / Wali</label>
                    <input
                      type="text"
                      placeholder="Contoh: Karyawan Swasta / Wiraswasta"
                      value={parentData.fatherJob}
                      onChange={(e) => setParentData({ ...parentData, fatherJob: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Handphone Ayah / Wali</label>
                    <input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      value={parentData.fatherPhone}
                      onChange={(e) => setParentData({ ...parentData, fatherPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Data Ibu / Wali */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-pink-700 block">
                    Data Ibu / Wali
                  </span>
                  <span className="text-[10px] text-slate-500">Kandung atau Wali</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ibu / Wali</label>
                    <input
                      type="text"
                      placeholder="Nama Lengkap Ibu / Wali"
                      value={parentData.motherName}
                      onChange={(e) => setParentData({ ...parentData, motherName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan Ibu / Wali</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ibu Rumah Tangga / PNS"
                      value={parentData.motherJob}
                      onChange={(e) => setParentData({ ...parentData, motherJob: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Handphone Ibu / Wali</label>
                    <input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      value={parentData.motherPhone}
                      onChange={(e) => setParentData({ ...parentData, motherPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Penghasilan Ortu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penghasilan Gabungan Orang Tua / Bulan
                </label>
                <select
                  value={parentData.monthlyIncome}
                  onChange={(e) => setParentData({ ...parentData, monthlyIncome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none"
                >
                  <option value="< Rp 1.000.000">&lt; Rp 1.000.000</option>
                  <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
                  <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                  <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                  <option value="> Rp 10.000.000">&gt; Rp 10.000.000</option>
                </select>
              </div>
            </div>
          )}

          {/* --- STEP 3: ASAL SEKOLAH & PILIHAN JURUSAN --- */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-600" />
                  Asal Sekolah & Pilihan Jurusan Kejuruan
                </h4>
                <p className="text-xs text-slate-500">Pilih program keahlian yang sesuai dengan minat dan cita-cita masa depanmu.</p>
              </div>

              {/* Pilihan Jurusan */}
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-900 block">
                  Pilihan Program Keahlian (Jurusan)
                </span>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-blue-950 mb-1">
                      Jurusan Pilihan 1 (Prioritas Utama) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={majorChoice.firstChoice}
                      onChange={(e) => setMajorChoice({ ...majorChoice, firstChoice: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-xs sm:text-sm font-bold text-blue-900 outline-none"
                    >
                      {majors.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jurusan Pilihan 2 (Alternatif Cadangan)
                    </label>
                    <select
                      value={majorChoice.secondChoice}
                      onChange={(e) => setMajorChoice({ ...majorChoice, secondChoice: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 outline-none"
                    >
                      {majors.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Asal Sekolah */}
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Asal Sekolah (SMP / MTs) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: SMPN 1 Karawang Barat"
                      value={schoolOrigin.schoolName}
                      onChange={(e) => setSchoolOrigin({ ...schoolOrigin, schoolName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tahun Lulus SMP/MTs
                    </label>
                    <input
                      type="text"
                      value={schoolOrigin.graduationYear}
                      onChange={(e) => setSchoolOrigin({ ...schoolOrigin, graduationYear: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nilai Rata-rata Rapor / Ujian
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 88.5"
                      value={schoolOrigin.averageScore}
                      onChange={(e) => setSchoolOrigin({ ...schoolOrigin, averageScore: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      No. Ijazah / SKL (Jika Sudah Terbit)
                    </label>
                    <input
                      type="text"
                      placeholder="Nomor Ijazah / SKL"
                      value={schoolOrigin.examNumberOrSkl}
                      onChange={(e) => setSchoolOrigin({ ...schoolOrigin, examNumberOrSkl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Admin Dynamic Fields */}
              {settings.customColumns && settings.customColumns.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
                    Informasi Tambahan Perlengkapan:
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {settings.customColumns.map((col) => (
                      <div key={col.id}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{col.label}</label>
                        <input
                          type="text"
                          placeholder={col.placeholder}
                          value={customFields[col.id] || ''}
                          onChange={(e) => setCustomFields({ ...customFields, [col.id]: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- STEP 4: INSTRUKSI KELENGKAPAN BERKAS FISIK (OFFLINE) --- */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Instruksi Kelengkapan Berkas Fisik (Offline)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pendaftaran online ini <strong>tidak memerlukan upload file digital</strong>. Seluruh berkas fisik dibawa langsung ke panitia.
                </p>
              </div>

              {/* Informative Alert Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-bold text-emerald-900 text-sm">
                    Pendaftaran Berhasil Terdata Secara Online & Realtime
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Setelah menekan tombol <strong>"Kirim Pendaftaran Sekarang"</strong> di bawah, Anda akan mendapatkan <strong>Nomor Registrasi</strong> dan bukti pendaftaran yang dapat dicetak atau disimpan sebagai PDF.
                  </p>
                </div>
              </div>

              {/* Checklist Berkas Fisik yang Dibawa ke Sekretariat */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Daftar Berkas Fisik yang Wajib Dibawa ke Sekolah (Saat Verifikasi):
                  </span>
                  <span className="text-[10px] bg-slate-200 font-bold px-2 py-0.5 rounded text-slate-700">
                    6 Dokumen
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <div>
                      <strong className="block text-slate-900">Pas Foto 3x4 Berwarna</strong>
                      <span className="text-[11px] text-slate-500">Sebanyak 3 lembar (Background Merah/Biru)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <div>
                      <strong className="block text-slate-900">Fotokopi Kartu Keluarga (KK)</strong>
                      <span className="text-[11px] text-slate-500">Sebanyak 2 lembar (Jelas terbaca)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <div>
                      <strong className="block text-slate-900">Fotokopi Akta Kelahiran</strong>
                      <span className="text-[11px] text-slate-500">Sebanyak 2 lembar</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                    <div>
                      <strong className="block text-slate-900">Fotokopi Ijazah / SKL / Rapor SMP</strong>
                      <span className="text-[11px] text-slate-500">Sebanyak 2 lembar (Legalisir bila ada)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">5</span>
                    <div>
                      <strong className="block text-slate-900">Fotokopi KTP Orang Tua / Wali</strong>
                      <span className="text-[11px] text-slate-500">Sebanyak 2 lembar (Ayah & Ibu/Wali)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">6</span>
                    <div>
                      <strong className="block text-slate-900">Fotokopi KIP / KPS / PKH / KIS</strong>
                      <span className="text-[11px] text-slate-500">Khusus bagi penerima bantuan (Opsional)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lokasi Penyerahan Berkas Langsung (Offline) */}
              <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">Lokasi & Waktu Penyerahan Berkas Langsung (Offline):</span>
                <p>
                  <strong>Sekretariat Panitia SPMB {settings.schoolName}</strong><br />
                  {settings.address}<br />
                  Jam Pelayanan: Senin - Sabtu (08.00 - 15.00 WIB) | Kontak WA: <strong>{settings.whatsappNumber || '0813-1442-0312'}</strong>
                </p>
              </div>

              {/* Pernyataan Kebenaran Data */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block text-amber-950 mb-1">Pernyataan Calon Peserta Didik:</span>
                Dengan menekan tombol "Kirim Pendaftaran", saya menyatakan bahwa seluruh data yang diisikan adalah benar, sah, dan bersedia membawa berkas fisik persyaratan ke Sekretariat Panitia SPMB sesuai ketentuan.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan Data...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kirim Pendaftaran Sekarang</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
