/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { QRCodeSVG } from './QRCodeSVG';
import { 
  CheckCircle2, 
  Printer, 
  MessageCircle, 
  X, 
  FileEdit, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Props {
  registration: StudentRegistration;
  settings: SchoolSettings;
  onClose: () => void;
  onPrintCard: (reg: StudentRegistration) => void;
  onOpenNotificationModal: (reg: StudentRegistration) => void;
  onOpenUpdateMandiri: (reg: StudentRegistration) => void;
}

export const RegistrationSuccessModal: React.FC<Props> = ({
  registration,
  settings,
  onClose,
  onPrintCard,
  onOpenNotificationModal,
  onOpenUpdateMandiri,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative my-auto border border-slate-100 overflow-hidden text-center">
        {/* Top Celebration Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white p-6 pt-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-3xl bg-white text-emerald-600 flex items-center justify-center shadow-xl shadow-black/10 mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-1">
            Status: Anda Sudah Terdaftar
          </span>

          <h3 className="text-2xl font-black text-white">
            Pendaftaran Berhasil!
          </h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            Selamat, data pendaftaran Anda telah tercatat secara resmi di server SPMB {settings.schoolName}.
          </p>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-4">
          {/* Registration Number Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-blue-300 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Nomor Pendaftaran Resmi Anda:
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-900 font-mono tracking-wider block my-1">
              {registration.registrationNumber}
            </span>
            <span className="text-xs text-slate-600 font-medium block">
              Simpan nomor ini untuk verifikasi dan pembaruan data mandiri
            </span>
          </div>

          {/* Student Recap */}
          <div className="text-left text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div>
              <span className="text-slate-500 font-medium">Nama Peserta:</span>{' '}
              <strong className="text-slate-900 uppercase font-bold">{registration.personalData.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Pilihan Jurusan:</span>{' '}
              <strong className="text-blue-700 font-bold">{registration.majorChoice.firstChoice}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Jalur / Gelombang:</span>{' '}
              <strong className="text-slate-800">{registration.wave}</strong>
            </div>
          </div>

          {/* PRIORITY ACTION: GABUNG GRUP WHATSAPP CALON SISWA (DIPASANG OLEH ADMIN) */}
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white text-left shadow-lg shadow-emerald-600/20 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                    Langkah Wajib Berikutnya
                  </span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base mt-1 leading-snug">
                  Masuk ke Grup WhatsApp Resmi
                </h4>
                <p className="text-[11px] text-emerald-50 mt-0.5 leading-relaxed">
                  Semua informasi tes peminatan, konfirmasi jadwal verifikasi berkas, dan pengumuman kelulusan dibagikan langsung di grup WhatsApp resmi calon siswa baru.
                </p>
              </div>
            </div>

            <a
              href={settings.whatsappGroupUrl || `https://wa.me/${settings.whatsappNumber || '6281314420312'}?text=Halo%20Panitia%20SPMB,%20saya%20sudah%20mendaftar%20dengan%20No%20Reg%20${registration.registrationNumber},%20mohon%20link%20grup%20WhatsApp%20resmi.`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-xl shadow-md transition duration-200 cursor-pointer text-center group"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Gabung Grup WhatsApp Sekarang</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Secondary Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* 1. Cetak Bukti PDF A4 Presisi */}
            <button
              onClick={() => {
                onPrintCard(registration);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Download Bukti Pendaftaran (PDF A4)</span>
            </button>

            {/* 2. Kirim Notifikasi WA Pribadi */}
            <button
              onClick={() => {
                onOpenNotificationModal(registration);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kirim Ringkasan ke No WhatsApp Pribadi</span>
            </button>

            {/* 3. Update Mandiri */}
            <button
              onClick={() => {
                onOpenUpdateMandiri(registration);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-xl transition cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5 text-slate-500" />
              <span>Cek Status / Perbarui Data Saya</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
