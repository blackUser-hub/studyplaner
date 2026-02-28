import type { Topic, Question, QuizAttempt } from '@/types'
import { calculateMastery } from './mastery'

export function generateTickets(
  topics: Topic[],
  questions: Question[],
  quizAttempts: QuizAttempt[],
  flashcards: any[],
  sessions: any[],
  numTickets: number,
  questionsPerTicket: number
): Array<{ topicId: string; questionIds: string[] }[]> {
  if (topics.length === 0 || questions.length === 0) return []

  // Calculate mastery for risk weighting
  const topicMastery = new Map<string, number>()
  topics.forEach((topic) => {
    topicMastery.set(
      topic.id,
      calculateMastery(topic.id, quizAttempts, flashcards, sessions)
    )
  })

  // Group questions by topic
  const questionsByTopic = new Map<string, Question[]>()
  topics.forEach((topic) => {
    questionsByTopic.set(
      topic.id,
      questions.filter((q) => q.topicId === topic.id)
    )
  })

  // Calculate weights (higher weight for weaker topics)
  const topicWeights = new Map<string, number>()
  topics.forEach((topic) => {
    const mastery = topicMastery.get(topic.id) ?? 0
    const weight = (1 - mastery) * topic.importance * topic.difficulty
    topicWeights.set(topic.id, weight)
  })

  const tickets: Array<{ topicId: string; questionIds: string[] }[]> = []

  // Use seeded random for deterministic results
  let seed = 12345
  function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  for (let i = 0; i < numTickets; i++) {
    const ticket: Array<{ topicId: string; questionIds: string[] }> = []
    const usedQuestions = new Set<string>()

    // Distribute questions across topics based on weights
    const weights = Array.from(topicWeights.entries())
    const totalWeight = weights.reduce((sum, [, w]) => sum + w, 0)

    for (let j = 0; j < questionsPerTicket; j++) {
      // Select topic
      let random = seededRandom() * totalWeight
      let selectedTopicId = topics[0].id

      for (const [topicId, weight] of weights) {
        random -= weight
        if (random <= 0) {
          selectedTopicId = topicId
          break
        }
      }

      // Select question from topic
      const topicQuestions = questionsByTopic.get(selectedTopicId) ?? []
      const availableQuestions = topicQuestions.filter((q) => !usedQuestions.has(q.id))
      
      if (availableQuestions.length === 0) {
        // Fallback: use any question from this topic
        const fallbackQuestions = topicQuestions.filter((q) => !usedQuestions.has(q.id))
        if (fallbackQuestions.length === 0) continue
      }

      const selectedQuestion =
        availableQuestions[Math.floor(seededRandom() * availableQuestions.length)]
      
      if (!selectedQuestion) continue

      usedQuestions.add(selectedQuestion.id)

      // Add to ticket (group by topic)
      const existingItem = ticket.find((item) => item.topicId === selectedTopicId)
      if (existingItem) {
        existingItem.questionIds.push(selectedQuestion.id)
      } else {
        ticket.push({
          topicId: selectedTopicId,
          questionIds: [selectedQuestion.id],
        })
      }
    }

    tickets.push(ticket)
  }

  return tickets
}
