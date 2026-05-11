import './Tabs.css';

type TabProps = {
    id: number;
    label: string;
    isActive: boolean;
    isDragging: boolean;
    isDropTarget: boolean;
    onSelect: (id: number) => void;
    onClose: (id: number) => void;
    onDragStart: (e: React.DragEvent, id: number) => void;
    onDragOver: (e: React.DragEvent, id: number) => void;
    onDrop: (e: React.DragEvent, id: number) => void;
    onDragEnd: (e: React.DragEvent) => void;
};

export function Tab({ id, label, isActive, isDragging, isDropTarget, onSelect, onClose, onDragStart, onDragOver, onDrop, onDragEnd }: TabProps) {
    const classNames = ['tab'];
    if (isActive) classNames.push('tab-active');
    if (isDragging) classNames.push('tab-dragging');
    if (isDropTarget) classNames.push('tab-drop-target');

    return (
        <div
            className={classNames.join(' ')}
            onClick={() => onSelect(id)}
            draggable
            onDragStart={(e) => onDragStart(e, id)}
            onDragOver={(e) => onDragOver(e, id)}
            onDrop={(e) => onDrop(e, id)}
            onDragEnd={(e) => onDragEnd(e)}
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