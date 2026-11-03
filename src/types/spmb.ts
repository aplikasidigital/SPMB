
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SPMB - Sistem Penerimaan Murid Baru
 * SMK Lentera Bangsa 2
 *
 * Type definitions
 * Versi: Stabil dan kompatibel dengan struktur data sebelumnya.
 */

// ============================================================
// 1. STATUS PENDAFTARAN
// ============================================================

export type RegistrationStatus =
  | 'PENDING'
  | 'DITERIMA'
  | 'DIBATALKAN'
  | 'VERIFIKASI_BERKAS';

// ============================================================
// 2. DATA PENDAFTARAN SISWA
// ============================================================

export interface StudentRegistration {
  id: string;
  registrationNumber: string;
  createdAt: string;
  updatedAt: string;
  status: RegistrationStatus;
  statusNote?: string;
  wave: string;

  // 1. Data Calon Siswa
  personalData: {
    familyCardNumber?: string;
    nik: string;
    nisn?: string;
    fullName: string;
    gender: 'Laki-laki' | 'Perempuan';
    birthPlace: string;
    birthDate: string;
    religion: string;
    address: string;
    rtRw: string;
    village: string;
    district: string;
    city: string;
    province: string;
    phoneWhatsApp: string;
    email: string;
    hobby?: string;
    ambition?: string;
  };

  // 2. Data Orang Tua / Wali
  parentData: {
    fatherName: string;
    fatherJob: string;
    fatherPhone: string;
    motherName: string;
    motherJob: string;
    motherPhone: string;
    livingStatus?:
      | 'Tinggal bersama'
      | 'Keluarga lengkap'
      | 'Yatim'
      | 'Piatu'
      | 'Yatim Piatu'
      | string;
    guardianName?: string;
    guardianPhone?: string;
    monthlyIncome: string;
    parentAddress?: string;
  };

  // 3. Asal Sekolah
  schoolOrigin: {
    schoolName: string;
    schoolAddress: string;
    graduationYear: string;
    examNumberOrSkl?: string;
    averageScore?: string;
  };

  // 4. Pilihan Jurusan
  majorChoice: {
    firstChoice: string;
    secondChoice: string;
  };

  // 5. Berkas Unggahan
  // Mendukung URL maupun Base64
  documents: {
    photoUrl?: string;
    familyCardUrl?: string;
    birthCertUrl?: string;
    parentKtpUrl?: string;
    reportOrDiplomaUrl?: string;
    kipKpsUrl?: string;
  };

  // Data tambahan kustom dari Admin
  customFields?: Record<string, string>;

  verifiedBy?: string;
  lastNotifiedAt?: string;
}

// ============================================================
// 3. PROGRAM KEAHLIAN / JURUSAN
// ============================================================

export interface MajorProgram {
  id: string;
  code: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  quota: number;
  filledCount: number;
  color: string;
  icon: string;
  careers: string[];
  facilities: string[];
  bannerImage: string;
}

// ============================================================
// 4. GELOMBANG PENDAFTARAN
// ============================================================

export interface SchoolWave {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
  benefits: string;
  quota?: number;
  fee?: string;
  discountNote?: string;
}

// ============================================================
// 5. JALUR PENDAFTARAN
// ============================================================

export interface AdmissionTrack {
  id: string;
  code: string;
  name: string;
  description: string;
  requirements: string[];
  discountInfo?: string;
  isActive: boolean;
  quota?: number;
}

// ============================================================
// 6. KATEGORI BIAYA
// ============================================================

export interface FeeCategory {
  id: string;
  name: string;
  amount: string;
  period:
    | 'Satu Kali'
    | 'Per Bulan'
    | 'Per Semester'
    | 'Per Tahun';
  description: string;
  isMandatory: boolean;
  notes?: string;
}

// ============================================================
// 7. KONFIGURASI FORMULIR
// ============================================================

export type FormFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'textarea'
  | 'file';

export interface FormFieldConfig {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  fieldType?: FormFieldType;
  options?: string[];
  section?:
    | 'personal'
    | 'parent'
    | 'school'
    | 'additional'
    | 'document';
  isActive?: boolean;
}

// ============================================================
// 8. PENGATURAN SEKOLAH
// ============================================================

export interface SchoolSettings {
  schoolName: string;
  schoolTagline: string;
  academicYear: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  website: string;
  npsn: string;
  accreditation: string;
  headmasterName: string;
  headmasterNip: string;
  committeeHeadName: string;
  logoUrl: string;
  promoVideoUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  announcementTicker: string;
  primaryColor: string;
  googleSheetSyncUrl: string;

  customColumns: FormFieldConfig[];

  promoMediaUploads?: PromoMediaItem[];
  announcements?: SchoolAnnouncement[];

  // Background aplikasi
  appBackgroundUrl?: string;
  appBackgroundOpacity?: number;

  // Grup WhatsApp calon siswa
  whatsappGroupUrl?: string;
}

// ============================================================
// 9. MEDIA PROMOSI
// ============================================================

export interface PromoMediaItem {
  id: string;
  title: string;
  category:
    | 'Brosur'
    | 'Spanduk'
    | 'Poster'
    | 'Banner';
  imageUrl: string;
  uploadDate: string;
  description?: string;
}

// ============================================================
// 10. PENGUMUMAN SEKOLAH
// ============================================================

export interface SchoolAnnouncement {
  id: string;
  title: string;
  category:
    | 'PENTING'
    | 'INFORMASI'
    | 'JADWAL_TES'
    | 'KELULUSAN'
    | 'DAFTAR_ULANG'
    | 'BEASISWA';
  content: string;
  imageUrl?: string;
  publishedDate: string;
  author: string;
  isPinned: boolean;
  isActive: boolean;
}

// ============================================================
// 11. AKUN ADMIN
// ============================================================

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'SHADOW_ADMIN';

export interface AdminAccount {
  id: string;
  username: string;
  fullName: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
}

// ============================================================
// 12. LOG AKTIVITAS SISTEM
// ============================================================

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  targetId?: string;
  details: string;
  type:
    | 'REGISTRATION'
    | 'UPDATE'
    | 'STATUS_CHANGE'
    | 'DELETE'
    | 'ADMIN_LOGIN'
    | 'SETTINGS_CHANGE';
}
