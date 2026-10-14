# AI_USAGE.md

This file documents meaningful AI-assisted decisions in this prototype. Update it with the exact tools and prompts used during your own implementation/review before submission; do not claim testing or research that you did not personally perform.

1. **Structured submission fields instead of a free-form single textarea**
   - AI-assisted suggestion: separate problem understanding, classes/responsibilities, relationships, trade-offs, and optional code/diagram notes so a reviewer can identify what reasoning is missing.
   - Decision: accepted. The fields make feedback more specific while remaining fast to build in a two-day assignment.
   - Trade-off: learners may have to repeat information across fields, and some designs do not fit the structure perfectly.

2. **Hybrid evaluation rather than AI-only scoring**
   - AI-assisted suggestion: use deterministic validation for required inputs and response shape, and use an LLM only for contextual reasoning about design quality.
   - Decision: accepted. The rule-based evaluator gives a predictable demo and the LLM is responsible for strengths, contextual issues, trade-offs, and next steps.
   - Trade-off: the deterministic score is only a shallow completeness signal; it is explicitly labelled as such.

3. **Evaluator strategy boundary**
   - AI-assisted suggestion: keep evaluation behind a common `evaluate(submission, problem)` contract so another evaluator can be introduced without changing the use case.
   - Decision: accepted with a lightweight JavaScript contract rather than a formal TypeScript interface, because the assignment is a short MVP.
   - Trade-off: JavaScript cannot enforce the contract at compile time, so tests and response validation provide guardrails.

4. **Persist attempts before/through evaluation and expose retry**
   - AI-assisted suggestion: treat provider errors and timeouts as first-class attempt states instead of returning an untracked server error or inventing feedback.
   - Decision: accepted. The submission is retained and can be retried after provider configuration or availability is fixed.
   - Trade-off: evaluation is synchronous in this prototype, so the HTTP request may remain open until the provider responds. A queue is deferred unless observed latency warrants it.

5. **Scope discipline for a two-day build**
   - AI-assisted suggestion: skip authentication, a visual UML editor, microservices, and admin authoring; focus on the complete practice loop.
   - Decision: accepted for time-to-value. The README documents that the local learner ID is not authentication and must not be treated as production access control.
   - Trade-off: the prototype is a demonstrator, not a multi-user production service.
