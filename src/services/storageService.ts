/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentRegistration, MajorProgram, SchoolSettings, SchoolWave, AdminAccount, ActivityLog, AdmissionTrack, FeeCategory, SchoolAnnouncement } from '../types/spmb';
import { INITIAL_MAJORS, INITIAL_WAVES, INITIAL_SETTINGS, INITIAL_ADMINS, INITIAL_REGISTRANTS, INITIAL_LOGS, INITIAL_TRACKS, INITIAL_FEES, INITIAL_ANNOUNCEMENTS } from '../data/initialData';

const STORAGE_KEYS = {
  REGISTRANTS: 'spmb_lb2_registrants_v1',
  MAJORS: 'spmb_lb2_majors_v1',
  WAVES: 'spmb_lb2_waves_v1',
  SETTINGS: 'spmb_lb2_settings_v1',
  ADMINS: 'spmb_lb2_admins_v1',
  LOGS: 'spmb_lb2_logs_v1',
  ACTIVE_ADMIN: 'spmb_lb2_active_admin_session',
  TRACKS: 'spmb_lb2_tracks_v1',
  FEES: 'spmb_lb2_fees_v1',
  ANNOUNCEMENTS: 'spmb_lb2_announcements_v1',
};

// Supabase Credentials provided by user
export const SUPABASE_CONFIG = {
  REST_URL: 'https://qixphlsusrcquqncnbma.supabase.co/rest/v1',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpeHBobHN1c3JjcXVxbmNuYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTYzMzksImV4cCI6MjEwNzEzMjMzOX0.ICBw1GUTFuI0vm0fVuB1nw0WofVy49V3wL5fGAmNmFg',
  PUBLISHABLE_KEY: 'sb_publishable_ywK7tqaqHBrwStA72uN96w_j2M6nwfB',
};

export class StorageService {
  // Helper to dispatch global event
  private static notifyChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('spmb-storage-updated'));
    }
  }

  // --- REGISTRANTS ---
  static getRegistrants(): StudentRegistration[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTRANTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.REGISTRANTS, JSON.stringify(INITIAL_REGISTRANTS));
        return INITIAL_REGISTRANTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_REGISTRANTS;
    }
  }

  static saveRegistrants(list: StudentRegistration[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTRANTS, JSON.stringify(list));
      this.notifyChange();
      // Background Supabase Sync attempt
      this.syncRegistrantsToSupabase(list).catch(() => {});
    } catch (e) {
      console.error('Failed to save registrants', e);
    }
  }

  static addRegistrant(newStudent: Omit<StudentRegistration, 'id' | 'registrationNumber' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string; status?: StudentRegistration['status'] }): StudentRegistration {
    const list = this.getRegistrants();
    
    // Generate sequential registration number: LB2-2026-XXXX
    const nextNum = (list.length + 1).toString().padStart(4, '0');
    const registrationNumber = `LB2-2026-${nextNum}`;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const fullRecord: StudentRegistration = {
      ...newStudent,
      id: newStudent.id || `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      registrationNumber,
      createdAt: dateStr,
      updatedAt: dateStr,
      status: newStudent.status || 'PENDING',
      statusNote: newStudent.statusNote || 'Pendaftaran baru masuk. Menunggu verifikasi berkas oleh panitia SPMB.',
    };

    list.unshift(fullRecord);
    this.saveRegistrants(list);

    // Update major filled count
    this.incrementMajorQuota(fullRecord.majorChoice.firstChoice);

    // Add activity log
    this.addLog({
      action: 'Pendaftaran Siswa Baru',
      performedBy: fullRecord.personalData.fullName,
      targetId: fullRecord.registrationNumber,
      details: `Pendaftaran mandiri online untuk jurusan pilihan: ${fullRecord.majorChoice.firstChoice}`,
      type: 'REGISTRATION',
    });

    return fullRecord;
  }

  static updateRegistrant(idOrNumber: string, updates: Partial<StudentRegistration>, updatedBy = 'Siswa Mandiri'): StudentRegistration | null {
    const list = this.getRegistrants();
    const index = list.findIndex(r => r.id === idOrNumber || r.registrationNumber === idOrNumber || r.personalData.email.toLowerCase() === idOrNumber.toLowerCase());
    
    if (index === -1) return null;

    const old = list[index];
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const updated: StudentRegistration = {
      ...old,
      ...updates,
      updatedAt: now,
      personalData: {
        ...old.personalData,
        ...(updates.personalData || {}),
      },
      parentData: {
        ...old.parentData,
        ...(updates.parentData || {}),
      },
      schoolOrigin: {
        ...old.schoolOrigin,
        ...(updates.schoolOrigin || {}),
      },
      majorChoice: {
        ...old.majorChoice,
        ...(updates.majorChoice || {}),
      },
      documents: {
        ...old.documents,
        ...(updates.documents || {}),
      },
      customFields: {
        ...(old.customFields || {}),
        ...(updates.customFields || {}),
      },
    };

    list[index] = updated;
    this.saveRegistrants(list);

    this.addLog({
      action: 'Pembaruan Data Pendaftar',
      performedBy: updatedBy,
      targetId: updated.registrationNumber,
      details: `Data pendaftar telah diperbarui (${updatedBy}).`,
      type: 'UPDATE',
    });

    return updated;
  }

  static updateRegistrantStatus(idOrNumber: string, status: StudentRegistration['status'], note: string, adminName: string): boolean {
    const list = this.getRegistrants();
    const index = list.findIndex(r => r.id === idOrNumber || r.registrationNumber === idOrNumber);
    if (index === -1) return false;

    const oldStatus = list[index].status;
    list[index].status = status;
    list[index].statusNote = note;
    list[index].verifiedBy = adminName;
    list[index].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    this.saveRegistrants(list);

    this.addLog({
      action: `Status Diubah: ${oldStatus} -> ${status}`,
      performedBy: adminName,
      targetId: list[index].registrationNumber,
      details: `Catatan panitia: ${note || '-'}`,
      type: 'STATUS_CHANGE',
    });

    return true;
  }

  static deleteRegistrant(idOrNumber: string, adminName: string): boolean {
    const list = this.getRegistrants();
    const cleanQuery = String(idOrNumber || '').trim().toLowerCase();
    if (!cleanQuery) return false;

    const targetIndex = list.findIndex(r => 
      String(r.id || '').trim().toLowerCase() === cleanQuery || 
      String(r.registrationNumber || '').trim().toLowerCase() === cleanQuery
    );
    if (targetIndex === -1) return false;

    const target = list[targetIndex];
    list.splice(targetIndex, 1);
    this.saveRegistrants(list);

    // Also decrement major quota filled count if applicable
    try {
      const majors = this.getMajors();
      const m = majors.find(item => item.name === target.majorChoice.firstChoice || item.code === target.majorChoice.firstChoice);
      if (m && (m.filledCount || 0) > 0) {
        m.filledCount = Math.max(0, (m.filledCount || 0) - 1);
        this.saveMajors(majors);
      }
    } catch {
      // ignore
    }

    this.addLog({
      action: 'Hapus Data Pendaftar',
      performedBy: adminName,
      targetId: target.registrationNumber,
      details: `Data pendaftar ${target.personalData.fullName} (${target.registrationNumber}) telah dihapus secara permanen.`,
      type: 'DELETE',
    });

    return true;
  }

  static findRegistrant(query: string): StudentRegistration | undefined {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    const list = this.getRegistrants();
    return list.find(r => 
      r.registrationNumber.toLowerCase() === q ||
      r.personalData.email.toLowerCase() === q ||
      (r.personalData.nisn ? r.personalData.nisn.toLowerCase() === q : false) ||
      (r.personalData.familyCardNumber ? r.personalData.familyCardNumber.toLowerCase() === q : false) ||
      r.personalData.nik.toLowerCase() === q
    );
  }

  // --- MAJORS ---
  static getMajors(): MajorProgram[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MAJORS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MAJORS, JSON.stringify(INITIAL_MAJORS));
        return INITIAL_MAJORS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MAJORS;
    }
  }

  static saveMajors(majors: MajorProgram[]) {
    localStorage.setItem(STORAGE_KEYS.MAJORS, JSON.stringify(majors));
    this.notifyChange();
  }

  static addMajor(major: Omit<MajorProgram, 'id' | 'filledCount'> & { id?: string }, performedBy = 'Admin'): MajorProgram {
    const list = this.getMajors();
    const newMajor: MajorProgram = {
      ...major,
      id: major.id || `major-${Date.now()}`,
      filledCount: 0,
    };
    list.push(newMajor);
    this.saveMajors(list);
    this.addLog({
      action: 'Tambah Jurusan Baru',
      performedBy,
      targetId: newMajor.code,
      details: `Menambahkan program keahlian: ${newMajor.name} (${newMajor.code}), kuota: ${newMajor.quota}`,
      type: 'SETTINGS_CHANGE',
    });
    return newMajor;
  }

  static updateMajor(id: string, updates: Partial<MajorProgram>, performedBy = 'Admin'): MajorProgram | null {
    const list = this.getMajors();
    const index = list.findIndex(m => m.id === id || m.code.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveMajors(list);
    this.addLog({
      action: 'Ubah Data Jurusan',
      performedBy,
      targetId: updated.code,
      details: `Memperbarui data jurusan ${updated.name}`,
      type: 'SETTINGS_CHANGE',
    });
    return updated;
  }

  static deleteMajor(id: string, performedBy = 'Admin'): boolean {
    const list = this.getMajors();
    const target = list.find(m => m.id === id || m.code.toLowerCase() === id.toLowerCase());
    if (!target) return false;
    const updated = list.filter(m => m.id !== id && m.code.toLowerCase() !== id.toLowerCase());
    this.saveMajors(updated);
    this.addLog({
      action: 'Hapus Jurusan',
      performedBy,
      targetId: target.code,
      details: `Menghapus jurusan ${target.name} (${target.code})`,
      type: 'DELETE',
    });
    return true;
  }

  static incrementMajorQuota(majorNameOrCode: string) {
    const majors = this.getMajors();
    const m = majors.find(item => item.name === majorNameOrCode || item.code === majorNameOrCode);
    if (m) {
      m.filledCount = (m.filledCount || 0) + 1;
      this.saveMajors(majors);
    }
  }

  // --- WAVES ---
  static getWaves(): SchoolWave[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WAVES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WAVES, JSON.stringify(INITIAL_WAVES));
        return INITIAL_WAVES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_WAVES;
    }
  }

  static saveWaves(waves: SchoolWave[]) {
    localStorage.setItem(STORAGE_KEYS.WAVES, JSON.stringify(waves));
    this.notifyChange();
  }

  static addWave(wave: Omit<SchoolWave, 'id'> & { id?: string }, performedBy = 'Admin'): SchoolWave {
    const list = this.getWaves();
    const newWave: SchoolWave = {
      ...wave,
      id: wave.id || `wave-${Date.now()}`,
    };
    list.push(newWave);
    this.saveWaves(list);
    this.addLog({
      action: 'Tambah Gelombang Pendaftaran',
      performedBy,
      targetId: newWave.name,
      details: `Menambahkan gelombang baru: ${newWave.name} (${newWave.startDate} ${newWave.startTime || ''} s/d ${newWave.endDate} ${newWave.endTime || ''})`,
      type: 'SETTINGS_CHANGE',
    });
    return newWave;
  }

  static updateWave(id: string, updates: Partial<SchoolWave>, performedBy = 'Admin'): SchoolWave | null {
    const list = this.getWaves();
    const index = list.findIndex(w => w.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveWaves(list);
    this.addLog({
      action: 'Ubah Gelombang Pendaftaran',
      performedBy,
      targetId: updated.name,
      details: `Memperbarui jadwal/informasi gelombang: ${updated.name}`,
      type: 'SETTINGS_CHANGE',
    });
    return updated;
  }

  static deleteWave(id: string, performedBy = 'Admin'): boolean {
    const list = this.getWaves();
    const target = list.find(w => w.id === id);
    if (!target) return false;
    const updated = list.filter(w => w.id !== id);
    this.saveWaves(updated);
    this.addLog({
      action: 'Hapus Gelombang Pendaftaran',
      performedBy,
      targetId: target.name,
      details: `Menghapus jadwal ${target.name}`,
      type: 'DELETE',
    });
    return true;
  }

  static setActiveWave(id: string, performedBy = 'Admin'): boolean {
    const list = this.getWaves();
    const updated = list.map(w => ({
      ...w,
      isActive: w.id === id,
    }));
    this.saveWaves(updated);
    const activeOne = updated.find(w => w.id === id);
    this.addLog({
      action: 'Set Gelombang Aktif',
      performedBy,
      targetId: activeOne?.name || id,
      details: `Mengaktifkan gelombang pendaftaran: ${activeOne?.name}`,
      type: 'SETTINGS_CHANGE',
    });
    return true;
  }

  // --- ADMISSION TRACKS ---
  static getTracks(): AdmissionTrack[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRACKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(INITIAL_TRACKS));
        return INITIAL_TRACKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TRACKS;
    }
  }

  static saveTracks(tracks: AdmissionTrack[]) {
    localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
    this.notifyChange();
  }

  static addTrack(track: Omit<AdmissionTrack, 'id'> & { id?: string }, performedBy = 'Admin'): AdmissionTrack {
    const list = this.getTracks();
    const newTrack: AdmissionTrack = {
      ...track,
      id: track.id || `track-${Date.now()}`,
    };
    list.push(newTrack);
    this.saveTracks(list);
    this.addLog({
      action: 'Tambah Jalur Pendaftaran',
      performedBy,
      targetId: newTrack.name,
      details: `Menambahkan jalur: ${newTrack.name} (${newTrack.code})`,
      type: 'SETTINGS_CHANGE',
    });
    return newTrack;
  }

  static updateTrack(id: string, updates: Partial<AdmissionTrack>, performedBy = 'Admin'): AdmissionTrack | null {
    const list = this.getTracks();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveTracks(list);
    this.addLog({
      action: 'Ubah Jalur Pendaftaran',
      performedBy,
      targetId: updated.name,
      details: `Memperbarui info jalur pendaftaran ${updated.name}`,
      type: 'SETTINGS_CHANGE',
    });
    return updated;
  }

  static deleteTrack(id: string, performedBy = 'Admin'): boolean {
    const list = this.getTracks();
    const target = list.find(t => t.id === id);
    if (!target) return false;
    const updated = list.filter(t => t.id !== id);
    this.saveTracks(updated);
    this.addLog({
      action: 'Hapus Jalur Pendaftaran',
      performedBy,
      targetId: target.name,
      details: `Menghapus jalur ${target.name}`,
      type: 'DELETE',
    });
    return true;
  }

  // --- FEE CATEGORIES ---
  static getFees(): FeeCategory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(INITIAL_FEES));
        return INITIAL_FEES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_FEES;
    }
  }

  static saveFees(fees: FeeCategory[]) {
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
    this.notifyChange();
  }

  static addFee(fee: Omit<FeeCategory, 'id'> & { id?: string }, performedBy = 'Admin'): FeeCategory {
    const list = this.getFees();
    const newFee: FeeCategory = {
      ...fee,
      id: fee.id || `fee-${Date.now()}`,
    };
    list.push(newFee);
    this.saveFees(list);
    this.addLog({
      action: 'Tambah Kategori Biaya',
      performedBy,
      targetId: newFee.name,
      details: `Menambahkan komponen biaya: ${newFee.name} (${newFee.amount})`,
      type: 'SETTINGS_CHANGE',
    });
    return newFee;
  }

  static updateFee(id: string, updates: Partial<FeeCategory>, performedBy = 'Admin'): FeeCategory | null {
    const list = this.getFees();
    const index = list.findIndex(f => f.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveFees(list);
    this.addLog({
      action: 'Ubah Kategori Biaya',
      performedBy,
      targetId: updated.name,
      details: `Memperbarui komponen biaya ${updated.name}`,
      type: 'SETTINGS_CHANGE',
    });
    return updated;
  }

  static deleteFee(id: string, performedBy = 'Admin'): boolean {
    const list = this.getFees();
    const target = list.find(f => f.id === id);
    if (!target) return false;
    const updated = list.filter(f => f.id !== id);
    this.saveFees(updated);
    this.addLog({
      action: 'Hapus Kategori Biaya',
      performedBy,
      targetId: target.name,
      details: `Menghapus komponen biaya ${target.name}`,
      type: 'DELETE',
    });
    return true;
  }

  // --- SETTINGS ---
  static getSettings(): SchoolSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        return INITIAL_SETTINGS;
      }
      const parsed = JSON.parse(data);
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        promoMediaUploads: parsed.promoMediaUploads || INITIAL_SETTINGS.promoMediaUploads || [],
        announcements: parsed.announcements || INITIAL_SETTINGS.announcements || [],
      };
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(settings: SchoolSettings, adminName = 'Admin Utama') {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    // Also sync announcements list to dedicated key
    if (settings.announcements) {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(settings.announcements));
    }
    this.notifyChange();
    this.addLog({
      action: 'Perubahan Pengaturan Aplikasi',
      performedBy: adminName,
      details: 'Pengaturan profil sekolah, kontak, media promosi, atau pengumuman telah diperbarui.',
      type: 'SETTINGS_CHANGE',
    });
  }

  // --- ANNOUNCEMENTS (PENGUMUMAN & INFO PENTING) ---
  static getAnnouncements(): SchoolAnnouncement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (data) {
        return JSON.parse(data);
      }
      // Fallback from settings or initial
      const currentSettings = this.getSettings();
      if (currentSettings.announcements && currentSettings.announcements.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(currentSettings.announcements));
        return currentSettings.announcements;
      }
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  }

  static saveAnnouncements(announcements: SchoolAnnouncement[], adminName = 'Admin Utama') {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    // Also keep in settings
    const settings = this.getSettings();
    settings.announcements = announcements;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notifyChange();
    this.addLog({
      action: 'Update Daftar Pengumuman',
      performedBy: adminName,
      details: `Memperbarui daftar pengumuman SPMB (${announcements.length} pengumuman)`,
      type: 'SETTINGS_CHANGE',
    });
  }

  static addAnnouncement(item: Omit<SchoolAnnouncement, 'id'> & { id?: string }, performedBy = 'Admin Utama'): SchoolAnnouncement {
    const list = this.getAnnouncements();
    const newAnn: SchoolAnnouncement = {
      ...item,
      id: item.id || `ann-${Date.now()}`,
    };
    const updated = [newAnn, ...list];
    this.saveAnnouncements(updated, performedBy);
    return newAnn;
  }

  static updateAnnouncement(id: string, updates: Partial<SchoolAnnouncement>, performedBy = 'Admin Utama'): SchoolAnnouncement | null {
    const list = this.getAnnouncements();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const updatedAnn = { ...list[idx], ...updates };
    list[idx] = updatedAnn;
    this.saveAnnouncements(list, performedBy);
    return updatedAnn;
  }

  static deleteAnnouncement(id: string, performedBy = 'Admin Utama'): boolean {
    const list = this.getAnnouncements();
    const target = list.find(a => a.id === id);
    if (!target) return false;
    const filtered = list.filter(a => a.id !== id);
    this.saveAnnouncements(filtered, performedBy);
    return true;
  }

  // --- ADMIN USERS ---
  static getAdmins(): AdminAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMINS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS));
        return INITIAL_ADMINS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ADMINS;
    }
  }

  static saveAdmins(admins: AdminAccount[]) {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    this.notifyChange();
  }

  static addShadowAdmin(username: string, fullName: string, createdBy = 'Admin Utama'): AdminAccount {
    const admins = this.getAdmins();
    const newAdmin: AdminAccount = {
      id: `adm-${Date.now()}`,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      role: 'SHADOW_ADMIN',
      createdAt: new Date().toISOString().substring(0, 10),
    };
    admins.push(newAdmin);
    this.saveAdmins(admins);
    this.addLog({
      action: 'Tambah Admin Bayangan',
      performedBy: createdBy,
      details: `Menambahkan sub-admin / admin bayangan: ${fullName} (${username})`,
      type: 'SETTINGS_CHANGE',
    });
    return newAdmin;
  }

  static deleteAdmin(id: string, performedBy = 'Admin Utama'): boolean {
    let admins = this.getAdmins();
    const cleanId = String(id || '').trim();
    const target = admins.find(a => String(a.id).trim() === cleanId);
    if (!target || target.role === 'SUPER_ADMIN') return false; // Super admin cannot be removed
    admins = admins.filter(a => String(a.id).trim() !== cleanId);
    this.saveAdmins(admins);
    this.addLog({
      action: 'Hapus Admin Bayangan',
      performedBy,
      details: `Menghapus akses sub-admin: ${target.fullName}`,
      type: 'SETTINGS_CHANGE',
    });
    return true;
  }

  // --- LOGS ---
  static getLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
        return INITIAL_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_LOGS;
    }
  }

  static addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    try {
      const logs = this.getLogs();
      const newLog: ActivityLog = {
        ...log,
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      logs.unshift(newLog);
      // Keep last 100 logs
      if (logs.length > 100) logs.pop();
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
      this.notifyChange();
    } catch (e) {
      console.error(e);
    }
  }

  // --- ACTIVE SESSION ---
  static getActiveSession(): AdminAccount | null {
    try {
      const s = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_ADMIN);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  static setActiveSession(admin: AdminAccount | null) {
    if (admin) {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_ADMIN, JSON.stringify(admin));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_ADMIN);
    }
    this.notifyChange();
  }

  // --- SUPABASE REST SYNC ---
  static async syncRegistrantsToSupabase(list: StudentRegistration[]): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${SUPABASE_CONFIG.REST_URL}/spmb_registrations`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(list.map(r => ({
          registration_number: r.registrationNumber,
          full_name: r.personalData.fullName,
          nisn: r.personalData.nisn,
          phone: r.personalData.phoneWhatsApp,
          email: r.personalData.email,
          major_first: r.majorChoice.firstChoice,
          major_second: r.majorChoice.secondChoice,
          status: r.status,
          created_at: r.createdAt,
          updated_at: r.updatedAt,
          data_payload: r,
        }))),
      });

      if (!response.ok) {
        // Table might not exist or need schema creation in remote supabase
        return {
          success: false,
          message: `Supabase REST Response: HTTP ${response.status} (${response.statusText}). Data tersimpan aman di Local DB Cache.`,
        };
      }

      return {
        success: true,
        message: 'Berhasil tersinkronisasi langsung ke Supabase Cloud REST Database.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Koneksi Supabase: ${error?.message || 'Offline fallback aktif'}. Data aman di penyimpanan lokal berkecepatan tinggi.`,
      };
    }
  }

  static async fetchFromSupabase(): Promise<{ success: boolean; data?: StudentRegistration[]; message: string }> {
    try {
      const url = `${SUPABASE_CONFIG.REST_URL}/spmb_registrations?select=*&order=created_at.desc`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return { success: false, message: `Status ${response.status}: Menggunakan Local DB Cache` };
      }

      const rows = await response.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const mapped: StudentRegistration[] = rows
          .map((row: any) => row.data_payload)
          .filter(Boolean);
        if (mapped.length > 0) {
          this.saveRegistrants(mapped);
          return { success: true, data: mapped, message: `Berhasil mengunduh ${mapped.length} data dari Supabase Cloud.` };
        }
      }
      return { success: true, message: 'Supabase siap dan terhubung.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Menggunakan offline cache.' };
    }
  }
}
