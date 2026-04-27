import { expect, Mock, test, vi } from 'vitest';
import { createTray } from './tray.js';
import { app, BrowserWindow, Menu } from 'electron';

/**
 * UNIT TESTS FOR THE TRAY
 * When we can't or don't want to test something with E2E tests.
 */

// Mock imports for createTray from electron
vi.mock('electron', () => { // 'electron' - tells vitest to mock the electron module
    return {
        // mock the Tray object with the setContextMenu method
        Tray: vi.fn().mockImplementation(function (this: { setContextMenu: Mock }) {
            this.setContextMenu = vi.fn();
        }),
        app: {
            getAppPath: vi.fn().mockReturnValue('/'),
            dock: {
                show: vi.fn(),
            },
            quit: vi.fn(),
        },
        Menu: {
            buildFromTemplate: vi.fn(),
        },
    };
});

// Mock the main window object
const mainWindow = {
    show: vi.fn(),
} satisfies Partial<BrowserWindow> as any as BrowserWindow;

test('', () => {
    createTray(mainWindow);

    const calls = (Menu.buildFromTemplate as any as Mock).mock.calls; // mock.calls shows us what our code called on our mock object (Menu.buildFromTemplate)
    const args = calls[0] as Parameters<typeof Menu.buildFromTemplate>; // the arguments given to the call on our mock object. Our code passes in an array of two labels.
    const template = args[0];
    expect(template).toHaveLength(2); // make sure our code passes in the two labels
    expect(template[0].label).toEqual('Show'); // make sure the first label is 'show'
    template[0]?.click?.(null as any, null as any, null as any); // click the first label
    // make sure the callback is called
    expect(mainWindow.show).toHaveBeenCalled();
    expect(app.dock?.show).toHaveBeenCalled();

    template[1]?.click?.(null as any, null as any, null as any); // click the second label
    expect(app.quit).toHaveBeenCalled();
});