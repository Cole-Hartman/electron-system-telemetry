import { ipcMain, WebContents } from "electron";

export function isDev(): boolean {
    return process.env.NODE_ENV === "development";
}

/**
* Type safe adapter pattern
* Wraps our ipc call in a type safe function 
* 
* <Key extends keyof EventPayloadMapping>
* Key - is a generic type parameter for the channel name.
* keyof EventPayloadMapping - Key must be one of the property names of our EventPayloadMapping type.
* 
* As long as we always use this wrapper and not ipcMain directly, we can be sure that
* it is type safe.
* More specifically, we can be sure that the provided channel name is is one of our defined channels
* and that the handler function returns the correct type for that channel.
*/
export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: () => EventPayloadMapping[Key]) {
    ipcMain.handle(key, () => handler())
}

/**
 * Same concept as ipcHandle, but for webContents.send
 */
export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    webContents: WebContents,
    payload: EventPayloadMapping[Key]) {
    webContents.send(key, payload)
}