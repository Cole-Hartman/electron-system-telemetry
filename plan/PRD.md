# PRD: Tab Reordering via Drag and Drop

## Introduction

Users currently cannot reorder tabs in the tabbar. This feature adds drag and drop functionality to allow users to rearrange tabs by dragging them to new positions. The implementation is renderer-only since tabs are referenced by ID throughout the codebase, making main process synchronization unnecessary.

## Goals

- Allow users to reorder tabs by dragging and dropping within the tabbar
- Provide clear visual feedback during drag operations (drop indicator and ghost effect)
- Cancel drag gracefully when dropped outside valid areas

## Scope & Deliverables

- Draggable tabs using HTML5 Drag and Drop API
- Visual drop indicator showing where tab will land
- Ghost/dim effect on the tab being dragged
- Drag cancellation when dropped outside tab list
- Updated Tab.tsx with drag event handlers
- Updated TabBar.tsx with reorder state management
- CSS for drag states and drop indicator

## Non-Goals

- Persisting tab order across app restarts
- Detaching tabs to new windows
- Keyboard-based tab reordering
- Main process synchronization of tab order
- Touch/mobile drag support
- Animated tab position transitions

## Technical Considerations

- Current tab state lives in `TabBar.tsx` as `tabs: TabData[]` array
- Tabs are identified by `id` (WebContents ID), not array position
- `closeTab` logic already derives next tab from renderer state, so reordering won't break it
- HTML5 Drag and Drop API requires `draggable` attribute and `onDragStart`, `onDragOver`, `onDrop` events
- `e.preventDefault()` on `onDragOver` is required to allow dropping
- `onDragEnd` fires regardless of drop success, useful for cleanup
- Existing Tab component uses `onClick` which should not conflict with drag events
