/**
 * REFERENCE COPY — drop this into your own project and adapt it.
 *
 * Self-contained: no imports beyond React. Swap the `cc` palette for your own 
 * as needed.
 *
 * Claude Code terminal UI primitives, Remotion-native.
 *
 * The visual grammar is intentionally frame-driven: no setInterval, no
 * <details> disclosure, no useState. Everything animatable is derived from the
 * frame passed, so renders are deterministic.
 *
 * Colours are Claude Code's own (Tokyo Night + terracotta) — the point of the 
 * scene is that this *is* Claude Code. This skill was created for flocker.md -
 * so you should update your brand colours as needed (eg. `cc.flocker`, used 
 * to tint the flocker.md Agent Profiles MCP server prefix)
 *
 * Contents, in order:
 *   cc             — the colour palette. Swap this to retheme.
 *   FS             — base font size; every other size derives from it.
 *   Caret          — block cursor, with a `solid` mode for active typing.
 *   ClaudeLogo     — the pixel launch sprite, drawn as SVG.
 *   ClaudeHeader   — the welcome box.
 *   ClaudeMessage  — a conversation turn; user turns get the dark row.
 *   ClaudeToolCall — the tool/result pair, with pending/success/error status.
 *   ClaudeThinking — the spinner line.
 *   ClaudePrompt   — the composer: effort chip, input row, mode line.
 *   ClaudeWindow   — macOS-style window chrome.
 */
import React from "react";

/** Claude Code's terminal palette. */
export const cc = {
  bg: "#1a1b26",
  chrome: "#16161e",
  border: "#2a2b3d",
  fg: "#c0caf5",
  dim: "#565f89",
  gray: "#949494",
  rose: "#cd694a", // Claude terracotta
  hilite: "#e79475", // the highlight the shimmer carries
  cyan: "#7dcfff",
  green: "#4ea96f",
  amber: "#e0af68",
  userRow: "#3a3a3a",
  userCaret: "#4e4e4e",
  flocker: "#0bdcdc", // brand tint for the MCP server prefix
} as const;

/** Base terminal font size. Every other size in this file derives from this base. */
export const FS = 26;

const mono =
  "'SF Mono', 'Menlo', 'Monaco', 'Roboto Mono', 'Courier New', monospace";

// ---------------------------------------------------------------------------
// Caret
// ---------------------------------------------------------------------------

/**
 * Block cursor, blinking on a 2Hz cycle. `solid` holds it lit — a real caret
 * stops blinking while keys are landing and resumes once the hand stops.
 * See `src/typing.ts` for the typing helpers that drive it.
 */
export const Caret: React.FC<{
  frame: number;
  fps: number;
  solid?: boolean;
}> = ({ frame, fps, solid = false }) => (
  <span
    style={{
      display: "inline-block",
      width: "0.6em",
      height: "1.05em",
      background: cc.fg,
      verticalAlign: "text-bottom",
      opacity: solid || Math.floor((frame / fps) * 2) % 2 === 0 ? 1 : 0,
    }}
  />
);

// ---------------------------------------------------------------------------
// Welcome box
// ---------------------------------------------------------------------------

const CLAUDE_LOGO_BITS = [
  "000111111111111000",
  "000110111111011000",
  "011111111111111110",
  "000111111111111000",
  "000010100001010000",
];

/** Claude Code's launch sprite, drawn as a crisp SVG grid. */
export const ClaudeLogo: React.FC<{ scale?: number; color?: string }> = ({
  scale = 5,
  color = cc.rose,
}) => {
  const w = CLAUDE_LOGO_BITS[0].length;
  const h = CLAUDE_LOGO_BITS.length;
  // Terminal cells are taller than wide; stretch each sprite pixel vertically
  // so the logo keeps its proportions instead of looking squat.
  const PH = 2.4;
  const rects: React.ReactElement[] = [];
  CLAUDE_LOGO_BITS.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      if (row[x] === "1") {
        let end = x;
        while (end < w && row[end] === "1") end += 1;
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y * PH}
            width={end - x}
            height={PH}
          />,
        );
        x = end;
      } else {
        x += 1;
      }
    }
  });
  return (
    <svg
      width={w * scale}
      height={h * PH * scale}
      viewBox={`0 0 ${w} ${h * PH}`}
      shapeRendering="crispEdges"
      fill={color}
    >
      {rects}
    </svg>
  );
};

export const ClaudeHeader: React.FC<{
  version?: string;
  user?: string;
  model?: string;
  org?: string;
  cwd?: string;
  tips?: string[];
}> = ({
  version = "v2.1.206",
  user = "Harry Martin",
  model = "Opus 5 with high effort · Claude Max",
  org = "flocker.md",
  cwd = "~/work/flocker/flocker-agent-profiles",
  tips = [
    "Agent Profiles are available via the flocker MCP server",
    "Run /mcp to see connected servers",
  ],
}) => (
  <div
    style={{
      position: "relative",
      border: `1px solid ${cc.rose}`,
      borderRadius: 6,
      padding: `${FS * 0.9}px ${FS}px ${FS * 0.8}px`,
      fontFamily: mono,
      fontSize: FS,
      lineHeight: 1.5,
      color: cc.fg,
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) 1px minmax(0,1.1fr)",
      gap: FS * 1.4,
    }}
  >
    {/* title-in-the-border */}
    <span
      style={{
        position: "absolute",
        top: -FS * 0.62,
        left: FS * 0.8,
        padding: `0 ${FS * 0.4}px`,
        background: cc.bg,
        color: cc.rose,
        whiteSpace: "nowrap",
      }}
    >
      Claude Code <span style={{ color: cc.gray }}>{version}</span>
    </span>

    {/* left: identity */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: FS * 0.3,
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 600 }}>Welcome back {user}!</div>
      <div style={{ margin: `${FS * 0.35}px 0` }}>
        <ClaudeLogo />
      </div>
      <div style={{ color: cc.gray }}>
        <div>{model}</div>
        <div>{org}</div>
        <div>{cwd}</div>
      </div>
    </div>

    <div style={{ background: `${cc.rose}55` }} />

    {/* right: tips */}
    <div>
      <div style={{ color: cc.rose, fontWeight: 600 }}>
        Tips for getting started
      </div>
      {tips.map((t) => (
        <div key={t}>{t}</div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Conversation turns
// ---------------------------------------------------------------------------

/** A conversation turn. User turns get the full-width dark ❯ row. */
export const ClaudeMessage: React.FC<{
  role?: "user" | "assistant";
  children: React.ReactNode;
}> = ({ role = "assistant", children }) => {
  if (role === "user") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          background: cc.userRow,
          fontFamily: mono,
          fontSize: FS,
          lineHeight: 1.55,
        }}
      >
        <span style={{ color: cc.userCaret, flexShrink: 0 }}>❯</span>
        {/* one terminal cell of gap — a trailing space in a flex child collapses */}
        <span style={{ display: "inline-block", width: "1ch", flexShrink: 0 }} />
        <span style={{ color: "#ffffff", flex: 1, minWidth: 0 }}>
          {children}
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: FS,
        lineHeight: 1.6,
        color: cc.fg,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tool call
// ---------------------------------------------------------------------------

export type ToolStatus = "success" | "error" | "pending";

const STATUS_COLOR: Record<ToolStatus, string> = {
  success: cc.green,
  error: "#f7768e",
  pending: cc.amber,
};

/**
 * A collapsed tool/result pair — `⏺ tool(arg)` over `⎿ result`.
 *
 * `server` renders the MCP server prefix (`flocker - agent_profile_page_feed`) in the
 * flocker cyan. `expandable` shows the "(ctrl+o to expand)" hint that stands in
 * for output we deliberately don't show.
 */
export const ClaudeToolCall: React.FC<{
  tool: string;
  server?: string;
  arg?: string;
  result: React.ReactNode;
  status?: ToolStatus;
  expandable?: boolean;
}> = ({ tool, server, arg, result, status = "success", expandable = false }) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: FS,
      lineHeight: 1.55,
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: "1ch" }}>
      <span style={{ color: STATUS_COLOR[status], flexShrink: 0 }}>⏺</span>
      <span style={{ minWidth: 0 }}>
        {server ? (
          <>
            <span style={{ color: cc.flocker }}>{server}</span>
            <span style={{ color: cc.dim }}> - </span>
          </>
        ) : null}
        <span style={{ color: cc.fg }}>{tool}</span>
        {arg !== undefined ? (
          <>
            <span style={{ color: cc.dim }}>(</span>
            <span style={{ color: cc.cyan }}>{arg}</span>
            <span style={{ color: cc.dim }}>)</span>
          </>
        ) : null}
      </span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "1ch",
        color: "#8b8fa3",
      }}
    >
      {/* invisible glyph spacer aligns ⎿ under the tool name */}
      <span style={{ visibility: "hidden", flexShrink: 0 }}>⏺</span>
      <span style={{ color: cc.dim, flexShrink: 0 }}>⎿</span>
      <span style={{ minWidth: 0 }}>
        {result}
        {expandable ? (
          <span style={{ color: cc.dim, marginLeft: "1ch" }}>
            (ctrl+o to expand)
          </span>
        ) : null}
      </span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Thinking line
// ---------------------------------------------------------------------------

// Captured cycle from Claude Code's thinking frames.
const CLAUDE_GLYPHS = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];

/**
 * The "working" line: pulsing glyph, a whimsical verb carrying a drifting
 * highlight, and the elapsed / interrupt hint. All derived from `frame`, so the
 * shimmer is a computed backgroundPosition rather than a CSS keyframe
 * animation (which would not be deterministic across a distributed render).
 */
export const ClaudeThinking: React.FC<{
  frame: number;
  fps: number;
  /** Frame the spinner started, so the elapsed counter reads from zero. */
  startFrame: number;
  verb?: string;
  tokensPerSecond?: number;
  /** Context already sent before this turn, so the counter never reads zero. */
  baseTokens?: number;
}> = ({
  frame,
  fps,
  startFrame,
  verb = "Flockering",
  tokensPerSecond = 137,
  baseTokens = 2400,
}) => {
  const local = Math.max(0, frame - startFrame);
  const secs = Math.floor(local / fps);
  const glyph = CLAUDE_GLYPHS[Math.floor(local / 3.5) % CLAUDE_GLYPHS.length];
  // 2.8s per shimmer pass, right to left.
  const cycle = (local % (fps * 2.8)) / (fps * 2.8);

  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: FS,
        display: "flex",
        alignItems: "baseline",
        gap: "1ch",
      }}
    >
      <span
        style={{ color: cc.rose, width: "1ch", display: "inline-block" }}
      >
        {glyph}
      </span>
      <span
        style={{
          backgroundImage: `linear-gradient(100deg, ${cc.rose} 43%, ${cc.hilite} 50%, ${cc.rose} 57%)`,
          backgroundSize: "200% 100%",
          backgroundPosition: `${100 - cycle * 200}% 0`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
      >
        {verb}…
      </span>
      <span style={{ color: "#7d7d7d" }}>
        ({secs}s · ↑ {baseTokens + secs * tokensPerSecond} tokens · esc to
        interrupt)
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Prompt composer
// ---------------------------------------------------------------------------

/**
 * The input composer: effort chip, ❯ rule, and the mode line.
 *
 * `focused` models the click: unfocused shows the dim placeholder and no
 * cursor; focused clears the placeholder and blinks the block caret.
 */
export const ClaudePrompt: React.FC<{
  text: string;
  focused?: boolean;
  /** Hold the caret lit while keys are landing. */
  caretSolid?: boolean;
  frame: number;
  fps: number;
  effort?: string;
  placeholder?: string;
}> = ({
  text,
  focused = true,
  caretSolid = false,
  frame,
  fps,
  effort = "● high · /effort",
  placeholder = "Try \"create a new Agent Profile on flocker.md ...\"",
}) => (
  <div style={{ fontFamily: mono, fontSize: FS, lineHeight: 1.6 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: `0 ${FS * 0.2}px ${FS * 0.2}px`,
        fontSize: FS * 0.92,
        color: cc.gray,
      }}
    >
      {effort}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        borderTop: `1px solid #808080`,
        borderBottom: `1px solid #808080`,
        padding: `${FS * 0.25}px 0`,
      }}
    >
      <span style={{ color: cc.fg, flexShrink: 0 }}>❯</span>
      <span style={{ display: "inline-block", width: "1ch", flexShrink: 0 }} />
      <span style={{ color: focused ? cc.fg : cc.dim, minWidth: 0, flex: 1 }}>
        {focused ? text : placeholder}
        {focused ? (
          <Caret frame={frame} fps={fps} solid={caretSolid} />
        ) : null}
      </span>
    </div>
    <div
      style={{
        marginTop: FS * 0.35,
        padding: `0 ${FS * 0.2}px`,
        fontSize: FS * 0.92,
      }}
    >
      <span style={{ color: "#ffd700" }}>⏵⏵ auto mode on</span>
      <span style={{ color: cc.gray }}>
        {" "}
        (shift+tab to cycle) · ← for agents
      </span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Window chrome
// ---------------------------------------------------------------------------

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      width: 13,
      height: 13,
      borderRadius: 999,
      background: color,
      display: "inline-block",
    }}
  />
);

/** macOS-style dark terminal window, sized to hold a Claude Code session. */
export const ClaudeWindow: React.FC<{
  width?: number;
  height?: number;
  title?: string;
  children: React.ReactNode;
}> = ({
  width = 1560,
  height = 880,
  title = "claude code",
  children,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 16,
      overflow: "hidden",
      background: cc.bg,
      border: `1px solid ${cc.border}`,
      boxShadow: "0 50px 100px -24px rgba(0, 0, 0, 0.65)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        height: 48,
        flexShrink: 0,
        background: cc.chrome,
        borderBottom: `1px solid ${cc.border}`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 20,
        gap: 10,
      }}
    >
      <Dot color="#ff5f57" />
      <Dot color="#febc2e" />
      <Dot color="#28c840" />
      <span
        style={{
          marginLeft: 16,
          color: cc.gray,
          fontFamily: mono,
          fontSize: 18,
        }}
      >
        {title}
      </span>
    </div>
    <div
      style={{
        flex: 1,
        minHeight: 0,
        padding: `${FS * 1.1}px ${FS * 1.3}px`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  </div>
);
