import { app, BaseWindow, WebContentsView } from "electron";
import { isDev, ipcMainHandle, ipcMainOn } from "./util.js";
import { pollResources, getStaticData } from "./resourceManager.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { createTray } from "./tray.js";
import { createMenu } from "./menu.js";
import { createTab } from "./tabs.js";
// import { registerProtocol, setMainWindow } from "./protocol.js";

// registerProtocol();

app.whenReady().then(() => {

    ipcMainHandle("getStaticData", () => getStaticData());
    ipcMainOn("sendFrameAction", (action) => {
        switch (action) {
            case 'CLOSE':
                mainWindow.close();
                break;
            case 'MINIMIZE':
                mainWindow.minimize();
                break;
            case 'MAXIMIZE':
                mainWindow.maximize();
                break;
        }
    })

    const mainWindow = new BaseWindow({ width: 800, height: 600, frame: false })
    const view = createTab(mainWindow);

    // Starts polling resources and sending to renderer
    pollResources(view);

    createTray(mainWindow);
    createMenu(mainWindow, view);

    handleCloseEvents(mainWindow);
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


