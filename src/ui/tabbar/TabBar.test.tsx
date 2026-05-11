import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { TabBar } from './TabBar'

describe('TabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure mocks return proper values after clear
    vi.mocked(window.electron.getFirstTabId).mockResolvedValue(1)
    vi.mocked(window.electron.onInitTabs).mockReturnValue(() => {})
    vi.mocked(window.electron.onRemoveTab).mockReturnValue(() => {})
    vi.mocked(window.electron.getWindowBounds).mockResolvedValue({ x: 0, y: 0, width: 800, height: 600 })
  })

  test('renders initial tab after loading', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })
  })

  test('traffic light buttons call sendFrameAction', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    const closeButton = document.getElementById('close')!
    const minimizeButton = document.getElementById('minimize')!
    const maximizeButton = document.getElementById('maximize')!

    fireEvent.click(closeButton)
    expect(window.electron.sendFrameAction).toHaveBeenCalledWith('CLOSE')

    fireEvent.click(minimizeButton)
    expect(window.electron.sendFrameAction).toHaveBeenCalledWith('MINIMIZE')

    fireEvent.click(maximizeButton)
    expect(window.electron.sendFrameAction).toHaveBeenCalledWith('MAXIMIZE')
  })
})

describe('TabBar drag and drop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(window.electron.getFirstTabId).mockResolvedValue(1)
    vi.mocked(window.electron.onInitTabs).mockReturnValue(() => {})
    vi.mocked(window.electron.onRemoveTab).mockReturnValue(() => {})
    vi.mocked(window.electron.getWindowBounds).mockResolvedValue({ x: 0, y: 0, width: 800, height: 600 })
  })

  test('tab has draggable attribute', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    const tab = screen.getByText('Tab 1').closest('.tab')
    expect(tab).toHaveAttribute('draggable', 'true')
  })

  test('dragging tab applies ghost class', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    const tab = screen.getByText('Tab 1').closest('.tab')!

    fireEvent.dragStart(tab, {
      dataTransfer: { effectAllowed: 'move' }
    })

    expect(tab).toHaveClass('tab-dragging')
  })

  test('drag end removes ghost class', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    const tab = screen.getByText('Tab 1').closest('.tab')!

    fireEvent.dragStart(tab, {
      dataTransfer: { effectAllowed: 'move' }
    })
    expect(tab).toHaveClass('tab-dragging')

    fireEvent.dragEnd(tab, { screenX: 100, screenY: 100 })

    await waitFor(() => {
      expect(tab).not.toHaveClass('tab-dragging')
    })
  })
})
