import './Tabs.css';

type TabProps = {
    id: number;
    label: string;
    isActive: boolean;
    onSelect: (id: number) => void;
    onClose: (id: number) => void;
};

export function Tab({ id, label, isActive, onSelect, onClose }: TabProps) {
    return (
        <div
            className={`tab ${isActive ? 'tab-active' : ''}`}
            onClick={() => onSelect(id)}
        >
            <span className="tab-label">{label}</span>
            <button
                className="tab-close"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose(id);
                }}
            >
                ×
            </button>
        </div>
    );
}