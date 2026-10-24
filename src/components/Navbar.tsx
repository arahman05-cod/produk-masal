import React from 'react';
import { Role } from '../types';
import { Database, UserCheck, HelpCircle, Map, LayoutDashboard, Award } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: Role;
  onSwitchRole: (role: Role) => void;
  onOpenDatabaseModal: () => void;
  onOpenGuideModal: () => void;
  sheetsConnected: boolean;
  selectedTeamName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  onSwitchRole,
  onOpenDatabaseModal,
  onOpenGuideModal,
  sheetsConnected,
  selectedTeamName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('peta')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg md:text-xl font-bold tracking-tight text-white whitespace-nowrap block">
              PRODUCT QUEST
            </span>
            <span className="text-[11px] font-medium text-teal-400 block whitespace-nowrap -mt-0.5 tracking-wide">
              AMAZING RACE PRODUKSI KIK
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('peta')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'peta' ? 'text-teal-400 font-semibold border-b-2 border-teal-400' : 'hover:text-white'
            }`}
          >
            <Map className="w-4 h-4 text-teal-400" />
            <span>Peta 6 Misi</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'dashboard' ? 'text-teal-400 font-semibold border-b-2 border-teal-400' : 'hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Dashboard {currentRole === 'guru' ? 'Guru' : 'Siswa'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('paspor')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'paspor' ? 'text-teal-400 font-semibold border-b-2 border-teal-400' : 'hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Paspor & Lencana</span>
          </button>

          <button
            onClick={onOpenDatabaseModal}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors cursor-pointer py-1 text-slate-300"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Database Sheets</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
              sheetsConnected
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950/40 text-amber-300 border-amber-600/30'
            }`}>
              {sheetsConnected ? 'ONLINE' : 'LOKAL'}
            </span>
          </button>

          <button
            onClick={onOpenGuideModal}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors cursor-pointer py-1 text-slate-300"
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Panduan</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area (Role switcher & mobile quick access) */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Quick indicator for mobile */}
          <button
            onClick={onOpenDatabaseModal}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            title="Koneksi Database"
          >
            <Database className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Role Switcher Pill Container with clear functional buttons */}
          <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => onSwitchRole('guru')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                currentRole === 'guru'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Guru (A. Rahman)</span>
            </button>
            <button
              onClick={() => onSwitchRole('siswa')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                currentRole === 'siswa'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Siswa SMK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Strip for small screens */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-900 bg-slate-950/95 py-2 px-2 text-xs font-medium text-slate-400">
        <button
          onClick={() => setCurrentTab('peta')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded ${currentTab === 'peta' ? 'text-teal-400 font-bold' : ''}`}
        >
          <Map className="w-4 h-4" />
          <span>Peta Misi</span>
        </button>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded ${currentTab === 'dashboard' ? 'text-teal-400 font-bold' : ''}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setCurrentTab('paspor')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded ${currentTab === 'paspor' ? 'text-teal-400 font-bold' : ''}`}
        >
          <Award className="w-4 h-4" />
          <span>Paspor</span>
        </button>
        <button
          onClick={onOpenGuideModal}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded text-slate-400"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Panduan</span>
        </button>
      </div>
    </header>
  );
};
