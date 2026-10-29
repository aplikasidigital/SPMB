/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto flex justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl my-auto text-slate-800">
        {/* Controls */}
        <div className="no-print flex items-center justify-between p-4 bg-slate-900 text-white rounded-t-2xl border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Cetak Laporan Rekapitulasi Pendaftar (Format A4 Landscape)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div id="printable-registration-card" className="p-8 font-sans bg-white text-slate-900 text-xs">
          {/* Kop */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              YAYASAN PENDIDIKAN LENTERA BANGSA
            </h4>
            <h1 className="text-xl font-extrabold uppercase text-slate-900">
              {settings.schoolName}
            </h1>
            <p className="text-[11px] text-slate-600">
              {settings.address} | Telp: {settings.phone} | NPSN: {settings.npsn}
            </p>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-sm font-extrabold uppercase underline">
              REKAPITULASI DATA PENDAFTAR SISTEM PENERIMAAN MURID BARU (SPMB)
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              TAHUN AJARAN {settings.academicYear} | Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                <th className="border border-slate-300 p-1.5 text-left">No. Registrasi</th>
                <th className="border border-slate-300 p-1.5 text-left">Nama Siswa</th>
                <th className="border border-slate-300 p-1.5 text-center">NISN</th>
                <th className="border border-slate-300 p-1.5 text-left">Jurusan Pilihan 1</th>
                <th className="border border-slate-300 p-1.5 text-left">Asal SMP</th>
                <th className="border border-slate-300 p-1.5 text-center">No. WhatsApp</th>
                <th className="border border-slate-300 p-1.5 text-center">Gelombang</th>
                <th className="border border-slate-300 p-1.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrants.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-1.5 text-center">{i + 1}</td>
                  <td className="border border-slate-300 p-1.5 font-mono font-bold text-slate-900">{r.registrationNumber}</td>
                  <td className="border border-slate-300 p-1.5 font-semibold text-slate-900 uppercase">{r.personalData.fullName}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{r.personalData.nisn}</td>
                  <td className="border border-slate-300 p-1.5">{r.majorChoice.firstChoice}</td>
                  <td className="border border-slate-300 p-1.5">{r.schoolOrigin.schoolName}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{r.personalData.phoneWhatsApp}</td>
                  <td className="border border-slate-300 p-1.5 text-center">{r.wave.split(' ')[0]}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold">
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center mt-8 pt-4">
            <div>
              <p className="mb-14">Mengetahui,<br />Kepala Sekolah</p>
              <p className="font-bold uppercase underline">{settings.headmasterName}</p>
              <p className="text-[10px] text-slate-500">NIP. {settings.headmasterNip}</p>
            </div>
            <div>
              <p className="mb-14">Karawang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />Ketua Panitia SPMB</p>
              <p className="font-bold uppercase underline">{settings.committeeHeadName}</p>
              <p className="text-[10px] text-slate-500">NUPTK Panitia PPDB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
