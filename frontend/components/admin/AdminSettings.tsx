'use client';

import { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    supportedLanguages: ['python', 'javascript', 'java', 'cpp', 'c'],
    pistonApiUrl: 'https://emkc.org/api/v2/piston',
    platformName: 'EmbeddedPro',
    enableContests: false
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">System & Platform Settings</h1>

      <div className="space-y-6">
        {/* Supported Languages */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Supported Programming Languages</h2>
          <div className="space-y-2">
            {settings.supportedLanguages.map((lang) => (
              <div key={lang} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compiler Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Compiler / Executor Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Piston API URL</label>
              <input
                type="text"
                value={settings.pistonApiUrl}
                onChange={(e) => setSettings({ ...settings, pistonApiUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Platform Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableContests"
                checked={settings.enableContests}
                onChange={(e) => setSettings({ ...settings, enableContests: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="enableContests" className="text-sm text-gray-700">
                Enable Contests & Challenges
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

