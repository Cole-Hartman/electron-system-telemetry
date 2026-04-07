import { app, BrowserWindow } from "electron";
import path from "path";
import { isDev } from "./util.js";

app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });
    // Either load React or the built React app
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    } else {
        mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));
    }
});

