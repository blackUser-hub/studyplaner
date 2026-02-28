export interface Topic {
  id: string
  title: string
  category?: string
  difficulty: number // 1-5
  importance: number // 1-5
  estimatedMinutes?: number
  notes?: string
}

export interface ExamConfig {
  examDate: string // ISO date
  minutesPerDay: number
  daysOfWeek: number[] // 0-6 (Sunday-Saturday)
  startDate: string // ISO date, default today
}

export type SessionStatus = 'planned' | 'done' | 'skipped'

export interface StudySession {
  id: string
  date: string // ISO date
  topicId: string
  plannedMinutes: number
  status: SessionStatus
  actualMinutes?: number
}

export interface Flashcard {
  id: string
  topicId: string
  front: string
  back: string
  lastReviewedAt?: string // ISO date
  easeScore?: number // for spaced repetition
  dueAt?: string // ISO date
  streak?: number // consecutive correct reviews
}

export interface Question {
  id: string
  topicId: string
  prompt: string
  choices: string[] // exactly 4 choices
  answerIndex: number // 0-3
  explanation?: string
}

export interface QuizAttempt {
  id: string
  topicId: string
  date: string // ISO date
  score: number // 0-1
  total: number
  wrongQuestionIds: string[]
}

export interface Ticket {
  id: string
  createdAt: string // ISO date
  items: Array<{
    topicId: string
    questionIds: string[]
  }>
}

export interface AppData {
  version: number
  topics: Topic[]
  examConfig?: ExamConfig
  sessions: StudySession[]
  flashcards: Flashcard[]
  questions: Question[]
  quizAttempts: QuizAttempt[]
  tickets: Ticket[]
}
