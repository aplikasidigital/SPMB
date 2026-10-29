/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolWave } from '../types/spmb';
import { 
  FileText, 
  UploadCloud, 
  Printer, 
  UserCheck, 
  GraduationCap, 
  Calendar, 
  CheckCircle, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';

interface Props {
  waves: SchoolWave[];
  onOpenRegister: () => void;
  onOpenCheckStatus: () => void;
  onOpenBlankForm?: () => void;
}

export const FlowAndScheduleSection: React.FC<Props> = ({ waves, onOpenRegister, onOpenCheckStatus, onOpenBlankForm }) => {
  const steps = [
    {
      num: '01',
      title: 'Pendaftaran Online Mandiri',
      desc: 'Isi formulir data diri, data orang tua/wali, asal sekolah, dan pilihan jurusan yang diminati.',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-500 bg-blue-50/50',
    },
    {
      num: '02',
      title: 'Unggah Berkas Persyaratan',
      desc: 'Upload foto/scan Pas Foto 3x4, Kartu Keluarga (KK), KTP Ortu, Akta Lahir, dan SKL/Rapor.',
      icon: <UploadCloud className="w-6 h-6 text-indigo-600" />,
      color: 'border-indigo-500 bg-indigo-50/50',
    },
    {
      num: '03',
      title: 'Cetak Bukti Registrasi A4',
      desc: 'Dapatkan Nomor Pendaftaran resmi dan unduh/cetak Tanda Bukti Pendaftaran PDF ber-kop surat resmi.',
      icon: <Printer className="w-6 h-6 text-cyan-600" />,
      color: 'border-cyan-500 bg-cyan-50/50',
    },
    {
      num: '04',
      title: 'Verifikasi & Seleksi Minat',
      desc: 'Panitia memvalidasi keabsahan dokumen dan mengundang tes pemetaan kompetensi kejuruan.',
      icon: <UserCheck className="w-6 h-6 text-amber-600" />,
      color: 'border-amber-500 bg-amber-50/50',
    },
    {
      num: '05',
      title: 'Pengumuman & Daftar Ulang',
      desc: 'Cek status penerimaan melalui sistem secara mandiri dan lakukan daftar ulang seragam & atribut.',
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      color: 'border-emerald-500 bg-emerald-50/50',
    },
  ];

  const requirements = [
    {
      category: 'Persyaratan Umum',
      items: [
        'Telah lulus SMP / MTs / Program Paket B atau sederajat.',
        'Memiliki Nomor Induk Siswa Nasional (NISN) yang terdaftar di Kemendikbudristek.',
        'Berusia setinggi-tingginya 21 tahun pada awal tahun ajaran baru.',
        'Sehat jasmani & rohani, tidak bertato, serta tidak buta warna (khusus jurusan keteknikan).',
      ],
    },
    {
      category: 'Persyaratan Dokumen & Berkas',
      items: [
        'Pas Foto resmi terbaru ukuran 3x4 berwarna (Background Merah/Biru).',
        'Fotokopi / Scan Kartu Keluarga (KK) yang masih berlaku.',
        'Fotokopi / Scan Akta Kelahiran calon peserta didik.',
        'Fotokopi / Scan KTP Ayah dan Ibu / Wali.',
        'Fotokopi / Scan Surat Keterangan Lulus (SKL) / Ijazah / Rapor Semester 1-5.',
        'Kartu Indonesia Pintar (KIP / KPS / PKH) bagi yang memiliki (untuk beasiswa subsidi).',
      ],
    },
  ];

  return (
    <section id="alur" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* --- PART 1: ALUR PENDAFTARAN --- */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Langkah Mudah & Praktis
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Alur Pendaftaran Murid Baru
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Hanya butuh 5 menit untuk mendaftar secara online dari rumah melalui smartphone atau komputer Anda.
            </p>
          </div>

          {/* Steps Timeline Grid */}
          <div className="grid md:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`relative p-5 rounded-2xl border-2 ${step.color} shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black font-mono text-slate-400">
                      {step.num}
                    </span>
                    <div className="p-2.5 bg-white rounded-xl shadow-xs">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Langkah {idx + 1}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer"
            >
              <span>Mulai Pendaftaran Online Sekarang</span>
              <FileText className="w-4 h-4" />
            </button>

            {onOpenBlankForm && (
              <button
                type="button"
                onClick={onOpenBlankForm}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm rounded-xl border border-amber-300 transition cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-amber-700" />
                <span>Download / Cetak Formulir Blanko (Manual)</span>
              </button>
            )}
          </div>
        </div>

        {/* --- PART 2: SYARAT PENDAFTARAN --- */}
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
              Petunjuk Administratif
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Syarat & Ketentuan Penerimaan
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Pastikan berkas telah disiapkan dalam bentuk fisik (fotokopi) maupun softcopy (foto HP/scan PDF) untuk kelancaran pendaftaran.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {requirements.map((req, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h4 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  {req.category}
                </h4>
                <ul className="space-y-3">
                  {req.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* --- PART 3: JADWAL & GELOMBANG PENDAFTARAN --- */}
        <div id="jadwal">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Kalender Pendaftaran
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Jadwal Gelombang SPMB 2026/2027
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Daftar lebih awal untuk mendapatkan kemudahan subsidi biaya seragam dan pemilihan jurusan prioritas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {waves.map((wave) => (
              <div
                key={wave.id}
                className={`rounded-2xl p-6 border-2 transition-all flex flex-col justify-between ${
                  wave.isActive
                    ? 'border-blue-600 bg-blue-50/30 shadow-lg'
                    : 'border-slate-200 bg-white shadow-xs opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      wave.isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {wave.isActive ? 'SEDANG DIBUKA' : 'SEGERA / TERTUTUP'}
                    </span>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base mb-1">
                    {wave.name}
                  </h4>
                  <p className="text-xs font-semibold text-blue-700 mb-4 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {wave.startDate} — {wave.endDate}
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-amber-800 block text-[11px]">Keuntungan & Fasilitas:</span>
                    <p>{wave.benefits}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  {wave.isActive ? (
                    <button
                      onClick={onOpenRegister}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer text-center"
                    >
                      Daftar Pada Gelombang Ini
                    </button>
                  ) : (
                    <button
                      onClick={onOpenCheckStatus}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer text-center"
                    >
                      Cek Status Registrasi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
