import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { pollResources, getStaticData } from "./resourceManager.js";
import { getPreloadPath } from "./pathResolver.js";

app.whenReady().then(() => {
    ipcMain.handle("getStaticData", () => getStaticData());

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
    pollResources(mainWindow);
});

