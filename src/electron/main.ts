import { app, BaseWindow } from "electron";
import { pollResources, } from "./resourceManager.js";
import { createTray } from "./tray.js";
import { createMenu } from "./menu.js";
import { createTabBarView, createContentView, getContentViews, TABBAR_HEIGHT } from "./view.js";
import { registerProtocol, setMainWindowForDeepLink } from "./protocol.js";
import { initIpcHandlers } from "./ipcHandlers.js";

registerProtocol();

app.whenReady().then(() => {
    const mainWindow = new BaseWindow({ width: 800, height: 600, frame: false });

    // Create tabbar view first (chrome)
    const tabBarView = createTabBarView(mainWindow);
    // Create initial content view
    const contentView = createContentView(mainWindow);
    pollResources(contentView);

    initIpcHandlers(mainWindow);
    setMainWindowForDeepLink(mainWindow);

    createTray(mainWindow);
    createMenu(mainWindow, contentView);
    handleCloseEvents(mainWindow);

    // Single resize listener for all views
    mainWindow.on('resize', () => {
        const { width, height } = mainWindow.getContentBounds();
        tabBarView.setBounds({ x: 0, y: 0, width, height: TABBAR_HEIGHT });
        for (const view of getContentViews()) {
            view.setBounds({ x: 0, y: TABBAR_HEIGHT, width, height: height - TABBAR_HEIGHT });
        }
    });
});

/**
 * Handle the quitting events of the main window
 * Allows the user to close the window without quitting the app
 * 
 * Ways of closing the app and their event order:
 * 1. Closing main window manually: 'close' event ->'before-quit' event -> app quits
 *    - on manual close, prevent the app from quitting and hide the window
 * 
 * 2. Clicking the close button (app.quit()): 'before-quit' event -> 'close' event -> app quits
 *    - on quit, allow the app to quit
 */
function handleCloseEvents(mainWindow: BaseWindow) {
    let willClose = false;

    mainWindow.on('close', (event) => {
        if (willClose) {
            return;
        }

        // prevent the window from quitting and hide it
        event.preventDefault();
        mainWindow.hide();
        if (app.dock) {
            app.dock.hide();
        }
    });

    // calling app.quit by quitting the app
    app.on('before-quit', () => {
        willClose = true;
    })

    mainWindow.on('show', () => {
        willClose = false;
    })
}


