import React, { useState } from 'react';
import { AppState, Team, Mission4Submission, ProductionBatchLogItem } from '../../types';
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  ArrowLeft,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  FileImage
} from 'lucide-react';

interface Mission4Props {
  state: AppState;
  activeTeam: Team;
  onBack: () => void;
  onSaveSubmission: (submission: any, isFinalSubmit: boolean) => void;
}

export const Mission4BatchRace: React.FC<Mission4Props> = ({
  state,
  activeTeam,
  onBack,
  onSaveSubmission,
}) => {
  const existingSub = state.submissions.find(
    s => s.teamId === activeTeam.id && s.missionNumber === 4
  );

  const initialPayload: Mission4Submission = (existingSub?.payload as Mission4Submission) || {
    actualBatchUnits: activeTeam.targetBatchUnits || 30,
    productionTimeMinutes: 115,
    batchLog: [
      {
        batchNumber: 'LOT-01-BIA',
        startTime: '08:30',
        endTime: '10:25',
        unitsProduced: activeTeam.targetBatchUnits || 30,
        rawMaterialUsedSummary: 'Etanol 96% 1.35 L, Gliserin 45 ml, Minyak Atsiri Jeruk Nipis 15 ml, Aquadest 390 ml',
        materialVarianceNotes: 'Terdapat sisa aquadest 20 ml karena evaporasi minim; semua bahan aktif terserap 100% sesuai BOM.',
        safetyIncidents: 'Nol insiden (Zero Accident). Seluruh kru mematuhi APD sarung tangan dan masker.',
        operatorNotes: 'Pengisian botol dilakukan berpasangan untuk menjaga kecepatan dan konsistensi tinggi cairan.',
      },
    ],
    k3AdherenceScore: 10,
    collaborationNotes: 'Seluruh 4 anggota tim hadir dan menjalankan pembagian tugas sesuai kesepakatan Misi 2 tanpa kendala komunikasi.',
    evidencePhotoUrl: '',
  };

  const [formData, setFormData] = useState<Mission4Submission>(initialPayload);
  const [activeTab, setActiveTab] = useState<'log' | 'bahan' | 'k3' | 'foto'>('log');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleLogChange = (index: number, field: keyof ProductionBatchLogItem, value: any) => {
    const updated = [...formData.batchLog];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, batchLog: updated }));
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
        setFormData(prev => ({ ...prev, evidencePhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    onSaveSubmission(formData, false);
    setSaveNotice('Draf Misi 4 berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSubmitToTeacher = () => {
    if (formData.actualBatchUnits <= 0) {
      alert('Jumlah unit produk selesai harus lebih dari 0!');
      return;
    }
    onSaveSubmission(formData, true);
    setSaveNotice('Misi 4 berhasil dikumpulkan ke Guru A. Rahman!');
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
              <span>MISI 4 — MQ-04</span>
              <span>·</span>
              <span>ESTIMASI: 120 MENIT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Batch Production Race — Produksi Massal Skala Kecil</h1>
            <p className="text-sm text-slate-300">
              Eksekusi produksi 1 batch penuh sesuai prototipe dan SOP. Catat durasi riil, unit selesai, variansi bahan baku, serta integritas keselamatan kerja dan kekompakan tim.
            </p>
          </div>

          <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 text-center shrink-0">
            <span className="text-xs text-slate-400 block">Total Unit Selesai</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              {formData.actualBatchUnits} Unit
            </span>
            <span className="text-[11px] text-slate-500 block">
              Durasi: {formData.productionTimeMinutes} Menit
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'log'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          1. Log Produksi & Waktu
        </button>
        <button
          onClick={() => setActiveTab('bahan')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'bahan'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          2. Pemakaian & Variansi Bahan
        </button>
        <button
          onClick={() => setActiveTab('k3')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'k3'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          3. K3 & Kolaborasi Tim
        </button>
        <button
          onClick={() => setActiveTab('foto')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'foto'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          4. Dokumentasi Batch Selesai
        </button>
      </div>

      {/* Tab 1: Log Produksi & Waktu */}
      {activeTab === 'log' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Catatan Log Eksekusi Batch</h2>
            <p className="text-xs text-slate-400">
              Catat waktu mulai, waktu selesai, dan jumlah botol/kemasan produk yang berhasil dituntaskan pada batch ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Produksi Rencana:
              </label>
              <span className="text-sm font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 block">
                {activeTeam.targetBatchUnits} Unit
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Jumlah Produk Selesai (Aktual):
              </label>
              <input
                type="number"
                min={1}
                value={formData.actualBatchUnits}
                onChange={(e) => setFormData(prev => ({ ...prev, actualBatchUnits: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-white rounded-lg px-3 py-2 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Total Durasi Produksi (Menit):
              </label>
              <input
                type="number"
                min={1}
                value={formData.productionTimeMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, productionTimeMinutes: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-teal-400 rounded-lg px-3 py-2 focus:border-teal-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            {formData.batchLog.map((log, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nomor Lot / Batch:</label>
                    <input
                      type="text"
                      value={log.batchNumber}
                      onChange={(e) => handleLogChange(idx, 'batchNumber', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded px-3 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Jam Mulai Kerja:</label>
                    <input
                      type="text"
                      value={log.startTime}
                      onChange={(e) => handleLogChange(idx, 'startTime', e.target.value)}
                      placeholder="08:30"
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded px-3 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Jam Selesai:</label>
                    <input
                      type="text"
                      value={log.endTime}
                      onChange={(e) => handleLogChange(idx, 'endTime', e.target.value)}
                      placeholder="10:25"
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded px-3 py-1.5 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Catatan Operator Selama Proses:</label>
                  <textarea
                    rows={2}
                    value={log.operatorNotes}
                    onChange={(e) => handleLogChange(idx, 'operatorNotes', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded p-2.5"
                    placeholder="Contoh: Pengisian botol berjalan lancar, nozel dipasang presisi..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Pemakaian & Variansi Bahan */}
      {activeTab === 'bahan' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Rekonsiliasi Pemakaian Bahan Baku & Variansi</h2>
            <p className="text-xs text-slate-400">
              Bandingkan bahan yang benar-benar terpakai dengan rencana BOM. Catat apakah terjadi tumpahan, kelebihan pemakaian, atau penghematan bahan.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Ringkasan Pemakaian Bahan Baku Riil:
              </label>
              <textarea
                rows={3}
                value={formData.batchLog[0]?.rawMaterialUsedSummary || ''}
                onChange={(e) => handleLogChange(0, 'rawMaterialUsedSummary', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-white"
                placeholder="Rincian takaran bahan yang dikeluarkan dari gudang/lab..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Catatan Variansi / Penyimpangan Bahan (Yield vs Waste):
              </label>
              <textarea
                rows={4}
                value={formData.batchLog[0]?.materialVarianceNotes || ''}
                onChange={(e) => handleLogChange(0, 'materialVarianceNotes', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-slate-200"
                placeholder="Jelaskan apakah ada bahan tercecer, tumpah, atau efisiensi yang dicapai..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: K3 & Kolaborasi Tim */}
      {activeTab === 'k3' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Disiplin K3, Nol Insiden & Kolaborasi Tim</h2>
            <p className="text-xs text-slate-400">
              Ingat prinsip Amazing Race KIK: Prestasi diukur dari keselamatan kerja, mutu produk, dan kerja sama tim, bukan sekadar adu cepat!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Audit Kepatuhan K3 Mandiri (Skala 1 - 10)</span>
              </h3>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={formData.k3AdherenceScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, k3AdherenceScore: Number(e.target.value) }))}
                  className="flex-1 accent-teal-400 cursor-pointer"
                />
                <span className="text-lg font-mono font-bold text-teal-400 bg-slate-900 px-3 py-1 rounded border border-teal-500/30">
                  {formData.k3AdherenceScore} / 10
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Catatan Insiden & Tindakan K3:</label>
                <textarea
                  rows={3}
                  value={formData.batchLog[0]?.safetyIncidents || ''}
                  onChange={(e) => handleLogChange(0, 'safetyIncidents', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-2.5 text-white"
                  placeholder="Contoh: Nol insiden kerja. Jas lab, masker, sarung tangan terpakai tertib..."
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Kolaborasi & Dinamika Kelompok</span>
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Keterlibatan Anggota Tim:</label>
                <textarea
                  rows={5}
                  value={formData.collaborationNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, collaborationNotes: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-2.5 text-white leading-relaxed"
                  placeholder="Ceritakan bagaimana ketua dan seluruh anggota saling bantu mengatasi kendala di meja produksi..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Foto Bukti */}
      {activeTab === 'foto' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Foto Bukti 1 Batch Produk Jadi</h2>
            <p className="text-xs text-slate-400">
              Dokumentasikan seluruh unit produk batch yang telah selesai diproduksi dan dikemas rapi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Unggah Foto Batch Selesai (Maks 2MB):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-500 file:text-slate-950 hover:file:bg-teal-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Atau Cantumkan Tautan Link Foto/Drive:
                </label>
                <input
                  type="text"
                  value={formData.evidencePhotoUrl.startsWith('data:') ? '' : formData.evidencePhotoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, evidencePhotoUrl: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px]">
              {formData.evidencePhotoUrl ? (
                <img
                  src={formData.evidencePhotoUrl}
                  alt="Bukti Batch Selesai"
                  className="max-h-56 object-contain rounded border border-slate-700"
                />
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
            <span>Kumpulkan Misi 4 ke Guru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
