import { useState } from 'react';
import { Tab } from './Tab';
import './Tabs.css';

type TabData = {
    id: number;
    label: string;
};

export function TabBar() {
    const [tabs, setTabs] = useState<TabData[]>([{ id: 1, label: 'Tab 1' }]);
    const [activeTabId, setActiveTabId] = useState(1);

    const handleNewTab = async () => {
        const id = await window.electron.newTab();
        const newTab = { id, label: `Tab ${tabs.length + 1}` };
        setTabs([...tabs, newTab]);
        setActiveTabId(id);
    };

    const handleCloseTab = (id: number) => {
        if (tabs.length === 1) return;
        const newTabs = tabs.filter((tab) => tab.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    const handleSelectTab = (id: number) => {
        setActiveTabId(id);
        window.electron.switchTab(id);
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
                    />
                ))}
                <button className="tab-new" onClick={handleNewTab}>
                    +
                </button>
            </div>
        </div>
    );
}