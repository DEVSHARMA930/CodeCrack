const env = require("../config/env");

const ALLOWED_LANGUAGES = {
  c: {
    language: "c",
    fileName: "main.c"
  },
  cpp: {
    language: "cpp",
    fileName: "main.cpp"
  },
  "c++": {
    language: "cpp",
    fileName: "main.cpp"
  },
  python: {
    language: "python",
    fileName: "main.py"
  },
  py: {
    language: "python",
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

  const response = await fetch(env.pistonUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      language: selected.language,
      version: "*",
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

  if (!response.ok) {
    const responseText = await response.text();
    const error = new Error(
      `Piston request failed with status ${response.status}: ${responseText.slice(0, 200)}`
    );
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}

module.exports = {
  executeWithPiston
};
