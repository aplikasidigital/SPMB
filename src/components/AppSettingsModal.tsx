/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolSettings, AdminAccount, PromoMediaItem, SchoolAnnouncement } from '../types/spmb';
import { StorageService } from '../services/storageService';
import { 
  X, 
  Settings, 
  Save, 
  Upload, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Building2, 
  Share2, 
  Palette, 
  Plus, 
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  FileImage,
  Eye,
  Megaphone,
  Pin,
  Calendar,
  FileEdit,
  RotateCcw
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  admins: AdminAccount[];
  activeAdmin: AdminAccount;
  onClose: () => void;
  onSaveSettings: (newSettings: SchoolSettings) => void;
}

export const AppSettingsModal: React.FC<Props> = ({
  settings,
  admins,
  activeAdmin,
  onClose,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'background' | 'promo_upload' | 'pengumuman' | 'media' | 'admin' | 'kolom'>('profil');
  const [formData, setFormData] = useState<SchoolSettings>({ 
    ...settings,
    whatsappGroupUrl: settings.whatsappGroupUrl || '',
    promoMediaUploads: settings.promoMediaUploads || [],
    announcements: settings.announcements || [],
    appBackgroundUrl: settings.appBackgroundUrl || '',
    appBackgroundOpacity: settings.appBackgroundOpacity ?? 0.92,
  });
  const [adminList, setAdminList] = useState<AdminAccount[]>([...admins]);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Helper to show success feedback
  const triggerSuccessFeedback = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4000);
  };

  // --- TAB: LATAR BELAKANG (BACKGROUND) APLIKASI ---
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        triggerSuccessFeedback('Ukuran file foto background maksimal 8MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = {
          ...formData,
          appBackgroundUrl: reader.result as string,
        };
        setFormData(updated);
        StorageService.saveSettings(updated, activeAdmin.fullName);
        onSaveSettings(updated);
        triggerSuccessFeedback('✓ Latar belakang (background) aplikasi berhasil diunggah dan disimpan!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBackground = () => {
    StorageService.saveSettings(formData, activeAdmin.fullName);
    onSaveSettings(formData);
    triggerSuccessFeedback('✓ Pengaturan latar belakang (background) aplikasi berhasil disimpan!');
  };

  const handleRemoveBackground = () => {
    const updated = {
      ...formData,
      appBackgroundUrl: '',
    };
    setFormData(updated);
    StorageService.saveSettings(updated, activeAdmin.fullName);
    onSaveSettings(updated);
    triggerSuccessFeedback('✓ Latar belakang dikembalikan ke warna tema default.');
  };

  // --- TAB 1: PROFIL & KONTAK SEKOLAH ---
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    StorageService.saveSettings(formData, activeAdmin.fullName);
    onSaveSettings(formData);
    triggerSuccessFeedback('✓ Profil & Kontak Sekolah berhasil disimpan dan diperbarui di dashboard!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = {
          ...formData,
          logoUrl: reader.result as string,
        };
        setFormData(updated);
        StorageService.saveSettings(updated, activeAdmin.fullName);
        onSaveSettings(updated);
        triggerSuccessFeedback('✓ Logo sekolah berhasil diperbarui!');
      };
      reader.readAsDataURL(file);
    }
  };

  // --- TAB 2: MEDIA SOSIAL & VIDEO ---
  const handleSaveMedia = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    StorageService.saveSettings(formData, activeAdmin.fullName);
    onSaveSettings(formData);
    triggerSuccessFeedback('✓ Link Media Sosial & Video Promosi berhasil disimpan ke dashboard!');
  };

  // --- TAB 3: UPLOAD BROSUR, SPANDUK & POSTER ---
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoCategory, setNewPromoCategory] = useState<'Brosur' | 'Spanduk' | 'Poster' | 'Banner'>('Brosur');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoImage, setNewPromoImage] = useState<string>('');
  const [promoUploadError, setPromoUploadError] = useState('');

  const handlePromoPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPromoUploadError('');
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setPromoUploadError('Ukuran file foto maksimal 8MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPromoImage(reader.result as string);
        if (!newPromoTitle.trim()) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setNewPromoTitle(autoTitle);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPromoItem = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoUploadError('');
    if (!newPromoTitle.trim()) {
      setPromoUploadError('Judul / Keterangan media wajib diisi!');
      return;
    }
    if (!newPromoImage) {
      setPromoUploadError('Silakan pilih file foto / gambar (PNG, JPG) terlebih dahulu!');
      return;
    }

    const newItem: PromoMediaItem = {
      id: `promo-${Date.now()}`,
      title: newPromoTitle.trim(),
      category: newPromoCategory,
      imageUrl: newPromoImage,
      uploadDate: new Date().toISOString().substring(0, 10),
      description: newPromoDesc.trim(),
    };

    const updatedList = [newItem, ...(formData.promoMediaUploads || [])];
    const updatedSettings: SchoolSettings = {
      ...formData,
      promoMediaUploads: updatedList,
    };

    setFormData(updatedSettings);
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    onSaveSettings(updatedSettings);

    setNewPromoTitle('');
    setNewPromoDesc('');
    setNewPromoImage('');
    triggerSuccessFeedback(`✓ Berhasil menambahkan ${newPromoCategory} "${newItem.title}" ke dashboard!`);
  };

  const handleDeletePromoItem = (id: string) => {
    const updatedList = (formData.promoMediaUploads || []).filter(item => item.id !== id);
    const updatedSettings: SchoolSettings = {
      ...formData,
      promoMediaUploads: updatedList,
    };
    setFormData(updatedSettings);
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    onSaveSettings(updatedSettings);
    triggerSuccessFeedback('✓ Media promosi berhasil dihapus dan diperbarui!');
  };

  const handleSavePromoSettings = () => {
    StorageService.saveSettings(formData, activeAdmin.fullName);
    onSaveSettings(formData);
    triggerSuccessFeedback('✓ Semua perubahan Brosur, Spanduk & Poster berhasil disimpan ke dashboard!');
  };

  // --- TAB 4: PENGUMUMAN & INFO PENTING SPMB ---
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<SchoolAnnouncement['category']>('PENTING');
  const [annContent, setAnnContent] = useState('');
  const [annImage, setAnnImage] = useState<string>('');
  const [annIsPinned, setAnnIsPinned] = useState(false);
  const [annIsActive, setAnnIsActive] = useState(true);
  const [annError, setAnnError] = useState('');

  const handleAnnouncementPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAnnError('');
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setAnnError('Ukuran file foto pengumuman maksimal 8MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnnImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveOrUpdateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnError('');
    if (!annTitle.trim()) {
      setAnnError('Judul pengumuman wajib diisi!');
      return;
    }
    if (!annContent.trim()) {
      setAnnError('Deskripsi / isi pengumuman wajib diisi!');
      return;
    }

    const currentList = [...(formData.announcements || [])];

    if (editingAnnId) {
      // Update existing
      const idx = currentList.findIndex(a => a.id === editingAnnId);
      if (idx !== -1) {
        currentList[idx] = {
          ...currentList[idx],
          title: annTitle.trim(),
          category: annCategory,
          content: annContent.trim(),
          imageUrl: annImage || currentList[idx].imageUrl,
          isPinned: annIsPinned,
          isActive: annIsActive,
        };
      }
      triggerSuccessFeedback('✓ Pengumuman berhasil diperbarui dan disimpan!');
    } else {
      // Add new
      const newAnn: SchoolAnnouncement = {
        id: `ann-${Date.now()}`,
        title: annTitle.trim(),
        category: annCategory,
        content: annContent.trim(),
        imageUrl: annImage || undefined,
        publishedDate: new Date().toISOString().substring(0, 10),
        author: activeAdmin.fullName || 'Admin Panitia SPMB',
        isPinned: annIsPinned,
        isActive: annIsActive,
      };
      currentList.unshift(newAnn);
      triggerSuccessFeedback(`✓ Pengumuman "${newAnn.title}" berhasil dipublikasikan ke dashboard!`);
    }

    const updatedSettings: SchoolSettings = {
      ...formData,
      announcements: currentList,
    };

    setFormData(updatedSettings);
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    StorageService.saveAnnouncements(currentList, activeAdmin.fullName);
    onSaveSettings(updatedSettings);

    // Reset form
    setEditingAnnId(null);
    setAnnTitle('');
    setAnnCategory('PENTING');
    setAnnContent('');
    setAnnImage('');
    setAnnIsPinned(false);
    setAnnIsActive(true);
  };

  const handleEditAnnouncementClick = (ann: SchoolAnnouncement) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnCategory(ann.category);
    setAnnContent(ann.content);
    setAnnImage(ann.imageUrl || '');
    setAnnIsPinned(!!ann.isPinned);
    setAnnIsActive(ann.isActive);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAnnId(null);
    setAnnTitle('');
    setAnnCategory('PENTING');
    setAnnContent('');
    setAnnImage('');
    setAnnIsPinned(false);
    setAnnIsActive(true);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updatedList = (formData.announcements || []).filter(a => a.id !== id);
    const updatedSettings: SchoolSettings = {
      ...formData,
      announcements: updatedList,
    };
    setFormData(updatedSettings);
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    StorageService.saveAnnouncements(updatedList, activeAdmin.fullName);
    onSaveSettings(updatedSettings);
    triggerSuccessFeedback('✓ Pengumuman telah dihapus dari dashboard!');
  };

  const handleTogglePinAnnouncement = (id: string) => {
    const updatedList = (formData.announcements || []).map(a => 
      a.id === id ? { ...a, isPinned: !a.isPinned } : a
    );
    const updatedSettings: SchoolSettings = {
      ...formData,
      announcements: updatedList,
    };
    setFormData(updatedSettings);
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    StorageService.saveAnnouncements(updatedList, activeAdmin.fullName);
    onSaveSettings(updatedSettings);
    triggerSuccessFeedback('✓ Status sematan pengumuman diperbarui!');
  };

  const handleToggleActiveAnnouncement = (id: string) => {
    const updatedList = (formData.announcements || []).map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    const updatedSettings: SchoolSettings = {
      ...formData,
      announcements: updatedList,
    };
    setFormData(updatedSettings);
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    StorageService.saveAnnouncements(updatedList, activeAdmin.fullName);
    onSaveSettings(updatedSettings);
    triggerSuccessFeedback('✓ Status visibilitas pengumuman diperbarui!');
  };

  // --- TAB 5: ADMIN BAYANGAN (MULTI-ADMIN) ---
  const [newSubUsername, setNewSubUsername] = useState('');
  const [newSubFullName, setNewSubFullName] = useState('');
  const [adminToDelete, setAdminToDelete] = useState<AdminAccount | null>(null);

  const handleAddShadowAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubUsername.trim() || !newSubFullName.trim()) return;

    const created = StorageService.addShadowAdmin(newSubUsername, newSubFullName, activeAdmin.fullName);
    setAdminList(prev => [...prev, created]);
    setNewSubUsername('');
    setNewSubFullName('');
    triggerSuccessFeedback(`✓ Admin bayangan "${created.fullName}" berhasil ditambahkan!`);
  };

  const handleConfirmDeleteAdmin = () => {
    if (!adminToDelete) return;
    const ok = StorageService.deleteAdmin(adminToDelete.id, activeAdmin.fullName);
    if (ok) {
      setAdminList(prev => prev.filter(a => a.id !== adminToDelete.id));
      triggerSuccessFeedback(`✓ Akses admin "${adminToDelete.fullName}" berhasil dicabut.`);
    }
    setAdminToDelete(null);
  };

  // --- TAB 6: CUSTOM COLUMN ---
  const [newColLabel, setNewColLabel] = useState('');
  const [newColPlaceholder, setNewColPlaceholder] = useState('');
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  const handleAddColumn = () => {
    if (!newColLabel.trim()) return;
    const colId = `custom_${Date.now()}`;
    const updatedCols = [
      ...(formData.customColumns || []),
      {
        id: colId,
        label: newColLabel.trim(),
        placeholder: newColPlaceholder.trim() || 'Isi data...',
        required: false,
      },
    ];
    const updatedSettings = { ...formData, customColumns: updatedCols };
    setFormData(updatedSettings);
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    onSaveSettings(updatedSettings);
    setNewColLabel('');
    setNewColPlaceholder('');
    triggerSuccessFeedback('✓ Kolom kustom baru berhasil ditambahkan ke formulir!');
  };

  const handleConfirmDeleteColumn = () => {
    if (!columnToDelete) return;
    const filtered = (formData.customColumns || []).filter(c => c.id !== columnToDelete);
    const updatedSettings = { ...formData, customColumns: filtered };
    setFormData(updatedSettings);
    StorageService.saveSettings(updatedSettings, activeAdmin.fullName);
    onSaveSettings(updatedSettings);
    setColumnToDelete(null);
    triggerSuccessFeedback('✓ Kolom kustom berhasil dihapus.');
  };

  // Universal Save for current whole modal
  const handleUniversalSave = () => {
    StorageService.saveSettings(formData, activeAdmin.fullName);
    if (formData.announcements) {
      StorageService.saveAnnouncements(formData.announcements, activeAdmin.fullName);
    }
    onSaveSettings(formData);
    triggerSuccessFeedback('✓ Seluruh data pengaturan berhasil disimpan dan diterapkan ke dashboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Pengaturan Aplikasi & Manajemen Admin
              </h3>
              <p className="text-xs text-slate-400">
                Akses Eksklusif Super Admin: Kelola Profil Sekolah, Media Promo, Pengumuman & Sub-Admin
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

        {/* Tab Controls Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold px-6 gap-1 pt-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profil')}
            className={`py-2.5 px-3.5 rounded-t-xl border-t border-x cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'profil'
                ? 'bg-white border-slate-200 text-blue-600 font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Profil & Kontak Sekolah</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('promo_upload')}
            className={`py-2.5 px-3.5 rounded-t-xl border-t border-x cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'promo_upload'
                ? 'bg-white border-slate-200 text-blue-600 font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Upload Brosur, Spanduk & Poster ({formData.promoMediaUploads?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pengumuman')}
            className={`py-2.5 px-3.5 rounded-t-xl border-t border-x cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pengumuman'
                ? 'bg-white border-slate-200 text-blue-600 font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-rose-500" />
            <span>Pengumuman & Info Penting ({formData.announcements?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('background')}
            className={`py-2.5 px-3.5 rounded-t-xl border-t border-x cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'background'
                ? 'bg-white border-slate-200 text-blue-600 font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span>Latar Belakang (Background)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-2.5 px-3.5 rounded-t-xl border-t border-x cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'bg-white border-slate-200 text-blue-600 font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Sosial Media & Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2.5 px-3.5 rounded-t-xl border-t border-x cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white border-slate-200 text-blue-600 font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Bayangan ({adminList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kolom')}
            className={`py-2.5 px-3.5 rounded-t-xl border-t border-x cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'kolom'
                ? 'bg-white border-slate-200 text-blue-600 font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-500" />
            <span>Kolom Kustom ({formData.customColumns?.length || 0})</span>
          </button>
        </div>

        {/* Floating Success Alert Toast */}
        {saveSuccessMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 shadow-sm animate-fade-in shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Tab Body Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ========================================================= */}
          {/* TAB 1: PROFIL & KONTAK SEKOLAH */}
          {/* ========================================================= */}
          {activeTab === 'profil' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Identitas Resmi Sekolah & Kontak SPMB
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data profil akan langsung terhubung ke Kop Surat Cetak PDF A4, Header, dan Footer aplikasi.
                  </p>
                </div>
                {/* Dedicated Save Profile Button at Top */}
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil & Kontak</span>
                </button>
              </div>

              {/* Logo Sekolah */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-800 block">Logo & Lambang Sekolah</span>
                  <span className="text-[11px] text-slate-500 block mb-2">Tampil pada Kop Surat resmi PDF A4 dan halaman depan</span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Logo Baru</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Resmi Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Ajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline / Slogan Sekolah</label>
                <input
                  type="text"
                  value={formData.schoolTagline}
                  onChange={(e) => setFormData({ ...formData, schoolTagline: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Kampus Lengkap (Kop Surat & Map)
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon Kantor</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Panitia (628...) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi Panitia</label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Link Grup WhatsApp Calon Siswa Baru */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-emerald-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Link Grup WhatsApp Calon Siswa Baru (Auto-Redirect Pendaftar)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Arahkan Pendaftar
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mb-2 leading-relaxed">
                  Setelah calon siswa berhasil submit pendaftaran online, sistem akan otomatis mengarahkan dan memandu mereka untuk langsung bergabung ke grup WhatsApp ini.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Contoh: https://chat.whatsapp.com/Gxyz123abc..."
                    value={formData.whatsappGroupUrl || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappGroupUrl: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  {formData.whatsappGroupUrl && (
                    <a
                      href={formData.whatsappGroupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0 shadow-sm"
                    >
                      <span>Buka Link Grup</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={formData.headmasterName}
                    onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ketua Panitia SPMB</label>
                  <input
                    type="text"
                    value={formData.committeeHeadName}
                    onChange={(e) => setFormData({ ...formData, committeeHeadName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Bottom Action Save Profile */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Perubahan akan langsung tersimpan dan aktif di seluruh halaman publik.
                </span>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil & Kontak</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: UPLOAD BROSUR, SPANDUK & POSTER */}
          {/* ========================================================= */}
          {activeTab === 'promo_upload' && (
            <div className="space-y-6">
              
              {/* Header Tab with Prominent Save Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <span>Manajemen Brosur, Spanduk & Poster SPMB</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {formData.promoMediaUploads?.length || 0} Media Terpasang
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unggah foto promosi agar langsung tampil di Galeri Promo halaman depan publik aplikasi.
                  </p>
                </div>

                {/* DEDICATED TOP SAVE BUTTON */}
                <button
                  type="button"
                  onClick={handleSavePromoSettings}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Media Promo</span>
                </button>
              </div>

              {promoUploadError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{promoUploadError}</span>
                </div>
              )}

              {/* Form Upload Media */}
              <form onSubmit={handleAddPromoItem} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block">
                  Unggah Foto Media Baru (Brosur / Spanduk / Poster)
                </span>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Pilih Kategori Media <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newPromoCategory}
                      onChange={(e) => setNewPromoCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Brosur">Brosur Pendaftaran Resmi</option>
                      <option value="Spanduk">Spanduk / Banner Sekolah</option>
                      <option value="Poster">Poster Jurusan & Beasiswa</option>
                      <option value="Banner">Banner Promosi Digital</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Judul Media <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Brosur Resmi SPMB 2026/2027"
                      value={newPromoTitle}
                      onChange={(e) => setNewPromoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deskripsi Singkat / Keterangan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Brosur memuat rincian 6 jurusan keahlian dan beasiswa industri..."
                    value={newPromoDesc}
                    onChange={(e) => setNewPromoDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Upload Input Area */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pilih File Foto (PNG, JPG, JPEG, WEBP - Maksimal 8MB) <span className="text-rose-500">*</span>
                  </label>
                  <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
                    <Upload className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="font-bold text-slate-800 text-xs">
                      {newPromoImage ? '✓ Foto siap diunggah! Klik jika ingin mengganti file' : 'Klik untuk Memilih File Gambar (PNG / JPG)'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Mendukung foto landscape (spanduk) maupun portrait (brosur/poster)
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={handlePromoPhotoUpload}
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {newPromoImage && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                    <img
                      src={newPromoImage}
                      alt="Preview"
                      className="w-24 h-16 object-cover rounded-lg border shadow-xs"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block text-xs">{newPromoTitle || 'Foto Media Promo'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mt-1 inline-block">
                        {newPromoCategory}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambahkan ke Dashboard Promo</span>
                  </button>
                </div>
              </form>

              {/* List of Uploaded Media */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Daftar Media Promo yang Ditampilkan di Dashboard ({formData.promoMediaUploads?.length || 0})
                  </h4>
                  {/* BOTTOM SAVE BUTTON */}
                  <button
                    type="button"
                    onClick={handleSavePromoSettings}
                    className="inline-flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan Media</span>
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto">
                  {(formData.promoMediaUploads || []).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-start gap-3 relative group hover:border-blue-300 transition"
                    >
                      <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.category === 'Brosur' ? 'bg-amber-100 text-amber-800' :
                            item.category === 'Spanduk' ? 'bg-emerald-100 text-emerald-800' :
                            item.category === 'Poster' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.uploadDate}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-900 text-xs truncate" title={item.title}>
                          {item.title}
                        </h5>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                        <a
                          href={item.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:underline font-bold mt-1 inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Lihat Gambar Penuh
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePromoItem(item.id)}
                        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus media ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(!formData.promoMediaUploads || formData.promoMediaUploads.length === 0) && (
                    <div className="col-span-2 text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Belum ada media brosur, spanduk, atau poster yang diunggah. Silakan unggah foto pada formulir di atas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PENGUMUMAN & INFO PENTING SPMB (NEW!) */}
          {/* ========================================================= */}
          {activeTab === 'pengumuman' && (
            <div className="space-y-6">
              
              {/* Header with Save All Announcements Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-rose-600" />
                    <span>Kelola Pengumuman & Info Penting SPMB</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                      {formData.announcements?.length || 0} Pengumuman
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informasi penting yang Anda tambahkan di sini akan langsung ditampilkan kepada seluruh peserta di dashboard aplikasi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUniversalSave}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Seluruh Pengumuman</span>
                </button>
              </div>

              {annError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{annError}</span>
                </div>
              )}

              {/* Form Tambah / Edit Pengumuman */}
              <form onSubmit={handleSaveOrUpdateAnnouncement} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    {editingAnnId ? '✏️ Edit Pengumuman SPMB' : '📢 Publikasikan Pengumuman / Info Baru'}
                  </span>
                  {editingAnnId && (
                    <button
                      type="button"
                      onClick={handleCancelEditAnnouncement}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Judul Pengumuman <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jadwal Tes Minat Bakat & Wawancara Kejuruan Gelombang 1"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kategori Info <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENTING">🔴 PENTING & UTAMA</option>
                      <option value="JADWAL_TES">📅 JADWAL TES & SELEKSI</option>
                      <option value="KELULUSAN">🎓 HASIL KELULUSAN</option>
                      <option value="DAFTAR_ULANG">📋 DAFTAR ULANG & BERKAS</option>
                      <option value="BEASISWA">⭐ PROGRAM BEASISWA</option>
                      <option value="INFORMASI">ℹ️ INFORMASI UMUM</option>
                    </select>
                  </div>
                </div>

                {/* Deskripsi / Isi Pengumuman */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deskripsi / Isi Lengkap Pengumuman <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan isi pengumuman secara lengkap, instruksi bagi calon siswa, berkas yang perlu dibawa, waktu pelaksanaan, dan kontak panitia..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                {/* Upload Foto / Banner Pengumuman */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Upload Foto / Banner Pengumuman (PNG, JPG, WEBP - Opsional / Max 8MB)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>{annImage ? 'Ganti Foto Pengumuman' : 'Pilih Foto Pengumuman'}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                        onChange={handleAnnouncementPhotoUpload}
                      />
                    </label>

                    {annImage && (
                      <div className="flex items-center gap-2">
                        <img
                          src={annImage}
                          alt="Preview"
                          className="w-16 h-12 object-cover rounded-lg border shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setAnnImage('')}
                          className="text-xs text-rose-600 hover:underline font-bold"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkbox Opsi Tampilan */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annIsPinned}
                      onChange={(e) => setAnnIsPinned(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>Sematkan di Teratas (Pinned)</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annIsActive}
                      onChange={(e) => setAnnIsActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-slate-800 text-xs">
                      Tampilkan di Dashboard Publik (Aktif)
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingAnnId && (
                    <button
                      type="button"
                      onClick={handleCancelEditAnnouncement}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingAnnId ? 'Simpan Perubahan Pengumuman' : 'Publikasikan Pengumuman Sekarang'}</span>
                  </button>
                </div>
              </form>

              {/* Daftar Pengumuman Yang Sudah Dibuat */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Daftar Pengumuman Terbit ({formData.announcements?.length || 0})
                </h4>

                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {(formData.announcements || []).map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 bg-white rounded-2xl border transition shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                        ann.isPinned ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
                      }`}
                    >
                      {ann.imageUrl && (
                        <div className="w-24 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border">
                          <img
                            src={ann.imageUrl}
                            alt={ann.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            ann.category === 'PENTING' ? 'bg-rose-100 text-rose-800' :
                            ann.category === 'JADWAL_TES' ? 'bg-blue-100 text-blue-800' :
                            ann.category === 'KELULUSAN' ? 'bg-emerald-100 text-emerald-800' :
                            ann.category === 'DAFTAR_ULANG' ? 'bg-amber-100 text-amber-800' :
                            ann.category === 'BEASISWA' ? 'bg-purple-100 text-purple-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {ann.category}
                          </span>

                          {ann.isPinned && (
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1">
                              <Pin className="w-3 h-3 fill-current" /> Pinned
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ann.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {ann.isActive ? 'Aktif di Dashboard' : 'Disembunyikan'}
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono ml-auto">
                            {ann.publishedDate}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-slate-900 text-sm mb-1 leading-snug">
                          {ann.title}
                        </h5>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {ann.content}
                        </p>
                      </div>

                      <div className="flex items-center sm:flex-col gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleTogglePinAnnouncement(ann.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            ann.isPinned ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500 hover:text-amber-600'
                          }`}
                          title="Sematkan di teratas"
                        >
                          <Pin className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActiveAnnouncement(ann.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            ann.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                          title="Ubah visibilitas dashboard"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditAnnouncementClick(ann)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                          title="Edit Pengumuman"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!formData.announcements || formData.announcements.length === 0) && (
                    <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Belum ada pengumuman yang diterbitkan. Gunakan formulir di atas untuk membagikan info resmi ke pendaftar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: LATAR BELAKANG (BACKGROUND) APLIKASI */}
          {/* ========================================================= */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-600" />
                    <span>Latar Belakang (Background) Aplikasi</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sesuaikan gambar latar belakang visual aplikasi agar selaras dengan identitas SMK Lentera Bangsa 2.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {formData.appBackgroundUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Bawaan</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveBackground}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Latar Belakang</span>
                  </button>
                </div>
              </div>

              {/* Upload Box */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800 block">
                  Unggah Gambar Latar Kustom (PNG / JPG / WEBP)
                </span>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-48 h-28 rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 overflow-hidden relative flex items-center justify-center shrink-0">
                    {formData.appBackgroundUrl ? (
                      <img
                        src={formData.appBackgroundUrl}
                        alt="Preview Background"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px] font-bold block">Tema Standar</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md">
                      <Upload className="w-4 h-4" />
                      <span>Pilih Foto dari Perangkat (Maks 8MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackgroundUpload}
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Rekomendasi resolusi: 1920x1080 piksel (Horizontal). Tampilan aplikasi otomatis dilengkapi lapisan pelindung kontras sehingga seluruh teks dan tombol tetap sangat jelas dibaca.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preset Background Options */}
              <div className="space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800 block">
                  Atau Pilih Dari Pilihan Latar Belakang Sekolah Siap Pakai:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      name: 'Kampus Modern',
                      url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80',
                    },
                    {
                      name: 'Gedung Sekolah',
                      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80',
                    },
                    {
                      name: 'Teknologi & Komputer',
                      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
                    },
                    {
                      name: 'Workshop & Kejuruan',
                      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=80',
                    },
                  ].map((preset) => (
                    <div
                      key={preset.name}
                      onClick={() => {
                        const updated = { ...formData, appBackgroundUrl: preset.url };
                        setFormData(updated);
                        StorageService.saveSettings(updated, activeAdmin.fullName);
                        onSaveSettings(updated);
                        triggerSuccessFeedback(`✓ Latar belakang diubah ke preset: ${preset.name}`);
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition shadow-xs hover:shadow-md ${
                        formData.appBackgroundUrl === preset.url
                          ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="h-20 w-full overflow-hidden">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-2 bg-white text-center">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">
                          {preset.name}
                        </span>
                        {formData.appBackgroundUrl === preset.url && (
                          <span className="text-[9px] font-extrabold text-indigo-600 uppercase">Aktif</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Preview Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl relative overflow-hidden border border-slate-800">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{
                    backgroundImage: formData.appBackgroundUrl
                      ? `url(${formData.appBackgroundUrl})`
                      : 'none',
                  }}
                ></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                      Simulasi Tampilan Langsung
                    </span>
                    <h5 className="text-sm font-extrabold mt-0.5">{formData.schoolName}</h5>
                    <p className="text-[11px] text-slate-300">
                      Tampilan pendaftar dengan latar belakang visual yang dipilih.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveBackground}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition shrink-0"
                  >
                    Terapkan Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: SOSIAL MEDIA & VIDEO */}
          {/* ========================================================= */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Link Media Promosi Eksternal & Ticker Teks
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konfigurasi teks berjalan banner atas dan embed video Youtube serta media sosial sekolah.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveMedia()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Media</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teks Berjalan / Pengumuman Banner (Atas):
                </label>
                <textarea
                  rows={2}
                  value={formData.announcementTicker}
                  onChange={(e) => setFormData({ ...formData, announcementTicker: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Video Promosi Sekolah (YouTube URL / Embed):
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.promoVideoUrl}
                  onChange={(e) => setFormData({ ...formData, promoVideoUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Akun / Link TikTok</label>
                  <input
                    type="text"
                    value={formData.tiktokUrl}
                    onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Akun / Link Instagram</label>
                  <input
                    type="text"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Halaman Facebook</label>
                  <input
                    type="text"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Template Google Spreadsheet Sekolah:
                </label>
                <input
                  type="text"
                  value={formData.googleSheetSyncUrl}
                  onChange={(e) => setFormData({ ...formData, googleSheetSyncUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  Link Grup WhatsApp Calon Siswa Baru (Auto-Redirect):
                </label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={formData.whatsappGroupUrl || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappGroupUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveMedia()}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Media</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: ADMIN BAYANGAN (MULTI-ADMIN) */}
          {/* ========================================================= */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong className="block text-amber-950 font-bold mb-1">Ketentuan Hak Akses Admin Bayangan (Sub-Admin):</strong>
                Admin Bayangan dapat melihat, mengubah status pendaftar, dan mencetak dokumen tetapi <strong>TIDAK DAPAT</strong> mengakses menu Pengaturan Sekolah, Spreadsheet Sync, dan mengelola admin lain demi keamanan.
              </div>

              {/* Form Tambah Sub Admin */}
              <form onSubmit={handleAddShadowAdmin} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block">
                  Tambah Admin Bayangan Baru
                </span>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Username Login Sub-Admin:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: petugas_ani"
                      value={newSubUsername}
                      onChange={(e) => setNewSubUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Petugas:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Ani Rohayati, S.Pd."
                      value={newSubFullName}
                      onChange={(e) => setNewSubFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
                  <span>Password Akses Standar: <strong>123LB2</strong></span>
                  <span className="text-[10px] text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded">Terselubung Otomatis</span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftarkan Sub-Admin</span>
                  </button>
                </div>
              </form>

              {/* List of Admins */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Daftar Pengguna Administrator Terdaftar ({adminList.length})
                </h4>

                <div className="space-y-2">
                  {adminList.map((adm) => (
                    <div
                      key={adm.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                          adm.role === 'SUPER_ADMIN' ? 'bg-amber-600' : 'bg-slate-700'
                        }`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{adm.fullName}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              adm.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {adm.role === 'SUPER_ADMIN' ? 'Admin Utama' : 'Admin Bayangan'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Username: {adm.username} • Dibuat: {adm.createdAt}
                          </span>
                        </div>
                      </div>

                      {adm.role !== 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => setAdminToDelete(adm)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Akun Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: KOLOM FORM KUSTOM */}
          {/* ========================================================= */}
          {activeTab === 'kolom' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <strong className="block text-blue-950 font-bold mb-1">Dinamika Formulir Pendaftaran:</strong>
                Anda dapat menambahkan kolom/pertanyaan baru ke dalam formulir pendaftaran calon siswa tanpa mengubah struktur sistem dasar.
              </div>

              {/* Form Tambah Kolom */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block">
                  Tambah Pertanyaan / Field Baru
                </span>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kolom / Pertanyaan:</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ukuran Wearpack Siswa"
                      value={newColLabel}
                      onChange={(e) => setNewColLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contoh Isian (Placeholder):</label>
                    <input
                      type="text"
                      placeholder="Contoh: M / L / XL"
                      value={newColPlaceholder}
                      onChange={(e) => setNewColPlaceholder(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambahkan ke Formulir</span>
                  </button>
                </div>
              </div>

              {/* List of Custom Columns */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Kolom Tambahan Aktif ({formData.customColumns?.length || 0})
                </h4>

                <div className="space-y-2">
                  {(formData.customColumns || []).map((col) => (
                    <div
                      key={col.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">{col.label}</span>
                        <span className="text-[11px] text-slate-400">Placeholder: {col.placeholder}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setColumnToDelete(col.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleUniversalSave}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Kolom Kustom</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Universal Sticky Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 rounded-b-3xl flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Tab Aktif: <strong>{
              activeTab === 'profil' ? 'Profil & Kontak Sekolah' :
              activeTab === 'background' ? 'Latar Belakang (Background) Aplikasi' :
              activeTab === 'promo_upload' ? 'Upload Brosur, Spanduk & Poster' :
              activeTab === 'pengumuman' ? 'Pengumuman & Info Penting SPMB' :
              activeTab === 'media' ? 'Media Sosial & Video' :
              activeTab === 'admin' ? 'Admin Bayangan' : 'Kolom Kustom'
            }</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleUniversalSave}
              className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan Sekarang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Admin In-App Confirmation Modal */}
      {adminToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Cabut Akses Admin?</h4>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Apakah Anda yakin ingin menghapus akses untuk admin: <strong>{adminToDelete.fullName}</strong> ({adminToDelete.username})?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAdmin}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer"
              >
                Ya, Cabut Akses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Column In-App Confirmation Modal */}
      {columnToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900">Hapus Kolom Kustom?</h4>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Kolom formulir ini akan dihapus dari konfigurasi pertanyaan formulir pendaftaran.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setColumnToDelete(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteColumn}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer"
              >
                Ya, Hapus Kolom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
