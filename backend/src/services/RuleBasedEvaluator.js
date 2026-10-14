const checks = [
  { key: 'problemUnderstanding', label: 'Problem understanding', test: s => s.problemUnderstanding.trim().length >= 40, pass: 'You have described the problem with useful context.', fail: 'Clarify the main use cases, actors, and system constraints.' },
  { key: 'classes', label: 'Classes and responsibilities', test: s => /class|interface|service|manager|repository|policy|factory/i.test(s.classes), pass: 'Your class description names concrete design elements.', fail: 'Name the key classes/interfaces and state each class’s responsibility.' },
  { key: 'relationships', label: 'Relationships', test: s => /has-a|is-a|inherit|compose|contain|association|depend|uses|extends|implements|one-to-many|many-to-one/i.test(s.relationships), pass: 'You have indicated at least one relationship or dependency.', fail: 'Explain relationships explicitly: composition, inheritance, association, or dependency.' },
  { key: 'designDecisions', label: 'Trade-offs', test: s => /because|trade.?off|alternative|instead|strategy|state|interface|extend|change|why/i.test(s.designDecisions), pass: 'You have started to justify a design decision.', fail: 'Explain why you chose this design and one alternative or future change.' }
];

export class RuleBasedEvaluator {
  evaluate(submission, problem) {
    const results = checks.map(check => ({ criterion: check.label, passed: check.test(submission), explanation: check.test(submission) ? check.pass : check.fail }));
    const passed = results.filter(r => r.passed).length;
    const score = Math.round((passed / results.length) * 100);
    return {
      score,
      summary: score >= 75 ? 'Your submission covers the basic design dimensions. Review the improvement suggestions to make responsibilities and trade-offs more precise.' : 'Your submission has a starting point, but some important design details are missing. Use the criterion-level feedback to strengthen it.',
      strengths: results.filter(r => r.passed).map(r => r.explanation),
      issues: results.filter(r => !r.passed).map(r => ({ title: r.criterion, explanation: r.explanation, severity: 'medium' })),
      suggestions: [
        `Map each requirement for “${problem.title}” to the class or method responsible for satisfying it.`,
        'Add one concrete example of a successful flow and one failure/edge case.',
        'State which behaviour should be behind an interface or policy so alternatives can be introduced without modifying core entities.'
      ],
      criteria: results,
      tradeOffs: ['These checks are intentionally deterministic and shallow; they validate coverage signals, not whether the whole design is correct.'],
      evaluator: 'rules',
      disclaimer: 'Starter feedback only. A passing keyword check is not proof of a good design.'
    };
  }
}
