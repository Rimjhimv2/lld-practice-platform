import { randomUUID } from 'node:crypto';
import { AttemptModel } from '../models/AttemptModel.js';

export class AttemptRepository {
  constructor({ useMemory = !process.env.MONGODB_URI } = {}) {
    this.useMemory = useMemory;
    this.records = new Map();
  }
  async create(data) {
    if (!this.useMemory && AttemptModel.db.readyState === 1) return AttemptModel.create(data);
    const doc = { ...data, _id: randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    this.records.set(doc._id, doc);
    return doc;
  }
  async findById(id) {
    if (!this.useMemory && AttemptModel.db.readyState === 1) return AttemptModel.findById(id);
    return this.records.get(id) || null;
  }
  async save(attempt) {
    if (!this.useMemory && AttemptModel.db.readyState === 1) {
      const doc = await AttemptModel.findById(attempt._id);
      if (!doc) return null;
      for (const key of ['status', 'feedback', 'errorMessage', 'completedAt', 'submission', 'problemId', 'learnerId']) doc[key] = attempt[key];
      return doc.save();
    }
    const updated = { ...attempt, updatedAt: new Date() };
    this.records.set(String(updated._id), updated);
    return updated;
  }
  async list({ learnerId = 'local-learner', problemId } = {}) {
    if (!this.useMemory && AttemptModel.db.readyState === 1) {
      const filter = { learnerId, ...(problemId ? { problemId } : {}) };
      return AttemptModel.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    }
    return [...this.records.values()].filter(a => a.learnerId === learnerId && (!problemId || a.problemId === problemId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
  }
}
