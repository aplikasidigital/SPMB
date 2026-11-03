
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { SchoolSettings, MajorProgram } from '../types/spmb';
import { Printer, X } from 'lucide-react';
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
  const handlePrint = useCallback(() => {
    const printContent = document.getElementById('printable-blank-form');

    if (!printContent) {
      console.error('Elemen formulir tidak ditemukan.');
      return;
    }

    window.print();
  }, []);

  const schoolName = settings.schoolName || 'SEKOLAH';
  const academicYear = settings.academicYear || '2026/2027';

  const renderBoxes = (length: number, borderColor = 'black') => (
    <div className="flex flex-nowrap gap-[2px] items-center">
      {Array.from({ length }).map((_, index) => (
        <span
          key={index}
          className="inline-block flex-1 min-w-0 h-[15px] border text-center"
          style={{ borderColor }}
        />
      ))}
    </div>
  );

  const renderMajorOptions = () => (
    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
      {majors.map((major) => (
        <div
          key={major.id}
          className="flex items-start gap-1 min-w-0"
        >
          <span className="inline-block w-[12px] h-[12px] flex-shrink-0 border border-black" />
          <span className="break-words">
            {major.name} ({major.code})
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-6 overflow-y-auto">

      {/* HEADER ACTION */}
      <div className="w-full max-w-4xl bg-slate-900 text-white rounded-2xl p-4 mb-4 flex items-center justify-between gap-3 shadow-2xl border border-slate-800 print:hidden shrink-0">

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-extrabold flex flex-wrap items-center gap-2">
            <span>
              Formulir Pendaftaran Siswa Baru (Blanko Isian Manual)
            </span>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 whitespace-nowrap">
              Format A4 Presisi
            </span>
          </h2>

          <p className="text-xs text-slate-300 mt-1">
            Gunakan untuk pendaftaran offline / isian tulis tangan langsung calon peserta didik.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">
              Cetak / Download PDF
            </span>
            <span className="sm:hidden">
              Cetak
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* PRINTABLE FORM */}
      <div
        id="printable-blank-form"
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 sm:p-12 shadow-2xl rounded-none relative box-border text-[11px] leading-snug print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-0"
        style={{
          fontFamily: "'Times New Roman', Times, serif",
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >

        {/* PRINT CSS */}
        <style>{`
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          @media print {

            html,
            body {
              width: 100% !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body * {
              visibility: hidden !important;
            }

            #printable-blank-form,
            #printable-blank-form * {
              visibility: visible !important;
            }

            #printable-blank-form {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: none !important;
              min-height: 0 !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              overflow: visible !important;
              background: white !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .bg-black {
              background-color: #000 !important;
              color: #fff !important;
            }

            .bg-gray-50,
            .bg-gray-50\\/80 {
              background-color: #f9fafb !important;
            }

            svg {
              max-width: 100%;
            }

            * {
              box-sizing: border-box !important;
            }
          }
        `}</style>

        {/* JUDUL DOKUMEN */}
        <div className="text-center mb-3 pb-2 border-b-2 border-black">

          <h2 className="text-[15px] font-black uppercase tracking-wider text-black leading-tight">
            FORMULIR PENDAFTARAN SISWA BARU (BLANKO ISIAN MANUAL)
          </h2>

          <p className="text-[11px] font-bold uppercase mt-0.5 text-black tracking-wide">
            TAHUN AJARAN {academicYear}
          </p>

        </div>

        {/* METADATA PENDAFTARAN */}
        <div className="border border-black p-2 mb-3 bg-gray-50 flex flex-wrap items-center justify-between gap-2 text-[10px]">

          <div>
            <strong>No. Pendaftaran (Diisi Panitia):</strong>
            <span className="font-mono inline-block w-32 border-b border-dotted border-black ml-1" />
          </div>

          <div>
            <strong>Gelombang:</strong>
            {' '}[  ] Gelombang 1
            {' '}[  ] Gelombang 2
            {' '}[  ] Gelombang 3
          </div>

          <div>
            <strong>Tanggal Terima:</strong>
            <span className="inline-block w-20 border-b border-dotted border-black ml-1" />
          </div>

        </div>

        <p className="text-[9px] italic text-gray-700 mb-2">
          *Petunjuk: Isilah formulir ini dengan HURUF CETAK / KAPITAL yang jelas menggunakan tinta hitam.
        </p>

        {/* I. PILIHAN JURUSAN */}
        <div className="mb-3">

          <div className="bg-black text-white px-2 py-1 font-bold uppercase text-[10px] mb-1.5">
            I. PILIHAN PROGRAM KEAHLIAN / JURUSAN
          </div>

          <table className="w-full border border-black border-collapse text-[10px]">
            <tbody>

              <tr>
                <td className="w-40 p-1.5 font-bold border border-black">
                  Pilihan 1 (Utama)
                </td>

                <td className="p-1.5 border border-black">
                  {renderMajorOptions()}
                </td>
              </tr>

              <tr>
                <td className="p-1.5 font-bold border border-black">
                  Pilihan 2 (Cadangan)
                </td>

                <td className="p-1.5 border border-black">
                  {renderMajorOptions()}
                </td>
              </tr>

            </tbody>
          </table>

        </div>

        {/* II. IDENTITAS CALON SISWA */}
        <div className="mb-3">

          <div className="bg-black text-white px-2 py-1 font-bold uppercase text-[10px] mb-1.5">
            II. IDENTITAS PRIBADI CALON SISWA
          </div>

          <table className="w-full border border-black border-collapse text-[10px]">
            <tbody>

              <tr>
                <td className="w-40 p-1 font-bold border border-black">
                  1. Nama Lengkap
                </td>

                <td className="p-1 border border-black">
                  {renderBoxes(28, '#9ca3af')}
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  2. Nomor Kartu Keluarga (KK)
                </td>

                <td className="p-1 border border-black">
                  {renderBoxes(16)}
                  <span className="text-[8px] text-gray-500">
                    (16 digit nomor KK)
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  3. NIK (Kependudukan)
                </td>

                <td className="p-1 border border-black">
                  {renderBoxes(16)}
                  <span className="text-[8px] text-gray-500">
                    (16 digit NIK Siswa)
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  4. NISN (Jika Ada)
                </td>

                <td className="p-1 border border-black">
                  {renderBoxes(10)}
                  <span className="text-[8px] text-gray-500">
                    (Opsional / Tidak Wajib Diisi)
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  5. Jenis Kelamin
                </td>

                <td className="p-1 border border-black">
                  [  ] Laki-laki
                  {'       '}
                  [  ] Perempuan
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  6. Tempat, Tanggal Lahir
                </td>

                <td className="p-1 border border-black">
                  Tempat: ........................................,
                  Tgl/Bln/Thn: ..... / ..... / .........
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  7. Agama
                </td>

                <td className="p-1 border border-black">
                  [  ] Islam {' '}
                  [  ] Kristen {' '}
                  [  ] Katolik {' '}
                  [  ] Hindu {' '}
                  [  ] Buddha {' '}
                  [  ] Lainnya
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  8. Alamat Tempat Tinggal
                </td>

                <td className="p-1 border border-black">
                  Jalan/Dusun: ....................................................
                  RT/RW: .......... / ..........
                  <br />
                  Kel/Desa: ..................................
                  Kec: ..................................
                  Kab/Kota: ..................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  9. No. Handphone / WhatsApp
                </td>

                <td className="p-1 border border-black font-mono">
                  ...................................................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  10. Email Calon Siswa
                </td>

                <td className="p-1 border border-black font-mono">
                  ...................................................................
                </td>
              </tr>

            </tbody>
          </table>

        </div>

        {/* III. DATA ORANG TUA / WALI */}
        <div className="mb-3">

          <div className="bg-black text-white px-2 py-1 font-bold uppercase text-[10px] mb-1.5">
            III. DATA ORANG TUA / WALI
          </div>

          <table className="w-full border border-black border-collapse text-[10px]">
            <tbody>

              <tr>
                <td className="w-40 p-1 font-bold border border-black">
                  1. Nama Ayah Kandung
                </td>

                <td className="p-1 border border-black">
                  ..........................................................................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  2. Pekerjaan Ayah
                </td>

                <td className="p-1 border border-black">
                  ..........................................................................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  3. Nama Ibu Kandung
                </td>

                <td className="p-1 border border-black">
                  ..........................................................................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  4. Pekerjaan Ibu
                </td>

                <td className="p-1 border border-black">
                  ..........................................................................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  5. No. Telp / WA Orang Tua
                </td>

                <td className="p-1 border border-black font-mono">
                  ..........................................................................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  6. Rata-rata Penghasilan
                </td>

                <td className="p-1 border border-black">
                  [  ] &lt; Rp 2.000.000
                  {'  '}
                  [  ] Rp 2.000.000 - Rp 5.000.000
                  {'  '}
                  [  ] &gt; Rp 5.000.000
                </td>
              </tr>

            </tbody>
          </table>

        </div>

        {/* IV. ASAL SEKOLAH */}
        <div className="mb-3">

          <div className="bg-black text-white px-2 py-1 font-bold uppercase text-[10px] mb-1.5">
            IV. ASAL SEKOLAH (SMP / MTs)
          </div>

          <table className="w-full border border-black border-collapse text-[10px]">
            <tbody>

              <tr>
                <td className="w-40 p-1 font-bold border border-black">
                  1. Nama Asal Sekolah
                </td>

                <td className="p-1 border border-black">
                  ..........................................................................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  2. Alamat Sekolah
                </td>

                <td className="p-1 border border-black">
                  ..........................................................................................
                </td>
              </tr>

              <tr>
                <td className="p-1 font-bold border border-black">
                  3. Tahun Lulus / Nilai Rata-rata
                </td>

                <td className="p-1 border border-black">
                  Tahun Lulus: ................
                  Nilai Rata-rata Ujian/Rapor: ................
                </td>
              </tr>

            </tbody>
          </table>

        </div>

        {/* V. KETERANGAN PERSYARATAN */}
        <div className="mt-3 pt-2 border-t border-black">

          <div className="border border-black p-2.5 bg-gray-50">

            <div className="flex items-center gap-1.5 mb-1.5 border-b border-black pb-1">

              <strong className="text-[10px] uppercase font-black tracking-wide">
                KETERANGAN / PETUNJUK KELENGKAPAN BERKAS PERSYARATAN:
              </strong>

            </div>

            <p className="text-[9.5px] leading-relaxed text-black">
              Calon peserta didik{' '}
              <strong>
                wajib melengkapi dan melampirkan seluruh dokumen persyaratan
              </strong>{' '}
              berikut ke dalam map pendaftaran sebelum diserahkan kepada panitia SPMB:
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9.5px] mt-1.5 text-black">

              <div>
                • 1. Fotokopi Kartu Keluarga (KK) yang masih berlaku (2 lembar)
              </div>

              <div>
                • 2. Fotokopi Akta Kelahiran Calon Siswa (2 lembar)
              </div>

              <div>
                • 3. Fotokopi KTP Kedua Orang Tua / Wali Murid (2 lembar)
              </div>

              <div>
                • 4. Fotokopi Ijazah / SKL Sementara SMP/MTs dilegalisir (2 lembar)
              </div>

              <div>
                • 5. Fotokopi KIP / PKH / KKS (khusus bagi penerima bantuan program pemerintah)
              </div>

              <div>
                • 6. Surat Keterangan Kelakuan Baik & Bebas Narkoba dari sekolah/faskes
              </div>

            </div>

            <p className="text-[8.5px] italic text-gray-700 mt-1.5 border-t border-dashed border-gray-400 pt-1">
              *Harap pastikan seluruh berkas telah tersusun rapi dan lengkap sesuai urutan sebelum proses validasi data.
            </p>

          </div>

        </div>

        {/* PERNYATAAN DAN TANDA TANGAN */}
        <div className="mt-4 pt-2 text-[10px]">

          <p className="italic text-[9px] mb-3 leading-tight">
            Data yang saya isikan di atas adalah benar dan dapat dipertanggungjawabkan sesuai hukum yang berlaku. Jika di kemudian hari ditemukan ketidakbenaran data, saya bersedia menerima sanksi yang ditetapkan oleh panitia SPMB.
          </p>

          <div className="grid grid-cols-3 text-center gap-2 items-end">

            {/* ORANG TUA */}
            <div className="min-w-0">

              <p>
                Mengetahui,
                <br />
                Orang Tua / Wali Siswa
              </p>

              <div className="h-16" />

              <p className="border-t border-dotted border-black pt-1">
                ( ............................................ )
              </p>

            </div>

            {/* CALON SISWA */}
            <div className="min-w-0">

              <p>
                Karawang, ............................. 2026
                <br />
                Calon Siswa Pendaftar
              </p>

              <div className="h-16" />

              <p className="border-t border-dotted border-black pt-1">
                ( ............................................ )
              </p>

            </div>

            {/* QR CODE PANITIA */}
            <div className="flex flex-col items-center justify-end min-w-0">

              <p className="leading-tight mb-1">
                Panitia Penerimaan SPMB
                <br />

                <span className="text-[8.5px] font-bold text-gray-800">
                  Otentikasi & Verifikasi Resmi
                </span>
              </p>

              <div className="p-1 bg-white border border-black inline-block mb-1">

                <QRCodeSVG
                  value={`VERIFIKASI-PANITIA-SPMB-${schoolName}-${academicYear}-AUTH`}
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
