import { BaseWindow, WebContentsView } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { isDev } from "./util.js";

// Creating and managing tabs

const tabs: WebContentsView[] = [];

/**
 * Create a new view and add it to the BaseWindow
 * Stacks on top of previous views (last added = topmost)
 */
export function createTab(BaseWindow: BaseWindow): WebContentsView {
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
    tabs.push(view);

    const updateBounds = () => {
        const { width, height } = BaseWindow.getContentBounds();
        view.setBounds({ x: 0, y: 0, width, height });
    };

    updateBounds();
    BaseWindow.on('resize', updateBounds);

    return view;
}

export function getTabs(): WebContentsView[] {
    return tabs;
}

export function getActiveTab(): WebContentsView | undefined {
    return tabs[tabs.length - 1];
}