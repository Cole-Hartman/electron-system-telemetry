import { ipcMainHandle, ipcMainOn } from "./util.js";
import { getStaticData } from "./resourceManager.js";
import { BaseWindow, ipcMain } from "electron";
import { createContentView, switchToView } from "./view.js";
import { pollResources } from "./resourceManager.js";

/**
* Electron IPC Handlers
*/

export function ipcHandlers(mainWindow: BaseWindow) {

    ipcMainHandle("getStaticData", () => getStaticData());
    ipcMain.handle("getViewId", (event) => {
        return event.sender.id;
    });
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
    });

    // Tab handlers
    ipcMainHandle("newTab", () => {
        const view = createContentView(mainWindow);
        pollResources(view);
        return view.webContents.id;
    });

    ipcMainOn("switchTab", (viewId) => {
        switchToView(viewId, mainWindow);
    });
}