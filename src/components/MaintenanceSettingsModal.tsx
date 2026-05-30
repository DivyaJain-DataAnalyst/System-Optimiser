import { useState } from 'react';
import { MaintenanceConfig, MaintenanceLog } from '../types';

interface Props {
  initialConfig: MaintenanceConfig;
  logs: MaintenanceLog[];
  onSave: (config: MaintenanceConfig) => void;
  onClose: () => void;
}

export function MaintenanceSettingsModal({ initialConfig, logs, onSave, onClose }: Props) {
  const [config, setConfig] = useState<MaintenanceConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');

  const handleCheckboxChange = (key: keyof MaintenanceConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh] border border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🧹</span> Automated Maintenance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure silent background optimization tasks
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-foreground text-2xl leading-none">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 mt-4 gap-6">
          <button 
            className={`pb-2 font-medium transition-colors border-b-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-foreground'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={`pb-2 font-medium transition-colors border-b-2 ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-foreground'}`}
            onClick={() => setActiveTab('logs')}
          >
            Activity Logs
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div>
                  <h4 className="font-semibold text-lg">Enable Automated Maintenance</h4>
                  <p className="text-sm text-gray-500">Run selected tasks automatically in the background</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={config.enabled} onChange={() => handleCheckboxChange('enabled')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className={`transition-opacity ${config.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <h4 className="font-semibold mb-3">Schedule</h4>
                <select 
                  value={config.schedule} 
                  onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary mb-6"
                >
                  <option value="idle">When System is Idle (15 mins)</option>
                  <option value="daily">Daily at 2:00 AM</option>
                  <option value="weekly">Weekly (Sunday at 2:00 AM)</option>
                </select>

                <h4 className="font-semibold mb-3">Tasks to Perform</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-start space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
                    <input type="checkbox" className="mt-1" checked={config.clear_temp_files} onChange={() => handleCheckboxChange('clear_temp_files')} />
                    <div>
                      <span className="block font-medium">Clear Temp Files</span>
                      <span className="text-xs text-gray-500">Removes temporary system caches</span>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
                    <input type="checkbox" className="mt-1" checked={config.flush_dns} onChange={() => handleCheckboxChange('flush_dns')} />
                    <div>
                      <span className="block font-medium">Flush DNS Cache</span>
                      <span className="text-xs text-gray-500">Resolves connectivity issues</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
                    <input type="checkbox" className="mt-1" checked={config.empty_trash} onChange={() => handleCheckboxChange('empty_trash')} />
                    <div>
                      <span className="block font-medium">Empty Recycle Bin</span>
                      <span className="text-xs text-gray-500">Permanently deletes trashed items</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
                    <input type="checkbox" className="mt-1" checked={config.trim_ssd} onChange={() => handleCheckboxChange('trim_ssd')} />
                    <div>
                      <span className="block font-medium">Trim SSD</span>
                      <span className="text-xs text-gray-500">Optimizes storage performance</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No maintenance tasks have been run yet.
                </div>
              ) : (
                logs.slice().reverse().map(log => (
                  <div key={log.id} className="p-4 bg-background border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${log.status === 'Success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="font-medium text-sm mb-1">
                      {log.tasks_run.join(' • ')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {log.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-background/50 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(config)}
            className="px-6 py-2 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors shadow"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
