import { describe, it, expect } from 'vitest'
import { updateFlashcardAfterReview, getDueFlashcards } from '../spaced-repetition'
import type { Flashcard } from '@/types'
import { format, addDays } from 'date-fns'

describe('Spaced Repetition', () => {
  const baseCard: Flashcard = {
    id: 'f1',
    topicId: 't1',
    front: 'Question',
    back: 'Answer',
    streak: 0,
    easeScore: 0.5,
  }

  it('increases streak and due date when known', () => {
    const updates = updateFlashcardAfterReview(baseCard, true)
    expect(updates.streak).toBe(1)
    expect(updates.easeScore).toBeGreaterThan(baseCard.easeScore!)
    expect(updates.dueAt).toBeDefined()
  })

  it('resets streak when not known', () => {
    const cardWithStreak = { ...baseCard, streak: 5 }
    const updates = updateFlashcardAfterReview(cardWithStreak, false)
    expect(updates.streak).toBe(0)
    expect(updates.easeScore).toBeLessThan(cardWithStreak.easeScore!)
  })

  it('sets due date to tomorrow when not known', () => {
    const updates = updateFlashcardAfterReview(baseCard, false)
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
    expect(updates.dueAt).toBe(tomorrow)
  })

  it('caps due date at 30 days', () => {
    const cardWithHighStreak = { ...baseCard, streak: 10 }
    const updates = updateFlashcardAfterReview(cardWithHighStreak, true)
    const dueDate = updates.dueAt!
    const parsed = new Date(dueDate)
    const maxDate = addDays(new Date(), 30)
    expect(parsed.getTime()).toBeLessThanOrEqual(maxDate.getTime())
  })

  it('calculates due date as 2^streak days', () => {
    const card = { ...baseCard, streak: 2 }
    const updates = updateFlashcardAfterReview(card, true)
    const dueDate = updates.dueAt!
    const parsed = new Date(dueDate)
    const expected = addDays(new Date(), Math.min(Math.pow(2, 3), 30)) // streak becomes 3
    expect(Math.abs(parsed.getTime() - expected.getTime())).toBeLessThan(24 * 60 * 60 * 1000) // Within 1 day
  })

  it('updates lastReviewedAt', () => {
    const updates = updateFlashcardAfterReview(baseCard, true)
    expect(updates.lastReviewedAt).toBe(format(new Date(), 'yyyy-MM-dd'))
  })

  it('filters due flashcards', () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

    const cards: Flashcard[] = [
      { ...baseCard, id: 'f1', dueAt: yesterday }, // Due
      { ...baseCard, id: 'f2', dueAt: today }, // Due
      { ...baseCard, id: 'f3', dueAt: tomorrow }, // Not due
      { ...baseCard, id: 'f4' }, // Never reviewed, due
    ]

    const due = getDueFlashcards(cards)
    expect(due.length).toBe(3)
    expect(due.map((c) => c.id)).toContain('f1')
    expect(due.map((c) => c.id)).toContain('f2')
    expect(due.map((c) => c.id)).toContain('f4')
    expect(due.map((c) => c.id)).not.toContain('f3')
  })
})
