import { app, BrowserWindow, ipcMain, session, Menu, Tray } from "electron";
import path from "path";
import { isDev, ipcMainHandle, ipcMainOn } from "./util.js";
import { pollResources, getStaticData } from "./resourceManager.js";
import { getAssetsPath, getPreloadPath, getUIPath } from "./pathResolver.js";
import { createTray } from "./tray.js";
import { createMenu } from "./menu.js";

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

    const mainWindow = new BrowserWindow({

        webPreferences: {
            preload: getPreloadPath(),
            // contextIsolation: true - runs preload script in a secure context from the browser. (Set by default in electron v12+)
        },
        width: 800,
        height: 600,
        frame: false, // remove the default window frame, I created my own
    });

    // Either load React or the built React app
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    } else {
        mainWindow.loadFile(getUIPath());
    }
    // Starts polling resources and sending to renderer
    pollResources(mainWindow);

    createTray(mainWindow);
    createMenu(mainWindow);

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
function handleCloseEvents(mainWindow: BrowserWindow) {
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


