
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SchoolSettings } from '../types/spmb';
import {
  Play,
  Video,
  Instagram,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Film,
  Camera,
  Image as ImageIcon,
  Eye,
  X,
  Download
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  onOpenRegister: () => void;
}

interface PromoImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  uploadDate: string;
  description?: string;
}

interface SelectedImage {
  title: string;
  url: string;
  category?: string;
}

const DEFAULT_PROMO_IMAGES: PromoImage[] = [
  {
    id: 'default-1',
    title: 'Brosur Resmi SPMB 2026/2027',
    category: 'Brosur',
    imageUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    uploadDate: '2026-01-01',
    description:
      'Brosur informasi lengkap 6 jurusan keahlian dan beasiswa.',
  },
  {
    id: 'default-2',
    title: 'Spanduk Gerbang Depan Sekolah',
    category: 'Spanduk',
    imageUrl:
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    uploadDate: '2026-01-05',
    description:
      'Spanduk pendaftaran Gelombang 1 Jalur Prestasi.',
  },
  {
    id: 'default-3',
    title: 'Poster Digital Pilihan Jurusan & Karir',
    category: 'Poster',
    imageUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    uploadDate: '2026-01-10',
    description:
      'Poster promosi fasilitas lab high-end & penyaluran kerja industri.',
  },
];

const GALLERY_IMAGES = [
  {
    title: 'Lab Pemrograman Komputer High-End',
    desc: 'Praktek coding & software development siswa PPLG',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    category: 'Teknologi',
  },
  {
    title: 'Bengkel Otomotif Standar ATPM',
    desc: 'Praktikum tune-up dan diagnosis sistem kelistrikan mobil',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
    category: 'Otomotif',
  },
  {
    title: 'Studio Desain & Animasi DKV',
    desc: 'Fasilitas pen tablet & video editing 4K',
    url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80',
    category: 'Kreatif',
  },
  {
    title: 'Lab Jaringan & Fiber Optik Mikrotik',
    desc: 'Konfigurasi router, switchboard, dan splicing fiber',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
    category: 'Infrastruktur',
  },
  {
    title: 'Mini Office & Simulasi Perkantoran Modern',
    desc: 'Praktik korespondensi dan administrasi digital',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80',
    category: 'Manajemen',
  },
  {
    title: 'Ekstrakurikuler Paskibra & Prestasi Seni',
    desc: 'Pendidikan karakter, disiplin, dan kepemimpinan',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
    category: 'Karakter',
  },
];

const TIKTOK_FEEDS = [
  {
    title: 'Keseruan Praktik Bengkel TKRO SMK Lentera Bangsa 2!',
    author: '@smklenterabangsa2',
    views: '45.2K views',
    likes: '3.8K likes',
    thumbnail:
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'A Day in My Life Siswa Jurusan RPL & Pemrograman 💻',
    author: '@smklenterabangsa2',
    views: '78.9K views',
    likes: '6.4K likes',
    thumbnail:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Karya Animasi & 3D Modeling Siswa DKV Keren Abis 🔥',
    author: '@smklenterabangsa2',
    views: '32.1K views',
    likes: '2.9K likes',
    thumbnail:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=80',
  },
];

type TabType =
  | 'brosur_spanduk'
  | 'video'
  | 'tiktok'
  | 'instagram'
  | 'galeri';

const getEmbedUrl = (url?: string): string => {
  if (!url || typeof url !== 'string') return '';

  const value = url.trim();

  if (!value) return '';

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./, '');

    let videoId = '';

    if (hostname === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtube-nocookie.com'
    ) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v') || '';
      } else {
        const parts = parsed.pathname.split('/').filter(Boolean);

        if (
          ['embed', 'shorts', 'live', 'v'].includes(parts[0])
        ) {
          videoId = parts[1] || '';
        }
      }
    }

    if (/^[\w-]{11}$/.test(videoId)) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`;
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'youtube-nocookie.com'
    ) {
      return '';
    }

    return '';
  } catch {
    return '';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category?.toLowerCase()) {
    case 'brosur':
      return 'bg-amber-400 text-slate-950';
    case 'spanduk':
      return 'bg-emerald-400 text-slate-950';
    case 'poster':
      return 'bg-purple-400 text-slate-950';
    default:
      return 'bg-blue-400 text-slate-950';
  }
};

const SafeImage: React.FC<{
  src?: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 text-slate-500 ${className}`}
        role="img"
        aria-label={`Gambar tidak tersedia: ${alt}`}
      >
        <ImageIcon className="w-10 h-10 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export const PromoMediaSection: React.FC<Props> = ({
  settings,
  onOpenRegister,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('brosur_spanduk');

  const [selectedImageModal, setSelectedImageModal] =
    useState<SelectedImage | null>(null);

  const closeModal = useCallback(() => {
    setSelectedImageModal(null);
  }, []);

  // Menutup modal menggunakan tombol Escape.
  useEffect(() => {
    if (!selectedImageModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageModal, closeModal]);

  const promoUploads = Array.isArray(settings?.promoMediaUploads)
    ? settings.promoMediaUploads
    : [];

  const promoImages: PromoImage[] =
    promoUploads.length > 0
      ? (promoUploads as PromoImage[])
      : DEFAULT_PROMO_IMAGES;

  const galleryImages = GALLERY_IMAGES;
  const tiktokFeeds = TIKTOK_FEEDS;

  const videoUrl = getEmbedUrl(settings?.promoVideoUrl);

  const tiktokUrl =
    typeof settings?.tiktokUrl === 'string'
      ? settings.tiktokUrl.trim()
      : '';

  const instagramUrl =
    typeof settings?.instagramUrl === 'string'
      ? settings.instagramUrl.trim()
      : '';

  const openImage = (promo: PromoImage) => {
    if (!promo.imageUrl) return;

    setSelectedImageModal({
      title: promo.title,
      url: promo.imageUrl,
      category: promo.category,
    });
  };

  const openExternalLink = (url: string) => {
    if (!url) return;

    try {
      const parsed = new URL(url);

      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return;
      }

      window.open(parsed.href, '_blank', 'noopener,noreferrer');
    } catch {
      // URL tidak valid, tidak melakukan navigasi.
    }
  };

  return (
    <section
      id="media"
      className="py-20 bg-slate-900 text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Film className="w-4 h-4" />
            Media Promosi & Aktivitas Siswa
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kenali Lebih Dekat Kampus{' '}
            <span className="text-amber-400">
              {settings?.schoolName || 'SMK Lentera Bangsa 2'}
            </span>
          </h2>

          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Saksikan video profil, keseharian siswa, fasilitas praktikum,
            dan karya nyata siswa di berbagai platform media sosial resmi kami.
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 backdrop-blur-md flex-wrap justify-center gap-1">

            <button
              type="button"
              onClick={() => setActiveTab('brosur_spanduk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'brosur_spanduk'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>
                Brosur, Spanduk & Poster ({promoUploads.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              Video Profil Utama
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tiktok')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'tiktok'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              TikTok Viral
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Instagram className="w-4 h-4" />
              Instagram Feed
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('galeri')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'galeri'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              Foto Kampus
            </button>
          </div>
        </div>

        {/* TAB BROSUR, SPANDUK & POSTER */}
        {activeTab === 'brosur_spanduk' && (
          <div className="space-y-6">

            <div className="text-center max-w-2xl mx-auto mb-6">
              <h3 className="text-xl font-extrabold text-white">
                Brosur, Spanduk & Poster Resmi Informasi Pendaftaran
              </h3>

              <p className="text-xs text-slate-300 mt-1">
                Klik pada gambar untuk melihat tampilan ukuran penuh,
                membaca rincian persyaratan pendaftaran, atau mengunduh
                media informasi.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {promoImages.map((promo, index) => (
                <div
                  key={promo.id || `promo-${index}`}
                  className="bg-slate-800/80 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl hover:border-amber-400/50 transition group flex flex-col justify-between"
                >
                  <button
                    type="button"
                    aria-label={`Lihat gambar ${promo.title}`}
                    onClick={() => openImage(promo)}
                    className="relative aspect-[4/3] overflow-hidden bg-slate-950 cursor-pointer block w-full text-left"
                  >
                    <SafeImage
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition" />

                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getCategoryColor(
                          promo.category
                        )}`}
                      >
                        {promo.category || 'Media'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </div>
                  </button>

                  <div className="p-5 space-y-2">
                    <h4 className="font-extrabold text-sm text-white line-clamp-1">
                      {promo.title}
                    </h4>

                    {promo.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {promo.description}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-700/60 gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Dipublikasi: {promo.uploadDate || '-'}
                      </span>

                      <button
                        type="button"
                        onClick={() => openImage(promo)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Detail</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* IMAGE ZOOM MODAL */}
        {selectedImageModal && (
          <div
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={selectedImageModal.title}
              className="bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-700 overflow-hidden shadow-2xl relative"
            >
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 mr-2">
                    {selectedImageModal.category || 'Media Promo'}
                  </span>

                  <span className="font-bold text-white text-sm">
                    {selectedImageModal.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Tutup gambar"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-auto p-4 flex items-center justify-center bg-black/60">
                <SafeImage
                  src={selectedImageModal.url}
                  alt={selectedImageModal.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
                />
              </div>

              <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center gap-3 text-xs flex-wrap">
                <span className="text-slate-400">
                  SMK Lentera Bangsa 2 Official Media
                </span>

                <a
                  href={selectedImageModal.url}
                  download="media-promo-spmb.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB VIDEO PROFIL */}
        {activeTab === 'video' && (
          <div className="grid lg:grid-cols-12 gap-8 items-center bg-slate-800/50 rounded-3xl p-6 sm:p-8 border border-slate-700/60">

            <div className="lg:col-span-8">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700">

                {videoUrl ? (
                  <iframe
                    src={videoUrl}
                    title="Video Profil Resmi SMK Lentera Bangsa 2"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <Video className="w-12 h-12 text-slate-500 mb-3" />
                    <h4 className="font-bold text-white">
                      Video Profil Belum Tersedia
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">
                      Silakan tambahkan tautan video YouTube yang valid
                      melalui pengaturan admin.
                    </p>
                  </div>
                )}

              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="inline-block bg-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-400/20">
                Official School Profile
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Mempersiapkan Generasi Emas SMK Lentera Bangsa 2
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tonton selayang pandang tentang visi, sarana prasarana modern,
                pengajar bersertifikat industri, serta testimoni para alumni
                yang telah bekerja di perusahaan nasional maupun multinasional.
              </p>

              <div className="space-y-2 pt-2">

                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Workshop Otomotif & Laboratorium Terakreditasi</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Program Magang ke Jepang & BUMN Industri</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Beasiswa Bebas Biaya SPP Bagi yang Berprestasi</span>
                </div>

              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  Bergabung Bersama Kami Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB TIKTOK */}
        {activeTab === 'tiktok' && (
          <div className="space-y-6">

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Konten Kreatif Siswa di TikTok
                </h3>

                <p className="text-xs text-slate-400">
                  Ikuti keseruan dan tips belajar kejuruan praktis setiap hari
                </p>
              </div>

              {tiktokUrl && (
                <button
                  type="button"
                  onClick={() => openExternalLink(tiktokUrl)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl transition"
                >
                  <span>Follow @smklenterabangsa2</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-6">

              {tiktokFeeds.map((feed, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-xl hover:-translate-y-1 transition duration-300"
                >
                  <div className="relative aspect-[9/14] overflow-hidden bg-slate-900">

                    <SafeImage
                      src={feed.thumbnail}
                      alt={feed.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded text-white">
                      TikTok
                    </div>

                    <div className="absolute bottom-3 inset-x-3 text-left">
                      <span className="text-[11px] text-pink-400 font-semibold block">
                        {feed.author}
                      </span>

                      <p className="text-xs font-bold text-white line-clamp-2 mt-0.5">
                        {feed.title}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-300">
                        <span>{feed.views}</span>
                        <span>•</span>
                        <span>{feed.likes}</span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* TAB INSTAGRAM */}
        {activeTab === 'instagram' && (
          <div className="space-y-6">

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Instagram Resmi @smklenterabangsa2_official
                </h3>

                <p className="text-xs text-slate-400">
                  Dokumentasi portofolio, kunjungan industri, dan pengumuman beasiswa
                </p>
              </div>

              {instagramUrl && (
                <button
                  type="button"
                  onClick={() => openExternalLink(instagramUrl)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Kunjungi Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

              {galleryImages.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl overflow-hidden aspect-square bg-slate-800 border border-slate-700 shadow-md"
                >
                  <SafeImage
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end pointer-events-none">
                    <span className="text-[10px] font-bold text-amber-300">
                      {item.category}
                    </span>

                    <p className="text-[11px] text-white font-medium line-clamp-2 leading-tight">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* TAB GALERI FASILITAS */}
        {activeTab === 'galeri' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {galleryImages.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden bg-slate-800/80 border border-slate-700 shadow-lg hover:border-slate-500 transition"
              >
                <div className="h-48 overflow-hidden relative">

                  <SafeImage
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />

                  <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded text-white">
                    {item.category}
                  </span>

                </div>

                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-white text-sm">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </section>
  );
};
