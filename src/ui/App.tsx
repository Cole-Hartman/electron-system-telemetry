import { useMemo } from 'react'
import { Chart } from './Chart.tsx'
import { useStatistics } from './useStatistics.ts'
import './App.css'

function App() {
  const statistics = useStatistics(100);
  const cpuUsages = useMemo(() => statistics.map(stat => stat.cpuUsage), [statistics]);

  return (
    <>
      <section id="center">
        <div style={{ height: 200, width: 1000 }}>
          <Chart data={cpuUsages} maxDataPoints={10} />
        </div>
      </section >
      <section id="spacer"></section>
    </>
  )
}

export default App
