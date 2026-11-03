
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { MajorProgram } from '../types/spmb';
import {
  Code2,
  Network,
  Wrench,
  Cpu,
  Palette,
  Briefcase,
  Coins,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Info,
  X,
  ImageOff
} from 'lucide-react';

interface Props {
  majors: MajorProgram[];
  onSelectMajor: (majorName: string) => void;
}

export const MajorsSection: React.FC<Props> = ({
  majors,
  onSelectMajor
}) => {
  const [selectedDetail, setSelectedDetail] =
    useState<MajorProgram | null>(null);

  const [failedImages, setFailedImages] =
    useState<Record<string, boolean>>({});

  // Mengambil ikon sesuai data jurusan
  const getMajorIcon = useCallback((iconName: string) => {
    const iconClass = 'w-6 h-6';

    switch (iconName) {
      case 'Cpu':
        return <Cpu className={iconClass} />;

      case 'Wrench':
        return <Wrench className={iconClass} />;

      case 'Code2':
        return <Code2 className={iconClass} />;

      case 'Network':
        return <Network className={iconClass} />;

      case 'Palette':
        return <Palette className={iconClass} />;

      case 'Briefcase':
        return <Briefcase className={iconClass} />;

      case 'Coins':
        return <Coins className={iconClass} />;

      default:
        return <Cpu className={iconClass} />;
    }
  }, []);

  // Memastikan data berupa array
  const safeMajors = Array.isArray(majors) ? majors : [];

  // Menutup modal menggunakan tombol Escape
  useEffect(() => {
    if (!selectedDetail) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedDetail(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Mencegah halaman belakang ikut bergulir
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedDetail]);

  // Menangani pemilihan jurusan
  const handleSelectMajor = useCallback(
    (majorName: string) => {
      if (!majorName || typeof onSelectMajor !== 'function') return;

      onSelectMajor(majorName);
    },
    [onSelectMajor]
  );

  // Menangani pembukaan detail
  const handleOpenDetail = useCallback((major: MajorProgram) => {
    setSelectedDetail(major);
  }, []);

  // Menangani gambar yang gagal dimuat
  const handleImageError = useCallback((majorId: string | number) => {
    setFailedImages(previous => ({
      ...previous,
      [String(majorId)]: true
    }));
  }, []);

  // Perhitungan kuota yang aman
  const getQuotaInfo = (filledCount: number, quota: number) => {
    const safeFilled = Number.isFinite(Number(filledCount))
      ? Math.max(0, Number(filledCount))
      : 0;

    const safeQuota = Number.isFinite(Number(quota))
      ? Math.max(0, Number(quota))
      : 0;

    const percentage = safeQuota > 0
      ? Math.min(100, Math.round((safeFilled / safeQuota) * 100))
      : 0;

    return {
      filled: safeFilled,
      quota: safeQuota,
      percentage,
      isAlmostFull: percentage >= 75
    };
  };

  return (
    <section
      id="jurusan"
      className="py-20 bg-slate-50 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Program Keahlian Unggulan
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pilihan Jurusan Favorit & Siap Kerja
          </h2>

          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Kurikulum berbasis industri, didukung sertifikasi kompetensi BNSP dan kemitraan strategis dengan perusahaan multinasional.
          </p>
        </div>

        {/* MAJORS GRID */}
        {safeMajors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-6 lg:gap-8">

            {safeMajors.map((major) => {
              if (!major) return null;

              const {
                filled,
                quota,
                percentage,
                isAlmostFull
              } = getQuotaInfo(
                major.filledCount,
                major.quota
              );

              const majorId = String(major.id);
              const imageFailed = failedImages[majorId];

              const careers = Array.isArray(major.careers)
                ? major.careers
                : [];

              return (
                <div
                  key={major.id}
                  className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col overflow-hidden"
                >

                  {/* BANNER IMAGE */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">

                    {major.bannerImage && !imageFailed ? (
                      <img
                        src={major.bannerImage}
                        alt={major.name || 'Program Keahlian'}
                        loading="lazy"
                        decoding="async"
                        onError={() => handleImageError(major.id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                        <ImageOff className="w-9 h-9 mb-2" />
                        <span className="text-xs font-medium">
                          Gambar tidak tersedia
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />

                    {/* CODE TAG */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-slate-900 shadow">
                      {major.code}
                    </div>

                    {/* QUOTA BADGE */}
                    <div
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow ${
                        isAlmostFull
                          ? 'bg-rose-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {isAlmostFull
                        ? 'Sisa Kuota Terbatas!'
                        : 'Kuota Tersedia'}
                    </div>

                    {/* ICON */}
                    <div
                      className={`absolute -bottom-4 left-6 w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                        major.color || 'from-blue-500 to-blue-700'
                      } text-white flex items-center justify-center shadow-lg border-2 border-white`}
                    >
                      {getMajorIcon(major.icon)}
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-6 pt-7 flex-1 flex flex-col justify-between">

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                        {major.name}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {major.shortDesc || 'Informasi program keahlian belum tersedia.'}
                      </p>

                      {/* QUOTA PROGRESS */}
                      <div className="mt-4 pt-3 border-t border-slate-100">

                        <div className="flex items-center justify-between gap-2 text-xs font-semibold mb-1">
                          <span className="text-slate-500">
                            Kuota Terisi:
                          </span>

                          <span className="font-mono text-slate-800 text-right">
                            {filled} / {quota} Kursi ({percentage}%)
                          </span>
                        </div>

                        <div
                          className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Kuota terisi jurusan ${major.name}`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                              major.color || 'from-blue-500 to-blue-700'
                            }`}
                            style={{
                              width: `${percentage}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* CAREER TAGS */}
                      <div className="mt-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Peluang Karir Lulusan:
                        </span>

                        <div className="flex flex-wrap gap-1.5">
                          {careers.slice(0, 3).map((career, index) => (
                            <span
                              key={`${majorId}-career-${index}`}
                              className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium"
                            >
                              {career}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">

                      <button
                        type="button"
                        onClick={() => handleSelectMajor(major.name)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
                      >
                        <span>Pilih Jurusan Ini</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDetail(major)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                        title="Lihat Detail Fasilitas"
                        aria-label={`Lihat detail ${major.name}`}
                      >
                        <Info className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
            <Info className="w-10 h-10 mx-auto text-slate-400 mb-3" />

            <h3 className="font-bold text-slate-800 text-lg">
              Program Keahlian Belum Tersedia
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Informasi jurusan akan ditampilkan setelah data tersedia.
            </p>
          </div>
        )}

      </div>

      {/* DETAIL MODAL */}
      {selectedDetail && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDetail(null);
            }
          }}
          role="presentation"
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="major-modal-title"
          >

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Tutup detail jurusan"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER */}
            <div className="flex items-center gap-3 mb-4 pr-8">

              <div
                className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-tr ${
                  selectedDetail.color || 'from-blue-500 to-blue-700'
                } text-white flex items-center justify-center shadow-md`}
              >
                {getMajorIcon(selectedDetail.icon)}
              </div>

              <div className="min-w-0">
                <span className="text-xs font-bold text-blue-600">
                  {selectedDetail.code}
                </span>

                <h3
                  id="major-modal-title"
                  className="text-xl font-bold text-slate-900 break-words"
                >
                  {selectedDetail.name}
                </h3>
              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {selectedDetail.fullDesc || selectedDetail.shortDesc || 'Informasi jurusan belum tersedia.'}
            </p>

            <div className="space-y-4">

              {/* FACILITIES */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  Fasilitas Unggulan Laboratorium:
                </h4>

                <div className="space-y-1.5">
                  {Array.isArray(selectedDetail.facilities) &&
                  selectedDetail.facilities.length > 0 ? (
                    selectedDetail.facilities.map((facility, index) => (
                      <div
                        key={`${selectedDetail.id}-facility-${index}`}
                        className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{facility}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                      Informasi fasilitas belum tersedia.
                    </p>
                  )}
                </div>
              </div>

              {/* CAREERS */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  Prospek Kerja & Jenjang Karir:
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(selectedDetail.careers) &&
                  selectedDetail.careers.length > 0 ? (
                    selectedDetail.careers.map((career, index) => (
                      <span
                        key={`${selectedDetail.id}-career-${index}`}
                        className="bg-blue-50 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-md border border-blue-100"
                      >
                        {career}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      Informasi prospek kerja belum tersedia.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() => {
                  handleSelectMajor(selectedDetail.name);
                  setSelectedDetail(null);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl transition-colors shadow cursor-pointer text-center"
              >
                Daftar Sekarang untuk Jurusan Ini
              </button>

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>

            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MajorsSection;
