
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { Printer, X } from 'lucide-react';

interface Props {
  registrants: StudentRegistration[];
  settings: SchoolSettings;
  onClose: () => void;
}

export const PrintableRecapTable: React.FC<Props> = ({
  registrants,
  settings,
  onClose,
}) => {
  const handlePrint = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Cetak menggunakan mekanisme bawaan browser.
    // CSS print di bawah membatasi area yang dicetak.
    window.print();
  }, []);

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const safeText = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  };

  const getWave = (wave: unknown): string => {
    if (!wave) return '-';
    return String(wave).split(' ')[0];
  };

  return (
    <div className="print-modal fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto flex justify-center items-start sm:items-center p-2 sm:p-6">

      <div className="print-container bg-white rounded-2xl max-w-5xl w-full shadow-2xl my-auto text-slate-800 overflow-hidden">

        {/* Controls */}
        <div className="no-print flex items-center justify-between gap-3 p-4 bg-slate-900 text-white border-b border-slate-700">

          <div className="flex items-center gap-2 min-w-0">
            <Printer className="w-5 h-5 text-blue-400 shrink-0" />

            <h3 className="font-bold text-sm">
              Cetak Laporan Rekapitulasi Pendaftar
              <span className="hidden sm:inline">
                {' '}(Format A4 Landscape)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* Printable Sheet */}
        <div
          id="printable-registration-card"
          className="print-content p-4 sm:p-8 font-sans bg-white text-slate-900 text-xs"
        >

          {/* Kop Sekolah */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">

            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              YAYASAN PENDIDIKAN LENTERA BANGSA
            </h4>

            <h1 className="text-xl font-extrabold uppercase text-slate-900">
              {safeText(settings.schoolName)}
            </h1>

            <p className="text-[11px] text-slate-600">
              {safeText(settings.address)}
              {' | '}
              Telp: {safeText(settings.phone)}
              {' | '}
              NPSN: {safeText(settings.npsn)}
            </p>

          </div>

          {/* Judul Laporan */}
          <div className="text-center mb-4">

            <h2 className="text-sm font-extrabold uppercase underline">
              REKAPITULASI DATA PENDAFTAR SISTEM PENERIMAAN MURID BARU (SPMB)
            </h2>

            <p className="text-[11px] text-slate-600 font-medium mt-1">
              TAHUN AJARAN {safeText(settings.academicYear)}
              {' | '}
              Dicetak pada: {printDate}
            </p>

          </div>

          {/* Tabel Rekapitulasi */}
          <div className="w-full overflow-x-auto">

            <table className="w-full border-collapse border border-slate-400 text-[10px] sm:text-[11px]">

              <thead>
                <tr className="bg-slate-100 text-slate-800">

                  <th className="border border-slate-400 p-1.5 text-center w-8">
                    No
                  </th>

                  <th className="border border-slate-400 p-1.5 text-left">
                    No. Registrasi
                  </th>

                  <th className="border border-slate-400 p-1.5 text-left">
                    Nama Siswa
                  </th>

                  <th className="border border-slate-400 p-1.5 text-center">
                    NISN
                  </th>

                  <th className="border border-slate-400 p-1.5 text-left">
                    Jurusan Pilihan 1
                  </th>

                  <th className="border border-slate-400 p-1.5 text-left">
                    Asal SMP
                  </th>

                  <th className="border border-slate-400 p-1.5 text-center">
                    No. WhatsApp
                  </th>

                  <th className="border border-slate-400 p-1.5 text-center">
                    Gelombang
                  </th>

                  <th className="border border-slate-400 p-1.5 text-center">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {registrants && registrants.length > 0 ? (

                  registrants.map((r, i) => (

                    <tr
                      key={r.id ?? `registrant-${i}`}
                      className="hover:bg-slate-50"
                    >

                      <td className="border border-slate-400 p-1.5 text-center">
                        {i + 1}
                      </td>

                      <td className="border border-slate-400 p-1.5 font-mono font-bold text-slate-900">
                        {safeText(r.registrationNumber)}
                      </td>

                      <td className="border border-slate-400 p-1.5 font-semibold text-slate-900 uppercase">
                        {safeText(r.personalData?.fullName)}
                      </td>

                      <td className="border border-slate-400 p-1.5 text-center font-mono">
                        {safeText(r.personalData?.nisn)}
                      </td>

                      <td className="border border-slate-400 p-1.5">
                        {safeText(r.majorChoice?.firstChoice)}
                      </td>

                      <td className="border border-slate-400 p-1.5">
                        {safeText(r.schoolOrigin?.schoolName)}
                      </td>

                      <td className="border border-slate-400 p-1.5 text-center font-mono">
                        {safeText(r.personalData?.phoneWhatsApp)}
                      </td>

                      <td className="border border-slate-400 p-1.5 text-center">
                        {getWave(r.wave)}
                      </td>

                      <td className="border border-slate-400 p-1.5 text-center font-bold">
                        {safeText(r.status)}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td
                      colSpan={9}
                      className="border border-slate-400 p-5 text-center text-slate-500 font-medium"
                    >
                      Belum ada data pendaftar.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* Jumlah Pendaftar */}
          <div className="mt-3 text-right text-[11px] font-bold">
            TOTAL PENDAFTAR: {registrants?.length ?? 0} SISWA
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 gap-8 text-center mt-8 pt-4">

            <div>

              <p className="mb-14">
                Mengetahui,
                <br />
                Kepala Sekolah
              </p>

              <p className="font-bold uppercase underline">
                {safeText(settings.headmasterName)}
              </p>

              <p className="text-[10px] text-slate-500">
                NIP. {safeText(settings.headmasterNip)}
              </p>

            </div>

            <div>

              <p className="mb-14">
                Karawang, {printDate}
                <br />
                Ketua Panitia SPMB
              </p>

              <p className="font-bold uppercase underline">
                {safeText(settings.committeeHeadName)}
              </p>

              <p className="text-[10px] text-slate-500">
                NUPTK Panitia PPDB
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Print Styles */}
      <style>{`
        @page {
          size: A4 landscape;
          margin: 10mm;
        }

        @media print {

          html,
          body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-modal,
          .print-container,
          #printable-registration-card,
          #printable-registration-card * {
            visibility: visible !important;
          }

          .no-print {
            display: none !important;
          }

          .print-modal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
          }

          .print-container {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          #printable-registration-card {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10px !important;
          }

          #printable-registration-card table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
            page-break-inside: auto !important;
          }

          #printable-registration-card thead {
            display: table-header-group !important;
          }

          #printable-registration-card tbody {
            display: table-row-group !important;
          }

          #printable-registration-card tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          #printable-registration-card th,
          #printable-registration-card td {
            border: 1px solid #777777 !important;
            padding: 5px 4px !important;
            color: #000000 !important;
            vertical-align: middle !important;
            overflow-wrap: anywhere !important;
          }

          #printable-registration-card th {
            background-color: #e5e7eb !important;
            font-weight: bold !important;
          }

          #printable-registration-card .grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 32px !important;
          }

          #printable-registration-card .mt-8 {
            margin-top: 28px !important;
          }

          #printable-registration-card .mb-14 {
            margin-bottom: 55px !important;
          }

          #printable-registration-card .uppercase {
            text-transform: uppercase !important;
          }

          #printable-registration-card .underline {
            text-decoration: underline !important;
          }

          .overflow-x-auto {
            overflow: visible !important;
          }

          button {
            display: none !important;
          }

        }
      `}</style>

    </div>
  );
};
