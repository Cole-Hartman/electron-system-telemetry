import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { TabBar } from './TabBar'

describe('TabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders initial tab after loading', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })
  })

  test('creates new tab when clicking + button', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    const newTabButton = screen.getByText('+')
    fireEvent.click(newTabButton)

    await waitFor(() => {
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
    })
    expect(window.electron.newTab).toHaveBeenCalled()
  })

  test('switches tab when clicking on it', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    // Create a second tab
    fireEvent.click(screen.getByText('+'))

    await waitFor(() => {
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
    })

    // Click on Tab 1
    fireEvent.click(screen.getByText('Tab 1'))

    expect(window.electron.switchTab).toHaveBeenCalledWith(1)
  })

  test('closes tab when clicking close button', async () => {
    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    // Create a second tab so we can close one
    fireEvent.click(screen.getByText('+'))

    await waitFor(() => {
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
    })

    // Close Tab 2 (the second close button)
    const closeButtons = screen.getAllByText('×')
    fireEvent.click(closeButtons[1])

    await waitFor(() => {
      expect(screen.queryByText('Tab 2')).not.toBeInTheDocument()
    })
    expect(window.electron.closeTab).toHaveBeenCalled()
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

    fireEvent.dragEnd(tab)
    expect(tab).not.toHaveClass('tab-dragging')
  })

  test('reorders tabs on drop', async () => {
    // Mock newTab to return incrementing IDs
    let tabId = 1
    vi.mocked(window.electron.newTab).mockImplementation(async () => ++tabId)

    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    // Create two more tabs
    fireEvent.click(screen.getByText('+'))
    await waitFor(() => expect(screen.getByText('Tab 2')).toBeInTheDocument())

    fireEvent.click(screen.getByText('+'))
    await waitFor(() => expect(screen.getByText('Tab 3')).toBeInTheDocument())

    const tabs = screen.getAllByText(/Tab \d/).map(el => el.closest('.tab')!)
    const [tab1, tab2, tab3] = tabs

    // Drag Tab 3 onto Tab 1
    fireEvent.dragStart(tab3, { dataTransfer: { effectAllowed: 'move' } })
    fireEvent.dragOver(tab1, { preventDefault: () => {} })
    fireEvent.drop(tab1, { preventDefault: () => {} })
    fireEvent.dragEnd(tab3)

    // Check new order: Tab 3 should now be first
    const reorderedTabs = screen.getAllByText(/Tab \d/)
    expect(reorderedTabs[0]).toHaveTextContent('Tab 3')
    expect(reorderedTabs[1]).toHaveTextContent('Tab 1')
    expect(reorderedTabs[2]).toHaveTextContent('Tab 2')
  })

  test('drop indicator appears on drag over', async () => {
    let tabId = 1
    vi.mocked(window.electron.newTab).mockImplementation(async () => ++tabId)

    render(<TabBar />)

    await waitFor(() => {
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
    })

    // Create a second tab
    fireEvent.click(screen.getByText('+'))
    await waitFor(() => expect(screen.getByText('Tab 2')).toBeInTheDocument())

    const tabs = screen.getAllByText(/Tab \d/).map(el => el.closest('.tab')!)
    const [tab1, tab2] = tabs

    // Start dragging Tab 2
    fireEvent.dragStart(tab2, { dataTransfer: { effectAllowed: 'move' } })

    // Drag over Tab 1
    fireEvent.dragOver(tab1, { preventDefault: () => {} })

    // Tab 1 should have the drop target class
    expect(tab1).toHaveClass('tab-drop-target')
  })
})
