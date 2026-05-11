import { ipcMainHandle } from "./util.js";
import { getStaticData } from "./resourceManager.js";
import { ipcMain } from "electron";
import { createContentView, switchToView, getFirstTabId, closeTab } from "./view.js";
import { pollResources } from "./resourceManager.js";
import {
    findWindowByWebContentsId,
    getWindowData,
    findViewOwner,
    removeContentView,
    addContentView,
    createNewWindow,
} from "./windowManager.js";
import { TABBAR_HEIGHT } from "./view.js";
import { createMenu } from "./menu.js";

/**
 * Electron IPC Handlers
 */

export function initIpcHandlers() {
    ipcMainHandle("getStaticData", () => getStaticData());

    ipcMain.handle("getViewId", (event) => {
        return event.sender.id;
    });

    ipcMain.on("sendFrameAction", (event, action) => {
        const windowId = findWindowByWebContentsId(event.sender.id);
        if (windowId === null) return;

        const data = getWindowData(windowId);
        if (!data) return;

        switch (action) {
            case 'CLOSE':
                data.baseWindow.close();
                break;
            case 'MINIMIZE':
                data.baseWindow.minimize();
                break;
            case 'MAXIMIZE':
                data.baseWindow.maximize();
                break;
        }
    });

    // Tab handlers
    ipcMain.handle("newTab", (event) => {
        const windowId = findWindowByWebContentsId(event.sender.id);
        if (windowId === null) return 0;

        const data = getWindowData(windowId);
        if (!data) return 0;

        const view = createContentView(data.baseWindow, windowId);
        pollResources(view);
        return view.webContents.id;
    });

    ipcMain.on("switchTab", (event, viewId) => {
        const windowId = findWindowByWebContentsId(event.sender.id);
        if (windowId === null) return;

        switchToView(viewId, windowId);
    });

    ipcMain.handle("getFirstTabId", (event) => {
        const windowId = findWindowByWebContentsId(event.sender.id);
        if (windowId === null) return 0;

        return getFirstTabId(windowId);
    });

    ipcMain.on("closeTab", (event, { id, tabToSwitchTo }) => {
        const windowId = findWindowByWebContentsId(event.sender.id);
        if (windowId === null) return;

        closeTab(id, tabToSwitchTo, windowId);
    });

    // Window bounds handler (for tear-away detection)
    ipcMain.handle("getWindowBounds", (event) => {
        const windowId = findWindowByWebContentsId(event.sender.id);
        if (windowId === null) return { x: 0, y: 0, width: 0, height: 0 };

        const data = getWindowData(windowId);
        if (!data) return { x: 0, y: 0, width: 0, height: 0 };

        return data.baseWindow.getBounds();
    });

    // Tear-away tab handler
    ipcMain.on("tearAwayTab", (event, { tabId, label, screenX, screenY }) => {
        const sourceWindowId = findWindowByWebContentsId(event.sender.id);
        if (sourceWindowId === null) return;

        const sourceData = getWindowData(sourceWindowId);
        if (!sourceData) return;

        // Find the view to transfer
        const viewInfo = findViewOwner(tabId);
        if (!viewInfo) return;

        const { view } = viewInfo;

        // Don't allow tearing away the last tab
        if (sourceData.contentViews.length <= 1) return;

        // Get source window size
        const sourceBounds = sourceData.baseWindow.getBounds();

        // Create new window
        const { windowId: newWindowId, baseWindow: newWindow, tabBarView: newTabBarView } =
            createNewWindow(screenX, screenY, sourceBounds.width, sourceBounds.height);

        // Remove view from source window
        sourceData.baseWindow.contentView.removeChildView(view);
        removeContentView(sourceWindowId, view);

        // Add view to new window
        newWindow.contentView.addChildView(view);
        addContentView(newWindowId, view);

        // Set view bounds in new window
        const newBounds = newWindow.getContentBounds();
        view.setBounds({
            x: 0,
            y: TABBAR_HEIGHT,
            width: newBounds.width,
            height: newBounds.height - TABBAR_HEIGHT,
        });
        view.setVisible(true);

        // Create menu for the view in new window
        createMenu(newWindow, view);

        // Tell source TabBar to remove the tab
        sourceData.tabBarView.webContents.send("removeTab", tabId);

        // Tell new TabBar to init with the tab (after it loads)
        newTabBarView.webContents.on("did-finish-load", () => {
            newTabBarView.webContents.send("initTabs", [{ id: tabId, label }]);
        });

        // If new TabBar already loaded, send immediately
        if (!newTabBarView.webContents.isLoading()) {
            newTabBarView.webContents.send("initTabs", [{ id: tabId, label }]);
        }
    });
}
