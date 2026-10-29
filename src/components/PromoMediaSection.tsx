/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Share2,
  Image as ImageIcon,
  Eye,
  X,
  Download
} from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  onOpenRegister: () => void;
}

export const PromoMediaSection: React.FC<Props> = ({ settings, onOpenRegister }) => {
  const [activeTab, setActiveTab] = useState<'brosur_spanduk' | 'video' | 'tiktok' | 'instagram' | 'galeri'>('brosur_spanduk');
  const [selectedImageModal, setSelectedImageModal] = useState<{ title: string; url: string; category?: string } | null>(null);

  // Convert raw youtube link to embed link if needed
  const getEmbedUrl = (url: string) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    if (url.includes('embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : url;
  };

  const galleryImages = [
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

  const tiktokFeeds = [
    {
      title: 'Keseruan Praktik Bengkel TKRO SMK Lentera Bangsa 2!',
      author: '@smklenterabangsa2',
      views: '45.2K views',
      likes: '3.8K likes',
      thumbnail: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'A Day in My Life Siswa Jurusan RPL & Pemrograman 💻',
      author: '@smklenterabangsa2',
      views: '78.9K views',
      likes: '6.4K likes',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80',
    },
    {
      title: 'Karya Animasi & 3D Modeling Siswa DKV Keren Abis 🔥',
      author: '@smklenterabangsa2',
      views: '32.1K views',
      likes: '2.9K likes',
      thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section id="media" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Film className="w-4 h-4" />
            Media Promosi & Aktivitas Siswa
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kenali Lebih Dekat Kampus{' '}
            <span className="text-amber-400">{settings.schoolName}</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Saksikan video profil, keseharian siswa, fasilitas praktikum, dan karya nyata siswa di berbagai platform media sosial resmi kami.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 backdrop-blur-md flex-wrap justify-center gap-1">
            <button
              onClick={() => setActiveTab('brosur_spanduk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'brosur_spanduk'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Brosur, Spanduk & Poster ({settings.promoMediaUploads?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              Video Profil Utama
            </button>
            <button
              onClick={() => setActiveTab('tiktok')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'tiktok'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              TikTok Viral
            </button>
            <button
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Instagram className="w-4 h-4" />
              Instagram Feed
            </button>
            <button
              onClick={() => setActiveTab('galeri')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
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

        {/* Tab 0: BROSUR, SPANDUK & POSTER RESMI SEKOLAH */}
        {activeTab === 'brosur_spanduk' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h3 className="text-xl font-extrabold text-white">
                Brosur, Spanduk & Poster Resmi Informasi Pendaftaran
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Klik pada gambar untuk melihat tampilan ukuran penuh, membaca rincian persyaratan pendaftaran, atau mengunduh media informasi.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(settings.promoMediaUploads && settings.promoMediaUploads.length > 0 ? settings.promoMediaUploads : [
                {
                  id: 'default-1',
                  title: 'Brosur Resmi SPMB 2026/2027',
                  category: 'Brosur',
                  imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
                  uploadDate: '2026-01-01',
                  description: 'Brosur informasi lengkap 6 jurusan keahlian dan beasiswa.',
                },
                {
                  id: 'default-2',
                  title: 'Spanduk Gerbang Depan Sekolah',
                  category: 'Spanduk',
                  imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
                  uploadDate: '2026-01-05',
                  description: 'Spanduk pendaftaran Gelombang 1 Jalur Prestasi.',
                },
                {
                  id: 'default-3',
                  title: 'Poster Digital Pilihan Jurusan & Karir',
                  category: 'Poster',
                  imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
                  uploadDate: '2026-01-10',
                  description: 'Poster promosi fasilitas lab high-end & penyaluran kerja industri.',
                },
              ]).map((promo) => (
                <div
                  key={promo.id}
                  className="bg-slate-800/80 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl hover:border-amber-400/50 transition group flex flex-col justify-between"
                >
                  <div
                    className="relative aspect-4/3 overflow-hidden bg-slate-950 cursor-pointer"
                    onClick={() => setSelectedImageModal({ title: promo.title, url: promo.imageUrl, category: promo.category })}
                  >
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        promo.category === 'Brosur' ? 'bg-amber-400 text-slate-950' :
                        promo.category === 'Spanduk' ? 'bg-emerald-400 text-slate-950' :
                        promo.category === 'Poster' ? 'bg-purple-400 text-slate-950' :
                        'bg-blue-400 text-slate-950'
                      }`}>
                        {promo.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-extrabold text-sm text-white line-clamp-1">
                      {promo.title}
                    </h4>
                    {promo.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {promo.description}
                      </p>
                    )}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-700/60">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Dipublikasi: {promo.uploadDate}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedImageModal({ title: promo.title, url: promo.imageUrl, category: promo.category })}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
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

        {/* Image Zoom Modal */}
        {selectedImageModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-700 overflow-hidden shadow-2xl relative">
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 mr-2">
                    {selectedImageModal.category || 'Media Promo'}
                  </span>
                  <span className="font-bold text-white text-sm">{selectedImageModal.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImageModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[75vh] overflow-auto p-4 flex items-center justify-center bg-black/60">
                <img
                  src={selectedImageModal.url}
                  alt={selectedImageModal.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
                />
              </div>
              <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">SMK Lentera Bangsa 2 Official Media</span>
                <a
                  href={selectedImageModal.url}
                  download="media-promo-spmb.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Video Profil YouTube Embed */}
        {activeTab === 'video' && (
          <div className="grid lg:grid-cols-12 gap-8 items-center bg-slate-800/50 rounded-3xl p-6 sm:p-8 border border-slate-700/60">
            <div className="lg:col-span-8">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700">
                <iframe
                  src={getEmbedUrl(settings.promoVideoUrl)}
                  title="Video Profil Resmi SMK Lentera Bangsa 2"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                ></iframe>
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
                Tonton selayang pandang tentang visi, sarana prasarana modern, pengajar bersertifikat industri, serta testimoni para alumni yang telah bekerja di perusahaan nasional maupun multinasional.
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
                  onClick={onOpenRegister}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Bergabung Bersama Kami Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: TikTok Embed / Widget Feed */}
        {activeTab === 'tiktok' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Konten Kreatif Siswa di TikTok</h3>
                <p className="text-xs text-slate-400">Ikuti keseruan dan tips belajar kejuruan praktis setiap hari</p>
              </div>
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl transition"
              >
                <span>Follow @smklenterabangsa2</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {tiktokFeeds.map((feed, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-xl hover:-translate-y-1 transition duration-300"
                >
                  <div className="relative aspect-[9/14] overflow-hidden bg-slate-900">
                    <img
                      src={feed.thumbnail}
                      alt={feed.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    
                    {/* Play Icon Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded text-white">
                      TikTok
                    </div>

                    {/* Bottom Details */}
                    <div className="absolute bottom-3 inset-x-3 text-left">
                      <span className="text-[11px] text-pink-400 font-semibold block">{feed.author}</span>
                      <p className="text-xs font-bold text-white line-clamp-2 mt-0.5">{feed.title}</p>
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

        {/* Tab 3: Instagram Highlights */}
        {activeTab === 'instagram' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Instagram Resmi @smklenterabangsa2_official</h3>
                <p className="text-xs text-slate-400">Dokumentasi portofolio, kunjungan industri, dan pengumuman beasiswa</p>
              </div>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Kunjungi Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {galleryImages.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl overflow-hidden aspect-square bg-slate-800 border border-slate-700 shadow-md"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-amber-300">{item.category}</span>
                    <p className="text-[11px] text-white font-medium line-clamp-2 leading-tight">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Galeri Fasilitas Sekolah */}
        {activeTab === 'galeri' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden bg-slate-800/80 border border-slate-700 shadow-lg hover:border-slate-500 transition"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded text-white">
                    {item.category}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
