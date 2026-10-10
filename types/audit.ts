export type CompanyId = "razorpay" | "swiggy" | "zerodha" | "amazon";

export interface CompanyProfile {
  id: CompanyId;
  name: string;
  domain: string;
  tagline: string;
  keyConcerns: string[];
  sampleAntiPatterns: string[];
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
  companyId: CompanyId;
}

export interface AuditResponse {
  repoSummary: RepoOverview;
  companyProfile: CompanyProfile;
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
