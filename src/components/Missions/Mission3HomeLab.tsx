import React, { useState } from 'react';
import { AppState, Team, Mission3Submission } from '../../types';
import {
  FlaskConical,
  CheckSquare,
  Square,
  AlertTriangle,
  Upload,
  Save,
  Send,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  FileImage
} from 'lucide-react';

interface Mission3Props {
  state: AppState;
  activeTeam: Team;
  onBack: () => void;
  onSaveSubmission: (submission: any, isFinalSubmit: boolean) => void;
}

export const Mission3HomeLab: React.FC<Mission3Props> = ({
  state,
  activeTeam,
  onBack,
  onSaveSubmission,
}) => {
  const existingSub = state.submissions.find(
    s => s.teamId === activeTeam.id && s.missionNumber === 3
  );

  const initialPayload: Mission3Submission = (existingSub?.payload as Mission3Submission) || {
    pilotUnitCount: 2,
    k3Checklist: [
      { item: 'Mengenakan Jas Laboratorium / Apron bersih standar SMK', checked: true },
      { item: 'Menggunakan Sarung Tangan Nitril / Medis sekali pakai', checked: true },
      { item: 'Memakai Masker Medis 3-ply saat menimbang bahan dan pencampuran', checked: true },
      { item: 'Ruang kerja bersih, berventilasi baik, dan bebas makanan/minuman', checked: true },
      { item: 'Tersedia lap bersih, alkohol 70% untuk desinfeksi meja kerja, dan tempat sampah tertutup', checked: true },
    ],
    equipmentChecklist: [
      { toolName: 'Timbangan Digital Miligram', calibrationStatus: 'terkalibrasi', notes: 'Dikalibrasi dengan anak timbang 100g, tare stabil' },
      { toolName: 'Gelas Ukur Lab 100ml', calibrationStatus: 'terkalibrasi', notes: 'Meniskus bawah sejajar garis pandang' },
      { toolName: 'Batang Pengaduk Kaca / Spatula Stainless', calibrationStatus: 'terkalibrasi', notes: 'Dibersihkan dengan alkohol 70% sebelum dipakai' },
      { toolName: 'Botol / Wadah Kemasan Uji', calibrationStatus: 'terkalibrasi', notes: 'Dicuci kering dan bebas debu' },
    ],
    problemLogs: [
      {
        issue: 'Pelarutan minyak atsiri awalnya memicu kekeruhan mikro',
        cause: 'Minyak atsiri langsung dituangkan ke air tanpa dilarutkan terlebih dahulu ke gliserin/alkohol',
        solution: 'Mengubah urutan pencampuran: Minyak dilarutkan ke gliserin terlebih dahulu hingga homogen sebelum dicampur alkohol dan aquadest',
      },
    ],
    proofEvidenceUrl: '',
    proofNotes: 'Uji coba 2 botol sampel berhasil diselesaikan. Viskositas sesuai, semprotan nozel menyebar halus dan tidak bocor saat diuji balik 15 menit.',
  };

  const [formData, setFormData] = useState<Mission3Submission>(initialPayload);
  const [activeTab, setActiveTab] = useState<'k3' | 'alat' | 'masalah' | 'bukti'>('k3');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleToggleK3 = (index: number) => {
    const updated = [...formData.k3Checklist];
    updated[index].checked = !updated[index].checked;
    setFormData(prev => ({ ...prev, k3Checklist: updated }));
  };

  const handleAddProblem = () => {
    setFormData(prev => ({
      ...prev,
      problemLogs: [
        ...prev.problemLogs,
        { issue: '', cause: '', solution: '' },
      ],
    }));
  };

  const handleRemoveProblem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      problemLogs: prev.problemLogs.filter((_, i) => i !== index),
    }));
  };

  const handleProblemChange = (index: number, field: string, val: string) => {
    const updated = [...formData.problemLogs];
    updated[index] = { ...updated[index], [field]: val };
    setFormData(prev => ({ ...prev, problemLogs: updated }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2 MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, proofEvidenceUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    onSaveSubmission(formData, false);
    setSaveNotice('Draf Misi 3 berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSubmitToTeacher = () => {
    const uncheckedK3 = formData.k3Checklist.filter(k => !k.checked);
    if (uncheckedK3.length > 0) {
      if (!confirm(`Ada ${uncheckedK3.length} butir K3 yang belum dicentang. Tetap kumpulkan?`)) {
        return;
      }
    }
    onSaveSubmission(formData, true);
    setSaveNotice('Misi 3 berhasil dikumpulkan ke Guru A. Rahman!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Nav Back */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Kembali ke Peta Misi</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Tim:</span>
          <span className="text-xs font-bold text-teal-300 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
            {activeTeam.name}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded border text-teal-400 bg-teal-950/60 border-teal-500/40">
            {existingSub?.status === 'selesai_diverifikasi' ? 'Selesai Diverifikasi' : existingSub?.status === 'dikumpulkan' ? 'Terkumpul' : 'Draf Aktif'}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-teal-400 font-mono">
              <span>MISI 3 — MQ-03</span>
              <span>·</span>
              <span>ESTIMASI: 90 MENIT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Home Lab Challenge — Uji Coba Pilot Run 1-2 Unit</h1>
            <p className="text-sm text-slate-300">
              Praktikkan SOP pada 1-2 unit sampel awal di laboratorium/meja kerja rumah, verifikasi keselamatan K3, kalibrasi alat, dan dokumentasikan solusi jika muncul kendala.
            </p>
          </div>

          <div className="bg-slate-950 border border-teal-500/30 rounded-xl p-4 text-center shrink-0">
            <span className="text-xs text-slate-400 block">Unit Pilot Run</span>
            <span className="text-2xl font-bold font-mono text-teal-400">
              {formData.pilotUnitCount} Unit Uji
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('k3')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'k3'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          1. Checklist K3 & APD
        </button>
        <button
          onClick={() => setActiveTab('alat')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'alat'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          2. Kalibrasi Alat
        </button>
        <button
          onClick={() => setActiveTab('masalah')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'masalah'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          3. Log Masalah & Solusi
        </button>
        <button
          onClick={() => setActiveTab('bukti')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'bukti'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          4. Bukti Foto & Catatan Uji
        </button>
      </div>

      {/* Tab 1: K3 Checklist */}
      {activeTab === 'k3' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Checklist Keselamatan dan Kesehatan Kerja (K3)</h2>
            <p className="text-xs text-slate-400">
              Centang setiap protokol yang telah dipenuhi sebelum dan selama proses uji coba pilot run.
            </p>
          </div>

          <div className="space-y-3">
            {formData.k3Checklist.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleK3(idx)}
                className={`p-3.5 rounded-lg border flex items-center gap-3 transition-colors cursor-pointer ${
                  item.checked
                    ? 'bg-slate-950 border-teal-500/50 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {item.checked ? (
                  <CheckSquare className="w-5 h-5 text-teal-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600 shrink-0" />
                )}
                <span className="text-xs md:text-sm leading-relaxed">{item.item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Kalibrasi Alat */}
      {activeTab === 'alat' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Checklist Kesiapan & Kalibrasi Alat Ukur</h2>
            <p className="text-xs text-slate-400">
              Pastikan alat takar dan timbang telah diverifikasi akurasinya sebelum memproduksi sampel.
            </p>
          </div>

          <div className="space-y-3">
            {formData.equipmentChecklist.map((tool, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">{tool.toolName}</span>
                  <span className="text-[11px] text-slate-400">{tool.notes}</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={tool.calibrationStatus}
                    onChange={(e) => {
                      const updated = [...formData.equipmentChecklist];
                      updated[idx].calibrationStatus = e.target.value as any;
                      setFormData(prev => ({ ...prev, equipmentChecklist: updated }));
                    }}
                    className="bg-slate-900 border border-slate-700 text-xs text-teal-300 rounded px-2.5 py-1 focus:outline-none"
                  >
                    <option value="terkalibrasi">Terkalibrasi & Siap</option>
                    <option value="belum">Belum Dikalibrasi</option>
                    <option value="tidak_perlu">Kondisi Standar</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Log Masalah & Solusi */}
      {activeTab === 'masalah' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Catatan Kendala & Solusi Rekayasa</h2>
              <p className="text-xs text-slate-400">
                Pencatatan masalah nyata adalah kunci keberhasilan pilot run agar tidak terulang pada produksi massal batch besar.
              </p>
            </div>
            <button
              onClick={handleAddProblem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Masalah</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.problemLogs.map((p, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Kendala #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveProblem(idx)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Masalah / Gejala yang Terjadi:</label>
                    <textarea
                      rows={3}
                      value={p.issue}
                      onChange={(e) => handleProblemChange(idx, 'issue', e.target.value)}
                      placeholder="Contoh: Larutan keruh, timbangan meleset..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Dugaan Penyebab:</label>
                    <textarea
                      rows={3}
                      value={p.cause}
                      onChange={(e) => handleProblemChange(idx, 'cause', e.target.value)}
                      placeholder="Contoh: Suhu air terlalu dingin saat pencampuran..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tindakan Solusi yang Diterapkan:</label>
                    <textarea
                      rows={3}
                      value={p.solution}
                      onChange={(e) => handleProblemChange(idx, 'solution', e.target.value)}
                      placeholder="Contoh: Larutkan pada air hangat suam kuku 40C..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-teal-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Bukti & Catatan */}
      {activeTab === 'bukti' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Dokumentasi Foto & Catatan Uji Coba Pilot Run</h2>
            <p className="text-xs text-slate-400">
              Unggah foto hasil 1-2 unit prototipe uji coba atau cantumkan tautan penyimpanan dokumentasi kelompok.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Unggah Bukti Foto (Maks 2MB):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-500 file:text-slate-950 hover:file:bg-teal-400 cursor-pointer"
              />

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Atau Cantumkan Tautan Link Foto/Drive:
                </label>
                <input
                  type="text"
                  value={formData.proofEvidenceUrl.startsWith('data:') ? '' : formData.proofEvidenceUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, proofEvidenceUrl: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Catatan Kesimpulan Uji Pilot Run:
                </label>
                <textarea
                  rows={4}
                  value={formData.proofNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, proofNotes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-white leading-relaxed"
                />
              </div>
            </div>

            {/* Preview Area */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px]">
              {formData.proofEvidenceUrl ? (
                <div className="relative w-full h-full max-h-64 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={formData.proofEvidenceUrl}
                    alt="Bukti Pilot Run"
                    className="max-h-56 object-contain rounded border border-slate-700"
                  />
                </div>
              ) : (
                <div className="text-center space-y-2 p-6">
                  <FileImage className="w-12 h-12 text-slate-700 mx-auto" />
                  <span className="text-xs text-slate-500 block">Belum ada foto yang diunggah</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Notice */}
      {saveNotice && (
        <div className="p-3 bg-teal-950 border border-teal-500 rounded-lg text-teal-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Kembali ke Peta
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Simpan Draf</span>
          </button>

          <button
            onClick={handleSubmitToTeacher}
            className="flex items-center gap-1.5 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kumpulkan Misi 3 ke Guru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
