import React, { useState } from 'react';
import { AppState, Team, MissionSubmission, MissionStatus, RubricCriteria, ClassSession } from '../types';
import { MISSION_METADATA } from '../data/initialData';
import { exportCsvReport, downloadFile } from '../services/storage';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Sliders,
  FileCheck,
  Plus,
  Edit2,
  TrendingUp,
  Award,
  MessageSquare,
  ShieldAlert,
  Percent,
  Search,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface TeacherDashboardProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onViewMissionDetail: (missionNumber: number, teamId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  state,
  onUpdateState,
  onViewMissionDetail,
}) => {
  const currentClass = state.classes.find(c => c.id === state.currentClassId) || state.classes[0];
  const classTeams = state.teams.filter(t => t.classId === state.currentClassId);
  const classSubmissions = state.submissions.filter(s => s.classId === state.currentClassId);

  const [activeTab, setActiveTab] = useState<'kpi' | 'matriks' | 'periksa' | 'rubrik' | 'kelas'>('kpi');
  const [selectedSubForReview, setSelectedSubForReview] = useState<MissionSubmission | null>(null);

  // Review drawer form state
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<MissionStatus>('selesai_diverifikasi');
  const [reviewScores, setReviewScores] = useState<Record<string, number>>({});

  // Class & Team creation modals
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassTheme, setNewClassTheme] = useState('');

  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamProduct, setNewTeamProduct] = useState('');
  const [newTeamLeader, setNewTeamLeader] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState('');
  const [newTeamTargetUnits, setNewTeamTargetUnits] = useState(30);

  // Editable Rubric weights
  const [editingRubrics, setEditingRubrics] = useState<RubricCriteria[]>(state.rubricConfig);

  // Production Metrics Calculation across all class teams
  const totalUnitsProduced = classSubmissions
    .filter(s => s.missionNumber === 4)
    .reduce((acc, s) => acc + ((s.payload as any)?.actualBatchUnits || 0), 0);

  const m5Subs = classSubmissions.filter(s => s.missionNumber === 5);
  const totalInspected = m5Subs.reduce((acc, s) => acc + ((s.payload as any)?.totalInspected || 0), 0);
  const totalPassedFirst = m5Subs.reduce((acc, s) => acc + ((s.payload as any)?.passedFirstInspectionCount || 0), 0);
  const totalRework = m5Subs.reduce((acc, s) => acc + ((s.payload as any)?.reworkCount || 0), 0);
  const totalReject = m5Subs.reduce((acc, s) => acc + ((s.payload as any)?.rejectCount || 0), 0);

  const averageFPY = totalInspected > 0
    ? Math.round((totalPassedFirst / totalInspected) * 1000) / 10
    : 0;

  const m2Subs = classSubmissions.filter(s => s.missionNumber === 2);
  const avgCostPerUnit = m2Subs.length > 0
    ? Math.round(m2Subs.reduce((acc, s) => acc + ((s.payload as any)?.hppPerUnit || 0), 0) / m2Subs.length)
    : 0;

  const handleOpenReview = (sub: MissionSubmission) => {
    setSelectedSubForReview(sub);
    setReviewComment(sub.feedbacks[sub.feedbacks.length - 1]?.comment || '');
    setReviewStatus(sub.status);

    const initialScores: Record<string, number> = {};
    state.rubricConfig.forEach(r => {
      const existingItem = sub.feedbacks[sub.feedbacks.length - 1]?.rubricScores?.find(item => item.criteriaId === r.id);
      initialScores[r.id] = existingItem ? existingItem.score : Math.round(r.maxScore * 0.85);
    });
    setReviewScores(initialScores);
  };

  const handleSaveReview = () => {
    if (!selectedSubForReview) return;

    let calculatedTotalScore = 0;
    const rubricScoresArray = Object.entries(reviewScores).map(([criteriaId, score]) => {
      calculatedTotalScore += score;
      return { criteriaId, score };
    });

    const newFeedback = {
      teacherId: state.currentUser.id,
      teacherName: state.currentUser.name,
      date: new Date().toISOString(),
      comment: reviewComment || 'Telah diperiksa dan diverifikasi oleh guru pengampu.',
      status: reviewStatus,
      rubricScores: rubricScoresArray,
      totalScore: calculatedTotalScore,
    };

    const updatedSubmissions = state.submissions.map(s => {
      if (s.id === selectedSubForReview.id) {
        return {
          ...s,
          status: reviewStatus,
          finalScore: reviewStatus === 'selesai_diverifikasi' ? calculatedTotalScore : undefined,
          feedbacks: [...(s.feedbacks || []), newFeedback],
          lastUpdatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    // Update team score & completed missions if verified
    const updatedTeams = state.teams.map(team => {
      if (team.id === selectedSubForReview.teamId) {
        const teamSubs = updatedSubmissions.filter(s => s.teamId === team.id && s.status === 'selesai_diverifikasi');
        const completedMissions = teamSubs.map(s => s.missionNumber);
        const totalScore = teamSubs.reduce((acc, s) => acc + (s.finalScore || 0), 0);
        return {
          ...team,
          completedMissions,
          totalScore,
        };
      }
      return team;
    });

    onUpdateState({
      ...state,
      submissions: updatedSubmissions,
      teams: updatedTeams,
    });

    setSelectedSubForReview(null);
  };

  const handleDownloadCsv = () => {
    const csvContent = exportCsvReport(state);
    downloadFile(csvContent, `Product_Quest_KIK_Report_${currentClass.code}_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleSaveRubrics = () => {
    onUpdateState({
      ...state,
      rubricConfig: editingRubrics,
    });
    alert('Konfigurasi bobot rubrik berhasil diperbarui!');
  };

  const handleCreateClass = () => {
    if (!newClassName.trim() || !newClassCode.trim()) {
      alert('Nama kelas dan kode gabung wajib diisi!');
      return;
    }
    const newClass: ClassSession = {
      id: `class-${Date.now()}`,
      name: newClassName.trim(),
      code: newClassCode.trim().toUpperCase(),
      academicYear: '2025/2026',
      teacherName: state.currentUser.name,
      schoolName: 'SMKS Kesehatan Fania Salsabila Kota Jambi',
      productTheme: newClassTheme.trim() || 'Produk Kesehatan & Kosmetik Alami',
      createdAt: new Date().toISOString(),
      active: true,
    };

    onUpdateState({
      ...state,
      classes: [...state.classes, newClass],
      currentClassId: newClass.id,
    });
    setShowNewClassModal(false);
    setNewClassName('');
    setNewClassCode('');
    setNewClassTheme('');
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim() || !newTeamProduct.trim()) {
      alert('Nama kelompok dan produk wajib diisi!');
      return;
    }

    const membersList = newTeamMembers
      .split(/[,;\n]/)
      .map(m => m.trim())
      .filter(Boolean);

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      classId: state.currentClassId,
      name: newTeamName.trim(),
      productName: newTeamProduct.trim(),
      productType: 'Produk Farmasi & Kosmetik Alami',
      leaderId: `student-${Date.now()}`,
      leaderName: newTeamLeader.trim() || 'Ketua Tim',
      members: membersList.length > 0 ? membersList : [newTeamLeader.trim() || 'Ketua Tim'],
      targetBatchUnits: newTeamTargetUnits || 30,
      completedMissions: [],
      totalScore: 0,
      createdAt: new Date().toISOString(),
    };

    onUpdateState({
      ...state,
      teams: [...state.teams, newTeam],
    });
    setShowNewTeamModal(false);
    setNewTeamName('');
    setNewTeamProduct('');
    setNewTeamLeader('');
    setNewTeamMembers('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Teacher Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-teal-400 font-medium">
              <span>PANEL KENDALI GURU (A. RAHMAN, S.KOM., GR.)</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>SMKS KESEHATAN FANIA SALSABILA JAMBI</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Guru & Evaluasi Produksi Massal KIK
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Kelola kelas, awasi progres Amazing Race kelompok, periksa submission, evaluasi rubrik 100 poin, dan pantau First Pass Yield (FPY).
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Download CSV Sheets</span>
            </button>

            <button
              onClick={() => setShowNewTeamModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelompok</span>
            </button>
          </div>
        </div>

        {/* Class Selection & Code Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Kelas Aktif:</span>
            <select
              value={state.currentClassId}
              onChange={(e) => onUpdateState({ ...state, currentClassId: e.target.value })}
              className="bg-slate-950 border border-slate-700 text-white font-semibold rounded-lg px-3 py-1.5 focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              {state.classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Kode: {c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-mono">
              Kode Bergabung: <strong className="text-teal-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-700">{currentClass.code}</strong>
            </span>
            <button
              onClick={() => setShowNewClassModal(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
            >
              + Buat Sesi Kelas Baru
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('kpi')}
          className={`px-4 py-2.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'kpi'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          1. Metrik & KPI Produksi
        </button>
        <button
          onClick={() => setActiveTab('matriks')}
          className={`px-4 py-2.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'matriks'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          2. Matriks Progres Kelompok
        </button>
        <button
          onClick={() => setActiveTab('periksa')}
          className={`px-4 py-2.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'periksa'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          3. Pengumpulan & Umpan Balik ({classSubmissions.filter(s => s.status === 'dikumpulkan').length} Baru)
        </button>
        <button
          onClick={() => setActiveTab('rubrik')}
          className={`px-4 py-2.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'rubrik'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          4. Atur Rubrik 100 Poin
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`px-4 py-2.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'kelas'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          5. Kelola Kelas & Tim
        </button>
      </div>

      {/* Tab 1: KPI & Statistik Produksi */}
      {activeTab === 'kpi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-xs text-slate-400 block font-medium">Total Unit Selesai (Batch)</span>
              <span className="text-3xl font-mono font-extrabold text-white">
                {totalUnitsProduced} <span className="text-xs font-normal text-slate-400">Unit</span>
              </span>
              <p className="text-[11px] text-slate-500">Akumulasi hasil produksi fisik seluruh tim</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-xs text-teal-400 block font-medium">Rata-rata First Pass Yield (FPY)</span>
              <span className="text-3xl font-mono font-extrabold text-teal-300">
                {averageFPY > 0 ? `${averageFPY}%` : 'N/A'}
              </span>
              <p className="text-[11px] text-slate-500">Lolos inspeksi pertama tanpa perbaikan</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-xs text-amber-400 block font-medium">Unit Rework & Reject</span>
              <span className="text-3xl font-mono font-extrabold text-amber-300">
                {totalRework} <span className="text-xs font-normal text-slate-400">Rework</span> / {totalReject} <span className="text-xs font-normal text-rose-400">Reject</span>
              </span>
              <p className="text-[11px] text-slate-500">Unit cacat yang berhasil & gagal diperbaiki</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-xs text-indigo-400 block font-medium">Rata-rata Biaya / HPP Unit</span>
              <span className="text-3xl font-mono font-extrabold text-indigo-300">
                Rp{avgCostPerUnit.toLocaleString('id-ID')}
              </span>
              <p className="text-[11px] text-slate-500">Harga Pokok Produksi rerata kelas</p>
            </div>
          </div>

          {/* Teams Production Breakdown Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Rangkuman Kinerja Produksi Antar Kelompok</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold">
                    <th className="py-3 px-3">Nama Kelompok</th>
                    <th className="py-3 px-3">Produk Unggulan</th>
                    <th className="py-3 px-3 text-right">Target Batch</th>
                    <th className="py-3 px-3 text-right">Unit Selesai</th>
                    <th className="py-3 px-3 text-right">FPY Mutu (%)</th>
                    <th className="py-3 px-3 text-right">HPP / Unit</th>
                    <th className="py-3 px-3 text-center">Misi Tuntas</th>
                    <th className="py-3 px-3 text-right">Total Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {classTeams.map(t => {
                    const sub4 = classSubmissions.find(s => s.teamId === t.id && s.missionNumber === 4);
                    const sub5 = classSubmissions.find(s => s.teamId === t.id && s.missionNumber === 5);
                    const sub2 = classSubmissions.find(s => s.teamId === t.id && s.missionNumber === 2);

                    const completedUnits = (sub4?.payload as any)?.actualBatchUnits || 0;
                    const fpyVal = (sub5?.payload as any)?.firstPassYieldPercent || 0;
                    const hppVal = (sub2?.payload as any)?.hppPerUnit || 0;

                    return (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">
                          {t.name}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {t.productName}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-400">
                          {t.targetBatchUnits}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-teal-300">
                          {completedUnits > 0 ? `${completedUnits} Unit` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          {fpyVal > 0 ? `${fpyVal}%` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">
                          {hppVal > 0 ? `Rp${hppVal.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-teal-400">
                            {t.completedMissions.length} / 6
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                          {t.totalScore || 0} Poin
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Matriks Progres Kelompok */}
      {activeTab === 'matriks' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Matriks Progres Amazing Race 6 Misi</h2>
            <p className="text-xs text-slate-400">Klik pada kotak misi kelompok untuk langsung membuka dan memeriksa tugas.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Kelompok & Produk</th>
                  {MISSION_METADATA.map(m => (
                    <th key={m.number} className="py-3 px-2 text-center">
                      <span className="block font-mono text-[10px] text-teal-400">{m.code}</span>
                      <span className="block truncate max-w-[90px]">{m.title}</span>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {classTeams.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{t.name}</span>
                      <span className="text-[11px] text-slate-400 block">{t.productName}</span>
                    </td>
                    {MISSION_METADATA.map(m => {
                      const sub = classSubmissions.find(s => s.teamId === t.id && s.missionNumber === m.number);
                      const isCompleted = sub?.status === 'selesai_diverifikasi';
                      const isPending = sub?.status === 'dikumpulkan';
                      const isRevision = sub?.status === 'perlu_revisi';

                      return (
                        <td key={m.number} className="py-3 px-2 text-center">
                          <button
                            onClick={() => {
                              if (sub) {
                                handleOpenReview(sub);
                              } else {
                                onViewMissionDetail(m.number, t.id);
                              }
                            }}
                            className={`w-full py-1.5 px-1 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer border ${
                              isCompleted
                                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                                : isPending
                                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 hover:bg-amber-900/80 animate-pulse'
                                : isRevision
                                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900/80'
                                : sub
                                ? 'bg-cyan-950/50 border-cyan-800 text-cyan-400 hover:bg-cyan-900/50'
                                : 'bg-slate-950/50 border-slate-800 text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            {isCompleted
                              ? `${sub.finalScore || 100}p`
                              : isPending
                              ? 'Verifikasi'
                              : isRevision
                              ? 'Revisi'
                              : sub
                              ? 'Draf'
                              : '—'}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onViewMissionDetail(1, t.id)}
                        className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 justify-end ml-auto cursor-pointer"
                      >
                        <span>Lihat Rute</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Pengumpulan & Pemeriksaan (Review & Rubric) */}
      {activeTab === 'periksa' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Daftar Pengumpulan Tugas Misi Siswa</h2>
                <p className="text-xs text-slate-400">Pilih tugas untuk memeriksa jawaban, foto bukti, dan memberikan nilai rubrik.</p>
              </div>
            </div>

            <div className="space-y-3">
              {classSubmissions.map(sub => {
                const team = state.teams.find(t => t.id === sub.teamId);
                const mission = MISSION_METADATA.find(m => m.number === sub.missionNumber);

                return (
                  <div
                    key={sub.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-teal-400 bg-teal-950/60 border border-teal-500/40 px-2 py-0.5 rounded">
                          Misi {sub.missionNumber}: {mission?.title}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-300 font-semibold">{team?.name}</span>
                        <span className="text-slate-500">({team?.productName})</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Diserahkan oleh: <strong className="text-slate-300">{sub.submittedBy}</strong> · {new Date(sub.submittedAt).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded border font-mono font-semibold ${
                        sub.status === 'selesai_diverifikasi'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                          : sub.status === 'perlu_revisi'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                          : sub.status === 'dikumpulkan'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {sub.status === 'selesai_diverifikasi'
                          ? `Nilai: ${sub.finalScore || 0} Poin`
                          : sub.status === 'perlu_revisi'
                          ? 'Perlu Revisi'
                          : sub.status === 'dikumpulkan'
                          ? 'Menunggu Penilaian'
                          : 'Draf'}
                      </span>

                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Beri Nilai & Ulasan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Drawer Modal */}
      {selectedSubForReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-teal-400 block font-semibold">
                  FORMULIR PENILAIAN GURU (A. RAHMAN, S.KOM., GR.)
                </span>
                <h2 className="text-xl font-bold text-white">
                  Misi {selectedSubForReview.missionNumber} — {state.teams.find(t => t.id === selectedSubForReview.teamId)?.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Pengirim: {selectedSubForReview.submittedBy} · {new Date(selectedSubForReview.submittedAt).toLocaleString('id-ID')}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubForReview(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Rubric Evaluation Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                <span>Penilaian Berdasarkan Rubrik 100 Poin KIK</span>
              </h3>

              <div className="space-y-3">
                {state.rubricConfig.map(r => (
                  <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-200 block">{r.title}</span>
                        <span className="text-[11px] text-slate-400">{r.description}</span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="font-mono font-bold text-teal-400 text-sm">
                          {reviewScores[r.id] ?? r.maxScore} / {r.maxScore}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Bobot {r.weightPercent}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={r.maxScore}
                        value={reviewScores[r.id] ?? r.maxScore}
                        onChange={(e) => setReviewScores(prev => ({ ...prev, [r.id]: Number(e.target.value) }))}
                        className="flex-1 accent-teal-400 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Live Calculated Score */}
              <div className="p-4 bg-slate-950 border border-teal-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Nilai Akhir (Skala 100):</span>
                  <span className="text-xs text-teal-300">Dihitung otomatis dari akumulasi skor rubrik</span>
                </div>
                <span className="text-3xl font-mono font-extrabold text-teal-400">
                  {Object.values(reviewScores).reduce((a, b) => a + b, 0)} / 100
                </span>
              </div>
            </div>

            {/* Status & Feedback Text */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Status Verifikasi Tugas:
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setReviewStatus('selesai_diverifikasi')}
                    className={`p-3 rounded-lg border font-semibold text-center cursor-pointer transition-colors ${
                      reviewStatus === 'selesai_diverifikasi'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Diterima & Tuntas (Selesai)
                  </button>
                  <button
                    onClick={() => setReviewStatus('perlu_revisi')}
                    className={`p-3 rounded-lg border font-semibold text-center cursor-pointer transition-colors ${
                      reviewStatus === 'perlu_revisi'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Kembalikan untuk Perbaikan (Revisi)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Catatan Umpan Balik Guru (Feedback Autentik):
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Berikan apresiasi, koreksi spesifik terhadap SOP atau formula bahan, dan instruksi perbaikan..."
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg p-3 text-white focus:border-teal-400 focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedSubForReview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveReview}
                className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Simpan Penilaian & Kirim ke Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Atur Rubrik 100 Poin */}
      {activeTab === 'rubrik' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Konfigurasi Bobot Rubrik Penilaian (Total 100 Poin)</h2>
              <p className="text-xs text-slate-400">
                Guru dapat menyesuaikan bobot masing-masing kriteria sesuai penekanan kompetensi KIK di laboratorium.
              </p>
            </div>
            <button
              onClick={handleSaveRubrics}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Simpan Perubahan Bobot
            </button>
          </div>

          <div className="space-y-4">
            {editingRubrics.map((r, idx) => (
              <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={r.title}
                      onChange={(e) => {
                        const updated = [...editingRubrics];
                        updated[idx].title = e.target.value;
                        setEditingRubrics(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded px-2.5 py-1.5 mb-1"
                    />
                    <input
                      type="text"
                      value={r.description}
                      onChange={(e) => {
                        const updated = [...editingRubrics];
                        updated[idx].description = e.target.value;
                        setEditingRubrics(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 rounded px-2 py-1"
                    />
                  </div>

                  <div className="w-28 text-right">
                    <label className="text-[10px] text-slate-500 block">Bobot Skor:</label>
                    <div className="flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={r.maxScore}
                        onChange={(e) => {
                          const updated = [...editingRubrics];
                          const val = Number(e.target.value);
                          updated[idx].maxScore = val;
                          updated[idx].weightPercent = val;
                          setEditingRubrics(updated);
                        }}
                        className="w-16 bg-slate-900 border border-slate-700 text-sm font-mono font-bold text-teal-300 rounded px-2 py-1 text-right"
                      />
                      <span className="text-xs text-slate-400">Poin</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Total Akumulasi Bobot KIK:</span>
            <span className={`font-mono font-extrabold text-base ${
              editingRubrics.reduce((a, b) => a + b.maxScore, 0) === 100 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {editingRubrics.reduce((a, b) => a + b.maxScore, 0)} / 100 Poin
              {editingRubrics.reduce((a, b) => a + b.maxScore, 0) !== 100 && ' (Peringatan: Total harus 100!)'}
            </span>
          </div>
        </div>
      )}

      {/* Tab 5: Kelola Kelas & Tim */}
      {activeTab === 'kelas' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Daftar Kelompok Belajar Kelas {currentClass.name}</h2>
            <button
              onClick={() => setShowNewTeamModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelompok Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classTeams.map(t => (
              <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{t.name}</h3>
                  <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 border border-teal-500/40 px-2 py-0.5 rounded">
                    Target: {t.targetBatchUnits} Unit
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  <strong>Produk:</strong> {t.productName}
                </p>

                <div className="text-xs text-slate-400 space-y-1">
                  <div><strong>Ketua:</strong> {t.leaderName}</div>
                  <div><strong>Anggota:</strong> {t.members.join(' · ')}</div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Misi Selesai: {t.completedMissions.length} / 6</span>
                  <span className="font-mono font-bold text-amber-300">{t.totalScore || 0} Poin</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Buat Kelas Baru */}
      {showNewClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Buat Sesi Kelas KIK Baru</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Nama Kelas & Jurusan:</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Contoh: XII Farmasi Komunitas — Batch B"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Kode Bergabung Siswa:</label>
                <input
                  type="text"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: FANIA-KIK-26B"
                  className="w-full bg-slate-950 border border-slate-700 font-mono font-bold rounded px-3 py-2 text-teal-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Tema / Fokus Produk Massal:</label>
                <input
                  type="text"
                  value={newClassTheme}
                  onChange={(e) => setNewClassTheme(e.target.value)}
                  placeholder="Contoh: Kosmetik Herbal & Perawatan Alami"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowNewClassModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleCreateClass}
                className="px-4 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400"
              >
                Buat Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kelompok Baru */}
      {showNewTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Tambah Kelompok Kerja Siswa</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Nama Kelompok:</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Contoh: Kelompok 4 — BioFresh Soap"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Nama Produk yang Divalidasi:</label>
                <input
                  type="text"
                  value={newTeamProduct}
                  onChange={(e) => setNewTeamProduct(e.target.value)}
                  placeholder="Contoh: Sabun Cuci Tangan Lidah Buaya 100ml"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Nama Ketua Kelompok:</label>
                <input
                  type="text"
                  value={newTeamLeader}
                  onChange={(e) => setNewTeamLeader(e.target.value)}
                  placeholder="Contoh: Rizky Firmansyah"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Daftar Anggota (Pisahkan dengan koma):</label>
                <textarea
                  rows={2}
                  value={newTeamMembers}
                  onChange={(e) => setNewTeamMembers(e.target.value)}
                  placeholder="Rizky (Ketua), Siti (PIC Bahan), Doni (PIC Proses), Rina (PIC QC)"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Target Produksi 1 Batch:</label>
                <input
                  type="number"
                  min={1}
                  value={newTeamTargetUnits}
                  onChange={(e) => setNewTeamTargetUnits(Number(e.target.value))}
                  className="w-24 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowNewTeamModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400"
              >
                Simpan Kelompok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
