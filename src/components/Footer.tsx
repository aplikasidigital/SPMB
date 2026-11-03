
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
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
  Share2,
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
  // Proteksi data agar komponen tidak error saat menerima nilai kosong.
  const safeSettings = settings ?? ({} as SchoolSettings);

  // Normalisasi URL media sosial.
  const normalizeUrl = (value?: string | null): string => {
    if (!value || typeof value !== 'string') return '';

    const url = value.trim();

    if (!url || url === '#') return '';

    try {
      const normalized = /^https?:\/\//i.test(url)
        ? url
        : `https://${url}`;

      const parsed = new URL(normalized);

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }

      return parsed.href;
    } catch {
      return '';
    }
  };

  // Normalisasi nomor WhatsApp.
  const whatsappUrl = useMemo(() => {
    const number = String(
      safeSettings.whatsappNumber ?? ''
    ).replace(/\D/g, '');

    return number.length >= 8
      ? `https://wa.me/${number}`
      : '';
  }, [safeSettings.whatsappNumber]);

  const instagramUrl = normalizeUrl(
    safeSettings.instagramUrl
  );

  const tiktokUrl = normalizeUrl(
    safeSettings.tiktokUrl
  );

  const websiteUrl = normalizeUrl(
    safeSettings.website
  );

  const currentYear = new Date().getFullYear();

  // Helper agar callback tidak menyebabkan error ketika belum tersedia.
  const safeCallback = (callback?: () => void) => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  const navigate = (section: string) => {
    if (typeof onNavigateSection === 'function') {
      onNavigateSection(section);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* BRAND & SCHOOL INFORMATION */}
          <div className="lg:col-span-5 space-y-4">

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div className="min-w-0">
                <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight break-words">
                  {safeSettings.schoolName || 'Nama Sekolah'}
                </h3>

                <span className="text-xs text-amber-400 font-semibold">
                  {safeSettings.accreditation || '-'} | NPSN: {safeSettings.npsn || '-'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              "{safeSettings.schoolTagline || ''}" — Membuka gerbang kesempatan emas bagi putra-putri bangsa untuk meraih kompetensi kejuruan berstandar global.
            </p>

            {/* SOCIAL MEDIA */}
            <div className="flex items-center gap-2 pt-2">

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-pink-400 hover:border-pink-500 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  title="TikTok"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
                >
                  <Video className="w-4 h-4" />
                </a>
              )}

              <button
                type="button"
                onClick={() => safeCallback(onOpenShareModal)}
                aria-label="Bagikan Link SPMB"
                title="Bagikan Link SPMB"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-500 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-3 space-y-3">

            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Navigasi SPMB
            </h4>

            <ul className="space-y-2 text-xs">

              <li>
                <button
                  type="button"
                  onClick={() => navigate('beranda')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Beranda & Profil
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => navigate('jurusan')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  6 Program Keahlian Unggulan
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => navigate('alur')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Alur & Syarat Pendaftaran
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => navigate('jadwal')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Jadwal Gelombang Penerimaan
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => safeCallback(onOpenCheckStatus)}
                  className="text-amber-400 hover:underline font-semibold cursor-pointer text-left"
                >
                  Cek Status & Update Data Mandiri
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => safeCallback(onOpenRegister)}
                  className="text-blue-400 hover:underline font-bold cursor-pointer text-left"
                >
                  Formulir Pendaftaran Siswa Baru →
                </button>
              </li>

            </ul>
          </div>

          {/* CONTACT DETAILS */}
          <div className="lg:col-span-4 space-y-3">

            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Sekretariat & Hotline Panitia
            </h4>

            <div className="space-y-2.5 text-xs">

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />

                <span className="break-words min-w-0">
                  {safeSettings.address || '-'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors break-all"
                  >
                    WhatsApp: +{String(safeSettings.whatsappNumber).replace(/\D/g, '')}
                  </a>
                ) : (
                  <span>WhatsApp: -</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />

                <span className="break-all">
                  {safeSettings.email || '-'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />

                {websiteUrl ? (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors break-all"
                  >
                    {safeSettings.website}
                  </a>
                ) : (
                  <span className="break-all">
                    {safeSettings.website || '-'}
                  </span>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">

          <p className="text-slate-500 text-center sm:text-left leading-relaxed">
            © {currentYear} {safeSettings.schoolName || 'Nama Sekolah'}. Hak Cipta Dilindungi Undang-Undang. Yayasan Pendidikan Lentera Bangsa.
          </p>

          <div className="flex items-center gap-4 shrink-0">

            <button
              type="button"
              onClick={() => safeCallback(onOpenAdminLogin)}
              className="text-slate-600 hover:text-slate-400 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Login Panitia"
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

export default Footer;
