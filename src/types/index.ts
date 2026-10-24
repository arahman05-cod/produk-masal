export type Role = 'guru' | 'siswa';

export type MissionStatus = 'belum_dimulai' | 'sedang_dikerjakan' | 'dikumpulkan' | 'perlu_revisi' | 'selesai_diverifikasi';

export interface ClassSession {
  id: string;
  name: string;
  code: string;
  academicYear: string;
  teacherName: string;
  schoolName: string;
  productTheme: string;
  createdAt: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  classId: string;
  teamId?: string;
  email?: string;
  nisn?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  classId: string;
  name: string;
  productName: string;
  productType: string; // e.g. Hand Sanitizer Herbal, Sabun Antiseptik, Jamu Temulawak Instan
  leaderId: string;
  leaderName: string;
  members: string[]; // member names or user IDs
  targetBatchUnits: number;
  completedMissions: number[]; // e.g. [1, 2]
  totalScore: number;
  createdAt: string;
}

export interface RubricCriteria {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  weightPercent: number;
}

export interface RubricScoreItem {
  criteriaId: string;
  score: number;
  notes?: string;
}

export interface FeedbackRecord {
  teacherId: string;
  teacherName: string;
  date: string;
  comment: string;
  status: MissionStatus;
  rubricScores?: RubricScoreItem[];
  totalScore?: number;
}

export interface Mission1Submission {
  prototypeName: string;
  prototypeSpecs: {
    physical: string;
    sensory: string;
    packaging: string;
    safetyTolerances: string;
  };
  defectFindings: {
    defectName: string;
    description: string;
    severity: 'rendah' | 'sedang' | 'kritis';
  }[];
  qualityStandardDraft: string;
  quizScore: number;
}

export interface MaterialCostItem {
  id: string;
  name: string;
  specification: string;
  unit: string;
  qtyPerUnit: number;
  unitPrice: number;
  batchQty: number;
  totalCost: number;
}

export interface Mission2Submission {
  plannedBatchUnits: number;
  materials: MaterialCostItem[];
  packagingCost: number;
  laborCost: number;
  overheadCost: number;
  totalProductionCost: number;
  hppPerUnit: number;
  targetSellingPrice: number;
  estimatedMarginPercent: number;
  sopSteps: {
    stepNumber: number;
    title: string;
    action: string;
    criticalControlPoint: string;
    picRole: string;
  }[];
  budgetStrategyNotes: string;
}

export interface Mission3Submission {
  pilotUnitCount: number;
  k3Checklist: {
    item: string;
    checked: boolean;
  }[];
  equipmentChecklist: {
    toolName: string;
    calibrationStatus: 'terkalibrasi' | 'belum' | 'tidak_perlu';
    notes: string;
  }[];
  problemLogs: {
    issue: string;
    cause: string;
    solution: string;
  }[];
  proofEvidenceUrl: string;
  proofNotes: string;
}

export interface ProductionBatchLogItem {
  batchNumber: string;
  startTime: string;
  endTime: string;
  unitsProduced: number;
  rawMaterialUsedSummary: string;
  materialVarianceNotes: string;
  safetyIncidents: string;
  operatorNotes: string;
}

export interface Mission4Submission {
  actualBatchUnits: number;
  productionTimeMinutes: number;
  batchLog: ProductionBatchLogItem[];
  k3AdherenceScore: number; // self-rating 1-10
  collaborationNotes: string;
  evidencePhotoUrl: string;
}

export interface QCInspectionItem {
  unitId: string;
  visualAppearance: 'lulus' | 'tidak_lulus';
  nettoVolumeWeight: number; // e.g. 100 ml
  phOrViscosity: string;
  sealIntegrity: 'rapat' | 'bocor';
  labelAccuracy: 'lulus' | 'cacat';
  passFirstInspection: boolean;
  defectCategory?: string;
}

export interface Mission5Submission {
  totalInspected: number;
  passedFirstInspectionCount: number;
  reworkCount: number;
  rejectCount: number;
  firstPassYieldPercent: number; // FPY %
  fiveWhyAnalysis: {
    problemStatement: string;
    why1: string;
    why2: string;
    why3: string;
    why4: string;
    why5: string;
    rootCause: string;
  };
  capaPlan: {
    correctiveAction: string;
    preventiveAction: string;
    pic: string;
    deadline: string;
  }[];
  evidenceNotes: string;
}

export interface Mission6Submission {
  finalProductName: string;
  finalProductDescription: string;
  totalBatchCompleted: number;
  finalFPYPercent: number;
  actualCostPerUnit: number;
  plannedCostPerUnit: number;
  costVariancePercent: number;
  finalGalleryUrls: string[];
  keyImprovementsMade: string;
  teamPresentationSummary: string;
  individualReflections: {
    studentName: string;
    whatLearned: string;
    biggestObstacle: string;
    futureImprovement: string;
  }[];
}

export type MissionSubmissionPayload = 
  | Mission1Submission 
  | Mission2Submission 
  | Mission3Submission 
  | Mission4Submission 
  | Mission5Submission 
  | Mission6Submission;

export interface MissionSubmission {
  id: string;
  missionNumber: number; // 1 to 6
  teamId: string;
  classId: string;
  submittedBy: string;
  submittedAt: string;
  lastUpdatedAt: string;
  status: MissionStatus;
  payload: MissionSubmissionPayload;
  feedbacks: FeedbackRecord[];
  finalScore?: number;
}

export interface Badge {
  id: string;
  missionNumber: number;
  title: string;
  subtitle: string;
  iconName: string;
  criteria: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GoogleSheetsConfig {
  connected: boolean;
  mode: 'local' | 'google_sheets';
  webAppUrl: string;
  spreadsheetId: string;
  lastSyncAt: string | null;
  lastStatusMessage: string;
}

export interface AppState {
  classes: ClassSession[];
  currentClassId: string;
  currentUser: UserProfile;
  teams: Team[];
  submissions: MissionSubmission[];
  rubricConfig: RubricCriteria[];
  sheetsConfig: GoogleSheetsConfig;
}
