'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'

export default function TopicsPage() {
  const { topics, addTopic, updateTopic, deleteTopic, bulkAddTopics } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    difficulty: 3,
    importance: 3,
    estimatedMinutes: '',
    notes: '',
  })

  const handleAdd = () => {
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }
    addTopic({
      title: formData.title,
      category: formData.category || undefined,
      difficulty: formData.difficulty,
      importance: formData.importance,
      estimatedMinutes: formData.estimatedMinutes
        ? parseInt(formData.estimatedMinutes)
        : undefined,
      notes: formData.notes || undefined,
    })
    setFormData({
      title: '',
      category: '',
      difficulty: 3,
      importance: 3,
      estimatedMinutes: '',
      notes: '',
    })
    setShowAddForm(false)
  }

  const handleEdit = (topic: typeof topics[0]) => {
    setEditingId(topic.id)
    setFormData({
      title: topic.title,
      category: topic.category || '',
      difficulty: topic.difficulty,
      importance: topic.importance,
      estimatedMinutes: topic.estimatedMinutes?.toString() || '',
      notes: topic.notes || '',
    })
    setShowAddForm(true)
  }

  const handleUpdate = () => {
    if (!editingId || !formData.title.trim()) {
      alert('Title is required')
      return
    }
    updateTopic(editingId, {
      title: formData.title,
      category: formData.category || undefined,
      difficulty: formData.difficulty,
      importance: formData.importance,
      estimatedMinutes: formData.estimatedMinutes
        ? parseInt(formData.estimatedMinutes)
        : undefined,
      notes: formData.notes || undefined,
    })
    setEditingId(null)
    setFormData({
      title: '',
      category: '',
      difficulty: 3,
      importance: 3,
      estimatedMinutes: '',
      notes: '',
    })
    setShowAddForm(false)
  }

  const handleBulkAdd = () => {
    const lines = bulkText.split('\n').filter((line) => line.trim())
    if (lines.length === 0) {
      alert('Please enter at least one topic')
      return
    }
    bulkAddTopics(lines)
    setBulkText('')
    setShowBulkForm(false)
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Topics</h1>
          <p className="text-gray-600">Manage your study topics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowBulkForm(!showBulkForm)
              setShowAddForm(false)
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Bulk Add
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setShowBulkForm(false)
              setEditingId(null)
              setFormData({
                title: '',
                category: '',
                difficulty: 3,
                importance: 3,
                estimatedMinutes: '',
                notes: '',
              })
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : 'Add Topic'}
          </button>
        </div>
      </div>

      {/* Bulk Add Form */}
      {showBulkForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Add Topics</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter one topic per line. Default difficulty and importance will be set to 3.
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            onClick={handleBulkAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add All Topics
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Topic' : 'Add Topic'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Algebra Basics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{formData.difficulty}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Importance (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.importance}
                onChange={(e) =>
                  setFormData({ ...formData, importance: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{formData.importance}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Minutes
              </label>
              <input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedMinutes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingId ? 'Update' : 'Add'} Topic
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingId(null)
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="bg-white rounded-lg shadow">
        {topics.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No topics yet. Add your first topic to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{topic.title}</div>
                      {topic.notes && (
                        <div className="text-sm text-gray-500">{topic.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(topic.difficulty / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">{topic.difficulty}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${(topic.importance / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">{topic.importance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this topic?')) {
                            deleteTopic(topic.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
