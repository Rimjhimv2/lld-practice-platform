import test from 'node:test';
import assert from 'node:assert/strict';
import { Submission } from '../src/domain/Submission.js';
import { RuleBasedEvaluator } from '../src/services/RuleBasedEvaluator.js';
import { validateFeedback } from '../src/services/LLMEvaluator.js';
import { problems } from '../src/data/problems.js';

const goodInput = {
  format: 'structured-text',
  problemUnderstanding: 'Drivers need a safe way to find and release compatible parking spots.',
  classes: 'ParkingLot coordinates ParkingFloor objects. ParkingFloor contains ParkingSpot objects. ParkingStrategy finds compatible spots.',
  relationships: 'ParkingLot composes ParkingFloor, which contains ParkingSpot; Car implements Vehicle.',
  designDecisions: 'I use a strategy interface because allocation rules may change without changing the spot model.',
  codeOrDiagram: ''
};

test('Submission accepts valid structured input and produces evaluator text', () => {
  const submission = new Submission(goodInput);
  assert.equal(submission.classes, goodInput.classes);
  assert.match(submission.toEvaluationText(), /ParkingLot coordinates/);
});

test('Submission rejects missing or too-short required fields with field details', () => {
  assert.throws(() => new Submission({ ...goodInput, classes: 'no' }), error => {
    assert.equal(error.statusCode, 400);
    assert.ok(error.details.some(detail => detail.field === 'classes'));
    return true;
  });
});

test('Submission rejects unsupported formats', () => {
  assert.throws(() => new Submission({ ...goodInput, format: 'image-upload' }), /Submission validation failed/);
});

test('rule evaluator produces bounded deterministic score and actionable feedback', () => {
  const evaluator = new RuleBasedEvaluator();
  const submission = new Submission(goodInput);
  const feedback = evaluator.evaluate(submission, problems[0]);
  assert.ok(feedback.score >= 0 && feedback.score <= 100);
  assert.equal(feedback.evaluator, 'rules');
  assert.equal(feedback.criteria.length, 4);
  assert.ok(feedback.suggestions.length >= 1);
});

test('LLM response validation rejects malformed output', () => {
  assert.throws(() => validateFeedback({ score: 150, summary: 'x', strengths: [], issues: [], suggestions: [], criteria: [], tradeOffs: [] }), /did not match/);
});

test('LLM response validation adds model and advisory disclaimer', () => {
  const value = validateFeedback({ score: 80, summary: 'Clear design.', strengths: ['Responsibilities are explicit.'], issues: [], suggestions: ['Add edge cases.'], criteria: [], tradeOffs: ['A strategy can add flexibility.'] }, 'test-model');
  assert.equal(value.model, 'test-model');
  assert.match(value.disclaimer, /advisory/);
});
