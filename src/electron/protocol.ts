import { app, BaseWindow } from "electron";
import { ipcWebContentsSend } from "./util.js";
import { getContentViews } from "./view.js";

const PROTOCOL = 'telemetry-app'

let pendingDeepLink: string | null = null;
let mainWindow: BaseWindow | null = null;

// Registering a custom protocol for deep linking and adding a listener
export function registerProtocol() {
    // Registering the protocol
    // Not set up for dev environment, honeslty easier to just package and run the app
    app.setAsDefaultProtocolClient(PROTOCOL)

    // DURING RUNTIME - Handling deep link on MacOS
    app.on('open-url', (event, url) => {
        event.preventDefault()
        pendingDeepLink = url;
        if (mainWindow) {
            handleDeepLink(pendingDeepLink)
            pendingDeepLink = null;
        }
    })
}

// After main window is created, set the window and handle any premature deep links
export function setMainWindowForDeepLink(win: BaseWindow) {
    mainWindow = win;
    if (pendingDeepLink) {
        handleDeepLink(pendingDeepLink);
        pendingDeepLink = null;
    }
}

export function handleDeepLink(pendingDeepLink: string) {
    const parsed = new URL(pendingDeepLink)
    const views = getContentViews();
    const view = views[views.length - 1]; // deep link to the most recently created view
    if (!view) {
        return;
    }

    const sendChangeView = () => {
        switch (parsed.host) {
            case 'cpu':
                ipcWebContentsSend("changeView", view.webContents, 'CPU')
                break;
            case 'ram':
                ipcWebContentsSend("changeView", view.webContents, 'RAM')
                break;
            case 'disk':
                ipcWebContentsSend("changeView", view.webContents, 'DISK')
                break;
        }
    };

    // Wait for webContents to finish loading before sending IPC
    if (view.webContents.isLoading()) {
        view.webContents.once('did-finish-load', sendChangeView);
    } else {
        sendChangeView();
    }
}
