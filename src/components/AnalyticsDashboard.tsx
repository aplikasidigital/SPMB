/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudentRegistration, MajorProgram, ActivityLog, SchoolWave } from '../types/spmb';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  registrants: StudentRegistration[];
  majors: MajorProgram[];
  waves: SchoolWave[];
  logs: ActivityLog[];
}

export const AnalyticsDashboard: React.FC<Props> = ({
  registrants,
  majors,
  waves,
  logs,
}) => {
  const total = registrants.length;
  const accepted = registrants.filter(r => r.status === 'DITERIMA').length;
  const pending = registrants.filter(r => r.status === 'PENDING').length;
  const verification = registrants.filter(r => r.status === 'VERIFIKASI_BERKAS').length;
  const canceled = registrants.filter(r => r.status === 'DIBATALKAN').length;

  const totalQuota = majors.reduce((acc, m) => acc + m.quota, 0);
  const totalFilled = majors.reduce((acc, m) => acc + (m.filledCount || 0), 0);
  const overallPercentage = totalQuota > 0 ? Math.round((totalFilled / totalQuota) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 4 Quick Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendaftar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Pendaftar
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block font-mono">
              {total}
            </span>
            <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Tahun Ajaran 2026/2027
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Diterima */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Diterima / Lolos
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block font-mono">
              {accepted}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              {total > 0 ? Math.round((accepted / total) * 100) : 0}% dari total
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending & Verifikasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Dalam Verifikasi
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block font-mono">
              {pending + verification}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
              Menunggu tindakan
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Dibatalkan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Dibatalkan / Tolak
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block font-mono">
              {canceled}
            </span>
            <span className="text-[11px] text-rose-700 font-semibold block mt-0.5">
              Tidak memenuhi syarat
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Quota Progress & Wave Breakdown */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Quota Per Jurusan (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Distribusi Peminatan & Pengisian Kuota Jurusan
              </h4>
              <p className="text-xs text-slate-500">Kapasitas total {totalQuota} kursi siswa baru</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              {overallPercentage}% Terisi
            </span>
          </div>

          <div className="space-y-3.5">
            {majors.map((m) => {
              const countInMajor = registrants.filter(r => r.majorChoice.firstChoice === m.name).length;
              const fillPct = Math.min(100, Math.round((countInMajor / m.quota) * 100));

              return (
                <div key={m.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{m.name} ({m.code})</span>
                    <span className="font-mono text-slate-600">{countInMajor} / {m.quota} ({fillPct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${m.color}`}
                      style={{ width: `${fillPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Activity Log (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <h4 className="font-extrabold text-slate-900 text-sm">Log Aktivitas Terkini</h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Live Monitoring</span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {logs.slice(0, 7).map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-blue-700">{log.action}</span>
                    <span>{log.timestamp.substring(11, 19)}</span>
                  </div>
                  <p className="text-slate-800 font-medium line-clamp-1">{log.details}</p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Oleh: {log.performedBy}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Sistem memantau seluruh aksi pendaftaran dan pembaruan secara real-time
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
