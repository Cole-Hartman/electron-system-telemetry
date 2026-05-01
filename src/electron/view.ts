import { BaseWindow, WebContentsView } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { isDev } from "./util.js";

// Creating and managing view

const views: WebContentsView[] = [];

/**
 * Create a new view and add it to the BaseWindow
 * Stacks on top of previous views (last added = topmost)
 * Returns the ID of the new view
 */
export function createView(BaseWindow: BaseWindow): WebContentsView {
    const view = new WebContentsView({
        webPreferences: {
            preload: getPreloadPath(),
        },
    });

    // setMainWindow(mainWindow); // pass the main window to the protocol handler

    // Either load React or the built React app
    if (isDev()) {
        view.webContents.loadURL("http://localhost:5123");
    } else {
        view.webContents.loadFile(getUIPath());
    }

    BaseWindow.contentView.addChildView(view);
    views.push(view);

    const updateBounds = () => {
        const { width, height } = BaseWindow.getContentBounds();
        view.setBounds({ x: 0, y: 0, width, height });
    };

    updateBounds();
    BaseWindow.on('resize', updateBounds);

    return view
}

export function getViews(): WebContentsView[] {
    return views;
}

export function getActiveView(): WebContentsView | undefined {
    return views[views.length - 1];
}