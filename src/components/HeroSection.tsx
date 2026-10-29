/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolSettings, SchoolWave } from '../types/spmb';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Building2, 
  Users, 
  Share2, 
  Play, 
  Search,
  Zap
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

export const HeroSection: React.FC<Props> = ({
  settings,
  activeWave,
  totalRegistrants,
  onOpenRegister,
  onOpenCheckStatus,
  onOpenShareModal,
  onNavigateSection,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
      {/* Background Decorative Mesh & Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-sm font-semibold shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>SPMB Resmi {settings.academicYear} Telah Dibuka!</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Raih Masa Depan Gemilang di{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">
                {settings.schoolName || 'SMK Lentera Bangsa 2'}
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
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {activeWave.name} ({activeWave.startDate} - {activeWave.endDate})
                    </h4>
                    <p className="text-xs text-amber-200 mt-0.5">
                      {activeWave.benefits}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition cursor-pointer"
              >
                <span>Daftar Online Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenCheckStatus}
                className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-xl border border-white/20 backdrop-blur-sm transition cursor-pointer"
              >
                <Search className="w-4 h-4 text-blue-300" />
                <span>Cek Status & Bukti PDF</span>
              </button>

              <button
                onClick={onOpenShareModal}
                className="p-3.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl border border-white/10 transition cursor-pointer"
                title="Bagikan Info SPMB"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Akreditasi "A"</span>
                  <span className="text-[11px] text-slate-400">Unggul & Berstandar</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">50+ Mitra Industri</span>
                  <span className="text-[11px] text-slate-400">Kerjasama & Magang</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">{totalRegistrants} Pendaftar</span>
                  <span className="text-[11px] text-slate-400">Tahun 2026/2027</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow Frame */}
              <div className="relative rounded-3xl p-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-amber-400 shadow-2xl">
                <div className="relative rounded-[22px] overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
                    alt="Siswa SMK Lentera Bangsa 2"
                    className="w-full h-80 sm:h-96 object-cover object-center filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  {/* Floating Overlay Badge on Image */}
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Lulus Langsung Kerja</span>
                  </div>

                  {/* Bottom Image Overlay Information */}
                  <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {settings.schoolName}
                      </span>
                      <span className="text-[11px] bg-blue-500/30 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-400/30">
                        NPSN: {settings.npsn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      "{settings.schoolTagline}"
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-white/10">
                      <span>Pilihan 6 Program Keahlian</span>
                      <button
                        onClick={() => onNavigateSection('jurusan')}
                        className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        Lihat Semua Jurusan →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Registration Counter Card */}
              <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 hidden sm:flex">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {totalRegistrants}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Siswa Telah Mendaftar</span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
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
