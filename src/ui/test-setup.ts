import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.electron for all tests
const mockElectron = {
  getFirstTabId: vi.fn().mockResolvedValue(1),
  newTab: vi.fn().mockResolvedValue(2),
  switchTab: vi.fn(),
  closeTab: vi.fn(),
  sendFrameAction: vi.fn(),
  subscribeStatistics: vi.fn().mockReturnValue(() => {}),
  subscribeChangeView: vi.fn().mockReturnValue(() => {}),
  getStaticData: vi.fn().mockResolvedValue({
    cpuModel: 'Test CPU',
    totalMemoryGB: 16,
    totalStorage: 500,
  }),
  getViewId: vi.fn().mockResolvedValue(1),
  // Tear-away tabs
  getWindowBounds: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 800, height: 600 }),
  tearAwayTab: vi.fn(),
  onInitTabs: vi.fn().mockReturnValue(() => {}),
  onRemoveTab: vi.fn().mockReturnValue(() => {}),
}

Object.defineProperty(window, 'electron', {
  value: mockElectron,
  writable: true,
})
