
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  SchoolSettings,
  SchoolWave,
} from '../types/spmb';

import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Award,
  Building2,
  Users,
  Share2,
  Search,
  Zap,
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  activeWave?: SchoolWave;
  totalRegistrants: number;
  onOpenRegister: () => void;
  onOpenCheckStatus: () => void;
  onOpenShareModal: () => void;
  onNavigateSection: (id: string) => void;
}

const DEFAULT_SCHOOL_NAME = 'SMK Lentera Bangsa 2';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80';

export const HeroSection: React.FC<Props> = ({
  settings,
  activeWave,
  totalRegistrants,
  onOpenRegister,
  onOpenCheckStatus,
  onOpenShareModal,
  onNavigateSection,
}) => {
  const [imageError, setImageError] = useState(false);

  // Pengamanan data agar tidak menyebabkan error saat proses loading.
  const schoolData = settings;

  const schoolName = useMemo(
    () => schoolData?.schoolName?.trim() || DEFAULT_SCHOOL_NAME,
    [schoolData?.schoolName]
  );

  const academicYear = schoolData?.academicYear || '2026/2027';

  const schoolTagline = schoolData?.schoolTagline || '';

  const npsn = schoolData?.npsn || '-';

  const registrantCount = useMemo(() => {
    const value = Number(totalRegistrants);
    return Number.isFinite(value) && value >= 0
      ? value.toLocaleString('id-ID')
      : '0';
  }, [totalRegistrants]);

  const handleNavigate = () => {
    if (typeof onNavigateSection === 'function') {
      onNavigateSection('jurusan');
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-12 pb-20 sm:pt-16 sm:pb-28">

      {/* Background Decorative Mesh & Glows */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-sm font-semibold shadow-inner">

              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />

              <span>
                SPMB Resmi {academicYear} Telah Dibuka!
              </span>

              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>

            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">

              Raih Masa Depan Gemilang di{' '}

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">
                {schoolName}
              </span>

            </h1>

            {/* Subheading */}
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Sekolah kejuruan pusat keunggulan dengan kurikulum link and match industri, sertifikasi internasional, fasilitas modern, dan jaminan penempatan kerja.
            </p>

            {/* Active Wave Alert Box */}
            {activeWave && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-400/30 backdrop-blur-sm">

                <div className="flex items-start gap-3">

                  <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold text-xs uppercase shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">

                    <h4 className="font-bold text-white text-sm break-words">
                      {activeWave.name || 'Gelombang Pendaftaran'}
                      {' '}
                      ({activeWave.startDate || '-'} - {activeWave.endDate || '-'})
                    </h4>

                    <p className="text-xs text-amber-200 mt-0.5 break-words">
                      {activeWave.benefits || ''}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">

              <button
                type="button"
                onClick={onOpenRegister}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900"
              >

                <span>Daftar Online Sekarang</span>

                <ArrowRight className="w-5 h-5 shrink-0" />

              </button>

              <button
                type="button"
                onClick={onOpenCheckStatus}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
              >

                <Search className="w-4 h-4 text-blue-300 shrink-0" />

                <span>Cek Status & Bukti PDF</span>

              </button>

              <button
                type="button"
                onClick={onOpenShareModal}
                className="p-3.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
                title="Bagikan Info SPMB"
                aria-label="Bagikan Info SPMB"
              >

                <Share2 className="w-5 h-5" />

              </button>

            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10">

              <div className="flex items-center gap-2">

                <Award className="w-5 h-5 text-amber-400 shrink-0" />

                <div>
                  <span className="text-xs font-bold text-white block">
                    Akreditasi "A"
                  </span>

                  <span className="text-[11px] text-slate-400">
                    Unggul & Berstandar
                  </span>
                </div>

              </div>

              <div className="flex items-center gap-2">

                <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />

                <div>
                  <span className="text-xs font-bold text-white block">
                    50+ Mitra Industri
                  </span>

                  <span className="text-[11px] text-slate-400">
                    Kerjasama & Magang
                  </span>
                </div>

              </div>

              <div className="flex items-center gap-2">

                <Users className="w-5 h-5 text-emerald-400 shrink-0" />

                <div>
                  <span className="text-xs font-bold text-white block">
                    {registrantCount} Pendaftar
                  </span>

                  <span className="text-[11px] text-slate-400">
                    Tahun 2026/2027
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5">

            <div className="relative mx-auto max-w-md lg:max-w-none">

              {/* Outer Glow Frame */}
              <div className="relative rounded-3xl p-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-amber-400 shadow-2xl">

                <div className="relative rounded-[22px] overflow-hidden bg-slate-900">

                  {/* Hero Image */}
                  {!imageError ? (
                    <img
                      src={HERO_IMAGE}
                      alt={`Siswa ${schoolName}`}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      onError={() => setImageError(true)}
                      className="w-full h-80 sm:h-96 object-cover object-center brightness-95"
                    />
                  ) : (
                    <div className="w-full h-80 sm:h-96 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-slate-950 text-white">
                      <Building2 className="w-16 h-16 text-blue-300 mb-3" />
                      <span className="text-sm font-semibold">
                        {schoolName}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                  {/* Floating Overlay Badge */}
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-lg">

                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />

                    <span>Lulus Langsung Kerja</span>

                  </div>

                  {/* Bottom Image Overlay Information */}
                  <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 space-y-2">

                    <div className="flex items-center justify-between gap-2">

                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 truncate">
                        {schoolName}
                      </span>

                      <span className="text-[11px] bg-blue-500/30 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-400/30 shrink-0">
                        NPSN: {npsn}
                      </span>

                    </div>

                    <p className="text-xs text-slate-300 leading-snug break-words">
                      "{schoolTagline}"
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-white/10">

                      <span>
                        Pilihan 6 Program Keahlian
                      </span>

                      <button
                        type="button"
                        onClick={handleNavigate}
                        className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer whitespace-nowrap focus:outline-none focus:underline"
                      >
                        Lihat Semua Jurusan →
                      </button>

                    </div>

                  </div>

                </div>

              </div>

              {/* Floating Registration Counter Card */}
              <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 items-center gap-3 hidden sm:flex">

                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  {registrantCount}
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Siswa Telah Mendaftar
                  </span>

                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">

                    <span className="w-2 h-2 rounded-full bg-emerald-500" />

                    Kuota Terus Terisi

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default HeroSection;
