// server/controllers/executeController.js
const { executeWithWandbox } = require("../services/wandboxService");

const executeCode = async (req, res) => {
  try {
    const { language, code, stdin } = req.body || {};
    const normalizedLanguage = String(language || "python").toLowerCase().trim();

    if (!String(code || "").trim()) {
      return res.status(400).json({ success: false, output: "Code is required" });
    }

    const result = await executeWithWandbox({
      language: normalizedLanguage,
      code,
      stdin: stdin || ""
    });

    const isSuccess = String(result.status) === "0";

    const output = [result.compiler_message, result.program_message]
      .filter(Boolean)
      .join("\n")
      .trim() || "No output returned.";

    const runOutput = result.program_message || result.program_output || output;

    return res.json({
      success: isSuccess,
      output,
      compiler: result.compiler,
      run: {
        code: isSuccess ? 0 : 1,
        output: runOutput,
        stdout: result.program_output || "",
        stderr: result.program_error || ""
      },
      compile: {
        output: result.compiler_output || result.compiler_message || "",
        stderr: result.compiler_error || ""
      }
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    const responseMessage = statusCode === 400
      ? error.message
      : `Execution Engine Error: ${error.message}`;

    console.error("CRITICAL ERROR:", error.message);

    return res.status(statusCode).json({
      success: false,
      output: responseMessage,
      run: {
        code: 1,
        output: responseMessage,
        stdout: "",
        stderr: responseMessage
      }
    });
  }
};

module.exports = { executeCode };