'use client'

import { useStore } from '@/lib/store'
import { getDueFlashcards, updateFlashcardAfterReview } from '@/lib/spaced-repetition'
import { useState } from 'react'

export default function FlashcardsPage() {
  const { flashcards, topics, addFlashcard, updateFlashcard, deleteFlashcard } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')
  const [formData, setFormData] = useState({
    topicId: '',
    front: '',
    back: '',
  })

  const dueCards = getDueFlashcards(flashcards)
  const reviewCards = reviewMode ? dueCards : flashcards

  const currentCard = reviewCards[currentCardIndex]

  const handleAdd = () => {
    if (!formData.topicId || !formData.front.trim() || !formData.back.trim()) {
      alert('Please fill in all fields')
      return
    }
    addFlashcard({
      topicId: formData.topicId,
      front: formData.front,
      back: formData.back,
    })
    setFormData({ topicId: '', front: '', back: '' })
    setShowAddForm(false)
  }

  const handleReview = (knewIt: boolean) => {
    if (!currentCard) return

    const updates = updateFlashcardAfterReview(currentCard, knewIt)
    updateFlashcard(currentCard.id, updates)

    // Move to next card
    if (currentCardIndex < reviewCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowBack(false)
    } else {
      // Finished review
      setReviewMode(false)
      setCurrentCardIndex(0)
      setShowBack(false)
      alert('Review complete!')
    }
  }

  const startReview = () => {
    if (dueCards.length === 0) {
      alert('No cards due for review')
      return
    }
    setReviewMode(true)
    setCurrentCardIndex(0)
    setShowBack(false)
  }

  const flashcardsByTopic = new Map<string, typeof flashcards>()
  flashcards.forEach((card) => {
    if (!flashcardsByTopic.has(card.topicId)) {
      flashcardsByTopic.set(card.topicId, [])
    }
    flashcardsByTopic.get(card.topicId)!.push(card)
  })

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">Create and review flashcards</p>
        </div>
        <div className="flex gap-2">
          {!reviewMode && dueCards.length > 0 && (
            <button
              onClick={startReview}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Review Due ({dueCards.length})
            </button>
          )}
          {reviewMode && (
            <button
              onClick={() => {
                setReviewMode(false)
                setCurrentCardIndex(0)
                setShowBack(false)
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Exit Review
            </button>
          )}
          {!reviewMode && (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setSelectedTopicId('')
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showAddForm ? 'Cancel' : 'Add Flashcard'}
            </button>
          )}
        </div>
      </div>

      {/* Review Mode */}
      {reviewMode && currentCard && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">
                Card {currentCardIndex + 1} of {reviewCards.length}
              </span>
            </div>
            <div className="min-h-[300px] flex flex-col justify-center">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Front</div>
                <div className="text-2xl font-medium p-4 bg-blue-50 rounded-lg">
                  {currentCard.front}
                </div>
              </div>
              {showBack && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">Back</div>
                  <div className="text-xl p-4 bg-green-50 rounded-lg">
                    {currentCard.back}
                  </div>
                </div>
              )}
              {!showBack ? (
                <button
                  onClick={() => setShowBack(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
                >
                  Show Answer
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleReview(false)}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 text-lg"
                  >
                    Don't Know
                  </button>
                  <button
                    onClick={() => handleReview(true)}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-lg"
                  >
                    Know
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && !reviewMode && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add Flashcard</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={formData.topicId}
                onChange={(e) => {
                  setFormData({ ...formData, topicId: e.target.value })
                  setSelectedTopicId(e.target.value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Front</label>
              <textarea
                value={formData.front}
                onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Question or prompt..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Back</label>
              <textarea
                value={formData.back}
                onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Answer or explanation..."
              />
            </div>
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Flashcard
            </button>
          </div>
        </div>
      )}

      {/* Flashcards by Topic */}
      {!reviewMode && (
        <div className="space-y-6">
          {topics.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No topics yet. Add topics first to create flashcards.</p>
            </div>
          ) : flashcards.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No flashcards yet. Create your first flashcard!</p>
            </div>
          ) : (
            topics
              .filter((topic) => flashcardsByTopic.has(topic.id))
              .map((topic) => {
                const topicCards = flashcardsByTopic.get(topic.id)!
                return (
                  <div key={topic.id} className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h2 className="text-lg font-semibold">
                        {topic.title} ({topicCards.length} cards)
                      </h2>
                    </div>
                    <div className="p-4 space-y-3">
                      {topicCards.map((card) => (
                        <div
                          key={card.id}
                          className="border border-gray-200 rounded p-4 hover:bg-gray-50"
                        >
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Front</div>
                              <div className="font-medium">{card.front}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Back</div>
                              <div>{card.back}</div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div>
                              Streak: {card.streak || 0} • Ease: {Math.round((card.easeScore || 0.5) * 100)}%
                              {card.dueAt && ` • Due: ${card.dueAt}`}
                            </div>
                            <button
                              onClick={() => {
                                if (confirm('Delete this flashcard?')) {
                                  deleteFlashcard(card.id)
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      )}
    </div>
  )
}
