// server/services/wandboxService.js

const WANDBOX_API_URL = process.env.WANDBOX_URL || "https://wandbox.org/api/compile.json";
const PISTON_API_URL = process.env.PISTON_URL || "";

const WANDBOX_COMPILER_CANDIDATES = {
  c: ["gcc-13.2.0-c", "gcc-12.3.0-c", "gcc-head-c"],
  cpp: ["gcc-13.2.0", "gcc-12.3.0", "gcc-head"],
  python: ["cpython-3.12.7", "cpython-3.11.10", "cpython-head"],
  javascript: ["nodejs-20.17.0", "nodejs-18.20.4"],
  java: ["openjdk-jdk-21.0.2+13", "openjdk-jdk-17.0.9+9", "openjdk-head"]
};

const PISTON_RUNTIME_MAP = {
  c: { language: "c", version: "*" },
  cpp: { language: "cpp", version: "*" },
  python: { language: "python", version: "*" },
  javascript: { language: "javascript", version: "*" },
  java: { language: "java", version: "*" }
};

const RUNTIME_BOOT_ERROR_PATTERN = /(catatonit|failed to exec pid1)/i;

class UnsupportedLanguageError extends Error {
  constructor(language) {
    super(`Language '${language}' is not supported yet.`);
    this.name = "UnsupportedLanguageError";
    this.statusCode = 400;
  }
}

function toSuccessStatus(value) {
  return String(value) === "0" ? "0" : "1";
}

function normalizePistonResult(result, compilerLabel) {
  const compileOutput = result.compile?.output || "";
  const compileError = result.compile?.stderr || "";
  const runOutput = result.run?.stdout || "";
  const runError = result.run?.stderr || "";
  const runMessage = result.run?.output || runOutput || runError;
  const status = toSuccessStatus(result.run?.code);

  return {
    status,
    compiler_output: compileOutput,
    compiler_error: compileError,
    compiler_message: compileOutput || compileError,
    program_output: runOutput,
    program_error: runError,
    program_message: runMessage,
    compiler: compilerLabel
  };
}

async function parseJsonResponse(response, providerName) {
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    const trimmed = details.trim();
    const suffix = trimmed ? ` - ${trimmed}` : "";
    throw new Error(`${providerName} API Error: ${response.status}${suffix}`);
  }

  return response.json();
}

function isRuntimeBootFailure(result) {
  const combined = [
    result?.program_error,
    result?.program_message,
    result?.compiler_error,
    result?.compiler_message
  ]
    .filter(Boolean)
    .join("\n");

  return RUNTIME_BOOT_ERROR_PATTERN.test(combined);
}

async function executeWithPiston({ language, code, stdin }) {
  const runtime = PISTON_RUNTIME_MAP[language];

  if (!runtime) {
    throw new UnsupportedLanguageError(language);
  }

  const response = await fetch(PISTON_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: runtime.language,
      version: runtime.version,
      files: [{ content: code }],
      stdin
    })
  });

  const result = await parseJsonResponse(response, "Piston");
  return normalizePistonResult(result, `${runtime.language}:${runtime.version}`);
}

async function executeAgainstWandboxCompiler({ compiler, code, stdin }) {
  const response = await fetch(WANDBOX_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      compiler,
      code,
      stdin
    })
  });

  const result = await parseJsonResponse(response, "Wandbox");
  result.compiler = compiler;
  return result;
}

async function getDynamicWandboxCompilers(language) {
  try {
    const listUrl = WANDBOX_API_URL.replace("compile.json", "list.json");
    const response = await fetch(listUrl);
    if (!response.ok) return [];
    const compilers = await response.json();

    return compilers
      .filter((c) => {
        const wandboxLang = String(c.language).toLowerCase();
        if (language === "cpp" && wandboxLang === "c++") return true;
        if (language === "javascript" && wandboxLang === "node.js") return true;
        return wandboxLang === language;
      })
      .map((c) => c.name)
      .reverse();
  } catch (err) {
    return [];
  }
}

async function executeWithWandbox({ language, code, stdin = "" }) {
  const normalizedLanguage = String(language || "").toLowerCase();

  if (PISTON_API_URL) {
    return executeWithPiston({
      language: normalizedLanguage,
      code,
      stdin
    });
  }

  const candidates = WANDBOX_COMPILER_CANDIDATES[normalizedLanguage];

  if (!candidates) {
    throw new UnsupportedLanguageError(language);
  }

  const compilers = [...candidates];

  for (let index = 0; index < compilers.length; index += 1) {
    const compiler = compilers[index];
    let result;
    try {
      result = await executeAgainstWandboxCompiler({ compiler, code, stdin });
    } catch (error) {
      let hasFallback = index < compilers.length - 1;
      const isUnknownCompiler = /unknown compiler/i.test(error.message);

      if (!hasFallback && isUnknownCompiler) {
        console.warn(`All known Wandbox compilers for '${normalizedLanguage}' failed. Fetching dynamic list...`);
        const dynamicCompilers = await getDynamicWandboxCompilers(normalizedLanguage);
        const untried = dynamicCompilers.filter((c) => !compilers.includes(c));
        
        if (untried.length > 0) {
          compilers.push(...untried);
          hasFallback = true;
        }
      }

      if (hasFallback && isUnknownCompiler) {
        console.warn(`Wandbox compiler '${compiler}' is unknown. Trying next.`);
        continue;
      }
      throw error;
    }

    if (String(result.status) === "0") {
      return result;
    }

    const hasFallback = index < compilers.length - 1;

    if (hasFallback && isRuntimeBootFailure(result)) {
      console.warn(`Wandbox compiler '${compiler}' had a boot failure. Trying next.`);
      continue;
    }

    return result;
  }

  throw new Error("Wandbox execution failed without a result.");
}

module.exports = {
  executeWithWandbox,
  UnsupportedLanguageError
};