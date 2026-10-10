import { RepoFile } from "@/types/audit";

export type StackType =
  | "frontend_react"
  | "frontend_vue"
  | "node_backend"
  | "python_backend"
  | "fullstack"
  | "library_tool";

export interface DetectedStack {
  type: StackType;
  frameworks: string[];
  databases: string[];
  stateOrCache: string[];
  discoveredEndpoints: Array<{ method: string; path: string; file: string }>;
  hasDatabase: boolean;
  hasApiEndpoints: boolean;
}

export function detectRepositoryStack(files: RepoFile[]): DetectedStack {
  const frameworks: Set<string> = new Set();
  const databases: Set<string> = new Set();
  const stateOrCache: Set<string> = new Set();
  const discoveredEndpoints: Array<{ method: string; path: string; file: string }> = [];

  let isReact = false;
  let isVue = false;
  let isNode = false;
  let isPython = false;

  for (const file of files) {
    const content = file.content;
    const lowerPath = file.path.toLowerCase();

    // Check package.json dependencies
    if (lowerPath.endsWith("package.json")) {
      isNode = true;
      if (content.includes('"react"')) {
        isReact = true;
        frameworks.add("React");
      }
      if (content.includes('"next"')) {
        frameworks.add("Next.js");
      }
      if (content.includes('"vue"')) {
        isVue = true;
        frameworks.add("Vue");
      }
      if (content.includes('"express"')) frameworks.add("Express");
      if (content.includes('"fastify"')) frameworks.add("Fastify");
      if (content.includes('"koa"')) frameworks.add("Koa");
      if (content.includes('"prisma"')) {
        databases.add("Prisma ORM");
      }
      if (content.includes('"mongoose"') || content.includes('"mongodb"')) {
        databases.add("MongoDB");
      }
      if (content.includes('"pg"') || content.includes('"postgres"')) {
        databases.add("PostgreSQL");
      }
      if (content.includes('"redis"') || content.includes('"ioredis"')) {
        stateOrCache.add("Redis");
      }
    }

    // Check Python manifests
    if (lowerPath.endsWith("requirements.txt") || lowerPath.endsWith("pyproject.toml")) {
      isPython = true;
      if (content.includes("fastapi")) frameworks.add("FastAPI");
      if (content.includes("django")) frameworks.add("Django");
      if (content.includes("flask")) frameworks.add("Flask");
      if (content.includes("sqlalchemy")) databases.add("SQLAlchemy");
      if (content.includes("psycopg")) databases.add("PostgreSQL");
      if (content.includes("redis")) stateOrCache.add("Redis");
    }

    // Check file extensions and schemas
    if (lowerPath.endsWith(".py")) isPython = true;
    if (lowerPath.endsWith(".jsx") || lowerPath.endsWith(".tsx")) isReact = true;
    if (lowerPath.includes("schema.prisma")) databases.add("Prisma ORM");

    // Discover actual HTTP endpoints in source files
    // Express / Fastify / Koa: app.get('/...', ...), router.post('/...', ...)
    const routeRegex = /(?:app|router)\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      if (discoveredEndpoints.length < 10) {
        discoveredEndpoints.push({
          method: match[1].toUpperCase(),
          path: match[2],
          file: file.path,
        });
      }
    }

    // FastAPI / Flask: @app.get('/...'), @router.post('/...')
    const pyRouteRegex = /@(?:app|router)\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi;
    while ((match = pyRouteRegex.exec(content)) !== null) {
      if (discoveredEndpoints.length < 10) {
        discoveredEndpoints.push({
          method: match[1].toUpperCase(),
          path: match[2],
          file: file.path,
        });
      }
    }
  }

  // Determine Stack Type
  let type: StackType = "library_tool";
  if ((isReact || isVue) && (isNode || isPython) && discoveredEndpoints.length > 0) {
    type = "fullstack";
  } else if (isReact) {
    type = "frontend_react";
  } else if (isVue) {
    type = "frontend_vue";
  } else if (isPython) {
    type = "python_backend";
  } else if (isNode) {
    type = "node_backend";
  }

  return {
    type,
    frameworks: Array.from(frameworks),
    databases: Array.from(databases),
    stateOrCache: Array.from(stateOrCache),
    discoveredEndpoints,
    hasDatabase: databases.size > 0,
    hasApiEndpoints: discoveredEndpoints.length > 0,
  };
}
