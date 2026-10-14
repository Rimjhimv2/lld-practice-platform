import { z } from 'zod';

export const submissionSchema = z.object({
  format: z.enum(['structured-text', 'code', 'diagram-notes']).default('structured-text'),
  problemUnderstanding: z.string().trim().min(10, 'Explain the problem in at least 10 characters.').max(3000),
  classes: z.string().trim().min(10, 'Describe your classes and responsibilities in at least 10 characters.').max(6000),
  relationships: z.string().trim().min(5, 'Describe relationships between classes.').max(3000),
  designDecisions: z.string().trim().min(5, 'Explain at least one design decision or trade-off.').max(4000),
  codeOrDiagram: z.string().max(12000).optional().default('')
});

export class Submission {
  constructor(input) {
    const parsed = submissionSchema.safeParse(input);
    if (!parsed.success) {
      const error = new Error('Submission validation failed');
      error.statusCode = 400;
      error.details = parsed.error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }));
      throw error;
    }
    Object.assign(this, parsed.data);
  }

  toEvaluationText() {
    return [
      `Problem understanding:\n${this.problemUnderstanding}`,
      `Classes and responsibilities:\n${this.classes}`,
      `Relationships:\n${this.relationships}`,
      `Design decisions and trade-offs:\n${this.designDecisions}`,
      `Optional code/diagram notes:\n${this.codeOrDiagram || '(not provided)'}`
    ].join('\n\n');
  }
}
