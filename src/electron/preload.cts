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
/*
satisfies - tells TS to expect this object to match type x. 
In this case, this object is untyped. So we link it to our existing Window interface.
*/