
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect
} from 'react';

import {
  SchoolAnnouncement,
  SchoolSettings
} from '../types/spmb';

import {
  Calendar,
  Pin,
  ChevronRight,
  Eye,
  X,
  Share2,
  Download,
  Search,
  Sparkles,
  Megaphone,
  User
} from 'lucide-react';

interface Props {
  announcements: SchoolAnnouncement[];
  settings: SchoolSettings;
  onOpenRegister?: () => void;
}

export const AnnouncementsSection: React.FC<Props> = ({
  announcements,
  settings,
  onOpenRegister
}) => {

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<SchoolAnnouncement | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<string>('ALL');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  // ==========================================
  // SAFE DATA HANDLING
  // ==========================================

  const safeAnnouncements = Array.isArray(announcements)
    ? announcements.filter(Boolean)
    : [];

  const safeSchoolName = settings?.schoolName || 'SMK LENTERA BANGSA 2';

  const safeAddress = settings?.address || '-';

  // ==========================================
  // DATE SORTING
  // ==========================================

  const getDateValue = useCallback((date: unknown): number => {
    if (!date) return 0;

    const timestamp = new Date(date as string).getTime();

    return Number.isFinite(timestamp) ? timestamp : 0;
  }, []);

  // ==========================================
  // ACTIVE ANNOUNCEMENTS
  // ==========================================

  const activeList = useMemo(() => {
    return safeAnnouncements.filter(
      item => item.isActive === true
    );
  }, [announcements]);

  // ==========================================
  // SORT ANNOUNCEMENTS
  // PINNED FIRST, NEWEST DATE
  // ==========================================

  const sortedList = useMemo(() => {

    return [...activeList].sort((a, b) => {

      if (a.isPinned && !b.isPinned) return -1;

      if (!a.isPinned && b.isPinned) return 1;

      return (
        getDateValue(b.publishedDate) -
        getDateValue(a.publishedDate)
      );

    });

  }, [activeList, getDateValue]);

  // ==========================================
  // SEARCH AND CATEGORY FILTER
  // ==========================================

  const filteredList = useMemo(() => {

    const query = searchQuery.trim().toLowerCase();

    return sortedList.filter(item => {

      const category = item.category || '';

      const title = String(item.title || '').toLowerCase();

      const content = String(item.content || '').toLowerCase();

      const author = String(item.author || '').toLowerCase();

      const matchCategory =
        selectedCategory === 'ALL' ||
        category === selectedCategory;

      const matchSearch =
        !query ||
        title.includes(query) ||
        content.includes(query) ||
        author.includes(query);

      return matchCategory && matchSearch;

    });

  }, [sortedList, selectedCategory, searchQuery]);

  // ==========================================
  // CATEGORY BADGE
  // ==========================================

  const getCategoryBadge = (
    cat: SchoolAnnouncement['category']
  ) => {

    switch (cat) {

      case 'PENTING':
        return {
          label: 'PENTING & UTAMA',
          bg: 'bg-rose-100 text-rose-800 border-rose-300'
        };

      case 'JADWAL_TES':
        return {
          label: 'JADWAL TES & SELEKSI',
          bg: 'bg-blue-100 text-blue-800 border-blue-300'
        };

      case 'KELULUSAN':
        return {
          label: 'HASIL KELULUSAN',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };

      case 'DAFTAR_ULANG':
        return {
          label: 'DAFTAR ULANG & BERKAS',
          bg: 'bg-amber-100 text-amber-800 border-amber-300'
        };

      case 'BEASISWA':
        return {
          label: 'PROGRAM BEASISWA',
          bg: 'bg-purple-100 text-purple-800 border-purple-300'
        };

      default:
        return {
          label: 'INFORMASI UMUM',
          bg: 'bg-slate-100 text-slate-800 border-slate-300'
        };
    }
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = useCallback(() => {
    setSelectedAnnouncement(null);
  }, []);

  // ==========================================
  // ESCAPE KEY HANDLER
  // ==========================================

  useEffect(() => {

    if (!selectedAnnouncement) return;

    const handleKeyDown = (event: KeyboardEvent) => {

      if (event.key === 'Escape') {
        closeModal();
      }

    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };

  }, [selectedAnnouncement, closeModal]);

  // ==========================================
  // IMAGE ERROR HANDLING
  // ==========================================

  const handleImageError = useCallback((id: string) => {

    setImageErrors(previous => {

      if (previous[id]) return previous;

      return {
        ...previous,
        [id]: true
      };

    });

  }, []);

  // ==========================================
  // WHATSAPP SHARE
  // ==========================================

  const handleShareAnnouncement = useCallback(
    (ann: SchoolAnnouncement) => {

      if (!ann) return;

      const title = ann.title || 'Pengumuman Resmi';

      const content = String(ann.content || '');

      const excerpt = content.length > 200
        ? content.substring(0, 200) + '...'
        : content;

      const text = [
        '📢 PENGUMUMAN RESMI SPMB SMK LENTERA BANGSA 2',
        '',
        title,
        `Kategori: ${ann.category || 'INFORMASI UMUM'}`,
        `Tanggal: ${ann.publishedDate || '-'}`,
        '',
        excerpt,
        '',
        'Info selengkapnya kunjungi website resmi SPMB:',
        window.location.href
      ].join('\n');

      const whatsappUrl =
        `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

      window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      );

    },
    []
  );

  // ==========================================
  // CATEGORY FILTER BUTTON
  // ==========================================

  const categories = [
    {
      id: 'ALL',
      label: `Semua Info (${activeList.length})`,
      active: 'bg-blue-600 text-white shadow-md shadow-blue-500/25',
      inactive: 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
    },
    {
      id: 'PENTING',
      label: '🔴 Penting & Utama',
      active: 'bg-rose-600 text-white shadow-md',
      inactive: 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
    },
    {
      id: 'JADWAL_TES',
      label: '📅 Jadwal Tes',
      active: 'bg-blue-600 text-white shadow-md',
      inactive: 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
    },
    {
      id: 'DAFTAR_ULANG',
      label: '📋 Daftar Ulang',
      active: 'bg-amber-600 text-white shadow-md',
      inactive: 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
    },
    {
      id: 'KELULUSAN',
      label: '🎓 Kelulusan',
      active: 'bg-emerald-600 text-white shadow-md',
      inactive: 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
    },
    {
      id: 'BEASISWA',
      label: '⭐ Beasiswa',
      active: 'bg-purple-600 text-white shadow-md',
      inactive: 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
    }
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (

    <section
      id="pengumuman"
      className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 relative"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">

          <div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold mb-3">

              <Megaphone className="w-4 h-4 text-blue-600" />

              <span>Pusat Informasi & Pengumuman Resmi</span>

            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">

              Pengumuman & Info Penting SPMB

            </h2>

            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">

              Dapatkan informasi terkini seputar tahapan pendaftaran,
              tes seleksi, jadwal verifikasi berkas, dan pengumuman
              hasil kelulusan {safeSchoolName}.

            </p>

          </div>

          {/* SEARCH */}

          <div className="flex items-center gap-3">

            <div className="relative w-full sm:w-64">

              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />

              <input
                type="search"
                placeholder="Cari info pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />

            </div>

            <span className="shrink-0 px-3 py-2 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200">

              {filteredList.length} Info

            </span>

          </div>

        </div>

        {/* CATEGORY FILTER */}

        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-bold no-scrollbar">

          {categories.map(category => (

            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              aria-pressed={selectedCategory === category.id}
              className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                selectedCategory === category.id
                  ? category.active
                  : category.inactive
              }`}
            >

              {category.label}

            </button>

          ))}

        </div>

        {/* ANNOUNCEMENT GRID */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

          {filteredList.map((ann, index) => {

            const badge = getCategoryBadge(ann.category);

            const imageId = String(ann.id ?? index);

            const hasImage =
              Boolean(ann.imageUrl) &&
              !imageErrors[imageId];

            return (

              <article
                key={ann.id ?? index}
                onClick={() => setSelectedAnnouncement(ann)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault();
                    setSelectedAnnouncement(ann);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Buka pengumuman ${ann.title || ''}`}
                className={`group bg-white rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden relative ${
                  ann.isPinned
                    ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-blue-300 shadow-sm'
                }`}
              >

                {/* PINNED */}

                {ann.isPinned && (

                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-[11px] font-black rounded-full shadow-md">

                    <Pin className="w-3 h-3 fill-current" />

                    <span>DISEMATKAN</span>

                  </div>

                )}

                {/* IMAGE */}

                {hasImage ? (

                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">

                    <img
                      src={ann.imageUrl}
                      alt={ann.title || 'Foto pengumuman'}
                      loading="lazy"
                      decoding="async"
                      onError={() => handleImageError(imageId)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-3 right-3 pointer-events-none">

                      <span className="p-1.5 bg-white/90 rounded-lg text-slate-800 text-[10px] font-bold flex items-center gap-1 shadow">

                        <Eye className="w-3.5 h-3.5 text-blue-600" />

                        <span>Lihat Foto</span>

                      </span>

                    </div>

                  </div>

                ) : (

                  <div className="h-28 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center p-4">

                    <Megaphone className="w-10 h-10 text-white/40" />

                  </div>

                )}

                {/* CONTENT */}

                <div className="p-6 flex-1 flex flex-col justify-between">

                  <div>

                    <div className="flex items-center justify-between gap-2 mb-3">

                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${badge.bg}`}>

                        {badge.label}

                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">

                        <Calendar className="w-3.5 h-3.5" />

                        <span>{ann.publishedDate || '-'}</span>

                      </div>

                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-blue-600 transition mb-2">

                      {ann.title || 'Tanpa Judul'}

                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">

                      {ann.content || 'Tidak ada isi pengumuman.'}

                    </p>

                  </div>

                  {/* FOOTER */}

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">

                      <User className="w-3.5 h-3.5 text-blue-600" />

                      <span className="truncate max-w-[130px] font-medium">

                        {ann.author || 'Admin SPMB'}

                      </span>

                    </div>

                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition">

                      <span>Buka Info</span>

                      <ChevronRight className="w-4 h-4" />

                    </span>

                  </div>

                </div>

              </article>

            );

          })}

          {/* EMPTY STATE */}

          {filteredList.length === 0 && (

            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">

              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />

              <h4 className="font-bold text-slate-800 text-base">

                Tidak Ada Pengumuman Ditemukan

              </h4>

              <p className="text-slate-500 text-xs mt-1">

                Silakan ganti kata kunci pencarian atau ubah filter kategori di atas.

              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
              >

                Reset Pencarian

              </button>

            </div>

          )}

        </div>

      </div>

      {/* =====================================
          DETAIL MODAL
      ===================================== */}

      {selectedAnnouncement && (

        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
          >

            {/* MODAL HEADER */}

            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">

              <div className="flex items-center gap-2 flex-wrap">

                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                  getCategoryBadge(selectedAnnouncement.category).bg
                }`}>

                  {getCategoryBadge(selectedAnnouncement.category).label}

                </span>

                {selectedAnnouncement.isPinned && (

                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white flex items-center gap-1">

                    <Pin className="w-3 h-3 fill-current" />

                    Pinned

                  </span>

                )}

              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Tutup pengumuman"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-6 overflow-y-auto space-y-5">

              {/* IMAGE */}

              {selectedAnnouncement.imageUrl && (

                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative">

                  {!imageErrors[String(selectedAnnouncement.id)] ? (

                    <img
                      src={selectedAnnouncement.imageUrl}
                      alt={selectedAnnouncement.title || 'Foto pengumuman'}
                      loading="lazy"
                      decoding="async"
                      onError={() => handleImageError(String(selectedAnnouncement.id))}
                      className="w-full max-h-[380px] object-cover sm:object-contain bg-slate-950"
                    />

                  ) : (

                    <div className="h-40 flex items-center justify-center bg-slate-100">

                      <Megaphone className="w-12 h-12 text-slate-300" />

                    </div>

                  )}

                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">

                    <span className="text-[11px] text-slate-500 font-medium">

                      Foto / Lampiran Resmi Panitia

                    </span>

                    <a
                      href={selectedAnnouncement.imageUrl}
                      download={`pengumuman-lb2-${selectedAnnouncement.id}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                    >

                      <Download className="w-3.5 h-3.5" />

                      <span>Download Gambar Asli</span>

                    </a>

                  </div>

                </div>

              )}

              {/* TITLE */}

              <div>

                <h3
                  id="announcement-modal-title"
                  className="text-xl sm:text-2xl font-black text-slate-900 leading-tight"
                >

                  {selectedAnnouncement.title || 'Tanpa Judul'}

                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 pb-3 border-b border-slate-100">

                  <div className="flex items-center gap-1.5">

                    <Calendar className="w-4 h-4 text-blue-600" />

                    <span>
                      Dipublikasikan:
                      <strong className="ml-1">
                        {selectedAnnouncement.publishedDate || '-'}
                      </strong>
                    </span>

                  </div>

                  <div className="flex items-center gap-1.5">

                    <User className="w-4 h-4 text-emerald-600" />

                    <span>
                      Petugas:
                      <strong className="ml-1">
                        {selectedAnnouncement.author || 'Admin SPMB'}
                      </strong>
                    </span>

                  </div>

                </div>

              </div>

              {/* ANNOUNCEMENT CONTENT */}

              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal break-words">

                {selectedAnnouncement.content || 'Tidak ada isi pengumuman.'}

              </div>

              {/* SCHOOL INFORMATION */}

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs">

                <div className="min-w-0">

                  <span className="font-extrabold text-blue-950 block">

                    Sekretariat SPMB {safeSchoolName}

                  </span>

                  <span className="text-blue-800 text-[11px]">

                    Kampus: {safeAddress}

                  </span>

                </div>

                <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md">

                  LB2

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">

              <button
                type="button"
                onClick={() => handleShareAnnouncement(selectedAnnouncement)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
              >

                <Share2 className="w-4 h-4" />

                <span>Bagikan ke WhatsApp</span>

              </button>

              <div className="flex items-center gap-2 flex-wrap">

                {onOpenRegister && (

                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      onOpenRegister();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >

                    <Sparkles className="w-4 h-4 text-amber-300" />

                    <span>Daftar Sekarang</span>

                  </button>

                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >

                  Tutup

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </section>

  );

};

export default AnnouncementsSection;
