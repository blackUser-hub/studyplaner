# Smart Study Planner

A comprehensive study planning application for exam preparation. Plan your study schedule, create flashcards, take quizzes, and generate exam tickets—all managed locally in your browser.

preview - https://study-project-six.vercel.app/

## Features

- **Topic Management**: Add and organize study topics with difficulty and importance ratings
- **Smart Scheduling**: Automatically generate study plans based on exam date, available time, and topic weights
- **Calendar View**: Visual calendar showing all scheduled study sessions
- **Flashcards**: Create and review flashcards with spaced repetition algorithm
- **Mini-Quizzes**: Test your knowledge with topic-based quizzes from a local question bank
- **Weak Topics Detection**: Automatically identifies topics needing more attention
- **Ticket Generation**: Generate exam question sets (tickets) with weighted topic distribution
- **Data Export/Import**: Backup and restore your data as JSON

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run unit tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run end-to-end tests:

```bash
npm run e2e
```

Run e2e tests with UI:

```bash
npm run e2e:ui
```

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Quick Start with Demo Data

1. Click "Load Demo Data" on the Dashboard
2. Set your exam date and daily study time
3. Click "Generate Plan" to create your study schedule
4. Explore flashcards, quizzes, and tickets

### Adding Topics

- Go to the Topics page
- Click "Add Topic" to create individual topics
- Use "Bulk Add" to paste multiple topics (one per line)
- Set difficulty (1-5) and importance (1-5) for better scheduling

### Generating Study Plans

1. Configure exam date and available minutes per day
2. Select which days of the week you can study
3. Click "Generate Plan"
4. The scheduler allocates time across topics based on:
   - Topic importance × difficulty
   - Current mastery level (from quizzes and flashcards)
   - Ensures each topic appears at least once per week

### Flashcards

- Create flashcards for any topic
- Review mode shows cards due for review
- Use "Know" or "Don't Know" to update spaced repetition schedule
- Cards you know will appear less frequently

### Quizzes

- Select one or more topics (need at least 5 questions per topic)
- Answer 5 random questions
- Results update topic mastery scores
- Review your quiz history

### Tickets

- Generate exam-style question sets
- Configure number of tickets and questions per ticket
- Tickets are weighted toward weak topics
- View and review each ticket's questions

## Data Model

### Topic
- `id`: Unique identifier
- `title`: Topic name
- `category`: Optional category (e.g., "Mathematics")
- `difficulty`: 1-5 scale
- `importance`: 1-5 scale
- `estimatedMinutes`: Optional time estimate
- `notes`: Optional notes

### ExamConfig
- `examDate`: Target exam date (ISO format)
- `minutesPerDay`: Available study time per day
- `daysOfWeek`: Array of 0-6 (Sunday-Saturday)
- `startDate`: Plan start date (defaults to today)

### StudySession
- `id`: Unique identifier
- `date`: Session date (ISO format)
- `topicId`: Associated topic
- `plannedMinutes`: Scheduled time
- `status`: "planned" | "done" | "skipped"
- `actualMinutes`: Optional actual time spent

### Flashcard
- `id`: Unique identifier
- `topicId`: Associated topic
- `front`: Question/prompt
- `back`: Answer/explanation
- `lastReviewedAt`: Last review date
- `easeScore`: 0-1 performance score
- `dueAt`: Next review date
- `streak`: Consecutive correct reviews

### Question
- `id`: Unique identifier
- `topicId`: Associated topic
- `prompt`: Question text
- `choices`: Array of 4 answer choices
- `answerIndex`: Correct answer (0-3)
- `explanation`: Optional explanation

### QuizAttempt
- `id`: Unique identifier
- `topicId`: Associated topic
- `date`: Attempt date
- `score`: 0-1 score
- `total`: Total questions
- `wrongQuestionIds`: Array of incorrectly answered question IDs

### Ticket
- `id`: Unique identifier
- `createdAt`: Creation date
- `items`: Array of `{topicId, questionIds[]}`

## How Scheduling Works

The scheduler uses a weighted distribution algorithm:

1. **Weight Calculation**: `weight = importance × difficulty × (1 - mastery)`
2. **Mastery Calculation**: Combines quiz scores (40%), flashcard performance (30%), and session completion (30%)
3. **Minimum Coverage**: Ensures each topic appears at least once per week
4. **Time Allocation**: Distributes `minutesPerDay` across topics based on weights
5. **Preservation**: Keeps completed sessions when regenerating plans

## Weak Topics Algorithm

Topics are ranked by risk score:

- **Mastery Component** (60%): `(1 - mastery) × 0.6`
- **Missed Sessions** (20%): `missedRate × 0.2`
- **Low Quiz Scores** (20%): `(1 - avgScore) × 0.2`

Higher risk scores indicate topics needing more attention.

## Adding Questions and Cards

### Questions

Questions are stored in `lib/demo-data.ts`. To add more:

1. Edit `demoQuestions` array
2. Follow the format:
```typescript
{
  id: 'q-X',
  topicId: 'demo-X', // Match topic ID
  prompt: 'Your question?',
  choices: ['Option A', 'Option B', 'Option C', 'Option D'],
  answerIndex: 0, // 0-3
  explanation: 'Optional explanation'
}
```

### Flashcards

Flashcards can be added:
- Via the UI (Flashcards page)
- In demo data (`lib/demo-data.ts`)

## Data Persistence

All data is stored in browser localStorage. No server or database required.

- **Export**: Download JSON file from Settings
- **Import**: Paste JSON data in Settings
- **Reset**: Clear all data (Settings → Danger Zone)

## Limitations & Disclaimers

⚠️ **Important**: This planner provides guidance based on algorithms and heuristics. Results are not guaranteed. Always:

- Adjust your plan based on actual progress
- Review weak topics regularly
- Don't rely solely on automated scheduling
- Use this as a tool to support, not replace, your judgment

The scheduler makes assumptions about:
- Time needed per topic (uses weighted distribution)
- Optimal review intervals (spaced repetition)
- Topic difficulty and importance (user-provided)

## Project Structure

```
smart-study-planner/
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── topics/            # Topic management
│   ├── calendar/          # Calendar view
│   ├── flashcards/        # Flashcard management
│   ├── quizzes/           # Quiz interface
│   ├── tickets/           # Ticket generation
│   └── settings/          # Export/import
├── lib/                    # Core logic
│   ├── store.ts           # Zustand state management
│   ├── scheduler.ts       # Plan generation
│   ├── mastery.ts         # Mastery calculation
│   ├── spaced-repetition.ts # Flashcard algorithm
│   ├── ticket-generator.ts # Ticket generation
│   ├── demo-data.ts       # Demo data fixtures
│   └── __tests__/         # Unit tests
├── types/                  # TypeScript types
├── e2e/                    # Playwright e2e tests
└── public/                 # Static assets
```

## License

MIT License - feel free to use and modify as needed.

## Contributing

This is an MVP. Suggestions and improvements welcome!

---

**Built with**: Next.js 14, TypeScript, Tailwind CSS, Zustand, date-fns, Vitest, Playwright
