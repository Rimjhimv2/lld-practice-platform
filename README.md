# Blueprint — LLD Practice Platform

A focused full-stack prototype for practicing low-level design (LLD), submitting a structured solution, receiving explainable feedback, and reviewing previous attempts.

## MVP features

- Three prompts: Parking Lot, Elevator System, and Vending Machine.
- Structured submission form covering problem understanding, classes/responsibilities, relationships, trade-offs, and optional code/diagram notes.
- AI evaluation through an OpenAI-compatible chat-completions API (OpenRouter is the default base URL).
- Deterministic evaluator for quick checks and for testing without an API key.
- Feedback with score, strengths, issues, suggestions, criteria, and trade-offs.
- Attempt history and retry after provider failures.
- MongoDB persistence when configured; in-memory storage when `MONGODB_URI` is omitted or the database is unavailable.
- Input validation, security headers, rate limiting, and automated backend tests.

## Architecture

The app is a modular monolith. The React client talks to an Express API. Controllers handle HTTP concerns; `EvaluationService` coordinates the use case; `Submission` validates the domain input; evaluator implementations are replaceable strategies; `AttemptRepository` isolates persistence.

```text
React UI -> Express routes/controllers -> EvaluationService
                                         |-> Submission validation
                                         |-> RuleBasedEvaluator
                                         |-> LLMEvaluator -> provider API
                                         |-> AttemptRepository -> MongoDB or memory
```

### Main domain types

- `Problem`: prompt, requirements, constraints, and design considerations (currently a curated catalogue).
- `Submission`: validated learner input, format, and `toEvaluationText()`.
- `Attempt`: one immutable-in-intent submission with `pending`, `completed`, or `failed` evaluation status.
- `EvaluationService`: creates attempts, coordinates evaluation, records completion/failure, and supports retry.
- `EvaluationStrategy` concept: both evaluator implementations share the same `evaluate(submission, problem)` contract. JavaScript does not require a formal interface; a TypeScript interface could make the contract compile-time enforced in a larger version.
- `AttemptRepository`: persistence boundary; switch storage without changing the learner workflow.

## Run locally

Requirements: Node.js 20+ and npm. MongoDB is optional for a local demo.

1. Install root tooling and dependencies:

   ```bash
   npm install
   npm run install:all
   ```

2. Configure the backend:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Add an API key to `LLM_API_KEY` for AI evaluation. Keep the key in the backend environment only; never put it in `frontend/.env` or commit it. `LLM_BASE_URL` defaults to `https://openrouter.ai/api/v1` and `LLM_MODEL` defaults to `openai/gpt-4o-mini`. Use a model available to your provider account. Leave `MONGODB_URI` set to use MongoDB, or remove it for in-memory demo mode.

3. Start both applications from the root:

   ```bash
   npm run dev
   ```

   Frontend: http://localhost:5173  
   API: http://localhost:8080/api  
   Health check: http://localhost:8080/api/health

4. For a fast demo without an LLM key, choose **Quick deterministic check** in the submission form. It checks the presence of core design sections; it is not a substitute for reasoning-based review.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/problems` | List prompts |
| GET | `/api/problems/:problemId` | Problem detail |
| POST | `/api/attempts` | Validate, save, and evaluate a submission |
| GET | `/api/attempts` | List the latest 50 attempts for the local learner; optional `problemId` filter |
| GET | `/api/attempts/:attemptId` | Fetch one attempt |
| POST | `/api/attempts/:attemptId/retry` | Retry a failed evaluation |

Example submission payload:

```json
{
  "problemId": "parking-lot",
  "mode": "ai",
  "submission": {
    "format": "structured-text",
    "problemUnderstanding": "Drivers enter and need a compatible spot.",
    "classes": "ParkingLot coordinates floors; ParkingFloor owns spots; ParkingStrategy finds a spot.",
    "relationships": "ParkingLot composes ParkingFloor; ParkingFloor contains ParkingSpot; Vehicle is a base abstraction.",
    "designDecisions": "Allocation uses a strategy so policies can change without rewriting spot entities.",
    "codeOrDiagram": ""
  }
}
```

The API stores the attempt even when evaluation fails. Failed attempts can be retried after fixing the provider configuration. The demo uses a single local learner identity and is **not authentication**; do not deploy publicly with private submissions until real authentication and authorization are added.

## Tests

```bash
npm test
```

Backend tests use Node's built-in test runner and cover submission validation, rule evaluation, LLM response validation, failed-provider persistence/retry, and HTTP endpoints. Frontend test tooling is configured; add component tests as the UI stabilizes.

## Deployment

### Backend (Render, Railway, or similar)

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Set `CLIENT_ORIGIN` to the deployed frontend URL, `MONGODB_URI` to MongoDB Atlas, and `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` as needed.
- Keep the LLM API key in server-side environment variables only.

### Frontend (Vercel or Netlify)

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to the deployed backend API base URL, e.g. `https://your-api.example.com/api`.
- Set backend `CLIENT_ORIGIN` to the deployed frontend origin and redeploy the backend.

After deployment, test the health endpoint, submit one rule-based attempt, submit one AI attempt, refresh history, and test retry with a deliberately invalid key in a staging environment.

## Known limitations and next steps

- Authentication is represented by a fixed local learner ID for the assignment demo.
- Problem definitions are code-backed rather than editable by an admin.
- The current submission format is structured text plus optional pseudocode/diagram notes; a graphical UML editor is a future adapter, not in scope.
- Rule checks are shallow and can be gamed by keywords. They are deliberately not presented as correctness proofs.
- AI output can be inconsistent, provider schemas vary, and evaluations can be subjective. The implementation validates the response shape, uses a timeout, and exposes failures instead of silently fabricating an AI review.
- For a larger deployment: use a durable job queue only if evaluation latency/volume justifies it, add auth/ownership checks, store evaluator/model/prompt versions, add cost controls and observability, and create a human-reviewed evaluation set to measure quality.
