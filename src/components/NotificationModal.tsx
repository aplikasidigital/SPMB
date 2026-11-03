
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useCallback } from 'react';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { StorageService } from '../services/storageService';
import {
  X,
  MessageCircle,
  Mail,
  Check,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Props {
  registration: StudentRegistration;
  settings: SchoolSettings;
  onClose: () => void;
}

type NotificationTab = 'whatsapp' | 'email';

export const NotificationModal: React.FC<Props> = ({
  registration,
  settings,
  onClose,
}) => {
  const [tab, setTab] = useState<NotificationTab>('whatsapp');
  const [simulatedSent, setSimulatedSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ==========================================
  // DATA VALIDATION
  // ==========================================

  const personalData = registration?.personalData;
  const majorChoice = registration?.majorChoice;

  const fullName = personalData?.fullName || 'Calon Siswa';
  const phoneNumber = personalData?.phoneWhatsApp || '';
  const email = personalData?.email || '';

  const schoolName = settings?.schoolName || 'Sekolah';
  const academicYear = settings?.academicYear || '-';
  const address = settings?.address || '-';
  const website = settings?.website || '-';
  const whatsappNumber = settings?.whatsappNumber || '';

  const registrationNumber = registration?.registrationNumber || '-';
  const firstChoice = majorChoice?.firstChoice || '-';
  const secondChoice = majorChoice?.secondChoice || '-';
  const wave = registration?.wave || '-';
  const status = registration?.status || '-';

  // ==========================================
  // WHATSAPP NUMBER
  // ==========================================

  const cleanPhone = useMemo(() => {
    let phone = phoneNumber.replace(/\D/g, '');

    if (phone.startsWith('0')) {
      phone = `62${phone.substring(1)}`;
    } else if (phone.startsWith('8')) {
      phone = `62${phone}`;
    }

    return phone;
  }, [phoneNumber]);

  const isValidPhone = /^62\d{8,13}$/.test(cleanPhone);

  // ==========================================
  // WEBSITE AND EMAIL INFORMATION
  // ==========================================

  const websiteDomain = useMemo(() => {
    if (!website || website === '-') return '-';

    try {
      const normalized = /^https?:\/\//i.test(website)
        ? website
        : `https://${website}`;

      return new URL(normalized).hostname.replace(/^www\./, '');
    } catch {
      return website
        .replace(/^https?:\/\//i, '')
        .split('/')[0] || '-';
    }
  }, [website]);

  const senderEmail = useMemo(() => {
    if (!websiteDomain || websiteDomain === '-') {
      return 'panitia-spmb';
    }

    return `panitia-spmb@${websiteDomain}`;
  }, [websiteDomain]);

  // ==========================================
  // WHATSAPP MESSAGE TEMPLATE
  // ==========================================

  const waMessage = useMemo(() => {
    return (
      `*KONFIRMASI PENDAFTARAN SPMB ONLINE*\n` +
      `*${schoolName.toUpperCase()}*\n` +
      `Tahun Ajaran: ${academicYear}\n\n` +
      `Halo *${fullName}*,\n` +
      `Pendaftaran online Anda telah *BERHASIL TERDAFTAR* di sistem SPMB kami dengan rincian sbb:\n\n` +
      `• *Nomor Pendaftaran:* ${registrationNumber}\n` +
      `• *Jurusan Pilihan 1:* ${firstChoice}\n` +
      `• *Jurusan Pilihan 2:* ${secondChoice}\n` +
      `• *Gelombang:* ${wave}\n` +
      `• *Status Seleksi:* ${status}\n\n` +
      `*Langkah Selanjutnya:*\n` +
      `1. Unduh dan cetak formulir Tanda Bukti Pendaftaran A4.\n` +
      `2. Bawa berkas fisik dan bukti pendaftaran ke kampus ${schoolName} (${address}) untuk verifikasi berkas dan pengukuran seragam.\n\n` +
      `Hotline Panitia: +${whatsappNumber.replace(/\D/g, '')}\n` +
      `Website Resmi: ${website}\n\n` +
      `_Terima kasih telah memilih SMK Lentera Bangsa 2 sebagai gerbang masa depan suksesmu!_`
    );
  }, [
    schoolName,
    academicYear,
    fullName,
    registrationNumber,
    firstChoice,
    secondChoice,
    wave,
    status,
    address,
    whatsappNumber,
    website,
  ]);

  // ==========================================
  // UPDATE NOTIFICATION HISTORY
  // ==========================================

  const updateNotificationHistory = useCallback(
    async (source: string): Promise<void> => {
      const result = StorageService.updateRegistrant(
        registration.id,
        {
          lastNotifiedAt: new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 19),
        },
        source
      );

      // Mendukung service sinkron maupun asynchronous.
      await Promise.resolve(result);
    },
    [registration.id]
  );

  // ==========================================
  // WHATSAPP HANDLER
  // ==========================================

  const handleOpenWhatsApp = useCallback(async () => {
    if (isProcessing) return;

    setErrorMessage('');
    setSimulatedSent(false);

    if (!cleanPhone || !isValidPhone) {
      setErrorMessage(
        'Nomor WhatsApp siswa tidak valid. Periksa kembali nomor yang tersimpan pada data pendaftaran.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const encodedMessage = encodeURIComponent(waMessage);
      const whatsappUrl =
        `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      // Buka tab secara langsung dari interaksi pengguna
      // agar tidak mudah diblokir oleh browser.
      const newWindow = window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      );

      if (!newWindow) {
        // Fallback jika browser memblokir tab baru.
        window.location.href = whatsappUrl;
      }

      await updateNotificationHistory(
        'Sistem Notifikasi WhatsApp'
      );

      setSimulatedSent(true);
    } catch (error) {
      console.error('WhatsApp notification error:', error);

      setErrorMessage(
        'Terjadi kesalahan saat memproses notifikasi WhatsApp. Silakan coba kembali.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    cleanPhone,
    isValidPhone,
    waMessage,
    updateNotificationHistory,
  ]);

  // ==========================================
  // EMAIL SIMULATION HANDLER
  // ==========================================

  const handleSimulateEmail = useCallback(async () => {
    if (isProcessing) return;

    setErrorMessage('');
    setSimulatedSent(false);

    if (!email.trim()) {
      setErrorMessage(
        'Alamat email siswa belum tersedia. Silakan lengkapi data email terlebih dahulu.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage(
        'Format alamat email tidak valid. Silakan periksa kembali.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      await updateNotificationHistory(
        'Sistem Notifikasi Email'
      );

      setSimulatedSent(true);
    } catch (error) {
      console.error('Email notification error:', error);

      setErrorMessage(
        'Gagal memperbarui riwayat notifikasi email. Silakan coba kembali.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing,
    email,
    updateNotificationHistory,
  ]);

  // ==========================================
  // CLOSE HANDLER
  // ==========================================

  const handleClose = useCallback(() => {
    if (isProcessing) return;
    onClose();
  }, [isProcessing, onClose]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col max-h-[95vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-modal-title"
      >
        {/* HEADER */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-t-3xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>

            <div className="min-w-0">
              <h3
                id="notification-modal-title"
                className="font-extrabold text-base sm:text-lg leading-tight"
              >
                Notifikasi Otomatis Peserta
              </h3>

              <p className="text-xs text-emerald-100 mt-1">
                Konfirmasi pendaftaran melalui WhatsApp dan Email
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            aria-label="Tutup notifikasi"
            className="p-2 shrink-0 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB CONTROLS */}
        <div className="shrink-0 flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('whatsapp');
              setErrorMessage('');
              setSimulatedSent(false);
            }}
            className={`flex-1 min-w-0 py-3 px-2 flex items-center justify-center gap-2 border-b-2 transition ${
              tab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4 shrink-0 text-emerald-600" />

            <span className="truncate">
              WhatsApp
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('email');
              setErrorMessage('');
              setSimulatedSent(false);
            }}
            className={`flex-1 min-w-0 py-3 px-2 flex items-center justify-center gap-2 border-b-2 transition ${
              tab === 'email'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0 text-blue-600" />

            <span className="truncate">
              Email
            </span>
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain">

          {/* WHATSAPP TAB */}
          {tab === 'whatsapp' && (
            <div className="space-y-4">

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Penerima: <strong>{fullName}</strong>
                </span>

                <span className="font-mono font-bold text-emerald-700">
                  {cleanPhone ? `+${cleanPhone}` : 'Nomor belum tersedia'}
                </span>
              </div>

              {!isValidPhone && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

                  <span>
                    Nomor WhatsApp belum valid. Silakan periksa data nomor telepon peserta sebelum mengirim notifikasi.
                  </span>
                </div>
              )}

              {/* CHAT PREVIEW */}
              <div className="p-3 sm:p-4 bg-[#e5ddd5] rounded-2xl border border-slate-300 font-sans shadow-inner max-h-64 overflow-y-auto">
                <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-w-md break-words">
                  {waMessage}

                  <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1">
                    <span>
                      {new Date().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* WHATSAPP BUTTON */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                disabled={isProcessing || !isValidPhone}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Buka & Kirim di WhatsApp</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                WhatsApp akan terbuka dengan pesan yang sudah disiapkan. Pengiriman harus dikonfirmasi langsung melalui WhatsApp.
              </p>
            </div>
          )}

          {/* EMAIL TAB */}
          {tab === 'email' && (
            <div className="space-y-4">

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Kepada: <strong>{fullName}</strong>
                </span>

                <span className="font-mono text-blue-700 break-all">
                  {email || 'Belum diisi'}
                </span>
              </div>

              {/* EMAIL PREVIEW */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm text-xs">

                <div className="bg-slate-100 p-3 border-b border-slate-200 text-slate-700 space-y-2 break-words">
                  <div>
                    <strong>Subjek:</strong>{' '}
                    Konfirmasi Pendaftaran Siswa Baru - {schoolName} ({registrationNumber})
                  </div>

                  <div>
                    <strong>Dari:</strong> {senderEmail}
                  </div>

                  <div>
                    <strong>Kepada:</strong> {email || 'Belum diisi'}
                  </div>
                </div>

                <div className="p-4 bg-white space-y-3 leading-relaxed text-slate-800">

                  <div className="border-b border-slate-200 pb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold text-blue-800 uppercase">
                      {schoolName}
                    </span>

                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      KONFIRMASI PENDAFTARAN
                    </span>
                  </div>

                  <p>
                    Yth. Calon Siswa{' '}
                    <strong>{fullName}</strong>,
                  </p>

                  <p>
                    Selamat! Berkas pendaftaran online Anda telah kami terima dan tercatat di sistem kami dengan Nomor Pendaftaran:{' '}
                    <span className="font-bold text-blue-600">
                      {registrationNumber}
                    </span>.
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-2">
                    <div>
                      Nomor Pendaftaran:{' '}
                      <strong>{registrationNumber}</strong>
                    </div>

                    <div>
                      Pilihan Jurusan 1:{' '}
                      <strong>{firstChoice}</strong>
                    </div>

                    <div>
                      Pilihan Jurusan 2:{' '}
                      <strong>{secondChoice}</strong>
                    </div>

                    <div>
                      Jalur/Gelombang:{' '}
                      <strong>{wave}</strong>
                    </div>

                    <div>
                      Status:{' '}
                      <strong>{status}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Silakan cetak lembar bukti pendaftaran dan persiapkan berkas asli saat verifikasi di sekolah.
                  </p>

                  <p>
                    Hormat kami,
                    <br />
                    <strong>Panitia SPMB {schoolName}</strong>
                  </p>
                </div>
              </div>

              {/* EMAIL BUTTON */}
              <button
                type="button"
                onClick={handleSimulateEmail}
                disabled={isProcessing || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Catat Notifikasi Email</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Fitur ini masih berupa simulasi pencatatan notifikasi. Email belum dikirim ke penerima.
              </p>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

              <span>{errorMessage}</span>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {simulatedSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />

              <span>
                {tab === 'whatsapp'
                  ? 'WhatsApp telah dibuka dan riwayat notifikasi berhasil dicatat. Pastikan pesan benar-benar dikirim melalui WhatsApp.'
                  : 'Pencatatan notifikasi email berhasil diproses. Email belum dikirim secara langsung.'}
              </span>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="shrink-0 px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
