import { app, Menu } from "electron";
import { BrowserWindow } from "electron";
import { isDev, ipcWebContentsSend } from "./util.js";

/**
 * Creates the application menu for the main window.
 * - Allows use to select the active view
 */

export function createMenu(mainWindow: BrowserWindow) {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: 'App',
            type: 'submenu',
            submenu: [{
                label: 'Quit',
                click: () => app.quit(),
                accelerator: 'CmdOrCtrl+Q'
            },
            {
                label: 'Close',
                click: () => mainWindow.close(),
                accelerator: 'CmdOrCtrl+W'
            },
            {
                label: 'DevTools',
                click: () => mainWindow.webContents.openDevTools(),
                visible: isDev(),
                accelerator: 'CmdOrCtrl+Shift+I'
            }]
        },
        {
            label: 'View',
            type: 'submenu',
            submenu: [{
                label: 'CPU',
                click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'CPU'),
                accelerator: 'CmdOrCtrl+1'
            },
            {
                label: 'RAM',
                click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'RAM'),
                accelerator: 'CmdOrCtrl+2'
            },
            {
                label: 'DISK',
                click: () => ipcWebContentsSend("changeView", mainWindow.webContents, 'DISK'),
                accelerator: 'CmdOrCtrl+3'
            }
            ]
        }
    ]))
}