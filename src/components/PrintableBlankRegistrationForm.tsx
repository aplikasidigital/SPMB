/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolSettings, MajorProgram } from '../types/spmb';
import { Printer, Download, X } from 'lucide-react';
import { QRCodeSVG } from './QRCodeSVG';

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
        {/* CSS Print Rules: Standard A4 with 1cm (10mm) Margins & No Kop Surat */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            #printable-blank-form {
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
            }
          }
        `}</style>

        {/* JUDUL DOKUMEN (TANPA KOP SURAT) */}
        <div className="text-center mb-3 pb-2 border-b-2 border-black">
          <h2 className="text-[15px] font-black uppercase tracking-wider text-black leading-tight">
            FORMULIR PENDAFTARAN SISWA BARU (BLANKO ISIAN MANUAL)
          </h2>
          <p className="text-[11px] font-bold uppercase mt-0.5 text-black tracking-wide">
            TAHUN AJARAN {settings.academicYear || '2026/2027'}
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

        {/* V. KETERANGAN / PETUNJUK KELENGKAPAN BERKAS PERSYARATAN (TANPA CHECKLIST PANITIA & TANPA PAS FOTO) */}
        <div className="mt-3 pt-2 border-t border-black">
          <div className="border border-black p-2.5 bg-gray-50/80">
            <div className="flex items-center gap-1.5 mb-1.5 border-b border-black pb-1">
              <strong className="text-[10px] uppercase font-black tracking-wide">
                KETERANGAN / PETUNJUK KELENGKAPAN BERKAS PERSYARATAN:
              </strong>
            </div>
            <p className="text-[9.5px] leading-relaxed text-black">
              Calon peserta didik <strong>wajib melengkapi dan melampirkan seluruh dokumen persyaratan</strong> berikut ke dalam map pendaftaran sebelum diserahkan kepada panitia SPMB:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9.5px] mt-1.5 text-black">
              <div>• 1. Fotokopi Kartu Keluarga (KK) yang masih berlaku (2 lembar)</div>
              <div>• 2. Fotokopi Akta Kelahiran Calon Siswa (2 lembar)</div>
              <div>• 3. Fotokopi KTP Kedua Orang Tua / Wali Murid (2 lembar)</div>
              <div>• 4. Fotokopi Ijazah / SKL Sementara SMP/MTs dilegalisir (2 lembar)</div>
              <div>• 5. Fotokopi KIP / PKH / KKS (khusus bagi penerima bantuan program pemerintah)</div>
              <div>• 6. Surat Keterangan Kelakuan Baik & Bebas Narkoba dari sekolah/faskes</div>
            </div>
            <p className="text-[8.5px] italic text-gray-700 mt-1.5 border-t border-dashed border-gray-400 pt-1">
              *Harap pastikan seluruh berkas telah tersusun rapi dan lengkap sesuai urutan sebelum proses validasi data.
            </p>
          </div>
        </div>

        {/* PERNYATAAN & TANDA TANGAN (TANDA TANGAN PANITIA OTOMATIS BERUPA QR CODE) */}
        <div className="mt-4 pt-2 text-[10px]">
          <p className="italic text-[9px] mb-3 leading-tight">
            Data yang saya isikan di atas adalah benar dan dapat dipertanggungjawabkan sesuai hukum yang berlaku. Jika di kemudian hari ditemukan ketidakbenaran data, saya bersedia menerima sanksi yang ditetapkan oleh panitia SPMB.
          </p>

          <div className="grid grid-cols-3 text-center gap-2 items-end">
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
            <div className="flex flex-col items-center justify-end">
              <p className="leading-tight mb-1">
                Panitia Penerimaan SPMB<br />
                <span className="text-[8.5px] font-bold text-gray-800">Otentikasi & Verifikasi Resmi</span>
              </p>
              <div className="p-1 bg-white border border-black inline-block mb-1">
                <QRCodeSVG
                  value={`VERIFIKASI-PANITIA-SPMB-${settings.schoolName || 'SEKOLAH'}-${settings.academicYear || '2026'}-AUTH`}
                  size={60}
                  className="p-0 border-0"
                />
              </div>
              <p className="text-[8.5px] font-mono font-black text-black tracking-tight leading-none">
                QR CODE TERVALIDASI
              </p>
              <p className="text-[7.5px] text-gray-600 mt-0.5">
                (Tanda Tangan Panitia Otomatis)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
