---
name: test-kodenames
description: End-to-end test the Kodenames app in Chrome DevTools with four isolated browser contexts acting as four players. Use when asked to "test the app", "verify a game flow", or reproduce a bug that requires multiple concurrent players.
---

# Testing Kodenames end-to-end

This app is a real-time Codenames clone (Angular + Firestore). Real-time sync means you cannot test it in a single tab — a full game needs **four distinct browser identities**: two on red (one spymaster, one guesser), two on blue (one spymaster, one guesser).

Use the `chrome-devtools` MCP to drive four pages at once. The `isolatedContext` option gives each page its own cookies/storage (equivalent to an incognito window), so each page gets a distinct persisted player identity.

## Prerequisites

1. Dev server running on `http://127.0.0.1:4300`:
   ```bash
   npx ng serve --port 4300 --host 127.0.0.1
   ```
   Wait for `Compiled successfully.` in the log before driving the browser.
2. Firebase project from `src/environments/environment.ts` is reachable (the app talks to Firestore for shared state). If offline, the app will hang at table creation.
3. If `list_pages` fails with "browser is already running for .../chrome-devtools-mcp/chrome-profile", a stale MCP chrome is holding the lock. Kill only the automation chrome (not the user's Chrome):
   ```bash
   pkill -f "chrome-devtools-mcp/chrome-profile"
   pkill -f "telemetry/watchdog/main.js --parent-pid"
   ```

## Spin up four players

Page 1 uses the default context (no `isolatedContext` argument); pages 2–4 each get a named context so they authenticate separately.

```
navigate_page(http://127.0.0.1:4300/)                       # Page 1 — Alice
new_page(http://127.0.0.1:4300/, isolatedContext="bob")     # Page 2 — Bob
new_page(http://127.0.0.1:4300/, isolatedContext="carol")   # Page 3 — Carol
new_page(http://127.0.0.1:4300/, isolatedContext="dave")    # Page 4 — Dave
```

Pages are addressed by the index `list_pages` reports. `select_page` switches which page the next tool call targets.

## Game flow (happy path)

The app stores the player identity in `localStorage` keyed by the site origin, so once a context enters a name it stays. The flow each context walks:

1. **New-player view** (`/#/`): fill name → click **Next**.
2. **Pick-table view**: click **Create new table** (first player only) OR type the 6-digit ID into **Enter table ID** → click **Join table**.
3. **Lobby view** (`Pick Teams`): click **Play Red** / **Play Blue**, then click **I'm the spymaster** for exactly one player per team. The **Start Game** button only enables when both teams have ≥2 players and each team has a spymaster.
4. **Table view** (after the red spymaster clicks Start Game):
   - Spymaster on the active team sees **Give Clue** → enter a word and pick a guess count in the dropdown → **Give Clue**.
   - A guesser on the active team sees clickable cards and a **Pass** button. Click a card word to reveal it.
   - Turn flips automatically when the guess count is used up, the guesser picks a wrong-team card, or they pass.

Recommended test cast:
- Alice → Red spymaster (creates table)
- Bob → Blue spymaster
- Carol → Red guesser
- Dave → Blue guesser

## Driving the UI

`take_snapshot` returns an accessibility tree with unique `uid`s. Use those with `click` and `fill`. The snapshot refreshes after every interaction — re-snapshot before each click because uids change.

Landmarks worth recognizing:
- Spymaster views show cards with their team color (styling, not text). The card list is always `StaticText` per word — clicking the uid of the word triggers reveal.
- `navigation` region shows turn status: `"Waiting on you to give a clue..."`, `"<clue> — <count>"`, or `"Waiting on <name> to give a clue..."`.
- Score: header shows `Red: N` and `Blue: N` with `(turn)` after the active team.
- Give Clue dialog: guess-count `combobox` must be expanded (click it) to reveal `option` entries `Unlimited`, `0`…`9`. After picking, the **Give Clue** button un-disables.
- Mat select options may only appear in a **verbose** snapshot (`take_snapshot(verbose=true)`); use that when the normal snapshot shows an empty `listbox`.

## Verifying

After any action on any page, pull `list_console_messages(types=["error"])` on the acting page. The app's observable chain (especially the Angular Fire compat layer) will surface NG0203 / injection-context failures directly in the console the moment something breaks. No console errors + UI state matches expectations = pass.

Also cross-check by switching `select_page` to a different player's page and re-snapshotting — every page must reflect the latest Firestore state (score, revealed cards, current clue, whose turn).

## Common failure signals

- `NG0203: inject() must be called from an injection context` → a firestore operation is running outside an injection context. The fix is to wrap the call in `runInInjectionContext(this.injector, () => …)` using an injector captured at service/model construction (see `TableService` / `Table`).
- Lobby never progresses past "needs a spymaster" → realtime sync broken. Check network panel and Firestore rules.
- Start Game stays disabled with 4 players assigned → at least one team is missing a spymaster.

## Cleanup

Leave the dev server running between checks. Close isolated pages only when rerunning from scratch — closing all four forces a fresh lobby.
