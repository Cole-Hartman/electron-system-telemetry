import { BaseChart } from './BaseChart'
import { useMemo } from 'react'

export type ChartProps = {
    data: number[];
    maxDataPoints: number;
}

export function Chart(props: ChartProps) {
    /**
     * If props change, return prepared data.
     * Then pass to our BaseChart
     */
    const preparedData = useMemo(() => {
        const points = props.data.map(point => ({ value: point * 100 }))

        return [...points, ...Array.from({ length: props.maxDataPoints - points.length }).map((item) => ({ value: undefined }))]
    }, [props.data, props.maxDataPoints]
    );

    return <BaseChart data={preparedData} fill="#ef4444" stroke="#3b82f6" />
}