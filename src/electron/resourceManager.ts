import osUtils from "os-utils";
import os from "os";
import fs from "fs";
import { WebContentsView } from "electron";
import { ipcWebContentsSend } from "./util.js"

const POLLING_INTERVAL = 500;

// Poll active resource utilization for a WebContentsView
export function pollResources(view: WebContentsView) {
    setInterval(async () => {
        if (view.webContents.isDestroyed()) return;
        const cpuUsage = await getCpuUsage();
        const memoryUsage = getMemoryUsage();
        const diskUsage = getDiskUsage();
        // Send statistics event to renderer
        ipcWebContentsSend("statistics", view.webContents, { cpuUsage, memoryUsage, diskUsage: diskUsage.usage })
    }, POLLING_INTERVAL);
}

// General system info
export function getStaticData() {
    const totalStorage = getDiskUsage().total;
    const cpuModel = os.cpus()[0].model;
    const totalMemoryGB = Math.floor(osUtils.totalmem() / 1024);

    return {
        totalStorage, cpuModel, totalMemoryGB
    }

}

function getCpuUsage(): Promise<number> {
    return new Promise(resolve => {
        osUtils.cpuUsage(resolve)
    })
}

function getMemoryUsage() {
    // Ram usage hovers around 98-99% because of the way osUtils.freememPercentage() works
    // It only returns truly free memory not used by the system but macos aggressively caches 
    // files in ram for performance that are freed instantly when apps need it.

    return 1 - osUtils.freememPercentage();
}

function getDiskUsage() {
    const root = process.platform === "win32" ? "C:\\" : "/";
    const stats = fs.statfsSync(root);
    const total = stats.blocks * stats.bsize;
    const free = stats.bavail * stats.bsize;

    return {
        total: Math.floor(total / 1_000_000_000),
        usage: total > 0 ? 1 - free / total : 0,
    };
}

