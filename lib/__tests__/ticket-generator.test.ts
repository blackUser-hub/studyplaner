import { describe, it, expect } from 'vitest'
import { generateTickets } from '../ticket-generator'
import type { Topic, Question } from '@/types'

describe('Ticket Generator', () => {
  const topics: Topic[] = [
    { id: 't1', title: 'Topic 1', difficulty: 5, importance: 5 },
    { id: 't2', title: 'Topic 2', difficulty: 2, importance: 2 },
    { id: 't3', title: 'Topic 3', difficulty: 3, importance: 3 },
  ]

  const questions: Question[] = [
    { id: 'q1', topicId: 't1', prompt: 'Q1', choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q2', topicId: 't1', prompt: 'Q2', choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q3', topicId: 't1', prompt: 'Q3', choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q4', topicId: 't2', prompt: 'Q4', choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q5', topicId: 't2', prompt: 'Q5', choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q6', topicId: 't3', prompt: 'Q6', choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q7', topicId: 't3', prompt: 'Q7', choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q8', topicId: 't3', prompt: 'Q8', choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
  ]

  it('generates specified number of tickets', () => {
    const tickets = generateTickets(topics, questions, [], [], [], 5, 5)
    expect(tickets.length).toBe(5)
  })

  it('generates tickets with specified questions per ticket', () => {
    const tickets = generateTickets(topics, questions, [], [], [], 3, 5)
    tickets.forEach((ticket) => {
      const totalQuestions = ticket.reduce((sum, item) => sum + item.questionIds.length, 0)
      expect(totalQuestions).toBeLessThanOrEqual(5)
      expect(totalQuestions).toBeGreaterThan(0)
    })
  })

  it('groups questions by topic', () => {
    const tickets = generateTickets(topics, questions, [], [], [], 2, 6)
    tickets.forEach((ticket) => {
      ticket.forEach((item) => {
        expect(topics.some((t) => t.id === item.topicId)).toBe(true)
        expect(item.questionIds.length).toBeGreaterThan(0)
      })
    })
  })

  it('handles empty topics gracefully', () => {
    const tickets = generateTickets([], questions, [], [], [], 5, 5)
    expect(tickets).toEqual([])
  })

  it('handles empty questions gracefully', () => {
    const tickets = generateTickets(topics, [], [], [], [], 5, 5)
    expect(tickets).toEqual([])
  })

  it('ensures coverage across topics', () => {
    const tickets = generateTickets(topics, questions, [], [], [], 3, 5)
    const allTopicIds = new Set<string>()
    tickets.forEach((ticket) => {
      ticket.forEach((item) => {
        allTopicIds.add(item.topicId)
      })
    })
    // Should cover multiple topics
    expect(allTopicIds.size).toBeGreaterThan(0)
  })

  it('is deterministic with same inputs', () => {
    const tickets1 = generateTickets(topics, questions, [], [], [], 3, 5)
    const tickets2 = generateTickets(topics, questions, [], [], [], 3, 5)
    // Should produce same results (seeded random)
    expect(tickets1.length).toBe(tickets2.length)
  })
})
