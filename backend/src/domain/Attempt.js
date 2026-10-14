export const AttemptStatus = Object.freeze({ PENDING: 'pending', COMPLETED: 'completed', FAILED: 'failed' });

export class Attempt {
  constructor({ problemId, learnerId = 'local-learner', submission }) {
    if (!problemId || !submission) throw new Error('problemId and submission are required');
    this.problemId = problemId;
    this.learnerId = learnerId;
    this.submission = submission;
    this.status = AttemptStatus.PENDING;
    this.feedback = null;
    this.errorMessage = null;
    this.createdAt = new Date();
    this.completedAt = null;
  }

  complete(feedback) {
    this.feedback = feedback;
    this.status = AttemptStatus.COMPLETED;
    this.errorMessage = null;
    this.completedAt = new Date();
  }

  fail(message) {
    this.status = AttemptStatus.FAILED;
    this.errorMessage = message || 'Evaluation failed';
  }
}
