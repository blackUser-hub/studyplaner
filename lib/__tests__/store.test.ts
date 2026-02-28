import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../store'
import type { Topic, ExamConfig, Flashcard, Question } from '@/types'

describe('Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.getState().resetData()
  })

  it('adds topic', () => {
    const { addTopic, topics } = useStore.getState()
    addTopic({ title: 'Test Topic', difficulty: 3, importance: 4 })
    expect(topics.length).toBe(1)
    expect(topics[0].title).toBe('Test Topic')
  })

  it('updates topic', () => {
    const { addTopic, updateTopic, topics } = useStore.getState()
    addTopic({ title: 'Test Topic', difficulty: 3, importance: 4 })
    const topicId = topics[0].id
    updateTopic(topicId, { difficulty: 5 })
    expect(topics.find((t) => t.id === topicId)?.difficulty).toBe(5)
  })

  it('deletes topic', () => {
    const { addTopic, deleteTopic, topics } = useStore.getState()
    addTopic({ title: 'Test Topic', difficulty: 3, importance: 4 })
    const topicId = topics[0].id
    deleteTopic(topicId)
    expect(topics.length).toBe(0)
  })

  it('bulk adds topics', () => {
    const { bulkAddTopics, topics } = useStore.getState()
    bulkAddTopics(['Topic 1', 'Topic 2', 'Topic 3'])
    expect(topics.length).toBe(3)
  })

  it('sets exam config', () => {
    const { setExamConfig, examConfig } = useStore.getState()
    const config: ExamConfig = {
      examDate: '2024-12-31',
      minutesPerDay: 120,
      daysOfWeek: [1, 2, 3, 4, 5],
      startDate: '2024-01-01',
    }
    setExamConfig(config)
    expect(examConfig?.examDate).toBe('2024-12-31')
  })

  it('adds flashcard', () => {
    const { addFlashcard, flashcards } = useStore.getState()
    addFlashcard({ topicId: 't1', front: 'Q', back: 'A' })
    expect(flashcards.length).toBe(1)
    expect(flashcards[0].streak).toBe(0)
  })

  it('adds question', () => {
    const { addQuestion, questions } = useStore.getState()
    addQuestion({
      topicId: 't1',
      prompt: 'Test?',
      choices: ['A', 'B', 'C', 'D'],
      answerIndex: 0,
    })
    expect(questions.length).toBe(1)
  })

  it('exports and imports data', () => {
    const { addTopic, exportData, importData, topics } = useStore.getState()
    addTopic({ title: 'Test Topic', difficulty: 3, importance: 4 })
    const exported = exportData()
    expect(exported.topics.length).toBe(1)
    
    useStore.getState().resetData()
    expect(useStore.getState().topics.length).toBe(0)
    
    importData(exported)
    expect(useStore.getState().topics.length).toBe(1)
  })

  it('resets data', () => {
    const { addTopic, resetData, topics } = useStore.getState()
    addTopic({ title: 'Test Topic', difficulty: 3, importance: 4 })
    expect(topics.length).toBe(1)
    resetData()
    expect(useStore.getState().topics.length).toBe(0)
  })
})
