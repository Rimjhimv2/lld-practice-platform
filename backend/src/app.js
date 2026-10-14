import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import problemRoutes from './routes/problemRoutes.js';
import { createAttemptRoutes } from './routes/attemptRoutes.js';
import { problems } from './data/problems.js';
import { AttemptRepository } from './services/AttemptRepository.js';
import { EvaluationService } from './services/EvaluationService.js';

export function createApp({ repository = new AttemptRepository(), evaluationService } = {}) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '100kb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 40, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use((req, _res, next) => { req.problemCatalog = problems; next(); });
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'lld-practice-api' }));
  app.use('/api/problems', problemRoutes);
  const service = evaluationService || new EvaluationService({ repository, problemCatalog: problems });
  app.use('/api/attempts', createAttemptRoutes(service, repository));
  app.use((error, _req, res, _next) => {
    const status = error.statusCode || 500;
    if (status >= 500) console.error(error);
    res.status(status).json({ error: error.message || 'Internal server error', ...(error.details ? { details: error.details } : {}) });
  });
  return app;
}
