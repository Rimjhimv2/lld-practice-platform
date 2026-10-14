import { Router } from 'express';
export function createAttemptRoutes(evaluationService, repository) {
  const router = Router();
  router.post('/', async (req, res, next) => {
    try {
      const attempt = await evaluationService.submit({ problemId: req.body.problemId, learnerId: req.body.learnerId || 'local-learner', input: req.body.submission, mode: req.body.mode || 'ai' });
      res.status(attempt.status === 'completed' ? 201 : 502).json({ attempt });
    } catch (error) { next(error); }
  });
  router.get('/', async (req, res, next) => {
    try { res.json({ attempts: await repository.list({ learnerId: req.query.learnerId || 'local-learner', problemId: req.query.problemId }) }); }
    catch (error) { next(error); }
  });
  router.get('/:attemptId', async (req, res, next) => {
    try {
      const attempt = await repository.findById(req.params.attemptId);
      if (!attempt || attempt.learnerId !== (req.query.learnerId || 'local-learner')) return res.status(404).json({ error: 'Attempt not found' });
      res.json({ attempt });
    } catch (error) { next(error); }
  });
  router.post('/:attemptId/retry', async (req, res, next) => {
    try {
      const attempt = await evaluationService.retry(req.params.attemptId, req.body.learnerId || 'local-learner', req.body.mode || 'ai');
      res.status(attempt.status === 'completed' ? 200 : 502).json({ attempt });
    } catch (error) { next(error); }
  });
  return router;
}
