import { useEffect, useState } from "react";

export function useStatistics(dataPointCount: number): Statistics[] {
    const [value, setValue] = useState<Statistics[]>([]);

    useEffect(() => {
        // when this hook stops, we want to unsubscribe from the statistics
        const unsubscribe = window.electron.subscribeStatistics((stats) => {
            setValue((prev) => {
                const newData = [...prev, stats]

                if (newData.length > dataPointCount) {
                    newData.shift();

                }
                return newData;
            })
        });
        // react calls the function when the hook stops
        return unsubscribe;
    }, []);

    return value;
}