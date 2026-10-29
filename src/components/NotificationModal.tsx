/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentRegistration, SchoolSettings } from '../types/spmb';
import { StorageService } from '../services/storageService';
import { 
  X, 
  MessageCircle, 
  Mail, 
  Check, 
  Send, 
  Sparkles, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface Props {
  registration: StudentRegistration;
  settings: SchoolSettings;
  onClose: () => void;
}

export const NotificationModal: React.FC<Props> = ({ registration, settings, onClose }) => {
  const [tab, setTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [simulatedSent, setSimulatedSent] = useState(false);

  // Clean WhatsApp number
  const rawPhone = registration.personalData.phoneWhatsApp.replace(/\D/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? `62${rawPhone.substring(1)}` : rawPhone;

  // WhatsApp Message Template
  const waMessage = `*KONFIRMASI PENDAFTARAN SPMB ONLINE*\n` +
    `*${settings.schoolName.toUpperCase()}*\n` +
    `Tahun Ajaran: ${settings.academicYear}\n\n` +
    `Halo *${registration.personalData.fullName}*,\n` +
    `Pendaftaran online Anda telah *BERHASIL TERDAFTAR* di sistem SPMB kami dengan rincian sbb:\n\n` +
    `• *Nomor Pendaftaran:* ${registration.registrationNumber}\n` +
    `• *Jurusan Pilihan 1:* ${registration.majorChoice.firstChoice}\n` +
    `• *Jurusan Pilihan 2:* ${registration.majorChoice.secondChoice}\n` +
    `• *Gelombang:* ${registration.wave}\n` +
    `• *Status Seleksi:* ${registration.status}\n\n` +
    `*Langkah Selanjutnya:*\n` +
    `1. Unduh dan cetak formulir Tanda Bukti Pendaftaran A4.\n` +
    `2. Bawa berkas fisik dan bukti pendaftaran ke kampus ${settings.schoolName} (${settings.address}) untuk verifikasi berkas dan pengukuran seragam.\n\n` +
    `Hotline Panitia: +${settings.whatsappNumber}\n` +
    `Website Resmi: ${settings.website}\n\n` +
    `_Terima kasih telah memilih SMK Lentera Bangsa 2 sebagai gerbang masa depan suksesmu!_`;

  const handleOpenWhatsApp = () => {
    StorageService.updateRegistrant(registration.id, {
      lastNotifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    }, 'Sistem Notifikasi WhatsApp');

    const encoded = encodeURIComponent(waMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    setSimulatedSent(true);
  };

  const handleSimulateEmail = () => {
    StorageService.updateRegistrant(registration.id, {
      lastNotifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    }, 'Sistem Notifikasi Email');

    setSimulatedSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative my-auto border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Notifikasi Otomatis Peserta
              </h3>
              <p className="text-xs text-emerald-100">
                Kirim bukti pendaftaran ke WhatsApp & Email siswa
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

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setTab('whatsapp')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 cursor-pointer transition ${
              tab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Kirim via WhatsApp ({registration.personalData.phoneWhatsApp})</span>
          </button>
          <button
            onClick={() => setTab('email')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 cursor-pointer transition ${
              tab === 'email'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Kirim via Email ({registration.personalData.email || 'Email'})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {tab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <span>Penerima: <strong>{registration.personalData.fullName}</strong></span>
                <span className="font-mono font-bold text-emerald-700">+{cleanPhone}</span>
              </div>

              {/* Chat Bubble Preview */}
              <div className="p-4 bg-[#e5ddd5] rounded-2xl border border-slate-300 font-sans shadow-inner max-h-64 overflow-y-auto">
                <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-w-md">
                  {waMessage}
                  <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1">
                    <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buka & Kirim di WhatsApp Sekarang</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {tab === 'email' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <span>Kepada: <strong>{registration.personalData.fullName}</strong></span>
                <span className="font-mono text-blue-700">{registration.personalData.email || 'Belum diisi'}</span>
              </div>

              {/* Email Client Preview */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs text-xs">
                <div className="bg-slate-100 p-2.5 border-b border-slate-200 text-slate-700 space-y-1">
                  <div><strong>Subjek:</strong> Konfirmasi Pendaftaran Siswa Baru - {settings.schoolName} ({registration.registrationNumber})</div>
                  <div><strong>Dari:</strong> panitia-spmb@{settings.website.replace('https://', '').replace('/', '')}</div>
                </div>
                <div className="p-4 bg-white space-y-3 leading-relaxed text-slate-800">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <span className="font-extrabold text-blue-800 uppercase">{settings.schoolName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Terverifikasi</span>
                  </div>
                  <p>Yth. Calon Siswa <strong>{registration.personalData.fullName}</strong>,</p>
                  <p>
                    Selamat! Berkas pendaftaran online Anda telah kami terima dan tercatat di sistem kami dengan Nomor Pendaftaran: <span className="font-bold text-blue-600">{registration.registrationNumber}</span>.
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg border text-[11px] space-y-1">
                    <div>Pilihan Jurusan: <strong>{registration.majorChoice.firstChoice}</strong></div>
                    <div>Jalur/Gelombang: <strong>{registration.wave}</strong></div>
                    <div>Status: <strong>{registration.status}</strong></div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Silakan cetak lembar bukti pendaftaran dan persiapkan berkas asli saat verifikasi di sekolah.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSimulateEmail}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Kirim Notifikasi Email Konfirmasi</span>
              </button>
            </div>
          )}

          {simulatedSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notifikasi berhasil diproses dan status terakhir tercatat di riwayat pendaftar!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
