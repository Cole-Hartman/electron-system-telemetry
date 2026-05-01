import { BaseWindow, WebContentsView } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { isDev } from "./util.js";
import { createMenu } from "./menu.js";

const TABBAR_HEIGHT = 44;
const contentViews: WebContentsView[] = [];

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
        view.webContents.loadURL("http://localhost:5123/src/ui/tabbar/index.html");
    } else {
        view.webContents.loadFile(getUIPath("tabbar"));
    }

    baseWindow.contentView.addChildView(view);

    const updateBounds = () => {
        const { width } = baseWindow.getContentBounds();
        view.setBounds({ x: 0, y: 0, width, height: TABBAR_HEIGHT });
    };

    updateBounds();
    baseWindow.on('resize', updateBounds);

    return view;
}

/**
 * Create a content view (stats app)
 * Positioned below the tabbar
 */
export function createContentView(baseWindow: BaseWindow): WebContentsView {
    const view = new WebContentsView({
        webPreferences: {
            preload: getPreloadPath(),
        },
    });

    if (isDev()) {
        view.webContents.loadURL("http://localhost:5123/src/ui/content/index.html");
    } else {
        view.webContents.loadFile(getUIPath("content"));
    }

    baseWindow.contentView.addChildView(view);
    contentViews.push(view);

    createMenu(baseWindow, view); // make sure we create the application menu for each content view

    const updateBounds = () => {
        const { width, height } = baseWindow.getContentBounds();
        view.setBounds({ x: 0, y: TABBAR_HEIGHT, width, height: height - TABBAR_HEIGHT });
    };

    updateBounds();
    baseWindow.on('resize', updateBounds);

    return view;
}

export function getContentViews(): WebContentsView[] {
    return contentViews;
}

