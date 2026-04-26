import { useMemo, useEffect, useState } from 'react'
import { Chart } from './Chart.tsx'
import { useStatistics } from './useStatistics.ts'
import './App.css'

function App() {
  const statistics = useStatistics(100);
  const [activeView, setActiveView] = useState<View>('CPU');

  const cpuUsages = useMemo(() => statistics.map(stat => stat.cpuUsage), [statistics]);
  const memoryUsages = useMemo(() => statistics.map(stat => stat.memoryUsage), [statistics]);
  const diskUsages = useMemo(() => statistics.map(stat => stat.diskUsage), [statistics]);

  const activeUsages = useMemo(() => {
    switch (activeView) {
      case 'CPU':
        return cpuUsages;
      case 'RAM':
        return memoryUsages;
      case 'DISK':
        return diskUsages;
    }

  }, [activeView, cpuUsages, memoryUsages, diskUsages]);


  useEffect(() => {
    const unsubscribe = window.electron.subscribeChangeView((view) => {
      setActiveView(view);
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <div className="App">
        <header>
          <button id="close" onClick={() => window.electron.sendFrameAction('CLOSE')} />
          <button id="minimize" onClick={() => window.electron.sendFrameAction('MINIMIZE')} />
          <button id="maximize" onClick={() => window.electron.sendFrameAction('MAXIMIZE')} />
        </header>
        <div style={{ height: 200, width: 1000 }}>
          <Chart data={activeUsages} maxDataPoints={10} />
        </div>
      </div>
    </>
  )
}

export default App
