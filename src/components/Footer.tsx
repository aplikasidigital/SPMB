/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolSettings } from '../types/spmb';
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Video, 
  ShieldCheck, 
  Heart,
  Share2
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  onOpenAdminLogin: () => void;
  onOpenCheckStatus: () => void;
  onOpenRegister: () => void;
  onOpenShareModal: () => void;
  onNavigateSection: (id: string) => void;
}

export const Footer: React.FC<Props> = ({
  settings,
  onOpenAdminLogin,
  onOpenCheckStatus,
  onOpenRegister,
  onOpenShareModal,
  onNavigateSection,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & School Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                  {settings.schoolName}
                </h3>
                <span className="text-xs text-amber-400 font-semibold">
                  {settings.accreditation} | NPSN: {settings.npsn}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              "{settings.schoolTagline}" — Membuka gerbang kesempatan emas bagi putra-putri bangsa untuk meraih kompetensi kejuruan berstandar global.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-pink-400 hover:border-pink-500 transition"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition"
                title="TikTok"
              >
                <Video className="w-4 h-4" />
              </a>
              <button
                onClick={onOpenShareModal}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500 transition cursor-pointer"
                title="Bagikan Link SPMB"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Navigasi SPMB
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateSection('beranda')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Beranda & Profil
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('jurusan')}
                  className="hover:text-white transition cursor-pointer"
                >
                  6 Program Keahlian Unggulan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('alur')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Alur & Syarat Pendaftaran
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('jadwal')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Jadwal Gelombang Penerimaan
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCheckStatus}
                  className="text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  Cek Status & Update Data Mandiri
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenRegister}
                  className="text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  Formulir Pendaftaran Siswa Baru →
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Sekretariat & Hotline Panitia
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  WhatsApp: +{settings.whatsappNumber}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{settings.website}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} {settings.schoolName}. Hak Cipta Dilindungi Undang-Undang. Yayasan Pendidikan Lentera Bangsa.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdminLogin}
              className="text-slate-600 hover:text-slate-400 text-[11px] flex items-center gap-1 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Login Panitia</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
