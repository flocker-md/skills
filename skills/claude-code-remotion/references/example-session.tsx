/**
 * REFERENCE COMPOSITION — a minimal Claude Code session.
 *
 * Demonstrates a complete example: derived timeline, seeded pauses,
 * pending→success tool states, and the staged buffer scroll. Adapt the beats
 * and copy; keep the structure.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import {
  cc,
  FS,
  ClaudeHeader,
  ClaudeMessage,
  ClaudePrompt,
  ClaudeThinking,
  ClaudeToolCall,
  ClaudeWindow,
} from "./claude-code-ui";
import {
  typeHuman,
  typingDurationInFrames,
  settleDelayInFrames,
  isTyping,
  TypingOptions,
} from "./typing";

const FPS = 30;
const PROMPT_TEXT = "Read the changelog, then summarise what shipped this week";

const TYPE_START = 40;
const TYPE_OPTS: TypingOptions = { cps: 25, seed: "example-prompt" };

// Always derive rather than hardcode.
const SUBMIT =
  TYPE_START +
  typingDurationInFrames(PROMPT_TEXT, FPS, TYPE_OPTS) +
  settleDelayInFrames(FPS, { seed: TYPE_OPTS.seed });

/** Gap between consecutive agent actions — 3/5 of the user's read-back. */
const agentPause = (n: number) =>
  settleDelayInFrames(FPS, { seconds: 1.2, seed: `agent-pause-${n}` });

// Walk the timeline forward. Each gap is an explicit, seeded pause.
const ACK = SUBMIT + agentPause(0);
const THINK = ACK + agentPause(1);
const READ = THINK + 52; // spinner, pre-tool line
const READ_DONE = READ + 30;
const SUMMARY = READ_DONE + agentPause(2);
const SUMMARY_DONE = SUMMARY + 64; // jobs take time to complete
const REPLY = SUMMARY_DONE + agentPause(3);

export const EXAMPLE_SESSION_DURATION = REPLY + 120;

const PAGE_BG =
  "radial-gradient(85% 85% at 50% 45%, #2b2b32 0%, #141417 55%, #08080a 100%)";

/** Fade + rise an entry in. */
const Reveal: React.FC<{
  at: number;
  frame: number;
  children: React.ReactNode;
}> = ({ at, frame, children }) => {
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 8}px)` }}>
      {children}
    </div>
  );
};

export const ExampleSession: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typed = typeHuman(PROMPT_TEXT, frame, TYPE_START, fps, TYPE_OPTS);
  const submitted = frame >= SUBMIT;

  const statusAt = (doneFrame: number) =>
    frame >= doneFrame ? ("success" as const) : ("pending" as const);

  // Scroll the buffer if the transcript would overflow the window.
  const scrollY = interpolate(
    frame,
    [SUMMARY - 24, SUMMARY + 16],
    [0, -320],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: PAGE_BG,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ClaudeWindow width={1600} height={920}>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              transform: `translateY(${scrollY}px)`,
              paddingTop: FS * 0.75, // room for the header's title-in-border
              display: "flex",
              flexDirection: "column",
              gap: FS * 0.7,
            }}
          >
            <Reveal at={6} frame={frame}>
              <ClaudeHeader />
            </Reveal>

            <Reveal at={SUBMIT} frame={frame}>
              <ClaudeMessage role="user">{PROMPT_TEXT}</ClaudeMessage>
            </Reveal>

            <Reveal at={ACK} frame={frame}>
              <ClaudeMessage>
                <span style={{ color: cc.rose }}>⏺</span> On it — I&rsquo;ll
                read the changelog first.
              </ClaudeMessage>
            </Reveal>

            {/* the spinner replaces the proceeding tool line */}
            {frame >= THINK && frame < READ ? (
              <ClaudeThinking frame={frame} fps={fps} startFrame={THINK} />
            ) : null}

            <Reveal at={READ} frame={frame}>
              <ClaudeToolCall
                tool="Read"
                arg="CHANGELOG.md"
                status={statusAt(READ_DONE)}
                expandable={frame >= READ_DONE}
                result={frame >= READ_DONE ? "Read 240 lines" : "Reading…"}
              />
            </Reveal>

            <Reveal at={SUMMARY} frame={frame}>
              <ClaudeToolCall
                tool="Bash"
                arg="git log --oneline --since='7 days ago'"
                status={statusAt(SUMMARY_DONE)}
                expandable={frame >= SUMMARY_DONE}
                result={
                  frame >= SUMMARY_DONE
                    ? "18 commits — 4 features, 9 fixes, 5 chores"
                    : "Running in background…"
                }
              />
            </Reveal>

            <Reveal at={REPLY} frame={frame}>
              <ClaudeMessage>
                <span style={{ color: cc.rose }}>⏺</span> Done. Four features
                shipped this week, plus nine fixes.
              </ClaudeMessage>
            </Reveal>
          </div>
        </div>

        <div style={{ flexShrink: 0, paddingTop: FS * 0.8 }}>
          <ClaudePrompt
            frame={frame}
            fps={fps}
            focused={frame >= TYPE_START - 8}
            caretSolid={isTyping(PROMPT_TEXT, frame, TYPE_START, fps, TYPE_OPTS)}
            text={submitted ? "" : typed}
          />
        </div>
      </ClaudeWindow>
    </AbsoluteFill>
  );
};
