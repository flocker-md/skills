# flocker skills

Agent Skills published by [flocker.md](https://flocker.md), for
[Claude Code](https://claude.com/claude-code) and other agents that read
`SKILL.md`.

Skills are grouped into sets. Install a whole set, or copy in a single skill.
Each set is published two ways: as a plugin in
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) for Claude
Code, and as a [skill set](https://skill-set.md) manifest under
[`sets/`](sets) for `skill-set` users.

## Video — `remotion-agent-video`

Building [Remotion](https://remotion.dev) compositions that show a coding agent
at work: product demos, launch videos and feature explainers.

| Skill | What it does |
|---|---|
| [`claude-code-remotion`](skills/claude-code-remotion) | Build Remotion compositions that simulate a Claude Code terminal session — welcome box, streamed tool calls, thinking spinner, prompt composer, and the pacing that makes it read as real work. |
| [`user-typing-animation`](skills/user-typing-animation) | Simulate a person typing — variable keystroke speed, hesitation after punctuation, and a read-back pause before the input is submitted. |

These two need an existing Remotion 4.x project with React 19. They do not
scaffold one. Remotion has its own licence terms, which apply to your use of it
regardless of the licence on these skills.

Each skill is self-contained. `claude-code-remotion` ships its own copy of the
typing helpers, so you can install either one on its own.

## Install

In Claude Code, add this repo as a plugin marketplace, then install the sets you
want:

```
/plugin marketplace add flocker-md/skills
/plugin install remotion-agent-video@flocker-skills
```

Or install the set with the `skill-set` CLI, which pins each member to a
verified content hash:

```bash
npx @skill-set/cli add https://raw.githubusercontent.com/flocker-md/skills/main/sets/remotion-agent-video.skill-set.json
```

Or install with the `skills` CLI, which supports other agents too:

```bash
npx skills add flocker-md/skills
```

Or copy the files in directly — `~/.claude/skills/` for every project,
`.claude/skills/` for one:

```bash
git clone https://github.com/flocker-md/skills.git /tmp/flocker-skills
cp -R /tmp/flocker-skills/skills/* ~/.claude/skills/
```

Run `/skills` in Claude Code to confirm they are loaded.

## What is in a skill

Each skill is a directory holding a `SKILL.md` and, where useful, supporting
files. For example:

```
skills/claude-code-remotion/
  SKILL.md           # the instructions the agent reads
  references/        # files to read or copy on demand
    claude-code-ui.tsx
    example-session.tsx
    typing.ts
    glossary.md
```

Where a skill ships code, it is working source rather than pseudocode. Copy it
in and adapt it.

## Adding skills to this repo

Skills live flat in `skills/<name>/`, one directory per skill. The directory
name must match the `name` field in that skill's `SKILL.md`.

Grouping happens in `.claude-plugin/marketplace.json`, not in the directory
tree. A repo can only have one marketplace file, so to offer a different set to
a different audience, add another entry to `plugins[]`:

```json
{
  "name": "mcp-tooling",
  "source": "./",
  "category": "mcp",
  "skills": ["./skills/some-new-skill"]
}
```

Users then install that set on its own with
`/plugin install mcp-tooling@flocker-skills`. A skill can appear in more than
one set.

## Notices

**Not affiliated with Anthropic.** `claude-code-remotion` reproduces the look of
the Claude Code terminal interface for demonstration and marketing video
purposes. It is an independent project. It is not made by, endorsed by, or
affiliated with Anthropic.

**Credit.** The visual grammar of the Claude Code interface — the `⏺` / `⎿` tool
lines, the pixel logo bitmap, the spinner glyph cycle and the palette — was
referenced from [`theswerd/brainless`](https://github.com/theswerd/brainless)
(MIT), which transcribed them from Claude Code's own output. The components here
are written from scratch to be frame-driven.

## Licence

MIT. See [LICENSE](LICENSE).
