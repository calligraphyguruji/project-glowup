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

export interface AuditFinding {
  id: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  fileCitation: string;
  explanation: string;
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

export interface AuditResponse {
  repoSummary: RepoOverview;
  companyProfile: CompanyProfile;
  targetRole?: TargetRole;
  overallScore: number;
  findings: AuditFinding[];
  architectureComparison: ArchitectureComparison;
  stressTestScript: StressTestScript;
  interviewDefense: InterviewDefenseItem[];
  generatedAt: string;
  executionMode: "live_ai" | "heuristic_fallback" | "cached_demo";
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
