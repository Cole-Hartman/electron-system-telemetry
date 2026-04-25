import { app, BrowserWindow, ipcMain, session, Menu, Tray } from "electron";
import path from "path";
import { isDev, ipcMainHandle } from "./util.js";
import { pollResources, getStaticData } from "./resourceManager.js";
import { getAssetsPath, getPreloadPath, getUIPath } from "./pathResolver.js";

app.whenReady().then(() => {
    ipcMainHandle("getStaticData", () => getStaticData());

    const mainWindow = new BrowserWindow({

        webPreferences: {
            preload: getPreloadPath(),
            // contextIsolation: true - runs preload script in a secure context from the browser. (Set by default in electron v12+)
        },
        width: 800,
        height: 600,
    });

    // Either load React or the built React app
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    } else {
        mainWindow.loadFile(getUIPath());
    }
    // Starts polling resources and sending to renderer
    pollResources(mainWindow);

    new Tray(path.join(getAssetsPath(), process.platform === 'darwin' ? 'trayIconTemplate.png' : 'trayIcon.png'))
});

