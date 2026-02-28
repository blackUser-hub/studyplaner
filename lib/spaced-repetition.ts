import { addDays, parseISO, format } from 'date-fns'
import type { Flashcard } from '@/types'

export function updateFlashcardAfterReview(
  card: Flashcard,
  knewIt: boolean
): Partial<Flashcard> {
  const now = new Date()
  const streak = card.streak ?? 0
  const easeScore = card.easeScore ?? 0.5

  if (knewIt) {
    // Increase streak and ease
    const newStreak = streak + 1
    const newEase = Math.min(1, easeScore + 0.1)
    
    // Calculate next due date: 2^streak days (capped at 30 days)
    const daysToAdd = Math.min(Math.pow(2, newStreak), 30)
    const dueAt = format(addDays(now, daysToAdd), 'yyyy-MM-dd')

    return {
      streak: newStreak,
      easeScore: newEase,
      dueAt,
      lastReviewedAt: format(now, 'yyyy-MM-dd'),
    }
  } else {
    // Reset streak, reduce ease slightly, due tomorrow
    const newEase = Math.max(0.1, easeScore - 0.1)
    const dueAt = format(addDays(now, 1), 'yyyy-MM-dd')

    return {
      streak: 0,
      easeScore: newEase,
      dueAt,
      lastReviewedAt: format(now, 'yyyy-MM-dd'),
    }
  }
}

export function getDueFlashcards(flashcards: Flashcard[]): Flashcard[] {
  const today = format(new Date(), 'yyyy-MM-dd')
  return flashcards.filter((card) => {
    if (!card.dueAt) return true // Never reviewed
    return card.dueAt <= today
  })
}
