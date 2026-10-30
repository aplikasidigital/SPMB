/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { QRCodeSVG } from './QRCodeSVG';
import { Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';

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

  const verificationUrl = `${window.location.origin}?verify=${encodeURIComponent(registration.registrationNumber)}`;

  return (
    <div className={isModal ? 'fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto flex justify-center p-2 sm:p-4' : ''}>
      {/* Container */}
      <div className="relative w-full max-w-[210mm] bg-white rounded-2xl shadow-2xl my-auto text-slate-800">
        {/* Modal Controls (Not printed) */}
        {isModal && (
          <div className="no-print sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white rounded-t-2xl border-b border-slate-700">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-lg">
                <Printer className="w-4 h-4 text-white" />
              </span>
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-tight">Bukti Pendaftaran Resmi (Standar Presisi A4)</h3>
                <p className="text-[11px] text-slate-300">Layout proporsional, simetris & hemat ruang vertikal untuk cetak 1 lembar A4</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- EXACT A4 PRINTABLE DOCUMENT BODY --- */}
        <div
          id="printable-registration-card"
          className="p-6 sm:p-8 font-sans text-slate-900 bg-white leading-normal border border-slate-200 box-border"
          style={{ width: '100%', maxWidth: '210mm', minHeight: '290mm', margin: '0 auto' }}
        >
          {/* KOP SURAT EFISIEN & RESMI (KOMPAK & SIMETRIS) */}
          <div className="border-b-2 border-black pb-2 mb-3">
            <div className="flex items-center justify-between gap-3">
              {/* Logo Sekolah (Kompak 52x52px) */}
              <div className="w-14 h-14 shrink-0 flex items-center justify-center p-0.5">
                <img
                  src={settings.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80"}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Teks Identitas Kop Surat */}
              <div className="text-center flex-1 px-1">
                <h4 className="text-[10px] font-bold tracking-widest text-slate-700 uppercase leading-none mb-0.5">
                  YAYASAN PENDIDIKAN LENTERA BANGSA
                </h4>
                <h1 className="text-lg sm:text-xl font-black uppercase text-slate-950 tracking-tight leading-tight">
                  {settings.schoolName || 'SMK LENTERA BANGSA 2'}
                </h1>
                <div className="text-[10px] font-bold text-slate-800 flex items-center justify-center gap-2 leading-none my-0.5">
                  <span>{settings.accreditation || 'TERAKREDITASI "A"'}</span>
                  <span>•</span>
                  <span>NPSN: {settings.npsn || '69987654'}</span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-tight">
                  {settings.address}
                </p>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Telp: {settings.phone} | WA: +{settings.whatsappNumber} | Email: {settings.email} | Web: {settings.website || 'smklb2.sch.id'}
                </p>
              </div>

              {/* QR Verification in Kop (Kompak 50x50px) */}
              <div className="shrink-0 text-center flex flex-col items-center">
                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                  <QRCodeSVG value={verificationUrl} size={48} />
                </div>
                <span className="text-[8px] font-mono font-bold text-slate-600 mt-0.5">VERIFIKASI RESMI</span>
              </div>
            </div>
            {/* Double Rule Effect: 1 hairline underneath */}
            <div className="border-b border-black mt-0.5"></div>
          </div>

          {/* JUDUL DOKUMEN (KOMPAK) */}
          <div className="text-center mb-3">
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-950 underline underline-offset-2">
              TANDA BUKTI PENDAFTARAN PESERTA DIDIK BARU (SPMB ONLINE)
            </h2>
            <p className="text-[11px] font-bold text-slate-700 mt-0.5">
              TAHUN AJARAN {settings.academicYear} • {registration.wave}
            </p>
          </div>

          {/* HEADER METADATA BOX (4 KOLOM PRESISI & SIMETRIS) */}
          <div className="grid grid-cols-4 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-300 mb-3 text-[10.5px]">
            <div>
              <span className="text-slate-500 block text-[9.5px]">Nomor Registrasi:</span>
              <span className="font-mono text-xs font-black text-blue-900">{registration.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9.5px]">Tanggal Daftar:</span>
              <span className="font-semibold text-slate-800">{registration.createdAt.substring(0, 10)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9.5px]">Pilihan Jurusan 1:</span>
              <span className="font-bold text-slate-900 truncate block">{registration.majorChoice.firstChoice}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9.5px]">Status Verifikasi:</span>
              <span className={`inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded text-[10px] ${
                registration.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                registration.status === 'DIBATALKAN' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                <CheckCircle2 className="w-2.5 h-2.5" />
                {registration.status}
              </span>
            </div>
          </div>

          {/* MAIN TWO-COLUMN SECTION */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            {/* Left Column: Data Siswa, Jurusan, Sekolah (9 cols) */}
            <div className="col-span-9 space-y-2.5 text-[11px]">
              {/* 1. DATA PRIBADI SISWA */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-white">
                <h3 className="font-black uppercase text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1 text-[11px]">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                  DATA DIRI CALON SISWA
                </h3>
                <table className="w-full text-[10.5px] border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-36 py-0.5 text-slate-600 font-medium">Nama Lengkap</td>
                      <td className="w-2 text-slate-400">:</td>
                      <td className="py-0.5 font-bold text-slate-950 uppercase">{registration.personalData.fullName}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-0.5 text-slate-600 font-medium">No. KK / NIK</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 font-mono text-slate-900">
                        {registration.personalData.familyCardNumber ? `No. KK: ${registration.personalData.familyCardNumber} | ` : ''}NIK: {registration.personalData.nik || '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-0.5 text-slate-600 font-medium">NISN Siswa</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 font-mono text-slate-900">
                        {registration.personalData.nisn || '(Tidak dicantumkan)'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-0.5 text-slate-600 font-medium">Tempat, Tanggal Lahir</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 text-slate-900">
                        {registration.personalData.birthPlace}, {registration.personalData.birthDate}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-0.5 text-slate-600 font-medium">Jenis Kelamin / Agama</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 text-slate-900">
                        {registration.personalData.gender} / {registration.personalData.religion}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-0.5 text-slate-600 font-medium">WhatsApp / Telp</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 font-mono text-slate-900">{registration.personalData.phoneWhatsApp}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-0.5 text-slate-600 font-medium">Email Calon Siswa</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 text-slate-900">{registration.personalData.email}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-slate-600 font-medium align-top">Alamat Domisili</td>
                      <td className="text-slate-400 align-top">:</td>
                      <td className="py-0.5 text-slate-900 leading-tight">
                        {registration.personalData.address}, RT/RW {registration.personalData.rtRw}, Kel. {registration.personalData.village}, Kec. {registration.personalData.district}, {registration.personalData.city}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. PILIHAN JURUSAN & SEKOLAH ASAL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-slate-300 rounded-lg p-2 bg-blue-50/50">
                  <span className="text-[9.5px] uppercase font-bold text-blue-800 block">Pilihan 1 (Utama)</span>
                  <strong className="text-blue-950 font-black text-[11px] block mt-0.5">{registration.majorChoice.firstChoice}</strong>
                </div>
                <div className="border border-slate-300 rounded-lg p-2 bg-slate-50">
                  <span className="text-[9.5px] uppercase font-bold text-slate-600 block">Pilihan 2 (Cadangan)</span>
                  <strong className="text-slate-800 font-bold text-[11px] block mt-0.5">{registration.majorChoice.secondChoice || '-'}</strong>
                </div>
              </div>

              {/* 3. ASAL SEKOLAH & DATA ORANG TUA */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-white">
                <h3 className="font-black uppercase text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1 text-[11px]">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[9px] font-bold">2</span>
                  ASAL SEKOLAH & DATA ORANG TUA / WALI
                </h3>
                <table className="w-full text-[10.5px] border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-36 py-0.5 text-slate-600 font-medium">Asal Sekolah SMP/MTs</td>
                      <td className="w-2 text-slate-400">:</td>
                      <td className="py-0.5 font-bold text-slate-900">{registration.schoolOrigin.schoolName} (Lulus {registration.schoolOrigin.graduationYear})</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-0.5 text-slate-600 font-medium">Nama Ayah Kandung</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 text-slate-900">{registration.parentData.fatherName || '-'} ({registration.parentData.fatherJob || 'Bekerja'})</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-0.5 text-slate-600 font-medium">Nama Ibu Kandung</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 text-slate-900">{registration.parentData.motherName || '-'} ({registration.parentData.motherJob || 'Ibu Rumah Tangga'})</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-slate-600 font-medium">No. Telepon Orang Tua</td>
                      <td className="text-slate-400">:</td>
                      <td className="py-0.5 font-mono text-slate-900">{registration.parentData.fatherPhone || registration.parentData.motherPhone || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Photo Frame & Checklist Berkas (3 cols) */}
            <div className="col-span-3 flex flex-col items-center">
              {/* 3x4 Photo Frame (Kompak & Rapi) */}
              <div className="w-28 h-36 border-2 border-dashed border-slate-400 rounded-lg p-1 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {registration.documents.photoUrl ? (
                  <img
                    src={registration.documents.photoUrl}
                    alt="Pas Foto"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-center p-1.5 text-slate-400">
                    <span className="text-[10px] font-bold block mb-0.5 text-slate-600">PAS FOTO RESMI</span>
                    <span className="text-[9px] block">Ukuran 3 x 4 cm</span>
                    <span className="text-[8px] block text-slate-400 mt-1">(Tempel Foto)</span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[7.5px] text-center py-0.5 font-semibold">
                  FOTO 3X4 PESERTA
                </div>
              </div>

              {/* Checklist Berkas */}
              <div className="w-full mt-2.5 p-2 bg-slate-50 border border-slate-300 rounded-lg text-[9.5px] space-y-1">
                <span className="font-extrabold text-slate-800 block text-center border-b border-slate-200 pb-0.5 mb-1">
                  KELENGKAPAN BERKAS:
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

          {/* CATATAN PENTING & INSTRUKSI DAFTAR ULANG (KOMPAK) */}
          <div className="p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg text-[10px] leading-snug text-amber-950 mb-3">
            <strong className="font-bold block text-amber-900 mb-0.5">KETENTUAN & INSTRUKSI DAFTAR ULANG:</strong>
            <ol className="list-decimal pl-4 space-y-0.5 text-slate-800">
              <li>Bawa lembar Tanda Bukti Pendaftaran ini saat proses verifikasi fisik & pengukuran seragam di kampus {settings.schoolName}.</li>
              <li>Lampirkan fotokopi Kartu Keluarga, Akta Kelahiran, KTP Orang Tua, dan Ijazah/SKL masing-masing 2 lembar.</li>
              <li>Bagi penerima KIP/KPS/PKH, lampirkan fotokopi kartu pendukung untuk validasi beasiswa pendidikan sekolah.</li>
            </ol>
          </div>

          {/* TANDA TANGAN & PENGESAHAN SIMETRIS */}
          <div className="grid grid-cols-2 gap-6 text-center text-[10.5px] mt-4 pt-1">
            <div>
              <p className="text-slate-600 mb-0.5">Mengetahui,</p>
              <p className="font-semibold text-slate-900 mb-12">Orang Tua / Wali Calon Siswa,</p>
              <div className="border-b border-black w-40 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1 uppercase text-[10px]">
                ( {registration.parentData.fatherName || registration.parentData.motherName || 'Nama Orang Tua / Wali'} )
              </p>
            </div>

            <div>
              <p className="text-slate-600 mb-0.5">Karawang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold text-slate-900 mb-12">Ketua Panitia SPMB {settings.schoolName},</p>
              <div className="border-b border-black w-44 mx-auto"></div>
              <p className="font-bold text-slate-900 mt-1 uppercase text-[10px]">
                ( {settings.committeeHeadName || 'Ahmad Fauzi, S.Kom., M.T.'} )
              </p>
              <span className="text-[9px] text-slate-500 block">NIP / NUPTK Panitia PPDB</span>
            </div>
          </div>

          {/* FOOTER STEMPEL & KEAMANAN DOKUMEN */}
          <div className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>Diterbitkan resmi oleh SPMB Online {settings.schoolName}</span>
            <span>Security Hash: {registration.registrationNumber}-{Math.abs(registration.registrationNumber.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
