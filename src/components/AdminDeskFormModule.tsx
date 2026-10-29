/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  StudentRegistration, 
  SchoolSettings, 
  MajorProgram, 
  SchoolWave, 
  AdminAccount,
  FormFieldConfig,
  FormFieldType 
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
  HelpCircle,
  Check,
  Settings2,
  X
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
  // Navigation inside Admin Desk module
  const [deskTab, setDeskTab] = useState<'form_entry' | 'crud_table' | 'fields_config'>('form_entry');

  // Search and Filter for CRUD table
  const [search, setSearch] = useState('');
  const [filterMajor, setFilterMajor] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Edit and Delete states
  const [editStudent, setEditStudent] = useState<StudentRegistration | null>(null);
  const [viewStudent, setViewStudent] = useState<StudentRegistration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentRegistration | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form error & success states
  const [formError, setFormError] = useState('');
  const [createdStudent, setCreatedStudent] = useState<StudentRegistration | null>(null);

  // --- FORM DATA STATE ---
  const defaultFormData = {
    wave: waves.find(w => w.isActive)?.name || waves[0]?.name || 'Gelombang 1',
    status: 'DITERIMA' as StudentRegistration['status'],
    statusNote: 'Data pendaftar diinput dan diverifikasi resmi oleh Admin Desk SPMB.',
    personalData: {
      familyCardNumber: '',
      nik: '',
      nisn: '',
      fullName: '',
      gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
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

  const [formData, setFormData] = useState(defaultFormData);

  // --- FORM FIELDS CONFIGURATION STATE ---
  const [configuredColumns, setConfiguredColumns] = useState<FormFieldConfig[]>(
    settings.customColumns || [
      { id: 'size_uniform', label: 'Ukuran Jas/Seragam', placeholder: 'Pilih: S, M, L, XL, XXL', required: false, fieldType: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'], section: 'additional', isActive: true },
      { id: 'transport_mode', label: 'Moda Transportasi ke Kampus', placeholder: 'Pilih transportasi', required: false, fieldType: 'select', options: ['Sepeda Motor', 'Angkutan Umum', 'Sepeda Gayung', 'Antar Jemput Ortu', 'Jalan Kaki'], section: 'additional', isActive: true },
      { id: 'student_height', label: 'Tinggi Badan (cm)', placeholder: 'Contoh: 165', required: false, fieldType: 'number', section: 'personal', isActive: true },
      { id: 'referral_source', label: 'Informasi SPMB Diperoleh Dari', placeholder: 'Contoh: Media Sosial / Guru SMP / Alumni', required: false, fieldType: 'text', section: 'additional', isActive: true },
    ]
  );

  // New field creator state
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormFieldType>('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldOptionsStr, setNewFieldOptionsStr] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldSection, setNewFieldSection] = useState<'personal' | 'parent' | 'school' | 'additional'>('additional');
  const [fieldSuccessMsg, setFieldSuccessMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- CREATE SUBMIT HANDLER ---
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.personalData.fullName.trim()) {
      setFormError('Nama lengkap calon siswa wajib diisi!');
      return;
    }
    // NISN bersifat opsional / tidak wajib diisi
    if (!formData.personalData.phoneWhatsApp.trim()) {
      setFormError('Nomor WhatsApp calon siswa wajib diisi!');
      return;
    }
    if (!formData.schoolOrigin.schoolName.trim()) {
      setFormError('Nama Asal Sekolah (SMP/MTs) wajib diisi!');
      return;
    }

    try {
      const newRecord = StorageService.addRegistrant({
        wave: formData.wave,
        status: formData.status,
        statusNote: formData.statusNote,
        personalData: formData.personalData,
        parentData: formData.parentData,
        schoolOrigin: formData.schoolOrigin,
        majorChoice: formData.majorChoice,
        documents: formData.documents,
        customFields: formData.customFields,
      });

      setCreatedStudent(newRecord);
      triggerToast(`Data pendaftar "${newRecord.personalData.fullName}" (${newRecord.registrationNumber}) berhasil disimpan!`);

      // Reset form fields
      setFormData({
        ...defaultFormData,
        wave: formData.wave,
      });

      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan pendaftar.');
    }
  };

  // Upload handler for documents
  const handleUploadDoc = (field: keyof typeof formData.documents, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Ukuran file berkas maksimal 5MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
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

  // --- DELETE CONFIRMATION HANDLER ---
  const handleExecuteDelete = () => {
    if (!deleteTarget) return;

    const ok = StorageService.deleteRegistrant(deleteTarget.id, activeAdmin.fullName);
    if (ok) {
      triggerToast(`Data calon siswa "${deleteTarget.personalData.fullName}" (${deleteTarget.registrationNumber}) berhasil dihapus.`);
      if (onRefreshData) onRefreshData();
    }
    setDeleteTarget(null);
  };

  // --- UPDATE EDIT STUDENT HANDLER ---
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;

    const updated = StorageService.updateRegistrant(editStudent.id, editStudent, activeAdmin.fullName);
    if (updated) {
      triggerToast(`Data calon siswa "${updated.personalData.fullName}" berhasil diperbarui.`);
      if (onRefreshData) onRefreshData();
    }
    setEditStudent(null);
  };

  // --- ADD CUSTOM FIELD HANDLER ---
  const handleAddNewCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    const fieldId = `field_${Date.now()}`;
    const options = newFieldType === 'select' && newFieldOptionsStr.trim()
      ? newFieldOptionsStr.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const newCol: FormFieldConfig = {
      id: fieldId,
      label: newFieldLabel.trim(),
      fieldType: newFieldType,
      placeholder: newFieldPlaceholder.trim() || `Masukkan ${newFieldLabel.trim()}...`,
      required: newFieldRequired,
      options,
      section: newFieldSection,
      isActive: true,
    };

    const updated = [...configuredColumns, newCol];
    setConfiguredColumns(updated);

    // Save to settings
    const updatedSettings = {
      ...settings,
      customColumns: updated,
    };
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);

    setNewFieldLabel('');
    setNewFieldPlaceholder('');
    setNewFieldOptionsStr('');
    setNewFieldRequired(false);
    setFieldSuccessMsg('Kolom formulir baru berhasil ditambahkan dan langsung aktif!');
    setTimeout(() => setFieldSuccessMsg(''), 3000);

    if (onRefreshData) onRefreshData();
  };

  const handleDeleteCustomField = (id: string) => {
    const updated = configuredColumns.filter(c => c.id !== id);
    setConfiguredColumns(updated);
    const updatedSettings = {
      ...settings,
      customColumns: updated,
    };
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    triggerToast('Kolom formulir telah dihapus.');
    if (onRefreshData) onRefreshData();
  };

  // Filtered registrants for table
  const filteredList = registrants.filter(r => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      r.personalData.fullName.toLowerCase().includes(q) ||
      r.registrationNumber.toLowerCase().includes(q) ||
      (r.personalData.nisn || '').toLowerCase().includes(q) ||
      (r.personalData.familyCardNumber || '').toLowerCase().includes(q) ||
      r.personalData.phoneWhatsApp.toLowerCase().includes(q);

    const matchMajor = filterMajor === 'ALL' || r.majorChoice.firstChoice === filterMajor;
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;

    return matchSearch && matchMajor && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Module Title & Tab Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900">
                Formulir Input Data Calon Siswa Baru (Admin Desk)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                Panitia Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pusat kelola pendaftaran siswa baru, CRUD data pendaftar, dan kustomisasi kolom formulir dinamis.
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setDeskTab('form_entry')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
              deskTab === 'form_entry'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Formulir Entri Baru</span>
          </button>
          <button
            type="button"
            onClick={() => setDeskTab('crud_table')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
              deskTab === 'crud_table'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola & Edit ({registrants.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setDeskTab('fields_config')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
              deskTab === 'fields_config'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Kustomisasi Kolom Formulir ({configuredColumns.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: FORMULIR ENTRI BARU (CREATE) */}
      {/* ========================================================================= */}
      {deskTab === 'form_entry' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Input Data Pendaftaran Siswa Baru
              </h3>
              <p className="text-xs text-slate-500">
                Isi data calon siswa. Nomor pendaftaran unik akan langsung dibuat secara berurutan dan tercatat di sistem.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeskTab('fields_config')}
              className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Sesuaikan Kolom Formulir</span>
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Recently created student notification */}
          {createdStudent && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  ✓ Berhasil Terdaftar
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {createdStudent.personalData.fullName} — <span className="font-mono text-blue-700">{createdStudent.registrationNumber}</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Jurusan: {createdStudent.majorChoice.firstChoice} | Status: <strong className="text-emerald-800">{createdStudent.status}</strong>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onPrintCard(createdStudent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Bukti A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenNotificationModal(createdStudent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Kirim WA</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Wave, Status & Notes Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gelombang Pendaftaran:</label>
                <select
                  value={formData.wave}
                  onChange={(e) => setFormData({ ...formData, wave: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                >
                  {waves.map((w) => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Pendaftaran Awal:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-800"
                >
                  <option value="DITERIMA">DITERIMA (Lolos Seleksi)</option>
                  <option value="PENDING">PENDING (Menunggu Evaluasi)</option>
                  <option value="VERIFIKASI_BERKAS">VERIFIKASI_BERKAS (Lengkapi Dokumen)</option>
                  <option value="DIBATALKAN">DIBATALKAN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Panitia Desk:</label>
                <input
                  type="text"
                  value={formData.statusNote}
                  onChange={(e) => setFormData({ ...formData, statusNote: e.target.value })}
                  placeholder="Catatan..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* SECTION 1: DATA CALON SISWA */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                1. Data Identitas Pribadi Calon Siswa
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    value={formData.personalData.fullName}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, fullName: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold uppercase"
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
                    value={formData.personalData.familyCardNumber || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, familyCardNumber: e.target.value.replace(/\D/g, '') }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIK (Nomor Induk Kependudukan)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit NIK Siswa"
                    value={formData.personalData.nik}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, nik: e.target.value.replace(/\D/g, '') }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      NISN (Nomor Induk Siswa Nasional)
                    </label>
                    <span className="text-[10px] text-slate-400 italic">Opsional / Tidak Wajib</span>
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10 digit NISN (Boleh Kosong)"
                    value={formData.personalData.nisn || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, nisn: e.target.value.replace(/\D/g, '') }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIK (Kependudukan)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit NIK KK"
                    value={formData.personalData.nik}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, nik: e.target.value.replace(/\D/g, '') }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.personalData.gender}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, gender: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.personalData.birthPlace}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, birthPlace: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.personalData.birthDate}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, birthDate: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Handphone / WhatsApp Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.personalData.phoneWhatsApp}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, phoneWhatsApp: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Calon Siswa</label>
                  <input
                    type="email"
                    placeholder="email@gmail.com"
                    value={formData.personalData.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalData: { ...formData.personalData, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili Siswa</label>
                <input
                  type="text"
                  placeholder="Jalan, No Rumah, RT/RW, Kelurahan, Kecamatan"
                  value={formData.personalData.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalData: { ...formData.personalData, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* SECTION 2: PILIHAN JURUSAN & ASAL SEKOLAH */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                2. Program Keahlian & Asal SMP/MTs
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    Jurusan Pilihan 1 (Utama) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.majorChoice.firstChoice}
                    onChange={(e) => setFormData({
                      ...formData,
                      majorChoice: { ...formData.majorChoice, firstChoice: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-950"
                  >
                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jurusan Pilihan 2 (Cadangan)
                  </label>
                  <select
                    value={formData.majorChoice.secondChoice}
                    onChange={(e) => setFormData({
                      ...formData,
                      majorChoice: { ...formData.majorChoice, secondChoice: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {majors.map((m) => (
                      <option key={m.id} value={m.name}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Asal Sekolah (SMP/MTs) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMPN 1 Karawang"
                    value={formData.schoolOrigin.schoolName}
                    onChange={(e) => setFormData({
                      ...formData,
                      schoolOrigin: { ...formData.schoolOrigin, schoolName: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Lulus SMP/MTs</label>
                  <input
                    type="text"
                    value={formData.schoolOrigin.graduationYear}
                    onChange={(e) => setFormData({
                      ...formData,
                      schoolOrigin: { ...formData.schoolOrigin, graduationYear: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Rata-rata Ujian/Rapor</label>
                  <input
                    type="text"
                    placeholder="86.0"
                    value={formData.schoolOrigin.averageScore}
                    onChange={(e) => setFormData({
                      ...formData,
                      schoolOrigin: { ...formData.schoolOrigin, averageScore: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: DATA ORANG TUA / WALI */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                3. Data Orang Tua / Wali
              </h4>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    placeholder="Nama ayah"
                    value={formData.parentData.fatherName}
                    onChange={(e) => setFormData({
                      ...formData,
                      parentData: { ...formData.parentData, fatherName: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    placeholder="Nama ibu"
                    value={formData.parentData.motherName}
                    onChange={(e) => setFormData({
                      ...formData,
                      parentData: { ...formData.parentData, motherName: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Telp/WA Ortu</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={formData.parentData.fatherPhone || formData.parentData.motherPhone}
                    onChange={(e) => setFormData({
                      ...formData,
                      parentData: { ...formData.parentData, fatherPhone: e.target.value, motherPhone: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: KOLOM KUSTOM DINAMIS (DYNAMIC FORM FIELDS ADAPTED BY ADMIN) */}
            {configuredColumns.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  4. Kolom Tambahan / Isian Kustom Panitia (Dapat Dikonfigurasi)
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  {configuredColumns.map((col) => {
                    const val = formData.customFields[col.id] || '';

                    return (
                      <div key={col.id}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {col.label} {col.required && <span className="text-rose-500">*</span>}
                        </label>

                        {/* Render according to fieldType */}
                        {col.fieldType === 'select' && col.options && col.options.length > 0 ? (
                          <select
                            value={val}
                            onChange={(e) => setFormData({
                              ...formData,
                              customFields: { ...formData.customFields, [col.id]: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          >
                            <option value="">-- Pilih {col.label} --</option>
                            {col.options.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : col.fieldType === 'textarea' ? (
                          <textarea
                            rows={2}
                            placeholder={col.placeholder || ''}
                            value={val}
                            onChange={(e) => setFormData({
                              ...formData,
                              customFields: { ...formData.customFields, [col.id]: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                          ></textarea>
                        ) : (
                          <input
                            type={col.fieldType === 'number' ? 'number' : col.fieldType === 'date' ? 'date' : 'text'}
                            placeholder={col.placeholder || ''}
                            value={val}
                            onChange={(e) => setFormData({
                              ...formData,
                              customFields: { ...formData.customFields, [col.id]: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 5: BERKAS & PAS FOTO */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b pb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                5. Upload Berkas & Pas Foto Calon Siswa (Opsional)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer block text-center">
                  <span className="text-[11px] font-bold block text-slate-800">Pas Foto 3x4</span>
                  <span className="text-[10px] text-blue-600 block mt-1">
                    {formData.documents.photoUrl ? '✓ Foto Terunggah' : '+ Upload Foto'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadDoc('photoUrl', e)} />
                </label>

                <label className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer block text-center">
                  <span className="text-[11px] font-bold block text-slate-800">Kartu Keluarga (KK)</span>
                  <span className="text-[10px] text-blue-600 block mt-1">
                    {formData.documents.familyCardUrl ? '✓ KK Terunggah' : '+ Upload KK'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadDoc('familyCardUrl', e)} />
                </label>

                <label className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer block text-center">
                  <span className="text-[11px] font-bold block text-slate-800">Akta Kelahiran</span>
                  <span className="text-[10px] text-blue-600 block mt-1">
                    {formData.documents.birthCertUrl ? '✓ Akta Terunggah' : '+ Upload Akta'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadDoc('birthCertUrl', e)} />
                </label>

                <label className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer block text-center">
                  <span className="text-[11px] font-bold block text-slate-800">KTP Orang Tua</span>
                  <span className="text-[10px] text-blue-600 block mt-1">
                    {formData.documents.parentKtpUrl ? '✓ KTP Terunggah' : '+ Upload KTP'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadDoc('parentKtpUrl', e)} />
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFormData(defaultFormData)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Isian</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Data Calon Siswa (Create)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: KELOLA & EDIT DATA PENDAFTAR (CRUD: READ, UPDATE, DELETE) */}
      {/* ========================================================================= */}
      {deskTab === 'crud_table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header & Filter */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Daftar Calon Siswa Terdaftar (CRUD Management)
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah data pendaftar, cek berkas, cetak kartu bukti A4, atau hapus data secara permanen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeskTab('form_entry')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Entri Siswa Baru</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, nomor pendaftaran, NISN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={filterMajor}
                  onChange={(e) => setFilterMajor(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none"
                >
                  <option value="ALL">Semua Jurusan</option>
                  {majors.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="DITERIMA">DITERIMA</option>
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIKASI_BERKAS">VERIFIKASI</option>
                  <option value="DIBATALKAN">DIBATALKAN</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
                  <th className="p-3 pl-4">No. Pendaftaran</th>
                  <th className="p-3">Nama Siswa & NISN</th>
                  <th className="p-3">Jurusan Utama</th>
                  <th className="p-3">Asal Sekolah</th>
                  <th className="p-3">Kontak WA</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right pr-4">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length > 0 ? (
                  filteredList.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 pl-4">
                        <span className="font-mono font-bold text-blue-900 block">{r.registrationNumber}</span>
                        <span className="text-[10px] text-slate-400">{r.createdAt.substring(0, 10)}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 uppercase block">{r.personalData.fullName}</span>
                        <span className="text-[11px] font-mono text-slate-500">NISN: {r.personalData.nisn}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">{r.majorChoice.firstChoice}</span>
                      </td>
                      <td className="p-3 text-slate-700">
                        {r.schoolOrigin.schoolName}
                      </td>
                      <td className="p-3 font-mono text-emerald-700">
                        {r.personalData.phoneWhatsApp}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'DIBATALKAN' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Read/Detail */}
                          <button
                            type="button"
                            onClick={() => setViewStudent(r)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Detail Siswa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print A4 Card */}
                          <button
                            type="button"
                            onClick={() => onPrintCard(r)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                            title="Cetak Bukti A4"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit / Update */}
                          <button
                            type="button"
                            onClick={() => setEditStudent(JSON.parse(JSON.stringify(r)))}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Edit / Update Data"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>

                          {/* Delete (In-App Modal Bug-Free) */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(r)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Data Siswa"
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

      {/* ========================================================================= */}
      {/* 3. TAB: KUSTOMISASI KOLOM / ISIAN FORMULIR (INPUT FIELDS CONFIGURATOR) */}
      {/* ========================================================================= */}
      {deskTab === 'fields_config' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              Kustomisasi Kolom & Pertanyaan Formulir Pendaftaran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin dapat menyesuaikan atau menambah kolom pertanyaan baru pada formulir pendaftaran sesuai dengan kebutuhan operasional sekolah (misal: ukuran seragam, transportasi, tinggi badan, rekomendasi, dll).
            </p>
          </div>

          {fieldSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{fieldSuccessMsg}</span>
            </div>
          )}

          {/* Form to add a new custom field */}
          <form onSubmit={handleAddNewCustomField} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800 block">
              + Tambah Kolom / Isian Formulir Baru
            </span>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Label / Nama Kolom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ukuran Sepatu Olahraga"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Input:</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as FormFieldType)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="text">Teks Singkat (Text)</option>
                  <option value="number">Angka (Number)</option>
                  <option value="select">Pilihan Menu (Dropdown/Select)</option>
                  <option value="date">Tanggal (Date)</option>
                  <option value="textarea">Teks Panjang (Textarea)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bagian Formulir (Section):</label>
                <select
                  value={newFieldSection}
                  onChange={(e) => setNewFieldSection(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="additional">Informasi Tambahan / Perlengkapan</option>
                  <option value="personal">Data Diri Calon Siswa</option>
                  <option value="parent">Data Orang Tua / Wali</option>
                  <option value="school">Data Asal Sekolah</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Placeholder (Teks Petunjuk):</label>
                <input
                  type="text"
                  placeholder="Contoh: Masukkan ukuran sepatu (38-44)..."
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {newFieldType === 'select' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daftar Pilihan (Pisahkan dengan Koma):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 38, 39, 40, 41, 42, 43"
                    value={newFieldOptionsStr}
                    onChange={(e) => setNewFieldOptionsStr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Wajib Diisi (Required field)</span>
              </label>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan ke Formulir</span>
              </button>
            </div>
          </form>

          {/* List of currently active configured columns */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Daftar Kolom Kustom yang Sedang Aktif ({configuredColumns.length}):
            </span>

            <div className="grid sm:grid-cols-2 gap-3">
              {configuredColumns.map((col) => (
                <div
                  key={col.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{col.label}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.5 rounded font-bold">
                        {col.fieldType || 'text'}
                      </span>
                      {col.required && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                          Wajib
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Bagian: <strong>{col.section || 'additional'}</strong> | Placeholder: {col.placeholder}
                    </p>
                    {col.options && (
                      <p className="text-[10px] text-slate-400">
                        Opsi: {col.options.join(', ')}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCustomField(col.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                    title="Hapus Kolom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- IN-APP MODAL: KONFIRMASI HAPUS DATA (FIX GLOBAL DELETE) --- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Konfirmasi Hapus Data Pendaftar
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus data calon siswa ini secara permanen dari server? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-xs mb-5 space-y-1 text-left">
              <div><strong className="text-slate-600">Nama Siswa:</strong> <span className="font-bold text-slate-900 uppercase">{deleteTarget.personalData.fullName}</span></div>
              <div><strong className="text-slate-600">No. Pendaftaran:</strong> <span className="font-mono text-blue-700 font-bold">{deleteTarget.registrationNumber}</span></div>
              <div><strong className="text-slate-600">Jurusan Pilihan:</strong> <span className="text-slate-800">{deleteTarget.majorChoice.firstChoice}</span></div>
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
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- IN-APP MODAL: DETAIL SISWA (READ) --- */}
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

              {/* Custom fields values */}
              {viewStudent.customFields && Object.keys(viewStudent.customFields).length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-800 block mb-1">Informasi Isian Kustom:</span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {Object.entries(viewStudent.customFields).map(([key, value]) => {
                      const matchedCol = configuredColumns.find(c => c.id === key);
                      return (
                        <div key={key}>
                          <span className="text-slate-500">{matchedCol ? matchedCol.label : key}:</span>{' '}
                          <strong className="text-slate-800">{value}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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

      {/* --- IN-APP MODAL: EDIT DATA SISWA (UPDATE) --- */}
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
              Edit Data Pendaftar (Update)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nomor Registrasi: <span className="font-mono text-blue-700 font-bold">{editStudent.registrationNumber}</span>
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
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
                  <label className="block font-bold text-slate-700 mb-1">Asal SMP/MTs</label>
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

              {/* Dynamic Custom Fields in Edit */}
              {configuredColumns.length > 0 && (
                <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                  <span className="font-bold text-slate-700 block text-xs">Kolom Isian Kustom:</span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {configuredColumns.map((col) => (
                      <div key={col.id}>
                        <label className="block text-[11px] text-slate-600 mb-0.5">{col.label}</label>
                        <input
                          type="text"
                          value={editStudent.customFields?.[col.id] || ''}
                          onChange={(e) => setEditStudent({
                            ...editStudent,
                            customFields: { ...(editStudent.customFields || {}), [col.id]: e.target.value }
                          })}
                          className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
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
