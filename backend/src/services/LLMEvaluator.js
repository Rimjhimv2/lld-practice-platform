const responseSchema = {
  type: 'object', additionalProperties: false,
  required: ['score', 'summary', 'strengths', 'issues', 'suggestions', 'criteria', 'tradeOffs'],
  properties: {
    score: { type: 'integer', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    issues: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'explanation', 'severity'], properties: { title: { type: 'string' }, explanation: { type: 'string' }, severity: { type: 'string', enum: ['low', 'medium', 'high'] } } } },
    suggestions: { type: 'array', items: { type: 'string' } },
    criteria: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['criterion', 'score', 'reason'], properties: { criterion: { type: 'string' }, score: { type: 'integer', minimum: 0, maximum: 5 }, reason: { type: 'string' } } } },
    tradeOffs: { type: 'array', items: { type: 'string' } }
  }
};

export class LLMEvaluator {
  constructor({ apiKey = process.env.LLM_API_KEY, baseUrl = process.env.LLM_BASE_URL || 'https://openrouter.ai/api/v1', model = process.env.LLM_MODEL || 'openai/gpt-4o-mini', timeoutMs = 25000 } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async evaluate(submission, problem) {
    if (!this.apiKey) throw new Error('LLM_API_KEY is not configured. Add it to backend/.env or retry using the rule-based evaluator.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', ...(process.env.LLM_SITE_URL ? { 'HTTP-Referer': process.env.LLM_SITE_URL } : {}), ...(process.env.LLM_APP_NAME ? { 'X-Title': process.env.LLM_APP_NAME } : {}) },
        body: JSON.stringify({
          model: this.model, temperature: 0.2,
          messages: [
            { role: 'system', content: 'You are a thoughtful low-level design interviewer. Evaluate the design, not writing style. Multiple designs can be valid. Do not reward keywords alone. Ground every criticism in the submitted design and problem requirements. Be constructive, specific, concise, and fair. Never invent classes or behaviours that the learner claimed to implement. Return only JSON matching the requested schema.' },
            { role: 'user', content: `Evaluate this LLD submission. Problem: ${problem.title}\nDescription: ${problem.description}\nRequirements:\n${problem.requirements.map(x => `- ${x}`).join('\n')}\nDesign considerations:\n${problem.considerations.map(x => `- ${x}`).join('\n')}\n\nSubmission:\n${submission.toEvaluationText()}\n\nUse these criteria: requirement coverage, responsibility separation, abstractions/relationships, extensibility, edge cases and trade-off reasoning. Score 0-100. Explain why. Provide 2-5 strengths, issues, actionable suggestions, criterion scores from 0-5, and trade-offs. Acknowledge reasonable alternatives. JSON schema: ${JSON.stringify(responseSchema)}` }
          ], response_format: { type: 'json_object' }
        })
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`LLM provider returned ${response.status}: ${body.slice(0, 250) || response.statusText}`);
      }
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) throw new Error('LLM provider returned an empty response');
      let parsed;
      try { parsed = JSON.parse(raw); } catch { throw new Error('LLM returned invalid JSON; retry the evaluation'); }
      return validateFeedback(parsed, this.model);
    } finally { clearTimeout(timer); }
  }
}

export function validateFeedback(value, model = 'unknown') {
  const strings = list => Array.isArray(list) && list.every(item => typeof item === 'string');
  const validIssues = Array.isArray(value.issues) && value.issues.every(item => item && typeof item.title === 'string' && typeof item.explanation === 'string' && ['low', 'medium', 'high'].includes(item.severity));
  const validCriteria = Array.isArray(value.criteria) && value.criteria.every(item => item && typeof item.criterion === 'string' && Number.isInteger(item.score) && item.score >= 0 && item.score <= 5 && typeof item.reason === 'string');
  if (!Number.isInteger(value.score) || value.score < 0 || value.score > 100 || typeof value.summary !== 'string' || !strings(value.strengths) || !validIssues || !strings(value.suggestions) || !validCriteria || !strings(value.tradeOffs)) {
    throw new Error('LLM feedback did not match the expected schema; retry the evaluation');
  }
  return {
    score: value.score,
    summary: value.summary.slice(0, 2000),
    strengths: value.strengths.slice(0, 8).map(x => x.slice(0, 1000)),
    issues: value.issues.slice(0, 10).map(x => ({ title: x.title.slice(0, 200), explanation: x.explanation.slice(0, 1500), severity: x.severity })),
    suggestions: value.suggestions.slice(0, 10).map(x => x.slice(0, 1200)),
    criteria: value.criteria.slice(0, 12).map(x => ({ criterion: x.criterion.slice(0, 200), score: x.score, reason: x.reason.slice(0, 1000) })),
    tradeOffs: value.tradeOffs.slice(0, 8).map(x => x.slice(0, 1000)),
    evaluator: 'llm', model, disclaimer: 'AI feedback is advisory, may miss valid alternatives, and should be reviewed against the requirements.'
  };
}
