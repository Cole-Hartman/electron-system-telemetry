import { useState, useEffect } from 'react';
import { Tab } from './Tab';
import './Tabs.css';

type TabData = {
    id: number;
    label: string;
};

export function TabBar() {
    const [tabs, setTabs] = useState<TabData[]>([]);
    const [activeTabId, setActiveTabId] = useState<number | null>(null);
    const [draggedTabId, setDraggedTabId] = useState<number | null>(null);

    useEffect(() => {
        window.electron.getFirstTabId().then((id) => {
            setTabs([{ id, label: 'Tab 1' }]);
            setActiveTabId(id);
        });
    }, []);

    const handleNewTab = async () => {
        const id = await window.electron.newTab();
        const newTab = { id, label: `Tab ${tabs.length + 1}` };
        setTabs([...tabs, newTab]);
        setActiveTabId(id);
    };

    const handleCloseTab = (id: number) => {
        const index = tabs.findIndex((tab) => tab.id === id);
        
        let tabToSwitchTo: number;
        if (tabs.length === 1) {
            tabToSwitchTo = id;
        } else if (index > 0) {
            tabToSwitchTo = tabs[index - 1].id;
        } else {
            tabToSwitchTo = tabs[index + 1].id;
        }

        window.electron.closeTab(id, tabToSwitchTo);

        const newTabs = tabs.filter((tab) => tab.id !== id);
        setTabs(newTabs);
        if (activeTabId === id && newTabs.length > 0) {
            setActiveTabId(tabToSwitchTo);
        }
    };

    const handleSelectTab = (id: number) => {
        setActiveTabId(id);
        window.electron.switchTab(id);
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedTabId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, _id: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        if (draggedTabId === null || draggedTabId === targetId) return;

        const draggedIndex = tabs.findIndex(t => t.id === draggedTabId);
        const targetIndex = tabs.findIndex(t => t.id === targetId);

        const newTabs = [...tabs];
        const [draggedTab] = newTabs.splice(draggedIndex, 1);
        newTabs.splice(targetIndex, 0, draggedTab);

        setTabs(newTabs);
    };

    const handleDragEnd = () => {
        setDraggedTabId(null);
    };

    return (
        <div className="tab-bar">
            <div className="traffic-lights">
                <button id="close" onClick={() => window.electron.sendFrameAction('CLOSE')} />
                <button id="minimize" onClick={() => window.electron.sendFrameAction('MINIMIZE')} />
                <button id="maximize" onClick={() => window.electron.sendFrameAction('MAXIMIZE')} />
            </div>
            <div className="tab-list">
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        id={tab.id}
                        label={tab.label}
                        isActive={tab.id === activeTabId}
                        onSelect={handleSelectTab}
                        onClose={handleCloseTab}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                    />
                ))}
                <button className="tab-new" onClick={handleNewTab}>
                    +
                </button>
            </div>
        </div>
    );
}