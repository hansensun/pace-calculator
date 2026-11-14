# Pace Calculator: Plan

## Summary
A simple one-page running pace calculator for personal use. Type a target finish time and pick a distance. The page shows the pace per km and a splits table. Open it in a browser. No login, no build step, no network.

## Delivery
- A single `index.html` with inline CSS and JS.
- No dependencies, no network calls. It works offline by double-clicking the file.
- Layout is clean and mobile-friendly. Light and dark mode follow the system setting.

## Inputs
**Target time**
- One text field, accepting `h:mm:ss` or `mm:ss` (for example `3:45:00` or `22:30`).
- Optional decimal on the seconds (for example `4:05.3`).
- Results update live as you type. There is no Calculate button.
- Invalid input shows a quiet inline hint, not a pop-up.

**Distance**
- Five buttons: **5K, 10K, Half, Marathon, Custom**. Marathon is the default.
- Exact distances: 5 km, 10 km, 21.0975 km, 42.195 km.
- **Custom** reveals a number field with an **m / km** unit selector (default m). Examples: `1500` m, `2.4` km.
- Allowed custom range is 100 m to 200 km. Anything outside it, zero or negative shows the same inline hint.

**Split interval**
- Default is 5 km for 10K, Half and Marathon.
- Default is 1 km for 5K and anything shorter, including custom distances under 10 km.
- A small selector (400 m / 1 km / 5 km) lets you override the default.

**Persistence**
- The last distance, custom value and unit, time and split interval are saved in `localStorage`.
- All reads and writes are wrapped in try/catch, and the page works without storage.

## Outputs
- **Pace** in min/km only, as `m:ss /km`. There is no miles toggle.
- **Splits table** with even pacing only:
  - Columns: Distance, **Elapsed** (cumulative clock time) and **Segment** (time for that split).
  - One row per split interval.
  - The last row is always the finish at the exact distance, and its elapsed time equals the target time. For the marathon that is 42.195 km, and the segment from 40 km is partial.
- **Time display**
  - Tenths of a second when the total time is under 10 minutes.
  - Whole seconds when the total time is 10 minutes or more.

## Out of scope for now
- Negative or positive split strategies.
- Miles or per-mile pace.
- Race-time prediction and training zones.
- Accounts, sharing and export.

## Build notes
- Use exact decimal distances for the maths. Compute pace as total seconds divided by distance in km.
- Avoid floating-point drift in split marks. Compute each elapsed time as `pace * distance` instead of adding up segments.
- Suggested checks after building:
  - 3:45:00 for a marathon gives 5:20 /km, with 5 km elapsed at 26:40 and the final 2.195 km segment at 11:42.
  - 1:45:00 for a half gives 4:59 /km.
  - 22:30 for a 5K gives 4:30 /km, with 1 km splits ending at a 5 km finish row.
  - 1500 m custom at 4:05.3 shows tenths.
  - Blank, malformed, out-of-range and zero inputs show the hint and no results.
