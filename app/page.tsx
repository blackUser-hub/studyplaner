'use client'

import { useStore } from '@/lib/store'
import { getWeakTopics } from '@/lib/mastery'
import { format, parseISO, isAfter } from 'date-fns'
import Link from 'next/link'
import { useState } from 'react'
import {
  demoTopics,
  demoQuestions,
  demoFlashcards,
  getDemoExamConfig,
} from '@/lib/demo-data'

export default function Dashboard() {
  const {
    topics,
    examConfig,
    sessions,
    flashcards,
    questions,
    quizAttempts,
    setExamConfig,
    generatePlan,
    importData,
    addTopic,
  } = useStore()

  const [examDate, setExamDate] = useState(
    examConfig?.examDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  )
  const [minutesPerDay, setMinutesPerDay] = useState(examConfig?.minutesPerDay || 120)
  const [daysOfWeek, setDaysOfWeek] = useState(examConfig?.daysOfWeek || [1, 2, 3, 4, 5])

  const weakTopics = getWeakTopics(topics, quizAttempts, flashcards, sessions, 5)

  const upcomingSessions = sessions
    .filter((s) => s.status === 'planned')
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 5)

  const handleLoadDemo = () => {
    importData({
      version: 1,
      topics: demoTopics,
      examConfig: getDemoExamConfig(),
      sessions: [],
      flashcards: demoFlashcards,
      questions: demoQuestions,
      quizAttempts: [],
      tickets: [],
    })
    setExamDate(getDemoExamConfig().examDate)
    setMinutesPerDay(120)
    setDaysOfWeek([1, 2, 3, 4, 5])
  }

  const handleSaveConfig = () => {
    if (!examDate || minutesPerDay <= 0) {
      alert('Please enter valid exam date and minutes per day')
      return
    }
    setExamConfig({
      examDate,
      minutesPerDay,
      daysOfWeek,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    })
  }

  const handleGeneratePlan = () => {
    if (!examConfig) {
      alert('Please save exam configuration first')
      return
    }
    if (topics.length === 0) {
      alert('Please add topics first')
      return
    }
    generatePlan()
    alert('Study plan generated! Check the Calendar page.')
  }

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day))
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort())
    }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Plan your exam preparation</p>
      </div>

      {/* Demo Data Button */}
      {topics.length === 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Get Started</h2>
          <p className="text-blue-800 mb-4">
            Load demo data to see the app in action with sample topics, questions, and flashcards.
          </p>
          <button
            onClick={handleLoadDemo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Load Demo Data
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Exam Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minutes per Day
              </label>
              <input
                type="number"
                value={minutesPerDay}
                onChange={(e) => setMinutesPerDay(parseInt(e.target.value) || 0)}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Days
              </label>
              <div className="flex gap-2 flex-wrap">
                {dayNames.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={`px-3 py-1 rounded ${
                      daysOfWeek.includes(idx)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveConfig}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Configuration
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={!examConfig || topics.length === 0}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Generate Plan
              </button>
            </div>
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Weak Topics</h2>
          {weakTopics.length === 0 ? (
            <p className="text-gray-500">No topics yet. Add topics to get started.</p>
          ) : (
            <div className="space-y-3">
              {weakTopics.map(({ topic, riskScore, mastery, suggestion }) => (
                <div
                  key={topic.id}
                  className="border border-gray-200 rounded p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{topic.title}</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(mastery * 100)}% mastery
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Risk: {Math.round(riskScore * 100)}% • {suggestion}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${riskScore * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
          <Link
            href="/calendar"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <p className="text-gray-500">
            {sessions.length === 0
              ? 'No sessions scheduled. Generate a plan to get started.'
              : 'All upcoming sessions completed!'}
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingSessions.map((session) => {
              const topic = topics.find((t) => t.id === session.topicId)
              return (
                <div
                  key={session.id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div>
                    <span className="font-medium">{topic?.title || 'Unknown Topic'}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {format(parseISO(session.date), 'MMM d, yyyy')} •{' '}
                      {session.plannedMinutes} min
                    </span>
                  </div>
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Planned
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{topics.length}</div>
          <div className="text-sm text-gray-600">Topics</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {sessions.filter((s) => s.status === 'done').length}
          </div>
          <div className="text-sm text-gray-600">Completed Sessions</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{flashcards.length}</div>
          <div className="text-sm text-gray-600">Flashcards</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{questions.length}</div>
          <div className="text-sm text-gray-600">Questions</div>
        </div>
      </div>
    </div>
  )
}
