# Tear-Away Tabs Implementation Track

## Overview

Implementation is ordered by dependency: first restructure main process for multi-window support, then add IPC/preload methods, then implement tear-away detection in renderer, then handle window creation and view transfer, and finally sync TabBar state.

## Phase 1: Window Manager Infrastructure

### [ ] T-001: Create window manager module
Create `src/electron/windowManager.ts` to track multiple windows. Define a `WindowData` type containing `baseWindow`, `tabBarView`, and `contentViews[]`. Export a `Map<number, WindowData>` and helper functions `registerWindow()`, `unregisterWindow()`, `getWindowData()`, `findViewOwner(tabId)`.

Acceptance Criteria:
- `windowManager.ts` exports window tracking Map and helper functions
- `findViewOwner(tabId)` returns the windowId and view for a given tab ID
- Typecheck passes

### [ ] T-002: Refactor view.ts to use window manager
Update `view.ts` to use the window manager instead of module-level `contentViews[]`. Modify `createContentView()` to register views with the correct window. Update `switchToView()` and `closeTab()` to look up views via window manager.

Acceptance Criteria:
- `contentViews[]` module variable removed from view.ts
- All view operations use window manager
- Existing tab functionality still works (create, switch, close)
- Typecheck passes
- Verify changes work in browser

### [ ] T-003: Register initial window with window manager
Update `main.ts` to register the initial BaseWindow with the window manager after creation. Pass window ID to `createTabBarView()` and `createContentView()` so they can register with the correct window.

Acceptance Criteria:
- Initial window is registered in window manager on app start
- Window ID is available for view registration
- App starts and functions normally
- Typecheck passes
- Verify changes work in browser

## Phase 2: Preload and IPC Setup

### [ ] T-004: Add getWindowBounds preload method
Add `getWindowBounds()` to preload that returns the current window's screen bounds (x, y, width, height). Add corresponding IPC handler in main that gets bounds from the sender's parent BaseWindow.

Acceptance Criteria:
- `window.electron.getWindowBounds()` returns `{ x, y, width, height }`
- Bounds reflect actual window position on screen
- Typecheck passes

### [ ] T-005: Add tearAwayTab preload method
Add `tearAwayTab(tabId, label, screenX, screenY)` to preload. Add corresponding IPC handler in main that will coordinate the tear-away (implementation in later task).

Acceptance Criteria:
- `window.electron.tearAwayTab()` sends IPC to main with all parameters
- IPC handler receives parameters (can be stub for now)
- Typecheck passes

### [ ] T-006: Add init-tabs IPC listener in TabBar
Add an IPC listener in TabBar.tsx that receives `init-tabs` message with array of `{id, label}`. When received, set the tabs state. This allows main to initialize a new TabBar with its tabs.

Acceptance Criteria:
- TabBar listens for `init-tabs` IPC message on mount
- Receiving message sets tabs state with provided data
- Listener is cleaned up on unmount
- Typecheck passes

### [ ] T-007: Add remove-tab IPC listener in TabBar
Add an IPC listener in TabBar.tsx that receives `remove-tab` message with a tab ID. When received, remove that tab from local state. This allows main to tell source window to remove a torn-away tab.

Acceptance Criteria:
- TabBar listens for `remove-tab` IPC message
- Receiving message removes tab with matching ID from state
- If removed tab was active, switches to adjacent tab
- Listener is cleaned up on unmount
- Typecheck passes

## Phase 3: Tear-Away Detection

### [ ] T-008: Detect tear-away in handleDragEnd
Update `handleDragEnd` in TabBar.tsx to check if drag ended outside window bounds. Get window bounds via `getWindowBounds()`, compare with `dragend` event's screenX/screenY. If outside bounds and more than one tab exists, call `tearAwayTab()`.

Acceptance Criteria:
- Drag ending inside window works as before (no tear-away)
- Drag ending outside window triggers tear-away (when >1 tab)
- Drag ending outside with only 1 tab does not tear away
- Label is passed along with tab ID
- Typecheck passes
- Verify changes work in browser

## Phase 4: Window Creation and View Transfer

### [ ] T-009: Implement createNewWindow in window manager
Add `createNewWindow(x, y, width, height)` to window manager. Creates a new BaseWindow at the specified position and size, creates a TabBar view for it, registers it in the window map, and returns the window ID.

Acceptance Criteria:
- New BaseWindow created at specified screen position
- New TabBar view created and added to window
- Window registered in window manager map
- Returns new window ID
- Typecheck passes

### [ ] T-010: Implement view transfer in tearAwayTab handler
Complete the `tearAwayTab` IPC handler. Find source window and view via window manager. Create new window via `createNewWindow()`. Remove view from source window's contentView and contentViews array. Add view to new window. Send `remove-tab` to source TabBar. Send `init-tabs` to new TabBar after it loads.

Acceptance Criteria:
- View is removed from source window
- View is added to new window and visible
- Source TabBar receives remove-tab message
- New TabBar receives init-tabs message with correct tab data
- View content is preserved (no reload)
- Typecheck passes
- Verify changes work in browser

## Phase 5: Window Lifecycle

### [ ] T-011: Handle window close cleanup
Add close event handler for each BaseWindow that unregisters it from window manager and cleans up its views. If it's the last window, quit the app.

Acceptance Criteria:
- Closing a window removes it from window manager
- WebContents of closed window's views are destroyed
- Closing last window quits the app
- No memory leaks from orphaned views
- Typecheck passes
- Verify changes work in browser

### [ ] T-012: Update frame actions for multi-window
Update `sendFrameAction` handler to close/minimize/maximize the correct window (the one that sent the IPC), not just mainWindow.

Acceptance Criteria:
- Traffic light buttons affect their own window
- Each window can be independently minimized/maximized/closed
- Typecheck passes
- Verify changes work in browser

## Dependencies & Notes

- T-001 must complete before T-002, T-003
- T-002, T-003 must complete before T-004 through T-007
- T-004, T-005 must complete before T-008
- T-006, T-007 must complete before T-010
- T-008, T-009 must complete before T-010
- T-010 must complete before T-011, T-012
- Preserve existing tab reorder functionality throughout
- Tab ID equals webContents.id - use this for view lookup
