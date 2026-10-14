import { Router } from 'express';
import { listProblems, getProblem } from '../controllers/problemController.js';
const router = Router();
router.get('/', listProblems);
router.get('/:problemId', getProblem);
export default router;
