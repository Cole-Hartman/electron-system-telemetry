import osUtils from "os-utils";
import os from "os";
import fs from "fs";
import { BrowserWindow } from "electron";
import { ipcWebContentsSend } from "./util.js"

const POLLING_INTERVAL = 500;

// Poll active resource utilization
export function pollResources(mainWindow: BrowserWindow) {
    setInterval(async () => {
        const cpuUsage = await getCpuUsage();
        const memoryUsage = getMemoryUsage();
        const diskUsage = getDiskUsage();
        // Send statistics event to renderer
        ipcWebContentsSend("statistics", mainWindow.webContents, { cpuUsage, memoryUsage, diskUsage: diskUsage.usage })
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

