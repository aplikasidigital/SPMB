
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  MajorProgram,
  SchoolSettings,
  SchoolWave,
  StudentRegistration
} from '../types/spmb';
import { StorageService } from '../services/storageService';
import {
  X,
  User,
  Users,
  School,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCheck,
  AlertCircle,
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

type Gender = 'Laki-laki' | 'Perempuan';

export const RegistrationForm: React.FC<Props> = ({
  majors = [],
  waves = [],
  settings,
  defaultMajor,
  onClose,
  onSuccessRegistered,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const submittingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Gelombang pendaftaran
  const [wave, setWave] = useState(
    () =>
      waves.find(w => w.isActive)?.name ||
      waves[0]?.name ||
      'Gelombang 1'
  );

  // STEP 1: DATA PRIBADI
  const [personalData, setPersonalData] = useState({
    familyCardNumber: '',
    nik: '',
    nisn: '',
    fullName: '',
    gender: 'Laki-laki' as Gender,
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

  // STEP 2: DATA ORANG TUA
  const [parentData, setParentData] = useState({
    fatherName: '',
    fatherJob: '',
    fatherPhone: '',
    motherName: '',
    motherJob: '',
    motherPhone: '',
    livingStatus: 'Tinggal bersama' as string,
    childStatus: 'Orang tua lengkap' as string,
    guardianName: '',
    guardianPhone: '',
    monthlyIncome: 'Rp 3.000.000 - Rp 5.000.000',
    parentAddress: '',
  });

  // STEP 3: ASAL SEKOLAH
  const [schoolOrigin, setSchoolOrigin] = useState({
    schoolName: '',
    schoolAddress: '',
    graduationYear: '2026',
    examNumberOrSkl: '',
    averageScore: '85.0',
  });

  // PILIHAN JURUSAN
  const [majorChoice, setMajorChoice] = useState({
    firstChoice: defaultMajor || majors[0]?.name || 'Teknik Elektronika Industri',
    secondChoice: majors[1]?.name || 'Teknik Sepeda Motor',
  });

  // STEP 4: DOKUMEN
  const [documents, setDocuments] = useState<{
    photoUrl?: string;
    familyCardUrl?: string;
    birthCertUrl?: string;
    parentKtpUrl?: string;
    reportOrDiplomaUrl?: string;
    kipKpsUrl?: string;
  }>({});

  // CUSTOM FIELDS
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  // Memperbarui pilihan jurusan jika data jurusan tersedia
  useEffect(() => {
    if (!majors.length) return;

    setMajorChoice(prev => {
      const firstExists = majors.some(m => m.name === prev.firstChoice);
      const secondExists = majors.some(m => m.name === prev.secondChoice);

      return {
        firstChoice: firstExists
          ? prev.firstChoice
          : (defaultMajor && majors.some(m => m.name === defaultMajor)
              ? defaultMajor
              : majors[0].name),
        secondChoice: secondExists
          ? prev.secondChoice
          : (majors[1]?.name || majors[0].name),
      };
    });
  }, [majors, defaultMajor]);

  // UPDATE DATA TANPA MENIMPA STATE LAIN
  const updatePersonal = (field: keyof typeof personalData, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
  };

  const updateParent = (field: keyof typeof parentData, value: string) => {
    setParentData(prev => ({ ...prev, [field]: value }));
  };

  const updateSchool = (field: keyof typeof schoolOrigin, value: string) => {
    setSchoolOrigin(prev => ({ ...prev, [field]: value }));
  };

  // UPLOAD FILE
  const handleFileUpload = (
    field: keyof typeof documents,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setErrorMessage('');

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 5MB! Silakan pilih file yang lebih kecil.');
      e.target.value = '';
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (!mountedRef.current) return;

      if (typeof reader.result !== 'string') {
        setErrorMessage('Gagal membaca file. Silakan coba kembali.');
        return;
      }

      setDocuments(prev => ({
        ...prev,
        [field]: reader.result as string,
      }));
    };

    reader.onerror = () => {
      if (mountedRef.current) {
        setErrorMessage('Terjadi kesalahan saat membaca file.');
      }
    };

    reader.onabort = () => {
      if (mountedRef.current) {
        setErrorMessage('Pembacaan file dibatalkan.');
      }
    };

    try {
      reader.readAsDataURL(file);
    } catch {
      setErrorMessage('File tidak dapat diproses.');
    }
  };

  // VALIDASI STEP 1
  const validateStep1 = () => {
    if (!personalData.fullName.trim()) {
      return 'Nama lengkap calon siswa wajib diisi.';
    }

    if (!personalData.phoneWhatsApp.trim()) {
      return 'Nomor WhatsApp wajib diisi untuk notifikasi konfirmasi.';
    }

    if (!personalData.birthPlace.trim() || !personalData.birthDate.trim()) {
      return 'Tempat dan tanggal lahir wajib diisi.';
    }

    if (!personalData.address.trim()) {
      return 'Alamat domisili lengkap wajib diisi.';
    }

    if (!personalData.village.trim()) {
      return 'Desa atau kelurahan wajib diisi.';
    }

    if (!personalData.district.trim()) {
      return 'Kecamatan wajib diisi.';
    }

    if (!personalData.city.trim()) {
      return 'Kabupaten atau kota wajib diisi.';
    }

    if (!personalData.province.trim()) {
      return 'Provinsi wajib diisi.';
    }

    return null;
  };

  // VALIDASI STEP 2
  const validateStep2 = () => {
    if (
      !parentData.fatherName.trim() &&
      !parentData.motherName.trim()
    ) {
      return 'Mohon cantumkan minimal satu nama orang tua (Ayah atau Ibu).';
    }

    return null;
  };

  // VALIDASI STEP 3
  const validateStep3 = () => {
    if (!schoolOrigin.schoolName.trim()) {
      return 'Nama asal SMP/MTs wajib diisi.';
    }

    if (!majorChoice.firstChoice) {
      return 'Pilihan jurusan 1 wajib dipilih.';
    }

    if (!majors.length) {
      return 'Data jurusan belum tersedia. Silakan hubungi administrator.';
    }

    return null;
  };

  // PINDAH TAHAP
  const handleNext = () => {
    if (isSubmitting) return;

    setErrorMessage('');

    let validationError: string | null = null;

    if (step === 1) {
      validationError = validateStep1();
    } else if (step === 2) {
      validationError = validateStep2();
    } else if (step === 3) {
      validationError = validateStep3();
    }

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (step < 4) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  // KEMBALI KE TAHAP SEBELUMNYA
  const handlePrevious = () => {
    if (isSubmitting) return;

    setErrorMessage('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  // TUTUP FORMULIR
  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  // SIMPAN PENDAFTARAN
  const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (submittingRef.current || isSubmitting) return;

    setErrorMessage('');

    // Pastikan data wajib tetap valid
    const error1 = validateStep1();
    const error2 = validateStep2();
    const error3 = validateStep3();

    if (error1 || error2 || error3) {
      setErrorMessage(error1 || error2 || error3 || 'Periksa kembali data pendaftaran.');
      setStep(error1 ? 1 : error2 ? 2 : 3);
      return;
    }

    submittingRef.current = true;
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

      if (!created) {
        throw new Error('Data pendaftaran tidak berhasil disimpan.');
      }

      // Animasi confetti tidak boleh mengganggu penyimpanan
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Abaikan jika browser tidak mendukung canvas
      }

      onSuccessRegistered(created);

    } catch (err: unknown) {
      submittingRef.current = false;

      if (mountedRef.current) {
        setIsSubmitting(false);

        const message =
          err instanceof Error
            ? err.message
            : 'Gagal menyimpan pendaftaran. Silakan coba kembali.';

        setErrorMessage(message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">

      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col max-h-[92vh]">

        {/* HEADER */}
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
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer disabled:opacity-40"
            aria-label="Tutup formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">

          {[1, 2, 3, 4].map((item, index) => (
            <React.Fragment key={item}>
              <div className={`flex items-center gap-1.5 ${step >= item ? 'text-blue-600' : ''}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= item ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {item}
                </span>

                <span className="hidden sm:inline">
                  {[
                    'Data Diri',
                    'Data Orang Tua',
                    'Jurusan & Sekolah',
                    'Kelengkapan Berkas (Offline)'
                  ][index]}
                </span>
              </div>

              {index < 3 && (
                <div className="h-0.5 flex-1 bg-slate-200 mx-2">
                  <div className={`h-full bg-blue-600 transition-all ${step > item ? 'w-full' : 'w-0'}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div
            role="alert"
            className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
          noValidate
        >

          <div className="p-6 overflow-y-auto flex-1 min-h-0">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">

                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Identitas Lengkap Calon Peserta Didik
                  </h4>

                  <p className="text-xs text-slate-500">
                    Sesuaikan data dengan Akta Kelahiran dan Kartu Keluarga.
                  </p>
                </div>

                {/* GELOMBANG */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gelombang Pendaftaran:
                  </label>

                  <select
                    value={wave}
                    onChange={e => setWave(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {waves.map(w => (
                      <option key={w.id} value={w.name}>
                        {w.name} {w.isActive ? '(Aktif)' : ''}
                      </option>
                    ))}

                    {waves.length === 0 && (
                      <option value="Gelombang 1">Gelombang 1</option>
                    )}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Siswa *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Rizky Pratama"
                      value={personalData.fullName}
                      onChange={e => updatePersonal('fullName', e.target.value)}
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
                      inputMode="numeric"
                      placeholder="16 digit Nomor KK"
                      value={personalData.familyCardNumber}
                      onChange={e => updatePersonal('familyCardNumber', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIK
                    </label>

                    <input
                      type="text"
                      maxLength={16}
                      inputMode="numeric"
                      placeholder="16 digit NIK Siswa"
                      value={personalData.nik}
                      onChange={e => updatePersonal('nik', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NISN (Opsional)
                    </label>

                    <input
                      type="text"
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="10 digit NISN"
                      value={personalData.nisn}
                      onChange={e => updatePersonal('nisn', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jenis Kelamin
                    </label>

                    <select
                      value={personalData.gender}
                      onChange={e => updatePersonal('gender', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Agama
                    </label>

                    <select
                      value={personalData.religion}
                      onChange={e => updatePersonal('religion', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                    >
                      {['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tempat Lahir *
                    </label>

                    <input
                      type="text"
                      value={personalData.birthPlace}
                      onChange={e => updatePersonal('birthPlace', e.target.value)}
                      placeholder="Contoh: Karawang"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Lahir *
                    </label>

                    <input
                      type="date"
                      value={personalData.birthDate}
                      onChange={e => updatePersonal('birthDate', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      No. Handphone / WhatsApp Siswa *
                    </label>

                    <input
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={personalData.phoneWhatsApp}
                      onChange={e => updatePersonal('phoneWhatsApp', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono outline-none"
                    />

                    <span className="text-[10px] text-slate-500">
                      Notifikasi pendaftaran akan dikirim ke nomor ini.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Email Calon Siswa
                    </label>

                    <input
                      type="email"
                      placeholder="contoh@gmail.com"
                      value={personalData.email}
                      onChange={e => updatePersonal('email', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                    />
                  </div>
                </div>

                {/* ALAMAT */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Alamat Domisili Lengkap
                    </span>

                    <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Wajib & Akurat
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        1. Kampung / Dusun / Nama Jalan *
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kp. Babakan / Jl. Surotokunto No. 12"
                        value={personalData.address}
                        onChange={e => updatePersonal('address', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        2. RT / RW *
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="Contoh: 003 / 007"
                        value={personalData.rtRw}
                        onChange={e => updatePersonal('rtRw', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

                    {([
                      ['village', '3. Desa / Kelurahan'],
                      ['district', '4. Kecamatan'],
                      ['city', '5. Kabupaten / Kota'],
                      ['province', '6. Provinsi']
                    ] as const).map(([field, label]) => (
                      <div key={field}>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {label} *
                        </label>

                        <input
                          type="text"
                          required
                          value={personalData[field]}
                          onChange={e => updatePersonal(field, e.target.value)}
                          placeholder={label}
                          className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                        />
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">

                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Data Orang Tua / Wali Calon Siswa
                  </h4>

                  <p className="text-xs text-slate-500">
                    Data ini dibutuhkan untuk verifikasi administrasi dan kontak darurat sekolah.
                  </p>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">

                  <label className="block text-xs font-bold text-blue-950">
                    Status Tinggal Calon Siswa Bersama Orang Tua:
                  </label>

                  <select
                    value={parentData.livingStatus}
                    onChange={e => updateParent('livingStatus', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-xs sm:text-sm outline-none"
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

                {/* AYAH */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">

                  <div className="border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-xs uppercase tracking-wider text-blue-800">
                      Data Ayah / Wali
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {([
                      ['fatherName', 'Nama Ayah / Wali', 'Nama Lengkap Ayah / Wali'],
                      ['fatherJob', 'Pekerjaan Ayah / Wali', 'Contoh: Karyawan Swasta / Wiraswasta'],
                      ['fatherPhone', 'Nomor Handphone Ayah / Wali', '08xxxxxxxxxx']
                    ] as const).map(([field, label, placeholder]) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {label}
                        </label>

                        <input
                          type="text"
                          placeholder={placeholder}
                          value={parentData[field]}
                          onChange={e => updateParent(field, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* IBU */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">

                  <div className="border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-xs uppercase tracking-wider text-pink-700">
                      Data Ibu / Wali
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {([
                      ['motherName', 'Nama Ibu / Wali', 'Nama Lengkap Ibu / Wali'],
                      ['motherJob', 'Pekerjaan Ibu / Wali', 'Contoh: Ibu Rumah Tangga / PNS'],
                      ['motherPhone', 'Nomor Handphone Ibu / Wali', '08xxxxxxxxxx']
                    ] as const).map(([field, label, placeholder]) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {label}
                        </label>

                        <input
                          type="text"
                          placeholder={placeholder}
                          value={parentData[field]}
                          onChange={e => updateParent(field, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* PENGHASILAN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penghasilan Gabungan Orang Tua / Bulan
                  </label>

                  <select
                    value={parentData.monthlyIncome}
                    onChange={e => updateParent('monthlyIncome', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
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

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-5">

                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <School className="w-4 h-4 text-blue-600" />
                    Asal Sekolah & Pilihan Jurusan Kejuruan
                  </h4>

                  <p className="text-xs text-slate-500">
                    Pilih program keahlian yang sesuai dengan minat dan cita-cita masa depanmu.
                  </p>
                </div>

                {/* JURUSAN */}
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">

                  <span className="font-bold text-xs uppercase tracking-wider text-blue-900 block">
                    Pilihan Program Keahlian (Jurusan)
                  </span>

                  {majors.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3">

                      <div>
                        <label className="block text-xs font-bold text-blue-950 mb-1">
                          Jurusan Pilihan 1 (Prioritas Utama) *
                        </label>

                        <select
                          value={majorChoice.firstChoice}
                          onChange={e => setMajorChoice(prev => ({
                            ...prev,
                            firstChoice: e.target.value
                          }))}
                          className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-xs sm:text-sm font-bold text-blue-900 outline-none"
                        >
                          {majors.map(m => (
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
                          onChange={e => setMajorChoice(prev => ({
                            ...prev,
                            secondChoice: e.target.value
                          }))}
                          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 outline-none"
                        >
                          {majors.map(m => (
                            <option key={m.id} value={m.name}>
                              {m.name} ({m.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-600 font-semibold">
                      Data jurusan belum tersedia. Silakan hubungi administrator.
                    </p>
                  )}
                </div>

                {/* SEKOLAH ASAL */}
                <div className="space-y-3">

                  <div className="grid sm:grid-cols-2 gap-3">

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Asal Sekolah (SMP / MTs) *
                      </label>

                      <input
                        type="text"
                        value={schoolOrigin.schoolName}
                        onChange={e => updateSchool('schoolName', e.target.value)}
                        placeholder="Contoh: SMPN 1 Karawang Barat"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tahun Lulus SMP/MTs
                      </label>

                      <input
                        type="text"
                        value={schoolOrigin.graduationYear}
                        onChange={e => updateSchool('graduationYear', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
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
                        value={schoolOrigin.averageScore}
                        onChange={e => updateSchool('averageScore', e.target.value)}
                        placeholder="Contoh: 88.5"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        No. Ijazah / SKL (Jika Sudah Terbit)
                      </label>

                      <input
                        type="text"
                        value={schoolOrigin.examNumberOrSkl}
                        onChange={e => updateSchool('examNumberOrSkl', e.target.value)}
                        placeholder="Nomor Ijazah / SKL"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* CUSTOM FIELDS */}
                {settings.customColumns && settings.customColumns.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">

                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
                      Informasi Tambahan Perlengkapan:
                    </span>

                    <div className="grid sm:grid-cols-2 gap-3">

                      {settings.customColumns.map(col => (
                        <div key={col.id}>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {col.label}
                          </label>

                          <input
                            type="text"
                            placeholder={col.placeholder}
                            value={customFields[col.id] || ''}
                            onChange={e => setCustomFields(prev => ({
                              ...prev,
                              [col.id]: e.target.value
                            }))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none"
                          />
                        </div>
                      ))}

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-4">

                <div className="border-b border-slate-100 pb-2 mb-3">

                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />

                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      Instruksi Kelengkapan Berkas Fisik (Offline)
                    </h4>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Pendaftaran online ini <strong>tidak memerlukan upload file digital</strong>. Seluruh berkas fisik dibawa langsung ke panitia.
                  </p>
                </div>

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

                {/* BERKAS FISIK */}
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

                    {[
                      ['Pas Foto 3x4 Berwarna', 'Sebanyak 3 lembar (Background Merah/Biru)'],
                      ['Fotokopi Kartu Keluarga (KK)', 'Sebanyak 2 lembar (Jelas terbaca)'],
                      ['Fotokopi Akta Kelahiran', 'Sebanyak 2 lembar'],
                      ['Fotokopi Ijazah / SKL / Rapor SMP', 'Sebanyak 2 lembar (Legalisir bila ada)'],
                      ['Fotokopi KTP Orang Tua / Wali', 'Sebanyak 2 lembar (Ayah & Ibu/Wali)'],
                      ['Fotokopi KIP / KPS / PKH / KIS', 'Khusus bagi penerima bantuan (Opsional)']
                    ].map(([title, description], index) => (
                      <div
                        key={index}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-xs"
                      >
                        <span className={`w-6 h-6 rounded-lg ${index === 5 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'} font-bold flex items-center justify-center shrink-0 text-xs`}>
                          {index + 1}
                        </span>

                        <div>
                          <strong className="block text-slate-900">
                            {title}
                          </strong>

                          <span className="text-[11px] text-slate-500">
                            {description}
                          </span>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                {/* LOKASI */}
                <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">

                  <span className="font-bold text-slate-900 block">
                    Lokasi & Waktu Penyerahan Berkas Langsung (Offline):
                  </span>

                  <p>
                    <strong>Sekretariat Panitia SPMB {settings.schoolName}</strong>
                    <br />
                    {settings.address}
                    <br />
                    Jam Pelayanan: Senin - Sabtu (08.00 - 15.00 WIB)
                    {' | '}
                    Kontak WA:
                    {' '}
                    <strong>
                      {settings.whatsappNumber || '0813-1442-0312'}
                    </strong>
                  </p>
                </div>

                {/* PERNYATAAN */}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">

                  <span className="font-bold block text-amber-950 mb-1">
                    Pernyataan Calon Peserta Didik:
                  </span>

                  Dengan menekan tombol "Kirim Pendaftaran", saya menyatakan bahwa seluruh data yang diisikan adalah benar, sah, dan bersedia membawa berkas fisik persyaratan ke Sekretariat Panitia SPMB sesuai ketentuan.
                </div>

              </div>
            )}

          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl flex items-center justify-between gap-3">

            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/25 transition disabled:opacity-50"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        </form>
      </div>
    </div>
  );
};
