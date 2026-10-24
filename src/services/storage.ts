import { AppState, ClassSession, GoogleSheetsConfig, MissionSubmission, RubricCriteria, Team, UserProfile } from '../types';
import { INITIAL_APP_STATE, MISSION_METADATA } from '../data/initialData';

const STORAGE_KEY = 'product_quest_kik_fania_v1';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all top-level keys exist
      return {
        ...INITIAL_APP_STATE,
        ...parsed,
        sheetsConfig: {
          ...INITIAL_APP_STATE.sheetsConfig,
          ...(parsed.sheetsConfig || {}),
        },
      };
    }
  } catch (err) {
    console.error('Failed to load local state, using fallback:', err);
  }
  return INITIAL_APP_STATE;
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new Event('product_quest_state_updated'));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetToDefaultState(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  const state = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
  saveAppState(state);
  return state;
}

// Google Sheets 10-Sheet Structure Schema definitions
export const GOOGLE_SHEET_SCHEMAS = [
  {
    name: 'CONFIG',
    description: 'Konfigurasi global sekolah, mapel KIK, guru pengampu, dan status integrasi.',
    headers: ['KEY', 'VALUE', 'KETERANGAN', 'UPDATED_AT'],
  },
  {
    name: 'CLASSES',
    description: 'Daftar kelas pembelajaran, kode bergabung siswa, dan tema produk.',
    headers: ['CLASS_ID', 'NAME', 'JOIN_CODE', 'ACADEMIC_YEAR', 'TEACHER_NAME', 'SCHOOL_NAME', 'PRODUCT_THEME', 'ACTIVE', 'CREATED_AT'],
  },
  {
    name: 'USERS',
    description: 'Data akun siswa dan guru, peran, kelas terdaftar, dan afiliasi kelompok.',
    headers: ['USER_ID', 'NAME', 'ROLE', 'CLASS_ID', 'TEAM_ID', 'EMAIL', 'NISN', 'CREATED_AT'],
  },
  {
    name: 'TEAMS',
    description: 'Kelompok kerja produksi massal skala kecil, produk, target unit, dan progres misi.',
    headers: ['TEAM_ID', 'CLASS_ID', 'TEAM_NAME', 'PRODUCT_NAME', 'PRODUCT_TYPE', 'LEADER_NAME', 'MEMBERS', 'TARGET_UNITS', 'COMPLETED_MISSIONS', 'TOTAL_SCORE', 'CREATED_AT'],
  },
  {
    name: 'MISSIONS',
    description: 'Katalog 6 Misi Amazing Race KIK, estimasi durasi, dan indikator kelulusan.',
    headers: ['MISSION_NUMBER', 'CODE', 'TITLE', 'TAGLINE', 'ESTIMATED_TIME', 'BADGE_NAME'],
  },
  {
    name: 'SUBMISSIONS',
    description: 'Arsip pengumpulan tugas 6 misi tiap kelompok, status verifikasi, dan nilai akhir.',
    headers: ['SUBMISSION_ID', 'MISSION_NUMBER', 'TEAM_ID', 'CLASS_ID', 'SUBMITTED_BY', 'STATUS', 'FINAL_SCORE', 'SUBMITTED_AT', 'LAST_UPDATED_AT', 'SUMMARY_DATA'],
  },
  {
    name: 'PRODUCTION_LOG',
    description: 'Catatan log nyata proses produksi batch dari Misi 4 (waktu, unit riil, variansi bahan, K3).',
    headers: ['LOG_ID', 'SUBMISSION_ID', 'TEAM_ID', 'BATCH_NUMBER', 'START_TIME', 'END_TIME', 'UNITS_PRODUCED', 'RAW_MATERIALS_USED', 'MATERIAL_VARIANCE', 'SAFETY_AUDIT'],
  },
  {
    name: 'QC_RESULTS',
    description: 'Hasil inspeksi mutu dari Misi 5 (Total dicek, lolos pertama, First Pass Yield %, 5-Why, CAPA).',
    headers: ['QC_ID', 'SUBMISSION_ID', 'TEAM_ID', 'TOTAL_INSPECTED', 'PASSED_FIRST_INSPECTION', 'REWORK_COUNT', 'REJECT_COUNT', 'FIRST_PASS_YIELD_PCT', 'ROOT_CAUSE_5WHY', 'CAPA_ACTION'],
  },
  {
    name: 'REFLECTIONS',
    description: 'Catatan refleksi belajar mandiri siswa SMK dari Misi 6.',
    headers: ['REFLECTION_ID', 'SUBMISSION_ID', 'TEAM_ID', 'STUDENT_NAME', 'WHAT_LEARNED', 'BIGGEST_OBSTACLE', 'FUTURE_IMPROVEMENT', 'TIMESTAMP'],
  },
  {
    name: 'SCORES',
    description: 'Rincian skor per kriteria rubrik (Kesesuaian Prototipe, Mutu QC, SOP K3, Efisiensi HPP, Kolaborasi, Refleksi).',
    headers: ['SCORE_ID', 'SUBMISSION_ID', 'TEAM_ID', 'CRITERIA_ID', 'CRITERIA_TITLE', 'SCORE_GIVEN', 'MAX_SCORE', 'WEIGHT_PCT', 'TEACHER_FEEDBACK', 'GRADED_AT'],
  },
];

export async function testGoogleSheetsEndpoint(url: string, spreadsheetId: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  if (!url || !url.startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script tidak valid. Pastikan diawali https://script.google.com/...',
      latencyMs: 0,
    };
  }

  try {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=ping&spreadsheetId=${encodeURIComponent(spreadsheetId || '')}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Note: Apps Script might redirect, fetch handles 302
    });

    const latencyMs = Date.now() - start;
    if (res.ok) {
      const data = await res.json().catch(() => ({ status: 'connected' }));
      return {
        success: true,
        message: `Terhubung sukses ke Google Apps Script (${latencyMs}ms). Respon: ${data.message || 'Layanan aktif'}`,
        latencyMs,
      };
    } else {
      return {
        success: false,
        message: `Server merespon kode ${res.status}: ${res.statusText}. Periksa apakah Web App di-deploy dengan akses 'Anyone'.`,
        latencyMs,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      message: `Gagal menjangkau Web App: ${err.message || 'Network Error / CORS'}. Pastikan URL Web App benar dan di-deploy sebagai 'Execute as me' & 'Who has access: Anyone'.`,
      latencyMs,
    };
  }
}

export function generateGoogleAppsScriptCode(): string {
  return `/**
 * PRODUCT QUEST — AMAZING RACE PRODUKSI (SMKS Kesehatan Fania Salsabila Jambi)
 * Google Apps Script Web App Database Sync
 * Guru Pengampu: A. Rahman, S.Kom., Gr.
 * 
 * CARA MEMASANG:
 * 1. Buka Google Sheets baru di Google Drive Anda.
 * 2. Beri judul spreadsheet: "PRODUCT_QUEST_DATABASE_FANIA"
 * 3. Klik menu: Ekstensi > Apps Script.
 * 4. Hapus semua kode default, lalu tempelkan (paste) seluruh kode ini.
 * 5. Klik icon "Simpan" (Ctrl+S).
 * 6. Klik tombol "Deploy" (Terapkan) di kanan atas > "Deployment baru".
 * 7. Pilih tipe: "Aplikasi Web" (Web App).
 *    - Deskripsi: "Product Quest Sync API"
 *    - Jalankan sebagai (Execute as): "Saya" (Akun Anda)
 *    - Yang memiliki akses (Who has access): "Siapa saja" (Anyone)
 * 8. Klik "Deploy", izinkan akses akun Google jika diminta.
 * 9. Salin URL Aplikasi Web yang dihasilkan (berawalan https://script.google.com/macros/s/...)
 * 10. Tempelkan URL tersebut ke menu "Database Sheets" di aplikasi Product Quest!
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Product Quest Database Endpoint Aktif',
      spreadsheetName: ss.getName(),
      sheetsCount: ss.getSheets().length,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'init') {
    initSheetsStructure();
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      message: '10 Lembar Kerja (Sheets) berhasil diinisialisasi otomatis!'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'unknown_action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Pastikan seluruh 10 sheets sudah ada
    initSheetsStructure();
    
    if (data.action === 'sync_all' && data.payload) {
      saveSubmissionsToSheet(data.payload.submissions, ss);
      saveTeamsToSheet(data.payload.teams, ss);
      saveClassesToSheet(data.payload.classes, ss);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data berhasil disinkronisasi ke 10 lembar Google Sheets!',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'ignored' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function initSheetsStructure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsDef = [
    { name: 'CONFIG', headers: ['KEY', 'VALUE', 'KETERANGAN', 'UPDATED_AT'] },
    { name: 'CLASSES', headers: ['CLASS_ID', 'NAME', 'JOIN_CODE', 'ACADEMIC_YEAR', 'TEACHER_NAME', 'SCHOOL_NAME', 'PRODUCT_THEME', 'ACTIVE', 'CREATED_AT'] },
    { name: 'USERS', headers: ['USER_ID', 'NAME', 'ROLE', 'CLASS_ID', 'TEAM_ID', 'EMAIL', 'NISN', 'CREATED_AT'] },
    { name: 'TEAMS', headers: ['TEAM_ID', 'CLASS_ID', 'TEAM_NAME', 'PRODUCT_NAME', 'PRODUCT_TYPE', 'LEADER_NAME', 'MEMBERS', 'TARGET_UNITS', 'COMPLETED_MISSIONS', 'TOTAL_SCORE', 'CREATED_AT'] },
    { name: 'MISSIONS', headers: ['MISSION_NUMBER', 'CODE', 'TITLE', 'TAGLINE', 'ESTIMATED_TIME', 'BADGE_NAME'] },
    { name: 'SUBMISSIONS', headers: ['SUBMISSION_ID', 'MISSION_NUMBER', 'TEAM_ID', 'CLASS_ID', 'SUBMITTED_BY', 'STATUS', 'FINAL_SCORE', 'SUBMITTED_AT', 'LAST_UPDATED_AT', 'SUMMARY_DATA'] },
    { name: 'PRODUCTION_LOG', headers: ['LOG_ID', 'SUBMISSION_ID', 'TEAM_ID', 'BATCH_NUMBER', 'START_TIME', 'END_TIME', 'UNITS_PRODUCED', 'RAW_MATERIALS_USED', 'MATERIAL_VARIANCE', 'SAFETY_AUDIT'] },
    { name: 'QC_RESULTS', headers: ['QC_ID', 'SUBMISSION_ID', 'TEAM_ID', 'TOTAL_INSPECTED', 'PASSED_FIRST_INSPECTION', 'REWORK_COUNT', 'REJECT_COUNT', 'FIRST_PASS_YIELD_PCT', 'ROOT_CAUSE_5WHY', 'CAPA_ACTION'] },
    { name: 'REFLECTIONS', headers: ['REFLECTION_ID', 'SUBMISSION_ID', 'TEAM_ID', 'STUDENT_NAME', 'WHAT_LEARNED', 'BIGGEST_OBSTACLE', 'FUTURE_IMPROVEMENT', 'TIMESTAMP'] },
    { name: 'SCORES', headers: ['SCORE_ID', 'SUBMISSION_ID', 'TEAM_ID', 'CRITERIA_ID', 'CRITERIA_TITLE', 'SCORE_GIVEN', 'MAX_SCORE', 'WEIGHT_PCT', 'TEACHER_FEEDBACK', 'GRADED_AT'] }
  ];
  
  sheetsDef.forEach(function(item) {
    var sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(item.headers);
      sheet.getRange(1, 1, 1, item.headers.length).setFontWeight("bold").setBackground("#0B132B").setFontColor("#38BDF8");
      sheet.setFrozenRows(1);
    }
  });
}

function saveSubmissionsToSheet(submissions, ss) {
  if (!submissions || !submissions.length) return;
  var sheet = ss.getSheetByName('SUBMISSIONS');
  if (!sheet) return;
  
  // Ambil ID yang ada
  var existingIds = [];
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return r[0]; });
  }
  
  submissions.forEach(function(sub) {
    var summary = JSON.stringify(sub.payload || {});
    var idx = existingIds.indexOf(sub.id);
    var rowData = [
      sub.id,
      sub.missionNumber,
      sub.teamId,
      sub.classId,
      sub.submittedBy,
      sub.status,
      sub.finalScore || 0,
      sub.submittedAt,
      sub.lastUpdatedAt,
      summary.substring(0, 1000)
    ];
    
    if (idx >= 0) {
      sheet.getRange(idx + 2, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
      existingIds.push(sub.id);
    }
  });
}

function saveTeamsToSheet(teams, ss) {
  if (!teams || !teams.length) return;
  var sheet = ss.getSheetByName('TEAMS');
  if (!sheet) return;
  
  var existingIds = [];
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return r[0]; });
  }
  
  teams.forEach(function(t) {
    var idx = existingIds.indexOf(t.id);
    var rowData = [
      t.id,
      t.classId,
      t.name,
      t.productName,
      t.productType,
      t.leaderName,
      (t.members || []).join('; '),
      t.targetBatchUnits,
      (t.completedMissions || []).join(', '),
      t.totalScore || 0,
      t.createdAt
    ];
    
    if (idx >= 0) {
      sheet.getRange(idx + 2, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
      existingIds.push(t.id);
    }
  });
}

function saveClassesToSheet(classes, ss) {
  if (!classes || !classes.length) return;
  var sheet = ss.getSheetByName('CLASSES');
  if (!sheet) return;
  
  var existingIds = [];
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function(r) { return r[0]; });
  }
  
  classes.forEach(function(c) {
    var idx = existingIds.indexOf(c.id);
    var rowData = [
      c.id,
      c.name,
      c.code,
      c.academicYear,
      c.teacherName,
      c.schoolName,
      c.productTheme,
      c.active ? 'YA' : 'TIDAK',
      c.createdAt
    ];
    if (idx >= 0) {
      sheet.getRange(idx + 2, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
      existingIds.push(c.id);
    }
  });
}
`;
}

export function exportCsvReport(state: AppState): string {
  // Generate multi-section CSV report compatible with Excel and Google Sheets
  const lines: string[] = [];
  lines.push('=== LAPORAN EVALUASI PRODUKSI PRODUCT QUEST — AMAZING RACE KIK ===');
  lines.push(`Sekolah,"SMKS Kesehatan Fania Salsabila Kota Jambi"`);
  lines.push(`Guru Pengampu,"${state.currentUser.role === 'guru' ? state.currentUser.name : 'A. Rahman, S.Kom., Gr.'}"`);
  lines.push(`Tanggal Export,"${new Date().toLocaleString('id-ID')}"`);
  lines.push('');

  // 1. TEAMS SUMMARY
  lines.push('--- REKAP KELOMPOK & PROGRES PRODUKSI ---');
  lines.push('ID Kelompok,Nama Kelompok,Nama Produk,Jenis Produk,Ketua,Target Unit,Misi Selesai,Total Nilai');
  state.teams.forEach(t => {
    lines.push(`"${t.id}","${t.name}","${t.productName}","${t.productType}","${t.leaderName}",${t.targetBatchUnits},"${t.completedMissions.join('; ')}",${t.totalScore || 0}`);
  });
  lines.push('');

  // 2. SUBMISSIONS
  lines.push('--- STATUS PENGUMPULAN 6 MISI ---');
  lines.push('ID Submission,Nomor Misi,ID Kelompok,Pengirim,Status,Nilai,Tanggal Kumpul');
  state.submissions.forEach(s => {
    lines.push(`"${s.id}",${s.missionNumber},"${s.teamId}","${s.submittedBy}","${s.status}",${s.finalScore || 0},"${s.submittedAt}"`);
  });
  lines.push('');

  // 3. QUALITY CONTROL / FPY
  lines.push('--- REKAPITULASI QUALITY CONTROL & FPY (FIRST PASS YIELD) ---');
  lines.push('ID Kelompok,Kelompok,Batch Target,Total Diperiksa,Lulus Pertama (FPY),Rework,Reject,FPY (%)');
  state.teams.forEach(t => {
    const sub5 = state.submissions.find(s => s.teamId === t.id && s.missionNumber === 5);
    if (sub5 && 'firstPassYieldPercent' in sub5.payload) {
      const p = sub5.payload as any;
      lines.push(`"${t.id}","${t.name}",${t.targetBatchUnits},${p.totalInspected || 0},${p.passedFirstInspectionCount || 0},${p.reworkCount || 0},${p.rejectCount || 0},${p.firstPassYieldPercent || 0}%`);
    } else {
      lines.push(`"${t.id}","${t.name}",${t.targetBatchUnits},0,0,0,0,0%`);
    }
  });

  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
