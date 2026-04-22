const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
    subscribeStatistics: (callback) => {
        // Listens for statistics event from main and calls callback
        electron.ipcRenderer.on("statistics", (_: any, stats: Statistics) => {
            callback(stats);
        })
    },
    getStaticData: () => electron.ipcRenderer.invoke("getStaticData"),
} satisfies Window['electron']);