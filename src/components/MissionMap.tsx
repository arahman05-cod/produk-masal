import React from 'react';
import { AppState, Team, MissionStatus } from '../types';
import { MISSION_METADATA } from '../data/initialData';
import {
  Search,
  Calculator,
  FlaskConical,
  Zap,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';

interface MissionMapProps {
  state: AppState;
  activeTeam: Team;
  onSelectTeam: (teamId: string) => void;
  onOpenMission: (missionNumber: number) => void;
}

export const MissionMap: React.FC<MissionMapProps> = ({
  state,
  activeTeam,
  onSelectTeam,
  onOpenMission,
}) => {
  const currentClass = state.classes.find(c => c.id === state.currentClassId) || state.classes[0];
  const classTeams = state.teams.filter(t => t.classId === state.currentClassId);

  // Helper for mission status
  const getMissionStatus = (missionNum: number): { status: MissionStatus; label: string; color: string; score?: number } => {
    const sub = state.submissions.find(
      s => s.teamId === activeTeam.id && s.missionNumber === missionNum
    );

    if (!sub) {
      return { status: 'belum_dimulai', label: 'Belum Dimulai', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    }
    if (sub.status === 'selesai_diverifikasi') {
      return {
        status: 'selesai_diverifikasi',
        label: `Selesai (${sub.finalScore || 0} Poin)`,
        color: 'text-emerald-300 bg-emerald-950/70 border-emerald-500/50',
        score: sub.finalScore,
      };
    }
    if (sub.status === 'perlu_revisi') {
      return { status: 'perlu_revisi', label: 'Perlu Revisi Guru', color: 'text-rose-300 bg-rose-950/70 border-rose-500/50' };
    }
    if (sub.status === 'dikumpulkan') {
      return { status: 'dikumpulkan', label: 'Menunggu Verifikasi', color: 'text-amber-300 bg-amber-950/70 border-amber-500/50' };
    }
    return { status: 'sedang_dikerjakan', label: 'Draf Disimpan', color: 'text-cyan-300 bg-cyan-950/70 border-cyan-500/50' };
  };

  const completedCount = MISSION_METADATA.filter(m => {
    const st = getMissionStatus(m.number);
    return st.status === 'selesai_diverifikasi';
  }).length;

  const progressPercentage = Math.round((completedCount / 6) * 100);

  const getMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="w-5 h-5 text-teal-300" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-indigo-300" />;
      case 'FlaskConical': return <FlaskConical className="w-5 h-5 text-cyan-300" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-300" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-300" />;
      case 'Award': return <Award className="w-5 h-5 text-purple-300" />;
      default: return <FileText className="w-5 h-5 text-teal-300" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header with Generated Visual Background */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/quest_map_hero_1792806249480.jpg"
            alt="Product Quest Amazing Race Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-indigo-950/50" />
        </div>

        <div className="relative z-10 p-6 md:p-8 max-w-4xl space-y-4">
          {/* Metadata clean text, anti-pill */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-teal-400 font-medium">
            <span>SMKS Kesehatan Fania Salsabila Kota Jambi</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Kreatif Inovatif dan Kewirausahaan (KIK)</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Guru: A. Rahman, S.Kom., Gr.</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Product Quest — Amazing Race Produksi Massal
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
            Taklukkan enam etape misi terpadu: dari telaah spesifikasi prototipe tervalidasi, kalkulasi biaya HPP, uji coba pilot run, eksekusi batch skala kecil, hingga kendali mutu First Pass Yield (FPY) dan gelar karya wirausaha.
          </p>

          {/* Active Team Selector & Race Progress Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <label className="text-xs text-slate-400 block">Kelompok yang Diamati:</label>
                <select
                  value={activeTeam.id}
                  onChange={(e) => onSelectTeam(e.target.value)}
                  aria-label="Pilih kelompok yang diamati"
                  className="bg-slate-900 border border-slate-700 text-sm font-semibold text-white rounded-lg px-3 py-1.5 focus:border-teal-400 focus:outline-none cursor-pointer"
                >
                  {classTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.productName.substring(0, 32)}...)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Progres Ekspedisi:</span>
                <span className="text-sm font-bold font-mono text-teal-300">
                  {completedCount} dari 6 Misi Selesai ({progressPercentage}%)
                </span>
              </div>
              <div className="w-24 bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Team Profile Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{activeTeam.name}</h2>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
                Target: {activeTeam.targetBatchUnits} Unit
              </span>
            </div>
            <p className="text-sm text-slate-300">
              <strong className="text-slate-200">Produk Unggulan:</strong> {activeTeam.productName}
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Anggota Tim:</strong> {activeTeam.members.join(' · ')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-400">Total Akumulasi Skor:</span>
            <span className="text-xl font-mono font-extrabold text-teal-400 bg-slate-950 px-3 py-1 rounded-lg border border-teal-500/30">
              {activeTeam.totalScore || 0} / 600 Poin
            </span>
          </div>
        </div>
      </div>

      {/* The 6 Mission Cards Grid in Amazing Race Progression */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Rute Ekspedisi 6 Misi Produksi</h2>
            <p className="text-xs text-slate-400">Pilih kartu misi di bawah untuk melihat instruksi, mengerjakan tantangan, dan mengirimkan hasil kerja.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MISSION_METADATA.map((mission) => {
            const statusInfo = getMissionStatus(mission.number);
            const isCompleted = statusInfo.status === 'selesai_diverifikasi';
            const isPending = statusInfo.status === 'dikumpulkan';
            const isRevision = statusInfo.status === 'perlu_revisi';

            return (
              <div
                key={mission.number}
                onClick={() => onOpenMission(mission.number)}
                className={`group relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
                  isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400'
                    : isRevision
                    ? 'bg-slate-900/90 border-rose-500/40 hover:border-rose-400'
                    : isPending
                    ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar inside card: Code + Estimated Time */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="font-mono text-teal-400 font-semibold">{mission.code}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {mission.estimatedTime}
                    </span>
                  </div>

                  {/* Header: Icon + Title */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-teal-500/50 transition-colors shrink-0">
                      {getMissionIcon(mission.icon)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
                        Misi {mission.number}: {mission.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">
                        {mission.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                    {mission.description}
                  </p>
                </div>

                {/* Bottom Card Footer: Status & Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>

                  <button
                    className="flex items-center gap-1 text-xs font-semibold text-teal-400 group-hover:text-teal-300 transition-colors"
                  >
                    <span>Buka Misi</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Principles Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Prinsip Penilaian Amazing Race Produksi (100 Poin KIK)</span>
        </div>
        <p className="leading-relaxed">
          Pemberian nilai didasarkan pada 6 dimensi autentik: Kesesuaian Prototipe (30%), Konsistensi Mutu & QC (25%), SOP & K3 (15%), Efisiensi Bahan & HPP (10%), Kolaborasi Tim (10%), serta Refleksi Individu (10%). Kecepatan produksi tidak mengorbankan standar keselamatan dan kepuasan mutu pelanggan!
        </p>
      </div>
    </div>
  );
};
