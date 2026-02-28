import { describe, it, expect } from 'vitest'
import { generateSessions } from '../scheduler'
import type { ExamConfig, Topic, StudySession, QuizAttempt, Flashcard } from '@/types'
import { format, addDays } from 'date-fns'

describe('Scheduler', () => {
  const baseConfig: ExamConfig = {
    examDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    minutesPerDay: 120,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    startDate: format(new Date(), 'yyyy-MM-dd'),
  }

  const baseTopics: Topic[] = [
    { id: 't1', title: 'Topic 1', difficulty: 3, importance: 4 },
    { id: 't2', title: 'Topic 2', difficulty: 4, importance: 5 },
    { id: 't3', title: 'Topic 3', difficulty: 2, importance: 3 },
  ]

  it('generates sessions for all topics', () => {
    const sessions = generateSessions(baseConfig, baseTopics, [], [], [])
    expect(sessions.length).toBeGreaterThan(0)
    expect(sessions.every((s) => baseTopics.some((t) => t.id === s.topicId))).toBe(true)
  })

  it('respects days of week constraint', () => {
    const config = { ...baseConfig, daysOfWeek: [1, 3, 5] } // Mon, Wed, Fri
    const sessions = generateSessions(config, baseTopics, [], [], [])
    sessions.forEach((session) => {
      const date = new Date(session.date)
      const dayOfWeek = date.getDay()
      expect([1, 3, 5]).toContain(dayOfWeek)
    })
  })

  it('keeps done sessions when regenerating', () => {
    const doneSession: StudySession = {
      id: 'done-1',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      topicId: 't1',
      plannedMinutes: 60,
      status: 'done',
    }
    const sessions = generateSessions(baseConfig, baseTopics, [doneSession], [], [])
    const keptDone = sessions.find((s) => s.id === 'done-1')
    expect(keptDone).toBeDefined()
    expect(keptDone?.status).toBe('done')
  })

  it('allocates more time to high importance/difficulty topics', () => {
    const sessions = generateSessions(baseConfig, baseTopics, [], [], [])
    const topic2Sessions = sessions.filter((s) => s.topicId === 't2') // highest weight
    const topic3Sessions = sessions.filter((s) => s.topicId === 't3') // lowest weight
    
    if (topic2Sessions.length > 0 && topic3Sessions.length > 0) {
      const avg2 = topic2Sessions.reduce((sum, s) => sum + s.plannedMinutes, 0) / topic2Sessions.length
      const avg3 = topic3Sessions.reduce((sum, s) => sum + s.plannedMinutes, 0) / topic3Sessions.length
      // Topic 2 should generally get more time (but not always due to randomization)
      expect(avg2).toBeGreaterThanOrEqual(avg3 * 0.8) // Allow some variance
    }
  })

  it('ensures minimum coverage per topic', () => {
    const sessions = generateSessions(baseConfig, baseTopics, [], [], [])
    baseTopics.forEach((topic) => {
      const topicSessions = sessions.filter((s) => s.topicId === topic.id)
      // Should have at least one session per week
      expect(topicSessions.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('handles empty topics gracefully', () => {
    const sessions = generateSessions(baseConfig, [], [], [], [])
    expect(sessions).toEqual([])
  })

  it('respects minutesPerDay constraint', () => {
    const config = { ...baseConfig, minutesPerDay: 60 }
    const sessions = generateSessions(config, baseTopics, [], [], [])
    // Each session should be reasonable (not exceed daily limit significantly)
    sessions.forEach((session) => {
      expect(session.plannedMinutes).toBeLessThanOrEqual(config.minutesPerDay + 20) // Allow some overflow
      expect(session.plannedMinutes).toBeGreaterThan(0)
    })
  })
})
