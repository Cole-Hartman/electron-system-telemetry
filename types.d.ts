// all types between main and renderer processes

type Statistics = {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
};

type StaticData = {
    totalStorage: number;
    cpuModel: string;
    totalMemoryGB: number;
};

interface Window {
    // ts already has a window type, so we just extend it with an interface
    electron: {
        subscribeStatistics: (callback: (statistics: Statistics) => void) => void;
        getStaticData: () => Promise<StaticData>;
    };
}
