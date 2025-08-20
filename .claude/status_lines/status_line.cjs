var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .claude/status_lines/status_line.ts
var fs = __toESM(require("node:fs"));
var path = __toESM(require("node:path"));
var process = __toESM(require("node:process"));
var import_node_child_process = require("node:child_process");
var import_node_util = require("node:util");
var readFile2 = (0, import_node_util.promisify)(fs.readFile);
var COLORS = {
  RESET: "\x1B[0m",
  YELLOW: "\x1B[93m",
  // High contrast yellow
  MAGENTA: "\x1B[95m",
  // Magenta
  BLUE: "\x1B[34m",
  // Blue
  GREEN: "\x1B[32m",
  // Green
  YELLOW_DIM: "\x1B[33m",
  // Yellow
  CYAN: "\x1B[36m",
  // Cyan
  RED: "\x1B[31m"
  // Red
};
function getGitBranch() {
  try {
    const result = (0, import_node_child_process.spawnSync)("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf-8",
      timeout: 2e3
    });
    if (result.status === 0) {
      return result.stdout.trim();
    }
  } catch {
  }
  return null;
}
function getGitStatus() {
  try {
    const result = (0, import_node_child_process.spawnSync)("git", ["status", "--porcelain"], {
      encoding: "utf-8",
      timeout: 2e3
    });
    if (result.status === 0) {
      const changes = result.stdout.trim();
      if (changes) {
        const lines = changes.split("\n");
        return `\xB1${lines.length}`;
      }
    }
  } catch {
  }
  return "";
}
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}
function formatTokens(contextSize) {
  if (typeof contextSize === "string") {
    return contextSize;
  }
  if (contextSize >= 1e6) {
    return `${(contextSize / 1e6).toFixed(0)}M`;
  } else if (contextSize >= 1e3) {
    return `${(contextSize / 1e3).toFixed(0)}k`;
  } else {
    return contextSize.toString();
  }
}
async function getCCUsageMetrics() {
  try {
    const result = (0, import_node_child_process.spawnSync)("bunx", ["ccusage", "--json"], {
      encoding: "utf-8",
      timeout: 1e3
    });
    const data = JSON.parse(result.stdout);
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todayEntry = data.daily?.find((entry) => entry.date === today);
    const todayMetrics = todayEntry ? {
      inputTokens: todayEntry.inputTokens,
      outputTokens: todayEntry.outputTokens,
      cacheCreationTokens: todayEntry.cacheCreationTokens,
      cacheReadTokens: todayEntry.cacheReadTokens,
      totalCost: todayEntry.totalCost,
      totalTokens: todayEntry.totalTokens
    } : {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      totalCost: 0,
      totalTokens: 0
    };
    const monthMetrics = data.totals ? {
      inputTokens: data.totals.inputTokens,
      outputTokens: data.totals.outputTokens,
      cacheCreationTokens: data.totals.cacheCreationTokens,
      cacheReadTokens: data.totals.cacheReadTokens,
      totalCost: data.totals.totalCost,
      totalTokens: data.totals.totalTokens
    } : {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      totalCost: 0,
      totalTokens: 0
    };
    return {
      today: todayMetrics,
      month: monthMetrics
    };
  } catch {
    return null;
  }
}
async function getTokenMetrics(transcriptPath) {
  try {
    if (!fs.existsSync(transcriptPath)) {
      return {
        inputTokens: 0,
        outputTokens: 0,
        cachedTokens: 0,
        totalTokens: 0,
        contextLength: 0
      };
    }
    const content = await readFile2(transcriptPath, "utf-8");
    const lines = content.trim().split("\n");
    let inputTokens = 0;
    let outputTokens = 0;
    let cachedTokens = 0;
    let contextLength = 0;
    let mostRecentMainChainEntry = null;
    let mostRecentTimestamp = null;
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.message?.usage) {
          inputTokens += data.message.usage.input_tokens || 0;
          outputTokens += data.message.usage.output_tokens || 0;
          cachedTokens += data.message.usage.cache_read_input_tokens ?? 0;
          cachedTokens += data.message.usage.cache_creation_input_tokens ?? 0;
          if (data.isSidechain !== true && data.timestamp) {
            const entryTime = new Date(data.timestamp);
            if (!mostRecentTimestamp || entryTime > mostRecentTimestamp) {
              mostRecentTimestamp = entryTime;
              mostRecentMainChainEntry = data;
            }
          }
        }
      } catch {
      }
    }
    if (mostRecentMainChainEntry?.message?.usage) {
      const usage = mostRecentMainChainEntry.message.usage;
      contextLength = (usage.input_tokens || 0) + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0);
    }
    const totalTokens = inputTokens + outputTokens + cachedTokens;
    return {
      inputTokens,
      outputTokens,
      cachedTokens,
      totalTokens,
      contextLength
    };
  } catch {
    return {
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      totalTokens: 0,
      contextLength: 0
    };
  }
}
async function generateStatusLine(inputData) {
  const parts = [];
  const modelName = inputData.model?.display_name ?? "Claude";
  parts.push(`${COLORS.YELLOW}\u{1F680} ${modelName}${COLORS.RESET}`);
  const tokenMetrics = await getTokenMetrics(inputData.transcript_path);
  parts.push(
    `${COLORS.MAGENTA}\u{1F9E0} ${(tokenMetrics.contextLength / 1e3).toFixed(3)}${COLORS.RESET}`
  );
  const currentDir = inputData.workspace?.current_dir ?? "";
  if (currentDir) {
    const dirName = path.basename(currentDir);
    parts.push(`${COLORS.BLUE}\u{1F4C1} ${dirName}${COLORS.RESET}`);
  }
  const gitBranch = getGitBranch();
  if (gitBranch) {
    const gitStatus = getGitStatus();
    let gitInfo = `\u{1F33F} ${gitBranch}`;
    if (gitStatus) {
      gitInfo += ` ${gitStatus}`;
    }
    parts.push(`${COLORS.GREEN}${gitInfo}${COLORS.RESET}`);
  }
  const usageData = await getCCUsageMetrics();
  if (usageData) {
    const totalCost = formatCurrency(usageData.today.totalCost);
    const totalTokens = formatTokens(usageData.today.totalTokens);
    parts.push(
      `${COLORS.YELLOW_DIM}\u2600\uFE0F ${totalTokens} - ${totalCost}${COLORS.RESET}`
    );
    const monthCost = formatCurrency(usageData.month.totalCost);
    const monthTokens = formatTokens(usageData.month.totalTokens);
    parts.push(`${COLORS.CYAN}\u{1F4C5} ${monthTokens} - ${monthCost}${COLORS.RESET}`);
  }
  return parts.join(" | ");
}
async function main() {
  try {
    const inputRaw = await new Promise((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf-8");
      process.stdin.on("data", (chunk) => data += chunk);
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
    const inputData = JSON.parse(inputRaw);
    const statusLine = await generateStatusLine(inputData);
    console.log(statusLine);
    process.exit(0);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.log(`${COLORS.RED}[Claude] \u{1F4C1} Unknown${COLORS.RESET}`);
    } else {
      console.log(`${COLORS.RED}[Claude] \u{1F4C1} Error${COLORS.RESET}`);
    }
    process.exit(0);
  }
}
main();
