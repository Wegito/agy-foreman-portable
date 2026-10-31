# agy-foreman (portable edition)

Let **Claude Code** hand coding tasks to **Gemini**, and keep only the work that passes your tests.

This is [agy-foreman](https://github.com/mountaser/agy-foreman) packaged as **one folder you can put anywhere**. No installer, no admin rights, and no need to install Node.js first.

## Set it up (once)

**macOS and Linux: one line.** Open Terminal (on a Mac: press Cmd+Space, type "Terminal") and paste:

```bash
curl -fsSL https://raw.githubusercontent.com/Wegito/agy-foreman-portable/main/install.sh | bash
```

It puts agy-foreman in `~/agy-foreman` and runs the setup. Works on Apple Silicon and Intel Macs.

**Windows:** download this repository (green **Code** button → _Download ZIP_), unzip it anywhere, and double-click **`setup.bat`**.

**Prefer a downloaded folder on a Mac?** Run `bash setup.command` in Terminal from inside the folder. (A ZIP download from GitHub drops the "executable" flag and macOS flags downloaded scripts as unverified, so double-clicking may be refused; the one-line install above avoids both.)

Setup takes a minute or two. It fetches a private copy of Node.js if your computer has none, builds agy-foreman, installs the Claude skill, and registers agy-foreman with Claude Code for all your projects. Then **restart Claude Code**.

macOS 13.5 or newer is needed for the built-in Node. On an older Mac, install Node.js 20+ from https://nodejs.org first and setup will use that.

## Use it in a project

1. Open a terminal in your project and run `agy-foreman init` (Windows: `agy-foreman.bat init`; use the full path to this folder if it isn't on your PATH).
   This creates a small `.agy-foreman.json` that tells agy-foreman how to run your tests. Check that the test command is right.
2. Ask Claude Code, for example: _"Run task 3 of docs/plans/auth.md with Gemini."_
3. Approve the plan once. Gemini works in its own git worktree, your tests check the result, and Claude merges only what passes.

## What you need besides this folder

| Program                                                       | What for                                         | Get it                              |
| ------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| **Git** (2.38+)                                               | Gemini works on an isolated copy of your project | https://git-scm.com/downloads       |
| **Claude Code**                                               | Where you give the tasks                         | https://claude.com/claude-code      |
| **Antigravity CLI (`agy`)**, signed in to your Google account | Runs Gemini                                      | https://antigravity.google/docs/cli |

Run `agy-foreman doctor` any time: it checks Node, git and your `agy` login and says what's missing.

## Commands

Run them as `~/agy-foreman/agy-foreman <command>` (macOS/Linux; add the folder to your PATH to type just `agy-foreman`) or `agy-foreman.bat <command>` (Windows). They run in the folder you are in.

| Command                                | What it does                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `setup`                                | One-time setup (build, skill, Claude Code registration). Run again if you move this folder |
| `init`                                 | Create `.agy-foreman.json` in the current project                                          |
| `doctor`                               | Check your setup                                                                           |
| `rebuild`                              | Reinstall and rebuild if something is broken                                               |
| `watch`, `wait <job>`, `statusline`, … | Everything else in the [technical reference](docs/TECHNICAL.md)                            |

## Good to know

- **Moving the folder:** run `setup` again so Claude Code finds the new location.
- **Updating:** download the newest portable edition and run `setup`; your project settings aren't touched.
- **Unattended automation:** not covered; see the terms-of-service note in the [technical reference](docs/TECHNICAL.md).
- Not affiliated with Google or Anthropic.

## Credits

All the real work is by [Mountaser Halak](https://mountaserhalak.com), under the MIT licence. This edition only adds the launcher scripts (`agy-foreman`, `agy-foreman.bat`, `setup.*`, `scripts/`). See [LICENSE](LICENSE) and [NOTICE](NOTICE).
