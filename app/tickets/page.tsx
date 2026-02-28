'use client'

import { useStore } from '@/lib/store'
import { generateTickets } from '@/lib/ticket-generator'
import { format, parseISO } from 'date-fns'
import { useState } from 'react'

export default function TicketsPage() {
  const { topics, questions, quizAttempts, flashcards, sessions, tickets, addTicket, deleteTicket } =
    useStore()
  const [numTickets, setNumTickets] = useState(5)
  const [questionsPerTicket, setQuestionsPerTicket] = useState(10)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

  const handleGenerate = () => {
    if (topics.length === 0 || questions.length === 0) {
      alert('Need topics and questions to generate tickets')
      return
    }

    const ticketData = generateTickets(
      topics,
      questions,
      quizAttempts,
      flashcards,
      sessions,
      numTickets,
      questionsPerTicket
    )

    ticketData.forEach((items) => {
      addTicket({
        createdAt: format(new Date(), 'yyyy-MM-dd'),
        items,
      })
    })

    alert(`Generated ${numTickets} tickets!`)
  }

  const selectedTicketData = selectedTicket
    ? tickets.find((t) => t.id === selectedTicket)
    : null

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tickets</h1>
          <p className="text-gray-600">Generate exam question sets</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={topics.length === 0 || questions.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Generate Tickets
        </button>
      </div>

      {/* Generation Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Generation Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Tickets
            </label>
            <input
              type="number"
              value={numTickets}
              onChange={(e) => setNumTickets(parseInt(e.target.value) || 1)}
              min={1}
              max={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Questions per Ticket
            </label>
            <input
              type="number"
              value={questionsPerTicket}
              onChange={(e) => setQuestionsPerTicket(parseInt(e.target.value) || 1)}
              min={1}
              max={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Tickets are generated with weighted distribution favoring weak topics. Each ticket covers
          multiple topics.
        </p>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">Generated Tickets</h2>
        {tickets.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              No tickets generated yet. Click "Generate Tickets" to create exam question sets.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {tickets
              .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
              .map((ticket) => {
                const totalQuestions = ticket.items.reduce(
                  (sum, item) => sum + item.questionIds.length,
                  0
                )

                return (
                  <div
                    key={ticket.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          Ticket #{tickets.indexOf(ticket) + 1}
                        </div>
                        <div className="text-sm text-gray-500">
                          Created: {format(parseISO(ticket.createdAt), 'MMM d, yyyy')} •{' '}
                          {ticket.items.length} topics • {totalQuestions} questions
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTicket(ticket.id)
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Delete this ticket?')) {
                              deleteTicket(ticket.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicketData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Ticket #{tickets.indexOf(selectedTicketData) + 1}
              </h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 text-sm text-gray-600">
              Created: {format(parseISO(selectedTicketData.createdAt), 'MMMM d, yyyy')}
            </div>
            <div className="space-y-6">
              {selectedTicketData.items.map((item, idx) => {
                const topic = topics.find((t) => t.id === item.topicId)
                const itemQuestions = questions.filter((q) =>
                  item.questionIds.includes(q.id)
                )

                return (
                  <div key={idx} className="border border-gray-200 rounded p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {topic?.title || 'Unknown Topic'} ({itemQuestions.length} questions)
                    </h3>
                    <div className="space-y-3">
                      {itemQuestions.map((question) => (
                        <div key={question.id} className="bg-gray-50 rounded p-3">
                          <div className="font-medium mb-2">{question.prompt}</div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {question.choices.map((choice, cIdx) => (
                              <div
                                key={cIdx}
                                className={cIdx === question.answerIndex ? 'text-green-700 font-medium' : ''}
                              >
                                {cIdx === question.answerIndex ? '✓ ' : '  '}
                                {choice}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-2 text-xs text-gray-500">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
