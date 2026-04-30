import { app, BaseWindow, Menu, Tray } from "electron";
import path from "path";
import { getAssetsPath } from "./pathResolver.js";

/**
 * Function to create the tray
 */

export function createTray(mainWindow: BaseWindow) {
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
        {
            label: 'Quit', type: 'radio', click: () => app.quit()
        }
    ]))
}
