#!/usr/bin/env tsx
// Darwin (macOS) specific version of the stop hook
// For Windows version, use stop-win.ts
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

    // Log the stop event
    const logFile = join(logsDir, "stop.json");
    let logs = [];
    if (existsSync(logFile)) {
      try {
        logs = JSON.parse(readFileSync(logFile, "utf8"));
      } catch (e) {
        logs = [];
      }
    }
    logs.push({ timestamp: new Date().toISOString(), ...data });
    writeFileSync(logFile, JSON.stringify(logs, null, 2));

    // macOS-specific notification handling
    // Define the callback for after notification
    const afterNotification = () => {
      // If --chat flag is present, process the transcript
      if (process.argv.includes("--chat") && data.transcript_path) {
        try {
          const transcriptPath = data.transcript_path;
          if (existsSync(transcriptPath)) {
            const transcriptContent = readFileSync(transcriptPath, "utf8");
            const lines = transcriptContent
              .split("\n")
              .filter((line) => line.trim());
            const chatData = [];

            for (const line of lines) {
              try {
                chatData.push(JSON.parse(line));
              } catch (e) {
                // Skip invalid lines
              }
            }

            const chatLogFile = join(logsDir, "chat.json");
            writeFileSync(chatLogFile, JSON.stringify(chatData, null, 2));
          }
        } catch (e) {
          console.error("Error processing transcript:", e);
        }
      }

      process.exit(0);
    };

    // Check if --speak flag is present for voice notification
    if (process.argv.includes("--speak")) {
      const message = "Your agent has finished";

      // Check for --voice flag to specify voice
      const voiceIndex = process.argv.indexOf("--voice");
      const voice =
        voiceIndex !== -1 && voiceIndex + 1 < process.argv.length
          ? process.argv[voiceIndex + 1]
          : null;

      // Use macOS 'say' command for voice notification
      const cmd = voice ? `say -v "${voice}" "${message}"` : `say "${message}"`;

      exec(cmd, (err) => {
        if (err) {
          console.error("Error speaking notification:", err.message);
        }
        afterNotification();
      });
    } else {
      // Default behavior: play macOS system sound
      const cmd = `afplay /System/Library/Sounds/Glass.aiff`;
      exec(cmd, (err) => {
        if (err) {
          console.error("Error playing sound:", err.message);
        }
        afterNotification();
      });
    }
  } catch (error) {
    console.error("Error processing stop event:", error);
    process.exit(1);
  }
});
