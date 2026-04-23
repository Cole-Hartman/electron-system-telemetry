// all types for 
// main <-> renderer processes  
// preload <-> browser

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

// Type for type safe adapter pattern
type EventPayloadMapping = {
    statistics: Statistics;
    getStaticData: StaticData;
}

/*
Anytime we try to access a new window property, typescript will comlain.
The window is just an object, and typescript doesn't know about our new electron property.
When my React code tries to call window.electron.getStaticData(), TypeScript would 
complain: "Property 'electron' does not exist on type 'Window'".
Window already has a type, so we just extend it with an interface to add our new electron property.
*/
interface Window {
    electron: {
        // subscribeStatistics is a function that takes a callback and returns void 
        // the callback takes a statistics object and returns void
        subscribeStatistics: (callback: (statistics: Statistics) => void) => void;
        // getStaticData is a function that returns a promise that
        // the promise uses a generic, and we pass in StaticData as the generic
        getStaticData: () => Promise<StaticData>;
    }
}

