import './Tabs.css';

type TabProps = {
    id: number;
    label: string;
    isActive: boolean;
    onSelect: (id: number) => void;
    onClose: (id: number) => void;
    onDragStart: (e: React.DragEvent, id: number) => void;
    onDragOver: (e: React.DragEvent, id: number) => void;
    onDrop: (e: React.DragEvent, id: number) => void;
    onDragEnd: () => void;
};

export function Tab({ id, label, isActive, onSelect, onClose, onDragStart, onDragOver, onDrop, onDragEnd }: TabProps) {
    return (
        <div
            className={`tab ${isActive ? 'tab-active' : ''}`}
            onClick={() => onSelect(id)}
            draggable
            onDragStart={(e) => onDragStart(e, id)}
            onDragOver={(e) => onDragOver(e, id)}
            onDrop={(e) => onDrop(e, id)}
            onDragEnd={onDragEnd}
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