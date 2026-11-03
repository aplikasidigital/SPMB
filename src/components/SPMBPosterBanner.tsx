
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  SchoolSettings,
  MajorProgram,
  SchoolWave,
  StudentRegistration,
  AdminAccount
} from '../types/spmb';

import { QRCodeSVG } from './QRCodeSVG';

import {
  Sparkles,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  Flame,
  Phone,
  GraduationCap,
  Users,
  Check,
  FileSpreadsheet,
  UserPlus,
  Palette
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  majors: MajorProgram[];
  waves: SchoolWave[];
  registrants: StudentRegistration[];
  activeAdmin: AdminAccount;
  onNavigateToFormDesk: () => void;
  onNavigateToWaves: () => void;
  onNavigateToMajors: () => void;
  onOpenSpreadsheetSync: () => void;
}

type ThemePreset =
  | 'modern_blue'
  | 'vibrant_amber'
  | 'emerald_tech'
  | 'dark_neon';

const themeStyles: Record<ThemePreset, {
  gradient: string;
  badge: string;
  accentBorder: string;
  glow: string;
  taglineColor: string;
}> = {
  modern_blue: {
    gradient: 'from-blue-900 via-indigo-900 to-slate-950',
    badge: 'bg-amber-400 text-slate-950',
    accentBorder: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    taglineColor: 'text-blue-200',
  },

  vibrant_amber: {
    gradient: 'from-amber-950 via-orange-950 to-slate-950',
    badge: 'bg-emerald-400 text-slate-950',
    accentBorder: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    taglineColor: 'text-amber-200',
  },

  emerald_tech: {
    gradient: 'from-emerald-950 via-teal-950 to-slate-950',
    badge: 'bg-amber-400 text-slate-950',
    accentBorder: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    taglineColor: 'text-emerald-200',
  },

  dark_neon: {
    gradient: 'from-purple-950 via-slate-950 to-black',
    badge: 'bg-cyan-400 text-slate-950',
    accentBorder: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
    taglineColor: 'text-purple-200',
  },
};

export const SPMBPosterBanner: React.FC<Props> = ({
  settings,
  majors,
  waves,
  registrants,
  activeAdmin,
  onNavigateToFormDesk,
  onNavigateToWaves,
  onNavigateToMajors,
  onOpenSpreadsheetSync,
}) => {

  // =====================================================
  // STATE
  // =====================================================

  const [themePreset, setThemePreset] =
    useState<ThemePreset>('modern_blue');

  const [customBannerUrl, setCustomBannerUrl] =
    useState('');

  const [showConfigPoster, setShowConfigPoster] =
    useState(false);

  const [logoError, setLogoError] = useState(false);

  // =====================================================
  // SAFE DATA
  // =====================================================

  const safeSettings = settings;
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeWaves = Array.isArray(waves) ? waves : [];
  const safeRegistrants = Array.isArray(registrants)
    ? registrants
    : [];

  // =====================================================
  // DATA CALCULATION
  // =====================================================

  const activeWave = useMemo(() => {
    return safeWaves.find(w => w.isActive) || safeWaves[0] || null;
  }, [safeWaves]);

  const acceptedCount = useMemo(() => {
    return safeRegistrants.filter(
      r => r.status === 'DITERIMA'
    ).length;
  }, [safeRegistrants]);

  const pendingCount = useMemo(() => {
    return safeRegistrants.filter(
      r =>
        r.status === 'PENDING' ||
        r.status === 'VERIFIKASI_BERKAS'
    ).length;
  }, [safeRegistrants]);

  const totalCapacity = useMemo(() => {
    return safeMajors.reduce(
      (acc, major) => acc + (Number(major.quota) || 0),
      0
    );
  }, [safeMajors]);

  const remainingSeats = Math.max(
    0,
    totalCapacity - acceptedCount
  );

  const currentTheme = themeStyles[themePreset];

  // =====================================================
  // PRINT FUNCTION
  // =====================================================

  const handlePrintPoster = useCallback(() => {
    if (typeof window === 'undefined') return;

    const printElement = document.getElementById(
      'printable-spmb-poster'
    );

    if (!printElement) {
      console.error('Elemen poster SPMB tidak ditemukan.');
      return;
    }

    window.print();
  }, []);

  // =====================================================
  // SAFE BACKGROUND URL
  // =====================================================

  const safeBackgroundUrl = useMemo(() => {
    const url = customBannerUrl.trim();

    if (!url) return '';

    try {
      const parsedUrl = new URL(url);

      if (
        parsedUrl.protocol !== 'https:' &&
        parsedUrl.protocol !== 'http:'
      ) {
        return '';
      }

      return parsedUrl.href;
    } catch {
      return '';
    }
  }, [customBannerUrl]);

  const posterStyle = useMemo(() => {
    if (!safeBackgroundUrl) {
      return {
        backgroundSize: 'cover' as const,
        backgroundPosition: 'center' as const,
      };
    }

    return {
      backgroundImage:
        `linear-gradient(rgba(10, 15, 30, 0.90), rgba(10, 15, 30, 0.95)), url("${safeBackgroundUrl}")`,
      backgroundSize: 'cover' as const,
      backgroundPosition: 'center' as const,
    };
  }, [safeBackgroundUrl]);

  // =====================================================
  // THEME SELECTOR
  // =====================================================

  const selectTheme = (theme: ThemePreset) => {
    setThemePreset(theme);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">

      {/* KPI OVERVIEW */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* TOTAL PENDAFTAR */}

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Pendaftar Masuk
            </span>

            <div className="text-2xl font-black text-slate-900 mt-1">
              {safeRegistrants.length}
              <span className="text-xs text-slate-400 font-normal ml-1">
                Siswa
              </span>
            </div>

            <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Realtime Database
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* DITERIMA */}

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Lolos Seleksi (Diterima)
            </span>

            <div className="text-2xl font-black text-emerald-700 mt-1">
              {acceptedCount}
              <span className="text-xs text-slate-400 font-normal ml-1">
                Siswa
              </span>
            </div>

            <span className="text-[10px] text-slate-500 mt-1 block">
              Menunggu verifikasi: {pendingCount}
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
        </div>

        {/* KUOTA */}

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sisa Kuota Daya Tampung
            </span>

            <div className="text-2xl font-black text-indigo-700 mt-1">
              {remainingSeats}
              <span className="text-xs text-slate-400 font-normal ml-1">
                / {totalCapacity}
              </span>
            </div>

            <span className="text-[10px] text-indigo-600 font-bold mt-1 block">
              {safeMajors.length} Program Keahlian
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* GELOMBANG */}

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Gelombang Berjalan
            </span>

            <div
              className="text-sm font-extrabold text-slate-900 mt-1 truncate max-w-[140px]"
              title={activeWave?.name || 'Gelombang 1'}
            >
              {activeWave?.name || 'Gelombang 1'}
            </div>

            <span className="text-[10px] text-amber-600 font-bold mt-1 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Berakhir {activeWave?.endDate || '-'}
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* QUICK ACTION */}

      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-4 sm:p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg border border-slate-800">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              Pusat Kendali SPMB — Selamat Datang, {activeAdmin?.fullName || 'Admin'}!
            </h3>

            <p className="text-xs text-slate-300">
              Gunakan pintasan di bawah untuk mengelola pendaftar baru, jadwal gelombang, atau unduh rekap data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">

          <button
            type="button"
            onClick={onNavigateToFormDesk}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Admin Desk
          </button>

          <button
            type="button"
            onClick={onNavigateToWaves}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            Gelombang
          </button>

          <button
            type="button"
            onClick={onNavigateToMajors}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Jurusan
          </button>

          <button
            type="button"
            onClick={onOpenSpreadsheetSync}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Rekap Excel
          </button>

        </div>
      </div>

      {/* POSTER SECTION */}

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">

        {/* TOOLBAR */}

        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Brosur & Banner Digital Resmi SPMB 2026/2027
              </h3>

              <p className="text-[11px] text-slate-500">
                Media publikasi digital siap cetak, bagikan via WhatsApp/Instagram, atau pasang di papan pengumuman.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">

            <button
              type="button"
              onClick={() => setShowConfigPoster(prev => !prev)}
              aria-expanded={showConfigPoster}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Kustomisasi Tampilan
            </button>

            <button
              type="button"
              onClick={handlePrintPoster}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Download Brosur Poster (PDF)
            </button>

          </div>
        </div>

        {/* CUSTOMIZATION */}

        {showConfigPoster && (
          <div className="p-4 bg-slate-100/80 border-b border-slate-200 text-xs space-y-3">

            <div className="flex items-center gap-3 flex-wrap">

              <span className="font-bold text-slate-700">
                Pilih Preset Tema Warna:
              </span>

              <button
                type="button"
                onClick={() => selectTheme('modern_blue')}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  themePreset === 'modern_blue'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Royal Blue & Gold
              </button>

              <button
                type="button"
                onClick={() => selectTheme('vibrant_amber')}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  themePreset === 'vibrant_amber'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Sunset Amber
              </button>

              <button
                type="button"
                onClick={() => selectTheme('emerald_tech')}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  themePreset === 'emerald_tech'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Emerald Green
              </button>

              <button
                type="button"
                onClick={() => selectTheme('dark_neon')}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  themePreset === 'dark_neon'
                    ? 'bg-purple-900 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Dark Cyber Neon
              </button>

            </div>

            <div>
              <label
                htmlFor="spmb-custom-banner"
                className="block font-bold text-slate-700 mb-1"
              >
                URL Gambar Background Banner Khusus (Opsional):
              </label>

              <input
                id="spmb-custom-banner"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={customBannerUrl}
                onChange={e => setCustomBannerUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />

              {customBannerUrl.trim() !== '' && !safeBackgroundUrl && (
                <p className="text-red-600 text-[10px] mt-1">
                  URL tidak valid. Gunakan alamat gambar dengan protokol HTTP atau HTTPS.
                </p>
              )}
            </div>

          </div>
        )}

        {/* POSTER CANVAS */}

        <div className="p-4 sm:p-8 bg-slate-900/10 flex justify-center">

          <div
            id="printable-spmb-poster"
            className={`w-full max-w-4xl bg-gradient-to-br ${currentTheme.gradient} text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border ${currentTheme.accentBorder}`}
            style={posterStyle}
          >

            {/* DECORATION */}

            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* HEADER */}

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/15 pb-6 text-center sm:text-left">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0">

                  {!logoError && safeSettings?.logoUrl ? (
                    <img
                      src={safeSettings.logoUrl}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <GraduationCap className="w-10 h-10 text-blue-700" />
                  )}

                </div>

                <div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${currentTheme.badge}`}>
                      {safeSettings?.accreditation || '-'}
                    </span>

                    <span className="text-[11px] font-mono font-bold text-white/70">
                      NPSN: {safeSettings?.npsn || '-'}
                    </span>

                  </div>

                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-1">
                    {safeSettings?.schoolName || 'NAMA SEKOLAH'}
                  </h1>

                  <p className={`text-xs ${currentTheme.taglineColor} font-medium`}>
                    {safeSettings?.schoolTagline || ''}
                  </p>

                </div>
              </div>

              {/* HOTLINE */}

              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center sm:text-right shrink-0">

                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Hotline Pendaftaran
                </span>

                <span className="text-sm font-mono font-black text-white">
                  0813-1442-0312
                </span>

              </div>

            </div>

            {/* HEADLINE */}

            <div className="relative z-10 my-6 text-center space-y-3">

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-amber-300">

                <Flame className="w-4 h-4 text-amber-400" />

                <span>
                  PENERIMAAN MURID BARU (SPMB) TAHUN AJARAN {safeSettings?.academicYear || '-'}
                </span>

              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Wujudkan Masa Depan Sukses & Terampil di Era Industri Digital!
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Pendaftaran siswa baru telah resmi dibuka. Raih kesempatan bergabung dengan program keahlian terstandar industri dan fasilitas laboratorium tercanggih di Karawang.
              </p>

              {/* ACTIVE WAVE */}

              {activeWave && (
                <div className="inline-block bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-400/40 backdrop-blur-md rounded-2xl p-4 mt-2 max-w-xl text-left">

                  <div className="flex items-center justify-between gap-3 flex-wrap">

                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      {activeWave.name}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                      SEDANG DIBUKA
                    </span>

                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs text-white">

                    <div>
                      <span className="text-[10px] text-white/60 block">
                        Mulai Pendaftaran:
                      </span>

                      <strong>
                        {activeWave.startDate} Pukul {activeWave.startTime || '08:00'} WIB
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/60 block">
                        Batas Akhir Pendaftaran:
                      </span>

                      <strong>
                        {activeWave.endDate} Pukul {activeWave.endTime || '23:59'} WIB
                      </strong>
                    </div>

                  </div>

                  {activeWave.benefits && (
                    <div className="mt-2 pt-2 border-t border-white/15 text-[11px] text-amber-200">
                      ⭐ <strong>Benefit:</strong> {activeWave.benefits}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* MAJORS */}

            <div className="relative z-10 my-6">

              <div className="text-center mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-300">
                  PILIHAN PROGRAM KEAHLIAN / JURUSAN UNGGULAN
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                {safeMajors.map(major => (

                  <div
                    key={major.id}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3.5 hover:bg-white/15 transition"
                  >

                    <div className="flex items-center justify-between mb-1.5">

                      <span className="font-mono text-xs font-black text-amber-300">
                        {major.code}
                      </span>

                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black/40 rounded text-white/80">
                        Kuota: {major.quota}
                      </span>

                    </div>

                    <h4 className="font-extrabold text-xs text-white line-clamp-1">
                      {major.name}
                    </h4>

                    <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-snug">
                      {major.shortDesc}
                    </p>

                  </div>

                ))}

                {safeMajors.length === 0 && (
                  <div className="col-span-full text-center text-xs text-white/60 py-5">
                    Data program keahlian belum tersedia.
                  </div>
                )}

              </div>

            </div>

            {/* FOOTER */}

            <div className="relative z-10 mt-8 pt-6 border-t border-white/15 grid sm:grid-cols-3 gap-4 items-center">

              {/* REQUIREMENTS */}

              <div className="text-xs space-y-1">

                <strong className="block text-[11px] font-black uppercase text-amber-300">
                  Persyaratan Berkas:
                </strong>

                <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                  <li>FC Ijazah / SKL SMP Sederajat</li>
                  <li>FC Kartu Keluarga & Akta Lahir</li>
                  <li>Pas Foto 3x4 Background Merah</li>
                  <li>KIP / PKH (Bagi yang memiliki)</li>
                </ul>

              </div>

              {/* ADDRESS */}

              <div className="text-xs text-slate-300 space-y-1 sm:text-center">

                <strong className="block text-[11px] font-black uppercase text-white">
                  Sekretariat Pendaftaran:
                </strong>

                <p className="text-[11px] leading-relaxed text-slate-300">
                  {safeSettings?.address || '-'}
                </p>

                <p className="text-[10px] text-blue-300 font-mono">
                  Telp: {safeSettings?.phone || '-'}
                </p>

              </div>

              {/* QR CODE */}

              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">

                <div className="bg-white p-2 rounded-xl shadow-lg inline-block">
                  <QRCodeSVG
                    value="https://smklenterabangsa2.sch.id/daftar"
                    size={72}
                  />
                </div>

                <span className="text-[10px] font-extrabold text-amber-300 mt-1 uppercase tracking-wider block">
                  Scan untuk Daftar Online
                </span>

                <span className="text-[9px] text-slate-400">
                  Resmi & Bebas Antre
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* PRINT STYLE */}

      <style>{`
        @media print {

          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          #printable-spmb-poster,
          #printable-spmb-poster * {
            visibility: visible !important;
          }

          #printable-spmb-poster {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #printable-spmb-poster img {
            max-width: 100% !important;
          }

          button,
          input {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
};

export default SPMBPosterBanner;
