# PRD: Tear-Away Tabs to New Window

## Introduction

Users should be able to drag a tab outside the current window to create a new window containing that tab. This enables flexible workspace organization by allowing users to separate tabs into multiple windows. The main process acts as coordinator, handling view transfers between windows via IPC.

## Goals

- Allow users to tear away a tab by dragging it outside the window bounds
- Create a new window at the drop location containing the torn-away tab
- Preserve tab content state during transfer (no page reload)
- Support multiple windows with independent tab bars

## Scope & Deliverables

- Window manager to track multiple BaseWindows and their views
- Detection of drag release outside window bounds (using `dragend` screen coordinates)
- New preload methods: `getWindowBounds()`, `tearAwayTab(tabId, label, screenX, screenY)`
- IPC handlers for tear-away coordination
- Transfer of WebContentsView between windows
- New window creation with TabBar initialization via IPC
- Prevention of tearing away the last tab in a window
- Window close handling (app quits when last window closes)

## Non-Goals

- Merging tabs back into existing windows (drag tab into another window's tab bar)
- Persisting window/tab state across app restarts
- Visual preview thumbnail during drag outside window
- Touch/mobile drag support
- Tab transfer between different app instances

## Technical Considerations

### Architecture

- **Main process as coordinator**: Main handles all view transfers and window management
- **Tab ID = webContents.id**: Existing design allows finding views by tab ID
- **Each TabBar owns its state**: Renderers manage their own `tabs[]` array, main only handles view ownership

### Key Flow

```
1. User drags tab outside window, releases
2. dragend fires with screenX/screenY
3. Renderer compares against window bounds (via getWindowBounds())
4. If outside && not last tab: calls tearAwayTab(tabId, label, x, y)
5. Main process:
   - Creates new BaseWindow at (x, y) with same size as source
   - Creates new TabBar view
   - Removes content view from source window
   - Adds content view to new window
   - Sends 'remove-tab' to source TabBar
   - Sends 'init-tabs' to new TabBar after it loads
6. Both TabBars update their local state
```

### Window Manager Structure

```ts
const windows = new Map<number, {
    baseWindow: BaseWindow,
    tabBarView: WebContentsView,
    contentViews: WebContentsView[]
}>();
```

### Constraints

- WebContentsView can only belong to one window at a time (must remove before adding elsewhere)
- HTML5 drag events don't fire outside window, but `dragend` provides screen coordinates
- New TabBar needs IPC message to know its initial tab(s)
- Cannot tear away last tab (window would be empty)
- Window sizing: new window matches source window size, centered on mouse position
