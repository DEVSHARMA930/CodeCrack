const env = require("../config/env");

// Pinned runtime versions — avoids wildcard "*" which is rejected by the public
// Piston API when runtimes haven't been indexed yet, causing silent failures.
const ALLOWED_LANGUAGES = {
  c: {
    language: "c",
    version: "10.2.0",
    fileName: "main.c"
  },
  cpp: {
    language: "cpp",
    version: "10.2.0",
    fileName: "main.cpp"
  },
  "c++": {
    language: "cpp",
    version: "10.2.0",
    fileName: "main.cpp"
  },
  python: {
    language: "python",
    version: "3.10.0",
    fileName: "main.py"
  },
  py: {
    language: "python",
    version: "3.10.0",
    fileName: "main.py"
  }
};

async function executeWithPiston({ language, sourceCode, stdin = "" }) {
  const selected = ALLOWED_LANGUAGES[String(language || "").toLowerCase()];

  if (!selected) {
    const error = new Error("Only C, C++, and Python are supported right now.");
    error.statusCode = 400;
    throw error;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  let response;
  try {
    response = await fetch(env.pistonUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        language: selected.language,
        version: selected.version,
        files: [
          {
            name: selected.fileName,
            content: sourceCode
          }
        ],
        stdin,
        compile_timeout: 10000,
        run_timeout: 5000
      })
    });
  } catch (fetchError) {
    if (fetchError.name === "AbortError") {
      const error = new Error("Code execution timed out. The Piston service did not respond in time.");
      error.statusCode = 504;
      throw error;
    }
    const error = new Error("Could not reach the code execution service. Check your internet connection or try again.");
    error.statusCode = 502;
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  // Read raw text first so we can handle non-JSON bodies gracefully
  // (Piston returns HTML error pages when rate-limited or during downtime)
  const rawText = await response.text();

  if (!response.ok) {
    const preview = rawText.slice(0, 200);
    const error = new Error(
      `Execution service returned an error (HTTP ${response.status}): ${preview}`
    );
    error.statusCode = 502;
    throw error;
  }

  let result;
  try {
    result = JSON.parse(rawText);
  } catch {
    const error = new Error(
      "Execution service returned an unexpected response. It may be temporarily unavailable."
    );
    error.statusCode = 502;
    throw error;
  }

  // Piston returns { message: "runtime X not found" } with HTTP 200 when a
  // runtime isn't installed — treat this as a user-facing error, not a 500.
  if (result.message && !result.run) {
    const error = new Error(`Execution service error: ${result.message}`);
    error.statusCode = 502;
    throw error;
  }

  return result;
}

module.exports = {
  executeWithPiston
};
