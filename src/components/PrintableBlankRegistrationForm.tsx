/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolSettings, MajorProgram } from '../types/spmb';
import { Printer, Download, X } from 'lucide-react';

interface Props {
  settings: SchoolSettings;
  majors: MajorProgram[];
  onClose: () => void;
}

export const PrintableBlankRegistrationForm: React.FC<Props> = ({
  settings,
  majors,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-6 overflow-y-auto">
      {/* Floating Action Header Bar */}
      <div className="w-full max-w-4xl bg-slate-900 text-white rounded-2xl p-4 mb-4 flex items-center justify-between shadow-2xl border border-slate-800 print:hidden shrink-0">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
            <span>Formulir Pendaftaran Siswa Baru (Blanko Isian Manual)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
              Format A4 Presisi
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Gunakan untuk pendaftaran offline / isian tulis tangan langsung calon peserta didik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Download PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* A4 PRINT CANVAS */}
      <div 
        id="printable-blank-form"
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 sm:p-12 shadow-2xl rounded-none relative box-border text-[11px] leading-snug print:shadow-none print:p-8 print:m-0 print:w-full print:max-w-none print:rounded-none"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* KOP SURAT RESMI (KOMPAK & FORMAL EFISIEN) */}
        <div className="border-b-2 border-black pb-2 mb-2.5 flex items-center justify-between gap-3">
          <div className="w-14 h-14 shrink-0 flex items-center justify-center p-0.5">
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="max-w-full max-h-full object-contain"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div className="text-center flex-1 px-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">
              YAYASAN PENDIDIKAN LENTERA BANGSA
            </h3>
            <h1 className="text-[16px] font-black uppercase tracking-tight text-black leading-tight">
              {settings.schoolName}
            </h1>
            <p className="text-[9.5px] font-bold uppercase tracking-wider my-0.5">
              {settings.accreditation} • NPSN: {settings.npsn}
            </p>
            <p className="text-[9px] italic leading-tight">
              {settings.address}
            </p>
            <p className="text-[8.5px] text-gray-700 leading-tight">
              Telp: {settings.phone} | WA: +{settings.whatsappNumber} | Email: {settings.email} | Web: {settings.website || 'smklb2.sch.id'}
            </p>
          </div>
          <div className="w-14 h-14 shrink-0 flex flex-col items-center justify-center border border-dashed border-gray-400 p-1 text-center">
            <span className="text-[7.5px] font-bold block">BLANKO</span>
            <span className="text-[7px] text-gray-500 font-mono">OFFLINE</span>
          </div>
        </div>
        <div className="border-b border-black -mt-2 mb-2"></div>

        {/* TITLE */}
        <div className="text-center mb-3">
          <h2 className="text-[13px] font-black uppercase underline tracking-wider">
            FORMULIR PENDAFTARAN PESERTA DIDIK BARU (SPMB)
          </h2>
          <p className="text-[10px] font-bold uppercase mt-0.5">
            TAHUN AJARAN {settings.academicYear}
          </p>
        </div>

        {/* METADATA FORM BOX (DIISI PANITIA) */}
        <div className="border border-black p-2 mb-3 bg-gray-50 flex items-center justify-between text-[10px]">
          <div>
            <strong>No. Pendaftaran (Diisi Panitia):</strong>{' '}
            <span className="font-mono inline-block w-44 border-b border-dotted border-black ml-1"></span>
          </div>
          <div>
            <strong>Gelombang:</strong> [  ] Gelombang 1 &nbsp; [  ] Gelombang 2 &nbsp; [  ] Gelombang 3
          </div>
          <div>
            <strong>Tanggal Terima:</strong>{' '}
            <span className="inline-block w-24 border-b border-dotted border-black"></span>
          </div>
        </div>

        <p className="text-[9px] italic text-gray-700 mb-2">
          *Petunjuk: Isilah formulir ini dengan HURUF CETAK / KAPITAL yang jelas menggunakan tinta hitam.
        </p>

        {/* I. PILIHAN JURUSAN */}
        <div className="mb-3">
          <div className="bg-black text-white px-2 py-0.5 font-bold uppercase text-[10px] mb-1.5">
            I. PILIHAN PROGRAM KEAHLIAN / JURUSAN
          </div>
          <table className="w-full border border-black border-collapse text-[10px]">
            <tbody>
              <tr>
                <td className="w-48 p-1.5 font-bold border border-black">Pilihan 1 (Utama)</td>
                <td className="p-1.5 border border-black">
                  <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                    {majors.map((m) => (
                      <label key={m.id} className="flex items-center gap-1.5">
                        <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[8px]"></span>
                        <span>{m.name} ({m.code})</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold border border-black">Pilihan 2 (Cadangan)</td>
                <td className="p-1.5 border border-black">
                  <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                    {majors.map((m) => (
                      <label key={m.id} className="flex items-center gap-1.5">
                        <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[8px]"></span>
                        <span>{m.name} ({m.code})</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* II. DATA CALON SISWA */}
        <div className="mb-3">
          <div className="bg-black text-white px-2 py-0.5 font-bold uppercase text-[10px] mb-1.5">
            II. IDENTITAS PRIBADI CALON SISWA
          </div>
          <table className="w-full border border-black border-collapse text-[10px]">
            <tbody>
              <tr>
                <td className="w-48 p-1 font-bold border border-black">1. Nama Lengkap</td>
                <td className="p-1 border border-black font-mono">
                  {/* Boxes for letters */}
                  <div className="flex gap-0.5 flex-wrap">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 border border-gray-400"></div>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">2. Nomor Kartu Keluarga (KK)</td>
                <td className="p-1 border border-black">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 border border-black text-center font-mono"></div>
                    ))}
                    <span className="text-[9px] text-gray-500 ml-2 self-center">(16 digit nomor KK)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">3. NIK (Kependudukan)</td>
                <td className="p-1 border border-black">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 border border-black text-center font-mono"></div>
                    ))}
                    <span className="text-[9px] text-gray-500 ml-2 self-center">(16 digit NIK Siswa)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">4. NISN (Jika Ada)</td>
                <td className="p-1 border border-black">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 border border-black text-center font-mono"></div>
                    ))}
                    <span className="text-[9px] text-gray-500 ml-2 self-center font-italic">(Opsional / Tidak Wajib Diisi)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">5. Jenis Kelamin</td>
                <td className="p-1 border border-black">
                  [  ] Laki-laki &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [  ] Perempuan
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">6. Tempat, Tanggal Lahir</td>
                <td className="p-1 border border-black">
                  Tempat: ........................................, Tgl/Bln/Thn: ..... / ..... / .........
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">7. Agama</td>
                <td className="p-1 border border-black">
                  [  ] Islam &nbsp;&nbsp; [  ] Kristen &nbsp;&nbsp; [  ] Katolik &nbsp;&nbsp; [  ] Hindu &nbsp;&nbsp; [  ] Buddha &nbsp;&nbsp; [  ] Lainnya
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">8. Alamat Tempat Tinggal</td>
                <td className="p-1 border border-black">
                  Jalan/Dusun: .................................................... RT/RW: .......... / ..........<br />
                  Kel/Desa: .................................. Kec: .................................. Kab/Kota: ..................................
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">9. No. Handphone / WhatsApp</td>
                <td className="p-1 border border-black font-mono">
                  ...................................................................
                </td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">10. Email Calon Siswa</td>
                <td className="p-1 border border-black font-mono">
                  ...................................................................
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* III. DATA ORANG TUA / WALI */}
        <div className="mb-3">
          <div className="bg-black text-white px-2 py-0.5 font-bold uppercase text-[10px] mb-1.5">
            III. DATA ORANG TUA / WALI
          </div>
          <table className="w-full border border-black border-collapse text-[10px]">
            <tbody>
              <tr>
                <td className="w-48 p-1 font-bold border border-black">1. Nama Ayah Kandung</td>
                <td className="p-1 border border-black">..........................................................................................</td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">2. Pekerjaan Ayah</td>
                <td className="p-1 border border-black">..........................................................................................</td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">3. Nama Ibu Kandung</td>
                <td className="p-1 border border-black">..........................................................................................</td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">4. Pekerjaan Ibu</td>
                <td className="p-1 border border-black">..........................................................................................</td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">5. No. Telp / WA Orang Tua</td>
                <td className="p-1 border border-black font-mono">..........................................................................................</td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">6. Rata-rata Penghasilan</td>
                <td className="p-1 border border-black">
                  [  ] &lt; Rp 2.000.000 &nbsp; [  ] Rp 2.000.000 - Rp 5.000.000 &nbsp; [  ] &gt; Rp 5.000.000
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* IV. ASAL SEKOLAH */}
        <div className="mb-3">
          <div className="bg-black text-white px-2 py-0.5 font-bold uppercase text-[10px] mb-1.5">
            IV. ASAL SEKOLAH (SMP / MTs)
          </div>
          <table className="w-full border border-black border-collapse text-[10px]">
            <tbody>
              <tr>
                <td className="w-48 p-1 font-bold border border-black">1. Nama Asal Sekolah</td>
                <td className="p-1 border border-black">..........................................................................................</td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">2. Alamat Sekolah</td>
                <td className="p-1 border border-black">..........................................................................................</td>
              </tr>
              <tr>
                <td className="p-1 font-bold border border-black">3. Tahun Lulus / Nilai Rata-rata</td>
                <td className="p-1 border border-black">
                  Tahun Lulus: ................ Nilai Rata-rata Ujian/Rapor: ................
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* V. CHECKLIST KELENGKAPAN BERKAS & TANDA TANGAN */}
        <div className="grid grid-cols-12 gap-3 mt-3 pt-2 border-t border-black">
          {/* Berkas Checklist (7 cols) */}
          <div className="col-span-7 border border-black p-2">
            <strong className="block text-[10px] uppercase font-bold mb-1">
              Checklist Berkas Persyaratan (Diisi Panitia):
            </strong>
            <div className="space-y-1 text-[9.5px]">
              <div>[  ] Pas Foto Berwarna 3x4 (3 Lembar)</div>
              <div>[  ] Fotokopi Kartu Keluarga (KK) Terlegalisir</div>
              <div>[  ] Fotokopi Akta Kelahiran Siswa</div>
              <div>[  ] Fotokopi KTP Kedua Orang Tua / Wali</div>
              <div>[  ] Fotokopi Ijazah / SKL Sementara SMP/MTs</div>
              <div>[  ] Fotokopi KIP / PKH / KKS (Bagi yang memiliki)</div>
              <div>[  ] Surat Keterangan Sehat & Bebas Narkoba</div>
            </div>
          </div>

          {/* Pas Foto Box (5 cols) */}
          <div className="col-span-5 flex items-center justify-center">
            <div className="w-24 h-32 border-2 border-dashed border-black flex flex-col items-center justify-center text-center p-2">
              <span className="text-[10px] font-bold">PAS FOTO</span>
              <span className="text-[9px]">3 x 4</span>
              <span className="text-[8px] text-gray-500 mt-1">Background Merah</span>
            </div>
          </div>
        </div>

        {/* PERNYATAAN & TANDA TANGAN */}
        <div className="mt-4 pt-2 text-[10px]">
          <p className="italic text-[9px] mb-3 leading-tight">
            Data yang saya isikan di atas adalah benar dan dapat dipertanggungjawabkan sesuai hukum yang berlaku. Jika di kemudian hari ditemukan ketidakbenaran data, saya bersedia menerima sanksi yang ditetapkan oleh panitia SPMB.
          </p>

          <div className="grid grid-cols-3 text-center gap-2">
            <div>
              <p>Mengetahui,<br />Orang Tua / Wali Siswa</p>
              <div className="h-16"></div>
              <p className="border-t border-dotted border-black pt-1">
                ( ............................................ )
              </p>
            </div>
            <div>
              <p>Karawang, ............................. 2026<br />Calon Siswa Pendaftar</p>
              <div className="h-16"></div>
              <p className="border-t border-dotted border-black pt-1">
                ( ............................................ )
              </p>
            </div>
            <div>
              <p>Panitia Penerimaan SPMB<br />Petugas Verifikasi</p>
              <div className="h-16"></div>
              <p className="border-t border-dotted border-black pt-1">
                ( ............................................ )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
