import React, { useState, useEffect } from 'react';
import { Role, AppState, MissionSubmission, MissionStatus, Team } from './types';
import { loadAppState, saveAppState } from './services/storage';
import { Navbar } from './components/Navbar';
import { MissionMap } from './components/MissionMap';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { DatabaseSheetsModal } from './components/DatabaseSheetsModal';
import { GuideModal } from './components/GuideModal';

// Mission components
import { Mission1MysteryHunt } from './components/Missions/Mission1MysteryHunt';
import { Mission2BudgetBattle } from './components/Missions/Mission2BudgetBattle';
import { Mission3HomeLab } from './components/Missions/Mission3HomeLab';
import { Mission4BatchRace } from './components/Missions/Mission4BatchRace';
import { Mission5QCEscapeRoom } from './components/Missions/Mission5QCEscapeRoom';
import { Mission6ProductFestival } from './components/Missions/Mission6ProductFestival';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<string>('peta');
  const [activeMissionNumber, setActiveMissionNumber] = useState<number | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string>(() => {
    const loaded = loadAppState();
    return loaded.teams[0]?.id || 'team-citrus-fresh';
  });

  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Sync state changes to storage
  const handleUpdateState = (newState: AppState) => {
    setAppState(newState);
    saveAppState(newState);
  };

  // Listen to cross-component state updates if needed
  useEffect(() => {
    const handleStorageUpdate = () => {
      setAppState(loadAppState());
    };
    window.addEventListener('product_quest_state_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('product_quest_state_updated', handleStorageUpdate);
    };
  }, []);

  const activeTeam = appState.teams.find(t => t.id === activeTeamId) || appState.teams[0] || {
    id: 'team-citrus-fresh',
    classId: appState.currentClassId,
    name: 'Kelompok 1 — BioCitrus',
    productName: 'BioCitrus Herbal Spray 60ml',
    productType: 'Hand Sanitizer Alami',
    leaderId: 'student-1',
    leaderName: 'Anisa Rahmawati',
    members: ['Anisa', 'Bagas', 'Citra', 'Dian'],
    targetBatchUnits: 30,
    completedMissions: [],
    totalScore: 0,
    createdAt: new Date().toISOString(),
  };

  const handleSwitchRole = (newRole: Role) => {
    handleUpdateState({
      ...appState,
      currentUser: {
        ...appState.currentUser,
        role: newRole,
        name: newRole === 'guru' ? 'A. Rahman, S.Kom., Gr.' : 'Siswa SMK Fania',
      },
    });
  };

  const handleOpenMission = (missionNumber: number) => {
    setActiveMissionNumber(missionNumber);
  };

  const handleBackToMap = () => {
    setActiveMissionNumber(null);
  };

  const handleSaveSubmission = (payload: any, isFinalSubmit: boolean) => {
    if (!activeMissionNumber) return;

    const existingIndex = appState.submissions.findIndex(
      s => s.teamId === activeTeam.id && s.missionNumber === activeMissionNumber
    );

    const now = new Date().toISOString();
    const newStatus: MissionStatus = isFinalSubmit ? 'dikumpulkan' : 'sedang_dikerjakan';

    let updatedSubmissions: MissionSubmission[];

    if (existingIndex >= 0) {
      const existing = appState.submissions[existingIndex];
      const updatedSub: MissionSubmission = {
        ...existing,
        payload,
        status: isFinalSubmit ? 'dikumpulkan' : existing.status === 'selesai_diverifikasi' ? 'selesai_diverifikasi' : newStatus,
        lastUpdatedAt: now,
        submittedAt: isFinalSubmit ? now : existing.submittedAt,
        submittedBy: appState.currentUser.name,
      };
      updatedSubmissions = [...appState.submissions];
      updatedSubmissions[existingIndex] = updatedSub;
    } else {
      const newSub: MissionSubmission = {
        id: `sub-m${activeMissionNumber}-${activeTeam.id}-${Date.now()}`,
        missionNumber: activeMissionNumber,
        teamId: activeTeam.id,
        classId: appState.currentClassId,
        submittedBy: appState.currentUser.name,
        submittedAt: now,
        lastUpdatedAt: now,
        status: newStatus,
        payload,
        feedbacks: [],
      };
      updatedSubmissions = [...appState.submissions, newSub];
    }

    handleUpdateState({
      ...appState,
      submissions: updatedSubmissions,
    });
  };

  const renderActiveMission = () => {
    switch (activeMissionNumber) {
      case 1:
        return (
          <Mission1MysteryHunt
            state={appState}
            activeTeam={activeTeam}
            onBack={handleBackToMap}
            onSaveSubmission={handleSaveSubmission}
          />
        );
      case 2:
        return (
          <Mission2BudgetBattle
            state={appState}
            activeTeam={activeTeam}
            onBack={handleBackToMap}
            onSaveSubmission={handleSaveSubmission}
          />
        );
      case 3:
        return (
          <Mission3HomeLab
            state={appState}
            activeTeam={activeTeam}
            onBack={handleBackToMap}
            onSaveSubmission={handleSaveSubmission}
          />
        );
      case 4:
        return (
          <Mission4BatchRace
            state={appState}
            activeTeam={activeTeam}
            onBack={handleBackToMap}
            onSaveSubmission={handleSaveSubmission}
          />
        );
      case 5:
        return (
          <Mission5QCEscapeRoom
            state={appState}
            activeTeam={activeTeam}
            onBack={handleBackToMap}
            onSaveSubmission={handleSaveSubmission}
          />
        );
      case 6:
        return (
          <Mission6ProductFestival
            state={appState}
            activeTeam={activeTeam}
            onBack={handleBackToMap}
            onSaveSubmission={handleSaveSubmission}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Strict Top Bar Contract Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveMissionNumber(null);
          setCurrentTab(tab);
        }}
        currentRole={appState.currentUser.role}
        onSwitchRole={handleSwitchRole}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        sheetsConnected={appState.sheetsConfig.connected}
        selectedTeamName={activeTeam.name}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* If inside an active mission, show mission detail */}
        {activeMissionNumber !== null ? (
          renderActiveMission()
        ) : (
          <>
            {/* Tab: Peta Misi (Amazing Race Trajectory) */}
            {currentTab === 'peta' && (
              <MissionMap
                state={appState}
                activeTeam={activeTeam}
                onSelectTeam={(teamId) => setActiveTeamId(teamId)}
                onOpenMission={handleOpenMission}
              />
            )}

            {/* Tab: Dashboard Guru / Siswa */}
            {currentTab === 'dashboard' && (
              appState.currentUser.role === 'guru' ? (
                <TeacherDashboard
                  state={appState}
                  onUpdateState={handleUpdateState}
                  onViewMissionDetail={(mNum, tId) => {
                    setActiveTeamId(tId);
                    setActiveMissionNumber(mNum);
                  }}
                />
              ) : (
                <StudentDashboard
                  state={appState}
                  activeTeam={activeTeam}
                  onSelectTeam={(teamId) => setActiveTeamId(teamId)}
                  onOpenMission={handleOpenMission}
                  onUpdateState={handleUpdateState}
                />
              )
            )}

            {/* Tab: Paspor & Lencana */}
            {currentTab === 'paspor' && (
              <StudentDashboard
                state={appState}
                activeTeam={activeTeam}
                onSelectTeam={(teamId) => setActiveTeamId(teamId)}
                onOpenMission={handleOpenMission}
                onUpdateState={handleUpdateState}
              />
            )}
          </>
        )}
      </main>

      {/* Database Sheets Manager Modal */}
      <DatabaseSheetsModal
        state={appState}
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onUpdateState={handleUpdateState}
      />

      {/* Guide & User Manual Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            PRODUCT QUEST — SMKS Kesehatan Fania Salsabila Kota Jambi · KIK bersama Guru A. Rahman, S.Kom., Gr.
          </span>
          <span className="font-mono text-slate-600">
            {appState.sheetsConfig.connected ? 'Status: Google Sheets Terhubung' : 'Status: Penyimpanan Lokal Aktif'}
          </span>
        </div>
      </footer>
    </div>
  );
}
