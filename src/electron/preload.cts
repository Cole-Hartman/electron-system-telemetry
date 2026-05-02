const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
    subscribeStatistics: (callback) => {
        // Listens for statistics event from main and calls callback
        return ipcOn("statistics", (stats) => { callback(stats) });
    },
    subscribeChangeView: (callback) => {
        return ipcOn("changeView", (view) => { callback(view) });
    },
    getStaticData: () => ipcInvoke("getStaticData"),
    sendFrameAction: (payload) => {
        ipcSend("sendFrameAction", payload)
    },

    // TABS
    newTab: () => ipcInvoke("newTab"),
    switchTab: (id: number) => ipcSend("switchTab", id),
    getViewId: () => ipcInvoke("getViewId"),
    getFirstTabId: () => ipcInvoke("getFirstTabId"),
    // close: (id: number) => ipcRenderer.invoke('tabs:close', id),
    // select: (id: number) => ipcRenderer.invoke('tabs:select', id),
    // getAllTabIds: () => ipcRenderer.invoke('tabs:getAllTabIds'),
    // getSelectedTabId: () => ipcRenderer.invoke('tabs:getSelectedTabId'),
    // reorder: (tabIds: number[]) => ipcRenderer.invoke('tabs:reorder', tabIds),

} satisfies Window['electron']);
// satisfies - tells TS to expect this object to match type x. 
// In this case, this object is untyped. So we link it to our existing Window interface.

/**
* ------------------------------------------------------------
* TYPE SAFE ADAPTER PATTERN
* ------------------------------------------------------------
* Mirror pattern implemented for the backend in ./utils.ts
*/

// Sends a message to main, listens for a response, returns a promise.
function ipcInvoke<Key extends keyof EventPayloadMapping>(
    key: Key,
): Promise<EventPayloadMapping[Key]> {
    return electron.ipcRenderer.invoke(key);
}

// Listens for messages on a channel. When a message arrives, the callback fires.
function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void) {

    const cb = (_: any, payload: EventPayloadMapping[Key]) => callback(payload)
    electron.ipcRenderer.on(key, cb);

    // return a unsubscribe function so react can unsubscribe from the event 
    return () => electron.ipcRenderer.off(key, cb);
}

// Sends a message to main.
function ipcSend<Key extends keyof EventPayloadMapping>(
    key: Key, payload: EventPayloadMapping[Key]) {
    electron.ipcRenderer.send(key, payload);
} 