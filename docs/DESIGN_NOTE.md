# Design note

## MVP and user flow

Problem library → read brief and requirements → fill structured design notes → submit → validate → evaluate → review feedback → retry or revisit history.

The prototype deliberately avoids authentication, a course catalogue, a graphical UML editor, and infrastructure-heavy asynchronous processing. These would consume the two-day time budget without proving the central learning loop.

## Domain model

- **Problem**: a prompt, description, requirements, considerations, difficulty, and expected concepts. For this MVP it is a curated read-only catalogue.
- **Submission**: a validated value object with format and fields for understanding, classes, relationships, decisions, and optional code/diagram notes. It converts to a single evaluation text representation.
- **Attempt**: one learner's submission to a problem, with status (`pending`, `completed`, `failed`), timestamps, error details, and optional feedback.
- **Evaluation feedback**: score, summary, strengths, issues with severity, criteria, suggestions, trade-offs, evaluator/model metadata, and a disclaimer.
- **EvaluationService**: use-case coordinator; validates the problem and submission, creates the attempt, calls an evaluator, and persists either success or failure.
- **RuleBasedEvaluator / LLMEvaluator**: interchangeable strategies with the same `evaluate(submission, problem)` shape.
- **AttemptRepository**: persistence abstraction with MongoDB and in-memory implementations behind one API.

## Evaluation design

Deterministic checks handle objective concerns: required fields, input size, valid evaluation mode, and feedback response shape. The rule-based evaluator checks whether the submission contains signals of understanding, class responsibilities, relationships, and trade-off reasoning. Those checks are intentionally shallow and never treated as proof of design correctness.

The LLM evaluates contextual design quality against the actual prompt requirements. It is instructed to recognise multiple valid solutions, ground issues in the submission, and return structured JSON. The response is parsed and validated before storage. The provider call has a timeout. Provider failure or invalid output marks the attempt `failed`, preserves the submission, and offers retry; the system does not fabricate an AI review or silently label rule feedback as AI feedback.

## Key trade-offs

- **Structured text vs. diagram editor:** less expressive visually, but faster to implement, accessible, testable, and sufficient to expose the learner's reasoning.
- **Synchronous evaluation vs. queue:** simpler for a two-day monolith. The attempt is stored before evaluation and failure is recorded. If latency or volume grows, an async job can be added behind `EvaluationService` without changing the domain contract.
- **MongoDB plus in-memory fallback:** MongoDB supports durable history; memory mode makes a quick local demo possible. Memory history resets on restart and is not suitable for production.
- **LLM plus deterministic checks:** rules are cheap and predictable; the LLM can reason about context but is probabilistic and may hallucinate. The UI explains this limitation.
- **Curated problem catalogue:** safe scope for an MVP; a future `ProblemRepository` could make prompts editable without changing the learner flow.

## Failure handling

Invalid submissions return field-level validation errors before an attempt is created. If the LLM times out, returns a provider error, or produces invalid JSON, the attempt remains saved and becomes `failed`; a retry endpoint reuses the saved submission. The API has rate limiting, a JSON body limit, and Helmet security headers. The current learner ID is a demo placeholder, not authentication.

## Extension points

- Add `DiagramSubmission` or code submissions via format-specific validators while retaining the common `Submission`/evaluation boundary.
- Add another evaluator (human review, rubric model, static code analysis) by implementing the evaluator contract.
- Version prompts, rubric, and model metadata to compare evaluation quality over time.
- Add authenticated learner ownership before public deployment.
