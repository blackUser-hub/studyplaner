'use client'

import { useStore } from '@/lib/store'
import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns'
import { useState } from 'react'

export default function CalendarPage() {
  const { sessions, topics, updateSession } = useStore()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const sessionsByDate = new Map<string, typeof sessions>()
  sessions.forEach((session) => {
    const dateKey = session.date
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, [])
    }
    sessionsByDate.get(dateKey)!.push(session)
  })

  const selectedSessionData = selectedSession
    ? sessions.find((s) => s.id === selectedSession)
    : null

  const handleStatusChange = (sessionId: string, status: 'done' | 'skipped' | 'planned') => {
    updateSession(sessionId, { status })
    if (status === 'done') {
      setSelectedSession(null)
    }
  }

  const handleActualMinutesChange = (sessionId: string, minutes: number) => {
    updateSession(sessionId, { actualMinutes: minutes })
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-gray-600">View and manage your study sessions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Previous Week
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Next Week →
          </button>
        </div>
      </div>

      {/* Week View */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const daySessions = sessionsByDate.get(dateKey) || []
            const isToday = isSameDay(day, new Date())

            return (
              <div key={idx} className="bg-white p-4 min-h-[200px]">
                <div
                  className={`text-sm font-semibold mb-2 ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`text-lg font-bold mb-3 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-2">
                  {daySessions.map((session) => {
                    const topic = topics.find((t) => t.id === session.topicId)
                    const statusColors = {
                      planned: 'bg-blue-100 text-blue-800',
                      done: 'bg-green-100 text-green-800',
                      skipped: 'bg-gray-100 text-gray-800',
                    }

                    return (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session.id)}
                        className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 ${
                          statusColors[session.status]
                        } ${selectedSession === session.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="font-medium truncate">{topic?.title || 'Unknown'}</div>
                        <div className="text-xs opacity-75">
                          {session.plannedMinutes} min
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSessionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Session Details</h2>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {(() => {
              const topic = topics.find((t) => t.id === selectedSessionData.topicId)
              return (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Topic</div>
                    <div className="font-medium">{topic?.title || 'Unknown Topic'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-medium">
                      {format(parseISO(selectedSessionData.date), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Planned Minutes</div>
                    <div className="font-medium">{selectedSessionData.plannedMinutes} min</div>
                  </div>
                  {selectedSessionData.status === 'done' && (
                    <div>
                      <div className="text-sm text-gray-600">Actual Minutes</div>
                      <input
                        type="number"
                        value={selectedSessionData.actualMinutes || selectedSessionData.plannedMinutes}
                        onChange={(e) =>
                          handleActualMinutesChange(
                            selectedSessionData.id,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Status</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedSessionData.id, 'done')}
                        className={`flex-1 px-4 py-2 rounded ${
                          selectedSessionData.status === 'done'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Done
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedSessionData.id, 'skipped')}
                        className={`flex-1 px-4 py-2 rounded ${
                          selectedSessionData.status === 'skipped'
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedSessionData.id, 'planned')}
                        className={`flex-1 px-4 py-2 rounded ${
                          selectedSessionData.status === 'planned'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* All Sessions List */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">All Sessions</h2>
        {sessions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              No sessions scheduled. Generate a plan from the Dashboard.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {sessions
              .sort((a, b) => (a.date < b.date ? -1 : 1))
              .map((session) => {
                const topic = topics.find((t) => t.id === session.topicId)
                const statusColors = {
                  planned: 'bg-blue-100 text-blue-800',
                  done: 'bg-green-100 text-green-800',
                  skipped: 'bg-gray-100 text-gray-800',
                }

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{topic?.title || 'Unknown Topic'}</div>
                        <div className="text-sm text-gray-500">
                          {format(parseISO(session.date), 'MMMM d, yyyy')} •{' '}
                          {session.plannedMinutes} min
                          {session.actualMinutes &&
                            session.actualMinutes !== session.plannedMinutes && (
                              <> • Actual: {session.actualMinutes} min</>
                            )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-sm ${statusColors[session.status]}`}
                      >
                        {session.status}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
