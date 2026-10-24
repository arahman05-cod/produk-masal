import React, { useState } from 'react';
import { AppState, Team, Mission1Submission, MissionStatus, FeedbackRecord } from '../../types';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Send,
  HelpCircle,
  Plus,
  Trash2,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

interface Mission1Props {
  state: AppState;
  activeTeam: Team;
  onBack: () => void;
  onSaveSubmission: (submission: any, isFinalSubmit: boolean) => void;
}

export const Mission1MysteryHunt: React.FC<Mission1Props> = ({
  state,
  activeTeam,
  onBack,
  onSaveSubmission,
}) => {
  const existingSub = state.submissions.find(
    s => s.teamId === activeTeam.id && s.missionNumber === 1
  );

  const initialPayload: Mission1Submission = (existingSub?.payload as Mission1Submission) || {
    prototypeName: activeTeam.productName,
    prototypeSpecs: {
      physical: 'Cairan/produk homogen, warna jernih tidak berbutir kasar, volume netto presisi sesuai kemasan.',
      sensory: 'Aroma segar khas bahan alami, tidak berbau tengik/menyengat, tekstur nyaman tidak lengket di kulit.',
      packaging: 'Kemasan primer botol/pouch kedap udara, tutup rapat anti-bocor, label tahan basah.',
      safetyTolerances: 'Bahan baku food-grade/farmasi terstandar, pH seimbang (5.5 - 6.5), masa simpan teruji.',
    },
    defectFindings: [
      {
        defectName: 'Kebocoran tutup kemasan saat dibalik',
        description: 'Drat tutup tidak presisi sehingga cairan merembes saat diletakkan horizontal.',
        severity: 'kritis',
      },
      {
        defectName: 'Gelembung udara berlebih pada cairan',
        description: 'Pengadukan terlalu cepat menyebabkan buih yang lambat hilang.',
        severity: 'sedang',
      },
    ],
    qualityStandardDraft: 'Standar Kelulusan Batch: (1) Bebas endapan partikel kasar, (2) Uji balik 10 menit tanpa bocor, (3) Label simetris & terbaca jelas, (4) pH toleransi 5.5-6.5.',
    quizScore: 0,
  };

  const [formData, setFormData] = useState<Mission1Submission>(initialPayload);
  const [activeTab, setActiveTab] = useState<'spek' | 'kuis' | 'cacat' | 'standar'>('spek');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Detective Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(formData.quizScore > 0);

  const quizQuestions = [
    {
      id: 1,
      question: 'Sampel cairan pembersih tangan menunjukkan nilai pH 8.8 pada kertas indikator. Apakah produk ini memenuhi spesifikasi mutu untuk kulit?',
      options: [
        'Lulus, karena pH basa membunuh lebih banyak kuman dengan cepat.',
        'Tidak Lulus, karena pH ideal kulit adalah 5.5 - 6.5 dan pH 8.8 dapat menyebabkan iritasi parah.',
        'Lulus bersyarat, asalkan aroma jeruk nipis masih wangi.',
        'Tidak perlu diuji karena pH tidak mempengaruhi keamanan produk.',
      ],
      correctIndex: 1,
      explanation: 'pH kulit manusia bersifat sedikit asam (5.5 - 6.5). Produk topikal dengan pH terlalu basa (8.8) akan merusak lapisan lipid pelindung kulit dan memicu dermatitis.',
    },
    {
      id: 2,
      question: 'Saat menguji 10 botol sampel prototipe dengan membalikkan botol selama 5 menit, ditemukan 2 botol mengalami rembesan cairan pada leher tutup. Apa kategori cacat ini?',
      options: [
        'Cacat Rendah (Minor), karena hanya rembesan kecil.',
        'Bukan Cacat, cukup dilap dengan tisu sebelum dijual.',
        'Cacat Kritis (Critical Defect), karena kemasan bocor merusak stabilitas isi dan mengotori saat distribusi.',
        'Cacat Estetika, tidak berpengaruh pada kepuasan konsumen.',
      ],
      correctIndex: 2,
      explanation: 'Kebocoran kemasan adalah cacat kritis (Critical Defect) karena berisiko mengontaminasi produk, mengurangi volume netto, dan merusak kemasan luar saat pengiriman.',
    },
    {
      id: 3,
      question: 'Mengapa penetapan standar mutu (Quality Standard) harus disusun SEBELUM memulai produksi massal skala kecil?',
      options: [
        'Hanya untuk formalitas kelengkapan berkas guru.',
        'Sebagai acuan objektif tim dalam memilah unit lulus (FPY) dan unit cacat (rework/reject) selama proses.',
        'Agar tim bisa mengubah ukuran produk sesuka hati jika bahan kurang.',
        'Untuk menaikkan harga jual setinggi mungkin tanpa alasan teknis.',
      ],
      correctIndex: 1,
      explanation: 'Standar mutu menjadi kompas kendali mutu (Quality Control) agar setiap unit yang diproduksi memiliki konsistensi ukuran, formula, dan keamanan bagi konsumen.',
    },
  ];

  const handleSelectQuiz = (qId: number, optIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleCheckQuiz = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score += Math.round(100 / quizQuestions.length);
      }
    });
    setFormData(prev => ({ ...prev, quizScore: score }));
    setQuizSubmitted(true);
  };

  const handleAddDefect = () => {
    setFormData(prev => ({
      ...prev,
      defectFindings: [
        ...prev.defectFindings,
        { defectName: '', description: '', severity: 'sedang' },
      ],
    }));
  };

  const handleRemoveDefect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      defectFindings: prev.defectFindings.filter((_, i) => i !== index),
    }));
  };

  const handleDefectChange = (index: number, field: string, value: any) => {
    const updated = [...formData.defectFindings];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, defectFindings: updated }));
  };

  const handleSaveDraft = () => {
    onSaveSubmission(formData, false);
    setSaveSuccessNotice('Draf Misi 1 berhasil disimpan ke database lokal!');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleSubmitToTeacher = () => {
    if (!formData.prototypeName.trim()) {
      alert('Mohon isi nama prototipe yang divalidasi!');
      return;
    }
    if (!formData.qualityStandardDraft.trim()) {
      alert('Mohon lengkapi draf standar mutu batch!');
      return;
    }
    onSaveSubmission(formData, true);
    setSaveSuccessNotice('Misi 1 berhasil dikumpulkan ke Guru A. Rahman!');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
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
              <span>MISI 1 — MQ-01</span>
              <span>·</span>
              <span>ESTIMASI: 60 MENIT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Digital Mystery Hunt — Investigasi Prototipe</h1>
            <p className="text-sm text-slate-300">
              Pelajari prototipe produk kelompok yang telah divalidasi, temukan ketidaksesuaian/cacat pada sampel uji, dan tetapkan standar mutu batch.
            </p>
          </div>

          {existingSub?.finalScore !== undefined && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-3 text-center shrink-0">
              <span className="text-xs text-slate-400 block">Nilai Misi 1</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {existingSub.finalScore} / 100
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Feedback Alert if exists */}
      {existingSub?.feedbacks && existingSub.feedbacks.length > 0 && (
        <div className="bg-slate-900/90 border border-teal-500/40 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-teal-300 text-sm font-semibold">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span>Catatan Evaluasi Guru ({existingSub.feedbacks[existingSub.feedbacks.length - 1].teacherName})</span>
            <span className="text-xs text-slate-400">· {new Date(existingSub.feedbacks[existingSub.feedbacks.length - 1].date).toLocaleString('id-ID')}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed pl-6 border-l-2 border-teal-500">
            "{existingSub.feedbacks[existingSub.feedbacks.length - 1].comment}"
          </p>
        </div>
      )}

      {/* Interactive Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('spek')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'spek'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          1. Spesifikasi Prototipe
        </button>
        <button
          onClick={() => setActiveTab('kuis')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'kuis'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          2. Kuis Detektif Mutu
        </button>
        <button
          onClick={() => setActiveTab('cacat')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'cacat'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          3. Temuan Cacat Sampel
        </button>
        <button
          onClick={() => setActiveTab('standar')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'standar'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          4. Standar Mutu Batch
        </button>
      </div>

      {/* Tab 1: Spesifikasi Prototipe */}
      {activeTab === 'spek' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Spesifikasi Prototipe Tervalidasi</h2>
            <p className="text-xs text-slate-400">
              Deskripsikan karakteristik produk prototipe yang telah diuji dan divalidasi oleh pembimbing/ahli sebelum memasuki fase produksi massal.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nama Produk & Prototipe:
              </label>
              <input
                type="text"
                value={formData.prototypeName}
                onChange={(e) => setFormData(prev => ({ ...prev, prototypeName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 text-sm rounded-lg px-3.5 py-2 text-white focus:border-teal-400 focus:outline-none"
                placeholder="Contoh: BioCitrus Spray 60ml Prototipe Batch A"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  A. Spesifikasi Fisik (Bentuk, Warna, Viskositas, Netto):
                </label>
                <textarea
                  rows={3}
                  value={formData.prototypeSpecs.physical}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    prototypeSpecs: { ...prev.prototypeSpecs, physical: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  B. Spesifikasi Sensori & Organoleptik (Aroma, Tekstur, Rasa/Sentuhan):
                </label>
                <textarea
                  rows={3}
                  value={formData.prototypeSpecs.sensory}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    prototypeSpecs: { ...prev.prototypeSpecs, sensory: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  C. Spesifikasi Kemasan & Pelabelan (Bahan, Tutup, Label, Segel):
                </label>
                <textarea
                  rows={3}
                  value={formData.prototypeSpecs.packaging}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    prototypeSpecs: { ...prev.prototypeSpecs, packaging: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  D. Batas Toleransi Mutu & Keamanan KIK (pH, Suhu, Kadar Bahan Aktif):
                </label>
                <textarea
                  rows={3}
                  value={formData.prototypeSpecs.safetyTolerances}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    prototypeSpecs: { ...prev.prototypeSpecs, safetyTolerances: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kuis Detektif Mutu */}
      {activeTab === 'kuis' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Kuis Detektif Mutu (Quality Sleuth)</h2>
              <p className="text-xs text-slate-400">
                Uji kepekaan tim dalam menganalisis sampel produk cacat dan menentukan keputusan kendali mutu.
              </p>
            </div>
            {quizSubmitted && (
              <span className="text-sm font-mono font-bold text-teal-300 bg-slate-950 border border-teal-500/40 px-3 py-1 rounded-lg">
                Skor Kuis: {formData.quizScore}%
              </span>
            )}
          </div>

          <div className="space-y-5">
            {quizQuestions.map((q) => {
              const selectedOpt = quizAnswers[q.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">
                    {q.id}. {q.question}
                  </h3>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectQuiz(q.id, optIdx)}
                          className={`w-full text-left text-xs p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-indigo-950/70 border-teal-400 text-teal-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                            isSelected ? 'bg-teal-500 text-slate-950 border-teal-400' : 'border-slate-600 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                      isCorrect ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
                    }`}>
                      <strong>{isCorrect ? 'Benar!' : 'Kurang Tepat.'}</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleCheckQuiz}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {quizSubmitted ? 'Periksa Kembali Jawaban' : 'Kirim & Periksa Jawaban Kuis'}
          </button>
        </div>
      )}

      {/* Tab 3: Temuan Cacat Sampel */}
      {activeTab === 'cacat' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Analisis Ketidaksesuaian Sampel Produk</h2>
              <p className="text-xs text-slate-400">
                Catat setiap cacat atau penyimpangan yang ditemukan pada sampel uji prototipe beserta tingkat keparahannya.
              </p>
            </div>
            <button
              onClick={handleAddDefect}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Temuan Cacat</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.defectFindings.map((defect, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={defect.defectName}
                      onChange={(e) => handleDefectChange(idx, 'defectName', e.target.value)}
                      placeholder="Nama Cacat (Misal: Stiker miring, tutup rembes, suspensi memisah)"
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded-md px-3 py-1.5 text-white font-semibold focus:border-teal-400 focus:outline-none"
                    />
                  </div>

                  <div className="w-36">
                    <select
                      value={defect.severity}
                      onChange={(e) => handleDefectChange(idx, 'severity', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded-md px-2.5 py-1.5 text-white focus:border-teal-400 focus:outline-none cursor-pointer"
                    >
                      <option value="rendah">Tingkat Rendah</option>
                      <option value="sedang">Tingkat Sedang</option>
                      <option value="kritis">Tingkat Kritis</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleRemoveDefect(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Hapus Temuan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={defect.description}
                  onChange={(e) => handleDefectChange(idx, 'description', e.target.value)}
                  placeholder="Jelaskan bagaimana cacat terdeteksi dan apa dampak buruknya bila lolos ke tangan konsumen..."
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-md p-2.5 text-slate-300 focus:border-teal-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Standar Mutu Batch */}
      {activeTab === 'standar' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Perumusan Standar Mutu Batch (Quality Acceptance Criteria)</h2>
            <p className="text-xs text-slate-400">
              Berdasarkan analisis spesifikasi dan deteksi cacat, tetapkan aturan tegas standar kelulusan produk yang wajib dipatuhi tim pada produksi massal nanti.
            </p>
          </div>

          <textarea
            rows={6}
            value={formData.qualityStandardDraft}
            onChange={(e) => setFormData(prev => ({ ...prev, qualityStandardDraft: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 text-xs md:text-sm rounded-lg p-3.5 text-white focus:border-teal-400 focus:outline-none leading-relaxed"
            placeholder="Tuliskan butir-butir standar mutu batch: 1. Bebas partikel kontaminan, 2. Batas toleransi netto, 3. Hasil uji coba semprotan/kemasan, 4. Penempelan label..."
          />
        </div>
      )}

      {/* Save Success Notice */}
      {saveSuccessNotice && (
        <div className="p-3 bg-teal-950 border border-teal-500 rounded-lg text-teal-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{saveSuccessNotice}</span>
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
            <span>Kumpulkan Misi 1 ke Guru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
