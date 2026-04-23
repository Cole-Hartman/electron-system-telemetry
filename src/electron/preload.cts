const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
    subscribeStatistics: (callback) => {
        // Listens for statistics event from main and calls callback
        ipcOn("statistics", (stats) => { callback(stats) });
    },
    getStaticData: () => ipcInvoke("getStaticData"),
} satisfies Window['electron']);
/**
* satisfies - tells TS to expect this object to match type x. 
* In this case, this object is untyped. So we link it to our existing Window interface.
*/

/**
 * Type safe adapter pattern
 * Same pattern we implemented for the backend in utils.ts
 */
function ipcInvoke<Key extends keyof EventPayloadMapping>(
    key: Key,
): Promise<EventPayloadMapping[Key]> {
    return electron.ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void) {
    electron.ipcRenderer.on(key, (_: any, payload: EventPayloadMapping[Key]) => callback(payload));
}