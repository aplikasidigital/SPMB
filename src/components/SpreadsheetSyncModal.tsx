/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { StorageService, SUPABASE_CONFIG } from '../services/storageService';
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
  Layers
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

  // 1. Export Excel (.xlsx) using SheetJS
  const handleExportExcel = () => {
    const rows = registrants.map((r, index) => ({
      'No.': index + 1,
      'No. Pendaftaran': r.registrationNumber,
      'Tanggal Daftar': r.createdAt,
      'Nama Lengkap Siswa': r.personalData.fullName,
      'NISN': r.personalData.nisn,
      'NIK': r.personalData.nik || '-',
      'Jenis Kelamin': r.personalData.gender,
      'Tempat Lahir': r.personalData.birthPlace,
      'Tanggal Lahir': r.personalData.birthDate,
      'No. WhatsApp': r.personalData.phoneWhatsApp,
      'Email': r.personalData.email || '-',
      'Alamat Domisili': `${r.personalData.address}, RT/RW ${r.personalData.rtRw}, Kel. ${r.personalData.village}, Kec. ${r.personalData.district}, ${r.personalData.city}`,
      'Pilihan 1 (Utama)': r.majorChoice.firstChoice,
      'Pilihan 2 (Cadangan)': r.majorChoice.secondChoice,
      'Asal SMP/MTs': r.schoolOrigin.schoolName,
      'Tahun Lulus': r.schoolOrigin.graduationYear,
      'Nilai Rapor': r.schoolOrigin.averageScore || '-',
      'Nama Ayah': r.parentData.fatherName,
      'No. Telp Ayah': r.parentData.fatherPhone || '-',
      'Nama Ibu': r.parentData.motherName,
      'No. Telp Ibu': r.parentData.motherPhone || '-',
      'Penghasilan Ortu': r.parentData.monthlyIncome,
      'Gelombang': r.wave,
      'Status Pendaftaran': r.status,
      'Catatan Panitia': r.statusNote || '-',
      'Verifikator': r.verifiedBy || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    // Auto-fit column widths
    const colWidths = [
      { wch: 5 }, { wch: 16 }, { wch: 20 }, { wch: 28 }, { wch: 14 }, { wch: 18 },
      { wch: 14 }, { wch: 15 }, { wch: 14 }, { wch: 16 }, { wch: 24 }, { wch: 40 },
      { wch: 32 }, { wch: 32 }, { wch: 26 }, { wch: 12 }, { wch: 12 }, { wch: 24 },
      { wch: 16 }, { wch: 24 }, { wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 16 },
      { wch: 30 }, { wch: 20 }
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pendaftar SPMB');

    const fileName = `Rekap_SPMB_${settings.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // 2. Generate CSV for quick clipboard copy to Google Sheets
  const generateCsv = () => {
    const headers = [
      'No', 'No. Pendaftaran', 'Nama Siswa', 'NISN', 'Jurusan Pilihan 1', 'Jurusan Pilihan 2', 'Asal SMP', 'No. WhatsApp', 'Gelombang', 'Status'
    ];
    const dataLines = registrants.map((r, i) => [
      i + 1,
      `"${r.registrationNumber}"`,
      `"${r.personalData.fullName}"`,
      `"${r.personalData.nisn}"`,
      `"${r.majorChoice.firstChoice}"`,
      `"${r.majorChoice.secondChoice}"`,
      `"${r.schoolOrigin.schoolName}"`,
      `"${r.personalData.phoneWhatsApp}"`,
      `"${r.wave}"`,
      `"${r.status}"`
    ].join('\t')); // Tab-delimited for instant paste into Google Sheets cells!

    return [headers.join('\t'), ...dataLines].join('\n');
  };

  const handleCopyForGoogleSheets = () => {
    const tsvData = generateCsv();
    navigator.clipboard.writeText(tsvData);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 3000);
  };

  // 3. Supabase REST Direct Sync Trigger
  const handleTriggerSupabaseSync = async () => {
    setSyncingSupabase(true);
    setSyncResult(null);

    const res = await StorageService.syncRegistrantsToSupabase(registrants);
    setSyncingSupabase(false);
    setSyncResult(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Rekapitulasi & Integrasi Data Spreadsheet
              </h3>
              <p className="text-xs text-emerald-100">
                Export Excel .xlsx, PDF Rekapan, Google Sheets & Supabase Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Counter */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase block">Jumlah Data Siap Rekap:</span>
              <span className="text-xl font-black text-emerald-950 font-mono">{registrants.length} Data Pendaftar</span>
            </div>
            <span className="text-xs bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg">
              Siap Diekspor
            </span>
          </div>

          {/* Export Options Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* 1. Unduh Excel (.xlsx) */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Unduh File Excel (.xlsx)</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Dokumen workbook spreadsheet lengkap dengan 26 kolom terstruktur, kolom auto-width, dan formula status.
                </p>
              </div>
              <button
                onClick={handleExportExcel}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Excel (.xlsx)</span>
              </button>
            </div>

            {/* 2. Unduh PDF Rekapan */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Cetak PDF Rekapan A4</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Format tabel rekapitulasi data pendaftar ber-kop surat resmi sekolah untuk laporan pimpinan atau dinas.
                </p>
              </div>
              <button
                onClick={onPrintRecapPdf}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF Rekapan</span>
              </button>
            </div>
          </div>

          {/* Google Sheets Integration Section */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Integrasi Google Spreadsheet</h4>
              </div>
              <button
                onClick={handleCopyForGoogleSheets}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  copiedCsv ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copiedCsv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCsv ? 'Tersalin ke Clipboard!' : 'Salin Data untuk Google Sheets'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Klik <strong>Salin Data untuk Google Sheets</strong> lalu cukup tekan <code>Ctrl + V</code> pada lembar Google Spreadsheet Anda untuk mengisi seluruh baris dan kolom secara rapi otomatis.
            </p>
            {settings.googleSheetSyncUrl && (
              <div className="pt-1 flex items-center gap-2">
                <a
                  href={settings.googleSheetSyncUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                >
                  <span>Buka Template Google Sheets Sekolah</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Supabase Cloud REST Status */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">Supabase Cloud REST Database</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {SUPABASE_CONFIG.REST_URL.replace('https://', '')}
                  </span>
                </div>
              </div>
              <button
                onClick={handleTriggerSupabaseSync}
                disabled={syncingSupabase}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-spin' : ''}`} />
                <span>{syncingSupabase ? 'Sinkronisasi...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {syncResult && (
              <div className="p-2.5 bg-slate-800 rounded-xl text-xs text-cyan-200 border border-slate-700">
                {syncResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
