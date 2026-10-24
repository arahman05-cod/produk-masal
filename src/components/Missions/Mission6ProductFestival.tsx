import React, { useState } from 'react';
import { AppState, Team, Mission6Submission } from '../../types';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Save,
  Send,
  ArrowLeft,
  Users,
  Image,
  TrendingUp,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';

interface Mission6Props {
  state: AppState;
  activeTeam: Team;
  onBack: () => void;
  onSaveSubmission: (submission: any, isFinalSubmit: boolean) => void;
}

export const Mission6ProductFestival: React.FC<Mission6Props> = ({
  state,
  activeTeam,
  onBack,
  onSaveSubmission,
}) => {
  const existingSub = state.submissions.find(
    s => s.teamId === activeTeam.id && s.missionNumber === 6
  );

  // Retrieve metrics from Misi 2, 4, 5 if available
  const sub2 = state.submissions.find(s => s.teamId === activeTeam.id && s.missionNumber === 2);
  const sub4 = state.submissions.find(s => s.teamId === activeTeam.id && s.missionNumber === 4);
  const sub5 = state.submissions.find(s => s.teamId === activeTeam.id && s.missionNumber === 5);

  const plannedCost = (sub2?.payload as any)?.hppPerUnit || 6000;
  const actualUnits = (sub4?.payload as any)?.actualBatchUnits || activeTeam.targetBatchUnits || 30;
  const fpy = (sub5?.payload as any)?.firstPassYieldPercent || 90;

  const initialPayload: Mission6Submission = (existingSub?.payload as Mission6Submission) || {
    finalProductName: activeTeam.productName,
    finalProductDescription: 'Produk inovatif skala kecil hasil riset formulasi SMK Kesehatan Fania Salsabila: aman untuk kulit sensitif, higienis, berstandar mutu farmasi, dan memiliki nilai jual wirausaha yang tinggi.',
    totalBatchCompleted: actualUnits,
    finalFPYPercent: fpy,
    actualCostPerUnit: plannedCost,
    plannedCostPerUnit: plannedCost,
    costVariancePercent: 0,
    finalGalleryUrls: [],
    keyImprovementsMade: 'Penyempurnaan formula pengemulsi minyak atsiri pada Home Lab, penerapan SOP corong anti-drip pada tahap filling, dan pengetatan uji balik 10 menit.',
    teamPresentationSummary: 'Produk kami siap bersaing di pasar komunitas sekolah dan apotek mitra karena memiliki HPP kompetitif, kemasan higienis, dan lolos verifikasi mutu 90% FPY.',
    individualReflections: [
      {
        studentName: activeTeam.leaderName || 'Anisa Rahmawati',
        whatLearned: 'Belajar bahwa menjaga konsistensi mutu produk massal jauh lebih menantang daripada membuat satu prototipe di lab, karena membutuhkan disiplin SOP yang ketat di setiap langkah.',
        biggestObstacle: 'Menjaga takaran isi tetap presisi 60ml per botol secara cepat tanpa terjadi tetesan yang mengotori botol.',
        futureImprovement: 'Ingin berinvestasi pada alat filler otomatis semi-manual dan mengurus legalitas izin edar BPOM/PIRT untuk wirausaha rintisan.',
      },
    ],
  };

  const [formData, setFormData] = useState<Mission6Submission>(initialPayload);
  const [activeTab, setActiveTab] = useState<'showcase' | 'metrik' | 'refleksi' | 'presentasi'>('showcase');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleAddReflection = () => {
    setFormData(prev => ({
      ...prev,
      individualReflections: [
        ...prev.individualReflections,
        { studentName: '', whatLearned: '', biggestObstacle: '', futureImprovement: '' },
      ],
    }));
  };

  const handleRemoveReflection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      individualReflections: prev.individualReflections.filter((_, i) => i !== index),
    }));
  };

  const handleReflectionChange = (index: number, field: string, val: string) => {
    const updated = [...formData.individualReflections];
    updated[index] = { ...updated[index], [field]: val };
    setFormData(prev => ({ ...prev, individualReflections: updated }));
  };

  const handleCostVarianceChange = (actual: number, planned: number) => {
    const diff = planned > 0 ? Math.round(((actual - planned) / planned) * 1000) / 10 : 0;
    setFormData(prev => ({
      ...prev,
      actualCostPerUnit: actual,
      plannedCostPerUnit: planned,
      costVariancePercent: diff,
    }));
  };

  const handleSaveDraft = () => {
    onSaveSubmission(formData, false);
    setSaveNotice('Draf Misi 6 (Virtual Festival) berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSubmitToTeacher = () => {
    if (!formData.finalProductName.trim()) {
      alert('Nama produk akhir tidak boleh kosong!');
      return;
    }
    if (formData.individualReflections.length === 0) {
      alert('Sediakan minimal 1 refleksi belajar siswa!');
      return;
    }
    onSaveSubmission(formData, true);
    setSaveNotice('Misi 6 berhasil dikumpulkan ke Guru A. Rahman!');
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
              <span>MISI 6 — MQ-06 (PUNCAK AMAZING RACE)</span>
              <span>·</span>
              <span>ESTIMASI: 60 MENIT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Virtual Product Festival — Gelar Karya & Refleksi</h1>
            <p className="text-sm text-slate-300">
              Puncak perjalanan kewirausahaan: Pamerkan produk akhir kelompok, pertanggungjawabkan data produksi & HPP riil, dan selesaikan refleksi individu pembelajaran KIK.
            </p>
          </div>

          <div className="bg-slate-950 border border-purple-500/40 rounded-xl p-4 text-center shrink-0">
            <span className="text-xs text-slate-400 block">Status Ekspedisi</span>
            <span className="text-xl font-bold text-teal-300 flex items-center justify-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Gelar Karya Final</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('showcase')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'showcase'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          1. Showcase Produk Akhir
        </button>
        <button
          onClick={() => setActiveTab('metrik')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'metrik'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          2. Rekapitulasi Metrik Riil
        </button>
        <button
          onClick={() => setActiveTab('refleksi')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'refleksi'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          3. Refleksi Individu Siswa
        </button>
        <button
          onClick={() => setActiveTab('presentasi')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'presentasi'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          4. Ringkasan Presentasi Tim
        </button>
      </div>

      {/* Tab 1: Showcase Produk */}
      {activeTab === 'showcase' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Profil & Deskripsi Komersial Produk</h2>
            <p className="text-xs text-slate-400">
              Perkenalkan nama produk akhir, keunggulan nilai jualnya, serta perbaikan penting yang telah berhasil dilakukan sejak prototipe awal.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nama Produk Komersial Resmi:
              </label>
              <input
                type="text"
                value={formData.finalProductName}
                onChange={(e) => setFormData(prev => ({ ...prev, finalProductName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 text-sm font-bold text-white rounded-lg px-3.5 py-2 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Deskripsi Produk & Nilai Jual Wirausaha (Value Proposition):
              </label>
              <textarea
                rows={4}
                value={formData.finalProductDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, finalProductDescription: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-slate-200 focus:border-teal-400 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tindakan Perbaikan Kunci (Key Improvements) yang Diberlakukan:
              </label>
              <textarea
                rows={3}
                value={formData.keyImprovementsMade}
                onChange={(e) => setFormData(prev => ({ ...prev, keyImprovementsMade: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-teal-300 focus:border-teal-400 focus:outline-none leading-relaxed"
                placeholder="Rangkum evolusi mutu produk dari temuan cacat di Misi 1 & 3 hingga batch stabil di Misi 4 & 5..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rekapitulasi Metrik Riil */}
      {activeTab === 'metrik' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Rekapitulasi Kinerja Produksi & Pengendalian Biaya</h2>
            <p className="text-xs text-slate-400">
              Evaluasi ketercapaian target batch, konsistensi First Pass Yield (FPY), serta perbandingan HPP rencana vs aktual.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
              <span className="text-xs text-slate-400 block">Total Unit Selesai:</span>
              <span className="text-2xl font-mono font-bold text-white">
                {formData.totalBatchCompleted} Unit
              </span>
              <span className="text-[11px] text-slate-500 block">Target: {activeTeam.targetBatchUnits}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
              <span className="text-xs text-slate-400 block">First Pass Yield (FPY):</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {formData.finalFPYPercent}%
              </span>
              <span className="text-[11px] text-slate-500 block">Konsistensi Mutu</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
              <label className="text-xs text-slate-400 block">HPP Rencana (Misi 2):</label>
              <input
                type="number"
                value={formData.plannedCostPerUnit}
                onChange={(e) => handleCostVarianceChange(formData.actualCostPerUnit, Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-white rounded px-2 py-1"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
              <label className="text-xs text-slate-400 block">HPP Aktual Riil:</label>
              <input
                type="number"
                value={formData.actualCostPerUnit}
                onChange={(e) => handleCostVarianceChange(Number(e.target.value), formData.plannedCostPerUnit)}
                className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-teal-400 rounded px-2 py-1 font-bold"
              />
              <span className={`text-[11px] font-mono block ${formData.costVariancePercent <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Variansi: {formData.costVariancePercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Refleksi Individu Siswa */}
      {activeTab === 'refleksi' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Refleksi Belajar Individu Siswa SMK</h2>
              <p className="text-xs text-slate-400">
                Setiap siswa menuangkan pengalaman belajar bermakna, tantangan terbesar yang dihadapi, dan rencana tindak lanjut perbaikan diri.
              </p>
            </div>
            <button
              onClick={handleAddReflection}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>

          <div className="space-y-5">
            {formData.individualReflections.map((ref, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block mb-1">Nama Siswa SMK:</label>
                    <input
                      type="text"
                      value={ref.studentName}
                      onChange={(e) => handleReflectionChange(idx, 'studentName', e.target.value)}
                      placeholder="Nama lengkap siswa..."
                      className="w-full bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded px-3 py-1.5"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveReflection(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      1. Apa wawasan dan kompetensi terpenting yang Anda pelajari selama 6 misi?
                    </label>
                    <textarea
                      rows={2}
                      value={ref.whatLearned}
                      onChange={(e) => handleReflectionChange(idx, 'whatLearned', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      2. Apa kendala / tantangan paling berat yang dialami di meja produksi?
                    </label>
                    <textarea
                      rows={2}
                      value={ref.biggestObstacle}
                      onChange={(e) => handleReflectionChange(idx, 'biggestObstacle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      3. Jika kelak Anda merintis usaha produksi massal mandiri, apa hal utama yang akan diperbaiki?
                    </label>
                    <textarea
                      rows={2}
                      value={ref.futureImprovement}
                      onChange={(e) => handleReflectionChange(idx, 'futureImprovement', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-teal-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Ringkasan Presentasi Tim */}
      {activeTab === 'presentasi' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Ringkasan Materi Presentasi Gelar Karya Kelompok</h2>
            <p className="text-xs text-slate-400">
              Tuliskan poin-poin utama yang akan dipresentasikan kelompok di hadapan Guru A. Rahman dan rekan-rekan sekelas.
            </p>
          </div>

          <textarea
            rows={7}
            value={formData.teamPresentationSummary}
            onChange={(e) => setFormData(prev => ({ ...prev, teamPresentationSummary: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 text-xs md:text-sm rounded-lg p-3.5 text-white focus:border-teal-400 focus:outline-none leading-relaxed"
            placeholder="Jelaskan alasan memilih produk, strategi harga, kepatuhan SOP K3, hasil First Pass Yield, dan target pasar riil..."
          />
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
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-teal-500 to-indigo-500 hover:opacity-90 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kumpulkan Misi 6 (Selesaikan Quest!)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
