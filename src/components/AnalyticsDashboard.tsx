
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  StudentRegistration,
  MajorProgram,
  ActivityLog,
  SchoolWave
} from '../types/spmb';

import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface Props {
  registrants: StudentRegistration[];
  majors: MajorProgram[];
  waves: SchoolWave[];
  logs: ActivityLog[];
}

export const AnalyticsDashboard: React.FC<Props> = ({
  registrants = [],
  majors = [],
  waves = [],
  logs = [],
}) => {

  // =====================================================
  // NORMALISASI DATA
  // =====================================================

  const safeRegistrants = Array.isArray(registrants)
    ? registrants
    : [];

  const safeMajors = Array.isArray(majors)
    ? majors
    : [];

  const safeLogs = Array.isArray(logs)
    ? logs
    : [];

  // =====================================================
  // STATISTIK PENDAFTAR
  // =====================================================

  const statistics = useMemo(() => {

    let total = 0;
    let accepted = 0;
    let pending = 0;
    let verification = 0;
    let canceled = 0;

    const majorCounts: Record<string, number> = {};

    safeRegistrants.forEach((registrant) => {

      if (!registrant) return;

      total++;

      switch (registrant.status) {
        case 'DITERIMA':
          accepted++;
          break;

        case 'PENDING':
          pending++;
          break;

        case 'VERIFIKASI_BERKAS':
          verification++;
          break;

        case 'DIBATALKAN':
          canceled++;
          break;

        default:
          break;
      }

      const majorName =
        registrant.majorChoice?.firstChoice;

      if (majorName) {
        majorCounts[majorName] =
          (majorCounts[majorName] || 0) + 1;
      }

    });

    return {
      total,
      accepted,
      pending,
      verification,
      canceled,
      majorCounts
    };

  }, [safeRegistrants]);

  const {
    total,
    accepted,
    pending,
    verification,
    canceled,
    majorCounts
  } = statistics;

  // =====================================================
  // STATISTIK KUOTA JURUSAN
  // =====================================================

  const quotaStatistics = useMemo(() => {

    const totalQuota = safeMajors.reduce(
      (acc, major) => {
        const quota = Number(major?.quota);
        return acc + (
          Number.isFinite(quota) && quota > 0
            ? quota
            : 0
        );
      },
      0
    );

    const totalFilled = safeMajors.reduce(
      (acc, major) => {
        const filled = Number(major?.filledCount || 0);

        return acc + (
          Number.isFinite(filled) && filled > 0
            ? filled
            : 0
        );
      },
      0
    );

    const overallPercentage =
      totalQuota > 0
        ? Math.round((totalFilled / totalQuota) * 100)
        : 0;

    return {
      totalQuota,
      totalFilled,
      overallPercentage
    };

  }, [safeMajors]);

  const {
    totalQuota,
    overallPercentage
  } = quotaStatistics;

  // =====================================================
  // LOG AKTIVITAS
  // =====================================================

  const recentLogs = useMemo(() => {

    return safeLogs
      .filter(Boolean)
      .slice(0, 7);

  }, [safeLogs]);

  // =====================================================
  // FORMAT WAKTU
  // =====================================================

  const formatTime = (timestamp: unknown): string => {

    if (!timestamp) return '--:--:--';

    try {

      const date = new Date(String(timestamp));

      if (Number.isNaN(date.getTime())) {
        return '--:--:--';
      }

      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

    } catch {
      return '--:--:--';
    }

  };

  // =====================================================
  // PERSENTASE PENDAFTAR DITERIMA
  // =====================================================

  const acceptedPercentage =
    total > 0
      ? Math.round((accepted / total) * 100)
      : 0;

  // =====================================================
  // TAMPILAN DASHBOARD
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          QUICK STATISTICS
      ================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* TOTAL PENDAFTAR */}

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

        {/* DITERIMA */}

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Diterima / Lolos
            </span>

            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block font-mono">
              {accepted}
            </span>

            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              {acceptedPercentage}% dari total
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>

        </div>

        {/* VERIFIKASI */}

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

        {/* DIBATALKAN */}

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

      {/* =================================================
          MIDDLE ROW
      ================================================= */}

      <div className="grid lg:grid-cols-12 gap-6">

        {/* KUOTA JURUSAN */}

        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                Distribusi Peminatan & Pengisian Kuota Jurusan
              </h4>

              <p className="text-xs text-slate-500">
                Kapasitas total {totalQuota} kursi siswa baru
              </p>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              {overallPercentage}% Terisi
            </span>

          </div>

          <div className="space-y-3.5">

            {safeMajors.map((major) => {

              if (!major) return null;

              const countInMajor =
                majorCounts[major.name] || 0;

              const quota = Number(major.quota);

              const validQuota =
                Number.isFinite(quota) && quota > 0
                  ? quota
                  : 0;

              const fillPct =
                validQuota > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (countInMajor / validQuota) * 100
                      )
                    )
                  : 0;

              return (

                <div
                  key={major.id}
                  className="space-y-1"
                >

                  <div className="flex items-center justify-between text-xs gap-2">

                    <span className="font-semibold text-slate-800">
                      {major.name} ({major.code})
                    </span>

                    <span className="font-mono text-slate-600 whitespace-nowrap">
                      {countInMajor} / {validQuota} ({fillPct}%)
                    </span>

                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                        major.color || 'from-blue-500 to-blue-600'
                      }`}
                      style={{
                        width: `${fillPct}%`
                      }}
                    />

                  </div>

                </div>

              );

            })}

            {safeMajors.length === 0 && (

              <div className="text-center py-8 text-sm text-slate-400">
                Belum ada data jurusan.
              </div>

            )}

          </div>

        </div>

        {/* LOG AKTIVITAS */}

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">

              <div className="flex items-center gap-2">

                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />

                <h4 className="font-extrabold text-slate-900 text-sm">
                  Log Aktivitas Terkini
                </h4>

              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Live Monitoring
              </span>

            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">

              {recentLogs.map((log) => (

                <div
                  key={log.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                >

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5 gap-2">

                    <span className="font-bold text-blue-700">
                      {log.action || '-'}
                    </span>

                    <span className="whitespace-nowrap">
                      {formatTime(log.timestamp)}
                    </span>

                  </div>

                  <p className="text-slate-800 font-medium line-clamp-1">
                    {log.details || '-'}
                  </p>

                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Oleh: {log.performedBy || '-'}
                  </span>

                </div>

              ))}

              {recentLogs.length === 0 && (

                <div className="text-center py-8 text-sm text-slate-400">
                  Belum ada aktivitas tercatat.
                </div>

              )}

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

export default AnalyticsDashboard;
