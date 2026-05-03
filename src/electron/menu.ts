import { app, BaseWindow, Menu, WebContentsView } from "electron";
import { ipcWebContentsSend } from "./util.js";

/**
 * Creates the application menu for the main window.
 * - Allows use to select the active view
 */

export function createMenu(mainWindow: BaseWindow, view: WebContentsView) {
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
                click: () => view.webContents.openDevTools(),
                accelerator: 'CmdOrCtrl+Option+I'
            }]
        },
        {
            label: 'View',
            type: 'submenu',
            submenu: [{
                label: 'CPU',
                click: () => ipcWebContentsSend("changeView", view.webContents, 'CPU'),
                accelerator: 'CmdOrCtrl+1'
            },
            {
                label: 'RAM',
                click: () => ipcWebContentsSend("changeView", view.webContents, 'RAM'),
                accelerator: 'CmdOrCtrl+2'
            },
            {
                label: 'DISK',
                click: () => ipcWebContentsSend("changeView", view.webContents, 'DISK'),
                accelerator: 'CmdOrCtrl+3'
            }
            ]
        }
    ]))
}