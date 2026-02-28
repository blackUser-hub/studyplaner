import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Topic,
  ExamConfig,
  StudySession,
  Flashcard,
  Question,
  QuizAttempt,
  Ticket,
  AppData,
} from '@/types'
import { generateSessions } from './scheduler'

interface StoreState {
  topics: Topic[]
  examConfig: ExamConfig | null
  sessions: StudySession[]
  flashcards: Flashcard[]
  questions: Question[]
  quizAttempts: QuizAttempt[]
  tickets: Ticket[]

  // Topics
  addTopic: (topic: Omit<Topic, 'id'>) => void
  updateTopic: (id: string, updates: Partial<Topic>) => void
  deleteTopic: (id: string) => void
  bulkAddTopics: (titles: string[]) => void

  // Exam Config
  setExamConfig: (config: ExamConfig) => void

  // Sessions
  addSession: (session: Omit<StudySession, 'id'>) => void
  updateSession: (id: string, updates: Partial<StudySession>) => void
  deleteSession: (id: string) => void
  generatePlan: () => void

  // Flashcards
  addFlashcard: (card: Omit<Flashcard, 'id'>) => void
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void
  deleteFlashcard: (id: string) => void

  // Questions
  addQuestion: (question: Omit<Question, 'id'>) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void

  // Quiz Attempts
  addQuizAttempt: (attempt: Omit<QuizAttempt, 'id'>) => void

  // Tickets
  addTicket: (ticket: Omit<Ticket, 'id'>) => void
  deleteTicket: (id: string) => void

  // Import/Export
  importData: (data: AppData) => void
  exportData: () => AppData
  resetData: () => void
}

const defaultState = {
  topics: [],
  examConfig: null,
  sessions: [],
  flashcards: [],
  questions: [],
  quizAttempts: [],
  tickets: [],
}

// Custom storage for SSR compatibility
const storage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(name, value)
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(name)
    } catch {
      // Ignore storage errors
    }
  },
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addTopic: (topic) => {
        const id = `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          topics: [...state.topics, { ...topic, id }],
        }))
      },

      updateTopic: (id, updates) => {
        set((state) => ({
          topics: state.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTopic: (id) => {
        set((state) => ({
          topics: state.topics.filter((t) => t.id !== id),
          sessions: state.sessions.filter((s) => s.topicId !== id),
          flashcards: state.flashcards.filter((f) => f.topicId !== id),
        }))
      },

      bulkAddTopics: (titles) => {
        const newTopics = titles
          .map((title) => title.trim())
          .filter((title) => title.length > 0)
          .map((title) => ({
            id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            difficulty: 3,
            importance: 3,
          }))
        set((state) => ({
          topics: [...state.topics, ...newTopics],
        }))
      },

      setExamConfig: (config) => {
        set({ examConfig: config })
      },

      addSession: (session) => {
        const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          sessions: [...state.sessions, { ...session, id }],
        }))
      },

      updateSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }))
      },

      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }))
      },

      generatePlan: () => {
        const { examConfig, topics, sessions, quizAttempts, flashcards } = get()
        if (!examConfig || topics.length === 0) return

        const newSessions = generateSessions(
          examConfig,
          topics,
          sessions.filter((s) => s.status === 'done'),
          quizAttempts,
          flashcards
        )

        // Remove planned sessions, keep done ones
        const doneSessions = sessions.filter((s) => s.status === 'done')
        set({ sessions: [...doneSessions, ...newSessions] })
      },

      addFlashcard: (card) => {
        const id = `flashcard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          flashcards: [...state.flashcards, { ...card, id, streak: 0 }],
        }))
      },

      updateFlashcard: (id, updates) => {
        set((state) => ({
          flashcards: state.flashcards.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }))
      },

      deleteFlashcard: (id) => {
        set((state) => ({
          flashcards: state.flashcards.filter((f) => f.id !== id),
        }))
      },

      addQuestion: (question) => {
        const id = `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          questions: [...state.questions, { ...question, id }],
        }))
      },

      updateQuestion: (id, updates) => {
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }))
      },

      deleteQuestion: (id) => {
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
        }))
      },

      addQuizAttempt: (attempt) => {
        const id = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          quizAttempts: [...state.quizAttempts, { ...attempt, id }],
        }))
      },

      addTicket: (ticket) => {
        const id = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          tickets: [...state.tickets, { ...ticket, id }],
        }))
      },

      deleteTicket: (id) => {
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== id),
        }))
      },

      importData: (data) => {
        set({
          topics: data.topics || [],
          examConfig: data.examConfig || null,
          sessions: data.sessions || [],
          flashcards: data.flashcards || [],
          questions: data.questions || [],
          quizAttempts: data.quizAttempts || [],
          tickets: data.tickets || [],
        })
      },

      exportData: () => {
        const state = get()
        return {
          version: 1,
          topics: state.topics,
          examConfig: state.examConfig || undefined,
          sessions: state.sessions,
          flashcards: state.flashcards,
          questions: state.questions,
          quizAttempts: state.quizAttempts,
          tickets: state.tickets,
        }
      },

      resetData: () => {
        set(defaultState)
      },
    }),
    {
      name: 'study-planner-storage',
      version: 1,
      storage: storage,
    }
  )
)
