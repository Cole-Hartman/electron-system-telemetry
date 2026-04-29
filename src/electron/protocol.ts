import { app, BrowserWindow } from "electron";
import { ipcWebContentsSend } from "./util.js";
import { appendFileSync } from "fs";
import path from "path";

const PROTOCOL = 'telemetry-app'

function log(msg: string) {
    const logPath = path.join(app.getPath('userData'), 'deep-link.log');
    const line = `${new Date().toISOString()}: ${msg}\n`;
    appendFileSync(logPath, line);
    console.log(msg);
}
let pendingDeepLink: string | null = null;
let mainWindow: BrowserWindow | null = null;

// Registering a custom protocol for deep linking
export function registerProtocol() {
    // Registering the protocol
    // Not set up for dev environment, honeslty easier to just package and run the app
    app.setAsDefaultProtocolClient(PROTOCOL)

    // DURING RUNTIME - Handling deep link on MacOS
    app.on('open-url', (event, url) => {
        log(`open-url fired, url=${url}, mainWindow=${!!mainWindow}`);
        event.preventDefault()
        pendingDeepLink = url;
        if (mainWindow) {
            handleDeepLink(pendingDeepLink, mainWindow)
            pendingDeepLink = null;
        }
    })

    // LAUNCHING THE APP - Handling deep link on MacOS
    // app.whenReady().then(() => {
    //     // Check if open-url was fired before ready
    //     const deepLinkUrl = process.argv.find(arg => arg.startsWith('myapp://'))
    //     if (deepLinkUrl) handleDeepLink(deepLinkUrl)
    // })
}

export function setMainWindow(win: BrowserWindow) {
    log(`setMainWindow called, pendingDeepLink=${pendingDeepLink}`);
    mainWindow = win;
    if (pendingDeepLink && mainWindow) {
        const url = pendingDeepLink;
        pendingDeepLink = null;
        // Wait for app to fully load before sending IPC
        mainWindow.webContents.once('did-finish-load', () => {
            log(`did-finish-load fired, now handling deep link`);
            handleDeepLink(url, mainWindow!);
        });
    }
}

export function handleDeepLink(pendingDeepLink: string, mainWindow: BrowserWindow) {
    const parsed = new URL(pendingDeepLink)
    log(`handleDeepLink called, url=${pendingDeepLink}, host=${parsed.host}`);

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
