
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo } from 'react';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { QRCodeSVG } from './QRCodeSVG';
import {
  Printer,
  X,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  registration: StudentRegistration;
  settings: SchoolSettings;
  onClose?: () => void;
  isModal?: boolean;
}

export const PrintableRegistrationCard: React.FC<Props> = ({
  registration,
  settings,
  onClose,
  isModal = true,
}) => {
  const verificationUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';

    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set(
      'verify',
      registration.registrationNumber || ''
    );

    return url.toString();
  }, [registration.registrationNumber]);

  const securityHash = useMemo(() => {
    const value = registration.registrationNumber || '';

    const hash = value.split('').reduce(
      (acc, char) =>
        (acc << 5) - acc + char.charCodeAt(0),
      0
    );

    return Math.abs(hash);
  }, [registration.registrationNumber]);

  const printDate = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const handlePrint = useCallback(() => {
    if (typeof window === 'undefined') return;

    const printStyles = `
      @page {
        size: A4 portrait;
        margin: 10mm;
      }

      @media print {
        html,
        body {
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          overflow: visible !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body * {
          visibility: hidden !important;
        }

        #printable-registration-card,
        #printable-registration-card * {
          visibility: visible !important;
        }

        #printable-registration-card {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          min-height: 0 !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          overflow: visible !important;
          background: white !important;
        }

        .no-print {
          display: none !important;
          visibility: hidden !important;
        }

        #printable-registration-card table {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        #printable-registration-card tr,
        #printable-registration-card img,
        #printable-registration-card .print-keep {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        #printable-registration-card img {
          max-width: 100% !important;
        }

        #printable-registration-card {
          color: #0f172a !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'registration-print-styles';
    styleElement.innerHTML = printStyles;

    const previousStyle = document.getElementById(
      'registration-print-styles'
    );

    if (previousStyle) {
      previousStyle.remove();
    }

    document.head.appendChild(styleElement);

    const cleanup = () => {
      const style = document.getElementById(
        'registration-print-styles'
      );

      if (style) style.remove();

      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);

    window.setTimeout(() => {
      window.print();

      // Fallback cleanup untuk browser yang tidak memicu afterprint.
      window.setTimeout(cleanup, 3000);
    }, 150);
  }, []);

  const statusClass =
    registration.status === 'DITERIMA'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : registration.status === 'DIBATALKAN'
        ? 'bg-rose-100 text-rose-800 border-rose-300'
        : 'bg-amber-100 text-amber-800 border-amber-300';

  const documentStatus = (url?: string) => (
    <span
      className={
        url
          ? 'text-emerald-700 font-bold'
          : 'text-slate-400'
      }
    >
      {url ? '✓ Ada' : '- Belum'}
    </span>
  );

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto flex justify-center items-start p-2 sm:p-6'
          : 'w-full'
      }
    >
      <div className="relative w-full max-w-[210mm] bg-white rounded-xl shadow-2xl my-auto text-slate-800 overflow-hidden">

        {/* MODAL CONTROLS */}
        {isModal && (
          <div className="no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-slate-900 text-white border-b border-slate-700">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-lg">
                <Printer className="w-5 h-5 text-white" />
              </span>

              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">
                  Bukti Pendaftaran Resmi
                </h3>

                <p className="text-xs text-slate-300">
                  Format A4 — Siap dicetak atau disimpan PDF
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENT BODY */}
        <div
          id="printable-registration-card"
          className="p-5 sm:p-8 md:p-10 font-sans text-slate-900 bg-white leading-relaxed border border-slate-200"
          style={{
            width: '100%',
            minHeight: '277mm',
            boxSizing: 'border-box',
          }}
        >

          {/* HEADER */}
          <div className="border-b-2 border-slate-900 pb-3 mb-5">
            <div className="flex items-center justify-between gap-4">

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold tracking-widest text-blue-700 uppercase block">
                  SISTEM PENERIMAAN MURID BARU (SPMB ONLINE)
                </span>

                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight leading-tight">
                  FORMULIR & BUKTI PENDAFTARAN SISWA BARU
                </h1>

                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {settings.schoolName} — TAHUN AJARAN {settings.academicYear}
                </p>

                <p className="text-[11px] text-slate-500 break-words">
                  {settings.address} | Hotline SPMB:{' '}
                  {settings.whatsappNumber || '0813-1442-0312'}
                </p>
              </div>

              {/* QR VERIFICATION */}
              <div className="shrink-0 text-center flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                {verificationUrl && (
                  <QRCodeSVG
                    value={verificationUrl}
                    size={64}
                  />
                )}

                <span className="text-[9px] font-mono font-bold text-slate-600 mt-1">
                  VERIFIKASI SISTEM
                </span>
              </div>

            </div>
          </div>

          {/* TITLE */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4">
              TANDA BUKTI PENDAFTARAN PESERTA DIDIK BARU (PPDB / SPMB)
            </h2>

            <p className="text-xs font-semibold text-slate-600 mt-1">
              TAHUN AJARAN {settings.academicYear} | {registration.wave}
            </p>
          </div>

          {/* REGISTRATION INFORMATION */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-300 mb-6 text-xs">

            <div>
              <span className="text-slate-500 block text-[11px]">
                Nomor Pendaftaran:
              </span>

              <span className="font-mono text-sm font-black text-blue-900 break-all">
                {registration.registrationNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Tanggal Mendaftar:
              </span>

              <span className="font-semibold text-slate-800">
                {registration.createdAt}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">
                Status Seleksi Administrasi:
              </span>

              <span
                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded border text-[11px] ${statusClass}`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {registration.status}
              </span>
            </div>

          </div>

          {/* MAIN SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6">

            {/* LEFT COLUMN */}
            <div className="sm:col-span-9 space-y-4 text-xs">

              {/* 1. STUDENT PERSONAL DATA */}
              <div className="print-keep">
                <h3 className="font-bold uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>

                  DATA DIRI CALON SISWA
                </h3>

                <table className="w-full text-[11.5px] border-collapse">
                  <tbody>

                    <tr className="border-b border-slate-100">
                      <td className="w-40 py-1 text-slate-600 font-medium">
                        Nama Lengkap
                      </td>

                      <td className="w-3 text-slate-400">:</td>

                      <td className="py-1 font-bold text-slate-900 uppercase">
                        {registration.personalData.fullName}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">
                        Nomor KK / NIK
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 font-mono font-semibold text-slate-800 break-words">
                        {registration.personalData.familyCardNumber
                          ? `No. KK: ${registration.personalData.familyCardNumber} | `
                          : ''}
                        NIK: {registration.personalData.nik || '-'}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">
                        NISN
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 font-mono text-slate-800">
                        {registration.personalData.nisn || '(Tidak diisi / belum ada)'}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">
                        Tempat, Tanggal Lahir
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 text-slate-800">
                        {registration.personalData.birthPlace},{' '}
                        {registration.personalData.birthDate}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">
                        Jenis Kelamin / Agama
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 text-slate-800">
                        {registration.personalData.gender} /{' '}
                        {registration.personalData.religion}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">
                        No. Handphone / WhatsApp
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 font-mono text-slate-800">
                        {registration.personalData.phoneWhatsApp}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">
                        Email Calon Siswa
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 text-slate-800 break-all">
                        {registration.personalData.email}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1 text-slate-600 font-medium align-top">
                        Alamat Domisili
                      </td>

                      <td className="text-slate-400 align-top">:</td>

                      <td className="py-1 text-slate-800 leading-tight">
                        {registration.personalData.address}, RT/RW{' '}
                        {registration.personalData.rtRw}, Kel.{' '}
                        {registration.personalData.village}, Kec.{' '}
                        {registration.personalData.district},{' '}
                        {registration.personalData.city}, Prov.{' '}
                        {registration.personalData.province}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* 2. MAJOR CHOICE */}
              <div className="print-keep">
                <h3 className="font-bold uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>

                  PROGRAM KEAHLIAN (JURUSAN) YANG DIPILIH
                </h3>

                <div className="grid grid-cols-2 gap-2 text-[11px]">

                  <div className="p-2 border border-blue-200 bg-blue-50 rounded">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">
                      Pilihan 1 (Utama)
                    </span>

                    <strong className="text-blue-950 font-bold text-xs">
                      {registration.majorChoice.firstChoice}
                    </strong>
                  </div>

                  <div className="p-2 border border-slate-200 bg-slate-50 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Pilihan 2 (Cadangan)
                    </span>

                    <strong className="text-slate-800 text-xs">
                      {registration.majorChoice.secondChoice || '-'}
                    </strong>
                  </div>

                </div>
              </div>

              {/* 3. SCHOOL ORIGIN AND PARENTS */}
              <div className="print-keep">
                <h3 className="font-bold uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>

                  ASAL SEKOLAH & DATA ORANG TUA / WALI
                </h3>

                <table className="w-full text-[11px] border-collapse">
                  <tbody>

                    <tr className="border-b border-slate-100">
                      <td className="w-40 py-1 text-slate-600 font-medium">
                        Asal Sekolah (SMP/MTs)
                      </td>

                      <td className="w-3 text-slate-400">:</td>

                      <td className="py-1 font-semibold text-slate-800">
                        {registration.schoolOrigin.schoolName} (Lulus{' '}
                        {registration.schoolOrigin.graduationYear})
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">
                        Nama Ayah Kandung
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 text-slate-800">
                        {registration.parentData.fatherName} (
                        {registration.parentData.fatherJob || 'Bekerja'})
                        {' - Telp: '}
                        {registration.parentData.fatherPhone || '-'}
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">
                        Nama Ibu Kandung
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 text-slate-800">
                        {registration.parentData.motherName} (
                        {registration.parentData.motherJob || 'Ibu Rumah Tangga'})
                        {' - Telp: '}
                        {registration.parentData.motherPhone || '-'}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-1 text-slate-600 font-medium">
                        Penghasilan Gabungan Ortu
                      </td>

                      <td className="text-slate-400">:</td>

                      <td className="py-1 text-slate-800">
                        {registration.parentData.monthlyIncome || '-'}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="sm:col-span-3 flex flex-col items-center">

              {/* PHOTO */}
              <div className="w-32 h-44 border-2 border-dashed border-slate-400 rounded-md p-1 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">

                {registration.documents.photoUrl ? (
                  <img
                    src={registration.documents.photoUrl}
                    alt="Pas Foto 3x4"
                    className="w-full h-full object-cover rounded"
                    loading="eager"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <span className="text-[11px] font-bold block mb-1">
                      PAS FOTO RESMI
                    </span>

                    <span className="text-[9px] block">
                      Ukuran 3 x 4 cm
                    </span>

                    <span className="text-[8px] block text-slate-400 mt-2">
                      (Tempel atau Unggah)
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[8px] text-center py-0.5">
                  FOTO 3X4 PESERTA
                </div>

              </div>

              {/* DOCUMENT CHECKLIST */}
              <div className="w-full mt-4 p-2 bg-slate-50 border border-slate-200 rounded text-[10px] space-y-1 print-keep">

                <span className="font-bold text-slate-700 block text-center border-b border-slate-200 pb-0.5 mb-1">
                  STATUS BERKAS:
                </span>

                <div className="flex items-center justify-between gap-1">
                  <span>Kartu Keluarga (KK)</span>
                  {documentStatus(registration.documents.familyCardUrl)}
                </div>

                <div className="flex items-center justify-between gap-1">
                  <span>Akta Kelahiran</span>
                  {documentStatus(registration.documents.birthCertUrl)}
                </div>

                <div className="flex items-center justify-between gap-1">
                  <span>KTP Orang Tua</span>
                  {documentStatus(registration.documents.parentKtpUrl)}
                </div>

                <div className="flex items-center justify-between gap-1">
                  <span>Ijazah / SKL</span>
                  {documentStatus(registration.documents.reportOrDiplomaUrl)}
                </div>

              </div>
            </div>

          </div>

          {/* IMPORTANT INSTRUCTIONS */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-[10.5px] leading-relaxed text-amber-950 mb-6 print-keep">

            <strong className="font-bold block text-amber-900 mb-0.5">
              KETENTUAN DAN INSTRUKSI DAFTAR ULANG:
            </strong>

            <ol className="list-decimal pl-4 space-y-0.5 text-slate-800">
              <li>
                Cetak lembar bukti pendaftaran ini dan bawa saat verifikasi fisik serta pengukuran seragam di kampus SMK Lentera Bangsa 2.
              </li>

              <li>
                Lampirkan fotokopi Kartu Keluarga (KK), Akta Kelahiran, KTP Orang Tua, dan Surat Keterangan Lulus (SKL) / Ijazah masing-masing 2 lembar.
              </li>

              <li>
                Bagi pemegang KIP/KPS/PKH, harap melampirkan fotokopi kartu asli untuk validasi beasiswa pendidikan.
              </li>

              <li>
                Nomor Pendaftaran ini adalah nomor unik yang sah dan terdaftar pada database server sekolah.
              </li>
            </ol>

          </div>

          {/* SIGNATURE */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6 pt-2 print-keep">

            <div>
              <p className="text-slate-600 mb-1">
                Mengetahui,
              </p>

              <p className="font-semibold text-slate-800 mb-16">
                Orang Tua / Wali Calon Siswa,
              </p>

              <div className="border-b border-slate-900 w-44 max-w-full mx-auto" />

              <p className="font-bold text-slate-900 mt-1 uppercase">
                ( {registration.parentData.fatherName ||
                    registration.parentData.motherName ||
                    'Nama Orang Tua'} )
              </p>
            </div>

            <div>
              <p className="text-slate-600 mb-1">
                Karawang, {printDate}
              </p>

              <p className="font-semibold text-slate-800 mb-16">
                Ketua Panitia SPMB SMK Lentera Bangsa 2,
              </p>

              <div className="border-b border-slate-900 w-48 max-w-full mx-auto" />

              <p className="font-bold text-slate-900 mt-1 uppercase">
                ( {settings.committeeHeadName ||
                    'Ahmad Fauzi, S.Kom., M.T.'} )
              </p>

              <span className="text-[10px] text-slate-500 block">
                NIP / NUPTK Panitia PPDB
              </span>
            </div>

          </div>

          {/* FOOTER */}
          <div className="mt-8 pt-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">

            <span>
              Dokumen ini diterbitkan resmi oleh Sistem SPMB Online{' '}
              {settings.schoolName}
            </span>

            <span className="font-mono break-all">
              Security Hash: {registration.registrationNumber}-{securityHash}
            </span>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PrintableRegistrationCard;
