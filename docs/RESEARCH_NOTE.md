# Research note: LLD practice that teaches reasoning

## Learner problem

Low-level design practice is easy to begin but difficult to evaluate consistently. A learner can name classes and patterns while still putting responsibilities in the wrong place, coupling unrelated behaviours, ignoring edge cases, or failing to explain trade-offs. A reference solution alone can imply that one class diagram is uniquely correct even when several designs satisfy the same requirements.

A useful practice loop therefore needs more than a prompt and an answer key: the learner should make their reasoning visible, receive feedback tied to the requirements, understand why a design choice matters, and be able to revisit previous attempts.

## Existing approaches reviewed (high-level desk research)

This is a directional comparison of common product categories, not a claim that every feature was exhaustively tested on the date of writing. Before final submission, open the live pages and confirm current feature details.

- **Refactoring.Guru** (https://refactoring.guru/design-patterns): a strong explanatory reference for design patterns, intent, structure, and examples. It helps learners understand patterns, but it is not centred on a personal, repeated submit–evaluate–retry workflow for arbitrary LLD prompts.
- **Educative** (https://www.educative.io/): interactive courses and interview-preparation material can provide guided learning and structured content. A course-oriented experience is not necessarily the same as a lightweight feedback loop on the learner's own domain model.
- **LeetCode** (https://leetcode.com/): strong for repeatable problem practice and progress tracking, particularly where answers can be judged against objective tests. LLD evaluation is less amenable to a single deterministic expected output because class responsibilities and trade-offs require contextual judgement.
- **InterviewBit** (https://www.interviewbit.com/): interview preparation and topic-based learning provide a useful guided path. The opportunity for this MVP is to narrow the experience around explaining and iterating on one submitted design.

## Gap and product direction

The product should bridge the space between open-ended design prompts and feedback a learner can act on. The MVP uses a structured text submission instead of building a complex diagram editor. It asks for problem understanding, classes/responsibilities, relationships, trade-offs, and optional pseudocode/diagram notes. These fields make the learner's reasoning observable without prescribing a single class diagram.

Feedback is split into deterministic validation and LLM-assisted judgement. Deterministic checks validate submission shape and presence of core reasoning sections. The LLM reviews requirement coverage, responsibility separation, abstractions, extensibility, edge cases, and trade-offs. Feedback should cite concrete parts of the design, include strengths and issues, and recommend next steps. Because an LLM can be wrong, the UI presents feedback as advisory rather than as a definitive verdict.

## Success criteria for this prototype

1. A learner can choose one of three prompts and understand its requirements.
2. A meaningful submission is validated and persisted as an attempt.
3. The learner receives structured feedback or a visible failure state with a retry path.
4. The learner can revisit previous submissions and compare feedback.
5. Evaluation strategy and persistence are replaceable without rewriting the HTTP layer or UI workflow.

## Research caveat

This note is a small desk-research synthesis, not primary user research. The next step would be 4–6 short learner interviews and a usability test of whether feedback changes the learner's next design iteration.
