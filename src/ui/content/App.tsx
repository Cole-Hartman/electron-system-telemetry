import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useStatistics } from './useStatistics';
import { Chart } from './Chart';
import { SelectOption } from './SelectOption';

function App() {
  const staticData = useStaticData();
  const statistics = useStatistics(10);
  const [activeView, setActiveView] = useState<View>('CPU');

  const cpuUsages = useMemo(
    () => statistics.map((stat) => stat.cpuUsage),
    [statistics]
  );

  const ramUsages = useMemo(
    () => statistics.map((stat) => stat.memoryUsage),
    [statistics]
  );

  const storageUsages = useMemo(
    () => statistics.map((stat) => stat.diskUsage),
    [statistics]
  );

  const activeUsages = useMemo(() => {
    switch (activeView) {
      case 'CPU':
        return cpuUsages;
      case 'RAM':
        return ramUsages;
      case 'DISK':
        return storageUsages;
    }
  }, [activeView, cpuUsages, ramUsages, storageUsages]);

  const [viewId, setViewId] = useState<number | null>(null);
  useEffect(() => {
    window.electron.getViewId().then(setViewId);
  }, []);

  useEffect(() => {
    return window.electron.subscribeChangeView((view) => setActiveView(view));
  }, []);

  return (
    <div className="App">
      <div className="view-id">View ID: {viewId}</div>
      <div className="main">
        <div>
          <SelectOption
            onClick={() => setActiveView('CPU')}
            title="CPU"
            view="CPU"
            subTitle={staticData?.cpuModel ?? ''}
            data={cpuUsages}
            activeView={activeView}
          />
          <SelectOption
            onClick={() => setActiveView('RAM')}
            title="RAM"
            view="RAM"
            subTitle={(staticData?.totalMemoryGB.toString() ?? '') + ' GB'}
            data={ramUsages}
            activeView={activeView}
          />
          <SelectOption
            onClick={() => setActiveView('DISK')}
            title="DISK"
            view="DISK"
            subTitle={(staticData?.totalStorage.toString() ?? '') + ' GB'}
            data={storageUsages}
            activeView={activeView}
          />
        </div>
        <div className="mainGrid">
          <Chart
            selectedView={activeView}
            data={activeUsages}
            maxDataPoints={10}
          />
        </div>
      </div>
    </div>
  );
}

function useStaticData() {
  const [staticData, setStaticData] = useState<StaticData | null>(null);

  useEffect(() => {
    (async () => {
      setStaticData(await window.electron.getStaticData());
    })();
  }, []);

  return staticData;
}

export default App;
