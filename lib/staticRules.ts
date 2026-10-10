import { AuditFinding, CompanyId, RepoFile } from "@/types/audit";

function findLineNumber(content: string, substring: string): number | undefined {
  const index = content.indexOf(substring);
  if (index === -1) return undefined;
  return content.slice(0, index).split("\n").length;
}

export function runStaticAudit(files: RepoFile[], companyId: CompanyId): AuditFinding[] {
  const findings: AuditFinding[] = [];

  for (const file of files) {
    const content = file.content;
    const lowerPath = file.path.toLowerCase();
    const isCode =
      lowerPath.endsWith(".js") ||
      lowerPath.endsWith(".jsx") ||
      lowerPath.endsWith(".ts") ||
      lowerPath.endsWith(".tsx") ||
      lowerPath.endsWith(".py") ||
      lowerPath.endsWith(".go") ||
      lowerPath.endsWith(".java") ||
      lowerPath.endsWith(".php") ||
      lowerPath.endsWith(".rb") ||
      lowerPath.endsWith(".prisma") ||
      lowerPath.endsWith(".sql") ||
      lowerPath.endsWith(".json") ||
      lowerPath.endsWith(".yaml") ||
      lowerPath.endsWith(".yml");

    if (!isCode) continue;

    // 1. Hardcoded Secrets & API Keys (Universal Security)
    const secretRegex = /(const|let|var|export\s+const|[a-zA-Z0-9_]+)\s*=\s*['"](sk_live_[a-zA-Z0-9_\-]{16,}|rzp_live_[a-zA-Z0-9_\-]{14,}|ghp_[a-zA-Z0-9]{30,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z-_]{35}|(?:bearer\s+)?[a-zA-Z0-9_\-\.]{32,}|(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9_\-]{24,})['"]/i;
    const namedSecretRegex = /(apiKey|api_key|secret|private_key|auth_token|jwt_secret|aws_secret_access_key|password)\s*[:=]\s*['"]([^'"]{6,})['"]/i;
    const secretMatch = content.match(namedSecretRegex) || content.match(secretRegex);
    if (secretMatch && !secretMatch[0].includes("process.env") && !secretMatch[0].includes("System.getenv") && !secretMatch[0].includes("os.environ")) {
      const line = findLineNumber(content, secretMatch[0]);
      findings.push({
        id: `static-secret-${file.path}`,
        severity: "critical",
        category: "Security & Credential Isolation",
        title: `Hardcoded API secret or credential detected in source file`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: secretMatch[0].replace(/(['"])[^'"]{4,}(['"])/, "$1********$2"),
          },
        ],
        reasoning: "Static credentials checked into source code are permanently captured in git history and bundled into deployments.",
        explanation: `Hardcoded credentials in repository files leak into version control and client bundles, exposing backend infrastructure to unauthorized access.`,
        remediation: `Move secret to environment variables accessed via process.env or secret managers (AWS Secrets Manager, HashiCorp Vault).`,
        codeSnippet: `// Secure pattern:\nconst apiKey = process.env.SERVICE_API_KEY;`,
      });
    }

    // 2. Command Injection (CWE-78: OS Command Injection)
    const cmdInjectRegex = /(child_process|exec|execSync|spawn|popen|os\.system|subprocess\.Popen|subprocess\.run)\s*\(\s*(?:`[^`]*\$\{[^}]+\}[^`]*`|['"][^'"]*['"]\s*\+\s*[a-zA-Z0-9_.]+|\w+)/;
    const cmdMatch = content.match(cmdInjectRegex);
    if (cmdMatch) {
      const line = findLineNumber(content, cmdMatch[0]);
      findings.push({
        id: `static-cmd-inject-${file.path}`,
        severity: "critical",
        category: "Injection & Remote Code Execution",
        title: `Potential OS command injection via unescaped shell execution (${cmdMatch[1]})`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: cmdMatch[0],
          },
        ],
        reasoning: "Passing unsanitized strings to shell execution primitives allows arbitrary commands to be executed under the host process privileges.",
        explanation: `OS command injection allows malicious actors to execute arbitrary commands, exfiltrate server environment variables, or spawn reverse shells.`,
        remediation: `Use parameterized APIs without shell invocation (e.g. execFile or child_process.spawn with an argument array instead of a shell string).`,
        codeSnippet: `// Vulnerable:\nexec('ping -c 1 ' + userInput);\n\n// Hardened:\nexecFile('ping', ['-c', '1', userInput]);`,
      });
    }

    // 3. SQL Injection / Raw Dynamic Query Construction (CWE-89)
    const sqlConcatRegex = /(?:query|execute|rawQuery|findRaw|raw)\s*\(\s*(?:`SELECT[^`]*\$\{[^}]+\}[^`]*`|`INSERT[^`]*\$\{[^}]+\}[^`]*`|`UPDATE[^`]*\$\{[^}]+\}[^`]*`|`DELETE[^`]*\$\{[^}]+\}[^`]*`|['"](?:SELECT|INSERT|UPDATE|DELETE)[^'"]*['"]\s*\+\s*[a-zA-Z0-9_.]+)/i;
    const sqlMatch = content.match(sqlConcatRegex);
    if (sqlMatch) {
      const line = findLineNumber(content, sqlMatch[0]);
      findings.push({
        id: `static-sqli-${file.path}`,
        severity: "critical",
        category: "Data Integrity & Injection Safety",
        title: `Unsanitized SQL query string concatenation detected`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: sqlMatch[0],
          },
        ],
        reasoning: "Dynamic string interpolation inside SQL queries bypasses parser boundary checks, allowing SQL injection attacks.",
        explanation: `SQL injection allows attackers to bypass authentication, dump database records, or modify transactional ledgers.`,
        remediation: `Use parameterized queries or prepared statements with placeholder variables ($1, ?, :param).`,
        codeSnippet: `// Parameterized query:\nawait db.query('SELECT * FROM users WHERE id = $1', [userId]);`,
      });
    }

    // 4. Server-Side Request Forgery (SSRF) / Untrusted Outbound Fetch (CWE-918)
    const ssrfRegex = /(?:axios\.(?:get|post|put|delete)|fetch|http\.get|request)\s*\(\s*(?:req\.(?:query|body|params)\.[a-zA-Z0-9_]+|url|targetUrl|webhookUrl|redirectUrl)\b/i;
    const ssrfMatch = content.match(ssrfRegex);
    if (ssrfMatch) {
      const line = findLineNumber(content, ssrfMatch[0]);
      findings.push({
        id: `static-ssrf-${file.path}`,
        severity: "critical",
        category: "Network & Boundary Isolation",
        title: `Unvalidated outbound HTTP request allows potential Server-Side Request Forgery (SSRF)`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: ssrfMatch[0],
          },
        ],
        reasoning: "Dispatching outbound HTTP requests to user-supplied URLs allows attackers to target cloud metadata endpoints (169.254.169.254) or internal services.",
        explanation: `SSRF vulnerabilities allow attackers to query private RFC-1918 subnets and cloud metadata services, leaking IAM credentials and internal microservice tokens.`,
        remediation: `Validate target URLs against an explicit allowlist and block private IP ranges (0.0.0.0/8, 10.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12, 192.168.0.0/16).`,
        codeSnippet: `// SSRF defense:\nconst parsed = new URL(targetUrl);\nif (!ALLOWED_HOSTS.has(parsed.hostname)) throw new Error('Untrusted host');`,
      });
    }

    // 5. Path Traversal / Arbitrary File Read (CWE-22)
    const pathTraversalRegex = /(?:fs\.(?:readFile|readFileSync|createReadStream)|open)\s*\(\s*(?:(?:path\.join|path\.resolve)\([^)]*(?:req\.|params\.|query\.)[^)]*\)|(?:req\.(?:query|params|body)\.[a-zA-Z0-9_]+))/i;
    const pathMatch = content.match(pathTraversalRegex);
    if (pathMatch) {
      const line = findLineNumber(content, pathMatch[0]);
      findings.push({
        id: `static-path-traversal-${file.path}`,
        severity: "critical",
        category: "Filesystem & Access Control",
        title: `Path traversal vulnerability in direct filesystem access`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: pathMatch[0],
          },
        ],
        reasoning: "Concatenating user-supplied filenames without path normalization allows '../' escape into sensitive system directories (/etc/passwd, .env).",
        explanation: `Arbitrary file read vulnerabilities permit attackers to extract server configuration files, private SSH keys, and application environment secrets.`,
        remediation: `Sanitize paths with path.normalize, strip leading dots/slashes, and verify resolved path starts with base directory.`,
        codeSnippet: `const safePath = path.resolve(BASE_DIR, path.basename(userFileName));\nif (!safePath.startsWith(BASE_DIR)) throw new Error('Path traversal');`,
      });
    }

    // 6. Cross-Site Scripting (XSS) / Unsafe HTML Injection (CWE-79)
    const xssRegex = /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*(?!DOMPurify|sanitize)[^}]+\}/;
    const xssMatch = content.match(xssRegex);
    if (xssMatch) {
      const line = findLineNumber(content, xssMatch[0]);
      findings.push({
        id: `static-xss-${file.path}`,
        severity: "critical",
        category: "Client Security & DOM Integrity",
        title: `Unsanitized DOM rendering via dangerouslySetInnerHTML (DOM XSS risk)`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: xssMatch[0],
          },
        ],
        reasoning: "Rendering raw HTML without sanitization opens the client browser to stored or reflected Cross-Site Scripting.",
        explanation: `XSS attacks allow adversaries to hijack user sessions, steal authorization tokens from localStorage/cookies, and perform authenticated state mutations.`,
        remediation: `Pass unescaped HTML strings through DOMPurify.sanitize before assigning to dangerouslySetInnerHTML.`,
        codeSnippet: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }}`,
      });
    }

    // 7. Broken Cryptographic Algorithms (CWE-327 / CWE-328)
    const brokenCryptoRegex = /(?:crypto\.createHash\(['"](?:md5|sha1)['"]\)|hashlib\.(?:md5|sha1)\(\)|MD5\(|SHA1\()/i;
    const cryptoMatch = content.match(brokenCryptoRegex);
    if (cryptoMatch) {
      const line = findLineNumber(content, cryptoMatch[0]);
      findings.push({
        id: `static-crypto-${file.path}`,
        severity: "warning",
        category: "Cryptographic Hygiene",
        title: `Use of weak or collision-vulnerable cryptographic hash (${cryptoMatch[0]})`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: cryptoMatch[0],
          },
        ],
        reasoning: "MD5 and SHA-1 have known collision vulnerabilities and must not be used for signature generation or password hashing.",
        explanation: `Cryptographic collisions permit forging digital signatures, tokens, and certificates. High-security environments mandate SHA-256, SHA-512, or argon2id.`,
        remediation: `Upgrade hash algorithm to SHA-256 for integrity hashing or argon2id / bcrypt for password storage.`,
        codeSnippet: `// Upgraded:\ncrypto.createHash('sha256').update(data).digest('hex');`,
      });
    }

    // 8. Permissive Cross-Origin Resource Sharing (CORS) (CWE-942)
    const corsRegex = /(?:origin\s*:\s*['"]\*['"]|cors\(\s*\{\s*origin\s*:\s*true\s*\}|res\.header\(['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\))/i;
    const corsMatch = content.match(corsRegex);
    if (corsMatch) {
      const line = findLineNumber(content, corsMatch[0]);
      findings.push({
        id: `static-cors-${file.path}`,
        severity: "warning",
        category: "API & Boundary Security",
        title: `Wildcard CORS policy (Access-Control-Allow-Origin: *) permits arbitrary origin requests`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: corsMatch[0],
          },
        ],
        reasoning: "Setting CORS origin to '*' allows any third-party malicious domain to execute cross-origin requests against your API.",
        explanation: `Overly permissive CORS headers expose authenticated internal endpoints and sensitive API responses to cross-origin exfiltration.`,
        remediation: `Restrict CORS origin to an explicit array of trusted domain origins.`,
        codeSnippet: `cors({ origin: ['https://app.yourdomain.com'] })`,
      });
    }

    // 9. Disabled TLS / SSL Certificate Verification (CWE-295)
    const tlsDisabledRegex = /(?:rejectUnauthorized\s*:\s*false|verify\s*=\s*False|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0['"]?)/i;
    const tlsMatch = content.match(tlsDisabledRegex);
    if (tlsMatch) {
      const line = findLineNumber(content, tlsMatch[0]);
      findings.push({
        id: `static-tls-${file.path}`,
        severity: "critical",
        category: "Transport Layer Security",
        title: `SSL/TLS certificate verification disabled (Man-in-the-Middle risk)`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: tlsMatch[0],
          },
        ],
        reasoning: "Disabling certificate validation (rejectUnauthorized: false) allows Man-in-the-Middle attackers to intercept and decrypt internal network traffic.",
        explanation: `Bypassing TLS validation permits attackers on the local network or upstream proxy to tamper with outbound requests and inject malicious payloads.`,
        remediation: `Install trusted root certificates or private CA bundles instead of disabling TLS validation.`,
        codeSnippet: `// Enforce TLS validation:\nrejectUnauthorized: true`,
      });
    }

    // 10. Unsafe Deserialization / YAML Load (CWE-502)
    const unsafeYamlRegex = /(?:yaml\.load\([^,)]+\)(?!.*SafeLoader)|pickle\.loads?|unserialize\()/;
    const yamlMatch = content.match(unsafeYamlRegex);
    if (yamlMatch) {
      const line = findLineNumber(content, yamlMatch[0]);
      findings.push({
        id: `static-deserialization-${file.path}`,
        severity: "critical",
        category: "Input Validation & Object Serialization",
        title: `Unsafe object deserialization allows arbitrary code execution`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: yamlMatch[0],
          },
        ],
        reasoning: "Deserializing untrusted streams without schema enforcement allows payload instantiation of arbitrary executable objects.",
        explanation: `Insecure deserialization primitives allow attackers to instantiate gadgets leading to immediate Remote Code Execution.`,
        remediation: `Use safe loaders (yaml.safe_load, JSON.parse) instead of generic object deserializers.`,
        codeSnippet: `// Safe YAML:\nyaml.safe_load(file_content)`,
      });
    }

    // 11. Insecure Cookie Flags (CWE-614 / CWE-1004)
    const cookieRegex = /(?:res\.cookie\([^)]*(?:httpOnly\s*:\s*false|secure\s*:\s*false)[^)]*\)|document\.cookie\s*=)/i;
    const cookieMatch = content.match(cookieRegex);
    if (cookieMatch) {
      const line = findLineNumber(content, cookieMatch[0]);
      findings.push({
        id: `static-cookie-${file.path}`,
        severity: "warning",
        category: "Session & Credential Protection",
        title: `Insecure cookie configuration missing HttpOnly or Secure flags`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: cookieMatch[0],
          },
        ],
        reasoning: "Session cookies without httpOnly: true can be read by JavaScript during XSS attacks. Cookies without secure: true transmit over cleartext HTTP.",
        explanation: `Missing security flags on session cookies expose user authentication state to network sniffing and client-side credential theft.`,
        remediation: `Set httpOnly: true, secure: true, and sameSite: 'lax' (or 'strict') on all authentication cookies.`,
        codeSnippet: `res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' });`,
      });
    }

    // 12. Fintech Float Monetary Property
    const floatRegex = /(amount|balance|price|fee|total|cost|payout|credit)\s*(?::\s*|\s+)(Float|Number|float|double)\b/i;
    const floatMatch = content.match(floatRegex);
    if (floatMatch) {
      const line = findLineNumber(content, floatMatch[0]);
      findings.push({
        id: `static-float-${file.path}`,
        severity: "critical",
        category: "Financial Data Integrity",
        title: `Floating-point data type used for monetary property "${floatMatch[1]}"`,
        fileCitation: file.path,
        startLine: line,
        endLine: line,
        evidence: [
          {
            path: file.path,
            startLine: line,
            endLine: line,
            excerpt: floatMatch[0],
          },
        ],
        reasoning: "Floating-point arithmetic suffers from IEEE 754 precision drift (0.1 + 0.2 !== 0.3), causing financial reconciliation discrepancies.",
        explanation: `Floating-point arithmetic produces precision drift. Production payment systems mandate integer cents/paise or fixed-precision Decimal.`,
        remediation: `Change "${floatMatch[0]}" to store integer paise (e.g. "amount: Int") or use Decimal with fixed precision.`,
        codeSnippet: `// Vulnerable:\n${floatMatch[0]}\n\n// Hardened:\n${floatMatch[1]}: Int // in paise/cents`,
      });
    }

    // 13. Missing Idempotency Key on Transaction / Mutation Endpoint
    if (
      lowerPath.includes("route") ||
      lowerPath.includes("controller") ||
      lowerPath.includes("api") ||
      lowerPath.includes("server") ||
      lowerPath.includes("app")
    ) {
      const hasPaymentEndpoint = /payment|order|checkout|charge|transfer|payout|debit|credit/i.test(content);
      const hasIdempotency = /idempotency-key|idempotencykey|x-idempotency/i.test(content);
      if (hasPaymentEndpoint && !hasIdempotency) {
        const matchedLine = content.match(/app\.(post|put)\([^)]+\)|router\.(post|put)\([^)]+\)|@app\.(post|put)\([^)]+\)/i);
        const line = matchedLine ? findLineNumber(content, matchedLine[0]) : 1;
        findings.push({
          id: `static-idempotency-${file.path}`,
          severity: "critical",
          category: "Concurrency & Race Safety",
          title: `Transaction endpoint processes mutations without Idempotency-Key validation`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: matchedLine ? matchedLine[0] : "Transaction route definition",
            },
          ],
          reasoning: "Unbounded transaction re-execution without an idempotency guard leads to duplicate state modifications and double-charges.",
          explanation: `Network timeouts cause clients or webhook dispatchers to retry. Without idempotency guards, retried requests double-charge customers or duplicate orders.`,
          remediation: `Require "Idempotency-Key" header, cache in Redis with TTL, and return cached response on duplicate attempts.`,
          codeSnippet: `const idempotencyKey = req.headers['idempotency-key'];\nif (!idempotencyKey) return res.status(400).json({ error: 'Missing Idempotency-Key' });`,
        });
      }
    }

    // 14. Geospatial Coordinate Unindexed Scan
    if (lowerPath.includes("schema") || lowerPath.includes("model") || lowerPath.includes("migration")) {
      const hasGeo = /latitude|longitude|lat|lng|coordinates/i.test(content);
      const hasSpatialIndex = /gist|spatial|2dsphere|geospatial/i.test(content);
      if (hasGeo && !hasSpatialIndex) {
        const geoMatch = content.match(/latitude|longitude|coordinates/i);
        const line = geoMatch ? findLineNumber(content, geoMatch[0]) : 1;
        findings.push({
          id: `static-geo-index-${file.path}`,
          severity: "critical",
          category: "Geospatial Performance",
          title: `Coordinates stored without spatial index (PostGIS GIST or MongoDB 2dsphere)`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: geoMatch ? geoMatch[0] : "Coordinate schema definition",
            },
          ],
          reasoning: "Geospatial radius queries without R-Tree or GIST indexes trigger full table scans O(N), blocking high-throughput assignment loops.",
          explanation: `High-frequency radius and proximity queries trigger full sequential table scans, causing severe latency spikes under location lookups.`,
          remediation: `Add a GIST index in PostgreSQL or 2dsphere index in MongoDB on coordinate columns.`,
          codeSnippet: `// PostgreSQL:\nCREATE INDEX idx_locations_geom ON locations USING GIST (geom);`,
        });
      }
    }

    // 15. Missing Database Index on High-Frequency Foreign Keys
    if (lowerPath.includes("schema") || lowerPath.includes("model")) {
      const foreignKeyRegex = /(userId|customerId|orderId|accountId|merchantId|productId)\s*:\s*(String|Int|ObjectId)/i;
      const match = content.match(foreignKeyRegex);
      const hasIndex = /@@index|@index|\.index\(/i.test(content);
      if (match && !hasIndex) {
        const line = findLineNumber(content, match[0]);
        findings.push({
          id: `static-fk-index-${file.path}`,
          severity: "warning",
          category: "Database Indexing & Scalability",
          title: `Foreign key "${match[1]}" missing lookup index`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: match[0],
            },
          ],
          reasoning: "Foreign keys queried in high-frequency JOINs trigger sequential table scans without B-Tree indexing.",
          explanation: `Queries filtering on "${match[1]}" trigger full sequential scans as table size scales, degrading API response times under high concurrency.`,
          remediation: `Add an index on "${match[1]}" in the schema definition.`,
          codeSnippet: `// Prisma:\n@@index([${match[1]}])`,
        });
      }
    }

    // 16. Raw Unstructured Console Logging in Server Handlers
    if (lowerPath.includes("route") || lowerPath.includes("server") || lowerPath.includes("controller") || lowerPath.includes("service")) {
      const consoleMatches = content.match(/console\.(log|error|warn)\(/g) || [];
      if (consoleMatches.length > 2) {
        const line = findLineNumber(content, "console.log(") || findLineNumber(content, "console.error(") || 1;
        findings.push({
          id: `static-logging-${file.path}`,
          severity: "warning",
          category: "Observability & Telemetry",
          title: `Unstructured console.log detected (${consoleMatches.length} occurrences)`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: `console.log(...) [${consoleMatches.length} occurrences]`,
            },
          ],
          reasoning: "Synchronous console I/O blocks the single-threaded Node.js event loop and outputs unstructured text that cannot be indexed by CloudWatch or ELK.",
          explanation: `High-scale distributed systems require structured JSON logging with correlation IDs. Raw console.log blocks the event loop and cannot be ingested by central log aggregators.`,
          remediation: `Replace raw console calls with structured loggers (Pino, Winston) attaching correlation IDs.`,
        });
      }
    }

    // 17. Unhandled Promise Rejections & Missing Try/Catch in Async Route Handlers
    if (lowerPath.includes("route") || lowerPath.includes("controller")) {
      const asyncWithoutTry = /async\s+(?:function|\([^)]*\)\s*=>)[^{]*\{(?![^}]*try\s*\{)/.test(content);
      if (asyncWithoutTry) {
        const line = findLineNumber(content, "async") || 1;
        findings.push({
          id: `static-trycatch-${file.path}`,
          severity: "warning",
          category: "Resilience & Fault Tolerance",
          title: `Async handler missing structured try-catch or error-wrapping boundary`,
          fileCitation: file.path,
          startLine: line,
          endLine: line,
          evidence: [
            {
              path: file.path,
              startLine: line,
              endLine: line,
              excerpt: "async handler without enclosing try/catch",
            },
          ],
          reasoning: "Unhandled promise rejections crash the Node.js process or leave HTTP sockets hanging open indefinitely.",
          explanation: `Unhandled promise rejections in async route handlers cause server process termination or hung HTTP sockets.`,
          remediation: `Enclose async operations in try-catch blocks or use an async-handler wrapper middleware.`,
        });
      }
    }
  }

  // Fallback Optimization finding if clean
  if (findings.length === 0) {
    findings.push({
      id: "static-pass-clean",
      severity: "optimization",
      category: "Code Health",
      title: "No static syntactic anti-patterns detected in inspected files",
      fileCitation: files[0]?.path || "package.json",
      explanation: "Base syntax adheres to fundamental hygiene standards. Architectural domain alignment verified by semantic analysis.",
      remediation: "Continue adhering to clean domain design patterns.",
    });
  }

  return findings;
}
