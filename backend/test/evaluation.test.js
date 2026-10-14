import test from 'node:test';
import assert from 'node:assert/strict';
import { AttemptRepository } from '../src/services/AttemptRepository.js';
import { EvaluationService } from '../src/services/EvaluationService.js';
import { problems } from '../src/data/problems.js';

const validInput = {
  format: 'structured-text',
  problemUnderstanding: 'A learner should explain how the system behaves and who uses it.',
  classes: 'ParkingLot coordinates ParkingFloor. ParkingFloor owns ParkingSpot and ParkingStrategy allocates spots.',
  relationships: 'ParkingLot composes ParkingFloor; a floor contains multiple spots.',
  designDecisions: 'Use a strategy because allocation policy may change independently.',
  codeOrDiagram: ''
};

test('service saves failed AI attempt and retries saved submission', async () => {
  const repository = new AttemptRepository({ useMemory: true });
  let shouldFail = true;
  const aiEvaluator = { evaluate: async () => { if (shouldFail) throw new Error('provider unavailable'); return { score: 82, summary: 'Good', strengths: [], issues: [], suggestions: [], criteria: [], tradeOffs: [], evaluator: 'llm', model: 'test' }; } };
  const service = new EvaluationService({ repository, problemCatalog: problems, aiEvaluator });
  const failed = await service.submit({ problemId: 'parking-lot', input: validInput, mode: 'ai' });
  assert.equal(failed.status, 'failed');
  assert.match(failed.errorMessage, /provider unavailable/);
  assert.ok(failed._id);
  shouldFail = false;
  const completed = await service.retry(failed._id, 'local-learner', 'ai');
  assert.equal(completed.status, 'completed');
  assert.equal(completed.feedback.score, 82);
  assert.equal((await repository.list()).length, 1);
});

test('service rejects unknown problems before saving an attempt', async () => {
  const repository = new AttemptRepository({ useMemory: true });
  const service = new EvaluationService({ repository, problemCatalog: problems, aiEvaluator: { evaluate: async () => ({}) } });
  await assert.rejects(() => service.submit({ problemId: 'unknown', input: validInput }), error => error.statusCode === 404);
  assert.equal((await repository.list()).length, 0);
});

test('completed attempts cannot be evaluated a second time', async () => {
  const repository = new AttemptRepository({ useMemory: true });
  const service = new EvaluationService({ repository, problemCatalog: problems, ruleEvaluator: { evaluate: () => ({ score: 70, summary: 'ok', strengths: [], issues: [], suggestions: [], criteria: [], tradeOffs: [], evaluator: 'rules' }) } });
  const attempt = await service.submit({ problemId: 'parking-lot', input: validInput, mode: 'rules' });
  assert.equal(attempt.status, 'completed');
  await assert.rejects(() => service.retry(attempt._id), error => error.statusCode === 409);
});
