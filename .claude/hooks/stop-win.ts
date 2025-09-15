#!/usr/bin/env tsx
// Windows specific version of the stop hook
// For macOS (Darwin) version, use stop.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function isGlobalInstall(currentDir) {
  // Windows path pattern for global installation
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

    // Windows-specific notification handling
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

      // Use Windows PowerShell Add-Type for text-to-speech
      const cmd = `powershell -c "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${message}')"`;

      exec(cmd, (err) => {
        if (err) {
          console.error("Error speaking notification:", err.message);
        }
        afterNotification();
      });
    } else {
      // Default behavior: play sound file using Windows Media Player
      const soundFile = isGlobal
        ? join(
            process.env.USERPROFILE || process.cwd(),
            ".claude",
            "on-agent-complete.wav"
          )
        : join(__dirname, "../../on-agent-complete.wav");

      // Check if sound file exists
      if (existsSync(soundFile)) {
        // Use PowerShell Media.SoundPlayer for playing sound
        const cmd = `powershell -c "(New-Object Media.SoundPlayer '${soundFile}').PlaySync()"`;

        exec(cmd, (err) => {
          if (err) {
            console.error("Error playing sound:", err.message);
            // Fallback to Windows system beep
            exec("powershell -c '[console]::beep(800,300)'", afterNotification);
          } else {
            afterNotification();
          }
        });
      } else {
        console.error(`Sound file not found: ${soundFile}`);
        console.error(
          "Please ensure on-agent-complete.wav exists in the repository root"
        );
        // Fallback to Windows system beep
        exec("powershell -c '[console]::beep(800,300)'", afterNotification);
      }
    }
  } catch (error) {
    console.error("Error processing stop event:", error);
    process.exit(1);
  }
});
