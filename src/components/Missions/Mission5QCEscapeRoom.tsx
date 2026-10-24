import React, { useState } from 'react';
import { AppState, Team, Mission5Submission } from '../../types';
import {
  ShieldCheck,
  Calculator,
  GitBranch,
  FileCheck,
  Save,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertOctagon,
  Percent,
  Plus,
  Trash2
} from 'lucide-react';

interface Mission5Props {
  state: AppState;
  activeTeam: Team;
  onBack: () => void;
  onSaveSubmission: (submission: any, isFinalSubmit: boolean) => void;
}

export const Mission5QCEscapeRoom: React.FC<Mission5Props> = ({
  state,
  activeTeam,
  onBack,
  onSaveSubmission,
}) => {
  const existingSub = state.submissions.find(
    s => s.teamId === activeTeam.id && s.missionNumber === 5
  );

  const initialPayload: Mission5Submission = (existingSub?.payload as Mission5Submission) || {
    totalInspected: activeTeam.targetBatchUnits || 30,
    passedFirstInspectionCount: Math.round((activeTeam.targetBatchUnits || 30) * 0.9),
    reworkCount: Math.round((activeTeam.targetBatchUnits || 30) * 0.07),
    rejectCount: Math.max(0, (activeTeam.targetBatchUnits || 30) - Math.round((activeTeam.targetBatchUnits || 30) * 0.9) - Math.round((activeTeam.targetBatchUnits || 30) * 0.07)),
    firstPassYieldPercent: 90,
    fiveWhyAnalysis: {
      problemStatement: 'Terdapat 2 botol mengalami rembesan cairan pada leher ulir spray saat dilakukan uji balik 10 menit.',
      why1: 'Mengapa leher botol rembes? Karena tutup spray tidak terpasang kencang hingga batas ulir maksimal.',
      why2: 'Mengapa tutup tidak terpasang kencang? Karena operator memutar tutup secara manual dengan tangan yang licin terkena tetesan gliserin.',
      why3: 'Mengapa tangan operator licin terkena tetesan? Karena saat proses filling tidak menggunakan corong/dispenser anti-drip.',
      why4: 'Mengapa tidak menggunakan dispenser anti-drip? Karena alat dispenser belum disiapkan di workstation pengisian.',
      why5: 'Mengapa belum disiapkan? Karena checklist persiapan alat pada SOP belum mencantumkan corong anti-drip secara eksplisit.',
      rootCause: 'SOP pengisian (filling) belum mencantumkan instruksi wajib penggunaan corong anti-drip dan pembersihan botol sebelum penguncian cap.',
    },
    capaPlan: [
      {
        correctiveAction: 'Membuka dan membersihkan leher ulir 2 botol yang rembes, lalu mengencangkan kembali dengan sarung tangan karet bertekstur grip.',
        preventiveAction: 'Merevisi lembar SOP Tahap 4 dengan menambahkan langkah wajib pemasangan corong silikon anti-drip dan penyediaan kain lap mikrofiber khusus.',
        pic: 'Anisa Rahmawati (PIC QC)',
        deadline: 'Sebelum produksi batch berikutnya',
      },
    ],
    evidenceNotes: 'Inspeksi dilakukan 100% (seluruh unit batch). Didapatkan 27 unit lulus langsung (FPY 90%), 2 unit rework (tutup dikencangkan ulang dan lulus uji kedua), 1 unit botol reject karena retak rambut di dasar botol.',
  };

  const [formData, setFormData] = useState<Mission5Submission>(initialPayload);
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Auto calculate FPY
  const handleCountsChange = (inspected: number, passedFirst: number, rework: number, reject: number) => {
    const validInspected = Math.max(1, inspected);
    const fpy = Math.round((passedFirst / validInspected) * 1000) / 10;

    setFormData(prev => ({
      ...prev,
      totalInspected: validInspected,
      passedFirstInspectionCount: passedFirst,
      reworkCount: rework,
      rejectCount: reject,
      firstPassYieldPercent: Math.min(100, Math.max(0, fpy)),
    }));
  };

  const handleAddCapa = () => {
    setFormData(prev => ({
      ...prev,
      capaPlan: [
        ...prev.capaPlan,
        { correctiveAction: '', preventiveAction: '', pic: '', deadline: '' },
      ],
    }));
  };

  const handleRemoveCapa = (index: number) => {
    setFormData(prev => ({
      ...prev,
      capaPlan: prev.capaPlan.filter((_, i) => i !== index),
    }));
  };

  const handleCapaChange = (index: number, field: string, val: string) => {
    const updated = [...formData.capaPlan];
    updated[index] = { ...updated[index], [field]: val };
    setFormData(prev => ({ ...prev, capaPlan: updated }));
  };

  const handleSaveDraft = () => {
    onSaveSubmission(formData, false);
    setSaveNotice('Draf Misi 5 (QC Escape Room) berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSubmitToTeacher = () => {
    if (!formData.fiveWhyAnalysis.rootCause.trim()) {
      alert('Lengkapi akar masalah utama pada analisis 5-Why!');
      return;
    }
    if (formData.capaPlan.length === 0) {
      alert('Sediakan minimal 1 rencana tindakan korektif dan preventif (CAPA)!');
      return;
    }
    onSaveSubmission(formData, true);
    setSaveNotice('Misi 5 berhasil dikumpulkan ke Guru A. Rahman!');
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
              <span>MISI 5 — MQ-05</span>
              <span>·</span>
              <span>ESTIMASI: 75 MENIT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Virtual QC Escape Room — Kendali Mutu & Analisis Akar Masalah</h1>
            <p className="text-sm text-slate-300">
              Selesaikan 4 tantangan ruang kendali mutu: Uji spesifikasi, hitung persentase First Pass Yield (FPY), pecahkan akar masalah dengan 5-Why, dan rumuskan tindakan korektif (CAPA).
            </p>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 text-right shrink-0">
            <span className="text-xs text-slate-400 block">First Pass Yield (FPY)</span>
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {formData.firstPassYieldPercent}%
            </span>
            <span className="text-[11px] text-teal-300 block">
              {formData.firstPassYieldPercent >= 90 ? 'Sangat Baik (World Class)' : formData.firstPassYieldPercent >= 80 ? 'Standar Baik' : 'Perlu Peningkatan'}
            </span>
          </div>
        </div>
      </div>

      {/* 4-Stage Progress Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveStage(1)}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            activeStage === 1
              ? 'bg-slate-900 border-teal-400 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-mono text-teal-400 block font-semibold">TANTANGAN 1</span>
          <span className="text-xs font-bold text-white">Uji Spesifikasi</span>
        </button>

        <button
          onClick={() => setActiveStage(2)}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            activeStage === 2
              ? 'bg-slate-900 border-teal-400 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-mono text-teal-400 block font-semibold">TANTANGAN 2</span>
          <span className="text-xs font-bold text-white">Kalkulasi FPY %</span>
        </button>

        <button
          onClick={() => setActiveStage(3)}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            activeStage === 3
              ? 'bg-slate-900 border-teal-400 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-mono text-teal-400 block font-semibold">TANTANGAN 3</span>
          <span className="text-xs font-bold text-white">Analisis 5-Why</span>
        </button>

        <button
          onClick={() => setActiveStage(4)}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            activeStage === 4
              ? 'bg-slate-900 border-teal-400 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-mono text-teal-400 block font-semibold">TANTANGAN 4</span>
          <span className="text-xs font-bold text-white">Rencana CAPA</span>
        </button>
      </div>

      {/* Stage 1: Uji Spesifikasi Fisik & Organoleptik */}
      {activeStage === 1 && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Tantangan 1: Inspeksi Spesifikasi Fisik & Organoleptik</h2>
            <p className="text-xs text-slate-400">
              Lakukan pemeriksaan menyeluruh pada unit produk batch terhadap standar mutu yang telah ditetapkan di Misi 1.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-bold text-teal-300 block">1. Parameter Volume Netto & Bobot</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Toleransi isi: Maksimal deviasi ± 2%. Setiap botol harus ditimbang atau diukur tinggi cairannya terhadap garis batas tera.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-bold text-teal-300 block">2. Uji Kebocoran Segel (Inverted Leak Test)</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Botol diletakkan terbalik di atas kertas saring selama 10 menit. Tidak boleh ada noda basah atau tetesan cairan sama sekali.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-bold text-teal-300 block">3. Kejernihan & Homogenitas</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pemeriksaan di depan latar putih berlampu. Cairan tidak boleh memiliki partikel melayang atau pemisahan fase minyak-air.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-bold text-teal-300 block">4. Presisi Label & Kelengkapan Informasi</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Label terpasang simetris, tidak ada lipatan udara, tulisan komposisi, nomor batch, dan tanggal kadaluarsa tercetak tajam.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Catatan Bukti Hasil Pengamatan Spesifikasi:
            </label>
            <textarea
              rows={4}
              value={formData.evidenceNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, evidenceNotes: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-white leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Stage 2: Kalkulator First Pass Yield (FPY %) */}
      {activeStage === 2 && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Tantangan 2: Perhitungan First Pass Yield (FPY %)</h2>
            <p className="text-xs text-slate-400">
              First Pass Yield (FPY) adalah metrik industri manufaktur kelas dunia yang mengukur persentase unit produk yang lolos pemeriksaan pertama kali tanpa perlu perbaikan ulang (rework).
            </p>
          </div>

          <div className="bg-slate-950 border border-teal-500/30 rounded-xl p-4 text-xs space-y-2">
            <span className="font-mono font-bold text-teal-300 block">
              Rumus FPY: (Jumlah Unit Lolos Pemeriksaan Pertama ÷ Total Unit Diperiksa) × 100%
            </span>
            <p className="text-slate-400 leading-relaxed">
              Unit Rework adalah produk yang mengalami cacat ringan dan dapat diperbaiki (misal: tutup dikencangkan ulang, label diganti). Unit Reject adalah produk cacat fatal yang tidak dapat diselamatkan (misal: botol pecah, formula terkontaminasi).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <label className="text-xs text-slate-400 block">Total Batch Diperiksa:</label>
              <input
                type="number"
                min={1}
                value={formData.totalInspected}
                onChange={(e) => handleCountsChange(Number(e.target.value), formData.passedFirstInspectionCount, formData.reworkCount, formData.rejectCount)}
                className="w-full bg-slate-900 border border-slate-700 font-mono font-bold text-white text-base rounded px-2.5 py-1.5"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <label className="text-xs text-emerald-400 block font-semibold">Lulus Pertama (FPY):</label>
              <input
                type="number"
                min={0}
                value={formData.passedFirstInspectionCount}
                onChange={(e) => handleCountsChange(formData.totalInspected, Number(e.target.value), formData.reworkCount, formData.rejectCount)}
                className="w-full bg-slate-900 border border-emerald-700/60 font-mono font-bold text-emerald-300 text-base rounded px-2.5 py-1.5"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <label className="text-xs text-amber-400 block">Perlu Perbaikan (Rework):</label>
              <input
                type="number"
                min={0}
                value={formData.reworkCount}
                onChange={(e) => handleCountsChange(formData.totalInspected, formData.passedFirstInspectionCount, Number(e.target.value), formData.rejectCount)}
                className="w-full bg-slate-900 border border-amber-700/60 font-mono font-bold text-amber-300 text-base rounded px-2.5 py-1.5"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <label className="text-xs text-rose-400 block">Cacat Fatal (Reject):</label>
              <input
                type="number"
                min={0}
                value={formData.rejectCount}
                onChange={(e) => handleCountsChange(formData.totalInspected, formData.passedFirstInspectionCount, formData.reworkCount, Number(e.target.value))}
                className="w-full bg-slate-900 border border-rose-700/60 font-mono font-bold text-rose-300 text-base rounded px-2.5 py-1.5"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Hasil Perhitungan First Pass Yield (FPY):</span>
            <span className="text-2xl font-mono font-extrabold text-teal-400">
              {formData.firstPassYieldPercent}%
            </span>
          </div>
        </div>
      )}

      {/* Stage 3: Analisis 5-Why (Akar Masalah) */}
      {activeStage === 3 && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Tantangan 3: Analisis Akar Masalah (5-Why Analysis)</h2>
            <p className="text-xs text-slate-400">
              Telusuri mengapa ketidaksesuaian/cacat terjadi secara mendalam hingga ke akar sistemik, bukan sekadar menyalahkan operator.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Pernyataan Masalah (Problem Statement):
              </label>
              <input
                type="text"
                value={formData.fiveWhyAnalysis.problemStatement}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  fiveWhyAnalysis: { ...prev.fiveWhyAnalysis, problemStatement: e.target.value }
                }))}
                className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white font-semibold"
              />
            </div>

            <div className="space-y-3 pl-4 border-l-2 border-indigo-500/50">
              <div>
                <label className="text-xs text-indigo-300 font-mono font-bold block mb-1">Why 1 (Mengapa Masalah Ini Muncul?):</label>
                <input
                  type="text"
                  value={formData.fiveWhyAnalysis.why1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fiveWhyAnalysis: { ...prev.fiveWhyAnalysis, why1: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-indigo-300 font-mono font-bold block mb-1">Why 2 (Mengapa Hal Tersebut Terjadi?):</label>
                <input
                  type="text"
                  value={formData.fiveWhyAnalysis.why2}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fiveWhyAnalysis: { ...prev.fiveWhyAnalysis, why2: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-indigo-300 font-mono font-bold block mb-1">Why 3 (Mengapa Faktor Tersebut Terlewatkan?):</label>
                <input
                  type="text"
                  value={formData.fiveWhyAnalysis.why3}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fiveWhyAnalysis: { ...prev.fiveWhyAnalysis, why3: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-indigo-300 font-mono font-bold block mb-1">Why 4 (Mengapa Alat/Prosedur Tidak Mencegahnya?):</label>
                <input
                  type="text"
                  value={formData.fiveWhyAnalysis.why4}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fiveWhyAnalysis: { ...prev.fiveWhyAnalysis, why4: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-indigo-300 font-mono font-bold block mb-1">Why 5 (Mengapa Standar Kerja Belum Mengatur Hal Ini?):</label>
                <input
                  type="text"
                  value={formData.fiveWhyAnalysis.why5}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fiveWhyAnalysis: { ...prev.fiveWhyAnalysis, why5: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-teal-500/40 rounded-xl space-y-1">
              <label className="text-xs font-bold text-teal-400 block">
                Akar Penyebab Utama (Root Cause):
              </label>
              <textarea
                rows={2}
                value={formData.fiveWhyAnalysis.rootCause}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  fiveWhyAnalysis: { ...prev.fiveWhyAnalysis, rootCause: e.target.value }
                }))}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-2 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stage 4: Rencana CAPA (Corrective & Preventive Action) */}
      {activeStage === 4 && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Tantangan 4: Rencana Tindakan Korektif & Preventif (CAPA)</h2>
              <p className="text-xs text-slate-400">
                Susun tindakan nyata untuk memperbaiki unit cacat saat ini (Korektif) dan mencegah terulangnya cacat di masa depan (Preventif).
              </p>
            </div>
            <button
              onClick={handleAddCapa}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah CAPA</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.capaPlan.map((c, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-400">
                    Aksi CAPA #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveCapa(idx)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Tindakan Korektif (Perbaikan Unit Cacat Sekarang):</label>
                    <textarea
                      rows={2}
                      value={c.correctiveAction}
                      onChange={(e) => handleCapaChange(idx, 'correctiveAction', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tindakan Preventif (Pencegahan Sistemik Masa Depan):</label>
                    <textarea
                      rows={2}
                      value={c.preventiveAction}
                      onChange={(e) => handleCapaChange(idx, 'preventiveAction', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-teal-300"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Penanggung Jawab (PIC):</label>
                    <input
                      type="text"
                      value={c.pic}
                      onChange={(e) => handleCapaChange(idx, 'pic', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tenggat Waktu (Deadline):</label>
                    <input
                      type="text"
                      value={c.deadline}
                      onChange={(e) => handleCapaChange(idx, 'deadline', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
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
            <span>Kumpulkan Misi 5 ke Guru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
