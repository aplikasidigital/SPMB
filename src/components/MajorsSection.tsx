/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MajorProgram } from '../types/spmb';
import { 
  Code2, 
  Network, 
  Wrench, 
  Palette, 
  Briefcase, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface Props {
  majors: MajorProgram[];
  onSelectMajor: (majorName: string) => void;
}

export const MajorsSection: React.FC<Props> = ({ majors, onSelectMajor }) => {
  const [selectedDetail, setSelectedDetail] = useState<MajorProgram | null>(null);

  const getMajorIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-6 h-6" />;
      case 'Network':
        return <Network className="w-6 h-6" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6" />;
      case 'Palette':
        return <Palette className="w-6 h-6" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6" />;
      case 'Coins':
        return <Coins className="w-6 h-6" />;
      default:
        return <Code2 className="w-6 h-6" />;
    }
  };

  return (
    <section id="jurusan" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Majors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {majors.map((major) => {
            const percentage = Math.min(100, Math.round((major.filledCount / major.quota) * 100));
            const isAlmostFull = percentage >= 75;

            return (
              <div
                key={major.id}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Card Banner Image & Overlay */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={major.bannerImage}
                    alt={major.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

                  {/* Code Tag */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-slate-900 shadow">
                    {major.code}
                  </div>

                  {/* Quota Badge */}
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow ${
                    isAlmostFull ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}>
                    {isAlmostFull ? 'Sisa Kuota Terbatas!' : 'Kuota Tersedia'}
                  </div>

                  {/* Icon circle */}
                  <div className={`absolute -bottom-4 left-6 w-12 h-12 rounded-2xl bg-gradient-to-tr ${major.color} text-white flex items-center justify-center shadow-lg border-2 border-white`}>
                    {getMajorIcon(major.icon)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 pt-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition">
                      {major.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {major.shortDesc}
                    </p>

                    {/* Quota Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-500">Kuota Terisi:</span>
                        <span className="font-mono text-slate-800">
                          {major.filledCount} / {major.quota} Kursi ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${major.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Career Tags */}
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Peluang Karir Lulusan:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {major.careers.slice(0, 3).map((career, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium"
                          >
                            {career}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onSelectMajor(major.name)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <span>Pilih Jurusan Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedDetail(major)}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                      title="Lihat Detail Fasilitas"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Major Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${selectedDetail.color} text-white flex items-center justify-center shadow-md`}>
                {getMajorIcon(selectedDetail.icon)}
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600">{selectedDetail.code}</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedDetail.name}</h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {selectedDetail.fullDesc}
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  Fasilitas Unggulan Laboratorium:
                </h4>
                <div className="space-y-1.5">
                  {selectedDetail.facilities.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  Prospek Kerja & Jenjang Karir:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDetail.careers.map((career, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-md border border-blue-100">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  onSelectMajor(selectedDetail.name);
                  setSelectedDetail(null);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow cursor-pointer text-center"
              >
                Daftar Sekarang untuk Jurusan Ini
              </button>
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer"
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
