#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function isGlobalInstall(currentDir) {
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

    // Log the notification
    const logFile = join(logsDir, "notifications.json");
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

    // Skip notification sound if --notify flag is not present
    if (!process.argv.includes("--notify")) {
      return process.exit(0);
    }

    // Check if --speak flag is present
    if (process.argv.includes("--speak")) {
      const message = "Your agent needs attention";

      // Check for --voice flag
      const voiceIndex = process.argv.indexOf("--voice");
      const voice =
        voiceIndex !== -1 && voiceIndex + 1 < process.argv.length
          ? process.argv[voiceIndex + 1]
          : null;

      // Use macOS say command with optional voice
      const cmd = voice ? `say -v "${voice}" "${message}"` : `say "${message}"`;
      console.log("Speaking notification:", cmd);
      exec(cmd, (err) => {
        if (err) {
          console.error("Error speaking notification:", err.message);
        }
        process.exit(0);
      });
      return;
    }

    // Default behavior: play macOS system sound
    const cmd = `afplay /System/Library/Sounds/Funk.aiff`;
    console.log("Playing sound:", cmd);
    exec(cmd, (err) => {
      if (err) {
        console.error("Error playing sound:", err.message);
      }
      process.exit(0);
    });
    process.exit(0);
    return;
  } catch (error) {
    console.error("Error processing notification:", error);
    process.exit(2);
  }
});
