# README.md

## What are Hooks?

Hooks are user-defined shell commands that execute at specific points in Claude Code's lifecycle. They provide control over Claude's behavior, ensuring certain actions always happen rather than relying on the AI to choose to run them.

## Files in this Directory

1. **context-bundle.ts** - A hook that logs READ & PROMPT events
2. **notification.ts** - A hook that logs Notification events
3. **stop.ts** - A hook that logs Stop events
4. **subagent_stop.ts** - A hook that logs SubagentStop events

## Available Hook Events

- **PreToolUse**: Before tool execution (can block tools)
- **PostToolUse**: After successful tool completion
- **UserPromptSubmit**: When user submits a prompt
- **SubagentStop**: When a subagent completes
- **Stop**: When main agent finishes responding
- **Notification**: During system notifications
- **PreCompact**: Before context compaction
- **SessionStart**: At session initialization

## Notifications, stop & subagent_stop 

Original Code: https://github.com/pascalporedda/awesome-claude-code

Copy the hooks (and optional the sound files; win only) to you .claude/hooks folder

To Config:

```json
{
  "hooks": {
    //
    // to log notification & stop event, and play sound
    //
    "Notification": [
      {
        "matcher": "",
        "hooks": [ { "type": "command", "command": "npx tsx ~/.claude/hooks/notification.ts --notify --speak" } ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [ { "type": "command", "command": "npx tsx ~/.claude/hooks/stop.ts --chat" } ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "",
        "hooks": [ { "type": "command", "command": "npx tsx ~/.claude/hooks/subagent_stop.ts" } ]
      }
    ],
  }
}
```

To Test:

```bash
# Test notification hook
echo '{"type":"Notification","data":{}}' | npx tsx ~/.claude/hooks/notification.ts --notify --speak

# Test stop hook
echo '{"type":"Notification","data":{}}' | npx tsx ~/.claude/hooks/stop.ts --chat

# Test subagent_stop hook
echo '{"type":"SubagentStop","data":{}}' | npx tsx ~/.claude/hooks/subagent_stop.ts --speak
```


For windows, use the windows variants


## Context-bundle

Copy the hooks (context-bundle.ts) to you .claude/hooks folder

To Config:

```json
{
  "hooks": {
    //
    // to create context bundles
    //
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [ { "type": "command", "command": "npx tsx ~/.claude/hooks/context-bundle.ts" } ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [ { "type": "command", "command": "npx tsx ~/.claude/hooks/context-bundle.ts" } ]
      }
    ]
  }
}
```

To test:

```bash
# Test 
echo '{"hook_event_name":"PreToolUse", "tool_name": "Read"}' | npx tsx .claude/hooks/context-bundle.ts
echo '{"hook_event_name":"UserPromptSubmit", "prompt": "abc"}' | npx tsx .claude/hooks/context-bundle.ts
```






