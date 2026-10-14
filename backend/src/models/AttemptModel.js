import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  score: Number, summary: String, strengths: [String], issues: [{ title: String, explanation: String, severity: String }],
  suggestions: [String], criteria: [mongoose.Schema.Types.Mixed], tradeOffs: [String], evaluator: String, model: String, disclaimer: String
}, { _id: false });
const attemptSchema = new mongoose.Schema({
  problemId: { type: String, required: true, index: true }, learnerId: { type: String, default: 'local-learner', index: true },
  submission: { type: mongoose.Schema.Types.Mixed, required: true }, status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  feedback: { type: feedbackSchema, default: null }, errorMessage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }, completedAt: { type: Date, default: null }
}, { timestamps: true });
export const AttemptModel = mongoose.model('Attempt', attemptSchema);
