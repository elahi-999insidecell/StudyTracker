# StudyTracker — Student Task and Subject Management System

StudyTracker is a web-based application designed to help students organize their academic subjects, manage tasks, track task completion, and monitor their study progress.

## Features

- **Subject Management:** Add, view, and delete subjects.
- **Task Management:** Create tasks associated with subjects.
- **Task Tracking:** Mark tasks as completed or incomplete.
- **Progress Dashboard:** View task completion statistics and progress.
- **Persistent Storage:** Store application data in an SQLite database.
- **Input Validation:** Validate task data and handle invalid inputs.
- **Notifications:** Display success and error notifications.

## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- SQLite
- better-sqlite3

### Testing and Development Tools
- Vitest
- Git and GitHub
- GitHub Actions

## Design Patterns

StudyTracker implements three software design patterns:

1. **Factory Method:** Separates notification object creation from its usage.
2. **Adapter:** Provides a common interface for interacting with the notification display service.
3. **Observer:** Updates dashboard progress statistics when task data changes.

## Project Structure

```text
StudyTracker/
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── api.js
│       ├── notificationPatterns.js
│       ├── taskObservers.js
│       ├── taskUtils.js
│       └── taskValidation.js
├── server/
│   └── index.js
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js 22 or a compatible version
- npm

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/elahi-999insidecell/StudyTracker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd StudyTracker
   ```

3. Install dependencies:

   ```bash
   npm ci
   ```

4. Start the application using the development command configured in `package.json`:

   ```bash
   npm run dev
   ```

   If the frontend and backend require separate terminal sessions, follow the corresponding scripts and instructions in the project configuration.

## Testing

Run the automated tests:

```bash
npm run test -- --run
```

Run the tests with coverage:

```bash
npm run test:coverage
```

Build the frontend:

```bash
npm run build
```

The verified test results include 26 passing tests across five test files, with 96.72% statement coverage.

## Continuous Integration

GitHub Actions automates the project's verification workflow. The configured workflow installs dependencies, runs the test suite with coverage, and checks whether the application builds successfully.

## Database

StudyTracker uses SQLite for persistent data storage. The database stores subject and task information so that application data can persist between sessions.

## Future Improvements

- Implement a complete assignment management workflow.
- Improve the user interface and accessibility.
- Expand automated testing and integration coverage.

## Author

**Zarin Tasnim Elahi**  
Department of Computer Science and Engineering  
Rajshahi University of Engineering & Technology (RUET), Bangladesh

## Repository

[StudyTracker on GitHub](https://github.com/elahi-999insidecell/StudyTracker)
