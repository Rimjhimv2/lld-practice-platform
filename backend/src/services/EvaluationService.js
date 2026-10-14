import { Submission } from '../domain/Submission.js';
import { Attempt, AttemptStatus } from '../domain/Attempt.js';
import { RuleBasedEvaluator } from './RuleBasedEvaluator.js';
import { LLMEvaluator } from './LLMEvaluator.js';

export class EvaluationService {
  constructor({ repository, problemCatalog, ruleEvaluator = new RuleBasedEvaluator(), aiEvaluator = new LLMEvaluator() }) {
    this.repository = repository;
    this.problemCatalog = problemCatalog;
    this.ruleEvaluator = ruleEvaluator;
    this.aiEvaluator = aiEvaluator;
  }

  async submit({ problemId, learnerId = 'local-learner', input, mode = 'ai' }) {
    const problem = this.problemCatalog.find(p => p.id === problemId);
    if (!problem) { const error = new Error('Problem not found'); error.statusCode = 404; throw error; }
    const submission = new Submission(input);
    if (!['ai', 'rules'].includes(mode)) { const error = new Error('mode must be ai or rules'); error.statusCode = 400; throw error; }
    const attempt = new Attempt({ problemId, learnerId, submission: { ...submission } });
    const saved = await this.repository.create({ ...attempt, _id: undefined });
    return this.runEvaluation(saved, problem, submission, mode);
  }

  async retry(attemptId, learnerId = 'local-learner', mode = 'ai') {
    const attempt = await this.repository.findById(attemptId);
    if (!attempt || attempt.learnerId !== learnerId) { const error = new Error('Attempt not found'); error.statusCode = 404; throw error; }
    if (attempt.status === AttemptStatus.COMPLETED) { const error = new Error('This attempt is already evaluated'); error.statusCode = 409; throw error; }
    const problem = this.problemCatalog.find(p => p.id === attempt.problemId);
    if (!problem) { const error = new Error('Problem no longer exists'); error.statusCode = 404; throw error; }
    return this.runEvaluation(attempt, problem, new Submission(attempt.submission), mode);
  }

  async runEvaluation(attempt, problem, submission, mode) {
    attempt.status = AttemptStatus.PENDING;
    attempt.errorMessage = null;
    await this.repository.save(attempt);
    try {
      const feedback = mode === 'rules' ? this.ruleEvaluator.evaluate(submission, problem) : await this.aiEvaluator.evaluate(submission, problem);
      attempt.feedback = feedback;
      attempt.status = AttemptStatus.COMPLETED;
      attempt.completedAt = new Date();
    } catch (error) {
      attempt.status = AttemptStatus.FAILED;
      attempt.errorMessage = error.name === 'AbortError' ? 'Evaluation timed out. Retry when ready.' : (error.message || 'Evaluation failed. Please retry.');
    }
    return this.repository.save(attempt);
  }
}
