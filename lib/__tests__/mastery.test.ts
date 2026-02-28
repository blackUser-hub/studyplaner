import { describe, it, expect } from 'vitest'
import { calculateMastery, calculateRiskScore, getWeakTopics } from '../mastery'
import type { Topic, QuizAttempt, Flashcard, StudySession } from '@/types'

describe('Mastery Calculation', () => {
  const topic: Topic = { id: 't1', title: 'Test Topic', difficulty: 3, importance: 4 }

  it('calculates mastery from quiz attempts', () => {
    const attempts: QuizAttempt[] = [
      { id: 'a1', topicId: 't1', date: '2024-01-01', score: 0.8, total: 10, wrongQuestionIds: [] },
      { id: 'a2', topicId: 't1', date: '2024-01-02', score: 0.9, total: 10, wrongQuestionIds: [] },
    ]
    const mastery = calculateMastery('t1', attempts, [], [])
    expect(mastery).toBeGreaterThan(0)
    expect(mastery).toBeLessThanOrEqual(1)
    // Should be around 0.4 * 0.85 = 0.34 (quiz component)
    expect(mastery).toBeGreaterThan(0.3)
  })

  it('calculates mastery from flashcards', () => {
    const flashcards: Flashcard[] = [
      {
        id: 'f1',
        topicId: 't1',
        front: 'Q',
        back: 'A',
        easeScore: 0.8,
        streak: 3,
      },
    ]
    const mastery = calculateMastery('t1', [], flashcards, [])
    expect(mastery).toBeGreaterThan(0)
    expect(mastery).toBeLessThanOrEqual(1)
  })

  it('calculates mastery from completion', () => {
    const sessions: StudySession[] = [
      { id: 's1', date: '2024-01-01', topicId: 't1', plannedMinutes: 60, status: 'done' },
      { id: 's2', date: '2024-01-02', topicId: 't1', plannedMinutes: 60, status: 'done' },
      { id: 's3', date: '2024-01-03', topicId: 't1', plannedMinutes: 60, status: 'planned' },
    ]
    const mastery = calculateMastery('t1', [], [], sessions)
    // Completion component: 2/3 * 0.3 = 0.2
    expect(mastery).toBeCloseTo(0.2, 1)
  })

  it('combines all components', () => {
    const attempts: QuizAttempt[] = [
      { id: 'a1', topicId: 't1', date: '2024-01-01', score: 0.8, total: 10, wrongQuestionIds: [] },
    ]
    const flashcards: Flashcard[] = [
      { id: 'f1', topicId: 't1', front: 'Q', back: 'A', easeScore: 0.7, streak: 2 },
    ]
    const sessions: StudySession[] = [
      { id: 's1', date: '2024-01-01', topicId: 't1', plannedMinutes: 60, status: 'done' },
    ]
    const mastery = calculateMastery('t1', attempts, flashcards, sessions)
    expect(mastery).toBeGreaterThan(0.3)
    expect(mastery).toBeLessThanOrEqual(1)
  })

  it('returns default for topic with no data', () => {
    const mastery = calculateMastery('t1', [], [], [])
    // Should have some default value
    expect(mastery).toBeGreaterThanOrEqual(0)
    expect(mastery).toBeLessThanOrEqual(1)
  })
})

describe('Risk Score Calculation', () => {
  const topic: Topic = { id: 't1', title: 'Test Topic', difficulty: 3, importance: 4 }

  it('calculates risk from low mastery', () => {
    const risk = calculateRiskScore(topic, 0.2, [], [])
    expect(risk).toBeGreaterThan(0.4) // (1-0.2)*0.6 = 0.48
  })

  it('calculates risk from missed sessions', () => {
    const sessions: StudySession[] = [
      { id: 's1', date: '2024-01-01', topicId: 't1', plannedMinutes: 60, status: 'skipped' },
      { id: 's2', date: '2024-01-02', topicId: 't1', plannedMinutes: 60, status: 'skipped' },
    ]
    const risk = calculateRiskScore(topic, 0.5, [], sessions)
    expect(risk).toBeGreaterThan(0.3)
  })

  it('calculates risk from low quiz scores', () => {
    const attempts: QuizAttempt[] = [
      { id: 'a1', topicId: 't1', date: '2024-01-01', score: 0.3, total: 10, wrongQuestionIds: [] },
    ]
    const risk = calculateRiskScore(topic, 0.5, attempts, [])
    expect(risk).toBeGreaterThan(0.3)
  })

  it('combines all risk factors', () => {
    const attempts: QuizAttempt[] = [
      { id: 'a1', topicId: 't1', date: '2024-01-01', score: 0.4, total: 10, wrongQuestionIds: [] },
    ]
    const sessions: StudySession[] = [
      { id: 's1', date: '2024-01-01', topicId: 't1', plannedMinutes: 60, status: 'skipped' },
    ]
    const risk = calculateRiskScore(topic, 0.3, attempts, sessions)
    expect(risk).toBeGreaterThan(0.5)
    expect(risk).toBeLessThanOrEqual(1)
  })
})

describe('Weak Topics', () => {
  const topics: Topic[] = [
    { id: 't1', title: 'Weak Topic', difficulty: 5, importance: 5 },
    { id: 't2', title: 'Strong Topic', difficulty: 2, importance: 2 },
  ]

  it('ranks topics by risk score', () => {
    const weak = getWeakTopics(topics, [], [], [], 2)
    expect(weak.length).toBe(2)
    expect(weak[0].riskScore).toBeGreaterThanOrEqual(weak[1].riskScore)
  })

  it('provides suggestions', () => {
    const weak = getWeakTopics(topics, [], [], [], 2)
    weak.forEach((w) => {
      expect(['Do quiz', 'Create flashcards', 'Review cards', 'Schedule extra session']).toContain(
        w.suggestion
      )
    })
  })

  it('limits results', () => {
    const manyTopics = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      title: `Topic ${i}`,
      difficulty: 3,
      importance: 3,
    }))
    const weak = getWeakTopics(manyTopics, [], [], [], 5)
    expect(weak.length).toBe(5)
  })
})
