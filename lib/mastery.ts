import type { Topic, QuizAttempt, Flashcard, StudySession } from '@/types'
import { format, isAfter, parseISO } from 'date-fns'

export function calculateMastery(
  topicId: string,
  quizAttempts: QuizAttempt[],
  flashcards: Flashcard[],
  sessions: StudySession[]
): number {
  // Quiz component (0-0.4)
  const topicAttempts = quizAttempts.filter((a) => a.topicId === topicId)
  const quizScore =
    topicAttempts.length > 0
      ? topicAttempts.reduce((sum, a) => sum + a.score, 0) / topicAttempts.length
      : 0.5 // default if no attempts
  const quizComponent = quizScore * 0.4

  // Flashcard component (0-0.3)
  const topicCards = flashcards.filter((f) => f.topicId === topicId)
  const flashcardScore =
    topicCards.length > 0
      ? topicCards.reduce((sum, f) => {
          const ease = f.easeScore ?? 0.5
          const streak = f.streak ?? 0
          return sum + ease * (1 + streak * 0.1)
        }, 0) / topicCards.length
      : 0.5
  const flashcardComponent = Math.min(flashcardScore / 2, 0.3)

  // Completion component (0-0.3)
  const topicSessions = sessions.filter((s) => s.topicId === topicId)
  const completedSessions = topicSessions.filter((s) => s.status === 'done')
  const completionRate =
    topicSessions.length > 0 ? completedSessions.length / topicSessions.length : 0
  const completionComponent = completionRate * 0.3

  return Math.min(quizComponent + flashcardComponent + completionComponent, 1)
}

export function calculateRiskScore(
  topic: Topic,
  mastery: number,
  quizAttempts: QuizAttempt[],
  sessions: StudySession[]
): number {
  // Mastery component (0-0.6)
  const masteryComponent = (1 - mastery) * 0.6

  // Missed sessions component (0-0.2)
  const topicSessions = sessions.filter((s) => s.topicId === topic.id)
  const missedSessions = topicSessions.filter(
    (s) => s.status === 'skipped' || (s.status === 'planned' && isAfter(new Date(), parseISO(s.date)))
  )
  const missedRate = topicSessions.length > 0 ? missedSessions.length / topicSessions.length : 0
  const missedComponent = missedRate * 0.2

  // Low quiz score component (0-0.2)
  const topicAttempts = quizAttempts.filter((a) => a.topicId === topic.id)
  const avgScore = topicAttempts.length > 0
    ? topicAttempts.reduce((sum, a) => sum + a.score, 0) / topicAttempts.length
    : 0.5
  const lowScoreComponent = (1 - avgScore) * 0.2

  return masteryComponent + missedComponent + lowScoreComponent
}

export function getWeakTopics(
  topics: Topic[],
  quizAttempts: QuizAttempt[],
  flashcards: Flashcard[],
  sessions: StudySession[],
  limit: number = 5
): Array<{ topic: Topic; riskScore: number; mastery: number; suggestion: string }> {
  const results = topics.map((topic) => {
    const mastery = calculateMastery(topic.id, quizAttempts, flashcards, sessions)
    const riskScore = calculateRiskScore(topic, mastery, quizAttempts, sessions)
    
    let suggestion = 'Schedule extra session'
    const topicAttempts = quizAttempts.filter((a) => a.topicId === topic.id)
    const topicCards = flashcards.filter((f) => f.topicId === topic.id)
    
    if (topicAttempts.length === 0) {
      suggestion = 'Do quiz'
    } else if (topicCards.length === 0) {
      suggestion = 'Create flashcards'
    } else if (mastery < 0.3) {
      suggestion = 'Review cards'
    }

    return { topic, riskScore, mastery, suggestion }
  })

  return results.sort((a, b) => b.riskScore - a.riskScore).slice(0, limit)
}
