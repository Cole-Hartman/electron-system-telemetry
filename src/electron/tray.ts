import { app, BrowserWindow, Menu, Tray } from "electron";
import path from "path";
import { getAssetsPath } from "./pathResolver.js";

export function createTray(mainWindow: BrowserWindow) {
    const tray = new Tray(path.join(getAssetsPath(), process.platform === 'darwin' ? 'trayIconTemplate.png' : 'trayIcon.png'))

    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show', type: 'radio', click: () => {
                mainWindow.show()
                if (app.dock) {
                    app.dock.show();
                }

            }
        },
    ]))
}
