/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://smklenterabangsa2.sch.id';
  
  const shareText = `Pendaftaran Murid Baru (SPMB) ${settings.schoolName} Tahun Ajaran ${settings.academicYear} Telah Dibuka! Daftar online mandiri dan dapatkan subsidi seragam & beasiswa: ${currentUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Bagikan Link Pendaftaran</h3>
            <p className="text-xs text-slate-500">Ajak teman & kerabat mendaftar di {settings.schoolName}</p>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Tautan Resmi SPMB:</label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-700 font-mono outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="mt-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
            Kirim Cepat Melalui:
          </span>
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer border border-emerald-200"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-[11px] font-bold">WhatsApp</span>
            </button>
            <button
              onClick={shareTelegram}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 transition cursor-pointer border border-sky-200"
            >
              <Send className="w-5 h-5 text-sky-600" />
              <span className="text-[11px] font-bold">Telegram</span>
            </button>
            <button
              onClick={shareFacebook}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 transition cursor-pointer border border-blue-200"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-[11px] font-bold">Facebook</span>
            </button>
            <button
              onClick={shareTwitter}
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition cursor-pointer border border-slate-200"
            >
              <Twitter className="w-5 h-5 text-slate-700" />
              <span className="text-[11px] font-bold">Twitter/X</span>
            </button>
          </div>
        </div>

        {/* QR Code Section for scanning directly */}
        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
          <QRCodeSVG value={currentUrl} size={76} />
          <div>
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
