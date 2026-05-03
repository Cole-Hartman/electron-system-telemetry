import { ipcMain, type WebContents, type WebFrameMain } from "electron";
import { getUIPath } from "./pathResolver.js";
import { pathToFileURL } from "url";

export function isDev(): boolean {
    return process.env.NODE_ENV === "development";
}

/**
* ------------------------------------------------------------
* TYPE SAFE ADAPTER PATTERN
* ------------------------------------------------------------
* Wraps our ipc call in a type safe function 
* As long as we always use these wrappers and not ipcMain directly, we can be sure that it is type safe.
* More specifically, we can be sure that the provided channel name is is one of our defined channels 
* and that the handler function returns the correct type for that channel.
*/

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: () => EventPayloadMapping[Key]) {
    ipcMain.handle(key, (event) => {
        // event validation:
        // the senderFrame property can tell us what URL is currently opened when the user 
        // sent the request. We use this to verify that our code sent the event.
        validateEventFrame(event.senderFrame);
        return handler();
    })
}

export function ipcMainOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: (payload: EventPayloadMapping[Key]) => void) {
    ipcMain.on(key, (event, payload) => {
        validateEventFrame(event.senderFrame);
        return handler(payload);
    })
}

// Helper function to validate the event frame for security purposes.
export function validateEventFrame(frame: WebFrameMain | null) {
    if (!frame) {
        throw new Error("No frame found");
    }
    // If we are in development, check that the current frames url matches our development server url
    if (isDev() && new URL(frame.url).host === "localhost:5123") {
        return;
    }
    // If we are not in development, check that the current frames url matches one of our built app urls
    const validUrls = [
        pathToFileURL(getUIPath("content")).toString(),
        pathToFileURL(getUIPath("tabbar")).toString(),
    ];
    if (!validUrls.includes(frame.url)) {
        throw new Error("Malicious event detected");
    }
}

// Same concept as ipcHandle, but for webContents.send
export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
    key: Key, webContents: WebContents, payload: EventPayloadMapping[Key]) {
    webContents.send(key, payload)
}