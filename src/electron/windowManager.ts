import { app, BaseWindow, WebContentsView } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { isDev, DEV_SERVER_URL } from "./util.js";
import { TABBAR_HEIGHT } from "./view.js";

export type WindowData = {
    baseWindow: BaseWindow;
    tabBarView: WebContentsView;
    contentViews: WebContentsView[];
};

const windows = new Map<number, WindowData>();

export function registerWindow(
    windowId: number,
    baseWindow: BaseWindow,
    tabBarView: WebContentsView
): void {
    windows.set(windowId, {
        baseWindow,
        tabBarView,
        contentViews: [],
    });
}

export function unregisterWindow(windowId: number): void {
    windows.delete(windowId);
}

export function getWindowData(windowId: number): WindowData | undefined {
    return windows.get(windowId);
}

export function getAllWindows(): Map<number, WindowData> {
    return windows;
}

export function getWindowCount(): number {
    return windows.size;
}

export function addContentView(windowId: number, view: WebContentsView): void {
    const data = windows.get(windowId);
    if (data) {
        data.contentViews.push(view);
    }
}

export function removeContentView(windowId: number, view: WebContentsView): void {
    const data = windows.get(windowId);
    if (data) {
        const index = data.contentViews.indexOf(view);
        if (index !== -1) {
            data.contentViews.splice(index, 1);
        }
    }
}

export function findViewOwner(tabId: number): { windowId: number; view: WebContentsView } | null {
    for (const [windowId, data] of windows) {
        const view = data.contentViews.find(v => v.webContents.id === tabId);
        if (view) {
            return { windowId, view };
        }
    }
    return null;
}

export function getContentViewCount(windowId: number): number {
    const data = windows.get(windowId);
    return data?.contentViews.length ?? 0;
}

/**
 * Find the window ID that owns a given webContents (either tabBar or content view)
 */
export function findWindowByWebContentsId(webContentsId: number): number | null {
    for (const [windowId, data] of windows) {
        // Check if it's the tabBar
        if (data.tabBarView.webContents.id === webContentsId) {
            return windowId;
        }
        // Check content views
        if (data.contentViews.some(v => v.webContents.id === webContentsId)) {
            return windowId;
        }
    }
    return null;
}

/**
 * Create a new window at the specified position
 */
export function createNewWindow(
    x: number,
    y: number,
    width: number,
    height: number
): { windowId: number; baseWindow: BaseWindow; tabBarView: WebContentsView } {
    // Center window on cursor position
    const windowX = Math.round(x - width / 2);
    const windowY = Math.round(y - height / 2);

    const baseWindow = new BaseWindow({
        width,
        height,
        x: windowX,
        y: windowY,
        frame: false,
    });

    const windowId = baseWindow.id;

    // Create tabbar view
    const tabBarView = new WebContentsView({
        webPreferences: {
            preload: getPreloadPath(),
        },
    });

    if (isDev()) {
        tabBarView.webContents.loadURL(`${DEV_SERVER_URL}/src/ui/tabbar/index.html`);
    } else {
        tabBarView.webContents.loadFile(getUIPath("tabbar"));
    }

    baseWindow.contentView.addChildView(tabBarView);
    tabBarView.setBounds({ x: 0, y: 0, width, height: TABBAR_HEIGHT });

    // Register window
    registerWindow(windowId, baseWindow, tabBarView);

    // Handle resize
    baseWindow.on('resize', () => {
        const data = getWindowData(windowId);
        if (!data) return;

        const bounds = baseWindow.getContentBounds();
        data.tabBarView.setBounds({ x: 0, y: 0, width: bounds.width, height: TABBAR_HEIGHT });

        for (const view of data.contentViews) {
            view.setBounds({
                x: 0,
                y: TABBAR_HEIGHT,
                width: bounds.width,
                height: bounds.height - TABBAR_HEIGHT,
            });
        }
    });

    // Handle close
    baseWindow.on('closed', () => {
        const data = getWindowData(windowId);
        if (data) {
            // Close all content webContents
            for (const view of data.contentViews) {
                if (!view.webContents.isDestroyed()) {
                    view.webContents.close();
                }
            }
        }
        unregisterWindow(windowId);

        // Quit app when last window closes
        if (getWindowCount() === 0) {
            app.quit();
        }
    });

    return { windowId, baseWindow, tabBarView };
}
