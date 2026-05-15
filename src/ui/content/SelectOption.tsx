import { Chart } from './Chart';

export function SelectOption(props: {
  title: string;
  view: View;
  subTitle: string;
  data: number[];
  activeView: View;
  onClick: () => void;
}) {
  const isActive = props.view === props.activeView;
  const currentUsage = props.data.length > 0
    ? Math.round(props.data[props.data.length - 1] * 100)
    : 0;
  const viewClass = props.view.toLowerCase();

  return (
    <button
      className={`selectOption ${viewClass}${isActive ? ' active' : ''}`}
      onClick={props.onClick}
    >
      <div className="selectOptionHeader">
        <span className="selectOptionLabel">{props.title}</span>
        <span className={`selectOptionUsage ${viewClass}`}>{currentUsage}%</span>
      </div>
      <div className="selectOptionSubtitle">{props.subTitle}</div>
      <div className="selectOptionChart">
        <Chart selectedView={props.view} data={props.data} maxDataPoints={10} />
      </div>
    </button>
  );
}
