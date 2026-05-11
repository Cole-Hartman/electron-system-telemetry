import { BaseWindow, WebContentsView } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { isDev, DEV_SERVER_URL } from "./util.js";
import { createMenu } from "./menu.js";
import { addContentView, getWindowData, removeContentView } from "./windowManager.js";

export const TABBAR_HEIGHT = 44;

/**
 * Create the tabbar view (header + tabs)
 * Fixed at the top of the window
 */
export function createTabBarView(baseWindow: BaseWindow): WebContentsView {
    const view = new WebContentsView({
        webPreferences: {
            preload: getPreloadPath(),
        },
    });

    if (isDev()) {
        view.webContents.loadURL(`${DEV_SERVER_URL}/src/ui/tabbar/index.html`);
    } else {
        view.webContents.loadFile(getUIPath("tabbar"));
    }

    baseWindow.contentView.addChildView(view);

    // Set initial bounds
    const { width } = baseWindow.getContentBounds();
    view.setBounds({ x: 0, y: 0, width, height: TABBAR_HEIGHT });

    return view;
}

/**
 * Create a content view (stats app)
 * Positioned below the tabbar
 */
export function createContentView(baseWindow: BaseWindow, windowId: number): WebContentsView {
    const view = new WebContentsView({
        webPreferences: {
            preload: getPreloadPath(),
        },
    });

    if (isDev()) {
        view.webContents.loadURL(`${DEV_SERVER_URL}/src/ui/content/index.html`);
    } else {
        view.webContents.loadFile(getUIPath("content"));
    }

    baseWindow.contentView.addChildView(view);
    addContentView(windowId, view);

    // Set initial bounds
    const { width, height } = baseWindow.getContentBounds();
    view.setBounds({ x: 0, y: TABBAR_HEIGHT, width, height: height - TABBAR_HEIGHT });

    createMenu(baseWindow, view);

    return view;
}

export function getFirstTabId(windowId: number): number {
    const data = getWindowData(windowId);
    return data?.contentViews[0]?.webContents.id ?? 0;
}

export function switchToView(viewId: number, windowId: number) {
    const data = getWindowData(windowId);
    if (!data) return;

    for (const view of data.contentViews) {
        if (view.webContents.id === viewId) {
            view.setVisible(true);
            createMenu(data.baseWindow, view);
        } else {
            view.setVisible(false);
        }
    }
}

export function closeTab(id: number, tabToSwitchTo: number, windowId: number) {
    const data = getWindowData(windowId);
    if (!data) return;

    const view = data.contentViews.find(v => v.webContents.id === id);
    if (!view) return;

    removeContentView(windowId, view);
    data.baseWindow.contentView.removeChildView(view);
    view.webContents.close();

    if (data.contentViews.length === 0) {
        data.baseWindow.close();
    } else {
        switchToView(tabToSwitchTo, windowId);
    }
}

/**
 * Update bounds for all views in a window (called on resize)
 */
export function updateViewBounds(windowId: number) {
    const data = getWindowData(windowId);
    if (!data) return;

    const { width, height } = data.baseWindow.getContentBounds();

    data.tabBarView.setBounds({ x: 0, y: 0, width, height: TABBAR_HEIGHT });

    for (const view of data.contentViews) {
        view.setBounds({ x: 0, y: TABBAR_HEIGHT, width, height: height - TABBAR_HEIGHT });
    }
}
