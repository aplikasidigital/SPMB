
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { StorageService, SUPABASE_CONFIG } from '../services/storageService';
import { SupabaseService } from '../services/supabaseClient';
import {
  X,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Cloud,
  Check,
  RefreshCw,
  Table,
  Printer,
  Copy,
} from 'lucide-react';

interface Props {
  registrants: StudentRegistration[];
  settings: SchoolSettings;
  onClose: () => void;
  onPrintRecapPdf: () => void;
}

export const SpreadsheetSyncModal: React.FC<Props> = ({
  registrants,
  settings,
  onClose,
  onPrintRecapPdf,
}) => {
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [copyingCsv, setCopyingCsv] = useState(false);
  const [copyingSql, setCopyingSql] = useState(false);

  const mountedRef = useRef(true);
  const syncLockRef = useRef(false);
  const exportLockRef = useRef(false);
  const csvLockRef = useRef(false);
  const sqlLockRef = useRef(false);

  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      timeoutRefs.current.forEach((timer) => clearTimeout(timer));
      timeoutRefs.current = [];
    };
  }, []);

  const safeValue = (value: unknown, fallback = '-') => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    return String(value);
  };

  const scheduleReset = (
    callback: () => void,
    delay = 3000
  ) => {
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        callback();
      }

      timeoutRefs.current = timeoutRefs.current.filter(
        (item) => item !== timer
      );
    }, delay);

    timeoutRefs.current.push(timer);
  };

  // Clipboard helper with fallback
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function' &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textArea = document.createElement('textarea');

      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.setAttribute('readonly', '');

      document.body.appendChild(textArea);
      textArea.select();

      const successful = document.execCommand('copy');

      document.body.removeChild(textArea);

      return successful;
    } catch (error) {
      console.error('Clipboard error:', error);
      return false;
    }
  };

  // 1. Export Excel
  const handleExportExcel = async () => {
    if (exportLockRef.current) return;

    exportLockRef.current = true;
    setExporting(true);

    try {
      const rows = registrants.map((r, index) => {
        const personal = r.personalData || ({} as any);
        const major = r.majorChoice || ({} as any);
        const school = r.schoolOrigin || ({} as any);
        const parent = r.parentData || ({} as any);

        return {
          'No.': index + 1,
          'No. Pendaftaran': safeValue(r.registrationNumber),
          'Tanggal Daftar': safeValue(r.createdAt),
          'Nama Lengkap Siswa': safeValue(personal.fullName),
          'NISN': safeValue(personal.nisn),
          'NIK': safeValue(personal.nik),
          'Jenis Kelamin': safeValue(personal.gender),
          'Tempat Lahir': safeValue(personal.birthPlace),
          'Tanggal Lahir': safeValue(personal.birthDate),
          'No. WhatsApp': safeValue(personal.phoneWhatsApp),
          'Email': safeValue(personal.email),
          'Alamat Domisili': [
            safeValue(personal.address, ''),
            personal.rtRw ? `RT/RW ${personal.rtRw}` : '',
            personal.village ? `Kel. ${personal.village}` : '',
            personal.district ? `Kec. ${personal.district}` : '',
            safeValue(personal.city, ''),
          ].filter(Boolean).join(', ') || '-',
          'Pilihan 1 (Utama)': safeValue(major.firstChoice),
          'Pilihan 2 (Cadangan)': safeValue(major.secondChoice),
          'Asal SMP/MTs': safeValue(school.schoolName),
          'Tahun Lulus': safeValue(school.graduationYear),
          'Nilai Rapor': safeValue(school.averageScore),
          'Nama Ayah': safeValue(parent.fatherName),
          'No. Telp Ayah': safeValue(parent.fatherPhone),
          'Nama Ibu': safeValue(parent.motherName),
          'No. Telp Ibu': safeValue(parent.motherPhone),
          'Penghasilan Ortu': safeValue(parent.monthlyIncome),
          'Gelombang': safeValue(r.wave),
          'Status Pendaftaran': safeValue(r.status),
          'Catatan Panitia': safeValue(r.statusNote),
          'Verifikator': safeValue(r.verifiedBy),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      worksheet['!cols'] = [
        { wch: 5 },
        { wch: 16 },
        { wch: 20 },
        { wch: 28 },
        { wch: 14 },
        { wch: 18 },
        { wch: 14 },
        { wch: 15 },
        { wch: 14 },
        { wch: 16 },
        { wch: 24 },
        { wch: 40 },
        { wch: 32 },
        { wch: 32 },
        { wch: 26 },
        { wch: 12 },
        { wch: 12 },
        { wch: 24 },
        { wch: 16 },
        { wch: 24 },
        { wch: 16 },
        { wch: 22 },
        { wch: 20 },
        { wch: 16 },
        { wch: 30 },
        { wch: 20 },
      ];

      worksheet['!autofilter'] = {
        ref: worksheet['!ref'] || 'A1:Z1',
      };

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Data Pendaftar SPMB'
      );

      const schoolName = safeValue(
        settings?.schoolName,
        'Sekolah'
      )
        .replace(/[\\/:*?"<>|]/g, '')
        .trim()
        .replace(/\s+/g, '_');

      const date = new Date().toISOString().substring(0, 10);

      const fileName = `Rekap_SPMB_${schoolName}_${date}.xlsx`;

      XLSX.writeFile(workbook, fileName, {
        compression: true,
      });

    } catch (error) {
      console.error('Export Excel error:', error);

      alert(
        'Gagal membuat file Excel. Silakan periksa data dan coba kembali.'
      );
    } finally {
      exportLockRef.current = false;

      if (mountedRef.current) {
        setExporting(false);
      }
    }
  };

  // 2. Generate TSV for Google Sheets
  const generateCsv = () => {
    const headers = [
      'No',
      'No. Pendaftaran',
      'Nama Siswa',
      'NISN',
      'Jurusan Pilihan 1',
      'Jurusan Pilihan 2',
      'Asal SMP',
      'No. WhatsApp',
      'Gelombang',
      'Status',
    ];

    const escapeTsv = (value: unknown) => {
      return safeValue(value, '')
        .replace(/\t/g, ' ')
        .replace(/\r?\n/g, ' ')
        .trim();
    };

    const dataLines = registrants.map((r, i) => [
      i + 1,
      escapeTsv(r.registrationNumber),
      escapeTsv(r.personalData?.fullName),
      escapeTsv(r.personalData?.nisn),
      escapeTsv(r.majorChoice?.firstChoice),
      escapeTsv(r.majorChoice?.secondChoice),
      escapeTsv(r.schoolOrigin?.schoolName),
      escapeTsv(r.personalData?.phoneWhatsApp),
      escapeTsv(r.wave),
      escapeTsv(r.status),
    ].join('\t'));

    return [headers.join('\t'), ...dataLines].join('\n');
  };

  const handleCopyForGoogleSheets = async () => {
    if (csvLockRef.current) return;

    csvLockRef.current = true;
    setCopyingCsv(true);

    try {
      const tsvData = generateCsv();
      const success = await copyToClipboard(tsvData);

      if (!success) {
        throw new Error('Clipboard tidak dapat diakses.');
      }

      if (mountedRef.current) {
        setCopiedCsv(true);

        scheduleReset(() => {
          setCopiedCsv(false);
        });
      }
    } catch (error) {
      console.error('Copy Google Sheets error:', error);

      alert(
        'Data gagal disalin. Pastikan browser mengizinkan akses clipboard.'
      );
    } finally {
      csvLockRef.current = false;

      if (mountedRef.current) {
        setCopyingCsv(false);
      }
    }
  };

  // 3. Supabase synchronization
  const handleTriggerSupabaseSync = async () => {
    if (syncLockRef.current) return;

    if (!registrants || registrants.length === 0) {
      setSyncResult('Belum ada data pendaftar yang dapat disinkronkan.');
      return;
    }

    syncLockRef.current = true;
    setSyncingSupabase(true);
    setSyncResult(null);

    try {
      const result = await StorageService.syncRegistrantsToSupabase(
        registrants
      );

      if (mountedRef.current) {
        setSyncResult(
          result?.message || 'Proses sinkronisasi selesai.'
        );
      }
    } catch (error) {
      console.error('Supabase synchronization error:', error);

      if (mountedRef.current) {
        setSyncResult(
          error instanceof Error
            ? `Sinkronisasi gagal: ${error.message}`
            : 'Sinkronisasi gagal. Periksa koneksi dan konfigurasi Supabase.'
        );
      }
    } finally {
      syncLockRef.current = false;

      if (mountedRef.current) {
        setSyncingSupabase(false);
      }
    }
  };

  // 4. Copy SQL setup
  const handleCopySql = async () => {
    if (sqlLockRef.current) return;

    sqlLockRef.current = true;
    setCopyingSql(true);

    try {
      const sql = SupabaseService.getSupabaseSetupSql();

      const success = await copyToClipboard(sql);

      if (!success) {
        throw new Error('Clipboard tidak dapat diakses.');
      }

      if (mountedRef.current) {
        setCopiedSql(true);

        scheduleReset(() => {
          setCopiedSql(false);
        });
      }
    } catch (error) {
      console.error('Copy SQL error:', error);

      alert('Gagal menyalin SQL. Silakan coba kembali.');
    } finally {
      sqlLockRef.current = false;

      if (mountedRef.current) {
        setCopyingSql(false);
      }
    }
  };

  const handlePrint = () => {
    try {
      onPrintRecapPdf();
    } catch (error) {
      console.error('Print PDF error:', error);

      alert('Gagal membuka cetak PDF. Silakan coba kembali.');
    }
  };

  const supabaseUrl = SUPABASE_CONFIG?.REST_URL
    ? String(SUPABASE_CONFIG.REST_URL).replace(/^https?:\/\//, '')
    : 'Konfigurasi belum tersedia';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !syncingSupabase) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col max-h-[95vh]">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>

            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Rekapitulasi & Integrasi Data Spreadsheet
              </h3>

              <p className="text-xs text-emerald-100">
                Export Excel, PDF, Google Sheets & Supabase Cloud
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 overflow-y-auto">

          {/* COUNTER */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase block">
                Jumlah Data Siap Rekap:
              </span>

              <span className="text-xl font-black text-emerald-950 font-mono">
                {registrants.length} Data Pendaftar
              </span>
            </div>

            <span className="text-xs bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg whitespace-nowrap">
              Siap Diekspor
            </span>
          </div>

          {/* EXPORT OPTIONS */}
          <div className="grid sm:grid-cols-2 gap-4">

            {/* EXCEL */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">
                    Unduh File Excel (.xlsx)
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Workbook lengkap dengan 26 kolom data pendaftaran,
                  filter tabel, dan lebar kolom terstruktur.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}

                <span>
                  {exporting ? 'Menyiapkan Excel...' : 'Unduh Excel (.xlsx)'}
                </span>
              </button>
            </div>

            {/* PDF */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Printer className="w-5 h-5" />
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">
                    Cetak PDF Rekapan A4
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Format tabel rekapitulasi pendaftar dengan kop
                  surat resmi sekolah untuk laporan administrasi.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF Rekapan</span>
              </button>
            </div>
          </div>

          {/* GOOGLE SHEETS */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-600" />

                <h4 className="font-bold text-slate-900 text-sm">
                  Integrasi Google Spreadsheet
                </h4>
              </div>

              <button
                type="button"
                onClick={handleCopyForGoogleSheets}
                disabled={copyingCsv}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50 ${
                  copiedCsv
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copyingCsv ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : copiedCsv ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}

                <span>
                  {copyingCsv
                    ? 'Menyalin...'
                    : copiedCsv
                    ? 'Tersalin!'
                    : 'Salin Data untuk Google Sheets'}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Klik tombol salin, kemudian buka Google Sheets dan tekan
              <strong> Ctrl + V </strong>
              untuk memasukkan seluruh data ke dalam baris dan kolom
              secara otomatis.
            </p>

            {settings?.googleSheetSyncUrl && (
              <div className="pt-1 flex items-center gap-2">
                <a
                  href={settings.googleSheetSyncUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                >
                  <span>Buka Template Google Sheets Sekolah</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* SUPABASE */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Cloud className="w-5 h-5 text-cyan-400 shrink-0" />

                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white">
                    Supabase Cloud REST Database
                  </h4>

                  <span className="text-[11px] text-slate-400 font-mono break-all">
                    {supabaseUrl}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* COPY SQL */}
                <button
                  type="button"
                  onClick={handleCopySql}
                  disabled={copyingSql}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer transition disabled:opacity-50"
                >
                  {copyingSql ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : copiedSql ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}

                  <span>
                    {copyingSql
                      ? 'Menyalin...'
                      : copiedSql
                      ? 'SQL Tersalin!'
                      : 'Salin Skrip SQL'}
                  </span>
                </button>

                {/* SYNC */}
                <button
                  type="button"
                  onClick={handleTriggerSupabaseSync}
                  disabled={syncingSupabase || registrants.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      syncingSupabase ? 'animate-spin' : ''
                    }`}
                  />

                  <span>
                    {syncingSupabase
                      ? 'Sinkronisasi...'
                      : 'Sinkronkan Sekarang'}
                  </span>
                </button>
              </div>
            </div>

            {/* SYNC RESULT */}
            {syncResult && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 bg-slate-800 rounded-xl text-xs text-cyan-200 border border-slate-700 break-words"
              >
                {syncResult}
              </div>
            )}

            {syncingSupabase && (
              <p className="text-[11px] text-cyan-300">
                Sedang mengirim data pendaftar ke Supabase. Jangan tutup
                jendela ini sampai proses selesai.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetSyncModal;
