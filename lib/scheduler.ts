import { addDays, format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'
import type { ExamConfig, Topic, StudySession, QuizAttempt, Flashcard } from '@/types'
import { calculateMastery } from './mastery'

export function generateSessions(
  config: ExamConfig,
  topics: Topic[],
  doneSessions: StudySession[],
  quizAttempts: QuizAttempt[],
  flashcards: Flashcard[]
): StudySession[] {
  if (topics.length === 0) return []

  const startDate = parseISO(config.startDate)
  const examDate = parseISO(config.examDate)
  const sessions: StudySession[] = []

  // Calculate mastery for each topic
  const topicMastery = new Map<string, number>()
  topics.forEach((topic) => {
    topicMastery.set(
      topic.id,
      calculateMastery(topic.id, quizAttempts, flashcards, doneSessions)
    )
  })

  // Calculate weights: importance * difficulty * (1 - mastery)
  const topicWeights = new Map<string, number>()
  topics.forEach((topic) => {
    const mastery = topicMastery.get(topic.id) ?? 0
    const weight = topic.importance * topic.difficulty * (1 - mastery)
    topicWeights.set(topic.id, weight)
  })

  const totalWeight = Array.from(topicWeights.values()).reduce((sum, w) => sum + w, 0)
  if (totalWeight === 0) {
    // Fallback: equal distribution
    topics.forEach((topic) => {
      topicWeights.set(topic.id, 1)
    })
  }

  // Generate dates (only allowed days of week)
  const dates: Date[] = []
  let currentDate = startOfDay(startDate)
  while (isBefore(currentDate, examDate) || format(currentDate, 'yyyy-MM-dd') === format(examDate, 'yyyy-MM-dd')) {
    const dayOfWeek = currentDate.getDay()
    if (config.daysOfWeek.includes(dayOfWeek)) {
      dates.push(new Date(currentDate))
    }
    currentDate = addDays(currentDate, 1)
  }

  // Ensure each topic appears at least once per week
  const weeks = Math.ceil(dates.length / 7)
  const minSessionsPerTopic = Math.max(1, Math.floor(weeks))

  // Track sessions per topic
  const sessionsPerTopic = new Map<string, number>()
  topics.forEach((topic) => {
    sessionsPerTopic.set(topic.id, 0)
  })

  // First pass: ensure minimum coverage
  let dateIndex = 0
  for (let week = 0; week < weeks && dateIndex < dates.length; week++) {
    const weekTopics = [...topics].sort((a, b) => {
      const aCount = sessionsPerTopic.get(a.id) ?? 0
      const bCount = sessionsPerTopic.get(b.id) ?? 0
      return aCount - bCount
    })

    for (const topic of weekTopics) {
      if (dateIndex >= dates.length) break
      const count = sessionsPerTopic.get(topic.id) ?? 0
      if (count < minSessionsPerTopic) {
        const weight = topicWeights.get(topic.id) ?? 1
        const minutes = Math.round((weight / totalWeight) * config.minutesPerDay)
        sessions.push({
          id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: format(dates[dateIndex], 'yyyy-MM-dd'),
          topicId: topic.id,
          plannedMinutes: Math.max(10, minutes),
          status: 'planned',
        })
        sessionsPerTopic.set(topic.id, count + 1)
        dateIndex++
      }
    }
  }

  // Second pass: fill remaining dates with weighted distribution
  const remainingDates = dates.slice(dateIndex)
  for (const date of remainingDates) {
    // Select topic based on weights
    const weights = Array.from(topicWeights.entries())
    const total = weights.reduce((sum, [, w]) => sum + w, 0)
    let random = Math.random() * total
    let selectedTopicId = topics[0].id

    for (const [topicId, weight] of weights) {
      random -= weight
      if (random <= 0) {
        selectedTopicId = topicId
        break
      }
    }

    const weight = topicWeights.get(selectedTopicId) ?? 1
    const minutes = Math.round((weight / totalWeight) * config.minutesPerDay)
    sessions.push({
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: format(date, 'yyyy-MM-dd'),
      topicId: selectedTopicId,
      plannedMinutes: Math.max(10, minutes),
      status: 'planned',
    })
  }

  return sessions
}
