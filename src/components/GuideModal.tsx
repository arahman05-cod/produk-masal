import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, UserCheck, Users, ShieldCheck, Database, Award } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeRoleTab, setActiveRoleTab] = useState<'guru' | 'siswa' | 'fitur'>('guru');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Panduan Penggunaan Product Quest</h2>
            </div>
            <p className="text-xs text-slate-400">
              SMKS Kesehatan Fania Salsabila Kota Jambi · Mapel Kreatif Inovatif & Kewirausahaan (KIK) · Guru: A. Rahman, S.Kom., Gr.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveRoleTab('guru')}
            className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
              activeRoleTab === 'guru'
                ? 'text-teal-400 border-teal-400 bg-slate-950/50'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Panduan Guru (A. Rahman)
          </button>
          <button
            onClick={() => setActiveRoleTab('siswa')}
            className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
              activeRoleTab === 'siswa'
                ? 'text-teal-400 border-teal-400 bg-slate-950/50'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Panduan Siswa SMK
          </button>
          <button
            onClick={() => setActiveRoleTab('fitur')}
            className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
              activeRoleTab === 'fitur'
                ? 'text-teal-400 border-teal-400 bg-slate-950/50'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Daftar Fitur Teruji & Status Setup
          </button>
        </div>

        {/* Tab Content: Guru */}
        {activeRoleTab === 'guru' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span>Langkah 1: Mengatur Sesi Kelas & Membagikan Kode Bergabung</span>
              </h3>
              <p>
                Buka tab <strong>Dashboard Guru</strong>. Pada bagian atas tertera kode bergabung (contoh: <code className="text-teal-300 font-mono">FANIA-KIK-26</code>). Bagikan kode ini ke WhatsApp kelas atau Google Classroom agar siswa dapat terhubung ke sesi Anda.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Langkah 2: Memantau 6 Misi & Memeriksa Tugas</span>
              </h3>
              <p>
                Gunakan <strong>Matriks Progres Kelompok</strong> untuk melihat etape yang sedang dikerjakan. Ketika siswa mengumpulkan tugas, status akan berubah menjadi <span className="text-amber-300 font-semibold">"Menunggu Penilaian"</span>. Klik tombol <strong>Beri Nilai & Ulasan</strong> untuk membuka formulir evaluasi.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                <span>Langkah 3: Menggunakan Rubrik 100 Poin & Mengatur Bobot</span>
              </h3>
              <p>
                Penilaian menggunakan 6 kriteria: Kesesuaian Prototipe (30%), Mutu QC & FPY (25%), SOP & K3 (15%), Efisiensi Biaya (10%), Kolaborasi Tim (10%), dan Refleksi (10%). Guru dapat mengubah bobot rubrik pada sub-tab <strong>Atur Rubrik 100 Poin</strong> sesuai kebutuhan kurikulum sekolah.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Langkah 4: Menghubungkan Google Sheets & Unduh Laporan</span>
              </h3>
              <p>
                Buka menu <strong>Database Sheets</strong> di bilah atas. Salin kode Google Apps Script yang disediakan ke Google Sheets baru Anda, lalu deploy sebagai Web App (akses: Anyone). Tempel URL Web App ke kolom konfigurasi dan klik "Uji Koneksi". Anda juga dapat langsung mengunduh rekap nilai dalam format CSV.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: Siswa */}
        {activeRoleTab === 'siswa' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>1. Profil Siswa & Paspor Ekspedisi</span>
              </h3>
              <p>
                Tulis nama lengkap Anda di <strong>Dashboard Siswa</strong>, lalu pilih kelompok kerja produk Anda. Jika guru memberi kode kelas baru, masukkan pada kolom "Kode Bergabung".
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>2. Menaklukkan 6 Etape Amazing Race Produksi</span>
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Misi 1 (Digital Mystery Hunt):</strong> Bedah prototipe, kerjakan kuis detektif mutu, catat cacat sampel.</li>
                <li><strong>Misi 2 (Budget Battle):</strong> Hitung takaran bahan BOM, tentukan HPP, dan rancang SOP 5 langkah.</li>
                <li><strong>Misi 3 (Home Lab Challenge):</strong> Uji coba 1-2 unit pilot run, penuhi checklist K3, dan foto hasilnya.</li>
                <li><strong>Misi 4 (Batch Production Race):</strong> Produksi 1 batch massal skala kecil, catat durasi riil & variansi bahan.</li>
                <li><strong>Misi 5 (QC Escape Room):</strong> Uji spesifikasi, hitung FPY %, pecahkan akar masalah dengan 5-Why & CAPA.</li>
                <li><strong>Misi 6 (Virtual Festival):</strong> Gelar karya produk final dan tulis refleksi belajar Anda.</li>
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>3. Membaca Umpan Balik Guru & Revisi</span>
              </h3>
              <p>
                Jika tugas Anda berstatus <span className="text-rose-300 font-semibold">"Perlu Revisi"</span>, buka kembali misi terkait, baca arahan dari Guru A. Rahman di kotak evaluasi, lakukan perbaikan, dan kumpulkan kembali.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: Daftar Fitur Teruji */}
        {activeRoleTab === 'fitur' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Daftar Fitur yang Sudah Diuji & Berfungsi Penuh:</span>
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-200">
                <li>Alur bergabung kelas dengan kode joining real-time.</li>
                <li>Peta rute Amazing Race 6 etape dengan status interaktif.</li>
                <li>Kuis detektif mutu interaktif dengan penilaian otomatis & penjelasan ilmiah.</li>
                <li>Kalkulator BOM (Bill of Materials) & simulasi HPP dan margin harga jual.</li>
                <li>Checklist K3 & kalibrasi alat dengan log masalah-solusi di Home Lab.</li>
                <li>Pencatatan log produksi riil Misi 4 (waktu, variansi bahan, zero accident audit).</li>
                <li>Kalkulator First Pass Yield (FPY %) interaktif & analisis 5-Why mendalam.</li>
                <li>Gelar karya produk Misi 6 dengan formulir refleksi individu siswa SMK.</li>
                <li>Dashboard Guru dengan penilaian rubrik 100 poin & kustomisasi bobot kriteria.</li>
                <li>Pemberian umpan balik (feedback), pengembalian revisi, dan pengesahan tuntas.</li>
                <li>Ekspor laporan CSV multi-tabel terstruktur yang siap dibuka di Google Sheets.</li>
                <li>Penyimpanan lokal persisten (tetap tersimpan saat halaman dimuat ulang) serta fitur cadangan JSON.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Pengaturan Lanjutan yang Masih Diperlukan (Bila Ingin Terhubung Cloud Google Sheets):</span>
              </h3>
              <p className="text-slate-300">
                Aplikasi saat ini berjalan secara mandiri dan aman menggunakan <strong>Mode Penyimpanan Lokal Terverifikasi</strong>. Jika Guru A. Rahman ingin menghubungkan database bersama ke Google Drive sekolah:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                <li>Buka menu <strong>Database Sheets</strong> di bilah atas.</li>
                <li>Salin kode Google Apps Script dari tab "Kode Google Apps Script".</li>
                <li>Buka spreadsheet baru di Google Drive guru & tempelkan di menu Ekstensi &gt; Apps Script.</li>
                <li>Deploy sebagai Web App dengan izin "Anyone".</li>
                <li>Tempel URL Web App ke kolom konfigurasi dan tekan "Uji Koneksi Baca/Tulis".</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer Close */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
