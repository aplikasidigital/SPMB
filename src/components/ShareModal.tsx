
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SchoolSettings } from '../types/spmb';
import { QRCodeSVG } from './QRCodeSVG';
import {
  X,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Send,
  QrCode
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  onClose: () => void;
}

export const ShareModal: React.FC<Props> = ({ settings, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Mengambil URL halaman aktif secara aman.
  const currentUrl =
    typeof window !== 'undefined' && window.location?.href
      ? window.location.href
      : 'https://smklenterabangsa2.sch.id';

  // Teks promosi tetap dipertahankan.
  const shareText = `Pendaftaran Murid Baru (SPMB) ${settings.schoolName} Tahun Ajaran ${settings.academicYear} Telah Dibuka! Daftar online mandiri dan dapatkan subsidi seragam & beasiswa: ${currentUrl}`;

  // Membersihkan timer ketika komponen dilepas.
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // Mengembalikan status tombol salin.
  const showCopyStatus = useCallback((success: boolean) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    setCopied(success);
    setCopyError(!success);

    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
      setCopyError(false);
      resetTimerRef.current = null;
    }, 2500);
  }, []);

  // Fungsi alternatif untuk menyalin teks.
  const fallbackCopy = useCallback((text: string): boolean => {
    if (typeof document === 'undefined') return false;

    const textArea = document.createElement('textarea');

    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);

    try {
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      return document.execCommand('copy');
    } catch (error) {
      console.error('Gagal menyalin tautan:', error);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }, []);

  // Menyalin tautan pendaftaran.
  const handleCopy = useCallback(async () => {
    let success = false;

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(currentUrl);
        success = true;
      } else {
        success = fallbackCopy(currentUrl);
      }
    } catch (error) {
      console.warn('Clipboard API tidak tersedia:', error);
      success = fallbackCopy(currentUrl);
    }

    showCopyStatus(success);
  }, [currentUrl, fallbackCopy, showCopyStatus]);

  // Membuka tautan berbagi dengan aman.
  const openShareWindow = useCallback((url: string) => {
    if (typeof window === 'undefined') return;

    const newWindow = window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );

    if (newWindow) {
      newWindow.opener = null;
    }
  }, []);

  // Berbagi melalui WhatsApp.
  const shareWhatsApp = useCallback(() => {
    openShareWindow(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    );
  }, [openShareWindow, shareText]);

  // Berbagi melalui Telegram.
  const shareTelegram = useCallback(() => {
    openShareWindow(
      `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
    );
  }, [openShareWindow, currentUrl, shareText]);

  // Berbagi melalui Facebook.
  const shareFacebook = useCallback(() => {
    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    );
  }, [openShareWindow, currentUrl]);

  // Berbagi melalui Twitter/X.
  const shareTwitter = useCallback(() => {
    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    );
  }, [openShareWindow, shareText]);

  // Menutup modal menggunakan tombol Escape.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup jendela berbagi"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shrink-0">
            <Share2 className="w-6 h-6" />
          </div>

          <div className="min-w-0">
            <h3
              id="share-modal-title"
              className="font-extrabold text-slate-900 text-lg"
            >
              Bagikan Link Pendaftaran
            </h3>

            <p className="text-xs text-slate-500">
              Ajak teman & kerabat mendaftar di {settings.schoolName}
            </p>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="mt-4">
          <label
            htmlFor="share-registration-url"
            className="text-xs font-bold text-slate-700 block mb-1.5"
          >
            Tautan Resmi SPMB:
          </label>

          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              id="share-registration-url"
              type="text"
              readOnly
              value={currentUrl}
              onFocus={(event) => event.target.select()}
              aria-label="Tautan resmi pendaftaran SPMB"
              className="flex-1 min-w-0 bg-transparent px-2.5 py-1 text-xs text-slate-700 font-mono outline-none truncate"
            />

            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Tautan berhasil disalin' : 'Salin tautan'}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : copyError
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}

              <span>
                {copied
                  ? 'Tersalin!'
                  : copyError
                    ? 'Gagal'
                    : 'Salin'}
              </span>
            </button>
          </div>

          {copyError && (
            <p className="text-[11px] text-red-600 mt-1.5">
              Tautan gagal disalin. Silakan salin secara manual.
            </p>
          )}
        </div>

        {/* Quick Social Share Buttons */}
        <div className="mt-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
            Kirim Cepat Melalui:
          </span>

          <div className="grid grid-cols-4 gap-2.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={shareWhatsApp}
              aria-label="Bagikan melalui WhatsApp"
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 transition cursor-pointer border border-emerald-200"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-[11px] font-bold">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={shareTelegram}
              aria-label="Bagikan melalui Telegram"
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-800 transition cursor-pointer border border-sky-200"
            >
              <Send className="w-5 h-5 text-sky-600" />
              <span className="text-[11px] font-bold">Telegram</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={shareFacebook}
              aria-label="Bagikan melalui Facebook"
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-800 transition cursor-pointer border border-blue-200"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-[11px] font-bold">Facebook</span>
            </button>

            {/* Twitter / X */}
            <button
              type="button"
              onClick={shareTwitter}
              aria-label="Bagikan melalui Twitter atau X"
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 transition cursor-pointer border border-slate-200"
            >
              <Twitter className="w-5 h-5 text-slate-700" />
              <span className="text-[11px] font-bold">Twitter/X</span>
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="shrink-0 bg-white p-1 rounded-lg">
            <QRCodeSVG value={currentUrl} size={76} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-0.5">
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Scan QR Code</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Arahkan kamera smartphone teman atau keluarga untuk langsung membuka formulir pendaftaran.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
