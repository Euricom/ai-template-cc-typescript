#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function isGlobalInstall(currentDir) {
  // Windows path pattern for global Claude installation
  const claudeHooksPattern = /^[A-Z]:\\Users\\[^\\]+\\\.claude\\hooks$/;
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

    if (process.argv.includes("--speak")) {
      // Use Windows Speech API via PowerShell for text-to-speech
      const message = "Your agent needs attention";
      const cmd = `powershell -c "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${message}')"`;
      exec(cmd, (err) => {
        if (err) {
          console.error("Error speaking notification:", err.message);
          console.error("Note: Text-to-speech requires Windows Speech API");
        }
        process.exit(0);
      });
      return;
    }

    // Default behavior: play sound file using Windows Media Player or custom sound
    const soundFile = join(__dirname, "./on-agent-need-attention.wav");

    let cmd: string;

    if (existsSync(soundFile)) {
      // Use PowerShell Media.SoundPlayer for custom sound file
      cmd = `powershell -c "(New-Object Media.SoundPlayer '${soundFile}').PlaySync()"`;
    } else {
      // Fallback to Windows system beep sound
      console.log("Custom sound file not found, using system beep");
      cmd = `powershell -c "[console]::beep(800,500)"`;
    }

    exec(cmd, (err) => {
      if (err) {
        console.error("Error playing sound:", err.message);
        // Try alternative system sound as final fallback
        exec(`powershell -c "[console]::beep()"`, (fallbackErr) => {
          if (fallbackErr) {
            console.error("Error with fallback sound:", fallbackErr.message);
          }
          process.exit(0);
        });
      }
      process.exit(0);
    });
  } catch (error) {
    console.error("Error processing notification:", error);
    process.exit(2);
  }
});
