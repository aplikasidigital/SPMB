/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { QRCodeSVG } from './QRCodeSVG';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
  const handlePrint = () => {
    window.print();
  };

  const verificationUrl = `${window.location.origin}?verify=${registration.registrationNumber}`;

  return (
    <div className={isModal ? 'fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto flex justify-center p-2 sm:p-6' : ''}>
      {/* Container */}
      <div className="relative w-full max-w-[210mm] bg-white rounded-xl shadow-2xl my-auto text-slate-800">
        {/* Modal Controls (Not printed) */}
        {isModal && (
          <div className="no-print sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-t-xl border-b border-slate-700">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-lg">
                <Printer className="w-5 h-5 text-white" />
              </span>
              <div>
                <h3 className="font-bold text-lg leading-tight">Bukti Pendaftaran Resmi (Format Presisi A4)</h3>
                <p className="text-xs text-slate-300">Siap dicetak atau disimpan sebagai PDF (Kertas A4)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- EXACT A4 PRINTABLE DOCUMENT BODY --- */}
        <div
          id="printable-registration-card"
          className="p-8 sm:p-10 font-sans text-slate-900 bg-white leading-relaxed border border-slate-200"
          style={{ width: '100%', minHeight: '297mm', boxSizing: 'border-box' }}
        >
          {/* CSS Print Rules: Standard A4 with 1cm (10mm) Margins & No Kop Surat */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .no-print {
                display: none !important;
              }
              #printable-registration-card {
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                width: 100% !important;
              }
            }
          `}</style>

          {/* HEADER FORMULIR PENDAFTARAN A4 (TANPA KOP SURAT) */}
          <div className="border-b-2 border-slate-900 pb-3 mb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-[10px] font-bold tracking-widest text-blue-700 uppercase block">
                  SISTEM PENERIMAAN MURID BARU (SPMB ONLINE)
                </span>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight leading-tight">
                  FORMULIR & BUKTI PENDAFTARAN SISWA BARU
                </h1>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {settings.schoolName} — TAHUN AJARAN {settings.academicYear}
                </p>
                <p className="text-[11px] text-slate-500">
                  {settings.address} | Hotline SPMB: {settings.whatsappNumber || '0813-1442-0312'}
                </p>
              </div>

              {/* QR Verification & Registration Badge */}
              <div className="shrink-0 text-center flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                <QRCodeSVG value={verificationUrl} size={64} />
                <span className="text-[9px] font-mono font-bold text-slate-600 mt-1">VERIFIKASI SISTEM</span>
              </div>
            </div>
          </div>

          {/* JUDUL DOKUMEN */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4">
              TANDA BUKTI PENDAFTARAN PESERTA DIDIK BARU (PPDB / SPMB)
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              TAHUN AJARAN {settings.academicYear} | {registration.wave}
            </p>
          </div>

          {/* HEADER INFO BOX (NOMOR PENDAFTARAN & STATUS) */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-300 mb-6 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Nomor Pendaftaran:</span>
              <span className="font-mono text-sm font-black text-blue-900">{registration.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tanggal Mendaftar:</span>
              <span className="font-semibold text-slate-800">{registration.createdAt}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Status Seleksi Administrasi:</span>
              <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                registration.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                registration.status === 'DIBATALKAN' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {registration.status}
              </span>
            </div>
          </div>

          {/* MAIN TWO-COLUMN SECTION */}
          <div className="grid grid-cols-12 gap-4 mb-6">
            {/* Left Column: Data Siswa (9 cols) */}
            <div className="col-span-9 space-y-4 text-xs">
              {/* 1. DATA PRIBADI SISWA */}
              <div>
                <h3 className="font-bold uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                  DATA DIRI CALON SISWA
                </h3>
                <table className="w-full text-[11.5px] border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-40 py-1 text-slate-600 font-medium">Nama Lengkap</td>
                      <td className="w-3 text-slate-400">:</td>
                      <td className="py-1 font-bold text-slate-900 uppercase">{registration.personalData.fullName}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">Nomor KK / NIK</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 font-mono font-semibold text-slate-800">
                        {registration.personalData.familyCardNumber ? `No. KK: ${registration.personalData.familyCardNumber} | ` : ''}NIK: {registration.personalData.nik || '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">NISN</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 font-mono text-slate-800">
                        {registration.personalData.nisn || '(Tidak diisi / belum ada)'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">Tempat, Tanggal Lahir</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 text-slate-800">
                        {registration.personalData.birthPlace}, {registration.personalData.birthDate}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">Jenis Kelamin / Agama</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 text-slate-800">
                        {registration.personalData.gender} / {registration.personalData.religion}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">No. Handphone / WhatsApp</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 font-mono text-slate-800">{registration.personalData.phoneWhatsApp}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">Email Calon Siswa</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 text-slate-800">{registration.personalData.email}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600 font-medium align-top">Alamat Domisili</td>
                      <td className="text-slate-400 align-top">:</td>
                      <td className="py-1 text-slate-800 leading-tight">
                        {registration.personalData.address}, RT/RW {registration.personalData.rtRw}, Kel. {registration.personalData.village}, Kec. {registration.personalData.district}, {registration.personalData.city}, Prov. {registration.personalData.province}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. PILIHAN PROGRAM KEAHLIAN / JURUSAN */}
              <div>
                <h3 className="font-bold uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                  PROGRAM KEAHLIAN (JURUSAN) YANG DIPILIH
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 border border-blue-200 bg-blue-50/70 rounded">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">Pilihan 1 (Utama)</span>
                    <strong className="text-blue-950 font-bold text-xs">{registration.majorChoice.firstChoice}</strong>
                  </div>
                  <div className="p-2 border border-slate-200 bg-slate-50 rounded">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Pilihan 2 (Cadangan)</span>
                    <strong className="text-slate-800 text-xs">{registration.majorChoice.secondChoice || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* 3. ASAL SEKOLAH & DATA ORANG TUA */}
              <div>
                <h3 className="font-bold uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                  ASAL SEKOLAH & DATA ORANG TUA / WALI
                </h3>
                <table className="w-full text-[11px] border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-40 py-1 text-slate-600 font-medium">Asal Sekolah (SMP/MTs)</td>
                      <td className="w-3 text-slate-400">:</td>
                      <td className="py-1 font-semibold text-slate-800">{registration.schoolOrigin.schoolName} (Lulus {registration.schoolOrigin.graduationYear})</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">Nama Ayah Kandung</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 text-slate-800">{registration.parentData.fatherName} ({registration.parentData.fatherJob || 'Bekerja'}) - Telp: {registration.parentData.fatherPhone || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-600 font-medium">Nama Ibu Kandung</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 text-slate-800">{registration.parentData.motherName} ({registration.parentData.motherJob || 'Ibu Rumah Tangga'}) - Telp: {registration.parentData.motherPhone || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600 font-medium">Penghasilan Gabungan Ortu</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-1 text-slate-800">{registration.parentData.monthlyIncome || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Photo Frame & Checklist Berkas (3 cols) */}
            <div className="col-span-3 flex flex-col items-center">
              {/* 3x4 Photo Frame */}
              <div className="w-32 h-44 border-2 border-dashed border-slate-400 rounded-md p-1 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {registration.documents.photoUrl ? (
                  <img
                    src={registration.documents.photoUrl}
                    alt="Pas Foto 3x4"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <span className="text-[11px] font-bold block mb-1">PAS FOTO RESMI</span>
                    <span className="text-[9px] block">Ukuran 3 x 4 cm</span>
                    <span className="text-[8px] block text-slate-400 mt-2">(Tempel atau Unggah)</span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[8px] text-center py-0.5">
                  FOTO 3X4 PESERTA
                </div>
              </div>

              {/* Kelengkapan Berkas Checklist */}
              <div className="w-full mt-4 p-2 bg-slate-50 border border-slate-200 rounded text-[10px] space-y-1">
                <span className="font-bold text-slate-700 block text-center border-b border-slate-200 pb-0.5 mb-1">
                  STATUS BERKAS:
                </span>
                <div className="flex items-center justify-between">
                  <span>Kartu Keluarga (KK)</span>
                  <span className={registration.documents.familyCardUrl ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {registration.documents.familyCardUrl ? '✓ Ada' : '- Belum'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Akta Kelahiran</span>
                  <span className={registration.documents.birthCertUrl ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {registration.documents.birthCertUrl ? '✓ Ada' : '- Belum'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>KTP Orang Tua</span>
                  <span className={registration.documents.parentKtpUrl ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {registration.documents.parentKtpUrl ? '✓ Ada' : '- Belum'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ijazah / SKL</span>
                  <span className={registration.documents.reportOrDiplomaUrl ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {registration.documents.reportOrDiplomaUrl ? '✓ Ada' : '- Belum'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CATATAN PENTING & INSTRUKSI DAFTAR ULANG */}
          <div className="p-3 bg-amber-50/60 border border-amber-300 rounded-lg text-[10.5px] leading-relaxed text-amber-950 mb-6">
            <strong className="font-bold block text-amber-900 mb-0.5">KETENTUAN DAN INSTRUKSI DAFTAR ULANG:</strong>
            <ol className="list-decimal pl-4 space-y-0.5 text-slate-800">
              <li>Cetak lembar bukti pendaftaran ini dan bawa saat verifikasi fisik serta pengukuran seragam di kampus SMK Lentera Bangsa 2.</li>
              <li>Lampirkan fotokopi Kartu Keluarga (KK), Akta Kelahiran, KTP Orang Tua, dan Surat Keterangan Lulus (SKL) / Ijazah masing-masing 2 lembar.</li>
              <li>Bagi pemegang KIP/KPS/PKH, harap melampirkan fotokopi kartu asli untuk validasi beasiswa pendidikan.</li>
              <li>Nomor Pendaftaran ini adalah nomor unik yang sah dan terdaftar pada database server sekolah.</li>
            </ol>
          </div>

          {/* TANDA TANGAN & PENGESAHAN */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6 pt-2">
            <div>
              <p className="text-slate-600 mb-1">Mengetahui,</p>
              <p className="font-semibold text-slate-800 mb-16">Orang Tua / Wali Calon Siswa,</p>
              <div className="border-b border-slate-900 w-44 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1 uppercase">
                ( {registration.parentData.fatherName || registration.parentData.motherName || 'Nama Orang Tua'} )
              </p>
            </div>

            <div>
              <p className="text-slate-600 mb-1">Karawang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold text-slate-800 mb-16">Ketua Panitia SPMB SMK Lentera Bangsa 2,</p>
              <div className="border-b border-slate-900 w-48 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1 uppercase">
                ( {settings.committeeHeadName || 'Ahmad Fauzi, S.Kom., M.T.'} )
              </p>
              <span className="text-[10px] text-slate-500 block">NIP / NUPTK Panitia PPDB</span>
            </div>
          </div>

          {/* FOOTER STEMPEL & KEAMANAN DOKUMEN */}
          <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-400">
            <span>Dokumen ini diterbitkan resmi oleh Sistem SPMB Online {settings.schoolName}</span>
            <span className="font-mono">Security Hash: {registration.registrationNumber}-{Math.abs(registration.registrationNumber.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
