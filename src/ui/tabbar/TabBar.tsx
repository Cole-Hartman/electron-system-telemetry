import { useState, useEffect, useRef } from 'react';
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
    const [dragOverTabId, setDragOverTabId] = useState<number | null>(null);
    const draggedTabRef = useRef<TabData | null>(null);

    useEffect(() => {
        // Initial tab load
        window.electron.getFirstTabId().then((id) => {
            if (id !== 0) {
                setTabs([{ id, label: 'Tab 1' }]);
                setActiveTabId(id);
            }
        });

        // Listen for init-tabs from main (for new windows after tear-away)
        const unsubscribeInit = window.electron.onInitTabs((newTabs) => {
            setTabs(newTabs);
            if (newTabs.length > 0) {
                setActiveTabId(newTabs[0].id);
                window.electron.switchTab(newTabs[0].id);
            }
        });

        // Listen for remove-tab from main (when tab is torn away)
        const unsubscribeRemove = window.electron.onRemoveTab((tabId) => {
            setTabs((prevTabs) => {
                const index = prevTabs.findIndex((t) => t.id === tabId);
                const newTabs = prevTabs.filter((t) => t.id !== tabId);

                // If removed tab was active, switch to adjacent
                if (activeTabId === tabId && newTabs.length > 0) {
                    const newActiveIndex = Math.min(index, newTabs.length - 1);
                    const newActiveId = newTabs[newActiveIndex].id;
                    setActiveTabId(newActiveId);
                    window.electron.switchTab(newActiveId);
                }

                return newTabs;
            });
        });

        return () => {
            unsubscribeInit();
            unsubscribeRemove();
        };
    }, [activeTabId]);

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
        draggedTabRef.current = tabs.find((t) => t.id === id) || null;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, id: number) => {
        e.preventDefault();
        if (id !== draggedTabId) {
            setDragOverTabId(id);
        }
    };

    const handleDrop = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        if (draggedTabId === null || draggedTabId === targetId) return;

        const draggedIndex = tabs.findIndex((t) => t.id === draggedTabId);
        const targetIndex = tabs.findIndex((t) => t.id === targetId);

        const newTabs = [...tabs];
        const [draggedTab] = newTabs.splice(draggedIndex, 1);
        newTabs.splice(targetIndex, 0, draggedTab);

        setTabs(newTabs);
        setDragOverTabId(null);
    };

    const handleDragEnd = async (e: React.DragEvent) => {
        const draggedTab = draggedTabRef.current;

        // Check if drag ended outside window (tear-away)
        if (draggedTab && tabs.length > 1) {
            const bounds = await window.electron.getWindowBounds();
            const { screenX, screenY } = e;

            const isOutside =
                screenX < bounds.x ||
                screenX > bounds.x + bounds.width ||
                screenY < bounds.y ||
                screenY > bounds.y + bounds.height;

            if (isOutside) {
                window.electron.tearAwayTab(
                    draggedTab.id,
                    draggedTab.label,
                    screenX,
                    screenY
                );
            }
        }

        setDraggedTabId(null);
        setDragOverTabId(null);
        draggedTabRef.current = null;
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if leaving the tab-list entirely (not entering a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverTabId(null);
        }
    };

    return (
        <div className="tab-bar">
            <div className="traffic-lights">
                <button id="close" onClick={() => window.electron.sendFrameAction('CLOSE')} />
                <button id="minimize" onClick={() => window.electron.sendFrameAction('MINIMIZE')} />
                <button id="maximize" onClick={() => window.electron.sendFrameAction('MAXIMIZE')} />
            </div>
            <div className="tab-list" onDragLeave={handleDragLeave}>
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        id={tab.id}
                        label={tab.label}
                        isActive={tab.id === activeTabId}
                        isDragging={tab.id === draggedTabId}
                        isDropTarget={tab.id === dragOverTabId}
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
