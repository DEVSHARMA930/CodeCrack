const { executeWithPiston } = require("../services/pistonService");

async function executeCode(req, res, next) {
  try {
    const language = String(req.body.language || "").trim();
    const sourceCode = String(req.body.code || "");
    const stdin = String(req.body.stdin || "");

    if (!language || !sourceCode) {
      return res.status(400).json({
        error: "Language and code are required"
      });
    }

    if (sourceCode.length > 25000) {
      return res.status(400).json({
        error: "Code is too long. Keep it under 25,000 characters."
      });
    }

    if (stdin.length > 5000) {
      return res.status(400).json({
        error: "Input is too long. Keep it under 5,000 characters."
      });
    }

    const result = await executeWithPiston({
      language,
      sourceCode,
      stdin
    });

    const compile = result.compile || {};
    const run = result.run || {};

    const output = [compile.output, run.output].filter(Boolean).join("\n").trim();

    return res.json({
      success: (compile.code || 0) === 0 && (run.code || 0) === 0,
      language,
      output,
      compile: {
        code: compile.code,
        stdout: compile.stdout || "",
        stderr: compile.stderr || "",
        output: compile.output || ""
      },
      run: {
        code: run.code,
        stdout: run.stdout || "",
        stderr: run.stderr || "",
        output: run.output || "",
        signal: run.signal || ""
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  executeCode
};
