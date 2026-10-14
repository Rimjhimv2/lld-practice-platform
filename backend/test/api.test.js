import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { AttemptRepository } from '../src/services/AttemptRepository.js';
import { EvaluationService } from '../src/services/EvaluationService.js';
import { problems } from '../src/data/problems.js';

const validSubmission = {
  format: 'structured-text',
  problemUnderstanding: 'Drivers need a way to park and leave a vehicle safely.',
  classes: 'ParkingLot manages ParkingFloor; ParkingFloor manages ParkingSpot; ParkingStrategy chooses a spot.',
  relationships: 'ParkingLot composes floors, and floors contain parking spots.',
  designDecisions: 'I use a strategy interface because the allocation policy could change.',
  codeOrDiagram: ''
};

test('HTTP API lists problems and reports validation details', async t => {
  const repository = new AttemptRepository({ useMemory: true });
  const evaluationService = new EvaluationService({ repository, problemCatalog: problems });
  const app = createApp({ repository, evaluationService });
  const server = app.listen(0);
  t.after(() => server.close());
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}/api`;
  const list = await fetch(`${base}/problems`);
  assert.equal(list.status, 200);
  assert.equal((await list.json()).problems.length, 3);
  const invalid = await fetch(`${base}/attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId: 'parking-lot', mode: 'rules', submission: { ...validSubmission, classes: 'x' } }) });
  assert.equal(invalid.status, 400);
  const body = await invalid.json();
  assert.ok(body.details.some(detail => detail.field === 'classes'));
});

test('HTTP API stores and returns a rule-evaluated attempt', async t => {
  const repository = new AttemptRepository({ useMemory: true });
  const evaluationService = new EvaluationService({ repository, problemCatalog: problems });
  const app = createApp({ repository, evaluationService });
  const server = app.listen(0);
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const response = await fetch(`${base}/attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId: 'parking-lot', mode: 'rules', submission: validSubmission }) });
  assert.equal(response.status, 201);
  const { attempt } = await response.json();
  assert.equal(attempt.status, 'completed');
  const history = await fetch(`${base}/attempts`);
  assert.equal((await history.json()).attempts.length, 1);
});
