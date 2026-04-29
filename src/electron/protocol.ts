import { app, BrowserWindow } from "electron";
import path from "path";

const PROTOCOL = 'telemetry-app'
let pendingDeepLink: string | null = null;
let mainWindow: BrowserWindow | null = null;

// Registering a custom protocol for deep linking
export function registerProtocol() {
    // Registering the protocol
    if (process.defaultApp) {
        // running in development
        if (process.argv.length >= 2) {
            // we must tell the OS where to find the executable
            // process.execPath - is the path to the Electron executable
            // [path.resolve(process.argv[1])] - is the path to the main script
            app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
        }
    } else {
        // running in production
        app.setAsDefaultProtocolClient(PROTOCOL)
    }

    // DURING RUNTIME - Handling deep link on MacOS
    app.on('open-url', (event, url) => {
        event.preventDefault() // prevent the default behavior of the browser (don't want warning logs, attempts to open in browser, etc.)
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
    mainWindow = win;
    // If a pending deep link was made before the main window was set
    if (pendingDeepLink && mainWindow) {
        handleDeepLink(pendingDeepLink, mainWindow)
        pendingDeepLink = null;
    }
}

export function handleDeepLink(pendingDeepLink: string, mainWindow: BrowserWindow) {
    const parsed = new URL(pendingDeepLink)
    console.log("raw url: ", pendingDeepLink)
    console.log(parsed.pathname)
}
