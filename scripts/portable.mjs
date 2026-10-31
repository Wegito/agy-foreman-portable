#!/usr/bin/env node
// Portable launcher for agy-foreman (Windows, macOS, Linux).
//   setup          build once, install the Claude skill, register with Claude Code
//   rebuild        reinstall and rebuild from scratch
//   anything else  passed to the agy-foreman CLI, run in the folder you called it from
//                  (init, doctor, wait <job>, watch, statusline, install-skill, --help …)
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IS_WIN = process.platform === "win32";
const ENTRY = path.join(ROOT, "dist", "index.js");
const STAMP = path.join(ROOT, ".runtime", "build-stamp");
const CALLER_CWD = process.env.AGY_CALLER_CWD || process.cwd();
const args = process.argv.slice(2);
const cmd = args[0] ?? "help";

const c = (code, s) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const say = (s = "") => console.log(s);
const step = (s) => say(c(36, "› ") + s);
const ok = (s) => say(c(32, "✓ ") + s);
const warn = (s) => say(c(33, "! ") + s);
const die = (s) => {
  console.error(c(31, "✗ ") + s);
  process.exit(1);
};

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) die(`Node 20 or newer is needed (this is ${process.versions.node}). Use the agy-foreman launcher, which installs it for you.`);

/** Quotes an argument for cmd.exe, where npm and claude are .cmd files that need a shell. */
const q = (a) => (IS_WIN && /[\s&()^]/.test(a) ? `"${a}"` : a);

function run(file, argv, opts = {}) {
  return spawnSync(q(file), argv.map(q), { stdio: "inherit", shell: IS_WIN, ...opts });
}
const has = (p) => spawnSync(q(p), ["--version"], { stdio: "ignore", shell: IS_WIN }).status === 0;

const hashOf = (f) => {
  try {
    return createHash("sha256").update(readFileSync(f)).digest("hex");
  } catch {
    return "";
  }
};

function ensureBuilt(force) {
  const stamp = `${hashOf(path.join(ROOT, "package-lock.json"))}:node${major}`;
  const current = existsSync(STAMP) ? readFileSync(STAMP, "utf8") : "";
  if (!force && existsSync(ENTRY) && current === stamp && existsSync(path.join(ROOT, "node_modules"))) return;
  step("First-time setup: installing parts (a minute or two, once)…");
  let r = run("npm", ["ci", "--no-audit", "--no-fund"], { cwd: ROOT });
  if (r.status !== 0) {
    warn("npm ci failed; trying npm install");
    r = run("npm", ["install", "--no-audit", "--no-fund"], { cwd: ROOT });
    if (r.status !== 0) die("Could not install dependencies. Check your internet connection and try again.");
  }
  step("Building agy-foreman…");
  if (run("npm", ["run", "build"], { cwd: ROOT }).status !== 0) die("Build failed.");
  mkdirSync(path.dirname(STAMP), { recursive: true });
  writeFileSync(STAMP, stamp);
  ok("Built");
}

function cli(argv, cwd = CALLER_CWD) {
  return spawnSync(process.execPath, [ENTRY, ...argv], { cwd, stdio: "inherit" }).status ?? 1;
}

function setup() {
  ensureBuilt(false);
  step("Installing the Claude skill that teaches Claude to delegate…");
  if (cli(["install-skill"], ROOT) !== 0) warn("Could not install the skill; you can retry with: agy-foreman install-skill");

  if (has("claude")) {
    step("Registering agy-foreman with Claude Code (for all your projects)…");
    run("claude", ["mcp", "remove", "agy-foreman", "--scope", "user"], { stdio: "ignore" });
    const r = run("claude", ["mcp", "add", "--scope", "user", "agy-foreman", "--", process.execPath, ENTRY, "serve"]);
    if (r.status === 0) ok("Registered");
    else warn("Registration failed. Register by hand:\n  claude mcp add --scope user agy-foreman -- " + [q(process.execPath), q(ENTRY), "serve"].join(" "));
  } else {
    warn("Claude Code was not found (https://claude.com/claude-code). Once installed, register agy-foreman with:\n  claude mcp add --scope user agy-foreman -- " + [q(process.execPath), q(ENTRY), "serve"].join(" "));
  }
  if (!has("git")) warn("git was not found: https://git-scm.com/downloads");
  if (!has("agy")) warn("The Antigravity CLI (agy) was not found. Install it and sign in to your Google account: https://antigravity.google/docs/cli");

  say();
  ok("Setup done. Next:");
  say("  1. Restart Claude Code.");
  say("  2. In each project you want to use it in, open a terminal there and run:  " + c(1, "agy-foreman init"));
  say("     (use the agy-foreman file from this folder, or run  agy-foreman doctor  to check your setup)");
  say("  3. Ask Claude: \"Run task 1 of docs/plan.md with Gemini.\"");
  say();
  say("If you move this folder, run setup again so Claude Code finds the new location.");
}

switch (cmd) {
  case "help":
  case "--help-launcher":
    say(`agy-foreman (portable)

  agy-foreman setup       one-time: build, install the skill, register with Claude Code
  agy-foreman rebuild     reinstall and rebuild from scratch
  agy-foreman init        create .agy-foreman.json in the current project
  agy-foreman doctor      check Node, git, agy and your login
  agy-foreman <command>   any other agy-foreman command (wait, watch, statusline, --help …)

On Windows use agy-foreman.bat; on macOS/Linux ./agy-foreman.`);
    break;
  case "setup":
    setup();
    break;
  case "rebuild":
    ensureBuilt(true);
    break;
  default:
    ensureBuilt(false);
    process.exit(cli(args));
}
