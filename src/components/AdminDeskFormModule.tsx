/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';

import {
  StudentRegistration,
  SchoolSettings,
  MajorProgram,
  SchoolWave,
  AdminAccount,
  FormFieldConfig,
  FormFieldType,
} from '../types/spmb';

import { StorageService } from '../services/storageService';

import {
  FileText,
  UserPlus,
  Sliders,
  Save,
  RotateCcw,
  Search,
  Eye,
  FileEdit,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Plus,
  User,
  School,
  Users,
  Upload,
  Sparkles,
  MessageCircle,
  Settings2,
  X,
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  majors: MajorProgram[];
  waves: SchoolWave[];
  registrants: StudentRegistration[];
  activeAdmin: AdminAccount;
  onRefreshData?: () => void;
  onPrintCard: (reg: StudentRegistration) => void;
  onOpenNotificationModal: (reg: StudentRegistration) => void;
}

type DeskTab = 'form_entry' | 'crud_table' | 'fields_config';

type FormDataType = Omit<
  StudentRegistration,
  'id' | 'registrationNumber' | 'createdAt'
>;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DEFAULT_COLUMNS: FormFieldConfig[] = [
  {
    id: 'size_uniform',
    label: 'Ukuran Jas/Seragam',
    placeholder: 'Pilih: S, M, L, XL, XXL',
    required: false,
    fieldType: 'select',
    options: ['S', 'M', 'L', 'XL', 'XXL'],
    section: 'additional',
    isActive: true,
  },
  {
    id: 'transport_mode',
    label: 'Moda Transportasi ke Kampus',
    placeholder: 'Pilih transportasi',
    required: false,
    fieldType: 'select',
    options: [
      'Sepeda Motor',
      'Angkutan Umum',
      'Sepeda Gayung',
      'Antar Jemput Ortu',
      'Jalan Kaki',
    ],
    section: 'additional',
    isActive: true,
  },
  {
    id: 'student_height',
    label: 'Tinggi Badan (cm)',
    placeholder: 'Contoh: 165',
    required: false,
    fieldType: 'number',
    section: 'personal',
    isActive: true,
  },
  {
    id: 'referral_source',
    label: 'Informasi SPMB Diperoleh Dari',
    placeholder: 'Contoh: Media Sosial / Guru SMP / Alumni',
    required: false,
    fieldType: 'text',
    section: 'additional',
    isActive: true,
  },
];

export const AdminDeskFormModule: React.FC<Props> = ({
  settings,
  majors,
  waves,
  registrants,
  activeAdmin,
  onRefreshData,
  onPrintCard,
  onOpenNotificationModal,
}) => {
  // =========================================================
  // 1. STATE UTAMA
  // =========================================================

  const [deskTab, setDeskTab] = useState<DeskTab>('form_entry');

  const [search, setSearch] = useState('');
  const [filterMajor, setFilterMajor] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [editStudent, setEditStudent] =
    useState<StudentRegistration | null>(null);

  const [viewStudent, setViewStudent] =
    useState<StudentRegistration | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<StudentRegistration | null>(null);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [formError, setFormError] = useState('');
  const [createdStudent, setCreatedStudent] =
    useState<StudentRegistration | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // =========================================================
  // 2. DEFAULT FORM DATA
  // =========================================================

  const createDefaultFormData = useCallback(
    (): FormDataType => ({
      wave:
        waves.find((w) => w.isActive)?.name ||
        waves[0]?.name ||
        'Gelombang 1',

      status: 'DITERIMA',

      statusNote:
        'Data pendaftar diinput dan diverifikasi resmi oleh Admin Desk SPMB.',

      personalData: {
        familyCardNumber: '',
        nik: '',
        nisn: '',
        fullName: '',
        gender: 'Laki-laki',
        birthPlace: 'Karawang',
        birthDate: '2009-05-12',
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
        averageScore: '86.0',
      },

      majorChoice: {
        firstChoice:
          majors[0]?.name || 'Pengembangan Perangkat Lunak & Gim',

        secondChoice:
          majors[1]?.name ||
          'Teknik Jaringan Komputer & Telekomunikasi',
      },

      documents: {
        photoUrl: '',
        familyCardUrl: '',
        birthCertUrl: '',
        parentKtpUrl: '',
        reportOrDiplomaUrl: '',
        kipKpsUrl: '',
      },

      customFields: {},
    }),
    [waves, majors]
  );

  const [formData, setFormData] = useState<FormDataType>(
    () => createDefaultFormData()
  );

  // =========================================================
  // 3. CUSTOM FIELDS
  // =========================================================

  const [configuredColumns, setConfiguredColumns] =
    useState<FormFieldConfig[]>(
      () => settings.customColumns || DEFAULT_COLUMNS
    );

  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] =
    useState<FormFieldType>('text');

  const [newFieldPlaceholder, setNewFieldPlaceholder] =
    useState('');

  const [newFieldOptionsStr, setNewFieldOptionsStr] =
    useState('');

  const [newFieldRequired, setNewFieldRequired] =
    useState(false);

  const [newFieldSection, setNewFieldSection] = useState<
    'personal' | 'parent' | 'school' | 'additional'
  >('additional');

  const [fieldSuccessMsg, setFieldSuccessMsg] = useState('');

  // =========================================================
  // 4. CLEANUP TIMER
  // =========================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }

      if (fieldTimer.current) {
        clearTimeout(fieldTimer.current);
      }
    };
  }, []);

  // Sinkronisasi konfigurasi kolom dari pengaturan terbaru.
  useEffect(() => {
    setConfiguredColumns(settings.customColumns || DEFAULT_COLUMNS);
  }, [settings.customColumns]);

  // =========================================================
  // 5. NOTIFIKASI TOAST
  // =========================================================

  const triggerToast = useCallback((message: string) => {
    if (!mountedRef.current) return;

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToastMessage(message);

    toastTimer.current = setTimeout(() => {
      if (mountedRef.current) {
        setToastMessage(null);
      }
    }, 4000);
  }, []);

  // =========================================================
  // 6. HELPER UPDATE FORM
  // =========================================================

  const updatePersonal = (
    field: keyof FormDataType['personalData'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      personalData: {
        ...prev.personalData,
        [field]: value,
      },
    }));
  };

  const updateParent = (
    field: keyof FormDataType['parentData'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      parentData: {
        ...prev.parentData,
        [field]: value,
      },
    }));
  };

  const updateSchool = (
    field: keyof FormDataType['schoolOrigin'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      schoolOrigin: {
        ...prev.schoolOrigin,
        [field]: value,
      },
    }));
  };

  const updateMajor = (
    field: keyof FormDataType['majorChoice'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      majorChoice: {
        ...prev.majorChoice,
        [field]: value,
      },
    }));
  };

  const updateCustomField = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [id]: value,
      },
    }));
  };

  // =========================================================
  // 7. SIMPAN DATA PENDAFTAR BARU
  // =========================================================

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    setFormError('');

    const fullName = formData.personalData.fullName.trim();
    const phone = formData.personalData.phoneWhatsApp.trim();
    const schoolName = formData.schoolOrigin.schoolName.trim();

    if (!fullName) {
      setFormError('Nama lengkap calon siswa wajib diisi!');
      return;
    }

    if (!phone) {
      setFormError('Nomor WhatsApp calon siswa wajib diisi!');
      return;
    }

    if (!schoolName) {
      setFormError('Nama Asal Sekolah (SMP/MTs) wajib diisi!');
      return;
    }

    // Validasi kolom kustom yang wajib diisi.
    const missingField = configuredColumns.find(
      (col) =>
        col.isActive !== false &&
        col.required &&
        !String(formData.customFields[col.id] || '').trim()
    );

    if (missingField) {
      setFormError(
        `Kolom "${missingField.label}" wajib diisi!`
      );
      return;
    }

    try {
      setIsSaving(true);

      const newRecord = StorageService.addRegistrant({
        ...formData,
        personalData: {
          ...formData.personalData,
          fullName,
          phoneWhatsApp: phone,
        },
        schoolOrigin: {
          ...formData.schoolOrigin,
          schoolName,
        },
      });

      setCreatedStudent(newRecord);

      triggerToast(
        `Data pendaftar "${newRecord.personalData.fullName}" (${newRecord.registrationNumber}) berhasil disimpan!`
      );

      // Reset menggunakan konfigurasi gelombang dan jurusan terbaru.
      setFormData({
        ...createDefaultFormData(),
        wave: formData.wave,
      });

      setFormError('');

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Gagal menyimpan pendaftar:', error);

      setFormError(
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan data pendaftar. Silakan coba kembali.'
      );
    } finally {
      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  // =========================================================
  // 8. UPLOAD DOKUMEN
  // =========================================================

  const handleUploadDoc = (
    field: keyof FormDataType['documents'],
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setFormError('');

    if (!file.type.startsWith('image/')) {
      setFormError('File harus berupa gambar!');
      input.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormError('Ukuran file berkas maksimal 5MB!');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (!mountedRef.current) return;

      if (typeof reader.result !== 'string') {
        setFormError('Gagal membaca file yang diunggah.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: reader.result as string,
        },
      }));

      triggerToast(`${file.name} berhasil diunggah.`);
    };

    reader.onerror = () => {
      if (mountedRef.current) {
        setFormError('Terjadi kesalahan saat membaca file.');
      }
    };

    reader.readAsDataURL(file);
    input.value = '';
  };

  // =========================================================
  // 9. HAPUS DATA PENDAFTAR
  // =========================================================

  const handleExecuteDelete = () => {
    if (!deleteTarget) return;

    try {
      const ok = StorageService.deleteRegistrant(
        deleteTarget.id,
        activeAdmin.fullName
      );

      if (ok) {
        triggerToast(
          `Data calon siswa "${deleteTarget.personalData.fullName}" (${deleteTarget.registrationNumber}) berhasil dihapus.`
        );

        setDeleteTarget(null);

        if (viewStudent?.id === deleteTarget.id) {
          setViewStudent(null);
        }

        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        triggerToast('Data gagal dihapus atau tidak ditemukan.');
      }
    } catch (error) {
      console.error('Gagal menghapus data:', error);
      triggerToast('Terjadi kesalahan saat menghapus data.');
    }
  };

  // =========================================================
  // 10. SIMPAN PERUBAHAN DATA
  // =========================================================

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editStudent) return;

    const fullName = editStudent.personalData.fullName.trim();
    const phone = editStudent.personalData.phoneWhatsApp.trim();
    const schoolName = editStudent.schoolOrigin.schoolName.trim();

    if (!fullName || !phone || !schoolName) {
      triggerToast('Nama, nomor WhatsApp, dan asal sekolah wajib diisi.');
      return;
    }

    try {
      const updated = StorageService.updateRegistrant(
        editStudent.id,
        {
          ...editStudent,
          personalData: {
            ...editStudent.personalData,
            fullName,
            phoneWhatsApp: phone,
          },
          schoolOrigin: {
            ...editStudent.schoolOrigin,
            schoolName,
          },
        },
        activeAdmin.fullName
      );

      if (updated) {
        triggerToast(
          `Data calon siswa "${updated.personalData.fullName}" berhasil diperbarui.`
        );

        setEditStudent(null);

        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        triggerToast('Data gagal diperbarui.');
      }
    } catch (error) {
      console.error('Gagal memperbarui data:', error);
      triggerToast('Terjadi kesalahan saat memperbarui data.');
    }
  };

  // =========================================================
  // 11. TAMBAH KOLOM KUSTOM
  // =========================================================

  const handleAddNewCustomField = (e: React.FormEvent) => {
    e.preventDefault();

    const label = newFieldLabel.trim();

    if (!label) {
      triggerToast('Nama kolom wajib diisi!');
      return;
    }

    if (
      newFieldType === 'select' &&
      !newFieldOptionsStr.trim()
    ) {
      triggerToast('Daftar pilihan dropdown wajib diisi!');
      return;
    }

    const options =
      newFieldType === 'select'
        ? [
            ...new Set(
              newFieldOptionsStr
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            ),
          ]
        : undefined;

    const newCol: FormFieldConfig = {
      id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label,
      fieldType: newFieldType,
      placeholder:
        newFieldPlaceholder.trim() || `Masukkan ${label}...`,
      required: newFieldRequired,
      options,
      section: newFieldSection,
      isActive: true,
    };

    const updated = [...configuredColumns, newCol];

    try {
      StorageService.saveSettings(
        {
          ...settings,
          customColumns: updated,
        },
        activeAdmin.fullName
      );

      setConfiguredColumns(updated);

      setNewFieldLabel('');
      setNewFieldPlaceholder('');
      setNewFieldOptionsStr('');
      setNewFieldRequired(false);
      setNewFieldType('text');

      setFieldSuccessMsg(
        'Kolom formulir baru berhasil ditambahkan dan langsung aktif!'
      );

      if (fieldTimer.current) {
        clearTimeout(fieldTimer.current);
      }

      fieldTimer.current = setTimeout(() => {
        if (mountedRef.current) {
          setFieldSuccessMsg('');
        }
      }, 3000);

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Gagal menambahkan kolom:', error);
      triggerToast('Gagal menyimpan konfigurasi kolom.');
    }
  };

  // =========================================================
  // 12. HAPUS KOLOM KUSTOM
  // =========================================================

  const handleDeleteCustomField = (id: string) => {
    try {
      const updated = configuredColumns.filter(
        (col) => col.id !== id
      );

      StorageService.saveSettings(
        {
          ...settings,
          customColumns: updated,
        },
        activeAdmin.fullName
      );

      setConfiguredColumns(updated);

      triggerToast('Kolom formulir berhasil dihapus.');

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Gagal menghapus kolom:', error);
      triggerToast('Gagal menghapus konfigurasi kolom.');
    }
  };

  // =========================================================
  // 13. FILTER DATA PENDAFTAR
  // =========================================================

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();

    return registrants.filter((r) => {
      const matchSearch =
        !q ||
        (r.personalData.fullName || '').toLowerCase().includes(q) ||
        (r.registrationNumber || '').toLowerCase().includes(q) ||
        (r.personalData.nisn || '').toLowerCase().includes(q) ||
        (r.personalData.familyCardNumber || '').toLowerCase().includes(q) ||
        (r.personalData.phoneWhatsApp || '').toLowerCase().includes(q);

      const matchMajor =
        filterMajor === 'ALL' ||
        r.majorChoice.firstChoice === filterMajor;

      const matchStatus =
        filterStatus === 'ALL' ||
        r.status === filterStatus;

      return matchSearch && matchMajor && matchStatus;
    });
  }, [registrants, search, filterMajor, filterStatus]);

  // =========================================================
  // 14. KOMPONEN INPUT SEDERHANA
  // =========================================================

  const inputClass =
    'w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const labelClass =
    'block text-xs font-bold text-slate-700 mb-1';

  const updateEditPersonal = (
    field: keyof StudentRegistration['personalData'],
    value: string
  ) => {
    if (!editStudent) return;

    setEditStudent((prev) =>
      prev
        ? {
            ...prev,
            personalData: {
              ...prev.personalData,
              [field]: value,
            },
          }
        : null
    );
  };

  const updateEditParent = (
    field: keyof StudentRegistration['parentData'],
    value: string
  ) => {
    if (!editStudent) return;

    setEditStudent((prev) =>
      prev
        ? {
            ...prev,
            parentData: {
              ...prev.parentData,
              [field]: value,
            },
          }
        : null
    );
  };

  // =========================================================
  // 15. TAMPILAN APLIKASI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* TOAST NOTIFICATION */}

      {toastMessage && (
        <div className="fixed top-20 right-6 z-[100] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shrink-0">
            <FileText className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900">
                Formulir Input Data Calon Siswa Baru
              </h2>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                Panitia Desk
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              Pusat pengelolaan data pendaftaran siswa baru.
            </p>
          </div>

        </div>

        {/* NAVIGATION */}

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold w-full md:w-auto overflow-x-auto">

          <button
            type="button"
            onClick={() => setDeskTab('form_entry')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0 ${
              deskTab === 'form_entry'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Formulir Baru
          </button>

          <button
            type="button"
            onClick={() => setDeskTab('crud_table')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0 ${
              deskTab === 'crud_table'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Kelola ({registrants.length})
          </button>

          <button
            type="button"
            onClick={() => setDeskTab('fields_config')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0 ${
              deskTab === 'fields_config'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Kolom ({configuredColumns.length})
          </button>

        </div>
      </div>

      {/* ===================================================== */}
      {/* TAB 1: FORMULIR PENDAFTARAN */}
      {/* ===================================================== */}

      {deskTab === 'form_entry' && (

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">

          <div className="border-b border-slate-100 pb-4 flex justify-between flex-wrap gap-2">

            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Input Data Pendaftaran Siswa Baru
              </h3>

              <p className="text-xs text-slate-500">
                Nomor pendaftaran dibuat otomatis oleh sistem.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDeskTab('fields_config')}
              className="text-xs text-blue-600 font-bold flex items-center gap-1"
            >
              <Settings2 className="w-4 h-4" />
              Sesuaikan Kolom
            </button>

          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* SUCCESS */}

          {createdStudent && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row justify-between gap-3">

              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase">
                  Berhasil Terdaftar
                </span>

                <h4 className="font-extrabold text-slate-900 text-sm">
                  {createdStudent.personalData.fullName}
                </h4>

                <p className="text-xs text-blue-700 font-mono">
                  {createdStudent.registrationNumber}
                </p>

                <p className="text-xs text-slate-600">
                  Jurusan: {createdStudent.majorChoice.firstChoice}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">

                <button
                  type="button"
                  onClick={() => onPrintCard(createdStudent)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                  <Printer className="w-4 h-4" />
                  Cetak A4
                </button>

                <button
                  type="button"
                  onClick={() => onOpenNotificationModal(createdStudent)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  <MessageCircle className="w-4 h-4" />
                  Kirim WA
                </button>

              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">

            {/* GELOMBANG DAN STATUS */}

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid sm:grid-cols-3 gap-3">

              <div>
                <label className={labelClass}>Gelombang Pendaftaran</label>

                <select
                  value={formData.wave}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      wave: e.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  {waves.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Status Pendaftaran</label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as StudentRegistration['status'],
                    }))
                  }
                  className={inputClass}
                >
                  <option value="DITERIMA">DITERIMA</option>
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIKASI_BERKAS">VERIFIKASI BERKAS</option>
                  <option value="DIBATALKAN">DIBATALKAN</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Catatan Panitia</label>

                <input
                  type="text"
                  value={formData.statusNote}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      statusNote: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

            </div>

            {/* DATA PRIBADI */}

            <section className="space-y-3">

              <h4 className="font-bold text-xs uppercase border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                1. Data Identitas Pribadi Calon Siswa
              </h4>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className={labelClass}>Nama Lengkap *</label>
                  <input
                    required
                    type="text"
                    value={formData.personalData.fullName}
                    onChange={(e) => updatePersonal('fullName', e.target.value)}
                    className={inputClass}
                    placeholder="Nama lengkap siswa"
                  />
                </div>

                <div>
                  <label className={labelClass}>Nomor Kartu Keluarga</label>
                  <input
                    maxLength={16}
                    value={formData.personalData.familyCardNumber}
                    onChange={(e) =>
                      updatePersonal(
                        'familyCardNumber',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    className={inputClass}
                    placeholder="16 digit nomor KK"
                  />
                </div>

                <div>
                  <label className={labelClass}>NIK</label>
                  <input
                    maxLength={16}
                    value={formData.personalData.nik}
                    onChange={(e) =>
                      updatePersonal('nik', e.target.value.replace(/\D/g, ''))
                    }
                    className={inputClass}
                    placeholder="16 digit NIK"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    NISN (Opsional / Tidak Wajib)
                  </label>
                  <input
                    maxLength={10}
                    value={formData.personalData.nisn}
                    onChange={(e) =>
                      updatePersonal('nisn', e.target.value.replace(/\D/g, ''))
                    }
                    className={inputClass}
                    placeholder="10 digit NISN"
                  />
                </div>

                <div>
                  <label className={labelClass}>Jenis Kelamin</label>
                  <select
                    value={formData.personalData.gender}
                    onChange={(e) =>
                      updatePersonal('gender', e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Tempat Lahir</label>
                  <input
                    value={formData.personalData.birthPlace}
                    onChange={(e) =>
                      updatePersonal('birthPlace', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.personalData.birthDate}
                    onChange={(e) =>
                      updatePersonal('birthDate', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Agama</label>
                  <input
                    value={formData.personalData.religion}
                    onChange={(e) =>
                      updatePersonal('religion', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nomor WhatsApp Siswa *</label>
                  <input
                    required
                    type="tel"
                    value={formData.personalData.phoneWhatsApp}
                    onChange={(e) =>
                      updatePersonal('phoneWhatsApp', e.target.value)
                    }
                    className={inputClass}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Siswa</label>
                  <input
                    type="email"
                    value={formData.personalData.email}
                    onChange={(e) =>
                      updatePersonal('email', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Alamat Domisili</label>
                  <textarea
                    rows={2}
                    value={formData.personalData.address}
                    onChange={(e) =>
                      updatePersonal('address', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>RT/RW</label>
                  <input
                    value={formData.personalData.rtRw}
                    onChange={(e) => updatePersonal('rtRw', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Desa/Kelurahan</label>
                  <input
                    value={formData.personalData.village}
                    onChange={(e) => updatePersonal('village', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Kecamatan</label>
                  <input
                    value={formData.personalData.district}
                    onChange={(e) => updatePersonal('district', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Kabupaten/Kota</label>
                  <input
                    value={formData.personalData.city}
                    onChange={(e) => updatePersonal('city', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Provinsi</label>
                  <input
                    value={formData.personalData.province}
                    onChange={(e) => updatePersonal('province', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Hobi</label>
                  <input
                    value={formData.personalData.hobby}
                    onChange={(e) => updatePersonal('hobby', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Cita-cita</label>
                  <input
                    value={formData.personalData.ambition}
                    onChange={(e) => updatePersonal('ambition', e.target.value)}
                    className={inputClass}
                  />
                </div>

              </div>
            </section>

            {/* JURUSAN DAN ASAL SEKOLAH */}

            <section className="space-y-3">

              <h4 className="font-bold text-xs uppercase border-b pb-2 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                2. Program Keahlian dan Asal Sekolah
              </h4>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className={labelClass}>Jurusan Pilihan 1</label>
                  <select
                    value={formData.majorChoice.firstChoice}
                    onChange={(e) => updateMajor('firstChoice', e.target.value)}
                    className={inputClass}
                  >
                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Jurusan Pilihan 2</label>
                  <select
                    value={formData.majorChoice.secondChoice}
                    onChange={(e) => updateMajor('secondChoice', e.target.value)}
                    className={inputClass}
                  >
                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Nama Asal Sekolah *</label>
                  <input
                    required
                    value={formData.schoolOrigin.schoolName}
                    onChange={(e) => updateSchool('schoolName', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Alamat Sekolah</label>
                  <input
                    value={formData.schoolOrigin.schoolAddress}
                    onChange={(e) =>
                      updateSchool('schoolAddress', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Tahun Lulus</label>
                  <input
                    value={formData.schoolOrigin.graduationYear}
                    onChange={(e) =>
                      updateSchool('graduationYear', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nomor Ujian / SKL</label>
                  <input
                    value={formData.schoolOrigin.examNumberOrSkl}
                    onChange={(e) =>
                      updateSchool('examNumberOrSkl', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nilai Rata-rata</label>
                  <input
                    value={formData.schoolOrigin.averageScore}
                    onChange={(e) =>
                      updateSchool('averageScore', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

              </div>
            </section>

            {/* DATA ORANG TUA */}

            <section className="space-y-3">

              <h4 className="font-bold text-xs uppercase border-b pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                3. Data Orang Tua / Wali
              </h4>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className={labelClass}>Nama Ayah</label>
                  <input
                    value={formData.parentData.fatherName}
                    onChange={(e) => updateParent('fatherName', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Pekerjaan Ayah</label>
                  <input
                    value={formData.parentData.fatherJob}
                    onChange={(e) => updateParent('fatherJob', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nomor HP Ayah</label>
                  <input
                    value={formData.parentData.fatherPhone}
                    onChange={(e) => updateParent('fatherPhone', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nama Ibu</label>
                  <input
                    value={formData.parentData.motherName}
                    onChange={(e) => updateParent('motherName', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Pekerjaan Ibu</label>
                  <input
                    value={formData.parentData.motherJob}
                    onChange={(e) => updateParent('motherJob', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nomor HP Ibu</label>
                  <input
                    value={formData.parentData.motherPhone}
                    onChange={(e) => updateParent('motherPhone', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nama Wali</label>
                  <input
                    value={formData.parentData.guardianName}
                    onChange={(e) => updateParent('guardianName', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Penghasilan Bulanan</label>
                  <input
                    value={formData.parentData.monthlyIncome}
                    onChange={(e) => updateParent('monthlyIncome', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Alamat Orang Tua</label>
                  <textarea
                    rows={2}
                    value={formData.parentData.parentAddress}
                    onChange={(e) =>
                      updateParent('parentAddress', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

              </div>
            </section>

            {/* KOLOM TAMBAHAN */}

            {configuredColumns.filter((c) => c.isActive !== false).length > 0 && (

              <section className="space-y-3">

                <h4 className="font-bold text-xs uppercase border-b pb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  4. Kolom Tambahan / Isian Kustom
                </h4>

                <div className="grid sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border">

                  {configuredColumns
                    .filter((col) => col.isActive !== false)
                    .map((col) => {

                      const val = formData.customFields[col.id] || '';

                      return (
                        <div key={col.id}>

                          <label className={labelClass}>
                            {col.label}
                            {col.required && (
                              <span className="text-rose-500"> *</span>
                            )}
                          </label>

                          {col.fieldType === 'select' ? (

                            <select
                              required={col.required}
                              value={val}
                              onChange={(e) =>
                                updateCustomField(col.id, e.target.value)
                              }
                              className={inputClass}
                            >
                              <option value="">
                                -- Pilih {col.label} --
                              </option>

                              {(col.options || []).map((opt, i) => (
                                <option key={i} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>

                          ) : col.fieldType === 'textarea' ? (

                            <textarea
                              required={col.required}
                              rows={2}
                              placeholder={col.placeholder || ''}
                              value={val}
                              onChange={(e) =>
                                updateCustomField(col.id, e.target.value)
                              }
                              className={inputClass}
                            />

                          ) : (

                            <input
                              required={col.required}
                              type={
                                col.fieldType === 'number'
                                  ? 'number'
                                  : col.fieldType === 'date'
                                  ? 'date'
                                  : 'text'
                              }
                              placeholder={col.placeholder || ''}
                              value={val}
                              onChange={(e) =>
                                updateCustomField(col.id, e.target.value)
                              }
                              className={inputClass}
                            />

                          )}

                        </div>
                      );
                    })}

                </div>
              </section>
            )}

            {/* UPLOAD BERKAS */}

            <section className="space-y-3">

              <h4 className="font-bold text-xs uppercase border-b pb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                5. Upload Berkas dan Pas Foto
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                {([
                  ['photoUrl', 'Pas Foto 3x4'],
                  ['familyCardUrl', 'Kartu Keluarga'],
                  ['birthCertUrl', 'Akta Kelahiran'],
                  ['parentKtpUrl', 'KTP Orang Tua'],
                  ['reportOrDiplomaUrl', 'Rapor / Ijazah'],
                  ['kipKpsUrl', 'KIP / KPS'],
                ] as const).map(([field, title]) => (

                  <label
                    key={field}
                    className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-center"
                  >

                    <span className="text-xs font-bold block text-slate-800">
                      {title}
                    </span>

                    <span className="text-[10px] text-blue-600 block mt-2">
                      {formData.documents[field]
                        ? '✓ Berkas Terunggah'
                        : '+ Upload Berkas'}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadDoc(field, e)}
                    />

                  </label>

                ))}

              </div>

              <p className="text-[10px] text-slate-400">
                Format gambar. Maksimal ukuran setiap file 5MB.
              </p>

            </section>

            {/* TOMBOL */}

            <div className="pt-4 border-t flex items-center justify-between gap-3 flex-wrap">

              <button
                type="button"
                onClick={() => {
                  setFormData(createDefaultFormData());
                  setFormError('');
                  setCreatedStudent(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Isian
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Data Calon Siswa'}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ===================================================== */}
      {/* TAB 2: KELOLA DATA PENDAFTAR */}
      {/* ===================================================== */}

      {deskTab === 'crud_table' && (

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-5 border-b bg-slate-50/70 space-y-3">

            <div className="flex justify-between items-center flex-wrap gap-3">

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Daftar Calon Siswa Terdaftar
                </h3>

                <p className="text-xs text-slate-500">
                  Kelola, edit, lihat, cetak, dan hapus data pendaftar.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeskTab('form_entry')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Entri Siswa Baru
              </button>

            </div>

            <div className="grid sm:grid-cols-12 gap-3">

              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

                <input
                  type="text"
                  placeholder="Cari nama, nomor pendaftaran, NISN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} pl-9 bg-white`}
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={filterMajor}
                  onChange={(e) => setFilterMajor(e.target.value)}
                  className={`${inputClass} bg-white`}
                >
                  <option value="ALL">Semua Jurusan</option>

                  {majors.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`${inputClass} bg-white`}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="DITERIMA">DITERIMA</option>
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIKASI_BERKAS">VERIFIKASI</option>
                  <option value="DIBATALKAN">DIBATALKAN</option>
                </select>
              </div>

            </div>

            <p className="text-xs text-slate-500">
              Menampilkan {filteredList.length} dari {registrants.length} pendaftar.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs border-collapse">

              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b uppercase text-[11px] font-bold">
                  <th className="p-3 pl-4">No. Pendaftaran</th>
                  <th className="p-3">Nama Siswa & NISN</th>
                  <th className="p-3">Jurusan</th>
                  <th className="p-3">Asal Sekolah</th>
                  <th className="p-3">Kontak WA</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right pr-4">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredList.length > 0 ? (

                  filteredList.map((r) => (

                    <tr key={r.id} className="hover:bg-slate-50">

                      <td className="p-3 pl-4">
                        <span className="font-mono font-bold text-blue-900 block">
                          {r.registrationNumber}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {r.createdAt
                            ? String(r.createdAt).substring(0, 10)
                            : '-'}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-900 uppercase block">
                          {r.personalData.fullName}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500">
                          NISN: {r.personalData.nisn || '-'}
                        </span>
                      </td>

                      <td className="p-3">
                        {r.majorChoice.firstChoice}
                      </td>

                      <td className="p-3">
                        {r.schoolOrigin.schoolName}
                      </td>

                      <td className="p-3 font-mono text-emerald-700">
                        {r.personalData.phoneWhatsApp}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          r.status === 'DITERIMA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'DIBATALKAN'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="p-3 pr-4">
                        <div className="flex items-center justify-end gap-1">

                          <button
                            type="button"
                            onClick={() => setViewStudent(r)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onPrintCard(r)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Cetak Bukti"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setEditStudent({
                                ...r,
                                personalData: { ...r.personalData },
                                parentData: { ...r.parentData },
                                schoolOrigin: { ...r.schoolOrigin },
                                majorChoice: { ...r.majorChoice },
                                documents: { ...r.documents },
                                customFields: { ...r.customFields },
                              })
                            }
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Edit Data"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(r)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus Data"
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
                      Tidak ada data pendaftar yang cocok.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* ===================================================== */}
      {/* TAB 3: KUSTOMISASI KOLOM */}
      {/* ===================================================== */}

      {deskTab === 'fields_config' && (

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">

          <div className="border-b pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              Kustomisasi Kolom Formulir
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Tambahkan kolom isian baru sesuai kebutuhan panitia.
            </p>
          </div>

          {fieldSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {fieldSuccessMsg}
            </div>
          )}

          <form
            onSubmit={handleAddNewCustomField}
            className="p-5 bg-slate-50 rounded-2xl border space-y-4"
          >

            <h4 className="font-bold text-xs uppercase text-slate-800">
              Tambah Kolom Baru
            </h4>

            <div className="grid sm:grid-cols-3 gap-3">

              <div>
                <label className={labelClass}>Nama Kolom *</label>

                <input
                  required
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className={inputClass}
                  placeholder="Contoh: Ukuran Sepatu"
                />
              </div>

              <div>
                <label className={labelClass}>Tipe Input</label>

                <select
                  value={newFieldType}
                  onChange={(e) =>
                    setNewFieldType(e.target.value as FormFieldType)
                  }
                  className={inputClass}
                >
                  <option value="text">Teks Singkat</option>
                  <option value="number">Angka</option>
                  <option value="select">Dropdown</option>
                  <option value="date">Tanggal</option>
                  <option value="textarea">Teks Panjang</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Bagian Formulir</label>

                <select
                  value={newFieldSection}
                  onChange={(e) =>
                    setNewFieldSection(
                      e.target.value as typeof newFieldSection
                    )
                  }
                  className={inputClass}
                >
                  <option value="additional">Informasi Tambahan</option>
                  <option value="personal">Data Diri</option>
                  <option value="parent">Data Orang Tua</option>
                  <option value="school">Data Sekolah</option>
                </select>
              </div>

            </div>

            <div className="grid sm:grid-cols-2 gap-3">

              <div>
                <label className={labelClass}>Placeholder</label>

                <input
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  className={inputClass}
                  placeholder="Teks petunjuk"
                />
              </div>

              {newFieldType === 'select' && (

                <div>
                  <label className={labelClass}>
                    Daftar Pilihan (Pisahkan dengan Koma)
                  </label>

                  <input
                    value={newFieldOptionsStr}
                    onChange={(e) =>
                      setNewFieldOptionsStr(e.target.value)
                    }
                    className={inputClass}
                    placeholder="S, M, L, XL, XXL"
                  />
                </div>

              )}

            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">

              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={newFieldRequired}
                  onChange={(e) =>
                    setNewFieldRequired(e.target.checked)
                  }
                />
                Wajib Diisi
              </label>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Tambahkan Kolom
              </button>

            </div>

          </form>

          {/* DAFTAR KOLOM */}

          <div className="space-y-3">

            <h4 className="text-xs font-bold uppercase text-slate-700">
              Daftar Kolom Kustom ({configuredColumns.length})
            </h4>

            <div className="grid sm:grid-cols-2 gap-3">

              {configuredColumns.map((col) => (

                <div
                  key={col.id}
                  className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center gap-3"
                >

                  <div className="min-w-0">

                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="font-bold text-xs text-slate-900">
                        {col.label}
                      </span>

                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {col.fieldType || 'text'}
                      </span>

                      {col.required && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                          Wajib
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Bagian: {col.section || 'additional'}
                    </p>

                    {col.options && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Opsi: {col.options.join(', ')}
                      </p>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCustomField(col.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl shrink-0"
                    title="Hapus Kolom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              ))}

              {configuredColumns.length === 0 && (
                <p className="text-xs text-slate-400 col-span-2 text-center p-6">
                  Belum ada kolom tambahan.
                </p>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL KONFIRMASI HAPUS */}
      {/* ===================================================== */}

      {deleteTarget && (

        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-900">
              Konfirmasi Hapus Data
            </h3>

            <p className="text-xs text-slate-600 mt-2 mb-4">
              Apakah Anda yakin ingin menghapus data calon siswa ini?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs mb-5 text-left space-y-1">

              <div>
                <strong>Nama:</strong>{' '}
                {deleteTarget.personalData.fullName}
              </div>

              <div>
                <strong>No. Pendaftaran:</strong>{' '}
                {deleteTarget.registrationNumber}
              </div>

              <div>
                <strong>Jurusan:</strong>{' '}
                {deleteTarget.majorChoice.firstChoice}
              </div>

            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
              >
                Ya, Hapus
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL DETAIL SISWA */}
      {/* ===================================================== */}

      {viewStudent && (

        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">

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

                <h3 className="font-extrabold text-lg uppercase text-slate-900">
                  {viewStudent.personalData.fullName}
                </h3>

                <p className="text-xs text-slate-500">
                  NISN: {viewStudent.personalData.nisn || '-'}
                  {' | '}
                  NIK: {viewStudent.personalData.nik || '-'}
                </p>

                <span className="inline-block mt-1 px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {viewStudent.status}
                </span>
              </div>

            </div>

            <div className="space-y-4 text-xs">

              <section className="grid sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">

                <div><strong>Jurusan 1:</strong> {viewStudent.majorChoice.firstChoice}</div>
                <div><strong>Jurusan 2:</strong> {viewStudent.majorChoice.secondChoice}</div>
                <div><strong>Asal Sekolah:</strong> {viewStudent.schoolOrigin.schoolName}</div>
                <div><strong>Tahun Lulus:</strong> {viewStudent.schoolOrigin.graduationYear}</div>
                <div><strong>Nilai Rata-rata:</strong> {viewStudent.schoolOrigin.averageScore || '-'}</div>
                <div><strong>Jenis Kelamin:</strong> {viewStudent.personalData.gender}</div>
                <div><strong>Tempat Lahir:</strong> {viewStudent.personalData.birthPlace}</div>
                <div><strong>Tanggal Lahir:</strong> {viewStudent.personalData.birthDate}</div>
                <div><strong>Nomor KK:</strong> {viewStudent.personalData.familyCardNumber || '-'}</div>
                <div><strong>NIK:</strong> {viewStudent.personalData.nik || '-'}</div>
                <div><strong>WhatsApp:</strong> {viewStudent.personalData.phoneWhatsApp}</div>
                <div><strong>Email:</strong> {viewStudent.personalData.email || '-'}</div>
                <div><strong>Nama Ayah:</strong> {viewStudent.parentData.fatherName || '-'}</div>
                <div><strong>Nama Ibu:</strong> {viewStudent.parentData.motherName || '-'}</div>
                <div><strong>Kontak Ayah:</strong> {viewStudent.parentData.fatherPhone || '-'}</div>
                <div><strong>Kontak Ibu:</strong> {viewStudent.parentData.motherPhone || '-'}</div>

                <div className="sm:col-span-2">
                  <strong>Alamat:</strong> {viewStudent.personalData.address || '-'}
                </div>

                <div className="sm:col-span-2">
                  <strong>Alamat Orang Tua:</strong> {viewStudent.parentData.parentAddress || '-'}
                </div>

              </section>

              {viewStudent.customFields &&
                Object.keys(viewStudent.customFields).length > 0 && (

                <section className="p-4 bg-slate-50 rounded-xl">

                  <h4 className="font-bold mb-2">
                    Informasi Isian Kustom
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-2">

                    {Object.entries(viewStudent.customFields).map(
                      ([key, value]) => {

                        const matched = configuredColumns.find(
                          (c) => c.id === key
                        );

                        return (
                          <div key={key}>
                            <span className="text-slate-500">
                              {matched?.label || key}:{' '}
                            </span>
                            <strong>{value}</strong>
                          </div>
                        );
                      }
                    )}

                  </div>
                </section>
              )}

            </div>

            <div className="mt-6 pt-4 border-t flex justify-end gap-2">

              <button
                type="button"
                onClick={() => onPrintCard(viewStudent)}
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

      {/* ===================================================== */}
      {/* MODAL EDIT SISWA */}
      {/* ===================================================== */}

      {editStudent && (

        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">

          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto p-6 max-h-[90vh] overflow-y-auto">

            <button
              type="button"
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

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className={labelClass}>Nama Lengkap *</label>
                  <input
                    required
                    value={editStudent.personalData.fullName}
                    onChange={(e) =>
                      updateEditPersonal('fullName', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>NISN (Opsional)</label>
                  <input
                    maxLength={10}
                    value={editStudent.personalData.nisn || ''}
                    onChange={(e) =>
                      updateEditPersonal(
                        'nisn',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>NIK</label>
                  <input
                    maxLength={16}
                    value={editStudent.personalData.nik || ''}
                    onChange={(e) =>
                      updateEditPersonal(
                        'nik',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nomor KK</label>
                  <input
                    maxLength={16}
                    value={editStudent.personalData.familyCardNumber || ''}
                    onChange={(e) =>
                      updateEditPersonal(
                        'familyCardNumber',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Jenis Kelamin</label>
                  <select
                    value={editStudent.personalData.gender}
                    onChange={(e) =>
                      updateEditPersonal('gender', e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editStudent.personalData.birthDate}
                    onChange={(e) =>
                      updateEditPersonal('birthDate', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Jurusan Pilihan 1</label>
                  <select
                    value={editStudent.majorChoice.firstChoice}
                    onChange={(e) =>
                      setEditStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              majorChoice: {
                                ...prev.majorChoice,
                                firstChoice: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                    className={inputClass}
                  >
                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Jurusan Pilihan 2</label>
                  <select
                    value={editStudent.majorChoice.secondChoice}
                    onChange={(e) =>
                      setEditStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              majorChoice: {
                                ...prev.majorChoice,
                                secondChoice: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                    className={inputClass}
                  >
                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Nomor WhatsApp *</label>
                  <input
                    required
                    value={editStudent.personalData.phoneWhatsApp}
                    onChange={(e) =>
                      updateEditPersonal('phoneWhatsApp', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={editStudent.personalData.email || ''}
                    onChange={(e) =>
                      updateEditPersonal('email', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Asal SMP/MTs *</label>
                  <input
                    required
                    value={editStudent.schoolOrigin.schoolName}
                    onChange={(e) =>
                      setEditStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              schoolOrigin: {
                                ...prev.schoolOrigin,
                                schoolName: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Tahun Lulus</label>
                  <input
                    value={editStudent.schoolOrigin.graduationYear}
                    onChange={(e) =>
                      setEditStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              schoolOrigin: {
                                ...prev.schoolOrigin,
                                graduationYear: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Status Pendaftaran</label>
                  <select
                    value={editStudent.status}
                    onChange={(e) =>
                      setEditStudent((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: e.target.value as StudentRegistration['status'],
                            }
                          : null
                      )
                    }
                    className={inputClass}
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

              {/* DATA ORANG TUA */}

              <div className="p-3 bg-slate-50 border rounded-xl space-y-3">

                <h4 className="font-bold text-slate-700">
                  Data Orang Tua / Wali
                </h4>

                <div className="grid sm:grid-cols-2 gap-3">

                  <div>
                    <label className={labelClass}>Nama Ayah</label>
                    <input
                      value={editStudent.parentData.fatherName || ''}
                      onChange={(e) =>
                        updateEditParent('fatherName', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nama Ibu</label>
                    <input
                      value={editStudent.parentData.motherName || ''}
                      onChange={(e) =>
                        updateEditParent('motherName', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nomor HP Ayah</label>
                    <input
                      value={editStudent.parentData.fatherPhone || ''}
                      onChange={(e) =>
                        updateEditParent('fatherPhone', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nomor HP Ibu</label>
                    <input
                      value={editStudent.parentData.motherPhone || ''}
                      onChange={(e) =>
                        updateEditParent('motherPhone', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Pekerjaan Ayah</label>
                    <input
                      value={editStudent.parentData.fatherJob || ''}
                      onChange={(e) =>
                        updateEditParent('fatherJob', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Pekerjaan Ibu</label>
                    <input
                      value={editStudent.parentData.motherJob || ''}
                      onChange={(e) =>
                        updateEditParent('motherJob', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nama Wali</label>
                    <input
                      value={editStudent.parentData.guardianName || ''}
                      onChange={(e) =>
                        updateEditParent('guardianName', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Penghasilan Bulanan</label>
                    <input
                      value={editStudent.parentData.monthlyIncome || ''}
                      onChange={(e) =>
                        updateEditParent('monthlyIncome', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                </div>

              </div>

              {/* CUSTOM FIELDS */}

              {configuredColumns.length > 0 && (

                <div className="p-3 bg-slate-50 border rounded-xl space-y-2">

                  <h4 className="font-bold text-slate-700">
                    Kolom Isian Kustom
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-3">

                    {configuredColumns
                      .filter((col) => col.isActive !== false)
                      .map((col) => (

                        <div key={col.id}>

                          <label className={labelClass}>
                            {col.label}
                          </label>

                          {col.fieldType === 'select' ? (

                            <select
                              value={editStudent.customFields?.[col.id] || ''}
                              onChange={(e) =>
                                setEditStudent((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        customFields: {
                                          ...(prev.customFields || {}),
                                          [col.id]: e.target.value,
                                        },
                                      }
                                    : null
                                )
                              }
                              className={inputClass}
                            >
                              <option value="">-- Pilih --</option>
                              {(col.options || []).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>

                          ) : col.fieldType === 'textarea' ? (

                            <textarea
                              value={editStudent.customFields?.[col.id] || ''}
                              onChange={(e) =>
                                setEditStudent((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        customFields: {
                                          ...(prev.customFields || {}),
                                          [col.id]: e.target.value,
                                        },
                                      }
                                    : null
                                )
                              }
                              className={inputClass}
                            />

                          ) : (

                            <input
                              type={
                                col.fieldType === 'number'
                                  ? 'number'
                                  : col.fieldType === 'date'
                                  ? 'date'
                                  : 'text'
                              }
                              value={editStudent.customFields?.[col.id] || ''}
                              onChange={(e) =>
                                setEditStudent((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        customFields: {
                                          ...(prev.customFields || {}),
                                          [col.id]: e.target.value,
                                        },
                                      }
                                    : null
                                )
                              }
                              className={inputClass}
                            />

                          )}

                        </div>

                      ))}

                  </div>

                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">

                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Simpan Pembaruan
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
