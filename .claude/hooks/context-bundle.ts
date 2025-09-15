import { existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";

// Read input from stdin
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    input += chunk;
  }
});

process.stdin.on("end", async () => {
  try {
    const entry = JSON.parse(input);

    const logsDir = join(process.cwd(), ".claude/agents/context_bundles");
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }

    // Generate log file name with format: {weekday}_{day}_{sessionID}.jsonl
    const now = new Date();
    const weekday = now
      .toLocaleDateString("en-US", { weekday: "short" })
      .toLowerCase();
    const day = now.getDate().toString().padStart(2, "0");
    const sessionId = entry.session_id || "1234567890";
    const logFileName = `${weekday}_${day}_${sessionId}.jsonl`;
    const logFilePath = join(logsDir, logFileName);

    // Log read operations
    if (entry.hook_event_name === "PreToolUse" && entry.tool_name === "Read") {
      const logEntry = {
        operation: "read",
        file_path:
          entry.tool_input?.file_path?.replace(entry.cwd + "/", "") ||
          "dummy.md",
      };
      appendFileSync(logFilePath, JSON.stringify(logEntry) + "\n");
    }

    // Log prompts when they are entered
    if (entry.hook_event_name === "UserPromptSubmit" && entry.prompt) {
      const logEntry = {
        operation: "prompt",
        prompt: entry.prompt || "dummy prompt",
      };
      appendFileSync(logFilePath, JSON.stringify(logEntry) + "\n");
    }
  } catch (error) {
    console.error("Error processing subagent stop event:", error);
    process.exit(1);
  }
});
