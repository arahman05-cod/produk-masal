import React, { useState } from 'react';
import { AppState, Team, MissionSubmission, Badge } from '../types';
import { MISSION_METADATA } from '../data/initialData';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Users,
  KeyRound,
  ShieldCheck,
  Zap,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface StudentDashboardProps {
  state: AppState;
  activeTeam: Team;
  onSelectTeam: (teamId: string) => void;
  onOpenMission: (missionNumber: number) => void;
  onUpdateState: (newState: AppState) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  state,
  activeTeam,
  onSelectTeam,
  onOpenMission,
  onUpdateState,
}) => {
  const currentClass = state.classes.find(c => c.id === state.currentClassId) || state.classes[0];
  const classTeams = state.teams.filter(t => t.classId === state.currentClassId);
  const teamSubmissions = state.submissions.filter(s => s.teamId === activeTeam.id);

  const [studentName, setStudentName] = useState(state.currentUser.name === 'A. Rahman, S.Kom., Gr.' ? 'Siswa SMK Fania' : state.currentUser.name);
  const [joinClassCode, setJoinClassCode] = useState('');
  const [joinNotice, setJoinNotice] = useState<string | null>(null);

  // Completed missions
  const completedMissionsCount = teamSubmissions.filter(s => s.status === 'selesai_diverifikasi').length;
  const progressPercent = Math.round((completedMissionsCount / 6) * 100);

  const handleJoinByCode = () => {
    if (!joinClassCode.trim()) return;
    const targetClass = state.classes.find(c => c.code.toLowerCase() === joinClassCode.trim().toLowerCase());
    if (targetClass) {
      onUpdateState({
        ...state,
        currentClassId: targetClass.id,
      });
      setJoinNotice(`Berhasil masuk ke kelas: ${targetClass.name}!`);
      setTimeout(() => setJoinNotice(null), 3000);
      setJoinClassCode('');
    } else {
      setJoinNotice(`Kode kelas "${joinClassCode}" tidak ditemukan. Silakan hubungi Guru A. Rahman.`);
      setTimeout(() => setJoinNotice(null), 4000);
    }
  };

  const handleUpdateStudentName = (name: string) => {
    setStudentName(name);
    onUpdateState({
      ...state,
      currentUser: {
        ...state.currentUser,
        name,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Student Passport Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-teal-400 font-mono font-semibold">
              <Award className="w-4 h-4 text-teal-400" />
              <span>PASPOR EKSPEDISI PRODUKSI KIK — AMAZING RACE</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-teal-300 font-bold text-lg">
                {studentName.charAt(0)}
              </div>
              <div>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => handleUpdateStudentName(e.target.value)}
                  placeholder="Nama Lengkap Siswa"
                  className="text-xl md:text-2xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-teal-400 focus:outline-none"
                />
                <div className="text-xs text-slate-300 mt-0.5">
                  <span>{currentClass.name}</span> · <span className="text-teal-400 font-semibold">{activeTeam.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Status Paspor Misi</span>
              <span className="text-xl font-mono font-extrabold text-teal-300">
                {completedMissionsCount} / 6 Etape Selesai
              </span>
              <span className="text-xs text-indigo-300 block">Total: {activeTeam.totalScore || 0} Poin</span>
            </div>
            <div className="w-14 h-14 rounded-full border-2 border-teal-500/40 p-1 flex items-center justify-center shrink-0">
              <img
                src="/src/assets/images/badge_production_master_1792806248908.jpg"
                alt="Badge Prestasi KIK"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Join Class & Team Switcher Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Pilih Kelompok Anda:</span>
            <select
              value={activeTeam.id}
              onChange={(e) => onSelectTeam(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-teal-300 font-semibold rounded-lg px-2.5 py-1 focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              {classTeams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              value={joinClassCode}
              onChange={(e) => setJoinClassCode(e.target.value.toUpperCase())}
              placeholder="Masukkan Kode Kelas..."
              className="bg-slate-950 border border-slate-700 text-xs px-2.5 py-1 rounded text-white font-mono uppercase"
            />
            <button
              onClick={handleJoinByCode}
              className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded cursor-pointer transition-colors"
            >
              Gabung Kelas
            </button>
          </div>
        </div>

        {joinNotice && (
          <div className="mt-3 p-2 bg-indigo-950/80 border border-indigo-500 rounded text-xs text-indigo-200">
            {joinNotice}
          </div>
        )}
      </div>

      {/* Passport Stamps & Badges Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Stempel Paspor 6 Misi & Lencana Keahlian</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {completedMissionsCount} dari 6 Terbuka
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {MISSION_METADATA.map((mission) => {
            const sub = teamSubmissions.find(s => s.missionNumber === mission.number);
            const isCompleted = sub?.status === 'selesai_diverifikasi';
            const isPending = sub?.status === 'dikumpulkan';
            const isRevision = sub?.status === 'perlu_revisi';

            return (
              <div
                key={mission.number}
                onClick={() => onOpenMission(mission.number)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  isCompleted
                    ? 'bg-slate-900 border-emerald-500/50 hover:border-emerald-400'
                    : isPending
                    ? 'bg-slate-900 border-amber-500/50 hover:border-amber-400'
                    : isRevision
                    ? 'bg-slate-900 border-rose-500/50 hover:border-rose-400'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                    <span className="text-teal-400 font-bold">{mission.code}</span>
                    <span className="text-slate-500">Misi {mission.number}</span>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1 line-clamp-1">
                    {mission.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">
                    {mission.badgeName}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  {isCompleted ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{sub.finalScore || 100}p</span>
                    </span>
                  ) : isPending ? (
                    <span className="text-amber-400 font-bold">Verifikasi</span>
                  ) : isRevision ? (
                    <span className="text-rose-400 font-bold">Revisi</span>
                  ) : (
                    <span className="text-slate-500">Terkunci</span>
                  )}

                  <span className="text-teal-400 hover:underline">Buka</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission Feedback History from Guru A. Rahman */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <span>Riwayat Umpan Balik Guru (A. Rahman, S.Kom., Gr.)</span>
        </h2>

        {teamSubmissions.some(s => s.feedbacks && s.feedbacks.length > 0) ? (
          <div className="space-y-3">
            {teamSubmissions.map(sub => {
              if (!sub.feedbacks || sub.feedbacks.length === 0) return null;
              const mission = MISSION_METADATA.find(m => m.number === sub.missionNumber);
              const lastFeedback = sub.feedbacks[sub.feedbacks.length - 1];

              return (
                <div key={sub.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-300">
                      Misi {sub.missionNumber}: {mission?.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                      sub.status === 'selesai_diverifikasi'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : 'bg-rose-950 text-rose-300 border-rose-500/50'
                    }`}>
                      {sub.status === 'selesai_diverifikasi' ? `Lolos (${sub.finalScore || 0} Poin)` : 'Perlu Perbaikan'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-3 border-l-2 border-teal-500/50">
                    "{lastFeedback.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Oleh: {lastFeedback.teacherName}</span>
                    <span>{new Date(lastFeedback.date).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            Belum ada catatan umpan balik dari guru. Kumpulkan misi untuk mendapatkan evaluasi rubrik.
          </div>
        )}
      </div>
    </div>
  );
};
