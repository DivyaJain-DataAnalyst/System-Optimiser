import React, { useState } from 'react';
import { FocusModeSettings } from '../types';

interface FocusModeSettingsModalProps {
  initialSettings: FocusModeSettings;
  onSave: (settings: FocusModeSettings) => void;
  onClose: () => void;
}

type ListType = 'blacklist' | 'whitelist';

export function FocusModeSettingsModal({ initialSettings, onSave, onClose }: FocusModeSettingsModalProps) {
  const [blacklist, setBlacklist] = useState<string[]>(initialSettings.blacklist);
  const [whitelist, setWhitelist] = useState<string[]>(initialSettings.whitelist);
  const [newItem, setNewItem] = useState('');
  const [draggedItem, setDraggedItem] = useState<{ item: string, source: ListType } | null>(null);

  const handleDragStart = (e: React.DragEvent, item: string, source: ListType) => {
    setDraggedItem({ item, source });
    e.dataTransfer.effectAllowed = 'move';
    // WebKit (which Tauri uses on macOS) requires some data to be set for drag to start
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetList: ListType) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { item, source } = draggedItem;
    if (source === targetList) return;

    if (source === 'blacklist' && targetList === 'whitelist') {
      setBlacklist(blacklist.filter(i => i !== item));
      setWhitelist([...whitelist, item]);
    } else if (source === 'whitelist' && targetList === 'blacklist') {
      setWhitelist(whitelist.filter(i => i !== item));
      setBlacklist([...blacklist, item]);
    }

    setDraggedItem(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItem.trim();
    if (!trimmed) return;
    
    // Add to blacklist by default, avoid duplicates
    if (!blacklist.includes(trimmed) && !whitelist.includes(trimmed)) {
      setBlacklist([...blacklist, trimmed]);
    }
    setNewItem('');
  };

  const removeItem = (item: string, list: ListType) => {
    if (list === 'blacklist') {
      setBlacklist(blacklist.filter(i => i !== item));
    } else {
      setWhitelist(whitelist.filter(i => i !== item));
    }
  };

  const handleSave = () => {
    onSave({ blacklist, whitelist });
  };

  const ListColumn = ({ title, description, items, type }: { title: string, description: string, items: string[], type: ListType }) => (
    <div 
      className={`flex-1 bg-background border rounded p-4 flex flex-col transition-colors ${draggedItem && draggedItem.source !== type ? 'border-primary bg-primary/5' : 'border-border'}`}
      onDragOver={handleDragOver}
      onDragEnter={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, type)}
    >
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{description}</p>
      <div className="flex-1 overflow-y-auto min-h-[150px] space-y-2">
        {items.length === 0 && (
          <div className="text-sm text-gray-400 italic text-center mt-4">Drop items here</div>
        )}
        {items.map((item) => (
          <div
            key={item}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, item, type)}
            onDragEnd={() => setDraggedItem(null)}
            className="flex items-center justify-between p-2 bg-card border border-border rounded cursor-move hover:border-primary hover:shadow-md transition-all group select-none"
            style={{ WebkitUserDrag: 'element' } as React.CSSProperties}
          >
            <span className="text-sm truncate mr-2 pointer-events-none">≡ {item}</span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 items-center">
              {type === 'blacklist' ? (
                <button 
                  onClick={() => {
                    setBlacklist(blacklist.filter(i => i !== item));
                    setWhitelist([...whitelist, item]);
                  }}
                  className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded mr-1 focus:outline-none"
                  title="Move to Whitelist"
                >
                  →
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setWhitelist(whitelist.filter(i => i !== item));
                    setBlacklist([...blacklist, item]);
                  }}
                  className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded mr-1 focus:outline-none"
                  title="Move to Blacklist"
                >
                  ←
                </button>
              )}
              <button 
                onClick={() => removeItem(item, type)}
                className="text-red-500 hover:text-red-700 px-1 font-bold text-lg leading-none focus:outline-none"
                title="Remove process"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full p-6 border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">Focus Mode Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop processes between lists to configure what gets suspended.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-foreground text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleAddItem} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add new process name (e.g. Spotify.exe)"
            className="flex-1 bg-background border border-border rounded px-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Add Process
          </button>
        </form>

        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          <ListColumn 
            title="Blacklist (Suspended)"
            description="These processes will be paused when Focus Mode is ON."
            items={blacklist}
            type="blacklist"
          />
          <ListColumn 
            title="Whitelist (Allowed)"
            description="These processes will NEVER be suspended."
            items={whitelist}
            type="whitelist"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors shadow"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
