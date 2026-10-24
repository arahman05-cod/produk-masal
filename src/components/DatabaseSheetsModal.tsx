import React, { useState } from 'react';
import { AppState } from '../types';
import {
  GOOGLE_SHEET_SCHEMAS,
  generateGoogleAppsScriptCode,
  testGoogleSheetsEndpoint,
  exportCsvReport,
  downloadFile,
  resetToDefaultState
} from '../services/storage';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Download,
  Upload,
  ExternalLink,
  Table,
  Check,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface DatabaseSheetsModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (newState: AppState) => void;
}

export const DatabaseSheetsModal: React.FC<DatabaseSheetsModalProps> = ({
  state,
  isOpen,
  onClose,
  onUpdateState,
}) => {
  if (!isOpen) return null;

  const [webAppUrl, setWebAppUrl] = useState(state.sheetsConfig.webAppUrl || '');
  const [spreadsheetId, setSpreadsheetId] = useState(state.sheetsConfig.spreadsheetId || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'koneksi' | 'struktur' | 'script' | 'backup'>('koneksi');

  const scriptCode = generateGoogleAppsScriptCode();

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testGoogleSheetsEndpoint(webAppUrl, spreadsheetId);
      setTestResult(result);

      if (result.success) {
        onUpdateState({
          ...state,
          sheetsConfig: {
            ...state.sheetsConfig,
            connected: true,
            mode: 'google_sheets',
            webAppUrl,
            spreadsheetId,
            lastSyncAt: new Date().toISOString(),
            lastStatusMessage: result.message,
          },
        });
      } else {
        onUpdateState({
          ...state,
          sheetsConfig: {
            ...state.sheetsConfig,
            connected: false,
            mode: 'local',
            webAppUrl,
            spreadsheetId,
            lastStatusMessage: result.message,
          },
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menguji koneksi.',
        latencyMs: 0,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncToSheets = async () => {
    if (!webAppUrl) {
      alert('Masukkan URL Google Apps Script Web App terlebih dahulu!');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_all',
          payload: {
            classes: state.classes,
            teams: state.teams,
            submissions: state.submissions,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({ status: 'success' }));
        onUpdateState({
          ...state,
          sheetsConfig: {
            ...state.sheetsConfig,
            connected: true,
            mode: 'google_sheets',
            lastSyncAt: new Date().toISOString(),
            lastStatusMessage: 'Data berhasil disinkronkan ke 10 lembar Google Sheets!',
          },
        });
        alert('Sinkronisasi ke Google Sheets berhasil!');
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      alert(`Gagal menyinkronkan data: ${err.message}. Pastikan izin deployment Google Apps Script diatur ke 'Anyone'.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleExportJsonBackup = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    downloadFile(jsonStr, `Backup_Product_Quest_KIK_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.classes && parsed.teams) {
            onUpdateState(parsed);
            alert('Data cadangan berhasil dipulihkan!');
          } else {
            alert('Format berkas JSON cadangan tidak sesuai.');
          }
        } catch (err) {
          alert('Gagal membaca berkas JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data ke kondisi awal? Seluruh perubahan lokal akan dikembalikan.')) {
      const reset = resetToDefaultState();
      onUpdateState(reset);
      alert('Data telah diatur ulang ke kondisi standar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Integrasi Penyimpanan & Google Sheets</h2>
            </div>
            <p className="text-xs text-slate-400">
              Kelola koneksi database Google Sheets (10 Sheets: CONFIG, CLASSES, USERS, TEAMS, MISSIONS, SUBMISSIONS, PRODUCTION_LOG, QC_RESULTS, REFLECTIONS, SCORES) atau mode penyimpanan lokal aman.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status Indicator Bar */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          state.sheetsConfig.connected
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/50 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            {state.sheetsConfig.connected ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <HardDrive className="w-6 h-6 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold font-mono tracking-wide block">
                STATUS KONEKSI DATABASE:
              </span>
              <span className="text-sm font-extrabold text-white">
                {state.sheetsConfig.connected
                  ? 'TERHUBUNG KE GOOGLE SHEETS API'
                  : 'BELUM TERHUBUNG — MENGGUNAKAN PENYIMPANAN LOKAL'}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {state.sheetsConfig.lastStatusMessage}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-400 block">Terakhir Sinkron:</span>
            <span className="text-xs font-mono font-bold text-white">
              {state.sheetsConfig.lastSyncAt
                ? new Date(state.sheetsConfig.lastSyncAt).toLocaleTimeString('id-ID')
                : 'Belum pernah'}
            </span>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('koneksi')}
            className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'koneksi'
                ? 'text-cyan-400 border-cyan-400 bg-slate-950/50'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            1. Konfigurasi Koneksi
          </button>
          <button
            onClick={() => setActiveTab('struktur')}
            className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'struktur'
                ? 'text-cyan-400 border-cyan-400 bg-slate-950/50'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            2. Struktur 10 Lembar Sheets
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'script'
                ? 'text-cyan-400 border-cyan-400 bg-slate-950/50'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            3. Kode Google Apps Script
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'backup'
                ? 'text-cyan-400 border-cyan-400 bg-slate-950/50'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            4. Cadangan & Ekspor CSV
          </button>
        </div>

        {/* Tab 1: Konfigurasi Koneksi */}
        {activeTab === 'koneksi' && (
          <div className="space-y-5">
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  URL Google Apps Script Web App:
                </label>
                <input
                  type="text"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-slate-950 border border-slate-700 text-xs font-mono rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Didapatkan setelah men-deploy kode Google Apps Script di Google Sheets Anda sebagai Aplikasi Web.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  ID Spreadsheet Google Sheets (Opsional):
                </label>
                <input
                  type="text"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full bg-slate-950 border border-slate-700 text-xs font-mono rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Test Results Output */}
            {testResult && (
              <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}>
                <strong>{testResult.success ? 'Uji Koneksi Berhasil!' : 'Uji Koneksi Gagal:'}</strong> {testResult.message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji Endpoint...' : 'Uji Koneksi Baca/Tulis'}</span>
              </button>

              <button
                onClick={handleSyncToSheets}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Kirim & Sinkronkan Data ke Sheets'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Struktur 10 Lembar Sheets */}
        {activeTab === 'struktur' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Berikut adalah skema arsitektur 10 lembar Google Sheets yang terorganisir untuk mapel KIK SMKS Kesehatan Fania Salsabila:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {GOOGLE_SHEET_SCHEMAS.map(s => (
                <div key={s.name} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{s.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{s.headers.length} Kolom</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{s.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    Header: {s.headers.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Kode Google Apps Script */}
        {activeTab === 'script' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">
                Salin dan tempelkan kode ini di Google Sheets (Ekstensi &gt; Apps Script):
              </span>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 text-slate-950 font-bold text-xs rounded hover:bg-cyan-400 cursor-pointer"
              >
                {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedScript ? 'Tersalin!' : 'Salin Kode Script'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-teal-300 max-h-72 overflow-y-auto leading-relaxed">
              {scriptCode}
            </pre>
          </div>
        )}

        {/* Tab 4: Cadangan & Ekspor CSV */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Ekspor Laporan CSV Multi-Tabel</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unduh seluruh ringkasan kelompok, status pengumpulan 6 misi, dan metrik FPY dalam format CSV yang dapat dibuka di Google Sheets atau Microsoft Excel.
                </p>
                <button
                  onClick={() => downloadFile(exportCsvReport(state), `Product_Quest_Laporan_${new Date().toISOString().slice(0, 10)}.csv`)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer"
                >
                  Unduh Laporan CSV
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Cadangan Lengkap JSON (Backup)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simpan seluruh basis data aplikasi (seluruh sesi kelas, submission, feedback guru, dan konfigurasi) ke dalam 1 file JSON cadangan.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJsonBackup}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Unduh JSON
                  </button>

                  <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer">
                    Pulihkan JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJsonBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Atur ulang seluruh data ke standar bawaan:</span>
              <button
                onClick={handleResetData}
                className="text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
              >
                Reset Database ke Kondisi Awal
              </button>
            </div>
          </div>
        )}

        {/* Footer Close */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
