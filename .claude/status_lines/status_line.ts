// @ts-ignore
import * as fs from "node:fs";

// @ts-ignore
import * as path from "node:path";

// @ts-ignore
import * as process from "node:process";

// @ts-ignore
import { spawnSync } from "node:child_process";

// @ts-ignore
import { promisify } from "node:util";

// # Contribute
//
// Test without claude:
// `echo '{"model":{"display_name":"Sonnet 4"},"workspace":{"current_dir":"/test-folder"}}' | bun .claude/status_lines/status_line.ts`
//
// Build js file:
// `npx esbuild .claude/status_lines/status_line.ts --bundle --platform=node --format=cjs > .claude/status_lines/status_line.cjs`
//
// Setup statusLine in `settings.json`
// {
//   "statusLine": {
//        "type": "command",
//        "command": "bun .claude/status_lines/status_line.ts",
//        "padding": 0
//    },
//
// Alternative setup statusLine with node (slower the bun)
// {
//   "statusLine": {
//        "type": "command",
//        "command": "node .claude/status_lines/status_line.cjs",
//        "padding": 0
//    },
// }
//

interface InputData {
  session_id: string;
  transcript_path: string;
  model?: { display_name?: string };
  workspace?: { current_dir?: string };
  version?: string;
  output_style?: { name?: string };
}

interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

interface TranscriptLine {
  message?: { usage?: TokenUsage };
  isSidechain?: boolean;
  timestamp?: string;
}

interface TokenMetrics {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
  contextLength: number;
}

interface CCUsageMetrics {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalCost: number;
  totalTokens: number;
}

interface CCUsageData {
  today: CCUsageMetrics;
  month: CCUsageMetrics;
}

const readFile = promisify(fs.readFile);

// ANSI color codes
const COLORS = {
  RESET: "\x1b[0m",
  YELLOW: "\x1b[93m", // High contrast yellow
  MAGENTA: "\x1b[95m", // Magenta
  BLUE: "\x1b[34m", // Blue
  GREEN: "\x1b[32m", // Green
  YELLOW_DIM: "\x1b[33m", // Yellow
  CYAN: "\x1b[36m", // Cyan
  RED: "\x1b[31m", // Red
};

function getGitBranch(): string | null {
  try {
    const result = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf-8",
      timeout: 2000,
    });
    if (result.status === 0) {
      return result.stdout.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

function getGitStatus(): string {
  try {
    const result = spawnSync("git", ["status", "--porcelain"], {
      encoding: "utf-8",
      timeout: 2000,
    });
    if (result.status === 0) {
      const changes = result.stdout.trim();
      if (changes) {
        const lines = changes.split("\n");
        return `±${lines.length}`;
      }
    }
  } catch {
    // ignore
  }
  return "";
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatTokens(contextSize: number | string): string {
  // If it's already a string (like "200k"), return as is
  if (typeof contextSize === "string") {
    return contextSize;
  }

  // Format numbers to be more readable
  if (contextSize >= 1000000) {
    return `${(contextSize / 1000000).toFixed(0)}M`;
  } else if (contextSize >= 1000) {
    return `${(contextSize / 1000).toFixed(0)}k`;
  } else {
    return contextSize.toString();
  }
}

async function getCCUsageMetrics(): Promise<CCUsageData | null> {
  try {
    const result = spawnSync("bunx", ["ccusage", "--json"], {
      encoding: "utf-8",
      timeout: 1000,
    });
    const data = JSON.parse(result.stdout);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Find today's entry in the daily array
    const todayEntry = data.daily?.find((entry: any) => entry.date === today);

    const todayMetrics: CCUsageMetrics = todayEntry
      ? {
          inputTokens: todayEntry.inputTokens,
          outputTokens: todayEntry.outputTokens,
          cacheCreationTokens: todayEntry.cacheCreationTokens,
          cacheReadTokens: todayEntry.cacheReadTokens,
          totalCost: todayEntry.totalCost,
          totalTokens: todayEntry.totalTokens,
        }
      : {
          inputTokens: 0,
          outputTokens: 0,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          totalCost: 0,
          totalTokens: 0,
        };

    // Get month totals from the totals field
    const monthMetrics: CCUsageMetrics = data.totals
      ? {
          inputTokens: data.totals.inputTokens,
          outputTokens: data.totals.outputTokens,
          cacheCreationTokens: data.totals.cacheCreationTokens,
          cacheReadTokens: data.totals.cacheReadTokens,
          totalCost: data.totals.totalCost,
          totalTokens: data.totals.totalTokens,
        }
      : {
          inputTokens: 0,
          outputTokens: 0,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          totalCost: 0,
          totalTokens: 0,
        };

    return {
      today: todayMetrics,
      month: monthMetrics,
    };
  } catch {
    return null;
  }
}

async function getTokenMetrics(transcriptPath: string): Promise<TokenMetrics> {
  try {
    // Use Node.js-compatible file reading
    if (!fs.existsSync(transcriptPath)) {
      return {
        inputTokens: 0,
        outputTokens: 0,
        cachedTokens: 0,
        totalTokens: 0,
        contextLength: 0,
      };
    }

    const content = await readFile(transcriptPath, "utf-8");
    const lines = content.trim().split("\n");

    let inputTokens = 0;
    let outputTokens = 0;
    let cachedTokens = 0;
    let contextLength = 0;

    // Parse each line and sum up token usage for totals
    let mostRecentMainChainEntry: TranscriptLine | null = null;
    let mostRecentTimestamp: Date | null = null;

    for (const line of lines) {
      try {
        const data = JSON.parse(line) as TranscriptLine;
        if (data.message?.usage) {
          inputTokens += data.message.usage.input_tokens || 0;
          outputTokens += data.message.usage.output_tokens || 0;
          cachedTokens += data.message.usage.cache_read_input_tokens ?? 0;
          cachedTokens += data.message.usage.cache_creation_input_tokens ?? 0;

          // Track the most recent entry with isSidechain: false (or undefined, which defaults to main chain)
          if (data.isSidechain !== true && data.timestamp) {
            const entryTime = new Date(data.timestamp);
            if (!mostRecentTimestamp || entryTime > mostRecentTimestamp) {
              mostRecentTimestamp = entryTime;
              mostRecentMainChainEntry = data;
            }
          }
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    // Calculate context length from the most recent main chain message
    if (mostRecentMainChainEntry?.message?.usage) {
      const usage = mostRecentMainChainEntry.message.usage;
      contextLength =
        (usage.input_tokens || 0) +
        (usage.cache_read_input_tokens ?? 0) +
        (usage.cache_creation_input_tokens ?? 0);
    }

    const totalTokens = inputTokens + outputTokens + cachedTokens;

    return {
      inputTokens,
      outputTokens,
      cachedTokens,
      totalTokens,
      contextLength,
    };
  } catch {
    return {
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      totalTokens: 0,
      contextLength: 0,
    };
  }
}

async function generateStatusLine(inputData: InputData): Promise<string> {
  const parts: string[] = [];

  // Model display name
  const modelName = inputData.model?.display_name ?? "Claude";
  parts.push(`${COLORS.YELLOW}🚀 ${modelName}${COLORS.RESET}`);

  // Context size information
  const tokenMetrics = await getTokenMetrics(inputData.transcript_path);
  parts.push(
    `${COLORS.MAGENTA}🧠 ${(tokenMetrics.contextLength / 1000).toFixed(3)}${
      COLORS.RESET
    }`
  );

  // Current directory
  const currentDir = inputData.workspace?.current_dir ?? "";
  if (currentDir) {
    const dirName = path.basename(currentDir);
    parts.push(`${COLORS.BLUE}📁 ${dirName}${COLORS.RESET}`);
  }

  // Git branch and status
  const gitBranch = getGitBranch();
  if (gitBranch) {
    const gitStatus = getGitStatus();
    let gitInfo = `🌿 ${gitBranch}`;
    if (gitStatus) {
      gitInfo += ` ${gitStatus}`;
    }
    parts.push(`${COLORS.GREEN}${gitInfo}${COLORS.RESET}`);
  }

  // Get day and month metrics
  const usageData = await getCCUsageMetrics();
  if (usageData) {
    // Today's metrics
    const totalCost = formatCurrency(usageData.today.totalCost);
    const totalTokens = formatTokens(usageData.today.totalTokens);
    parts.push(
      `${COLORS.YELLOW_DIM}☀️ ${totalTokens} - ${totalCost}${COLORS.RESET}`
    );

    // Month's metrics
    const monthCost = formatCurrency(usageData.month.totalCost);
    const monthTokens = formatTokens(usageData.month.totalTokens);
    parts.push(`${COLORS.CYAN}📅 ${monthTokens} - ${monthCost}${COLORS.RESET}`);
  }

  return parts.join(" | ");
}

async function main() {
  try {
    // Read stdin fully
    const inputRaw = await new Promise<string>((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf-8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });

    const inputData: InputData = JSON.parse(inputRaw);
    const statusLine = await generateStatusLine(inputData);

    console.log(statusLine);
    process.exit(0);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.log(`${COLORS.RED}[Claude] 📁 Unknown${COLORS.RESET}`);
    } else {
      console.log(`${COLORS.RED}[Claude] 📁 Error${COLORS.RESET}`);
    }
    process.exit(0);
  }
}

main();
