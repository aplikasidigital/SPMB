
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  StudentRegistration,
  SchoolSettings,
} from '../types/spmb';

import {
  CheckCircle2,
  Printer,
  MessageCircle,
  X,
  FileEdit,
  ArrowRight,
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
  const [processing, setProcessing] = useState(false);

  // Membuat URL WhatsApp dengan fallback yang aman.
  const whatsappUrl = useMemo(() => {
    const groupUrl = settings?.whatsappGroupUrl?.trim();

    if (groupUrl) {
      try {
        const parsedUrl = new URL(groupUrl);

        if (
          parsedUrl.protocol === 'https:' ||
          parsedUrl.protocol === 'http:'
        ) {
          return parsedUrl.toString();
        }
      } catch {
        // Gunakan fallback jika URL grup tidak valid.
      }
    }

    const phoneNumber = String(
      settings?.whatsappNumber || '6281314420312'
    ).replace(/\D/g, '');

    const registrationNumber = String(
      registration?.registrationNumber || ''
    );

    const message =
      `Halo Panitia SPMB, saya sudah mendaftar dengan No Reg ${registrationNumber}, mohon link grup WhatsApp resmi.`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }, [
    settings?.whatsappGroupUrl,
    settings?.whatsappNumber,
    registration?.registrationNumber,
  ]);

  // Menjalankan aksi dengan perlindungan klik berulang.
  const handleAction = async (
    action: (reg: StudentRegistration) => void
  ) => {
    if (processing) return;

    setProcessing(true);

    try {
      action(registration);
      onClose();
    } catch (error) {
      console.error('Terjadi kesalahan pada aksi pendaftaran:', error);
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) return;

    try {
      onClose();
    } catch (error) {
      console.error('Gagal menutup modal:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="presentation"
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative my-auto border border-slate-100 overflow-hidden text-center max-h-[95vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-success-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER SUKSES */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white p-6 pt-8 relative">

          <button
            type="button"
            onClick={handleClose}
            disabled={processing}
            aria-label="Tutup modal"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-3xl bg-white text-emerald-600 flex items-center justify-center shadow-xl shadow-black/10 mb-3">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-1">
            Status: Anda Sudah Terdaftar
          </span>

          <h3
            id="registration-success-title"
            className="text-2xl font-black text-white"
          >
            Pendaftaran Berhasil!
          </h3>

          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            Selamat, data pendaftaran Anda telah tercatat secara resmi
            di server SPMB {settings?.schoolName || 'Sekolah'}.
          </p>
        </div>

        {/* DETAIL PENDAFTARAN */}
        <div className="p-6 space-y-4">

          {/* NOMOR PENDAFTARAN */}
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-blue-300 text-center">

            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Nomor Pendaftaran Resmi Anda:
            </span>

            <span className="text-2xl sm:text-3xl font-black text-blue-900 font-mono tracking-wider block my-1 break-all">
              {registration?.registrationNumber || '-'}
            </span>

            <span className="text-xs text-slate-600 font-medium block">
              Simpan nomor ini untuk verifikasi dan pembaruan data mandiri
            </span>
          </div>

          {/* REKAP DATA SISWA */}
          <div className="text-left text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">

            <div>
              <span className="text-slate-500 font-medium">
                Nama Peserta:
              </span>{' '}

              <strong className="text-slate-900 uppercase font-bold">
                {registration?.personalData?.fullName || '-'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium">
                Pilihan Jurusan:
              </span>{' '}

              <strong className="text-blue-700 font-bold">
                {registration?.majorChoice?.firstChoice || '-'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium">
                Jalur / Gelombang:
              </span>{' '}

              <strong className="text-slate-800">
                {registration?.wave || '-'}
              </strong>
            </div>
          </div>

          {/* GRUP WHATSAPP RESMI */}
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white text-left shadow-lg shadow-emerald-600/20 relative overflow-hidden">

            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
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
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-xl shadow-md transition duration-200 cursor-pointer text-center group"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />

              <span>
                Gabung Grup WhatsApp Sekarang
              </span>

              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* TOMBOL AKSI */}
          <div className="space-y-2 pt-1">

            {/* CETAK BUKTI PENDAFTARAN */}
            <button
              type="button"
              disabled={processing}
              onClick={() => handleAction(onPrintCard)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />

              <span>
                Cetak / Download Bukti Pendaftaran (PDF A4)
              </span>
            </button>

            {/* NOTIFIKASI WHATSAPP PRIBADI */}
            <button
              type="button"
              disabled={processing}
              onClick={() => handleAction(onOpenNotificationModal)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-sm cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />

              <span>
                Kirim Ringkasan ke No WhatsApp Pribadi
              </span>
            </button>

            {/* UPDATE DATA MANDIRI */}
            <button
              type="button"
              disabled={processing}
              onClick={() => handleAction(onOpenUpdateMandiri)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileEdit className="w-3.5 h-3.5 text-slate-500" />

              <span>
                Cek Status / Perbarui Data Saya
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessModal;
