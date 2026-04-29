import { app, BrowserWindow } from "electron";
import { ipcWebContentsSend } from "./util.js";

const PROTOCOL = 'telemetry-app'

let pendingDeepLink: string | null = null;
let mainWindow: BrowserWindow | null = null;

// Registering a custom protocol for deep linking
export function registerProtocol() {
    // Registering the protocol
    // Not set up for dev environment, honeslty easier to just package and run the app
    app.setAsDefaultProtocolClient(PROTOCOL)

    // DURING RUNTIME - Handling deep link on MacOS
    app.on('open-url', (event, url) => {
        event.preventDefault()
        pendingDeepLink = url;
        if (mainWindow) {
            handleDeepLink(pendingDeepLink, mainWindow)
            pendingDeepLink = null;
        }
    })
}

export function setMainWindow(win: BrowserWindow) {
    mainWindow = win;
    if (pendingDeepLink && mainWindow) {
        const url = pendingDeepLink;
        pendingDeepLink = null;
        // Wait for app to fully load before sending IPC
        mainWindow.webContents.once('did-finish-load', () => {
            handleDeepLink(url, mainWindow!);
        });
    }
}

export function handleDeepLink(pendingDeepLink: string, mainWindow: BrowserWindow) {
    const parsed = new URL(pendingDeepLink)

    switch (parsed.host) {
        case 'cpu':
            ipcWebContentsSend("changeView", mainWindow.webContents, 'CPU')
            break;
        case 'ram':
            ipcWebContentsSend("changeView", mainWindow.webContents, 'RAM')
            break;
        case 'disk':
            ipcWebContentsSend("changeView", mainWindow.webContents, 'DISK')
            break;
    }
}
