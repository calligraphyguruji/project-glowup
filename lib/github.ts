import { RepoFile, RepoOverview } from "@/types/audit";

const GITHUB_REPO_REGEX = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_AUDIT || "10", 10);
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || "51200", 10); // 50 KB

const IGNORED_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "pdf", "mp4", "mp3",
  "zip", "tar", "gz", "rar", "7z", "woff", "woff2", "ttf", "eot",
  "exe", "dll", "so", "dylib", "bin", "iso", "pyc", "class"
]);

const IGNORED_PATHS = [
  "node_modules/", "vendor/", "venv/", ".venv/", "__pycache__/",
  ".git/", "dist/", "build/", ".next/", "out/", "coverage/",
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock", "Cargo.lock"
];

// Fallback probe matrix when GitHub API (60 req/hr) rate limits campus IP
const PROBE_FALLBACK_PATHS = [
  "package.json",
  "requirements.txt",
  "prisma/schema.prisma",
  "schema.prisma",
  "models.py",
  "server.ts",
  "server.js",
  "src/server.ts",
  "src/server.js",
  "app.ts",
  "app.js",
  "src/app.ts",
  "src/app.js",
  "index.js",
  "src/index.ts",
  "routes/index.js",
  "src/routes/index.ts",
  "routes/api.js",
  "docker-compose.yml",
  "Dockerfile",
  ".env.example",
  "README.md"
];

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export function validateGithubUrl(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim();
  const match = trimmed.match(GITHUB_REPO_REGEX);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  return { owner, repo };
}

function scoreFilePath(path: string): number {
  const lower = path.toLowerCase();

  // Top tier: Schemas, Data Models, Migrations
  if (lower.match(/(schema\.prisma|schema\.sql|\/models\/|\/entities\/|migration)/)) return 100;

  // Manifests & Dependency Definitions
  if (lower.match(/(package\.json|requirements\.txt|pom\.xml|cargo\.toml|go\.mod)/)) return 95;

  // Server Entrypoints & API Routes
  if (lower.match(/(server\.(ts|js)|app\.(ts|js)|index\.(ts|js)|main\.py|\/routes\/|\/api\/)/)) return 90;

  // Business Logic, Controllers, Services
  if (lower.match(/(\/controllers\/|\/services\/|\/handlers\/|\/middleware\/)/)) return 80;

  // Infrastructure & Configuration
  if (lower.match(/(docker-compose|dockerfile|\.env\.example)/)) return 60;

  return 30;
}

function shouldIgnorePath(path: string): boolean {
  for (const ignored of IGNORED_PATHS) {
    if (path.includes(ignored)) return true;
  }
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext && IGNORED_EXTENSIONS.has(ext)) return true;
  return false;
}

/**
 * Resilient CDN probe fallback when GitHub REST API rate limit is exceeded on shared network.
 */
async function fetchViaCdnFallback(
  owner: string,
  repo: string
): Promise<{ overview: RepoOverview; files: RepoFile[] }> {
  const branches = ["main", "master"];
  let activeBranch = "main";
  let foundFiles: RepoFile[] = [];

  for (const branch of branches) {
    const promises = PROBE_FALLBACK_PATHS.map(async (filePath) => {
      try {
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;

        const text = await res.text();
        const isTruncated = text.length > MAX_FILE_SIZE;
        const truncatedContent = isTruncated
          ? text.slice(0, MAX_FILE_SIZE) + "\n\n// ... [Truncated for audit analysis]"
          : text;

        const fileEntry: RepoFile = {
          path: filePath,
          content: truncatedContent,
          size: text.length,
          score: scoreFilePath(filePath),
          isTruncated,
        };
        return fileEntry;
      } catch {
        return null;
      }
    });

    const rawResults = await Promise.all(promises);
    const results: RepoFile[] = rawResults.filter((f): f is RepoFile => f !== null);
    if (results.length > 0) {
      activeBranch = branch;
      foundFiles = results;
      break;
    }
  }

  if (foundFiles.length === 0) {
    throw new GitHubApiError(
      `Could not locate standard code files for "${owner}/${repo}" via direct raw CDN inspection. Ensure repository is public and uses main or master branch.`,
      404
    );
  }

  foundFiles.sort((a, b) => b.score - a.score);
  const prioritized = foundFiles.slice(0, MAX_FILES);

  const overview: RepoOverview = {
    owner,
    repo,
    defaultBranch: activeBranch,
    totalFilesDiscovered: prioritized.length,
    filesIngested: prioritized.length,
    primaryLanguage: prioritized.some(f => f.path.endsWith(".ts")) ? "TypeScript" : "JavaScript",
  };

  return { overview, files: prioritized };
}

export async function fetchRepositoryFiles(
  owner: string,
  repo: string
): Promise<{ overview: RepoOverview; files: RepoFile[] }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ProjectGlowUp-Auditor/1.0",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  // Step 1: Fetch repo metadata (check 404, default branch, stars)
  let repoRes: Response;
  try {
    repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      cache: "no-store",
    });
  } catch {
    // Network failure to API -> try CDN fallback
    return fetchViaCdnFallback(owner, repo);
  }

  if (repoRes.status === 404) {
    throw new GitHubApiError(`Repository "${owner}/${repo}" was not found or is private.`, 404);
  }

  // If rate limit hit (common on shared college campus Wi-Fi), switch to resilient raw CDN fallback
  if (repoRes.status === 403 || repoRes.status === 429) {
    return fetchViaCdnFallback(owner, repo);
  }

  if (!repoRes.ok) {
    return fetchViaCdnFallback(owner, repo);
  }

  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || "main";

  // Step 2: Fetch Git Tree recursively
  let treeRes: Response;
  try {
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    treeRes = await fetch(treeUrl, { headers, cache: "no-store" });
  } catch {
    return fetchViaCdnFallback(owner, repo);
  }

  if (treeRes.status === 403 || treeRes.status === 429 || !treeRes.ok) {
    return fetchViaCdnFallback(owner, repo);
  }

  const treeData = await treeRes.json();
  if (!treeData.tree || !Array.isArray(treeData.tree) || treeData.tree.length === 0) {
    return fetchViaCdnFallback(owner, repo);
  }

  const rawTree: Array<{ path: string; type: string; size?: number }> = treeData.tree;
  const totalFilesDiscovered = rawTree.filter((item) => item.type === "blob").length;

  // Step 3: Score & filter candidates
  const candidates = rawTree
    .filter((item) => item.type === "blob" && !shouldIgnorePath(item.path))
    .map((item) => ({
      path: item.path,
      score: scoreFilePath(item.path),
      size: item.size || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_FILES);

  if (candidates.length === 0) {
    return fetchViaCdnFallback(owner, repo);
  }

  // Step 4: Fetch file contents (concurrent batch)
  const files: RepoFile[] = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${candidate.path}`;
        const rawRes = await fetch(rawUrl, {
          headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {},
          cache: "no-store",
        });

        if (!rawRes.ok) {
          return {
            path: candidate.path,
            content: `// [Unable to retrieve file content: HTTP ${rawRes.status}]`,
            size: 0,
            score: candidate.score,
          };
        }

        const text = await rawRes.text();
        const isTruncated = text.length > MAX_FILE_SIZE;
        const truncatedContent = isTruncated
          ? text.slice(0, MAX_FILE_SIZE) + "\n\n// ... [Truncated for audit analysis]"
          : text;

        return {
          path: candidate.path,
          content: truncatedContent,
          size: text.length,
          score: candidate.score,
          isTruncated,
        };
      } catch {
        return {
          path: candidate.path,
          content: "// [Failed to load file content]",
          size: 0,
          score: candidate.score,
        };
      }
    })
  );

  const overview: RepoOverview = {
    owner,
    repo,
    defaultBranch,
    totalFilesDiscovered,
    filesIngested: files.length,
    primaryLanguage: repoData.language,
    stars: repoData.stargazers_count,
  };

  return { overview, files };
}
