import { app, BaseWindow } from "electron";
import { ipcWebContentsSend } from "./util.js";
import { getContentViews } from "./view.js";

const PROTOCOL = 'telemetry-app'

let pendingDeepLink: string | null = null;
let mainWindow: BaseWindow | null = null;

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
            handleDeepLink(pendingDeepLink)
            pendingDeepLink = null;
        }
    })
}

export function handleDeepLink(pendingDeepLink: string) {
    const parsed = new URL(pendingDeepLink)
    const view = getContentViews()[-1] // deep link to the most recently created view

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
}
