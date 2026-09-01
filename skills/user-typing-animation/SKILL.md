---
name: user-typing-animation
description: |
  Simulate a person typing in Remotion — variable keystroke speed, hesitation
  after punctuation, and a read-back pause before the input is submitted. Use
  when the typing needs to look human: a user entering a prompt, a search box,
  a chat composer, a form field.
license: MIT
compatibility: Requires an existing Remotion 4.x project. The typing module itself has no dependencies.
metadata:
  tags: remotion, typing, human-input, animation, terminal, composer
---

## When to use

Use for any composition that shows a person typing — a terminal prompt, a
search box, a chat composer, a form field. Prefer `references/typing.ts` over a
hand-written character reveal.

For machine output (a CLI printing a result, a streamed model response) the
opposite feel applies. Pass `{ jitter: 0 }` here, or use a linear character
reveal instead.

## The API

```ts
import {
  typeHuman,
  typingDurationInFrames,
  settleDelayInFrames,
  isTyping,
} from "./typing";
```

| Function | Returns |
|---|---|
| `typeHuman(text, frame, startFrame, fps, opts?)` | The visible slice of `text` at this frame |
| `typingDurationInFrames(text, fps, opts?)` | How many frames the full string takes |
| `settleDelayInFrames(fps, opts?)` | A held beat (~2s default, randomised) |
| `isTyping(text, frame, startFrame, fps, opts?, within?)` | Whether a keystroke landed recently |
| `typingSchedule(text, opts?)` | Raw per-character timings in seconds |

`TypingOptions`: `cps` (default 24), `jitter` (0.45), `pauses`
(`DEFAULT_PAUSES`), `pauseJitter` (0.5), `seed` (the text itself).

## Rules

**1. Never use `Math.random()`.** Frames render concurrently and often in
separate processes, so an unseeded value differs frame to frame and the text
flickers instead of typing. `typing.ts` exports `seeded(string)` — an FNV-1a
hash, not a random number — and keys it on the character index. Change `seed`
to get a different, but still stable, performance from the same string.

The module has no imports at all, so it works outside Remotion too. If you
prefer Remotion's own `random()`, it is a drop-in swap for `seeded()`.

**2. Derive the next beat, don't hand-tune it.** Hard-coding the frame where
typing "should" be finished breaks if the contents change:

```ts
const TYPE_START = 86;
const TYPE_OPTS: TypingOptions = { cps: 25, seed: "changelog-prompt" };
const SUBMIT =
  TYPE_START +
  typingDurationInFrames(PROMPT_TEXT, FPS, TYPE_OPTS) +
  settleDelayInFrames(FPS, { seed: TYPE_OPTS.seed });

const F = {
  typeStart: TYPE_START,
  submit: SUBMIT,
  reply: SUBMIT + 381, // later beats hang off SUBMIT, so they reflow too
} as const;
```

**3. Always settle before submitting.** Firing enter on the frame the last
character lands can appear unnatural — a person usually reads their input 
back first. `settleDelayInFrames` defaults to 2s with `jitter: 0.25`, 
so it draws from 1.5–2.5s; pass `seconds` to lengthen it for denser
copy. The caret resumes blinking during the settle.

**4. Hold the caret solid while keys land.** A caret that blinks while keys
are landing can look like a placeholder animation. `isTyping()` covers this:

```tsx
<ClaudePrompt
  text={typeHuman(PROMPT, frame, F.typeStart, fps, TYPE_OPTS)}
  caretSolid={isTyping(PROMPT, frame, F.typeStart, fps, TYPE_OPTS)}
/>
```

## Pacing agent responses and messages

`settleDelayInFrames` is not only for the enter key. Give every gap between an
agent's tool calls and messages its own seeded pause, and walk the timeline
forward instead of writing fixed offsets — allowing duration to be derived.

```ts
const agentPause = (n: number) =>
  settleDelayInFrames(FPS, { seconds: 1.2, seed: `agent-pause-${n}` });

const ACK = SUBMIT + agentPause(0);
const BIND = ACK + 74;
const ON_AWAKE = BIND_DONE + agentPause(1);
```

Roughly 3/5 of the user's read-back visualises well: long enough that the transcript
breathes, short enough that it doesn't drag. Distinct seeds matter — identical
gaps will feel metronomic, which should be avoided.

## Tuning

| Want | Change |
|---|---|
| A confident, practised user | `cps: 28–34`, `jitter: 0.3` |
| Someone composing as they go | `cps: 16–20`, `jitter: 0.6` |
| A machine / paste | `jitter: 0`, and drop `pauses` to `{}` |
| Longer thinking beats mid-sentence | Raise the `,` and `.` entries in `pauses` |
| A longer read-back before enter | `settleDelayInFrames(fps, { seconds: 3 })` |

`DEFAULT_PAUSES` covers `, ; : . ? ! —` and newline. Sentence ends dwell
longest (0.3s), commas shortest (0.16s), each scaled by `pauseJitter`.

## Reference files

- `references/typing.ts` — the module itself. Zero dependencies; copy it in as-is.

## Reference implementation

See also the `claude-code-remotion` skill, which uses this module for its
timeline. In this repo, `src/ClaudeCodeProfiles.tsx` — a pointer clicks into the composer, the
placeholder clears, the prompt types with a beat after the comma, then a ~2s
read-back pause before enter.

## Relationship to the official Remotion skill

The base technique is to reveal text by slicing the string against
`useCurrentFrame()`, never by animating per-character opacity. Remotion's
official `remotion-best-practices` skill also covers this, in
`rules/text-animations.md`. You do not need that skill to use this one.

This skill adds the characteristics that make typing look human:
per-keystroke speed variation, hesitation after punctuation, a read-back pause
before submitting, and seeded values so all of it survives a render.