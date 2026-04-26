import { app, Menu } from "electron";
import { BrowserWindow } from "electron";
import { isDev, ipcWebContentsSend } from "./util.js";

export function createMenu(mainWindow: BrowserWindow) {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: 'App',
            type: 'submenu',
            submenu: [{
                label: 'Quit',
                click: () => app.quit()
            },
            {
                label: 'DevTools',
                click: () => mainWindow.webContents.openDevTools(),
                visible: isDev()
            }]
        },
        {
            label: 'View',
            type: 'submenu',
            submenu: [{
                label: 'CPU',
                click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'CPU')
            },
            {
                label: 'RAM',
                click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'RAM')
            },
            {
                label: 'DISK',
                click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'DISK')
            }
            ]
        }
    ]))
}