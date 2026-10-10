export type CompanyId = string;

export interface CompanyProfile {
  id: CompanyId;
  name: string;
  domain: string;
  tagline: string;
  keyConcerns: string[];
  sampleAntiPatterns: string[];
  isCustom?: boolean;
  website?: string;
}

export type ExperienceLevel =
  | "internship"
  | "entry_level"
  | "junior"
  | "mid_level"
  | "senior"
  | "custom";

export interface TargetRole {
  id: string;
  title: string;
  experienceLevel: ExperienceLevel;
  focusAreas: string[];
  description?: string;
  isCustom?: boolean;
}

export interface AnalysisProfile {
  company: CompanyProfile;
  role: TargetRole;
}

export interface RepoFile {
  path: string;
  content: string;
  size: number;
  score: number;
  isTruncated?: boolean;
}

export interface RepoOverview {
  owner: string;
  repo: string;
  defaultBranch: string;
  totalFilesDiscovered: number;
  filesIngested: number;
  primaryLanguage?: string;
  stars?: number;
}

export type FindingSeverity = "critical" | "warning" | "optimization";

export interface FindingEvidence {
  path: string;
  startLine?: number;
  endLine?: number;
  excerpt?: string;
}

export interface AuditFinding {
  id: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  fileCitation: string;
  startLine?: number;
  endLine?: number;
  evidence?: FindingEvidence[];
  explanation: string;
  reasoning?: string;
  remediation: string;
  codeSnippet?: string;
  roleRelevance?: "critical" | "high" | "medium";
}

export interface ArchitectureComparison {
  currentMermaid: string;
  targetMermaid: string;
  currentSummary: string;
  targetSummary: string;
}

export interface StressTestScript {
  language: "javascript" | "python" | "bash";
  title: string;
  targetScenario: string;
  code: string;
  runInstructions: string;
}

export interface InterviewDefenseItem {
  question: string;
  interviewerIntent: string;
  talkingPoints: string[];
}

export interface AuditRequest {
  repoUrl: string;
  companyId?: string;
  customCompany?: CompanyProfile;
  roleId?: string;
  customRole?: TargetRole;
}

export interface ScoreBreakdown {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  criticalDeductions: number;
  warningDeductions: number;
  coverageAdjustment: number;
  factors: string[];
}

export interface AuditResponse {
  repoSummary: RepoOverview;
  companyProfile: CompanyProfile;
  targetRole?: TargetRole;
  overallScore: number;
  scoreBreakdown?: ScoreBreakdown;
  findings: AuditFinding[];
  architectureComparison: ArchitectureComparison;
  stressTestScript: StressTestScript;
  interviewDefense: InterviewDefenseItem[];
  generatedAt: string;
  executionMode: "live_ai" | "heuristic_fallback" | "cached_demo";
  aiDiagnostics?: {
    status: "configured_and_succeeded" | "key_missing" | "key_invalid" | "quota_exhausted" | "rate_limited" | "timeout" | "malformed_response" | "error";
    model: string;
    details?: string;
    timestamp: string;
    durationMs?: number;
  };
  detectedStack?: {
    type: string;
    frameworks: string[];
    databases: string[];
    endpointsCount: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    retryAfterSeconds?: number;
  };
}
