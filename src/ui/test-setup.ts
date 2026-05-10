import '@testing-library/jest-dom'

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
}

Object.defineProperty(window, 'electron', {
  value: mockElectron,
  writable: true,
})
