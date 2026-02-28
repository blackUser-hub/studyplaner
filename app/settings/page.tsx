'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'

export default function SettingsPage() {
  const { exportData, importData, resetData } = useStore()
  const [importText, setImportText] = useState('')

  const handleExport = () => {
    const data = exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `study-planner-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importText)
      if (!data.version || !Array.isArray(data.topics)) {
        throw new Error('Invalid data format')
      }
      if (
        confirm(
          'Importing data will replace all current data. Are you sure you want to continue?'
        )
      ) {
        importData(data)
        setImportText('')
        alert('Data imported successfully!')
      }
    } catch (error) {
      alert('Invalid JSON format. Please check your data.')
    }
  }

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all data? This action cannot be undone.'
      )
    ) {
      resetData()
      alert('All data has been reset.')
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your data</p>
      </div>

      <div className="space-y-6">
        {/* Export */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Export Data</h2>
          <p className="text-sm text-gray-600 mb-4">
            Download all your data as a JSON file for backup or transfer.
          </p>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export Data
          </button>
        </div>

        {/* Import */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Import Data</h2>
          <p className="text-sm text-gray-600 mb-4">
            Import data from a previously exported JSON file. This will replace all current data.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON data here..."
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 font-mono text-sm"
          />
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Import Data
          </button>
        </div>

        {/* Reset */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete all your data. This action cannot be undone.
          </p>
          <button
            onClick={handleReset}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reset All Data
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">About</h2>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>
              <strong>Data Storage:</strong> All data is stored locally in your browser using
              localStorage. No data is sent to any server.
            </p>
            <p>
              <strong>Data Format:</strong> Exported data uses versioned JSON schema. Make sure to
              keep backups of your exported data.
            </p>
            <p>
              <strong>Limitations:</strong> This planner provides guidance based on algorithms, but
              results are not guaranteed. Adjust your study plan based on your actual progress and
              needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
