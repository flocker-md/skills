# Claude Code visual vocabulary

What each on screen element means for Claude Code terminal simulation.

## Glyphs

| Glyph | Meaning |
|---|---|
| `⏺` | Start of a tool call, or an assistant turn. The colour identifies the status. |
| `⎿` | The result of the tool call. Always indented under the tool name. |
| `❯` | The prompt caret. Also prefixes the user's own turn in the transcript. |
| `⏵⏵` / `⏸` | Mode indicator on the line below the composer. |
| `· ✢ ✳ ✶ ✻ ✽` | The thinking spinner cycle. It runs forward and back. |

## Colours

The palette is Tokyo Night plus Claude's terracotta. Users familiar with Claude Code
will recognise it.

| Token | Hex | Used for |
|---|---|---|
| `rose` | `#cd694a` | Assistant `⏺`, the welcome box border, the thinking verb |
| `fg` | `#c0caf5` | Body text |
| `dim` | `#565f89` | Brackets, the `⎿` glyph, the expand hint |
| `cyan` | `#7dcfff` | Tool arguments |
| `green` | `#4ea96f` | Tool succeeded |
| `amber` | `#e0af68` | Tool still running |
| `userRow` | `#3a3a3a` | Background of the user's turn (full width) |

## Tool call anatomy

```
⏺ server - tool_name(argument)
  ⎿ result line (ctrl+o to expand)
```

- The MCP server prefix appears only for MCP tools. Built-ins (`Bash`, `Read`,
  `Edit`) have no prefix.
- The `⎿` aligns under the tool name, not under the `⏺`. Use an invisible `⏺`
  as a spacer — a plain indent drifts at different font sizes.
- `(ctrl+o to expand)` means output exists but is collapsed. Use it when you
  want to imply detail without showing it.

## Status transitions

A tool call is amber while running, then flips green.
Tool call simulation should follow this sequence, because real work takes
time.

Give a background job a visibly longer amber period than a quick lookup. The
difference in duration signifies long-running and expensive tasks. Keep this within
a reasonable pace for playback.

## The composer

Three parts, top to bottom:

1. The effort chip, right-aligned. Example: `● high · /effort`.
2. The input row, between two horizontal rules, prefixed with `❯`.
3. The mode line. Example: `⏵⏵ auto mode on (shift+tab to cycle) · ← for agents`.

The placeholder only shows when the input is not focused. When focused,
the placeholder clears and the block caret appears.

## The welcome box

A bordered box with the title inside the top border: eg. `Claude Code v2.x.x`. Left
side should include the greeting, the pixel logo, the model line and the working
directory. Right side shows tips. It scrolls away as the session fills.
