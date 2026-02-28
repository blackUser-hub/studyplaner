'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'
import { format } from 'date-fns'
import type { Question } from '@/types'

export default function QuizzesPage() {
  const { topics, questions, quizAttempts, addQuizAttempt } = useStore()
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const availableTopics = topics.filter((topic) => {
    const topicQuestions = questions.filter((q) => q.topicId === topic.id)
    return topicQuestions.length >= 5
  })

  const toggleTopic = (topicId: string) => {
    if (selectedTopicIds.includes(topicId)) {
      setSelectedTopicIds(selectedTopicIds.filter((id) => id !== topicId))
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId])
    }
  }

  const startQuiz = () => {
    if (selectedTopicIds.length === 0) {
      alert('Please select at least one topic')
      return
    }

    // Get questions from selected topics
    const availableQuestions = questions.filter((q) =>
      selectedTopicIds.includes(q.topicId)
    )

    if (availableQuestions.length < 5) {
      alert('Not enough questions. Need at least 5 questions.')
      return
    }

    // Randomly select 5 questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 5)

    setQuizQuestions(selected)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setWrongQuestionIds([])
    setQuizStarted(true)
    setQuizCompleted(false)
  }

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const currentQuestion = quizQuestions[currentQuestionIndex]
    if (answerIndex === currentQuestion.answerIndex) {
      setScore(score + 1)
    } else {
      setWrongQuestionIds([...wrongQuestionIds, currentQuestion.id])
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = () => {
    setQuizCompleted(true)
    // Save attempt for each topic
    selectedTopicIds.forEach((topicId) => {
      const topicQuestions = quizQuestions.filter((q) => q.topicId === topicId)
      const topicScore = topicQuestions.filter(
        (q) => !wrongQuestionIds.includes(q.id)
      ).length
      addQuizAttempt({
        topicId,
        date: format(new Date(), 'yyyy-MM-dd'),
        score: topicScore / quizQuestions.length,
        total: quizQuestions.length,
        wrongQuestionIds: wrongQuestionIds.filter((id) =>
          topicQuestions.some((q) => q.id === id)
        ),
      })
    })
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setQuizCompleted(false)
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setWrongQuestionIds([])
  }

  const currentQuestion = quizQuestions[currentQuestionIndex]

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quizzes</h1>
        <p className="text-gray-600">Test your knowledge with mini-quizzes</p>
      </div>

      {!quizStarted && !quizCompleted && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Topics</h2>
          {availableTopics.length === 0 ? (
            <p className="text-gray-500">
              No topics with enough questions. Add questions to topics first.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Select one or more topics. Quiz will include 5 random questions.
              </p>
              <div className="space-y-2 mb-4">
                {topics.map((topic) => {
                  const questionCount = questions.filter((q) => q.topicId === topic.id).length
                  const hasEnoughQuestions = questionCount >= 5
                  const isSelected = selectedTopicIds.includes(topic.id)

                  return (
                    <label
                      key={topic.id}
                      className={`flex items-center p-3 border rounded cursor-pointer ${
                        isSelected ? 'bg-blue-50 border-blue-500' : 'border-gray-200'
                      } ${!hasEnoughQuestions ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => hasEnoughQuestions && toggleTopic(topic.id)}
                        disabled={!hasEnoughQuestions}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{topic.title}</div>
                        <div className="text-sm text-gray-500">
                          {questionCount} questions
                          {!hasEnoughQuestions && ' (need at least 5)'}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
              <button
                onClick={startQuiz}
                disabled={selectedTopicIds.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Start Quiz
              </button>
            </>
          )}
        </div>
      )}

      {quizStarted && !quizCompleted && currentQuestion && (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <div className="mb-4 text-center">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </span>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.prompt}</h2>
            <div className="space-y-2">
              {currentQuestion.choices.map((choice, idx) => {
                let buttonClass = 'w-full text-left p-4 border rounded hover:bg-gray-50'
                if (showResult) {
                  if (idx === currentQuestion.answerIndex) {
                    buttonClass += ' bg-green-100 border-green-500'
                  } else if (idx === selectedAnswer && idx !== currentQuestion.answerIndex) {
                    buttonClass += ' bg-red-100 border-red-500'
                  } else {
                    buttonClass += ' opacity-50'
                  }
                } else {
                  if (idx === selectedAnswer) {
                    buttonClass += ' bg-blue-100 border-blue-500'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !showResult && handleAnswer(idx)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
            {showResult && currentQuestion.explanation && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <div className="text-sm font-medium text-blue-900">Explanation:</div>
                <div className="text-blue-800">{currentQuestion.explanation}</div>
              </div>
            )}
          </div>
          {showResult && (
            <button
              onClick={nextQuestion}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>
      )}

      {quizCompleted && (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">Quiz Complete!</h2>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {score} / {quizQuestions.length}
            </div>
            <div className="text-lg text-gray-600">
              {Math.round((score / quizQuestions.length) * 100)}% Correct
            </div>
          </div>
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full"
                style={{ width: `${(score / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={resetQuiz}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Take Another Quiz
          </button>
        </div>
      )}

      {/* Recent Attempts */}
      {quizAttempts.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-6 border-b">Recent Attempts</h2>
          <div className="divide-y">
            {quizAttempts
              .sort((a, b) => (a.date > b.date ? -1 : 1))
              .slice(0, 10)
              .map((attempt) => {
                const topic = topics.find((t) => t.id === attempt.topicId)
                return (
                  <div key={attempt.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{topic?.title || 'Unknown Topic'}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(attempt.date), 'MMM d, yyyy')} • {attempt.total}{' '}
                          questions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {Math.round(attempt.score * 100)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round(attempt.score * attempt.total)} / {attempt.total} correct
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
