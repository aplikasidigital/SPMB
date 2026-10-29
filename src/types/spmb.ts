/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RegistrationStatus = 'PENDING' | 'DITERIMA' | 'DIBATALKAN' | 'VERIFIKASI_BERKAS';

export interface StudentRegistration {
  id: string;
  registrationNumber: string; // e.g. LB2-2026-0101
  createdAt: string;
  updatedAt: string;
  status: RegistrationStatus;
  statusNote?: string;
  wave: string; // e.g. 'Gelombang 1'

  // 1. Data Calon Siswa
  personalData: {
    familyCardNumber?: string; // Nomor Kartu Keluarga (16 digit)
    nik: string;
    nisn?: string; // NISN tidak wajib diisi
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

  // 5. Berkas Unggahan (Base64 data or URL)
  documents: {
    photoUrl?: string; // Pas Foto 3x4
    familyCardUrl?: string; // Kartu Keluarga
    birthCertUrl?: string; // Akta Lahir
    parentKtpUrl?: string; // KTP Orang Tua
    reportOrDiplomaUrl?: string; // Ijazah / SKL / Rapor
    kipKpsUrl?: string; // KIP / KPS
  };

  // Data tambahan kustom yang ditambahkan Admin
  customFields?: Record<string, string>;
  verifiedBy?: string;
  lastNotifiedAt?: string;
}

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

export interface SchoolWave {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  startTime?: string; // e.g. "08:00"
  endTime?: string; // e.g. "23:59"
  isActive: boolean;
  benefits: string;
  quota?: number;
  fee?: string;
  discountNote?: string;
}

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

export interface FeeCategory {
  id: string;
  name: string;
  amount: string;
  period: 'Satu Kali' | 'Per Bulan' | 'Per Semester' | 'Per Tahun';
  description: string;
  isMandatory: boolean;
  notes?: string;
}

export type FormFieldType = 'text' | 'number' | 'select' | 'date' | 'textarea' | 'file';

export interface FormFieldConfig {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  fieldType?: FormFieldType;
  options?: string[]; // for select/dropdown
  section?: 'personal' | 'parent' | 'school' | 'additional' | 'document';
  isActive?: boolean;
}

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
  promoVideoUrl: string; // YouTube embed or watch link
  tiktokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  announcementTicker: string;
  primaryColor: string;
  googleSheetSyncUrl: string;
  customColumns: FormFieldConfig[];
  promoMediaUploads?: PromoMediaItem[];
  announcements?: SchoolAnnouncement[];
}

export interface PromoMediaItem {
  id: string;
  title: string;
  category: 'Brosur' | 'Spanduk' | 'Poster' | 'Banner';
  imageUrl: string;
  uploadDate: string;
  description?: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  category: 'PENTING' | 'INFORMASI' | 'JADWAL_TES' | 'KELULUSAN' | 'DAFTAR_ULANG' | 'BEASISWA';
  content: string;
  imageUrl?: string;
  publishedDate: string;
  author: string;
  isPinned: boolean;
  isActive: boolean;
}

export type AdminRole = 'SUPER_ADMIN' | 'SHADOW_ADMIN';

export interface AdminAccount {
  id: string;
  username: string;
  fullName: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  targetId?: string;
  details: string;
  type: 'REGISTRATION' | 'UPDATE' | 'STATUS_CHANGE' | 'DELETE' | 'ADMIN_LOGIN' | 'SETTINGS_CHANGE';
}
