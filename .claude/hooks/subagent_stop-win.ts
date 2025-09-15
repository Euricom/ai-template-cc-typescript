#!/usr/bin/env tsx

// Windows specific version of subagent_stop hook
// This file is optimized for Windows and uses Windows-specific features

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function isGlobalInstall(currentDir: string): boolean {
  // Windows pattern for global installation
  const claudeHooksPattern = /^[A-Z]:\\Users\\[^\\]+\\\.claude\\hooks$/;
  return claudeHooksPattern.test(currentDir);
}

// Detect if running from global installation
const isGlobal = isGlobalInstall(__dirname);
const logsDir = isGlobal
  ? join(process.env.USERPROFILE || process.cwd(), ".claude", "logs")
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
    logs.push({ timestamp: new Date().toISOString(), ...data });
    writeFileSync(logFile, JSON.stringify(logs, null, 2));

    // Play completion sound or speak notification (Windows only)
    // Check if --speak flag is present
    if (process.argv.includes("--speak")) {
      const message = "Your subagent has finished";

      // Use Windows Speech API
      const cmd = `powershell -Command "Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.Speak('${message}')"`;

      exec(cmd, (err) => {
        if (err) {
          console.error("Error speaking notification:", err.message);
        }
        process.exit(0);
      });
    } else {
      // Default behavior: play Windows system sound or custom sound file
      const soundFile = isGlobal
        ? join(
            process.env.USERPROFILE || process.cwd(),
            ".claude",
            "hooks",
            "on-agent-complete.wav"
          )
        : join(__dirname, "on-agent-complete.wav");

      // Check if custom sound file exists
      if (existsSync(soundFile)) {
        // Use Windows Media.SoundPlayer to play custom sound
        const cmd = `powershell -Command "(New-Object Media.SoundPlayer '${soundFile}').PlaySync()"`;

        exec(cmd, (err) => {
          if (err) {
            console.error("Error playing custom sound:", err.message);
            // Fallback to system sound
            exec(
              'powershell -Command "[System.Media.SystemSounds]::Exclamation.Play()"',
              () => {
                process.exit(0);
              }
            );
          } else {
            process.exit(0);
          }
        });
      } else {
        // Use Windows system sound as fallback
        const cmd =
          'powershell -Command "[System.Media.SystemSounds]::Exclamation.Play()"';

        exec(cmd, (err) => {
          if (err) {
            console.error("Error playing system sound:", err.message);
          }
          process.exit(0);
        });
      }
    }
  } catch (error) {
    console.error("Error processing subagent stop event:", error);
    process.exit(1);
  }
});
