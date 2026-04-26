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

    const compile = result.compile || null;
    const run = result.run || null;

    // If there's no run result at all, something went wrong on the executor side
    if (!run) {
      return res.status(502).json({
        error: "Execution service did not return a result. Please try again."
      });
    }

    const compileSucceeded = !compile || (compile.code ?? 0) === 0;
    const runSucceeded = (run.code ?? 0) === 0 && !run.signal;

    // Build a single output string the UI can display directly
    const parts = [];
    if (compile && compile.output) {
      parts.push(compile.output.trim());
    }
    if (run.output) {
      parts.push(run.output.trim());
    }
    const output = parts.join("\n").trim();

    return res.json({
      success: compileSucceeded && runSucceeded,
      language,
      output,
      compile: compile
        ? {
            code: compile.code ?? null,
            stdout: compile.stdout || "",
            stderr: compile.stderr || "",
            output: compile.output || ""
          }
        : null,
      run: {
        code: run.code ?? null,
        stdout: run.stdout || "",
        stderr: run.stderr || "",
        output: run.output || "",
        signal: run.signal || null
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  executeCode
};
