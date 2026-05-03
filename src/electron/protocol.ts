import { app, BaseWindow } from "electron";
import { ipcWebContentsSend } from "./util.js";
import { getContentViews } from "./view.js";
import { appendFileSync } from "fs";

const PROTOCOL = 'telemetry-app'
// Hardcoded for debugging - remove after fixing
const LOG_FILE = '/Users/akira/Code/electron-system-telemetry/deeplink-debug.log';

function log(msg: string) {
    const timestamp = new Date().toISOString();
    appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

let pendingDeepLink: string | null = null;
let mainWindow: BaseWindow | null = null;

// Registering a custom protocol for deep linking and adding a listener
export function registerProtocol() {
    log('registerProtocol called');
    // Registering the protocol
    // Not set up for dev environment, honeslty easier to just package and run the app
    app.setAsDefaultProtocolClient(PROTOCOL)

    // DURING RUNTIME - Handling deep link on MacOS
    app.on('open-url', (event, url) => {
        log(`open-url event fired with url: ${url}`);
        event.preventDefault()
        pendingDeepLink = url;
        log(`mainWindow exists: ${!!mainWindow}`);
        if (mainWindow) {
            handleDeepLink(pendingDeepLink)
            pendingDeepLink = null;
        } else {
            log('mainWindow not ready, storing pendingDeepLink');
        }
    })
}

// After main window is created, set the window and handle any premature deep links
export function setMainWindowForDeepLink(win: BaseWindow) {
    log('setMainWindowForDeepLink called');
    mainWindow = win;
    log(`pendingDeepLink: ${pendingDeepLink}`);
    if (pendingDeepLink) {
        handleDeepLink(pendingDeepLink);
        pendingDeepLink = null;
    }
}

export function handleDeepLink(pendingDeepLink: string) {
    log(`handleDeepLink called with: ${pendingDeepLink}`);
    const parsed = new URL(pendingDeepLink)
    log(`parsed host: ${parsed.host}`);
    const views = getContentViews();
    log(`views count: ${views.length}`);
    const view = views[views.length - 1]; // deep link to the most recently created view
    if (!view) {
        log('no view found, returning early');
        return;
    }

    const sendChangeView = () => {
        log(`sending changeView IPC for host: ${parsed.host}`);
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
            default:
                log(`unknown host: ${parsed.host}`);
        }
    };

    // Wait for webContents to finish loading before sending IPC
    if (view.webContents.isLoading()) {
        log('webContents is still loading, waiting for did-finish-load');
        view.webContents.once('did-finish-load', sendChangeView);
    } else {
        sendChangeView();
    }
}
