#!/usr/bin/env tsx

// Darwin/macOS specific version of subagent_stop hook
// This file is optimized for macOS and uses macOS-specific features

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function isGlobalInstall(currentDir: string) {
  const claudeHooksPattern = /^\/Users\/[^\/]+\/\.claude\/hooks$/;
  return claudeHooksPattern.test(currentDir);
}

// Detect if running from global installation
const isGlobal = isGlobalInstall(__dirname);
const logsDir = isGlobal
  ? join(process.env.HOME || process.cwd(), ".claude", "logs")
  : join(__dirname, "../../logs");

if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

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
    const data = JSON.parse(input);

    // Log the subagent stop event
    const logFile = join(logsDir, "subagent_stop.json");
    let logs = [];
    if (existsSync(logFile)) {
      try {
        logs = JSON.parse(readFileSync(logFile, "utf8"));
      } catch (e) {
        logs = [];
      }
    }

    logs.push({
      timestamp: new Date().toISOString(),
      ...data,
    });

    writeFileSync(logFile, JSON.stringify(logs, null, 2));

    // Play completion sound or speak notification (macOS only)
    // Check if --speak flag is present
    if (process.argv.includes("--speak")) {
      const message = "Your subagent has finished";

      // Check for --voice flag
      const voiceIndex = process.argv.indexOf("--voice");
      const voice =
        voiceIndex !== -1 && voiceIndex + 1 < process.argv.length
          ? process.argv[voiceIndex + 1]
          : null;

      const cmd = voice ? `say -v "${voice}" "${message}"` : `say "${message}"`;

      exec(cmd, (err) => {
        if (err) {
          console.error("Error speaking notification:", err.message);
        }
        process.exit(0);
      });
    } else {
      // Default behavior: play macOS system sound
      const cmd = `afplay /System/Library/Sounds/Glass.aiff`;

      exec(cmd, (err) => {
        if (err) {
          console.error("Error playing sound:", err.message);
        }
        process.exit(0);
      });
    }
  } catch (error) {
    console.error("Error processing subagent stop event:", error);
    process.exit(1);
  }
});
