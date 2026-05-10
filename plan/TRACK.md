# Tab Reordering Implementation Track

## Overview

Implementation is ordered by functionality layers: first add drag capability to Tab component, then add drop handling and reorder logic to TabBar, then add visual feedback styles. Each phase builds on the previous.

## Phase 1: Core Drag and Drop

### [x] T-001: Add drag event props to Tab component
Extend Tab.tsx to accept drag event handler props (`onDragStart`, `onDragOver`, `onDrop`, `onDragEnd`) and add the `draggable` attribute. Pass the tab `id` to each handler so TabBar can identify which tab is being dragged or dropped on.

Acceptance Criteria:
- Tab component accepts `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd` props
- Tab element has `draggable` attribute set to true
- Each handler receives the tab's `id` as an argument
- Existing `onClick` behavior still works
- Typecheck passes

### [x] T-002: Implement reorder logic in TabBar
Add state for `draggedTabId` in TabBar.tsx. Implement handlers: `handleDragStart` sets the dragged tab, `handleDrop` reorders the `tabs` array by moving the dragged tab to the target position, `handleDragEnd` clears drag state. Pass handlers to Tab components.

Acceptance Criteria:
- Dragging a tab and dropping on another tab reorders the array
- Tab moves to the drop target's position (insert, not swap)
- Dropping a tab on itself does nothing
- `draggedTabId` state is cleared after drag ends
- Typecheck passes
- Verify changes work in browser

## Phase 2: Visual Feedback

### [x] T-003: Add ghost effect to dragged tab
Add CSS class `tab-dragging` applied to the tab being dragged. Style it with reduced opacity to create a ghost effect. Track `draggedTabId` in TabBar and pass `isDragging` prop to Tab to conditionally apply the class.

Acceptance Criteria:
- Tab being dragged has reduced opacity (0.5 or similar)
- Other tabs remain at full opacity
- Ghost effect clears when drag ends
- Typecheck passes
- Verify changes work in browser

### [x] T-004: Add drop indicator for target position
Track `dragOverTabId` state in TabBar, updated on `handleDragOver`. Pass `isDropTarget` prop to Tab. Add CSS for drop indicator (left border or highlight) on the drop target tab. Clear `dragOverTabId` on drag end or drop.

Acceptance Criteria:
- Visual indicator appears on the tab being hovered during drag
- Indicator shows where the dragged tab will be inserted
- Indicator clears immediately when drag ends or completes
- Indicator does not appear when hovering over the dragged tab itself
- Typecheck passes
- Verify changes work in browser

## Phase 3: Edge Cases

### [x] T-005: Handle drag cancellation outside tab list
Use `onDragEnd` to detect when drag ends without a valid drop (dropped outside tab list). Ensure tab order remains unchanged and all drag state is cleared. The `onDragEnd` event fires regardless of drop success.

Acceptance Criteria:
- Dragging a tab outside the tab list and releasing cancels the drag
- Tab order remains unchanged after cancelled drag
- All visual feedback (ghost, drop indicator) clears on cancel
- No console errors on drag cancel
- Typecheck passes
- Verify changes work in browser

## Dependencies & Notes

- T-001 must complete before T-002 (Tab needs drag props before TabBar can use them)
- T-002 must complete before T-003, T-004, T-005 (core logic before polish)
- T-003 and T-004 can be done in parallel after T-002
- T-005 depends on T-003 and T-004 (tests that visual cleanup works)
- Reuse existing `tab` and `tab-active` CSS class patterns for new states
