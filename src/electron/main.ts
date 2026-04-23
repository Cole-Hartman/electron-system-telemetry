import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev, ipcMainHandle } from "./util.js";
import { pollResources, getStaticData } from "./resourceManager.js";
import { getPreloadPath } from "./pathResolver.js";

app.whenReady().then(() => {
    ipcMainHandle("getStaticData", () => getStaticData());

    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath(),
        },
        width: 800,
        height: 600,
    });
    // Either load React or the built React app
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    } else {
        mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));
    }
    // Starts polling resources and sending to renderer
    pollResources(mainWindow);
});

