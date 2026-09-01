---
name: claude-code-remotion
description: |
  Build Remotion compositions that simulate a Claude Code terminal session —
  the welcome box, streamed tool calls, thinking spinner and prompt composer,
  with pacing that reads as real work. Use when asked to make a video, demo or
  animation of an agent working, a CLI session, an MCP tool in use, or a
  "watch Claude Code do X" scene. Covers the components, the beat-sheet
  timeline, and how to verify MCP tool names before putting them on screen.
license: MIT
compatibility: Requires an existing Remotion 4.x project with React 19.
metadata:
  tags: remotion, video, claude-code, terminal, mcp, animation
---

# Claude Code sessions in Remotion

Build a Remotion scene that looks like a real Claude Code session. The value is
in three things: the visual vocabulary, the pacing, and correct tool names. Get
any one wrong and it reads as a mock-up.

## When to use

Use for any composition showing an agent at work in a terminal — product demos,
launch videos, feature explainers, docs.

Do not use for real terminal capture. To record an actual session, use VHS or
asciinema and edit the output. This skill is for scenes you script and
art-direct, where every frame is deliberate and the source is diffable.

## Load these together

- `references/claude-code-ui.tsx` — the components. Self-contained, React only.
- `references/example-session.tsx` — a complete working composition.
- `references/glossary.md` — what `⏺`, `⎿` and the mode line mean. Read this
  before you change any copy.
- `references/typing.ts` — seeded human typing and pause helpers. Zero
  imports, so this skill stands alone.

Everything you need is in `references/`. If you also have the
`user-typing-animation` skill, it covers the same `typing.ts` in more depth —
tuning the cadence, punctuation pauses, and caret behaviour. It is optional.

## Rule 1: everything derives from the frame

Remotion renders frames concurrently, often in separate processes. Any value
that is not a pure function of the frame will differ between frames.

**Never use** `Math.random()`, `setInterval`, `useState`, or CSS `@keyframes`.
The text flickers, the spinner jumps, the shimmer stalls.

Instead:

- Spinner glyph: `GLYPHS[Math.floor(local / 3.5) % GLYPHS.length]`
- Elapsed counter: `Math.floor(local / fps)`
- Shimmer: a computed `backgroundPosition`, not a keyframe animation
- Anything varied: a seeded hash of the index, never `Math.random()`
  (`typing.ts` exports `seeded()` for this)

This is why the components here are rewritten rather than reused from web
component libraries. Static React terminal UI does not survive a render.

## Rule 2: build the timeline forward, never as fixed offsets

Fixed frame numbers break if any scenes drift in length. Walk the timeline
forward instead, so one edit reflows everything after it:

```ts
const SUBMIT =
  TYPE_START +
  typingDurationInFrames(PROMPT_TEXT, FPS, TYPE_OPTS) +
  settleDelayInFrames(FPS, { seed: TYPE_OPTS.seed });

const agentPause = (n: number) =>
  settleDelayInFrames(FPS, { seconds: 1.2, seed: `agent-pause-${n}` });

const ACK = SUBMIT + agentPause(0);
const THINK = ACK + agentPause(1);
const READ = THINK + 52;
```

Derive the composition duration too: `export const DURATION = REPLY + 120`.

## Rule 3: Pacing makes interacts look natural

| Beat | Length | Why |
|---|---|---|
| Pause between agent actions | ~1.2s, seeded | Identical gaps read as a metronome |
| User read-back before enter | ~2s, seeded | People don't submit immediately on the last keystroke |
| Thinking spinner | 45–60 frames | Long enough to register as work |
| Quick tool (read, bind) | 28–32 frames amber | |
| Background job (build, git log) | 64–72 frames amber | The contrast is what says "expensive" |

Every pause takes its own seed. Reusing a seed defeats the intentional jitter.

Each tool call must pass through amber and then flip green. A call that is
green on its first frame reads as fake.

## Rule 4: the buffer scrolls, it does not grow

The transcript will outgrow the window. Scroll it in stages so that the resulting video is easy to watch, 
each timed to (or triggered by) the moment new output would overflow:

```ts
const scrollY = interpolate(
  frame,
  [READ_POST - 24, READ_POST + 16, POST - 24, POST + 16],
  [0, -318, -318, -450],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
```

Check the first and last frame. They are often used for thumbnails, previews and screenshots, so the most important
tool calls must still be on screen when the composition ends (if there are no further scenes in the composition).

Verify by rendering a still at each of those frames and looking at it. These
offsets are not reliable to estimate.

## Rule 5: verify MCP tool names before you draw them

If the scene shows MCP tools, the names must be real. Invented ones are obvious
to anyone who uses the product, and documentation goes stale fast.

**Do this before writing any tool call:**

1. Check whether the MCP server requires authentication. An unauthenticated server
   exposes only `authenticate` and `complete_authentication`. This looks
   identical to "no tools available" and is easy to misread.
2. If it is not authenticated, but required, ask the user to run `/mcp`. Do not fall back to
   documentation unless necessary or instructed.
3. Call each domain tool's `actions_list` action for the current schemas.
4. Use the server's own wording in the result lines if available and relevant.

Render MCP calls as `server - tool_name(action · target)`. Built-in tools
(`Bash`, `Read`, `Edit`) take no server prefix.

## Fonts

Load a mono font with `@remotion/google-fonts`. A bare `monospace` stack
resolves differently in the render than in the Studio preview, so text shifts
between what you approve and what you ship.

## Theming

`cc` in `claude-code-ui.tsx` contains colour styling required to match. Update as required.
Keep the terracotta and Tokyo Night values if the scene is meant to read as
Claude Code specifically — see `references/glossary.md` for what each does.

One brand colour is worth keeping: tint the MCP server prefix with your own
accent. It makes your tools stand out from the built-in ones without breaking
the palette.

## Credit

Some visual grammar — the `⏺`/`⎿` tool lines, the pixel logo bitmap, the glyph
cycle and the palette were referenced from `theswerd/brainless` (MIT), which transcribed
them from Claude Code's own output. The components here are written from
scratch to be frame-driven.
